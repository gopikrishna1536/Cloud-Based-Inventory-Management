const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { StockReconciliationEngine } = require('../utils/reconciliation');

describe('Physical Stock Reconciliation & Shrinkage Auditing Tests', () => {
  const auditData = [
    // Exact match
    { sku: 'ITEM-A', name: 'Standard Widget', systemQuantity: 100, physicalQuantity: 100, unitCost: 10.0 },
    // Minor shrinkage within tolerance
    { sku: 'ITEM-B', name: 'Plastic Screws', systemQuantity: 500, physicalQuantity: 495, unitCost: 0.10 }, // -5 units, -$0.50
    // Critical shrinkage (loss of high value asset)
    { sku: 'ITEM-C', name: 'Pro Camera Lens', systemQuantity: 10, physicalQuantity: 8, unitCost: 400.0 }, // -2 units, -$800
    // Overage
    { sku: 'ITEM-D', name: 'Packing Tape', systemQuantity: 40, physicalQuantity: 45, unitCost: 2.0 } // +5 units, +$10
  ];

  test('should compute total shrinkage, overage, and accuracy rate percentage', () => {
    const report = StockReconciliationEngine.reconcilePhysicalCount(auditData, {
      materialDollarThreshold: 500,
      tolerancePct: 0.05
    });

    assert.equal(report.totalAuditedSkus, 4);
    assert.equal(report.discrepancyCount, 3);
    assert.equal(report.accuracyRatePct, 25.0); // 1 out of 4 accurate

    // Total shrinkage: 0.50 + 800.00 = 800.50
    assert.equal(report.totalShrinkageLoss, 800.50);
    // Total overage: 10.00
    assert.equal(report.totalOverageGain, 10.00);
    // Net: 10.00 - 800.50 = -790.50
    assert.equal(report.netInventoryVariance, -790.50);

    const matchItem = report.adjustments.find(a => a.sku === 'ITEM-A');
    assert.equal(matchItem.status, 'ACCURATE_MATCH');
    assert.equal(matchItem.recommendedAction, 'NO_ACTION');

    const criticalItem = report.adjustments.find(a => a.sku === 'ITEM-C');
    assert.equal(criticalItem.status, 'CRITICAL_SHRINKAGE');
    assert.equal(criticalItem.recommendedAction, 'WRITE_DOWN_INVENTORY');

    const overageItem = report.adjustments.find(a => a.sku === 'ITEM-D');
    assert.equal(overageItem.status, 'INVENTORY_OVERAGE');
    assert.equal(overageItem.recommendedAction, 'WRITE_UP_INVENTORY');
  });

  test('should handle empty input array gracefully', () => {
    const empty = StockReconciliationEngine.reconcilePhysicalCount([]);
    assert.equal(empty.totalAuditedSkus, 0);
    assert.equal(empty.totalShrinkageLoss, 0);
  });
});
