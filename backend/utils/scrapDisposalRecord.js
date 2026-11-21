/**
 * Damaged Goods Scrap Disposal & Write-Off Authorization Logger
 */
class ScrapDisposalRecord {
  static authorizeScrap(sku, quantity, unitCost, reason, approvedByManager) {
    if (!approvedByManager) {
      return { authorized: false, message: 'Managerial sign-off required for inventory write-off' };
    }

    const totalWriteOff = Number((quantity * unitCost).toFixed(2));
    return {
      authorized: true,
      scrapRecordId: `SCRAP-${Date.now()}`,
      sku,
      quantity,
      unitCost,
      totalWriteOffAmount: totalWriteOff,
      reason,
      approver: approvedByManager
    };
  }
}

module.exports = ScrapDisposalRecord;
