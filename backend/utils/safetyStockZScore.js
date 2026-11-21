/**
 * Safety Stock & Cycle Service Level Calculator
 */
class SafetyStockZScore {
  static Z_MAP = {
    90: 1.28,
    95: 1.65,
    98: 2.05,
    99: 2.33
  };

  static computeBuffer(avgDailyDemand, stdDevDemand, leadTimeDays, serviceLevelPercent = 95) {
    const z = SafetyStockZScore.Z_MAP[serviceLevelPercent] || 1.65;
    const safetyStockUnits = Math.ceil(z * stdDevDemand * Math.sqrt(leadTimeDays));
    const reorderPoint = Math.ceil((avgDailyDemand * leadTimeDays) + safetyStockUnits);

    return {
      serviceLevelPercent,
      zScore: z,
      safetyStockUnits,
      reorderPointUnits: reorderPoint
    };
  }
}

module.exports = SafetyStockZScore;
