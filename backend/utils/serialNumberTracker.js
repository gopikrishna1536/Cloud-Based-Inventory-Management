/**
 * Serial Number Asset Lifecycle & Warranty Tracker
 */
class SerialNumberTracker {
  static validateWarranty(manufactureDateStr, warrantyMonths, currentDateStr) {
    const mfg = new Date(manufactureDateStr);
    const curr = new Date(currentDateStr);

    const expiry = new Date(mfg);
    expiry.setMonth(expiry.getMonth() + warrantyMonths);

    const isUnderWarranty = curr <= expiry;
    const daysRemaining = Math.max(0, Math.ceil((expiry - curr) / (1000 * 60 * 60 * 24)));

    return {
      manufactureDate: mfg.toISOString().slice(0, 10),
      warrantyExpiryDate: expiry.toISOString().slice(0, 10),
      isUnderWarranty,
      daysRemaining
    };
  }
}

module.exports = SerialNumberTracker;
