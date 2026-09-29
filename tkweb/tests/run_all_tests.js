/**
 * MASTER VERIFICATION RUNNER FOR SKYWINGS AIRLINES (TKWEB)
 * Runs all 15 automated test suites & produces an executive DoD report.
 */
const { execSync } = require('child_process');
const path = require('path');

const SUITES = [
  { name: 'Phase 1: Static Analysis & Code Integrity', file: 'tests/suites/static-analysis.js' },
  { name: 'Ticket 1 (SEC-001/002): Admin Auth & Backdoor Elimination', file: 'tests/suites/test_sec_admin_auth.js' },
  { name: 'Ticket 2 (UI-037): Unified Navigation Transition Pipeline', file: 'tests/suites/test_navigation_transition.js' },
  { name: 'Ticket 3 (UI-012/013/022): Airline Logo Normalization & Asset Fallbacks', file: 'tests/suites/test_airline_logos.js' },
  { name: 'Ticket 4 (UI-023/033): Flight Price Layout & Scarcity Headroom', file: 'tests/suites/test_flight_price_layout.js' },
  { name: 'Ticket 5 (UI-002/011/018): Schedule Mobile Full-Width', file: 'tests/suites/test_schedule_responsive.js' },
  { name: 'Ticket 6 (UI-014/021): Boarding Pass Metadata, QR Frame & Print Media', file: 'tests/suites/test_boarding_pass_ticket.js' },
  { name: 'Ticket 7 (UI-006/001): Typography Normalization & Lean Mobile Header', file: 'tests/suites/test_typography_and_mobile_header.js' },
  { name: 'Ticket 8 (UI-003/004/005): Sticky Tables, CMS Prototype Banner & Scoped Admin', file: 'tests/suites/test_admin_and_schedule_polish.js' },
  { name: 'Ticket 9 (UI-009): Mobile Stepper Compact Responsive Indicator', file: 'tests/suites/test_mobile_stepper_responsive.js' },
  { name: 'Ticket 10 (UI-007): CSS !important Decoupling & Max-Width Normalization', file: 'tests/suites/test_css_important_and_fixed_width.js' },
  { name: 'Ticket 11 (UI-008): Payment & Schedule Inline Style Reduction', file: 'tests/suites/test_inline_style_reduction.js' },
  { name: 'Ticket 12 (UI-010): Offline Fallback & Local Font Stack Resilience', file: 'tests/suites/test_offline_and_font_resilience.js' },
  { name: 'Ticket 13 (E2E-001): End-to-End Booking Funnel Flow & PNR Integrity', file: 'tests/suites/test_e2e_booking_funnel_integrity.js' },
  { name: 'Ticket 14 (A11Y-001): Accessibility WCAG 2.1 AA & Keyboard Focus Rings', file: 'tests/suites/test_a11y_and_keyboard_nav.js' }
];

console.log('================================================================================');
console.log('✈️  SKYWINGS AIRLINES — MASTER QUALITY VERIFICATION GATEWAY');
console.log('================================================================================\n');

let passCount = 0;
let failCount = 0;
const results = [];

SUITES.forEach((suite, idx) => {
  const num = String(idx + 1).padStart(2, '0');
  process.stdout.write(`[${num}/${SUITES.length}] Running ${suite.name}... `);
  try {
    execSync(`node ${suite.file}`, { stdio: 'pipe', cwd: path.resolve(__dirname, '..') });
    console.log('✅ PASS');
    results.push({ name: suite.name, status: 'PASS' });
    passCount++;
  } catch (err) {
    console.log('❌ FAIL');
    results.push({ name: suite.name, status: 'FAIL', error: err.message });
    failCount++;
  }
});

console.log('\n================================================================================');
console.log(`FINAL RESULT: ${passCount}/${SUITES.length} SUITES PASSED (${failCount} FAILS)`);
console.log('================================================================================');

if (failCount === 0) {
  console.log('🎉 ALL QUALITY GATES PASSED 100%! SYSTEM IS READY FOR FINAL HANDOVER.');
  process.exit(0);
} else {
  console.error('⚠️ SOME QUALITY GATES FAILED. INSPECT DETAILED LOGS.');
  process.exit(1);
}
