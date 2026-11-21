const test = require('node:test');
const assert = require('node:assert/strict');
const MultiWarehouseTransfer = require('../utils/multiWarehouseTransfer');

test('Multi-Warehouse Transfer Tests', async (t) => {
  await t.test('should create valid transfer when stock is available', () => {
    const res = MultiWarehouseTransfer.createTransferOrder('WH-EAST', 'WH-WEST', 'SKU-100', 50, 200);
    assert.equal(res.success, true);
    assert.equal(res.status, 'IN_TRANSIT_PENDING_RECEIPT');
  });

  await t.test('should reject transfer when requested quantity exceeds available stock', () => {
    const res = MultiWarehouseTransfer.createTransferOrder('WH-EAST', 'WH-WEST', 'SKU-100', 500, 200);
    assert.equal(res.success, false);
  });
});
