/**
 * Supplier Lead Time Tracker & Rolling Exponential Moving Average (EMA)
 */
class SupplierLeadTimeEstimator {
  static computeRollingLeadTime(historicalLeadTimes, smoothingFactor = 0.3) {
    if (!historicalLeadTimes || historicalLeadTimes.length === 0) return 0;

    let ema = historicalLeadTimes[0];
    for (let i = 1; i < historicalLeadTimes.length; i++) {
      ema = (historicalLeadTimes[i] * smoothingFactor) + (ema * (1 - smoothingFactor));
    }

    return Number(ema.toFixed(1));
  }
}

module.exports = SupplierLeadTimeEstimator;
