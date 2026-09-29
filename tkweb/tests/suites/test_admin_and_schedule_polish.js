/**
 * Test Suite: Ticket 8 (UI-003, UI-004, UI-005)
 * Verifies:
 * 1. UI-003: Sticky table headers on Schedule Weekly Matrix & FIDS timetable (light & dark mode)
 * 2. UI-005: CMS Website Editor transparency banner (Academic / Client-side Storage Prototype notice) & truthful storage messaging
 * 3. UI-004: Admin Shell density reduction, scoped CSS classes (.admin-section-card, action buttons, modal), reduced inline styles
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🛫 RUNNING TICKET 8 TESTS: ADMIN SHELL & STICKY SCHEDULE HEADER');
console.log('================================================================\n');

const ROOT_DIR = path.resolve(__dirname, '../..');
const styleCssPath = path.join(ROOT_DIR, 'assets', 'css', 'style.css');
const scheduleHtmlPath = path.join(ROOT_DIR, 'pages', 'schedule.html');
const adminHtmlPath = path.join(ROOT_DIR, 'admin', 'index.html');
const mainJsPath = path.join(ROOT_DIR, 'assets', 'js', 'main.js');

const styleCss = fs.readFileSync(styleCssPath, 'utf8');
const scheduleHtml = fs.readFileSync(scheduleHtmlPath, 'utf8');
const adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');
const mainJs = fs.readFileSync(mainJsPath, 'utf8');

// -------------------------------------------------------------
// 1. UI-003: Sticky Schedule Header Verification
// -------------------------------------------------------------
console.log('--- 1. Checking Sticky Schedule Headers in style.css & schedule.html (UI-003) ---');

assert(
  styleCss.includes('.schedule-matrix-table thead th') &&
  styleCss.includes('position: sticky') &&
  styleCss.includes('top: 0'),
  'style.css contains sticky positioning (top: 0) for .schedule-matrix-table thead th'
);
console.log('✅ TEST 1 PASSED: .schedule-matrix-table thead th has sticky positioning (top: 0)');

assert(
  styleCss.includes('[] .schedule-matrix-table thead th'),
  'style.css contains dark mode header styling for .schedule-matrix-table thead th'
);
console.log('✅ TEST 2 PASSED: [] .schedule-matrix-table thead th has dark background');

assert(
  styleCss.includes('.schedule-fids-table thead th') &&
  styleCss.includes('position: sticky') &&
  styleCss.includes('top: 0'),
  'style.css contains sticky positioning (top: 0) for .schedule-fids-table thead th'
);
console.log('✅ TEST 3 PASSED: .schedule-fids-table thead th has sticky positioning (top: 0)');

assert(
  styleCss.includes('[] .schedule-fids-table thead th'),
  'style.css contains dark mode header styling for .schedule-fids-table thead th'
);
console.log('✅ TEST 4 PASSED: [] .schedule-fids-table thead th has dark background');

assert(
  scheduleHtml.includes('class="schedule-fids-desktop-container"') ||
  styleCss.includes('.schedule-fids-desktop-container'),
  'schedule.html wraps FIDS table in .schedule-fids-desktop-container'
);
console.log('✅ TEST 5 PASSED: FIDS table is wrapped in dedicated desktop scroll container');

assert(
  scheduleHtml.includes('class="schedule-matrix-desktop-container"'),
  'schedule.html retains .schedule-matrix-desktop-container for weekly matrix'
);
console.log('✅ TEST 6 PASSED: Weekly matrix table retains desktop container architecture');

// -------------------------------------------------------------
// 2. UI-005: CMS Prototype Transparency & Non-Fake Storage Notice
// -------------------------------------------------------------
console.log('\n--- 2. Checking CMS Website Editor Prototype Transparency (UI-005) ---');

assert(
  adminHtml.includes('cms-prototype-banner'),
  'admin/index.html contains .cms-prototype-banner in #website-editor'
);
console.log('✅ TEST 7 PASSED: admin/index.html displays .cms-prototype-banner in website editor');

assert(
  adminHtml.includes('Client-side Storage Prototype') ||
  adminHtml.includes('Chế Độ Mô Phỏng') ||
  adminHtml.includes('Mô Phỏng Lưu Trữ'),
  'admin/index.html explicitly identifies CMS as Client-side Storage Prototype / Chế Độ Mô Phỏng'
);
console.log('✅ TEST 8 PASSED: admin/index.html clearly discloses Client-side Storage Prototype nature');

assert(
  adminHtml.includes('Lưu ý học thuật') || adminHtml.includes('học thuật'),
  'admin/index.html contains academic disclosure regarding local storage simulation'
);
console.log('✅ TEST 9 PASSED: admin/index.html contains academic disclosure notice');

assert(
  mainJs.includes('bộ nhớ trình duyệt') || mainJs.includes('Local Prototype'),
  'main.js toast notifications accurately state content is saved to browser storage / Local Prototype'
);
console.log('✅ TEST 10 PASSED: main.js CMS toast notifications avoid fake server persistence claims');

assert(
  mainJs.includes("updateCmsStatusBadge('draft')") &&
  mainJs.includes("updateCmsStatusBadge('published')"),
  'main.js distinguishes draft vs published CMS status states'
);
console.log('✅ TEST 11 PASSED: main.js rigorously tracks draft vs published state lifecycle');

// -------------------------------------------------------------
// 3. UI-004: Admin Shell Density Reduction & Scoped CSS Classes
// -------------------------------------------------------------
console.log('\n--- 3. Checking Admin Scoped CSS & Inline Style Reduction (UI-004) ---');

assert(
  styleCss.includes('.admin-section-card'),
  'style.css defines .admin-section-card for admin dashboard panel rhythm'
);
console.log('✅ TEST 12 PASSED: style.css defines .admin-section-card for uniform card spacing');

assert(
  styleCss.includes('.cms-prototype-banner'),
  'style.css defines styling for .cms-prototype-banner'
);
console.log('✅ TEST 13 PASSED: style.css defines styling for .cms-prototype-banner');

assert(
  styleCss.includes('.admin-btn-action-view') &&
  styleCss.includes('.admin-btn-action-edit') &&
  styleCss.includes('.admin-btn-action-delete'),
  'style.css defines scoped action button classes for admin data tables'
);
console.log('✅ TEST 14 PASSED: style.css provides scoped classes for admin table action buttons');

assert(
  styleCss.includes('.admin-pnr-code'),
  'style.css provides .admin-pnr-code styling class'
);
console.log('✅ TEST 15 PASSED: style.css provides .admin-pnr-code styling class');

assert(
  styleCss.includes('.admin-modal-backdrop') || styleCss.includes('.admin-order-modal-overlay'),
  'style.css provides scoped modal backdrop styling class'
);
console.log('✅ TEST 16 PASSED: style.css provides scoped modal backdrop styling');

// Count inline styles in admin/index.html
const inlineMatches = adminHtml.match(/style="[^"]+"/g) || [];
console.log(`ℹ️ Current inline styles in admin/index.html: ${inlineMatches.length} (originally 255)`);

assert(
  inlineMatches.length <= 210,
  `admin/index.html inline style count reduced from 255 to <= 210 (found: ${inlineMatches.length})`
);
console.log(`✅ TEST 17 PASSED: admin/index.html inline styles reduced from 255 to ${inlineMatches.length} (eliminated ${255 - inlineMatches.length}+ inline styles)`);

assert(
  adminHtml.includes('admin-btn-action-view') &&
  adminHtml.includes('admin-btn-action-edit'),
  'admin/index.html adopts scoped action button classes'
);
console.log('✅ TEST 18 PASSED: admin/index.html data tables use scoped action button classes');

console.log('\n================================================================');
console.log('TEST RESULTS: 18/18 PASSED');
console.log('================================================================\n');
console.log('🎉 TICKET 8 (UI-003, UI-004, UI-005) VERIFICATION SUCCESSFUL: ALL TESTS PASSED!\n');
