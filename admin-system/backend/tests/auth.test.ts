import { test, describe } from 'node:test';
import assert from 'node:assert';
import { verifyPassword, signToken, verifyToken, hashPassword } from '../src/utils/auth-crypto.js';
import { store } from '../src/database/store.js';

describe('Admin Authentication & JWT Security', () => {
  const adminUser = store.adminUsers.find((u) => u.username === 'admin')!;

  test('Validates correct password for admin user', () => {
    assert.strictEqual(verifyPassword('admin123', adminUser), true);
  });

  test('Rejects incorrect password for admin user', () => {
    assert.strictEqual(verifyPassword('wrongpassword', adminUser), false);
    assert.strictEqual(verifyPassword('123456', adminUser), false);
    assert.strictEqual(verifyPassword('', adminUser), false);
  });

  test('Signs cryptographically valid JWT token with user payload', () => {
    const token = signToken(adminUser);
    assert(token && typeof token === 'string');
    assert(token.split('.').length === 3, 'JWT must have 3 parts separated by dots');

    const decoded = verifyToken(token);
    assert.strictEqual(decoded.id, adminUser.id);
    assert.strictEqual(decoded.username, 'admin');
    assert.strictEqual(decoded.role, 'SUPER_ADMIN');
    assert.strictEqual(decoded.email, 'admin@skywings.vn');
  });

  test('Rejects tampered or invalid JWT token', () => {
    const token = signToken(adminUser);
    const tampered = token.slice(0, -5) + 'abcde';

    assert.throws(() => {
      verifyToken(tampered);
    }, /invalid signature|jwt malformed/i);
  });

  test('All default role users have verified credentials configured', () => {
    const expectedCredentials = [
      { username: 'admin', pass: 'admin123', role: 'SUPER_ADMIN' },
      { username: 'cskh', pass: 'cskh123', role: 'CSKH' },
      { username: 'ketoan', pass: 'ketoan123', role: 'ACCOUNTANT' },
      { username: 'marketing', pass: 'marketing123', role: 'MARKETING' },
    ];

    for (const cred of expectedCredentials) {
      const user = store.adminUsers.find((u) => u.username === cred.username);
      assert(user, `User ${cred.username} must exist in seed store`);
      assert.strictEqual(user.role, cred.role);
      assert.strictEqual(verifyPassword(cred.pass, user), true, `Password for ${cred.username} must verify`);
      assert.strictEqual(verifyPassword('wrongPass', user), false, `Wrong password for ${cred.username} must be rejected`);
    }
  });
});
