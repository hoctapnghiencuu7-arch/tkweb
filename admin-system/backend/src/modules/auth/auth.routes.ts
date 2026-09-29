import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { store } from '../../database/store.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { verifyPassword, signToken } from '../../utils/auth-crypto.js';

const router = Router();

const LoginSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập hoặc email'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = LoginSchema.parse(req.body);

  const user = store.adminUsers.find(
    (u) => (u.username === username || u.email === username) && u.status === 'ACTIVE'
  );

  // Strictly verify username AND password
  if (!user || !verifyPassword(password, user)) {
    res.status(401).json({
      success: false,
      message: 'Tài khoản hoặc mật khẩu không chính xác hoặc đã bị khóa.',
    });
    return;
  }

  // Update last login timestamp
  user.lastLoginAt = new Date().toISOString();

  // Record audit log
  store.recordAuditLog(
    user.id,
    user.fullName,
    'LOGIN',
    'admin_users',
    user.username,
    `Đăng nhập thành công với vai trò ${user.role}`
  );

  // Generate cryptographically signed JWT Token
  const token = signToken(user);

  res.json({
    success: true,
    message: 'Đăng nhập thành công.',
    data: {
      user: {
        id: user.id,
        uuid: user.uuid,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      token,
      permissions: getPermissionsForRole(user.role),
    },
  });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req: Request, res: Response) => {
  const user = store.adminUsers.find((u) => u.id === req.user?.id) || store.adminUsers[0];
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        uuid: user.uuid,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      permissions: getPermissionsForRole(user.role),
    },
  });
});

function getPermissionsForRole(role: string): string[] {
  if (role === 'SUPER_ADMIN') {
    return ['*'];
  }
  if (role === 'CSKH') {
    return ['flights.view', 'bookings.view', 'bookings.edit', 'bookings.refund_request', 'customers.view'];
  }
  if (role === 'ACCOUNTANT') {
    return ['bookings.view', 'payments.view', 'payments.reconcile', 'refunds.approve', 'invoices.issue', 'analytics.view'];
  }
  if (role === 'MARKETING') {
    return ['pricing.view', 'pricing.edit', 'promo.manage', 'cms.manage', 'analytics.view'];
  }
  return ['flights.view', 'bookings.view'];
}

export const authRoutes = router;
