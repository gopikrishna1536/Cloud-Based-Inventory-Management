const test = require('node:test');
const assert = require('node:assert/strict');
const ScrapDisposalRecord = require('../utils/scrapDisposalRecord');

test('Scrap Disposal Record Tests', async (t) => {
  await t.test('should require manager approval for write-off', () => {
    const unauth = ScrapDisposalRecord.authorizeScrap('SKU-1', 10, 50, 'Water Damage', null);
    assert.equal(unauth.authorized, false);

    const auth = ScrapDisposalRecord.authorizeScrap('SKU-1', 10, 50, 'Water Damage', 'John Doe');
    assert.equal(auth.authorized, true);
    assert.equal(auth.totalWriteOffAmount, 500.0);
  });
});
