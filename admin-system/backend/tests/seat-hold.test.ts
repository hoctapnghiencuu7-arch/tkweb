import test from 'node:test';
import assert from 'node:assert/strict';
import { SeatHoldManager } from '../src/utils/seat-hold-manager.js';
import { FlightSeat } from '../src/types/index.js';

test('Seat Hold Manager - Successfully hold available seat', () => {
  const manager = new SeatHoldManager(15);
  const seat: FlightSeat = {
    flightId: 1,
    seatNumber: '12A',
    seatClass: 'ECONOMY',
    seatType: 'WINDOW',
    extraCharge: 50000,
    status: 'AVAILABLE',
  };

  const now = new Date('2026-09-14T10:00:00Z');
  const result = manager.holdSeat(seat, 'session_user_abc', now);

  assert.equal(result.success, true);
  assert.equal(seat.status, 'HELD');
  assert.equal(seat.heldBySession, 'session_user_abc');
  assert.equal(seat.heldUntil, '2026-09-14T10:15:00.000Z');
});

test('Seat Hold Manager - Cannot hold already booked seat', () => {
  const manager = new SeatHoldManager(15);
  const seat: FlightSeat = {
    flightId: 1,
    seatNumber: '01A',
    seatClass: 'BUSINESS',
    seatType: 'WINDOW',
    extraCharge: 200000,
    status: 'BOOKED',
  };

  const result = manager.holdSeat(seat, 'session_user_xyz');
  assert.equal(result.success, false);
  assert.equal(seat.status, 'BOOKED');
});

test('Seat Hold Manager - Sweeps and releases expired seat holds', () => {
  const manager = new SeatHoldManager(15);
  const seats: FlightSeat[] = [
    {
      flightId: 1,
      seatNumber: '14B',
      seatClass: 'ECONOMY',
      seatType: 'MIDDLE',
      extraCharge: 0,
      status: 'HELD',
      heldUntil: '2026-09-14T10:15:00.000Z',
      heldBySession: 'session_old',
    },
    {
      flightId: 1,
      seatNumber: '14C',
      seatClass: 'ECONOMY',
      seatType: 'AISLE',
      extraCharge: 30000,
      status: 'HELD',
      heldUntil: '2026-09-14T10:45:00.000Z', // Not expired yet
      heldBySession: 'session_active',
    },
  ];

  const checkTime = new Date('2026-09-14T10:20:00.000Z');
  const released = manager.sweepExpiredHolds(seats, checkTime);

  assert.deepEqual(released, ['14B']);
  assert.equal(seats[0].status, 'AVAILABLE');
  assert.equal(seats[0].heldUntil, null);
  assert.equal(seats[1].status, 'HELD');
});
