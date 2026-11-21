const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateEan13Checksum,
  generateBarcode,
  validateEan13,
  formatBarcodeLabel
} = require('../utils/barcodeUtils');

describe('Barcode Validation & Label Generation Tests', () => {
  test('should accurately calculate standard EAN-13 checksum digits', () => {
    // 400638133393 -> checksum is 1 (Stabilo Boss highlighter)
    assert.equal(calculateEan13Checksum('400638133393'), 1);

    // 735135370425 -> sum = 95 -> checksum is 5
    assert.equal(calculateEan13Checksum('735135370425'), 5);
  });

  test('should reject non-12-digit input in calculateEan13Checksum', () => {
    assert.throws(() => calculateEan13Checksum('123'), /exactly 12 numeric digits/);
    assert.throws(() => calculateEan13Checksum('1234567890123'), /exactly 12 numeric digits/);
    assert.throws(() => calculateEan13Checksum('12345678901A'), /exactly 12 numeric digits/);
  });

  test('generated barcodes should always pass EAN-13 validation', () => {
    for (let i = 0; i < 20; i++) {
      const barcode = generateBarcode();
      assert.equal(barcode.length, 13);
      assert.equal(barcode.startsWith('890'), true);
      assert.equal(validateEan13(barcode), true, `Barcode ${barcode} should be valid`);
    }
  });

  test('should validate true for correct EAN-13 and false for corrupted barcodes', () => {
    // Valid known EAN-13 barcode
    const valid = '4006381333931';
    assert.equal(validateEan13(valid), true);

    // Corrupted checksum digit (changed last digit from 1 to 2)
    const corrupted = '4006381333932';
    assert.equal(validateEan13(corrupted), false);

    // Malformed inputs
    assert.equal(validateEan13(''), false);
    assert.equal(validateEan13(null), false);
    assert.equal(validateEan13('40063813339'), false); // too short
    assert.equal(validateEan13('40063813339311'), false); // too long
    assert.equal(validateEan13('400638133393X'), false); // non-numeric
  });

  test('should format product label correctly with pricing and validity flag', () => {
    const product = {
      sku: 'SKU-COF-01',
      name: 'Arabica Dark Roast',
      price: 18.5,
      barcode: '4006381333931'
    };

    const label = formatBarcodeLabel(product);
    assert.equal(label.sku, 'SKU-COF-01');
    assert.equal(label.name, 'Arabica Dark Roast');
    assert.equal(label.price, '$18.50');
    assert.equal(label.barcode, '4006381333931');
    assert.equal(label.isValidEan, true);
    assert.ok(label.generatedAt);
  });
});
