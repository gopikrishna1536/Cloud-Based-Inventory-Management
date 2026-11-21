/**
 * Return Merchandise Authorization (RMA) Disposition State Machine
 */
class RmaReturnProcessor {
  static DISPOSITIONS = ['RESTOCK_ACTIVE', 'REFURBISH_REPAIR', 'RETURN_TO_VENDOR', 'SCRAP_WRITE_OFF'];

  static evaluateDisposition(itemCondition, originalCost, repairCost) {
    if (itemCondition === 'SEALED_UNOPENED') {
      return { disposition: 'RESTOCK_ACTIVE', restockingFeePercent: 0 };
    }
    if (itemCondition === 'DAMAGED_MINOR' && repairCost < (originalCost * 0.3)) {
      return { disposition: 'REFURBISH_REPAIR', repairCost };
    }
    if (itemCondition === 'DEFECTIVE_VENDOR_WARRANTY') {
      return { disposition: 'RETURN_TO_VENDOR', creditExpected: originalCost };
    }
    return { disposition: 'SCRAP_WRITE_OFF', salvageValue: 0 };
  }
}

module.exports = RmaReturnProcessor;
