const { test, describe } = require('node:test');
const assert = require('node:assert');

// Core inventory and multi-tenancy business rules
function calculateStockAfterTransaction(currentStock, transactionType, quantity) {
  if (quantity <= 0) {
    throw new Error('Transaction quantity must be strictly positive.');
  }

  switch (transactionType.toUpperCase()) {
    case 'PURCHASE_INBOUND':
    case 'RETURN_INBOUND':
    case 'ADJUSTMENT_ADD':
      return currentStock + quantity;
    case 'SALE_OUTBOUND':
    case 'DAMAGE_OUTBOUND':
    case 'ADJUSTMENT_SUB':
      if (currentStock < quantity) {
        throw new Error(`Insufficient stock. Current: ${currentStock}, Requested: ${quantity}`);
      }
      return currentStock - quantity;
    default:
      throw new Error(`Unknown transaction type: ${transactionType}`);
  }
}

function checkLowStockAlert(stockLevel, reorderPoint) {
  return stockLevel <= reorderPoint;
}

function validateTenantAccess(userOrganizationId, recordOrganizationId) {
  return Boolean(userOrganizationId && recordOrganizationId && userOrganizationId === recordOrganizationId);
}

describe('StockCloud Multi-Tenant Inventory Business Logic', () => {
  test('should increase stock on inbound purchase', () => {
    const updated = calculateStockAfterTransaction(50, 'PURCHASE_INBOUND', 25);
    assert.strictEqual(updated, 75);
  });

  test('should decrease stock on outbound sale', () => {
    const updated = calculateStockAfterTransaction(50, 'SALE_OUTBOUND', 20);
    assert.strictEqual(updated, 30);
  });

  test('should throw error when outbound sale exceeds available stock', () => {
    assert.throws(
      () => calculateStockAfterTransaction(10, 'SALE_OUTBOUND', 15),
      /Insufficient stock/
    );
  });

  test('should throw error on non-positive quantities', () => {
    assert.throws(
      () => calculateStockAfterTransaction(50, 'PURCHASE_INBOUND', 0),
      /Transaction quantity must be strictly positive/
    );
    assert.throws(
      () => calculateStockAfterTransaction(50, 'PURCHASE_INBOUND', -5),
      /Transaction quantity must be strictly positive/
    );
  });

  test('should trigger low stock alert when stock is at or below reorder threshold', () => {
    assert.strictEqual(checkLowStockAlert(5, 10), true);
    assert.strictEqual(checkLowStockAlert(10, 10), true);
    assert.strictEqual(checkLowStockAlert(11, 10), false);
  });

  test('should enforce strict tenant isolation across organizations', () => {
    const orgAlpha = 'tenant_org_alpha_123';
    const orgBeta = 'tenant_org_beta_456';

    assert.strictEqual(validateTenantAccess(orgAlpha, orgAlpha), true);
    assert.strictEqual(validateTenantAccess(orgAlpha, orgBeta), false);
    assert.strictEqual(validateTenantAccess(null, orgAlpha), false);
  });
});
