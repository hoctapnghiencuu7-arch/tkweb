import { Router, Request, Response } from 'express';
import { store } from '../../database/store.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = Router();

// GET /api/customers - List customers
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: store.customers,
  });
});

// PUT /api/customers/:id/blacklist - Toggle blacklist status
router.put('/:id/blacklist', authenticateToken, (req: Request, res: Response) => {
  const customerId = Number(req.params.id);
  const { isBlacklisted, reason } = req.body;

  const customer = store.customers.find((c) => c.id === customerId);
  if (!customer) {
    res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng.' });
    return;
  }

  customer.isBlacklisted = Boolean(isBlacklisted);
  if (isBlacklisted && reason) {
    customer.blacklistReason = reason;
  }
  customer.updatedAt = new Date().toISOString();

  store.recordAuditLog(
    req.user?.id,
    req.user?.fullName || 'Admin',
    isBlacklisted ? 'BLACKLIST_ADD' : 'BLACKLIST_REMOVE',
    'customers',
    customer.email,
    `${isBlacklisted ? 'Thêm' : 'Gỡ bỏ'} khách hàng ${customer.fullName} (${customer.email}) khỏi danh sách hạn chế.`
  );

  res.json({
    success: true,
    message: isBlacklisted ? 'Đã thêm khách hàng vào danh sách cấm bay/hạn chế.' : 'Đã gỡ khách hàng khỏi danh sách hạn chế.',
    data: customer,
  });
});

export const customerRoutes = router;
