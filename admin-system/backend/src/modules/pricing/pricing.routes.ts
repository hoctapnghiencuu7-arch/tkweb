import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { store } from '../../database/store.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { calculateDynamicPrice } from '../../utils/pricing-engine.js';
import { DynamicPricingRule, PromoCode } from '../../types/index.js';

const router = Router();

// GET /api/pricing/rules - List dynamic pricing rules
router.get('/rules', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: store.pricingRules,
  });
});

// POST /api/pricing/calculate - Real-time price calculation preview
router.post('/calculate', (req: Request, res: Response) => {
  const { basePrice, totalSeats, bookedSeats, departureTime } = req.body;

  const result = calculateDynamicPrice(
    Number(basePrice) || 1500000,
    Number(totalSeats) || 180,
    Number(bookedSeats) || 50,
    departureTime || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    store.pricingRules
  );

  res.json({
    success: true,
    data: result,
  });
});

// GET /api/pricing/promos - List promotional voucher codes
router.get('/promos', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: store.promoCodes,
  });
});

const PromoSchema = z.object({
  code: z.string().min(3, 'Mã khuyến mãi tối thiểu 3 ký tự'),
  title: z.string().min(3, 'Tiêu đề khuyến mãi không hợp lệ'),
  discountType: z.enum(['PERCENT', 'FIXED_AMOUNT']),
  discountValue: z.number().positive('Giá trị giảm phải lớn hơn 0'),
  minOrderAmount: z.number().nonnegative(),
  maxDiscountAmount: z.number().optional(),
  validFrom: z.string(),
  validTo: z.string(),
});

// POST /api/pricing/promos - Create new promo code
router.post('/promos', authenticateToken, (req: Request, res: Response) => {
  const body = PromoSchema.parse(req.body);

  const existing = store.promoCodes.find((p) => p.code.toUpperCase() === body.code.toUpperCase());
  if (existing) {
    res.status(400).json({ success: false, message: 'Mã khuyến mãi này đã tồn tại trong hệ thống.' });
    return;
  }

  const newPromo: PromoCode = {
    id: store.promoCodes.length + 1,
    code: body.code.toUpperCase(),
    title: body.title,
    discountType: body.discountType,
    discountValue: body.discountValue,
    minOrderAmount: body.minOrderAmount,
    maxDiscountAmount: body.maxDiscountAmount,
    usageLimitTotal: 1000,
    usageLimitPerUser: 1,
    usedCount: 0,
    validFrom: body.validFrom,
    validTo: body.validTo,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  store.promoCodes.unshift(newPromo);

  store.recordAuditLog(
    req.user?.id,
    req.user?.fullName || 'Admin',
    'CREATE_PROMO',
    'promo_codes',
    newPromo.code,
    `Tạo mã ưu đãi mới ${newPromo.code} (${newPromo.discountValue}${newPromo.discountType === 'PERCENT' ? '%' : 'đ'})`
  );

  res.status(201).json({
    success: true,
    message: `Tạo mã giảm giá ${newPromo.code} thành công.`,
    data: newPromo,
  });
});

// GET /api/pricing/settings - Get conversion & checkout settings (Seat hold timeout)
router.get('/settings', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      seatHoldTimeoutMinutes: store.seatHoldManager.getTimeoutMinutes(),
      vatPercent: 8,
      defaultCurrency: 'VND',
    },
  });
});

// PUT /api/pricing/settings - Update seat hold timeout
router.put('/settings', authenticateToken, (req: Request, res: Response) => {
  const { seatHoldTimeoutMinutes } = req.body;
  if (seatHoldTimeoutMinutes && Number(seatHoldTimeoutMinutes) > 0) {
    store.seatHoldManager.setTimeoutMinutes(Number(seatHoldTimeoutMinutes));
  }

  res.json({
    success: true,
    message: 'Cập nhật cấu hình giữ chỗ thành công.',
    data: {
      seatHoldTimeoutMinutes: store.seatHoldManager.getTimeoutMinutes(),
    },
  });
});

export const pricingRoutes = router;
