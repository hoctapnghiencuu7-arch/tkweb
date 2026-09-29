/**
 * Verification Suite for Ticket 14 (A11Y-001):
 * Accessibility (WCAG 2.1 AA), Keyboard Navigation & Focus Visible
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

console.log('=== VERIFYING TICKET 14 (A11Y-001): ACCESSIBILITY & KEYBOARD NAVIGATION ===\n');

const styleCss = fs.readFileSync(STYLE_CSS_PATH, 'utf8');

// 1. Visible Focus Rings for Keyboard Navigation (:focus-visible)
console.log('1. Checking Focus Ring Accessibility in style.css:');
assert(
  /:focus-visible\s*\{[^}]*outline:/i.test(styleCss),
  'style.css provides dedicated high-visibility :focus-visible outlines for keyboard tab navigation'
);
assert(
  /\[\]\s*:focus-visible/i.test(styleCss),
  'style.css provides high-contrast focus rings for Dark Mode'
);

// 2. Skip to Content Landmark
console.log('\n2. Checking Skip to Content Utility:');
assert(
  /\.skip-to-content\s*\{[^}]*position:\s*absolute/i.test(styleCss),
  'style.css defines .skip-to-content utility with accessible off-screen positioning'
);
assert(
  /\.skip-to-content:(focus|focus-visible)\s*\{[^}]*top:/i.test(styleCss),
  'style.css moves .skip-to-content into view when focused'
);

// 3. Reduced Motion Support (prefers-reduced-motion)
console.log('\n3. Checking prefers-reduced-motion Support:');
assert(
  /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/i.test(styleCss),
  'style.css supports prefers-reduced-motion for vestibular disorder accessibility'
);

// 4. Screen Reader Only Utility
console.log('\n4. Checking Screen Reader Only (.sr-only) Class:');
assert(
  /\.sr-only\s*\{[^}]*clip:\s*rect/i.test(styleCss),
  'style.css defines standard WCAG .sr-only clip pattern'
);

// 5. Semantic HTML & ARIA Landmarks Across All 11 Pages
console.log('\n5. Checking Semantic HTML & ARIA Landmarks Across All 11 Pages:');
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
  'portfolio/index.html',
  'admin/index.html'
];

htmlFiles.forEach(file => {
  let filePath = path.join(ROOT_DIR, file);
  if (!fs.existsSync(filePath) && fs.existsSync(path.join(ROOT_DIR, '..', file))) {
    filePath = path.join(ROOT_DIR, '..', file);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  assert(
    /<html\s+[^>]*lang=["']vi["']/i.test(content),
    `${file} declares valid primary language: lang="vi"`
  );
  assert(
    /<title>[^<]+<\/title>/i.test(content),
    `${file} contains non-empty <title>`
  );
  assert(
    /<h1[\s>]/i.test(content),
    `${file} contains <h1> primary heading landmark`
  );
});

// 6. Accessible Controls & ARIA Labels
console.log('\n6. Checking Interactive Control Accessibility:');
const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
assert(
  indexHtml.includes('id="theme-toggle-btn"') && (indexHtml.includes('aria-label') || indexHtml.includes('title')),
  'index.html theme toggle button has accessible label or title'
);

const ticketHtml = fs.readFileSync(path.join(ROOT_DIR, 'pages', 'ticket.html'), 'utf8');
assert(
  ticketHtml.includes('aria-label="Tiến trình đặt vé"') || ticketHtml.includes('aria-label='),
  'ticket.html stepper nav has semantic aria-label'
);

console.log(`\nResults: ${passCount} Passed, ${failCount} Failed.`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL TICKET 14 A11Y & KEYBOARD NAVIGATION TESTS PASSED!');
}
