/**
 * 3D Pallet Carton Space Utilization Calculator
 * Standard EUR-Pallet dimensions: 120cm x 80cm x 150cm (max height)
 */
class PalletSpaceOptimizer {
  static calculatePalletFit(cartonLengthCm, cartonWidthCm, cartonHeightCm, maxPalletHeightCm = 150) {
    // 120 x 80 base
    const fitOrient1 = Math.floor(120 / cartonLengthCm) * Math.floor(80 / cartonWidthCm);
    const fitOrient2 = Math.floor(120 / cartonWidthCm) * Math.floor(80 / cartonLengthCm);
    const cartonsPerTier = Math.max(fitOrient1, fitOrient2);

    const tiers = Math.floor(maxPalletHeightCm / cartonHeightCm);
    const totalCartons = cartonsPerTier * tiers;

    const palletVolumeCm3 = 120 * 80 * maxPalletHeightCm;
    const usedVolumeCm3 = totalCartons * (cartonLengthCm * cartonWidthCm * cartonHeightCm);
    const efficiency = Number(((usedVolumeCm3 / palletVolumeCm3) * 100).toFixed(1));

    return {
      cartonsPerTier,
      tiers,
      totalCartonsPerPallet: totalCartons,
      spaceUtilizationPercent: efficiency
    };
  }
}

module.exports = PalletSpaceOptimizer;
