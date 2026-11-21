const test = require('node:test');
const assert = require('node:assert/strict');
const PalletSpaceOptimizer = require('../utils/palletSpaceOptimizer');

test('Pallet Space Optimizer Tests', async (t) => {
  await t.test('should fit 40x20x30cm cartons onto standard pallet', () => {
    // 40x20 on 120x80: 120/40=3, 80/20=4 -> 12 per tier. Height: 150/30 = 5 tiers -> 60 cartons
    const res = PalletSpaceOptimizer.calculatePalletFit(40, 20, 30, 150);
    assert.equal(res.cartonsPerTier, 12);
    assert.equal(res.tiers, 5);
    assert.equal(res.totalCartonsPerPallet, 60);
  });
});
