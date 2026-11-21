// Barcode Utility Functions: Generation, EAN-13 Checksum Validation, and Label Formatting

/**
 * Computes the EAN-13 modulo 10 checksum digit for a 12-digit string.
 * @param {string} digits12 - 12 numeric digits
 * @returns {number} checksum digit (0-9)
 */
const calculateEan13Checksum = (digits12) => {
  if (!digits12 || digits12.length !== 12 || !/^\d{12}$/.test(digits12)) {
    throw new Error('Input must be exactly 12 numeric digits');
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(digits12.charAt(i), 10);
    sum += (i % 2 === 0) ? digit : digit * 3;
  }
  return (10 - (sum % 10)) % 10;
};

/**
 * Generates a unique 13-digit EAN-13 barcode with standard retail prefix.
 * @param {string} prefix - Optional 3-digit country/industry prefix (defaults to '890' for India/Asia)
 * @returns {string} 13-digit barcode
 */
const generateBarcode = (prefix = '890') => {
  let randomPart = '';
  for (let i = 0; i < 9; i++) {
    randomPart += Math.floor(Math.random() * 10);
  }
  const body = prefix + randomPart;
  const checksum = calculateEan13Checksum(body);
  return body + checksum;
};

/**
 * Validates a 13-digit EAN-13 barcode including checksum verification.
 * @param {string} barcode - Barcode string to validate
 * @returns {boolean} true if barcode is valid EAN-13, false otherwise
 */
const validateEan13 = (barcode) => {
  if (!barcode || typeof barcode !== 'string') return false;
  const cleaned = barcode.trim();
  if (cleaned.length !== 13 || !/^\d{13}$/.test(cleaned)) return false;

  const body = cleaned.substring(0, 12);
  const expectedChecksum = calculateEan13Checksum(body);
  const actualChecksum = parseInt(cleaned.charAt(12), 10);

  return expectedChecksum === actualChecksum;
};

/**
 * Formats a product object into a printable barcode label payload.
 * @param {Object} product
 * @returns {Object} label payload
 */
const formatBarcodeLabel = (product) => {
  if (!product || !product.barcode) {
    throw new Error('Product must include a valid barcode');
  }
  return {
    sku: product.sku || 'N/A',
    name: product.name || 'Unnamed Product',
    price: typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : '$0.00',
    barcode: product.barcode,
    isValidEan: validateEan13(product.barcode),
    generatedAt: new Date().toISOString()
  };
};

module.exports = {
  calculateEan13Checksum,
  generateBarcode,
  validateEan13,
  formatBarcodeLabel
};
