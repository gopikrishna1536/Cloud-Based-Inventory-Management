const test = require('node:test');
const assert = require('node:assert/strict');
const LandedCostCalculator = require('../utils/landedCostCalculator');

test('Landed Cost Calculator Tests', async (t) => {
  await t.test('should apportion $1000 freight proportionally by item value', () => {
    const items = [
      { sku: 'A', quantity: 100, baseUnitPrice: 40 }, // $4000 (80%)
      { sku: 'B', quantity: 100, baseUnitPrice: 10 }  // $1000 (20%) -> Total $5000
    ];
    // Overhead $1000: Line A gets $800 ($8/unit -> $48 landed). Line B gets $200 ($2/unit -> $12 landed).
    const res = LandedCostCalculator.allocateLandedCosts(items, 1000);
    assert.equal(res[0].effectiveLandedCostPerUnit, 48.0);
    assert.equal(res[1].effectiveLandedCostPerUnit, 12.0);
  });
});
