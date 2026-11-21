/**
 * Warehouse Storage Bin Location Resolver
 * Formats and parses coordinate strings like "A-04-R02-S03-B01" (Zone-Aisle-Rack-Shelf-Bin)
 */
class BinLocationLocator {
  static parseLocation(code) {
    const parts = (code || '').trim().split('-');
    if (parts.length !== 5) {
      throw new Error(`Invalid bin location code: ${code}. Expected format ZONE-AISLE-RACK-SHELF-BIN`);
    }

    return {
      zone: parts[0],
      aisle: parseInt(parts[1], 10),
      rack: parts[2],
      shelf: parseInt(parts[3].replace(/\D/g, ''), 10),
      bin: parseInt(parts[4].replace(/\D/g, ''), 10)
    };
  }

  static formatLocation(zone, aisle, rackNum, shelfNum, binNum) {
    const aStr = String(aisle).padStart(2, '0');
    const rStr = `R${String(rackNum).padStart(2, '0')}`;
    const sStr = `S${String(shelfNum).padStart(2, '0')}`;
    const bStr = `B${String(binNum).padStart(2, '0')}`;
    return `${zone.toUpperCase()}-${aStr}-${rStr}-${sStr}-${bStr}`;
  }
}

module.exports = BinLocationLocator;
