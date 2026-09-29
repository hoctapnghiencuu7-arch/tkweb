import 'dotenv/config';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { AdminUser, RoleType } from '../types/index.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'skywings_admin_enterprise_secure_jwt_secret_key_2026';

export interface TokenPayload {
  id: number;
  uuid: string;
  username: string;
  email: string;
  fullName: string;
  role: RoleType;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`skywings_salt_2026_${password}`).digest('hex');
}

export function verifyPassword(password: string, user: AdminUser): boolean {
  if (!password) return false;
  
  // Direct match if plain password exists
  if (user.password && user.password === password) {
    return true;
  }
  
  // Salted sha256 match if passwordHash exists
  if (user.passwordHash) {
    const hashed = hashPassword(password);
    return hashed === user.passwordHash;
  }
  
  return false;
}

export function signToken(user: AdminUser): string {
  const payload: TokenPayload = {
    id: user.id,
    uuid: user.uuid,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
