const test = require('node:test');
const assert = require('node:assert/strict');
const MinMaxStockAlert = require('../utils/minMaxStockAlert');

test('Min Max Stock Alert Tests', async (t) => {
  await t.test('should flag stock below min threshold and calculate replenishment delta', () => {
    const res = MinMaxStockAlert.evaluateStockLevel(15, 30, 100);
    assert.equal(res.status, 'BELOW_MINIMUM');
    assert.equal(res.orderRequired, true);
    assert.equal(res.replenishToMaxUnits, 85);
  });
});
