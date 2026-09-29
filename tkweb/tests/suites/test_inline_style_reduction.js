/**
 * Automated Verification Suite for Ticket 11 (UI-008):
 * Payment & Schedule Inline Style Reduction
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const SCHEDULE_HTML_PATH = path.join(ROOT_DIR, 'pages', 'schedule.html');
const PAYMENT_HTML_PATH = path.join(ROOT_DIR, 'pages', 'payment.html');
const STYLE_CSS_PATH = path.join(ROOT_DIR, 'assets', 'css', 'style.css');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

console.log('=== VERIFYING TICKET 11 (UI-008): INLINE STYLE REDUCTION ===\n');

const scheduleHtml = fs.readFileSync(SCHEDULE_HTML_PATH, 'utf8');
const paymentHtml = fs.readFileSync(PAYMENT_HTML_PATH, 'utf8');
const styleCss = fs.readFileSync(STYLE_CSS_PATH, 'utf8');

// 1. CSS Scoped Rules Verification
console.log('1. Verifying CSS Scoped Rules in assets/css/style.css:');
assert(
  /\.sched-mobile-day-item\s+\.sched-heatmap-cell\s*\{[^}]*padding:\s*0\.25rem\s+0\.4rem/i.test(styleCss),
  'style.css defines scoped rule for .sched-mobile-day-item .sched-heatmap-cell with compact padding'
);
assert(
  /\.schedule-matrix-table\s+tbody\s+td:not\(\.sched-matrix-flight-info\)\s*\{[^}]*text-align:\s*center/i.test(styleCss),
  'style.css defines scoped rule for .schedule-matrix-table tbody td:not(.sched-matrix-flight-info)'
);
assert(
  /\.schedule-fids-table\s+tbody\s+td\s*\{[^}]*padding:\s*1\.15rem\s+1\.1rem/i.test(styleCss),
  'style.css defines scoped rule for .schedule-fids-table tbody td with padding and border-bottom'
);
assert(
  /\.payment-fee-subrow\s*\{[^}]*display:\s*flex/i.test(styleCss),
  'style.css defines scoped class .payment-fee-subrow for payment breakdown rows'
);

// 2. Schedule Inline Style Reduction
console.log('\n2. Verifying Schedule Inline Style Elimination in pages/schedule.html:');
const schedStyles = scheduleHtml.match(/style="[^"]*"/g) || [];
console.log(`   Schedule inline style count: ${schedStyles.length} (Baseline was 442)`);

assert(
  schedStyles.length <= 245,
  `schedule.html inline style count is reduced from 442 to <= 245 (Current: ${schedStyles.length})`
);
assert(
  !scheduleHtml.includes('style="padding: 0.25rem 0.4rem; font-size: 0.76rem;"'),
  'schedule.html completely eliminated repetitive 70x .sched-heatmap-cell mobile inline styles'
);
assert(
  !scheduleHtml.includes('style="text-align:center; padding:0.6rem; border-bottom: 1px solid var(--border-subtle);"'),
  'schedule.html completely eliminated repetitive 63x matrix td inline styles'
);
assert(
  !scheduleHtml.includes('style="padding: 1.15rem 1.1rem; border-bottom: 1px solid var(--border-subtle);"'),
  'schedule.html completely eliminated repetitive 54x FIDS td inline styles'
);

// 3. Payment Inline Style Reduction
console.log('\n3. Verifying Payment Inline Style Elimination in pages/payment.html:');
const paymentStyles = paymentHtml.match(/style="[^"]*"/g) || [];
console.log(`   Payment inline style count: ${paymentStyles.length} (Baseline was 129)`);

assert(
  paymentStyles.length <= 120,
  `payment.html inline style count is reduced from 129 to <= 120 (Current: ${paymentStyles.length})`
);
assert(
  !paymentHtml.includes('style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;"'),
  'payment.html eliminated repetitive flex breakdown row inline styles'
);
assert(
  paymentHtml.includes('payment-fee-subrow'),
  'payment.html utilizes .payment-fee-subrow class'
);

// 4. Structural Integrity
console.log('\n4. Verifying Structural Integrity:');
assert(
  scheduleHtml.includes('class="sched-heatmap-cell daily"'),
  'schedule.html preserves sched-heatmap-cell daily classes'
);
assert(
  scheduleHtml.includes('id="schedule-table-body"'),
  'schedule.html preserves FIDS tbody ID'
);
assert(
  paymentHtml.includes('id="summary-flight-text"'),
  'payment.html preserves flight summary element ID'
);
assert(
  paymentHtml.includes('id="summary-total-val"'),
  'payment.html preserves total amount element ID'
);

console.log(`\nResults: ${passCount} Passed, ${failCount} Failed.`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL INLINE STYLE REDUCTION GATES PASSED (12/12)!');
}
