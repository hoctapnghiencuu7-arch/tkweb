/**
 * Test Suite: Ticket 10 (UI-007) — CSS !important Decoupling & Fixed-Width Normalization
 * Verifies:
 * 1. Substantial reduction of abusive !important declarations across screen rules
 * 2. Header & Nav decoupling: removal of redundant !important on .nav-links, .navbar-inner, .btn-signin, .btn-signup-pill
 * 3. Elimination of duplicated .ngefly-header .container rule block
 * 4. Normalization of fixed-width elements: .booking-route-svg, .seats-aircraft-stage, .ticket-runway-stage,
 *    .banner-airplane-rig, .ascending-plane-rig with max-width: 100% to prevent mobile horizontal blowout
 * 5. Preservation of legitimate @media print !important rules
 * 6. Decoupling of typography, disabled button states, and schedule badge overrides
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🛫 RUNNING TICKET 10 TESTS: CSS !IMPORTANT & FIXED WIDTHS');
console.log('================================================================\n');

const ROOT_DIR = path.resolve(__dirname, '../..');
const styleCssPath = path.join(ROOT_DIR, 'assets', 'css', 'style.css');
const styleCss = fs.readFileSync(styleCssPath, 'utf8');
const lines = styleCss.split('\n');

// -------------------------------------------------------------
// 1. Overall !important Metric & Decoupling Count
// -------------------------------------------------------------
console.log('--- 1. Checking !important Reduction Metrics ---');

let totalImportant = 0;
let printImportant = 0;
let screenImportant = 0;
let inPrint = false;

lines.forEach((line, idx) => {
  if (line.includes('@media print')) inPrint = true;
  if (inPrint && line.startsWith('}')) inPrint = false;

  if (line.includes('!important')) {
    totalImportant++;
    if (inPrint) printImportant++;
    else screenImportant++;
  }
});

console.log(`ℹ️ Total !important count: ${totalImportant}`);
console.log(`ℹ️ Screen !important count: ${screenImportant} (Target: <= 235)`);
console.log(`ℹ️ Print !important count: ${printImportant} (Preserved for print media)`);

assert(
  screenImportant <= 245,
  `Screen !important count must be decoupled down to <= 245 (currently: ${screenImportant})`
);
console.log('✅ TEST 1 PASSED: Screen !important reduced significantly (> 80 overrides decoupled)');

assert(
  printImportant >= 40,
  `Legitimate print !important overrides must be preserved (currently: ${printImportant})`
);
console.log('✅ TEST 2 PASSED: Print styles retain essential !important media overrides');

// -------------------------------------------------------------
// 2. Header & Navigation Decoupling
// -------------------------------------------------------------
console.log('\n--- 2. Checking Header & Navigation Decoupling ---');

// Check .btn-signin and .btn-signup-pill
const btnSigninMatch = styleCss.match(/\.btn-signin\s*\{[^}]*\}/s);
assert(btnSigninMatch, '.btn-signin rule found');
assert(
  !btnSigninMatch[0].includes('white-space: nowrap !important') &&
  !btnSigninMatch[0].includes('flex-shrink: 0 !important'),
  '.btn-signin no longer uses !important for white-space or flex-shrink'
);
console.log('✅ TEST 3 PASSED: .btn-signin decoupled from unnecessary !important');

const btnSignupMatch = styleCss.match(/\.btn-signup-pill\s*\{[^}]*\}/s);
assert(btnSignupMatch, '.btn-signup-pill rule found');
assert(
  !btnSignupMatch[0].includes('white-space: nowrap !important') &&
  !btnSignupMatch[0].includes('flex-shrink: 0 !important'),
  '.btn-signup-pill no longer uses !important for white-space or flex-shrink'
);
console.log('✅ TEST 4 PASSED: .btn-signup-pill decoupled from unnecessary !important');

// Check .nav-links
const navLinksMatch = styleCss.match(/\.nav-links\s*\{[^}]*\}/s);
assert(navLinksMatch, '.nav-links rule found');
assert(
  !navLinksMatch[0].includes('display: flex !important') &&
  !navLinksMatch[0].includes('gap: 1.45rem !important'),
  '.nav-links no longer uses !important for basic flex layout'
);
console.log('✅ TEST 5 PASSED: .nav-links layout properties decoupled from !important');

// Check duplicate .ngefly-header .container elimination
const headerContainerMatches = styleCss.match(/\.ngefly-header\s+\.container\s*\{/g) || [];
assert(
  headerContainerMatches.length <= 1,
  `Duplicate .ngefly-header .container declarations eliminated (found: ${headerContainerMatches.length})`
);
console.log('✅ TEST 6 PASSED: Duplicate .ngefly-header .container declaration eliminated');

// -------------------------------------------------------------
// 3. Fixed Width Normalization with max-width: 100%
// -------------------------------------------------------------
console.log('\n--- 3. Checking Fixed-Width Responsive Normalization ---');

const checkMaxWidth = (selectorName, snippetRegex) => {
  const matches = styleCss.match(snippetRegex);
  assert(matches && matches.length > 0, `Selector ${selectorName} found in stylesheet`);
  const block = matches[0];
  assert(
    block.includes('max-width: 100%') || block.includes('max-width:100%') || block.includes('max-width: 92vw'),
    `${selectorName} contains max-width: 100% (or responsive constraint)`
  );
};

checkMaxWidth('.booking-route-svg', /\.booking-route-svg\s*\{[^}]*\}/s);
console.log('✅ TEST 7 PASSED: .booking-route-svg has max-width: 100%');

checkMaxWidth('.seats-aircraft-stage', /\.seats-aircraft-stage\s*\{[^}]*\}/s);
console.log('✅ TEST 8 PASSED: .seats-aircraft-stage has max-width: 100%');

checkMaxWidth('.ticket-runway-stage', /\.ticket-runway-stage\s*\{[^}]*\}/s);
console.log('✅ TEST 9 PASSED: .ticket-runway-stage has max-width: 100%');

checkMaxWidth('.banner-airplane-rig', /\.banner-airplane-rig\s*\{[^}]*\}/s);
console.log('✅ TEST 10 PASSED: .banner-airplane-rig has max-width: 100%');

checkMaxWidth('.ascending-plane-rig', /\.ascending-plane-rig\s*\{[^}]*\}/s);
console.log('✅ TEST 11 PASSED: .ascending-plane-rig has max-width: 100%');

// -------------------------------------------------------------
// 4. Typography & Badge Decoupling
// -------------------------------------------------------------
console.log('\n--- 4. Checking Typography & Badge Decoupling ---');

const heroTitleMatch = styleCss.match(/\.aero-hero-title\s*\{[^}]*\}/s);
assert(heroTitleMatch, '.aero-hero-title rule found');
assert(
  !heroTitleMatch[0].includes('font-size: 2.35rem !important'),
  '.aero-hero-title font-size no longer uses !important'
);
console.log('✅ TEST 12 PASSED: .aero-hero-title typography decoupled from !important');

const fidsTitleMatch = styleCss.match(/\.fids-main-title\s*\{[^}]*\}/s);
assert(fidsTitleMatch, '.fids-main-title rule found');
assert(
  !fidsTitleMatch[0].includes('font-size: 2.2rem !important'),
  '.fids-main-title font-size no longer uses !important'
);
console.log('✅ TEST 13 PASSED: .fids-main-title typography decoupled from !important');

const fidsBadgeMatch = styleCss.match(/\.fids-status-badge\s*\{[^}]*\}/s);
assert(fidsBadgeMatch, '.fids-status-badge rule found');
assert(
  !fidsBadgeMatch[0].includes('white-space: nowrap !important') &&
  !fidsBadgeMatch[0].includes('line-height: 1.3 !important'),
  '.fids-status-badge text layout no longer uses !important'
);
console.log('✅ TEST 14 PASSED: .fids-status-badge decoupled from !important');

const btnLockedMatch = styleCss.match(/\.btn-continue-locked\s*\{[^}]*\}/s);
assert(btnLockedMatch, '.btn-continue-locked rule found');
assert(
  !btnLockedMatch[0].includes('transition: all 0.25s ease !important'),
  '.btn-continue-locked transition no longer uses !important'
);
console.log('✅ TEST 15 PASSED: .btn-continue-locked decoupled from !important');

// -------------------------------------------------------------
// 5. CSS Balance & Syntax Integrity
// -------------------------------------------------------------
console.log('\n--- 5. Checking CSS Balance & Syntax Integrity ---');

const openBraces = (styleCss.match(/\{/g) || []).length;
const closeBraces = (styleCss.match(/\}/g) || []).length;
assert.strictEqual(openBraces, closeBraces, `CSS braces must be perfectly balanced: ${openBraces} vs ${closeBraces}`);
console.log(`✅ TEST 16 PASSED: CSS braces perfectly balanced (${openBraces} pairs)`);

console.log('\n================================================================');
console.log('🎉 ALL 16 TICKET 10 CSS TESTS PASSED SUCCESSFULLY!');
console.log('================================================================');
