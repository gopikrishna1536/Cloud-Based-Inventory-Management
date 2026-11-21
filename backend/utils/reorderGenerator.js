/**
 * Automated Reorder & Purchase Order Draft Generator
 * Identifies low-stock items across warehouses and groups procurement drafts by supplier.
 */

/**
 * Evaluates stock levels and generates recommended purchase orders grouped by supplier.
 * @param {Array<Object>} inventoryItems
 * @param {Object} options
 * @returns {Array<Object>} purchaseOrders
 */
function generateReorderOrders(inventoryItems, options = {}) {
  const taxRate = options.taxRate ?? 0.05; // 5% default procurement tax
  const now = options.timestamp ? new Date(options.timestamp) : new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

  const lowStockItems = (inventoryItems || []).filter(item => {
    const stock = Number(item.stockQuantity || item.quantity || 0);
    const threshold = Number(item.reorderPoint || item.lowStockThreshold || 10);
    return stock <= threshold;
  });

  if (lowStockItems.length === 0) {
    return [];
  }

  // Group by supplier
  const supplierGroups = new Map();

  lowStockItems.forEach(item => {
    const supplierId = item.supplierId || item.supplier || 'SUP-DEFAULT';
    const supplierName = item.supplierName || 'Default Supplier';

    if (!supplierGroups.has(supplierId)) {
      supplierGroups.set(supplierId, {
        supplierId,
        supplierName,
        items: []
      });
    }

    const currentStock = Number(item.stockQuantity || item.quantity || 0);
    const targetStock = Number(item.targetStockLevel || (item.reorderPoint ? item.reorderPoint * 3 : 50));
    const minOrderQty = Number(item.minOrderQuantity || 1);
    const unitCost = Number(item.costPrice || item.price || 0);

    const neededQty = Math.max(targetStock - currentStock, minOrderQty);
    const urgency = currentStock === 0 ? 'CRITICAL_STOCKOUT' : 'LOW_STOCK';

    supplierGroups.get(supplierId).items.push({
      itemId: item.id || item._id,
      sku: item.sku || 'SKU-UNKNOWN',
      name: item.name,
      currentStock,
      targetStock,
      recommendedOrderQty: neededQty,
      unitCost,
      estimatedLineCost: Math.round(neededQty * unitCost * 100) / 100,
      urgency
    });
  });

  // Generate structured Purchase Order drafts
  let poSequence = 1;
  const purchaseOrders = [];

  for (const group of supplierGroups.values()) {
    const poNumber = `PO-${dateStr}-${String(poSequence).padStart(3, '0')}`;
    poSequence++;

    const subtotal = group.items.reduce((sum, line) => sum + line.estimatedLineCost, 0);
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;
    const hasCritical = group.items.some(i => i.urgency === 'CRITICAL_STOCKOUT');

    purchaseOrders.push({
      poNumber,
      supplierId: group.supplierId,
      supplierName: group.supplierName,
      status: 'DRAFT',
      priority: hasCritical ? 'HIGH' : 'NORMAL',
      lineItemsCount: group.items.length,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      items: group.items,
      createdAt: now.toISOString()
    });
  }

  return purchaseOrders;
}

module.exports = { generateReorderOrders };
