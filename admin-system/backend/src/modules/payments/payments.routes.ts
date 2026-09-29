import { Router, Request, Response } from 'express';
import { store } from '../../database/store.js';
import { authenticateToken, requireRoles } from '../../middlewares/auth.middleware.js';

const router = Router();

// GET /api/payments - List transactions
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: store.payments,
  });
});

// GET /api/payments/refunds - List all refund requests
router.get('/refunds', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: store.refunds,
  });
});

// PUT /api/payments/refunds/:id/approve - Approve refund request
router.put(
  '/refunds/:id/approve',
  authenticateToken,
  requireRoles('SUPER_ADMIN', 'ACCOUNTANT'),
  (req: Request, res: Response) => {
    const refundId = Number(req.params.id);
    const refund = store.refunds.find((r) => r.id === refundId);

    if (!refund) {
      res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu hoàn tiền.' });
      return;
    }

    refund.status = 'COMPLETED';
    refund.approvedBy = req.user?.fullName || 'Kế Toán Viên';
    refund.approvedAt = new Date().toISOString();
    refund.updatedAt = new Date().toISOString();

    // Update associated booking
    const booking = store.bookings.find((b) => b.id === refund.bookingId);
    if (booking) {
      booking.bookingStatus = 'REFUNDED';
      booking.paymentStatus = 'REFUNDED';
    }

    store.recordAuditLog(
      req.user?.id,
      req.user?.fullName || 'Kế Toán',
      'REFUND_APPROVE',
      'refunds',
      refund.pnrCode,
      `Phê duyệt lệnh hoàn tiền đơn ${refund.pnrCode}. Số tiền giải ngân: ${refund.actualRefundAmount.toLocaleString('vi-VN')} ₫.`
    );

    res.json({
      success: true,
      message: `Đã phê duyệt và hoàn tất hoàn tiền cho PNR ${refund.pnrCode}.`,
      data: refund,
    });
  }
);

// GET /api/payments/invoice/:bookingId - Generate Electronic VAT invoice
router.get('/invoice/:bookingId', (req: Request, res: Response) => {
  const bookingId = Number(req.params.bookingId);
  const booking = store.bookings.find((b) => b.id === bookingId);

  if (!booking) {
    res.status(404).json({ success: false, message: 'Không tìm thấy đơn vé để xuất hóa đơn.' });
    return;
  }

  const invoiceNumber = `1C26T-${String(booking.id).padStart(7, '0')}`;
  const vatRate = 8;
  const subtotal = Math.round(booking.totalAmount / (1 + vatRate / 100));
  const vatAmount = booking.totalAmount - subtotal;

  res.json({
    success: true,
    data: {
      invoiceNumber,
      issuedDate: new Date().toISOString(),
      sellerName: 'CÔNG TY CỔ PHẦN HÀNG KHÔNG SKYWINGS',
      sellerTaxCode: '0316889988',
      sellerAddress: 'Tầng 18, Tòa nhà SkyCenter, Sân bay Tân Sơn Nhất, TP. Hồ Chí Minh',
      buyerName: booking.contactName,
      buyerEmail: booking.contactEmail,
      pnrCode: booking.pnrCode,
      flightNumber: booking.flight?.flightNumber || 'VN 214',
      subtotal,
      vatRate: `${vatRate}%`,
      vatAmount,
      totalAmount: booking.totalAmount,
      status: 'ISSUED',
      digitalSignature: 'SHA256:4f9e8a71b2c3d4e5f60718293a4b5c6d7e8f9012',
    },
  });
});

export const paymentRoutes = router;
