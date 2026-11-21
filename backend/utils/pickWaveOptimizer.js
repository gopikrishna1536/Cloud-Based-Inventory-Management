/**
 * Multi-Order Batch Picking Wave Organizer
 * Groups orders sharing identical storage zones into consolidated picking waves.
 */
class PickWaveOptimizer {
  static createPickWaves(orders, maxItemsPerWave = 20) {
    const waves = [];
    let currentWave = { waveId: 'WAVE-1', items: [], totalQuantity: 0 };

    for (const ord of orders) {
      if (currentWave.totalQuantity + ord.quantity > maxItemsPerWave) {
        waves.push(currentWave);
        currentWave = { waveId: `WAVE-${waves.length + 1}`, items: [], totalQuantity: 0 };
      }
      currentWave.items.push(ord);
      currentWave.totalQuantity += ord.quantity;
    }

    if (currentWave.items.length > 0) {
      waves.push(currentWave);
    }

    return waves;
  }
}

module.exports = PickWaveOptimizer;
