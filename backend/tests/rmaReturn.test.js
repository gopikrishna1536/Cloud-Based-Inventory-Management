const test = require('node:test');
const assert = require('node:assert/strict');
const RmaReturnProcessor = require('../utils/rmaReturnProcessor');

test('RMA Return Processor Tests', async (t) => {
  await t.test('should restock sealed unopened returns immediately', () => {
    const res = RmaReturnProcessor.evaluateDisposition('SEALED_UNOPENED', 100, 0);
    assert.equal(res.disposition, 'RESTOCK_ACTIVE');
  });

  await t.test('should write off severely damaged unsalvageable merchandise', () => {
    const res = RmaReturnProcessor.evaluateDisposition('SHREDDED', 100, 80);
    assert.equal(res.disposition, 'SCRAP_WRITE_OFF');
  });
});
