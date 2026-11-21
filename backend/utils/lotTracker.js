/**
 * Batch & Lot Number Expiration Tracking Engine.
 * Implements FEFO (First-Expired, First-Out) allocation and automated obsolescence alerting.
 */

class LotTrackerEngine {
  /**
   * Evaluates lot expiration status and generates FEFO picking order.
   * @param {Array<Object>} lots - [{ lotNumber, sku, quantity, expirationDate, receivedDate }]
   * @param {Object} options - { warningThresholdDays: 30, asOfDate: Date }
   * @returns {Object} Evaluation summary and prioritized FEFO picking list
   */
  static evaluateLots(lots = [], options = {}) {
    const { warningThresholdDays = 30, asOfDate = new Date() } = options;
    const now = new Date(asOfDate);

    if (!Array.isArray(lots) || lots.length === 0) {
      return {
        totalLots: 0,
        expiredCount: 0,
        expiringSoonCount: 0,
        healthyCount: 0,
        fefoPickingQueue: []
      };
    }

    let expiredCount = 0;
    let expiringSoonCount = 0;
    let healthyCount = 0;

    const evaluated = lots.map(lot => {
      const expDate = new Date(lot.expirationDate);
      const diffMs = expDate.getTime() - now.getTime();
      const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let status = 'HEALTHY_STOCK';
      let priority = 'NORMAL';

      if (daysUntilExpiry <= 0) {
        status = 'EXPIRED';
        priority = 'BLOCKED_DO_NOT_DISPATCH';
        expiredCount++;
      } else if (daysUntilExpiry <= warningThresholdDays) {
        status = 'EXPIRING_SOON';
        priority = 'EXPEDITE_PICKING_FEFO';
        expiringSoonCount++;
      } else {
        healthyCount++;
      }

      return {
        lotNumber: lot.lotNumber,
        sku: lot.sku,
        quantity: Number(lot.quantity) || 0,
        expirationDate: expDate.toISOString().split('T')[0],
        daysUntilExpiry,
        status,
        priority
      };
    });

    // FEFO Queue: Sort eligible non-expired inventory by expiration date ascending
    const fefoPickingQueue = evaluated
      .filter(l => l.status !== 'EXPIRED')
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    return {
      totalLots: lots.length,
      expiredCount,
      expiringSoonCount,
      healthyCount,
      fefoPickingQueue,
      allLots: evaluated
    };
  }
}

module.exports = { LotTrackerEngine };
