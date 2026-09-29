import { FlightSeat } from '../types/index.js';

export interface SeatHoldResult {
  success: boolean;
  message: string;
  heldUntil?: string;
}

/**
 * Quản lý khóa giữ chỗ tạm thời khi khách hàng tiến hành thanh toán (Seat Hold Manager)
 * Ngăn chặn bán trùng ghế (Double Booking)
 */
export class SeatHoldManager {
  private defaultTimeoutMinutes: number;

  constructor(timeoutMinutes = 15) {
    this.defaultTimeoutMinutes = timeoutMinutes;
  }

  public setTimeoutMinutes(minutes: number) {
    this.defaultTimeoutMinutes = minutes;
  }

  public getTimeoutMinutes(): number {
    return this.defaultTimeoutMinutes;
  }

  /**
   * Giữ chỗ ghế nếu ghế đang ở trạng thái AVAILABLE hoặc phiên giữ cũ đã hết hạn
   */
  public holdSeat(seat: FlightSeat, sessionId: string, now: Date = new Date()): SeatHoldResult {
    const isCurrentlyHeld = seat.status === 'HELD' && seat.heldUntil && new Date(seat.heldUntil) > now;

    if (seat.status === 'BOOKED') {
      return { success: false, message: `Ghế ${seat.seatNumber} đã được đặt thành công bởi hành khách khác!` };
    }

    if (seat.status === 'BLOCKED') {
      return { success: false, message: `Ghế ${seat.seatNumber} hiện đang bị khóa kỹ thuật!` };
    }

    if (isCurrentlyHeld && seat.heldBySession !== sessionId) {
      return { success: false, message: `Ghế ${seat.seatNumber} đang được giữ tạm thời bởi một khách hàng khác!` };
    }

    const expiresAt = new Date(now.getTime() + this.defaultTimeoutMinutes * 60 * 1000);
    seat.status = 'HELD';
    seat.heldUntil = expiresAt.toISOString();
    seat.heldBySession = sessionId;

    return {
      success: true,
      message: `Giữ ghế ${seat.seatNumber} thành công trong ${this.defaultTimeoutMinutes} phút.`,
      heldUntil: seat.heldUntil,
    };
  }

  /**
   * Tự động giải phóng các ghế đã hết hạn giữ
   */
  public sweepExpiredHolds(seats: FlightSeat[], now: Date = new Date()): string[] {
    const releasedSeats: string[] = [];
    for (const seat of seats) {
      if (seat.status === 'HELD' && seat.heldUntil && new Date(seat.heldUntil) <= now) {
        seat.status = 'AVAILABLE';
        seat.heldUntil = null;
        seat.heldBySession = null;
        releasedSeats.push(seat.seatNumber);
      }
    }
    return releasedSeats;
  }
}
