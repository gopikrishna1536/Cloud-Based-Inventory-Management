const test = require('node:test');
const assert = require('node:assert/strict');
const DeadStockIdentifier = require('../utils/deadStockIdentifier');

test('Dead Stock Identifier Tests', async (t) => {
  await t.test('should flag items dormant past 90 days', () => {
    const items = [
      { sku: 'SKU-1', name: 'Fresh Apples', quantityOnHand: 50, unitCost: 2, daysSinceLastSale: 5 },
      { sku: 'SKU-2', name: 'Legacy Toner', quantityOnHand: 20, unitCost: 100, daysSinceLastSale: 120 }
    ];
    const res = DeadStockIdentifier.analyzeDeadStock(items, 90);
    assert.equal(res.deadStockCount, 1);
    assert.equal(res.items[0].sku, 'SKU-2');
    assert.equal(res.totalDeadStockValue, 2000);
  });
});
