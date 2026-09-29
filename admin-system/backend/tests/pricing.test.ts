import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDynamicPrice } from '../src/utils/pricing-engine.js';
import { DynamicPricingRule } from '../src/types/index.js';

test('Dynamic Pricing Engine - Base calculation without rules', () => {
  const result = calculateDynamicPrice(
    1500000,
    180,
    50,
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    []
  );

  assert.equal(result.basePrice, 1500000);
  assert.equal(result.finalPrice, 1500000);
  assert.equal(result.totalAdjustmentPercent, 0);
});

test('Dynamic Pricing Engine - High occupancy price surge (+20%)', () => {
  const rules: DynamicPricingRule[] = [
    {
      id: 1,
      name: 'Cao điểm lấp đầy >80%',
      occupancyRateThreshold: 80,
      priceAdjustmentPercent: 20,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  // 160/180 = 88.8%
  const result = calculateDynamicPrice(
    2000000,
    180,
    160,
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    rules
  );

  assert.equal(result.finalPrice, 2400000); // 2,000,000 * 1.2
  assert.equal(result.totalAdjustmentPercent, 20);
  assert.equal(result.appliedRules.length, 1);
});

test('Dynamic Pricing Engine - Last minute urgency surge (<= 3 days)', () => {
  const rules: DynamicPricingRule[] = [
    {
      id: 2,
      name: 'Khởi hành gấp dưới 3 ngày',
      daysBeforeDeparture: 3,
      priceAdjustmentPercent: 25,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const result = calculateDynamicPrice(
    1000000,
    180,
    20,
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
    rules
  );

  assert.equal(result.finalPrice, 1250000);
  assert.equal(result.totalAdjustmentPercent, 25);
});
