const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { LotTrackerEngine } = require('../utils/lotTracker');

describe('Batch & Lot Expiration Tracking (FEFO) Tests', () => {
  const sampleLots = [
    { lotNumber: 'LOT-EXP-01', sku: 'VACCINE-A', quantity: 50, expirationDate: '2026-01-01' }, // Expired
    { lotNumber: 'LOT-SOON-02', sku: 'VACCINE-A', quantity: 100, expirationDate: '2026-06-15' }, // Expiring soon (~15 days)
    { lotNumber: 'LOT-FRESH-03', sku: 'VACCINE-A', quantity: 300, expirationDate: '2026-12-31' }, // Fresh
    { lotNumber: 'LOT-SOON-04', sku: 'ANTIBIOTIC-B', quantity: 40, expirationDate: '2026-06-10' } // Expiring soon (~10 days)
  ];
  const asOfDate = '2026-06-01T00:00:00.000Z';

  test('should classify lots into EXPIRED, EXPIRING_SOON, and HEALTHY_STOCK tiers', () => {
    const report = LotTrackerEngine.evaluateLots(sampleLots, { asOfDate, warningThresholdDays: 30 });

    assert.equal(report.totalLots, 4);
    assert.equal(report.expiredCount, 1);
    assert.equal(report.expiringSoonCount, 2);
    assert.equal(report.healthyCount, 1);

    const expired = report.allLots.find(l => l.lotNumber === 'LOT-EXP-01');
    assert.equal(expired.status, 'EXPIRED');
    assert.equal(expired.priority, 'BLOCKED_DO_NOT_DISPATCH');
  });

  test('should order FEFO queue by earliest expiring batch first and exclude expired stock', () => {
    const report = LotTrackerEngine.evaluateLots(sampleLots, { asOfDate });
    const queue = report.fefoPickingQueue;

    assert.equal(queue.length, 3); // 3 non-expired lots
    // Earliest expiring is LOT-SOON-04 (June 10)
    assert.equal(queue[0].lotNumber, 'LOT-SOON-04');
    // Next earliest is LOT-SOON-02 (June 15)
    assert.equal(queue[1].lotNumber, 'LOT-SOON-02');
    // Latest is LOT-FRESH-03 (Dec 31)
    assert.equal(queue[2].lotNumber, 'LOT-FRESH-03');
  });

  test('should handle empty lots array without error', () => {
    const empty = LotTrackerEngine.evaluateLots([]);
    assert.equal(empty.totalLots, 0);
    assert.equal(empty.fefoPickingQueue.length, 0);
  });
});
