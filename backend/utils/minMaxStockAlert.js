/**
 * Min-Max Inventory Threshold Alert & Replenishment Monitor
 */
class MinMaxStockAlert {
  static evaluateStockLevel(currentStock, minThreshold, maxThreshold) {
    if (currentStock <= 0) {
      return { status: 'OUT_OF_STOCK', severity: 'CRITICAL', orderRequired: true, replenishToMaxUnits: maxThreshold };
    }
    if (currentStock < minThreshold) {
      return { status: 'BELOW_MINIMUM', severity: 'HIGH', orderRequired: true, replenishToMaxUnits: maxThreshold - currentStock };
    }
    if (currentStock > maxThreshold) {
      return { status: 'OVERSTOCKED', severity: 'WARNING', orderRequired: false, surplusUnits: currentStock - maxThreshold };
    }
    return { status: 'OPTIMAL', severity: 'NORMAL', orderRequired: false };
  }
}

module.exports = MinMaxStockAlert;
