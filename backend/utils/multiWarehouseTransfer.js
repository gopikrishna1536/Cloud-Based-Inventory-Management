/**
 * Inter-Warehouse Stock Transfer Generator
 */
class MultiWarehouseTransfer {
  static createTransferOrder(sourceWarehouseId, destWarehouseId, sku, quantity, availableStock) {
    if (quantity <= 0) throw new Error('Transfer quantity must be positive');
    if (quantity > availableStock) {
      return {
        success: false,
        message: `Insufficient inventory at source warehouse (requested: ${quantity}, available: ${availableStock})`
      };
    }

    return {
      success: true,
      transferId: `TRF-${Date.now()}`,
      sourceWarehouseId,
      destWarehouseId,
      sku,
      quantity,
      status: 'IN_TRANSIT_PENDING_RECEIPT'
    };
  }
}

module.exports = MultiWarehouseTransfer;
