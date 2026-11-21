/**
 * ABC Inventory Analysis & Warehouse Cycle Counting Scheduler.
 * Implements Pareto 80/20 inventory stratification for optimal inventory control.
 */

/**
 * Classifies inventory items into Class A, B, and C tiers based on Annual Usage Value (AUV).
 * @param {Array<Object>} items - Array of inventory items { id, sku, name, annualSalesUnits, unitCost }
 * @returns {Object} Stratification summary and classified items
 */
function performAbcAnalysis(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      totalItems: 0,
      totalInventoryValue: 0,
      summary: { A: 0, B: 0, C: 0 },
      items: []
    };
  }

  // Calculate annual consumption value for each item
  const valuedItems = items.map(item => {
    const units = Math.max(0, Number(item.annualSalesUnits || item.salesVolume || item.quantity || 0));
    const cost = Math.max(0, Number(item.unitCost || item.costPrice || item.price || 0));
    const annualValue = Math.round(units * cost * 100) / 100;

    return {
      id: item.id || item._id,
      sku: item.sku || 'N/A',
      name: item.name || 'Unnamed',
      annualSalesUnits: units,
      unitCost: cost,
      annualUsageValue: annualValue
    };
  });

  // Sort descending by Annual Usage Value
  valuedItems.sort((a, b) => b.annualUsageValue - a.annualUsageValue);

  const totalValue = valuedItems.reduce((sum, item) => sum + item.annualUsageValue, 0);

  let cumulativeValue = 0;
  const counts = { A: 0, B: 0, C: 0 };

  const classifiedItems = valuedItems.map(item => {
    cumulativeValue += item.annualUsageValue;
    const cumulativePct = totalValue > 0 ? (cumulativeValue / totalValue) * 100 : 100;

    let classification = 'C';
    let cycleCountFrequencyDays = 365; // Class C: Annual audit

    if (cumulativePct <= 80.0) {
      classification = 'A';
      cycleCountFrequencyDays = 30; // Class A: Monthly audit
    } else if (cumulativePct <= 95.0) {
      classification = 'B';
      cycleCountFrequencyDays = 90; // Class B: Quarterly audit
    }

    counts[classification]++;

    return {
      ...item,
      cumulativeValue: Math.round(cumulativeValue * 100) / 100,
      cumulativePercentage: Math.round(cumulativePct * 10) / 10,
      classification,
      cycleCountFrequencyDays
    };
  });

  return {
    totalItems: items.length,
    totalInventoryValue: Math.round(totalValue * 100) / 100,
    summary: {
      classACount: counts.A,
      classBCount: counts.B,
      classCCount: counts.C
    },
    items: classifiedItems
  };
}

module.exports = { performAbcAnalysis };
