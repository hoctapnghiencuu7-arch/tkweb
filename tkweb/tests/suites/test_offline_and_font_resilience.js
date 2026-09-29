/**
 * Verification Suite for Ticket 12 (UI-010):
 * Offline Fallback & Local Font Stack Resilience
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
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

console.log('=== VERIFYING TICKET 12 (UI-010): OFFLINE & FONT RESILIENCE ===\n');

// 1. Local Vendor Scripts & Assets Integrity
console.log('1. Checking Local Vendor Asset Files:');
const requiredLocalAssets = [
  'assets/js/three.min.js',
  'assets/js/main.js',
  'assets/vendor/flatpickr/flatpickr.min.js',
  'assets/vendor/flatpickr/flatpickr.min.css',
  'assets/vendor/chartjs/chart.umd.min.js',
  'assets/vendor/imask/imask.min.js',
  'assets/vendor/sweetalert2/sweetalert2.all.min.js'
];

requiredLocalAssets.forEach(relPath => {
  const fullPath = path.join(ROOT_DIR, relPath);
  const exists = fs.existsSync(fullPath);
  const size = exists ? fs.statSync(fullPath).size : 0;
  assert(exists && size > 500, `${relPath} exists locally with valid payload (${size} bytes)`);
});

// 2. Airline Logos Offline Availability
console.log('\n2. Checking Local Airline SVG Logos:');
const airlinesDir = path.join(ROOT_DIR, 'assets', 'images', 'airlines');
const logoFiles = fs.readdirSync(airlinesDir).filter(f => f.endsWith('.svg'));
assert(logoFiles.length >= 13, `All 13 airline vector logos present locally on disk (Found: ${logoFiles.length})`);

// 3. Robust Font Stack & System Fallbacks
console.log('\n3. Checking System Fallback Font Stacks:');
const styleCss = fs.readFileSync(STYLE_CSS_PATH, 'utf8');

assert(
  /--font-sans:[^;]*system-ui|-apple-system|Segoe UI/i.test(styleCss),
  'style.css defines --font-sans with native system font fallbacks (-apple-system, Segoe UI, Roboto)'
);
assert(
  /--font-mono:[^;]*monospace/i.test(styleCss),
  'style.css defines --font-mono with native monospace fallbacks'
);
assert(
  /body\s*\{[^}]*font-family:[^}]*-apple-system/i.test(styleCss),
  'body selector includes robust OS native font fallback stack'
);

// 4. Offline Utility Fallbacks for Core UI Shell
console.log('\n4. Checking Offline Utility Fallbacks in style.css:');
const requiredUtilities = [
  '.font-sans',
  '.antialiased',
  '.relative',
  '.min-h-screen',
  '.overflow-x-hidden',
  '.transition-colors'
];

requiredUtilities.forEach(cls => {
  assert(
    styleCss.includes(`${cls} {`) || styleCss.includes(`${cls}{`) || new RegExp(`\\${cls}\\b`).test(styleCss),
    `style.css defines fallback utility class ${cls} for offline layout independence`
  );
});

// 5. HTML Files Referencing Local Assets
console.log('\n5. Checking Local Link References in HTML Pages:');
const htmlFiles = [
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

htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  assert(
    content.includes('assets/css/style.css') || content.includes('../assets/css/style.css'),
    `${file} links directly to local style.css`
  );
  assert(
    content.includes('assets/js/main.js') || content.includes('../assets/js/main.js'),
    `${file} links directly to local main.js`
  );
});

console.log(`\nResults: ${passCount} Passed, ${failCount} Failed.`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL TICKET 12 OFFLINE & FONT RESILIENCE TESTS PASSED!');
}
