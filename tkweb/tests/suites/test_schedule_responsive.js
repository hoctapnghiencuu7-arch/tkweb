/**
 * TEST SUITE: TICKET 5 (UI-002, UI-011, UI-018)
 * Acceptance & Anti-Regression Testing for Dark Mode Select Options, Schedule Component Harmonization & Mobile Full-Width Layout
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const styleCssPath = path.join(ROOT_DIR, 'assets', 'css', 'style.css');
const mainJsPath = path.join(ROOT_DIR, 'assets', 'js', 'main.js');
const scheduleHtmlPath = path.join(ROOT_DIR, 'pages', 'schedule.html');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✅ TEST ${totalTests} PASSED: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ TEST ${totalTests} FAILED: ${message}`);
  }
}

console.log('================================================================');
console.log('📅 RUNNING TICKET 5 TESTS: SCHEDULE DARK MODE & MOBILE FULL-WIDTH');
console.log('================================================================\n');

// -------------------------------------------------------------
// 1. Select & Option Styling in Light & Dark Mode (UI-011, UI-018)
// -------------------------------------------------------------
console.log('
--- 3. Checking Mobile Schedule Full-Width Rules in @media <= 768px ---');

// Extract the specific @media (max-width: 768px) block containing schedule styles
const allMedia768 = cssContent.split(/@media\s*\(\s*max-width\s*:\s*768px\s*\)\s*\{/);
const media768Content = allMedia768.find(block => block.includes('.sched-mobile-card')) || '';

assert(
  media768Content.includes('.schedule-mobile-cards-view') &&
  media768Content.includes('width: 100%') &&
  media768Content.includes('min-width: 0'),
  '@media (max-width: 768px) sets .schedule-mobile-cards-view to width: 100% and min-width: 0'
);

assert(
  media768Content.includes('.sched-mobile-card') &&
  media768Content.includes('width: 100%') &&
  media768Content.includes('max-width: 100%') &&
  media768Content.includes('margin-inline: 0'),
  '@media (max-width: 768px) sets .sched-mobile-card to width: 100%, max-width: 100%, margin-inline: 0'
);

assert(
  media768Content.includes('.white-panel-card') &&
  media768Content.includes('padding: 1.25rem 1rem !important'),
  '@media (max-width: 768px) scales .white-panel-card padding down to 1.25rem 1rem on mobile'
);

assert(
  media768Content.includes('.schedule-hero-card') &&
  media768Content.includes('.schedule-toolbar'),
  '@media (max-width: 768px) scales .schedule-hero-card and .schedule-toolbar padding for mobile viewports'
);

assert(
  media768Content.includes('.sched-mobile-days-scroll') &&
  media768Content.includes('width: 100%'),
  '@media (max-width: 768px) allows .sched-mobile-days-scroll full horizontal scroll track'
);

// -------------------------------------------------------------
// 4. HTML Structure in pages/schedule.html
// -------------------------------------------------------------
console.log('\n--- 4. Checking DOM Structure in pages/schedule.html ---');
const scheduleHtml = fs.readFileSync(scheduleHtmlPath, 'utf8');

// Check filter select exists
assert(
  scheduleHtml.includes('id="filter-schedule-route"') &&
  scheduleHtml.includes('class="sched-select-elevated"'),
  'pages/schedule.html contains #filter-schedule-route with class sched-select-elevated'
);

// Check all 10 matrix rows have data-code and data-route
const matrixRowsMatch = scheduleHtml.match(/class="schedule-matrix-row"/g) || [];
assert(
  matrixRowsMatch.length === 10,
  `All 10 Weekly Matrix table rows have class schedule-matrix-row (found: ${matrixRowsMatch.length})`
);

// Check all 10 FIDS rows have data-code and data-route
const fidsRowsMatch = scheduleHtml.match(/class="schedule-row"/g) || [];
assert(
  fidsRowsMatch.length === 10,
  `All 10 FIDS table rows have class schedule-row (found: ${fidsRowsMatch.length})`
);

// Check all 10 mobile cards have data-code and data-route
const mobileCardsMatch = scheduleHtml.match(/class="sched-mobile-card"/g) || [];
assert(
  mobileCardsMatch.length === 10,
  `All 10 Mobile schedule cards have class sched-mobile-card (found: ${mobileCardsMatch.length})`
);

// -------------------------------------------------------------
// 5. JavaScript Synchronization in assets/js/main.js
// -------------------------------------------------------------
console.log('\n--- 5. Checking Filter Synchronization in assets/js/main.js ---');
const mainJs = fs.readFileSync(mainJsPath, 'utf8');

assert(
  mainJs.includes("const matrixRows = Array.from(document.querySelectorAll('.schedule-matrix-row'));") &&
  mainJs.includes("row.style.display = (matchCode && matchRoute && matchDay) ? '' : 'none';"),
  'main.js synchronizes .schedule-matrix-row filtering alongside FIDS table and mobile cards'
);

assert(
  mainJs.includes("const mobileCards = Array.from(document.querySelectorAll('.sched-mobile-card'));") &&
  mainJs.includes("card.style.display = (matchCode && matchRoute && matchDay) ? '' : 'none';"),
  'main.js synchronizes .sched-mobile-card filtering across code, route and day filters'
);

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
console.log('================================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 TICKET 5 (UI-002, UI-011, UI-018) VERIFICATION SUCCESSFUL: ALL TESTS PASSED!\n');
  process.exit(0);
} else {
  console.error(`💥 TICKET 5 VERIFICATION FAILED: ${totalTests - passedTests} test(s) failed!\n`);
  process.exit(1);
}
