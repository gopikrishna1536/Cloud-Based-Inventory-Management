const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { performAbcAnalysis } = require('../utils/abcAnalysis');

describe('ABC Inventory Stratification & Cycle Counting Tests', () => {
  const inventoryCatalog = [
    { sku: 'LAPTOP-PRO', name: 'High-End Laptop', annualSalesUnits: 100, unitCost: 1500 }, // $150,000 (Top value)
    { sku: 'MONITOR-4K', name: 'Ultra HD Monitor', annualSalesUnits: 120, unitCost: 400 },   // $48,000
    { sku: 'KEYBOARD-MECH', name: 'Mechanical Keyboard', annualSalesUnits: 300, unitCost: 80 }, // $24,000
    { sku: 'MOUSE-PAD', name: 'Ergonomic Mouse Pad', annualSalesUnits: 500, unitCost: 10 },    // $5,000
    { sku: 'CABLE-USB', name: 'USB-C Cable', annualSalesUnits: 1000, unitCost: 3 }          // $3,000
  ];
  // Total value: 150k + 48k + 24k + 5k + 3k = $230,000
  // LAPTOP-PRO: 150k / 230k = 65.2% -> Class A
  // MONITOR-4K: (150+48)k / 230k = 198k / 230k = 86.1% -> Class B
  // KEYBOARD-MECH: (198+24)k / 230k = 222k / 230k = 96.5% -> Class C

  test('should stratify items into Class A, B, and C tiers based on Pareto 80/20 value', () => {
    const analysis = performAbcAnalysis(inventoryCatalog);

    assert.equal(analysis.totalItems, 5);
    assert.equal(analysis.totalInventoryValue, 230000);
    assert.equal(analysis.summary.classACount, 1);
    assert.equal(analysis.summary.classBCount, 1);
    assert.equal(analysis.summary.classCCount, 3);

    const topItem = analysis.items[0];
    assert.equal(topItem.sku, 'LAPTOP-PRO');
    assert.equal(topItem.classification, 'A');
    assert.equal(topItem.cycleCountFrequencyDays, 30); // Monthly check for high-value item

    const bottomItem = analysis.items[4];
    assert.equal(bottomItem.sku, 'CABLE-USB');
    assert.equal(bottomItem.classification, 'C');
    assert.equal(bottomItem.cycleCountFrequencyDays, 365);
  });

  test('should handle empty catalog gracefully', () => {
    const empty = performAbcAnalysis([]);
    assert.equal(empty.totalItems, 0);
    assert.equal(empty.totalInventoryValue, 0);
  });
});
