import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { store } from '../../database/store.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { calculateFlightRefund } from '../../utils/refund-calculator.js';

const router = Router();

// GET /api/bookings - Search and filter bookings
router.get('/', (req: Request, res: Response) => {
  const { status, paymentStatus, search, page = '1', limit = '10' } = req.query;

  let result = store.bookings.filter((b) => !b.deletedAt);

  if (status) {
    result = result.filter((b) => b.bookingStatus === status);
  }
  if (paymentStatus) {
    result = result.filter((b) => b.paymentStatus === paymentStatus);
  }
  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(
      (b) =>
        b.pnrCode.toLowerCase().includes(q) ||
        b.contactName.toLowerCase().includes(q) ||
        b.contactEmail.toLowerCase().includes(q) ||
        b.contactPhone.includes(q) ||
        b.passengers.some((p) => p.fullName.toLowerCase().includes(q))
    );
  }

  const total = result.length;
  const p = Math.max(1, parseInt(String(page)));
  const l = Math.max(1, parseInt(String(limit)));
  const startIndex = (p - 1) * l;
  const paginated = result.slice(startIndex, startIndex + l);

  res.json({
    success: true,
    data: {
      items: paginated,
      meta: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
      },
    },
  });
});

// GET /api/bookings/:id - Booking details
router.get('/:id', (req: Request, res: Response) => {
  const idOrPnr = String(req.params.id);
  const booking = store.bookings.find(
    (b) => (b.id === Number(idOrPnr) || b.pnrCode.toUpperCase() === idOrPnr.toUpperCase()) && !b.deletedAt
  );

  if (!booking) {
    res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt vé.' });
    return;
  }

  res.json({
    success: true,
    data: booking,
  });
});

const UpdatePassengerSchema = z.object({
  fullName: z.string().min(2, 'Tên hành khách không hợp lệ'),
  idCardNumber: z.string().optional(),
  seatNumber: z.string().optional(),
});

// PUT /api/bookings/:id/passengers/:passengerId - Admin edit passenger info
router.put('/:id/passengers/:passengerId', authenticateToken, (req: Request, res: Response) => {
  const bookingId = Number(req.params.id);
  const passengerId = Number(req.params.passengerId);
  const body = UpdatePassengerSchema.parse(req.body);

  const booking = store.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt vé.' });
    return;
  }

  const passenger = booking.passengers.find((p) => p.id === passengerId);
  if (!passenger) {
    res.status(404).json({ success: false, message: 'Không tìm thấy thông tin hành khách.' });
    return;
  }

  const oldValues = { fullName: passenger.fullName, seatNumber: passenger.seatNumber };
  passenger.fullName = body.fullName;
  if (body.idCardNumber !== undefined) passenger.idCardNumber = body.idCardNumber;
  if (body.seatNumber !== undefined) passenger.seatNumber = body.seatNumber;

  booking.updatedAt = new Date().toISOString();

  store.recordAuditLog(
    req.user?.id,
    req.user?.fullName || 'Admin',
    'UPDATE_PASSENGER',
    'bookings',
    booking.pnrCode,
    `Cập nhật thông tin hành khách ${passenger.fullName} trong đơn ${booking.pnrCode}`,
    oldValues,
    { fullName: passenger.fullName, seatNumber: passenger.seatNumber }
  );

  res.json({
    success: true,
    message: 'Cập nhật thông tin hành khách thành công.',
    data: booking,
  });
});

// POST /api/bookings/:id/refund-request - Submit refund request
router.post('/:id/refund-request', authenticateToken, (req: Request, res: Response) => {
  const bookingId = Number(req.params.id);
  const { reason } = req.body;

  const booking = store.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt vé.' });
    return;
  }

  if (booking.bookingStatus === 'CANCELLED' || booking.bookingStatus === 'REFUNDED') {
    res.status(400).json({ success: false, message: 'Đơn hàng đã ở trạng thái đã hủy hoặc đã hoàn tiền.' });
    return;
  }

  // Calculate refund fee based on flight departure
  const flight = booking.flight || store.flights[0];
  const refundCalc = calculateFlightRefund(
    booking.totalAmount,
    'ECONOMY',
    true,
    flight.departureTime
  );

  const newRefund = {
    id: store.refunds.length + 1,
    uuid: `ref-${(store.refunds.length + 1).toString().padStart(4, '0')}`,
    bookingId: booking.id,
    pnrCode: booking.pnrCode,
    requestedAmount: booking.totalAmount,
    cancellationFee: refundCalc.cancellationFee,
    actualRefundAmount: refundCalc.refundAmount,
    reason: reason || 'Khách yêu cầu hủy vé vì lý do cá nhân',
    status: 'REQUESTED' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.refunds.unshift(newRefund);
  booking.bookingStatus = 'REFUND_REQUESTED';
  booking.updatedAt = new Date().toISOString();

  store.recordAuditLog(
    req.user?.id,
    req.user?.fullName || 'Admin',
    'REQUEST_REFUND',
    'refunds',
    booking.pnrCode,
    `Tạo yêu cầu hoàn tiền cho PNR ${booking.pnrCode}. Tiền hoàn dự kiến: ${refundCalc.refundAmount.toLocaleString('vi-VN')} ₫.`
  );

  res.json({
    success: true,
    message: `Đã tạo yêu cầu hoàn tiền cho đơn ${booking.pnrCode}. Chờ Kế toán xét duyệt.`,
    data: newRefund,
  });
});

// GET /api/bookings/:id/eticket - Preview E-ticket
router.get('/:id/eticket', (req: Request, res: Response) => {
  const idOrPnr = String(req.params.id);
  const booking = store.bookings.find(
    (b) => (b.id === Number(idOrPnr) || b.pnrCode.toUpperCase() === idOrPnr.toUpperCase()) && !b.deletedAt
  );

  if (!booking) {
    res.status(404).json({ success: false, message: 'Không tìm thấy đơn vé.' });
    return;
  }

  const flight = booking.flight || store.flights[0];

  res.json({
    success: true,
    data: {
      airline: flight.airline?.name || 'SkyWings Airlines',
      pnrCode: booking.pnrCode,
      flightNumber: flight.flightNumber,
      departureAirport: `${flight.departureAirport?.city} (${flight.departureAirport?.iataCode})`,
      arrivalAirport: `${flight.arrivalAirport?.city} (${flight.arrivalAirport?.iataCode})`,
      departureTime: flight.departureTime,
      gate: flight.gate || '08',
      passengers: booking.passengers.map((p) => ({
        fullName: p.fullName,
        seatNumber: p.seatNumber || 'Chưa gán',
        ticketNumber: p.ticketNumber,
      })),
      qrPayload: `SKYWINGS:${booking.pnrCode}:${flight.flightNumber}`,
      issuedAt: booking.createdAt,
    },
  });
});

export const bookingRoutes = router;
