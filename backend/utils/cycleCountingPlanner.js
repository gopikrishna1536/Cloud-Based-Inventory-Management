/**
 * Perpetual Cycle Counting Schedule Generator
 * Class A: Counted 12x/year (monthly)
 * Class B: Counted 4x/year (quarterly)
 * Class C: Counted 1x/year (annually)
 */
class CycleCountingPlanner {
  static planSchedule(catalogWithABC, workingDaysPerYear = 250) {
    let countsNeeded = 0;

    for (const item of catalogWithABC) {
      if (item.abcClass === 'A') countsNeeded += 12;
      else if (item.abcClass === 'B') countsNeeded += 4;
      else countsNeeded += 1;
    }

    const countsPerDay = Math.ceil(countsNeeded / workingDaysPerYear);

    return {
      totalItems: catalogWithABC.length,
      annualCountsRequired: countsNeeded,
      workingDaysPerYear,
      recommendedDailyCountItems: countsPerDay
    };
  }
}

module.exports = CycleCountingPlanner;
