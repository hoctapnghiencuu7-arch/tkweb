import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { authRoutes } from './modules/auth/auth.routes.js';
import { flightRoutes } from './modules/flights/flights.routes.js';
import { bookingRoutes } from './modules/bookings/bookings.routes.js';
import { pricingRoutes } from './modules/pricing/pricing.routes.js';
import { paymentRoutes } from './modules/payments/payments.routes.js';
import { customerRoutes } from './modules/customers/customers.routes.js';
import { analyticsRoutes } from './modules/analytics/analytics.routes.js';
import { cmsRoutes } from './modules/cms/cms.routes.js';
import { auditRoutes } from './modules/audit/audit.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: '*' }));
  app.use(express.json());

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'SkyWings Admin Core API' });
  });

  // OpenAPI Specification / Swagger UI JSON
  app.get('/api/docs', (_req: Request, res: Response) => {
    res.json({
      openapi: '3.0.0',
      info: {
        title: 'SkyWings Airline Administration API',
        version: '2.0.0',
        description: 'Tài liệu OpenAPI 3.0 cho toàn bộ hệ thống API Quản Trị Hàng Không SkyWings.',
      },
      servers: [{ url: 'http://localhost:5001/api' }],
      paths: {
        '/auth/login': { post: { summary: 'Đăng nhập ban điều hành' } },
        '/flights': { get: { summary: 'Danh sách chuyến bay & lịch trình' }, post: { summary: 'Tạo chuyến bay mới' } },
        '/flights/{id}/status': { put: { summary: 'Cập nhật trạng thái chuyến bay (Real-time)' } },
        '/bookings': { get: { summary: 'Tra cứu danh sách đơn hàng & mã PNR' } },
        '/bookings/{id}/passengers/{passengerId}': { put: { summary: 'Sửa thông tin hành khách & ghế ngồi' } },
        '/bookings/{id}/refund-request': { post: { summary: 'Gửi yêu cầu hoàn tiền' } },
        '/pricing/rules': { get: { summary: 'Danh sách quy tắc giá động (Dynamic Pricing)' } },
        '/pricing/calculate': { post: { summary: 'Mô phỏng tính giá vé thời gian thực' } },
        '/pricing/promos': { get: { summary: 'Danh sách mã giảm giá' }, post: { summary: 'Tạo mã voucher' } },
        '/payments': { get: { summary: 'Nhật ký giao dịch cổng thanh toán' } },
        '/payments/refunds/{id}/approve': { put: { summary: 'Phê duyệt hoàn tiền' } },
        '/payments/invoice/{bookingId}': { get: { summary: 'Xuất hóa đơn điện tử VAT' } },
        '/customers': { get: { summary: 'Danh sách khách hàng 360 & Hội viên' } },
        '/analytics/dashboard': { get: { summary: 'Chỉ số KPIs, doanh thu & phễu chuyển đổi (Funnel)' } },
        '/cms': { get: { summary: 'Quản trị Banner, tin tức & chính sách' } },
        '/audit': { get: { summary: 'Nhật ký thao tác nhân sự (Audit trail)' } },
      },
    });
  });

  // Module routes
  app.use('/api/auth', authRoutes);
  app.use('/api/flights', flightRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/pricing', pricingRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/cms', cmsRoutes);
  app.use('/api/audit', auditRoutes);

  // Central Error Handler
  app.use(errorHandler);

  return app;
}
