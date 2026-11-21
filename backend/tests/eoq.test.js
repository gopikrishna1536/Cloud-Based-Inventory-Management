const test = require('node:test');
const assert = require('node:assert/strict');
const EconomicOrderQuantity = require('../utils/economicOrderQuantity');

test('Economic Order Quantity Tests', async (t) => {
  await t.test('should calculate optimal batch size for standard textbook demand', () => {
    // Demand: 10,000 units, Order cost: $50, Holding cost: $4/unit/yr -> EOQ = sqrt(1,000,000 / 4) = 500 units
    const res = EconomicOrderQuantity.calculateEOQ(10000, 50, 4);
    assert.equal(res.eoqUnits, 500);
    assert.equal(res.ordersPerYear, 20.0);
    assert.equal(res.totalAnnualInventoryCost, 2000.0);
  });
});
