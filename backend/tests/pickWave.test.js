const test = require('node:test');
const assert = require('node:assert/strict');
const PickWaveOptimizer = require('../utils/pickWaveOptimizer');

test('Pick Wave Optimizer Tests', async (t) => {
  await t.test('should partition orders into batches respecting maximum picking capacity', () => {
    const orders = [
      { orderId: 'O1', quantity: 10 },
      { orderId: 'O2', quantity: 8 },
      { orderId: 'O3', quantity: 15 }
    ];
    // Cap 20: Wave 1 = O1 (10) + O2 (8) = 18. Wave 2 = O3 (15).
    const waves = PickWaveOptimizer.createPickWaves(orders, 20);
    assert.equal(waves.length, 2);
    assert.equal(waves[0].totalQuantity, 18);
    assert.equal(waves[1].totalQuantity, 15);
  });
});
