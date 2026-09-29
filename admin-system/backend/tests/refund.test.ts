import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFlightRefund } from '../src/utils/refund-calculator.js';

test('Refund Calculator - Ineligible if class is non-refundable', () => {
  const result = calculateFlightRefund(
    1200000,
    'ECONOMY',
    false, // non-refundable
    new Date(Date.now() + 48 * 60 * 60 * 1000)
  );

  assert.equal(result.isEligible, false);
  assert.equal(result.refundAmount, 0);
});

test('Refund Calculator - Economy cancellation >24h deducts standard fee', () => {
  const departure = new Date('2026-09-20T10:00:00Z');
  const requestTime = new Date('2026-09-18T10:00:00Z'); // 48h before

  const result = calculateFlightRefund(
    2500000,
    'ECONOMY',
    true,
    departure,
    requestTime
  );

  assert.equal(result.isEligible, true);
  assert.equal(result.cancellationFee, 350000);
  assert.equal(result.refundAmount, 2150000);
});

test('Refund Calculator - Business class cancellation deducts minor fee', () => {
  const departure = new Date('2026-09-20T10:00:00Z');
  const requestTime = new Date('2026-09-20T05:00:00Z'); // 5h before

  const result = calculateFlightRefund(
    4800000,
    'BUSINESS',
    true,
    departure,
    requestTime
  );

  assert.equal(result.isEligible, true);
  assert.equal(result.cancellationFee, 150000);
  assert.equal(result.refundAmount, 4650000);
});

test('Refund Calculator - Ineligible after departure time (No-show)', () => {
  const departure = new Date('2026-09-14T08:00:00Z');
  const requestTime = new Date('2026-09-14T10:00:00Z'); // 2h after

  const result = calculateFlightRefund(
    3000000,
    'BUSINESS',
    true,
    departure,
    requestTime
  );

  assert.equal(result.isEligible, false);
  assert.equal(result.refundAmount, 0);
});
