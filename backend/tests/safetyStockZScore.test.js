const test = require('node:test');
const assert = require('node:assert/strict');
const SafetyStockZScore = require('../utils/safetyStockZScore');

test('Safety Stock Z-Score Tests', async (t) => {
  await t.test('should compute safety stock and reorder point', () => {
    // 50 daily, stddev 10, 9 days lead time, 95% (z=1.65) -> ss = ceil(1.65 * 10 * 3) = 50 units
    const res = SafetyStockZScore.computeBuffer(50, 10, 9, 95);
    assert.equal(res.safetyStockUnits, 50);
    assert.equal(res.reorderPointUnits, 500);
  });
});
