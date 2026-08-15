import React from 'react';

// Pure React CODE128 Generator Component for SVG rendering
const BarcodeSvg = ({ value = '8901234567890', width = 2, height = 60, showText = true, className = '' }) => {
  const code = String(value || '0000000000000');

  // CODE128 Code B Table patterns (11 modules per character, 6 bars/spaces each)
  const CODE128B = {
    ' ': '11011001100', '!': '11001101100', '"': '11001100110', '#': '10010011000',
    '$': '10010001100', '%': '10001001100', '&': '10011001000', "'": '10011000100',
    '(': '10001100100', ')': '11001001000', '*': '11001000100', '+': '11000100100',
    ',': '10110011100', '-': '10011011100', '.': '10011001110', '/': '10111001100',
    '0': '10011101100', '1': '10011100110', '2': '11001110100', '3': '11001110010',
    '4': '11011011100', '5': '11011001110', '6': '11001101110', '7': '11100101100',
    '8': '11100100110', '9': '11101100100', ':': '11101100010', ';': '11100011010',
    '<': '11100011001', '=': '10110011110', '>': '10111100110', '?': '10011110110',
    '@': '10011110011', 'A': '11110010110', 'B': '11110110100', 'C': '11110110010',
    'D': '11011011110', 'E': '11011101110', 'F': '11101011110', 'G': '11110101110',
    'H': '11011110110', 'I': '11101101110', 'J': '11110111010', 'K': '11101111010',
    'L': '11001000010', 'M': '11100001010', 'N': '10100001100', 'O': '10001001000',
    'P': '10100100000', 'Q': '10010100000', 'R': '10001010000', 'S': '10000101000',
    'T': '10000100100', 'U': '10000010100', 'V': '10000010010', 'W': '10100000100',
    'X': '10001000010', 'Y': '10000100010', 'Z': '10010000010',
  };

  const START_CODE_B = '11010010000'; // Code B Start Symbol
  const STOP_SYMBOL = '1100011101011'; // Stop Symbol (13 modules)

  // Encode string
  let encodedBinary = START_CODE_B;
  let checksumVal = 104; // Start B value is 104

  for (let i = 0; i < code.length; i++) {
    const char = code.charAt(i).toUpperCase();
    const pattern = CODE128B[char] || CODE128B['0'];
    const charVal = char.charCodeAt(0) - 32;
    checksumVal += charVal * (i + 1);
    encodedBinary += pattern;
  }

  // Add checksum character
  const checksumCharIndex = checksumVal % 103;
  const checksumChar = String.fromCharCode(checksumCharIndex + 32);
  encodedBinary += CODE128B[checksumChar] || CODE128B['0'];

  // Add stop symbol
  encodedBinary += STOP_SYMBOL;

  const quietZone = 10;
  const svgWidth = quietZone * 2 + encodedBinary.length * width;
  const svgHeight = height + (showText ? 24 : 0);

  let currentX = quietZone;
  const rects = [];

  for (let i = 0; i < encodedBinary.length; i++) {
    if (encodedBinary.charAt(i) === '1') {
      rects.push(
        <rect
          key={i}
          x={currentX}
          y={0}
          width={width}
          height={height}
          fill="#0f172a"
        />
      );
    }
    currentX += width;
  }

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="max-w-full h-auto"
      >
        <rect width={svgWidth} height={svgHeight} fill="#ffffff" />
        <g>{rects}</g>
        {showText && (
          <text
            x={svgWidth / 2}
            y={height + 16}
            textAnchor="middle"
            fill="#0f172a"
            fontSize="14"
            fontFamily="monospace"
            fontWeight="bold"
            letterSpacing="2"
          >
            {code}
          </text>
        )}
      </svg>
    </div>
  );
};

export default BarcodeSvg;
