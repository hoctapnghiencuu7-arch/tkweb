import { Router, Request, Response } from 'express';
import { store } from '../../database/store.js';

const router = Router();

// GET /api/analytics/dashboard
router.get('/dashboard', (_req: Request, res: Response) => {
  const totalFlights = store.flights.filter((f) => !f.deletedAt).length;
  const activeFlights = store.flights.filter(
    (f) => f.status === 'SCHEDULED' || f.status === 'BOARDING' || f.status === 'DEPARTED'
  ).length;

  const totalBookings = store.bookings.length;
  const totalRevenue = store.bookings
    .filter((b) => b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  // Revenue 7-day trend
  const revenueTrend = [
    { day: 'T2 (08/09)', revenue: 142000000, orders: 48 },
    { day: 'T3 (09/09)', revenue: 185000000, orders: 62 },
    { day: 'T4 (10/09)', revenue: 168000000, orders: 55 },
    { day: 'T5 (11/09)', revenue: 210000000, orders: 74 },
    { day: 'T6 (12/09)', revenue: 295000000, orders: 102 },
    { day: 'T7 (13/09)', revenue: 340000000, orders: 118 },
    { day: 'CN (14/09)', revenue: 280000000, orders: 96 },
  ];

  // Ticket Class Distribution
  const cabinDistribution = [
    { name: 'Phổ Thông (Economy)', value: 78, color: '#3b82f6' },
    { name: 'Thương Gia (Business)', value: 18, color: '#ff5f38' },
    { name: 'Hạng Nhất (First)', value: 4, color: '#10b981' },
  ];

  // E-Commerce Conversion Funnel Drop-off (Trọng tâm tối ưu chốt đơn)
  const funnelDropOff = [
    { step: '1. Tìm Kiếm Chuyến Bay', users: 14200, conversionRate: '100%' },
    { step: '2. Xem Danh Sách Chuyến', users: 11500, conversionRate: '81.0%' },
    { step: '3. Chọn Chuyến & Hạng Vé', users: 7800, conversionRate: '54.9%' },
    { step: '4. Chọn Chỗ Ngồi (Seatmap)', users: 5900, conversionRate: '41.5%' },
    { step: '5. Nhập Thông Tin Khách', users: 4600, conversionRate: '32.4%' },
    { step: '6. Cổng Thanh Toán', users: 3800, conversionRate: '26.8%' },
    { step: '7. Hoàn Tất Đơn Hàng (PNR)', users: 3420, conversionRate: '24.1%' },
  ];

  // Top Routes
  const topRoutes = [
    { route: 'SGN ➔ HAN', flightsCount: 42, loadFactor: 94.2, revenue: 1250000000 },
    { route: 'HAN ➔ SGN', flightsCount: 38, loadFactor: 91.8, revenue: 1120000000 },
    { route: 'SGN ➔ DAD', flightsCount: 24, loadFactor: 88.5, revenue: 640000000 },
    { route: 'SGN ➔ PQC', flightsCount: 18, loadFactor: 92.0, revenue: 530000000 },
  ];

  res.json({
    success: true,
    data: {
      metrics: {
        totalFlights,
        activeFlights,
        totalBookings,
        totalRevenue,
        onTimePerformance: 98.4,
        averageLoadFactor: 89.6,
      },
      revenueTrend,
      cabinDistribution,
      funnelDropOff,
      topRoutes,
    },
  });
});

export const analyticsRoutes = router;
