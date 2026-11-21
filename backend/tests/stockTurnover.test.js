const test = require('node:test');
const assert = require('node:assert/strict');
const StockTurnoverRatio = require('../utils/stockTurnoverRatio');

test('Stock Turnover Ratio Tests', async (t) => {
  await t.test('should calculate ITR and DSI accurately', () => {
    // COGS: $1,200,000, Avg Inv: $200,000 -> ITR = 6.0x -> DSI = 60.8 days
    const res = StockTurnoverRatio.calculateTurnover(1200000, 180000, 220000);
    assert.equal(res.inventoryTurnoverRatio, 6.0);
    assert.equal(res.daysSalesOfInventory, 60.8);
    assert.equal(res.rating, 'Healthy');
  });
});
