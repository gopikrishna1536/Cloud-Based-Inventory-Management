/**
 * Wilson Economic Order Quantity (EOQ) & Total Cost Optimizer
 * EOQ = sqrt((2 * Demand * OrderCost) / HoldingCostPerUnit)
 */
class EconomicOrderQuantity {
  static calculateEOQ(annualDemandUnits, costPerOrder, holdingCostPerUnitPerYear) {
    if (annualDemandUnits <= 0 || costPerOrder <= 0 || holdingCostPerUnitPerYear <= 0) {
      throw new Error('Demand, order cost, and holding cost must be strictly positive');
    }

    const eoqUnits = Math.round(
      Math.sqrt((2 * annualDemandUnits * costPerOrder) / holdingCostPerUnitPerYear)
    );

    const ordersPerYear = Number((annualDemandUnits / eoqUnits).toFixed(1));
    const annualOrderingCost = ordersPerYear * costPerOrder;
    const annualHoldingCost = (eoqUnits / 2) * holdingCostPerUnitPerYear;
    const totalAnnualInventoryCost = Number((annualOrderingCost + annualHoldingCost).toFixed(2));

    return {
      annualDemandUnits,
      costPerOrder,
      holdingCostPerUnitPerYear,
      eoqUnits,
      ordersPerYear,
      totalAnnualInventoryCost
    };
  }
}

module.exports = EconomicOrderQuantity;
