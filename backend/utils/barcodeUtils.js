// Helper to generate a unique 13-digit CODE128/EAN-13 format barcode
const generateBarcode = () => {
  // 890 is standard prefix for retail product barcodes in India/Asia
  const prefix = '890';
  let randomPart = '';
  for (let i = 0; i < 9; i++) {
    randomPart += Math.floor(Math.random() * 10);
  }
  const body = prefix + randomPart;

  // Compute EAN-13 checksum digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(body.charAt(i), 10);
    sum += (i % 2 === 0) ? digit : digit * 3;
  }
  const checksum = (10 - (sum % 10)) % 10;
  return body + checksum;
};

module.exports = { generateBarcode };
