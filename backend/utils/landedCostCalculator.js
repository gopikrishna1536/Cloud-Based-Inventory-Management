/**
 * Inbound Landed Cost Allocator
 * Allocates freight, insurance, customs tariff, and drayage fees across receipt lines.
 */
class LandedCostCalculator {
  static allocateLandedCosts(items, totalFreightAndTariffs) {
    if (totalFreightAndTariffs < 0) throw new Error('Costs cannot be negative');

    const totalInvoiceValue = items.reduce((acc, i) => acc + (i.quantity * i.baseUnitPrice), 0);
    if (totalInvoiceValue <= 0) throw new Error('Total invoice value must be positive');

    return items.map(item => {
      const lineValue = item.quantity * item.baseUnitPrice;
      const shareOfOverhead = (lineValue / totalInvoiceValue) * totalFreightAndTariffs;
      const landedCostPerUnit = Number((item.baseUnitPrice + (shareOfOverhead / item.quantity)).toFixed(2));

      return {
        sku: item.sku,
        quantity: item.quantity,
        baseUnitPrice: item.baseUnitPrice,
        allocatedOverhead: Number(shareOfOverhead.toFixed(2)),
        effectiveLandedCostPerUnit: landedCostPerUnit
      };
    });
  }
}

module.exports = LandedCostCalculator;
