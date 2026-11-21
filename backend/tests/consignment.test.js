const test = require('node:test');
const assert = require('node:assert/strict');
const ConsignmentInventoryTracker = require('../utils/consignmentInventoryTracker');

test('Consignment Inventory Tests', async (t) => {
  await t.test('should log consumption and trigger vendor payable', () => {
    const res = ConsignmentInventoryTracker.recordConsumption('V-99', 'SKU-C1', 40, 25.0);
    assert.equal(res.payableAmount, 1000.0);
    assert.equal(res.invoiceTriggered, true);
  });
});
