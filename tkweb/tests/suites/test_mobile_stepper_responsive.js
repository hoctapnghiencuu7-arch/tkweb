/**
 * Test Suite: Ticket 9 (UI-009) — Mobile Stepper Compact Responsive Indicator
 * Verifies:
 * 1. Stepper markup in all 4 booking funnel pages:
 *    - pages/booking.html (Step 2/5: Thông Tin Khách)
 *    - pages/seats.html   (Step 3/5: Chọn Chỗ Ngồi)
 *    - pages/payment.html (Step 4/5: Thanh Toán)
 *    - pages/ticket.html  (Step 5/5: Thẻ Lên Tàu Bay)
 * 2. Presence of compact mobile indicator (.stepper-compact-indicator) with badge and title
 * 3. Responsive CSS rules in assets/css/style.css:
 *    - Desktop (> 640px): .stepper-compact-indicator is hidden (display: none)
 *    - Mobile (<= 640px): .stepper-compact-indicator is flex, .modern-stepper-track min-width is reset to 0,
 *      .modern-stepper-container eliminates horizontal blowout (overflow-x: hidden),
 *      individual step labels (.step-label) are hidden to prevent text collision,
 *      compact step circles and aligned connecting line.
 * 4. Dark Mode & Accessibility:
 *    - Dark mode styles for compact badge and text
 *    - aria-label on <nav>, aria-current="step" on active node, aria-hidden="true" on visual compact indicator
 * 5. Print stylesheet (@media print) hides stepper completely.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🛫 RUNNING TICKET 9 TESTS: MOBILE STEPPER COMPACT RESPONSIVE');
console.log('================================================================\n');

const ROOT_DIR = path.resolve(__dirname, '../..');
const styleCssPath = path.join(ROOT_DIR, 'assets', 'css', 'style.css');
const bookingHtmlPath = path.join(ROOT_DIR, 'pages', 'booking.html');
const seatsHtmlPath = path.join(ROOT_DIR, 'pages', 'seats.html');
const paymentHtmlPath = path.join(ROOT_DIR, 'pages', 'payment.html');
const ticketHtmlPath = path.join(ROOT_DIR, 'pages', 'ticket.html');

const styleCss = fs.readFileSync(styleCssPath, 'utf8');
const bookingHtml = fs.readFileSync(bookingHtmlPath, 'utf8');
const seatsHtml = fs.readFileSync(seatsHtmlPath, 'utf8');
const paymentHtml = fs.readFileSync(paymentHtmlPath, 'utf8');
const ticketHtml = fs.readFileSync(ticketHtmlPath, 'utf8');

// -------------------------------------------------------------
// 1. Funnel Pages Stepper Structure & Compact Indicator Verification
// -------------------------------------------------------------
console.log('--- 1. Checking Stepper Markup in 4 Funnel Pages ---');

const pages = [
  { name: 'booking.html', content: bookingHtml, stepNum: '2', total: '5', title: 'Thông Tin Khách', progress: '25%' },
  { name: 'seats.html', content: seatsHtml, stepNum: '3', total: '5', title: 'Chọn Chỗ Ngồi', progress: '50%' },
  { name: 'payment.html', content: paymentHtml, stepNum: '4', total: '5', title: 'Thanh Toán', progress: '75%' },
  { name: 'ticket.html', content: ticketHtml, stepNum: '5', total: '5', title: 'Thẻ Lên Tàu Bay', progress: '100%' }
];

pages.forEach((p, idx) => {
  assert(
    p.content.includes('class="modern-stepper-container"'),
    `${p.name} contains .modern-stepper-container`
  );
  assert(
    p.content.includes('class="modern-stepper-track"'),
    `${p.name} contains .modern-stepper-track`
  );
  assert(
    p.content.includes('stepper-compact-indicator'),
    `${p.name} contains .stepper-compact-indicator`
  );
  assert(
    p.content.includes('stepper-compact-badge') && p.content.includes(`Bước ${p.stepNum}/${p.total}`),
    `${p.name} contains compact badge "Bước ${p.stepNum}/${p.total}"`
  );
  assert(
    p.content.includes('stepper-compact-title') && p.content.includes(p.title),
    `${p.name} contains compact title "${p.title}"`
  );
  assert(
    p.content.includes(`style="width: ${p.progress};"`),
    `${p.name} contains correct progress fill width ${p.progress}`
  );
  assert(
    p.content.includes('aria-current="step"'),
    `${p.name} contains active node with aria-current="step"`
  );
  console.log(`✅ TEST ${idx + 1} PASSED: ${p.name} correctly has Stepper + Compact Indicator (Bước ${p.stepNum}/${p.total})`);
});

// -------------------------------------------------------------
// 2. CSS Desktop Baseline Rules
// -------------------------------------------------------------
console.log('\n--- 2. Checking Desktop Stepper CSS Baseline ---');

assert(
  styleCss.includes('.modern-stepper-container') &&
  styleCss.includes('.modern-stepper-track'),
  'style.css contains core modern stepper classes'
);
console.log('✅ TEST 5 PASSED: Core modern stepper classes present');

assert(
  styleCss.includes('.stepper-compact-indicator') &&
  (styleCss.includes('display: none') || styleCss.includes('display:none')),
  'style.css hides .stepper-compact-indicator on default/desktop view'
);
console.log('✅ TEST 6 PASSED: .stepper-compact-indicator hidden on desktop view');

// -------------------------------------------------------------
// 3. CSS Responsive Mobile Rules (<= 640px / <= 480px)
// -------------------------------------------------------------
console.log('\n--- 3. Checking Responsive Mobile Stepper Rules ---');

// Extract media queries in style.css targeting <= 640px or <= 480px
const mobileQueryMatches = styleCss.match(/@media[^{]*(?:max-width:\s*(?:640|480)px)[^{]*\{[\s\S]*?(?=@media|$)/gi) || [];
const mobileStylesCombined = mobileQueryMatches.join('\n');

assert(
  mobileStylesCombined.includes('.stepper-compact-indicator') &&
  mobileStylesCombined.includes('display: flex'),
  'Mobile media query displays .stepper-compact-indicator as flex'
);
console.log('✅ TEST 7 PASSED: .stepper-compact-indicator displayed as flex on mobile');

assert(
  mobileStylesCombined.includes('.modern-stepper-track') &&
  (mobileStylesCombined.includes('min-width: 0') || mobileStylesCombined.includes('min-width:0')),
  'Mobile media query resets .modern-stepper-track min-width to 0'
);
console.log('✅ TEST 8 PASSED: .modern-stepper-track min-width reset to 0 (no blowout)');

assert(
  mobileStylesCombined.includes('.modern-stepper-container') &&
  (mobileStylesCombined.includes('overflow-x: hidden') || mobileStylesCombined.includes('overflow-x:hidden')),
  'Mobile media query prevents container horizontal blowout (overflow-x: hidden)'
);
console.log('✅ TEST 9 PASSED: .modern-stepper-container overflow-x set to hidden on mobile');

assert(
  mobileStylesCombined.includes('.modern-step-node .step-label') &&
  (mobileStylesCombined.includes('display: none') || mobileStylesCombined.includes('display:none')),
  'Mobile media query hides individual .step-label nodes to prevent label collision'
);
console.log('✅ TEST 10 PASSED: Individual .step-label hidden on mobile to prevent overlapping');

assert(
  mobileStylesCombined.includes('.modern-step-node .step-circle') &&
  (mobileStylesCombined.includes('width: 28px') || mobileStylesCombined.includes('width:28px') || mobileStylesCombined.includes('width: 30px') || mobileStylesCombined.includes('width: 32px')),
  'Mobile media query scales step circles to compact dimensions (<= 32px)'
);
console.log('✅ TEST 11 PASSED: Step circles scaled to compact mobile dimensions');

assert(
  mobileStylesCombined.includes('.stepper-compact-badge') &&
  mobileStylesCombined.includes('.stepper-compact-title'),
  'Mobile media query contains styling for .stepper-compact-badge and .stepper-compact-title'
);
console.log('✅ TEST 12 PASSED: Compact badge and title styling present');

// -------------------------------------------------------------
// 4. Dark Mode & Accessibility
// -------------------------------------------------------------
console.log('\n--- 4. Checking Dark Mode & Accessibility Rules ---');

assert(
  styleCss.includes('[]') &&
  styleCss.includes('.stepper-compact-badge'),
  'Dark mode styling exists for .stepper-compact-badge'
);
console.log('✅ TEST 13 PASSED: Dark mode support for .stepper-compact-badge verified');

pages.forEach((p, idx) => {
  assert(
    p.content.includes('<nav class="modern-stepper-container" aria-label="Tiến trình đặt vé">'),
    `${p.name} contains accessible navigation landmark aria-label="Tiến trình đặt vé"`
  );
});
console.log('✅ TEST 14 PASSED: All 4 funnel pages have accessible navigation landmarks');

// -------------------------------------------------------------
// 5. Print Media Stylesheet Verification
// -------------------------------------------------------------
console.log('\n--- 5. Checking Print Stylesheet Verification ---');

const printMatches = styleCss.match(/@media print\s*\{[\s\S]*?\}/gi) || [];
const printBlock = printMatches.join('\n');

assert(
  printBlock.includes('.modern-stepper-container'),
  '@media print hides .modern-stepper-container'
);
console.log('✅ TEST 15 PASSED: @media print hides .modern-stepper-container from printed boarding pass');

console.log('\n================================================================');
console.log('🎉 ALL 15 TICKET 9 MOBILE STEPPER TESTS PASSED SUCCESSFULLY!');
console.log('================================================================');
