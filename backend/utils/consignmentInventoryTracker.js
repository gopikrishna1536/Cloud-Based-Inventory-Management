/**
 * Vendor-Managed Consignment Inventory Consumption Logger
 */
class ConsignmentInventoryTracker {
  static recordConsumption(vendorId, sku, consumedQty, negotiatedUnitCost) {
    if (consumedQty <= 0 || negotiatedUnitCost <= 0) {
      throw new Error('Quantity and unit cost must be positive');
    }

    const payableAmount = Number((consumedQty * negotiatedUnitCost).toFixed(2));
    return {
      vendorId,
      sku,
      consumedQuantity: consumedQty,
      negotiatedUnitCost,
      payableAmount,
      invoiceTriggered: true,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ConsignmentInventoryTracker;
