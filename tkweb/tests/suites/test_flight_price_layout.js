/**
 * TEST SUITE: TICKET 4 (UI-023, UI-033)
 * Acceptance & Anti-Regression Testing for Flight Price Layout, Headroom & Card Rhythm
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const styleCssPath = path.join(ROOT_DIR, 'assets', 'css', 'style.css');
const mainJsPath = path.join(ROOT_DIR, 'assets', 'js', 'main.js');
const flightsHtmlPath = path.join(ROOT_DIR, 'pages', 'flights.html');

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

console.log('========================================================');
console.log('✈️  RUNNING TICKET 4 TESTS: FLIGHT PRICE LAYOUT & CARD RHYTHM');
console.log('========================================================\n');

// -------------------------------------------------------------
// 1. CSS Headroom & Layout for .price-action-block
// -------------------------------------------------------------
console.log('--- 1. Checking CSS Headroom & Positioning in style.css ---');
const cssContent = fs.readFileSync(styleCssPath, 'utf8');

// Verify .price-action-block styling on desktop
assert(
  cssContent.includes('.price-action-block') &&
  cssContent.includes('width: max-content') &&
  cssContent.includes('padding-top: 1.15rem') &&
  cssContent.includes('position: relative'),
  '.price-action-block has adequate headroom (padding-top: 1.15rem), width: max-content, and position: relative'
);

// Verify justify-content: center in .price-action-block
assert(
  /\.price-action-block\s*\{[^}]*justify-content:\s*center/s.test(cssContent),
  '.price-action-block centers elements vertically using justify-content: center'
);

// -------------------------------------------------------------
// 2. Scarcity Ribbon Positioning & Conflict Avoidance
// -------------------------------------------------------------
console.log('\n--- 2. Checking Scarcity Ribbon Positioning & Collision Avoidance ---');

assert(
  /\.card-scarcity-ribbon\s*\{[^}]*position:\s*absolute/s.test(cssContent) &&
  /\.card-scarcity-ribbon\s*\{[^}]*top:\s*0\.85rem/s.test(cssContent) &&
  /\.card-scarcity-ribbon\s*\{[^}]*right:\s*1\.5rem/s.test(cssContent),
  '.card-scarcity-ribbon positioned with absolute coordinates (top: 0.85rem; right: 1.5rem)'
);

assert(
  /\.card-scarcity-ribbon\s*\{[^}]*pointer-events:\s*none/s.test(cssContent),
  '.card-scarcity-ribbon has pointer-events: none to avoid blocking underlying clicks'
);

assert(
  cssContent.includes('.is-schedule-mode .card-scarcity-ribbon') &&
  cssContent.includes('display: none !important'),
  '.card-scarcity-ribbon automatically hidden in schedule mode to prevent FIDS conflict'
);

// -------------------------------------------------------------
// 3. Best Deal Card Margin Clearance
// -------------------------------------------------------------
console.log('\n--- 3. Checking Best Deal Card Margin Clearance ---');

assert(
  /\.flight-card-ngefly\.best-deal-card\s*\{[^}]*margin-top:\s*0\.85rem/s.test(cssContent),
  '.flight-card-ngefly.best-deal-card has margin-top: 0.85rem headroom for .best-deal-top-badge'
);

assert(
  /\.best-deal-top-badge\s*\{[^}]*position:\s*absolute/s.test(cssContent) &&
  /\.best-deal-top-badge\s*\{[^}]*top:\s*-12px/s.test(cssContent),
  '.best-deal-top-badge is positioned at top: -12px above card boundary'
);

// -------------------------------------------------------------
// 4. Responsive Rules in @media (max-width: 1024px)
// -------------------------------------------------------------
console.log('\n--- 4. Checking Tablet/Mobile Responsive Rules (@media <= 1024px) ---');

// Extract @media (max-width: 1024px) block
const media1024Match = cssContent.match(/@media\s*\(\s*max-width\s*:\s*1024px\s*\)\s*\{([\s\S]*?)(?=@media|\/\*\s*===|$)/);
const media1024Content = media1024Match ? media1024Match[1] : '';

assert(
  media1024Content.includes('.price-action-block') &&
  media1024Content.includes('flex-direction: row') &&
  media1024Content.includes('justify-content: space-between') &&
  media1024Content.includes('align-items: center'),
  '@media (max-width: 1024px) switches .price-action-block to horizontal bar (flex-direction: row; space-between; align-items: center)'
);

assert(
  media1024Content.includes('.card-price-container') &&
  media1024Content.includes('align-items: flex-start') &&
  media1024Content.includes('text-align: left'),
  '@media (max-width: 1024px) aligns .card-price-container to the left (align-items: flex-start; text-align: left)'
);

assert(
  media1024Content.includes('.btn-view-details') &&
  media1024Content.includes('min-width: 140px'),
  '@media (max-width: 1024px) guarantees .btn-view-details has min-width: 140px'
);

// -------------------------------------------------------------
// 5. Static Structure Verification in pages/flights.html
// -------------------------------------------------------------
console.log('\n--- 5. Checking Flight Card DOM Structure in pages/flights.html ---');
const flightsHtml = fs.readFileSync(flightsHtmlPath, 'utf8');

// Count flight cards
const cardCount = (flightsHtml.match(/class="[^"]*flight-card-ngefly[^"]*"/g) || []).length;
assert(cardCount === 10, `pages/flights.html contains exactly 10 flight cards (found: ${cardCount})`);

// Check price-action-block count
const priceBlockCount = (flightsHtml.match(/class="[^"]*price-action-block[^"]*"/g) || []).length;
assert(priceBlockCount === 10, `pages/flights.html has .price-action-block in every card (found: ${priceBlockCount})`);

// Check best deal badge
assert(
  flightsHtml.includes('class="best-deal-top-badge"'),
  'pages/flights.html contains .best-deal-top-badge for flagship deal card'
);

// Check scarcity ribbon existence
const ribbonCount = (flightsHtml.match(/class="[^"]*card-scarcity-ribbon[^"]*"/g) || []).length;
assert(ribbonCount >= 2, `pages/flights.html contains marketing scarcity ribbons (found: ${ribbonCount})`);

// -------------------------------------------------------------
// 6. Runtime Logic & FIDS Mutual Exclusion in assets/js/main.js
// -------------------------------------------------------------
console.log('\n--- 6. Checking Runtime Dynamic Logic in assets/js/main.js ---');
const mainJs = fs.readFileSync(mainJsPath, 'utf8');

// Check that schedule mode explicitly hides card-scarcity-ribbon
assert(
  mainJs.includes("const scarcityRibbon = card.querySelector('.card-scarcity-ribbon');") &&
  mainJs.includes("if (scarcityRibbon) scarcityRibbon.style.display = 'none';"),
  'main.js explicitly hides .card-scarcity-ribbon in Schedule view to prevent overlap'
);

// Check that regular mode restores card-scarcity-ribbon
assert(
  mainJs.includes("if (scarcityRibbon) scarcityRibbon.style.display = '';"),
  'main.js restores .card-scarcity-ribbon display in normal flight search view'
);

// Check FIDS status badge injection into price-action-block
assert(
  mainJs.includes("priceBlock.insertBefore(fidsBadge, priceBlock.firstChild);"),
  'main.js inserts .fids-status-badge cleanly into .price-action-block as first child'
);

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n========================================================');
console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
console.log('========================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 TICKET 4 (UI-023/UI-033) VERIFICATION SUCCESSFUL: ALL TESTS PASSED!\n');
  process.exit(0);
} else {
  console.error(`💥 TICKET 4 VERIFICATION FAILED: ${totalTests - passedTests} test(s) failed!\n`);
  process.exit(1);
}
