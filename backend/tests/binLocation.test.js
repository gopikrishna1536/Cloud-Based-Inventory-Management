const test = require('node:test');
const assert = require('node:assert/strict');
const BinLocationLocator = require('../utils/binLocationLocator');

test('Bin Location Locator Tests', async (t) => {
  await t.test('should parse and format storage coordinates', () => {
    const formatted = BinLocationLocator.formatLocation('A', 4, 2, 3, 1);
    assert.equal(formatted, 'A-04-R02-S03-B01');

    const parsed = BinLocationLocator.parseLocation(formatted);
    assert.equal(parsed.zone, 'A');
    assert.equal(parsed.aisle, 4);
    assert.equal(parsed.shelf, 3);
  });
});
