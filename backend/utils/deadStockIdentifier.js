/**
 * Dead Stock Identifier & Holding Cost Liability Analyzer
 */
class DeadStockIdentifier {
  static analyzeDeadStock(items, daysThreshold = 90, annualCarryingCostPercent = 20.0) {
    const deadItems = [];
    let totalDeadValue = 0;

    for (const item of items) {
      if (item.daysSinceLastSale >= daysThreshold && item.quantityOnHand > 0) {
        const itemVal = item.quantityOnHand * item.unitCost;
        const carryingCost = itemVal * (annualCarryingCostPercent / 100) * (item.daysSinceLastSale / 365);
        totalDeadValue += itemVal;

        deadItems.push({
          sku: item.sku,
          name: item.name,
          quantityOnHand: item.quantityOnHand,
          unitCost: item.unitCost,
          totalValue: Number(itemVal.toFixed(2)),
          daysDormant: item.daysSinceLastSale,
          estimatedHoldingCostAccrued: Number(carryingCost.toFixed(2))
        });
      }
    }

    return {
      totalDeadStockValue: Number(totalDeadValue.toFixed(2)),
      deadStockCount: deadItems.length,
      items: deadItems
    };
  }
}

module.exports = DeadStockIdentifier;
