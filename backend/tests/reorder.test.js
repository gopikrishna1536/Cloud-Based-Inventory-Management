const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { generateReorderOrders } = require('../utils/reorderGenerator');

describe('Purchase Order Generator & Reorder Logic Tests', () => {
  const sampleItems = [
    {
      id: 'item-1',
      sku: 'WIDGET-A',
      name: 'Steel Widget A',
      stockQuantity: 2,
      reorderPoint: 10,
      targetStockLevel: 50,
      minOrderQuantity: 10,
      costPrice: 5.0,
      supplierId: 'SUP-01',
      supplierName: 'Acme Steel Corp'
    },
    {
      id: 'item-2',
      sku: 'WIDGET-B',
      name: 'Steel Bolt B',
      stockQuantity: 0,
      reorderPoint: 20,
      targetStockLevel: 100,
      costPrice: 0.5,
      supplierId: 'SUP-01',
      supplierName: 'Acme Steel Corp'
    },
    {
      id: 'item-3',
      sku: 'PACK-BOX',
      name: 'Cardboard Box Large',
      stockQuantity: 150, // healthy stock, should NOT reorder
      reorderPoint: 20,
      targetStockLevel: 200,
      costPrice: 1.2,
      supplierId: 'SUP-02',
      supplierName: 'Box World Ltd'
    },
    {
      id: 'item-4',
      sku: 'TAPE-ROLL',
      name: 'Heavy Duty Packing Tape',
      stockQuantity: 5,
      reorderPoint: 15,
      targetStockLevel: 40,
      costPrice: 2.5,
      supplierId: 'SUP-02',
      supplierName: 'Box World Ltd'
    }
  ];

  test('should return empty array when no items are at or below reorder point', () => {
    const healthyItems = [
      { id: '1', stockQuantity: 50, reorderPoint: 10 },
      { id: '2', stockQuantity: 100, reorderPoint: 20 }
    ];
    const pos = generateReorderOrders(healthyItems);
    assert.equal(pos.length, 0);
  });

  test('should group reorder purchase orders by supplier', () => {
    const fixedDate = '2026-11-21T10:00:00.000Z';
    const pos = generateReorderOrders(sampleItems, { timestamp: fixedDate, taxRate: 0.1 });

    assert.equal(pos.length, 2); // SUP-01 and SUP-02
    assert.equal(pos[0].supplierId, 'SUP-01');
    assert.equal(pos[0].poNumber, 'PO-20261121-001');
    assert.equal(pos[0].items.length, 2); // item-1 and item-2

    assert.equal(pos[1].supplierId, 'SUP-02');
    assert.equal(pos[1].poNumber, 'PO-20261121-002');
    assert.equal(pos[1].items.length, 1); // item-4 only
  });

  test('should accurately calculate reorder deficits and mark critical stockouts', () => {
    const pos = generateReorderOrders(sampleItems);
    const acmePO = pos.find(p => p.supplierId === 'SUP-01');

    assert.equal(acmePO.priority, 'HIGH'); // contains item with 0 stock

    const widgetA = acmePO.items.find(i => i.sku === 'WIDGET-A');
    assert.equal(widgetA.currentStock, 2);
    assert.equal(widgetA.recommendedOrderQty, 48); // 50 - 2
    assert.equal(widgetA.estimatedLineCost, 240); // 48 * $5.00
    assert.equal(widgetA.urgency, 'LOW_STOCK');

    const boltB = acmePO.items.find(i => i.sku === 'WIDGET-B');
    assert.equal(boltB.currentStock, 0);
    assert.equal(boltB.recommendedOrderQty, 100); // 100 - 0
    assert.equal(boltB.estimatedLineCost, 50); // 100 * $0.50
    assert.equal(boltB.urgency, 'CRITICAL_STOCKOUT');
  });

  test('should calculate subtotal, taxes, and total procurement cost', () => {
    const pos = generateReorderOrders(sampleItems, { taxRate: 0.05 });
    const acmePO = pos.find(p => p.supplierId === 'SUP-01');

    // Subtotal: 240 + 50 = 290
    // Tax: 290 * 0.05 = 14.5
    // Total: 304.5
    assert.equal(acmePO.subtotal, 290);
    assert.equal(acmePO.taxRate, 0.05);
    assert.equal(acmePO.taxAmount, 14.5);
    assert.equal(acmePO.totalAmount, 304.5);
  });
});
