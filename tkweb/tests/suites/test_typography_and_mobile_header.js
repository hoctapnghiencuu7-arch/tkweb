/**
 * TEST SUITE: TICKET 7 (UI-006, UI-001)
 * Acceptance & Anti-Regression Testing for Typography Stack Standardization (UI-006)
 * and Lean Mobile Header Ergonomics with Drawer Migration (UI-001)
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const styleCssPath = path.join(ROOT_DIR, 'assets', 'css', 'style.css');
const mainJsPath = path.join(ROOT_DIR, 'assets', 'js', 'main.js');

const targetHtmlFiles = [
  'index.html',
  'pages/flights.html',
  'pages/booking.html',
  'pages/seats.html',
  'pages/payment.html',
  'pages/ticket.html',
  'pages/schedule.html',
  'pages/login.html',
  'pages/register.html',
  'admin/index.html'
];

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
console.log('🔤 RUNNING TICKET 7 TESTS: TYPOGRAPHY STACK & MOBILE HEADER');
console.log('================================================================\n');

const cssContent = fs.readFileSync(styleCssPath, 'utf8');
const jsContent = fs.readFileSync(mainJsPath, 'utf8');

// Helper to reliably extract media blocks
function extractMediaBlocks(css, mediaHeaderPattern) {
  const blocks = [];
  const regex = new RegExp(mediaHeaderPattern, 'gi');
  let match;
  while ((match = regex.exec(css)) !== null) {
    const startIndex = match.index;
    const openBrace = css.indexOf('{', startIndex);
    if (openBrace === -1) continue;
    let depth = 1;
    let i = openBrace + 1;
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      i++;
    }
    blocks.push(css.substring(openBrace + 1, i - 1));
  }
  return blocks.join('\n');
}

const max768Block = extractMediaBlocks(cssContent, '@media[^{]*max-width:\\s*768px');

// -------------------------------------------------------------
// 1. Checking HTML Typography Links across all 10 Main Pages (UI-006)
// -------------------------------------------------------------
console.log('--- 1. Checking Standardized Font Links in HTML Files (UI-006) ---');

targetHtmlFiles.forEach(fileRel => {
  const filePath = path.join(ROOT_DIR, fileRel);
  const content = fs.readFileSync(filePath, 'utf8');

  // Verify Plus Jakarta Sans is linked in <head>
  assert(
    content.includes('Plus+Jakarta+Sans') || content.includes('Plus%20Jakarta%20Sans'),
    `${fileRel} links Plus Jakarta Sans font in <head>`
  );

  // Verify preconnect tags exist
  assert(
    content.includes('href="https://fonts.googleapis.com"') &&
    content.includes('href="https://fonts.gstatic.com"'),
    `${fileRel} has font preconnect resource hints`
  );
});

// -------------------------------------------------------------
// 2. Checking CSS Typography Stack (UI-006)
// -------------------------------------------------------------
console.log('\n--- 2. Checking Centralized CSS Typography Stack (UI-006) ---');

// Verify @import of Plus Jakarta Sans at style.css top
assert(
  cssContent.includes('@import') &&
  cssContent.includes('Plus+Jakarta+Sans'),
  'style.css imports Plus Jakarta Sans at the top of the stylesheet'
);

// Verify body font-family starts with 'Plus Jakarta Sans'
assert(
  /body\s*\{[^}]*font-family:\s*['"]Plus Jakarta Sans['"]/s.test(cssContent),
  'body default font-family prioritizes Plus Jakarta Sans with standard system fallback'
);

// Verify elimination of isolated 'Be Vietnam Pro' !important overrides
assert(
  !cssContent.includes("'Be Vietnam Pro', 'Plus Jakarta Sans', sans-serif !important"),
  'Eliminated isolated "Be Vietnam Pro" font overrides in favor of unified Plus Jakarta Sans typography'
);

// -------------------------------------------------------------
// 3. Checking Mobile Header Ergonomics in style.css (UI-001)
// -------------------------------------------------------------
console.log('\n--- 3. Checking Mobile Header Ergonomics (UI-001) ---');

// Verify .btn-signin is hidden on mobile header
assert(
  max768Block.includes('.btn-signin') &&
  /\.btn-signin[^}]*display:\s*none\s*!important/s.test(max768Block),
  '@media (max-width: 768px) hides desktop .btn-signin from mobile header'
);

// Verify .btn-signup-pill is hidden on mobile header
assert(
  max768Block.includes('.btn-signup-pill') &&
  /\.btn-signup-pill[^}]*display:\s*none\s*!important/s.test(max768Block),
  '@media (max-width: 768px) hides desktop .btn-signup-pill from mobile header'
);

// Verify .btn-nav-search is hidden on mobile header
assert(
  max768Block.includes('.btn-nav-search') &&
  /\.btn-nav-search[^}]*display:\s*none\s*!important/s.test(max768Block),
  '@media (max-width: 768px) hides desktop .btn-nav-search from mobile header'
);

// Verify .mobile-nav-toggle is activated on mobile
assert(
  max768Block.includes('.mobile-nav-toggle') &&
  /\.mobile-nav-toggle\s*\{[^}]*display:\s*flex/s.test(max768Block),
  '@media (max-width: 768px) displays mobile hamburger toggle button'
);

// Verify .header-right gap scaling on mobile
assert(
  max768Block.includes('.header-right') &&
  /\.header-right\s*\{[^}]*gap:/s.test(max768Block),
  '@media (max-width: 768px) scales down .header-right gap to prevent mobile navbar overcrowding'
);

// -------------------------------------------------------------
// 4. Checking Mobile Drawer Capabilities in assets/js/main.js (UI-001)
// -------------------------------------------------------------
console.log('\n--- 4. Checking Mobile Drawer Capabilities in main.js (UI-001) ---');

// Verify drawer has search link
assert(
  jsContent.includes('drawer.innerHTML') &&
  jsContent.includes('flights.html') &&
  (jsContent.includes('Tìm Kiếm') || jsContent.includes('flights.html')),
  'Mobile drawer provides flight search access for mobile visitors'
);

// Verify drawer has authentication links (Đăng Nhập & Đăng Ký)
assert(
  jsContent.includes('login.html') &&
  jsContent.includes('register.html') &&
  jsContent.includes('drawer-footer'),
  'Mobile drawer provides clear Sign In and Sign Up actions in drawer footer'
);

// Verify accessibility & keyboard trap handling
assert(
  jsContent.includes("key === 'Escape'") &&
  jsContent.includes('closeDrawer'),
  'Mobile drawer supports Escape key to close for WCAG accessibility'
);

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
console.log('================================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 TICKET 7 (UI-006, UI-001) VERIFICATION SUCCESSFUL: ALL TESTS PASSED!\n');
  process.exit(0);
} else {
  console.error(`⚠️ TICKET 7 VERIFICATION FAILED: ${totalTests - passedTests} tests did not pass.\n`);
  process.exit(1);
}
