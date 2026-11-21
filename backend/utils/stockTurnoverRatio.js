/**
 * Inventory Turnover Ratio (ITR) & Days Sales of Inventory (DSI)
 * ITR = Annual COGS / Average Inventory Value
 * DSI = 365 / ITR
 */
class StockTurnoverRatio {
  static calculateTurnover(annualCOGS, beginningInventoryVal, endingInventoryVal) {
    const avgInventory = (beginningInventoryVal + endingInventoryVal) / 2.0;
    if (avgInventory <= 0) throw new Error('Average inventory must be positive');

    const itr = Number((annualCOGS / avgInventory).toFixed(2));
    const dsi = itr > 0 ? Number((365 / itr).toFixed(1)) : 999.0;

    let rating = 'Healthy';
    if (itr < 4.0) rating = 'Slow-Moving / Overstocked';
    else if (itr > 12.0) rating = 'High Velocity / Stockout Risk';

    return {
      annualCOGS,
      averageInventoryValue: avgInventory,
      inventoryTurnoverRatio: itr,
      daysSalesOfInventory: dsi,
      rating
    };
  }
}

module.exports = StockTurnoverRatio;
