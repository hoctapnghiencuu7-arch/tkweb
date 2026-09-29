export interface RefundEligibilityResult {
  isEligible: boolean;
  cabinClass: string;
  hoursBeforeDeparture: number;
  originalPrice: number;
  cancellationFee: number;
  refundAmount: number;
  reasonNotes: string;
}

/**
 * Tính toán phí hoàn/hủy vé theo chính sách hàng không IATA (Refund Calculator)
 * Quy định:
 * - Vé Hạng Phổ thông siêu tiết kiệm (ECONOMY Super Saver): Không hoàn tiền
 * - Vé Hạng Phổ thông tiêu chuẩn (ECONOMY Standard):
 *     > 24h trước giờ bay: Phí hủy 350.000 VNĐ
 *     3h - 24h trước giờ bay: Phí hủy 500.000 VNĐ
 *     < 3h hoặc sau giờ bay (No-show): Không hoàn tiền
 * - Vé Hạng Thương gia (BUSINESS):
 *     > 3h trước giờ bay: Miễn phí hoặc phí tượng trưng 150.000 VNĐ
 *     < 3h: Phí hủy 300.000 VNĐ
 */
export function calculateFlightRefund(
  originalPrice: number,
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST',
  isRefundableClass: boolean,
  departureTime: Date | string,
  now: Date = new Date()
): RefundEligibilityResult {
  const depTime = new Date(departureTime);
  const diffMs = depTime.getTime() - now.getTime();
  const hoursBeforeDeparture = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;

  if (hoursBeforeDeparture <= 0) {
    return {
      isEligible: false,
      cabinClass,
      hoursBeforeDeparture,
      originalPrice,
      cancellationFee: originalPrice,
      refundAmount: 0,
      reasonNotes: 'Chuyến bay đã khởi hành (No-show). Không áp dụng hoàn tiền theo quy định.',
    };
  }

  if (!isRefundableClass) {
    return {
      isEligible: false,
      cabinClass,
      hoursBeforeDeparture,
      originalPrice,
      cancellationFee: originalPrice,
      refundAmount: 0,
      reasonNotes: 'Hạng vé không hỗ trợ hoàn tiền theo điều kiện biểu giá tiết kiệm.',
    };
  }

  let cancellationFee = 0;

  if (cabinClass === 'BUSINESS' || cabinClass === 'FIRST') {
    if (hoursBeforeDeparture >= 3) {
      cancellationFee = 150000; // Phí quản trị tượng trưng
    } else {
      cancellationFee = 350000;
    }
  } else {
    // ECONOMY
    if (hoursBeforeDeparture >= 24) {
      cancellationFee = 350000;
    } else if (hoursBeforeDeparture >= 3) {
      cancellationFee = 500000;
    } else {
      return {
        isEligible: false,
        cabinClass,
        hoursBeforeDeparture,
        originalPrice,
        cancellationFee: originalPrice,
        refundAmount: 0,
        reasonNotes: 'Thời gian yêu cầu hoàn vé dưới 3 giờ trước khi khởi hành. Vé mất hiệu lực hoàn.',
      };
    }
  }

  // Đảm bảo phí không vượt quá giá vé
  cancellationFee = Math.min(cancellationFee, originalPrice);
  const refundAmount = Math.max(0, originalPrice - cancellationFee);

  return {
    isEligible: true,
    cabinClass,
    hoursBeforeDeparture,
    originalPrice,
    cancellationFee,
    refundAmount,
    reasonNotes: `Đủ điều kiện hoàn vé. Khấu trừ phí hủy: ${cancellationFee.toLocaleString('vi-VN')} ₫.`,
  };
}
