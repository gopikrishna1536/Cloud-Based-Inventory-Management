/**
 * Warehouse Physical Stock Reconciliation & Shrinkage Auditing Engine.
 * Compares physical counted stock against system ledgers and flags financial shrinkage.
 */

class StockReconciliationEngine {
  /**
   * Reconciles physical counts against system on-hand inventory.
   * @param {Array<Object>} countEntries - [{ sku, name, systemQuantity, physicalQuantity, unitCost }]
   * @param {Object} options - { tolerancePct: 0.02, materialDollarThreshold: 500 }
   * @returns {Object} Reconciliation summary and inventory adjustment journal
   */
  static reconcilePhysicalCount(countEntries = [], options = {}) {
    const { tolerancePct = 0.02, materialDollarThreshold = 500 } = options;

    if (!Array.isArray(countEntries) || countEntries.length === 0) {
      return {
        totalAuditedSkus: 0,
        totalShrinkageLoss: 0,
        discrepancyCount: 0,
        adjustments: []
      };
    }

    let totalShrinkageLoss = 0;
    let totalOverageGain = 0;
    let discrepancyCount = 0;

    const adjustments = countEntries.map(entry => {
      const systemQty = Number(entry.systemQuantity || 0);
      const physicalQty = Number(entry.physicalQuantity || 0);
      const unitCost = Number(entry.unitCost || entry.costPrice || 0);

      const varianceQty = physicalQty - systemQty;
      const varianceValue = Math.round(varianceQty * unitCost * 100) / 100;
      const variancePct = systemQty > 0 ? Math.abs(varianceQty / systemQty) : (physicalQty > 0 ? 1.0 : 0);

      let status = 'ACCURATE_MATCH';
      let action = 'NO_ACTION';

      if (varianceQty !== 0) {
        discrepancyCount++;
        if (varianceQty < 0) {
          totalShrinkageLoss += Math.abs(varianceValue);
          status = Math.abs(varianceValue) >= materialDollarThreshold || variancePct > tolerancePct
            ? 'CRITICAL_SHRINKAGE'
            : 'NORMAL_SHRINKAGE_TOLERANCE';
          action = 'WRITE_DOWN_INVENTORY';
        } else {
          totalOverageGain += varianceValue;
          status = 'INVENTORY_OVERAGE';
          action = 'WRITE_UP_INVENTORY';
        }
      }

      return {
        sku: entry.sku,
        name: entry.name,
        systemQuantity: systemQty,
        physicalQuantity: physicalQty,
        varianceQuantity: varianceQty,
        varianceValue,
        variancePercentage: Math.round(variancePct * 1000) / 10,
        status,
        recommendedAction: action
      };
    });

    return {
      totalAuditedSkus: countEntries.length,
      discrepancyCount,
      accuracyRatePct: Math.round(((countEntries.length - discrepancyCount) / countEntries.length) * 1000) / 10,
      totalShrinkageLoss: Math.round(totalShrinkageLoss * 100) / 100,
      totalOverageGain: Math.round(totalOverageGain * 100) / 100,
      netInventoryVariance: Math.round((totalOverageGain - totalShrinkageLoss) * 100) / 100,
      adjustments
    };
  }
}

module.exports = { StockReconciliationEngine };
