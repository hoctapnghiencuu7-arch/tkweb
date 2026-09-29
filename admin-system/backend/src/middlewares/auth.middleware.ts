import { Request, Response, NextFunction } from 'express';
import { RoleType } from '../types/index.js';
import { store } from '../database/store.js';
import { verifyToken, TokenPayload } from '../utils/auth-crypto.js';

export interface AuthenticatedUserPayload {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: RoleType;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUserPayload;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Yêu cầu token xác thực Bearer hợp lệ để truy cập tài nguyên.',
    });
    return;
  }

  try {
    const decoded: TokenPayload = verifyToken(token);

    // Verify user exists and is active in store
    const matchedUser = store.adminUsers.find(
      (u) => u.id === decoded.id && u.status === 'ACTIVE'
    );

    if (!matchedUser) {
      res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại hoặc đã bị khóa.',
      });
      return;
    }

    req.user = {
      id: matchedUser.id,
      username: matchedUser.username,
      email: matchedUser.email,
      fullName: matchedUser.fullName,
      role: matchedUser.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token xác thực JWT không hợp lệ hoặc đã hết hạn.',
    });
  }
}

export function requireRoles(...allowedRoles: RoleType[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập để truy cập tài nguyên.' });
      return;
    }

    if (req.user.role === 'SUPER_ADMIN') {
      return next(); // Super Admin has universal access
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Bạn không có quyền thực hiện thao tác này. Yêu cầu vai trò: ${allowedRoles.join(', ')}.`,
      });
      return;
    }

    next();
  };
}
