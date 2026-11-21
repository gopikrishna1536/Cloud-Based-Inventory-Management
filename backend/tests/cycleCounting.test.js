const test = require('node:test');
const assert = require('node:assert/strict');
const CycleCountingPlanner = require('../utils/cycleCountingPlanner');

test('Cycle Counting Planner Tests', async (t) => {
  await t.test('should calculate daily count frequency', () => {
    const catalog = [
      { sku: 'A1', abcClass: 'A' }, // 12
      { sku: 'B1', abcClass: 'B' }, // 4
      { sku: 'C1', abcClass: 'C' }  // 1 -> Total 17 counts / 250 days = 1/day
    ];
    const res = CycleCountingPlanner.planSchedule(catalog, 250);
    assert.equal(res.annualCountsRequired, 17);
    assert.equal(res.recommendedDailyCountItems, 1);
  });
});
