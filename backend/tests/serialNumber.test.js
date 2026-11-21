const test = require('node:test');
const assert = require('node:assert/strict');
const SerialNumberTracker = require('../utils/serialNumberTracker');

test('Serial Number Warranty Tests', async (t) => {
  await t.test('should determine warranty status accurately', () => {
    const res = SerialNumberTracker.validateWarranty('2026-01-01', 12, '2026-06-01');
    assert.equal(res.isUnderWarranty, true);
    assert.ok(res.daysRemaining > 150);
  });
});
