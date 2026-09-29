import { DynamicPricingRule } from '../types/index.js';

export interface PricingCalculationResult {
  basePrice: number;
  occupancyRate: number;
  daysRemaining: number;
  appliedRules: { ruleName: string; adjustmentPercent: number }[];
  totalAdjustmentPercent: number;
  finalPrice: number;
}

/**
 * Tính toán giá vé động (Dynamic Pricing Engine)
 * Quy tắc:
 * 1. Tỷ lệ lấp đầy ghế cao (>= 75%, >= 90%) -> Tăng giá
 * 2. Cận ngày bay (<= 3 ngày, <= 7 ngày) -> Tăng giá
 * 3. Ngày bay xa (> 30 ngày) và ghế vắng (< 40%) -> Ưu đãi kích cầu
 */
export function calculateDynamicPrice(
  basePrice: number,
  totalSeats: number,
  bookedSeats: number,
  departureTime: Date | string,
  rules: DynamicPricingRule[]
): PricingCalculationResult {
  const occupancyRate = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;
  const depDate = new Date(departureTime);
  const now = new Date();
  const diffTime = depDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const appliedRules: { ruleName: string; adjustmentPercent: number }[] = [];
  let totalAdjustmentPercent = 0;

  for (const rule of rules) {
    if (!rule.isActive) continue;

    let matches = true;

    if (rule.daysBeforeDeparture !== undefined) {
      if (daysRemaining > rule.daysBeforeDeparture) {
        matches = false;
      }
    }

    if (rule.occupancyRateThreshold !== undefined) {
      if (occupancyRate < rule.occupancyRateThreshold) {
        matches = false;
      }
    }

    if (matches) {
      appliedRules.push({
        ruleName: rule.name,
        adjustmentPercent: rule.priceAdjustmentPercent,
      });
      totalAdjustmentPercent += rule.priceAdjustmentPercent;
    }
  }

  // Giới hạn biên độ biến động giá: tối thiểu -30%, tối đa +150%
  const clampedAdjustment = Math.max(-30, Math.min(150, totalAdjustmentPercent));
  const multiplier = 1 + clampedAdjustment / 100;
  const finalPrice = Math.round(basePrice * multiplier);

  return {
    basePrice,
    occupancyRate: Math.round(occupancyRate * 10) / 10,
    daysRemaining,
    appliedRules,
    totalAdjustmentPercent: clampedAdjustment,
    finalPrice,
  };
}
