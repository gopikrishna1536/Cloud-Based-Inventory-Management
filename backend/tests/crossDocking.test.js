const test = require('node:test');
const assert = require('node:assert/strict');
const CrossDockingRouter = require('../utils/crossDockingRouter');

test('Cross Docking Router Tests', async (t) => {
  await t.test('should match inbound shipment directly to pending backorder', () => {
    const inbound = [{ docId: 'IN-1', sku: 'SKU-X', quantity: 50, matched: false }];
    const outbound = [{ orderId: 'OUT-1', sku: 'SKU-X', quantity: 30, matched: false }];

    const matches = CrossDockingRouter.matchShipments(inbound, outbound);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].crossDockQuantity, 30);
    assert.equal(inbound[0].quantity, 20);
  });
});
