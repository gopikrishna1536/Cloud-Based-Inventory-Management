const test = require('node:test');
const assert = require('node:assert/strict');
const SupplierLeadTimeEstimator = require('../utils/supplierLeadTimeEstimator');

test('Supplier Lead Time Tests', async (t) => {
  await t.test('should smooth noisy supplier fulfillment history', () => {
    const leadTimes = [10, 12, 14, 11, 15];
    const smoothed = SupplierLeadTimeEstimator.computeRollingLeadTime(leadTimes, 0.3);
    assert.ok(smoothed >= 10 && smoothed <= 15);
  });
});
