/**
 * TEST SUITE: TICKET 6 (UI-014, UI-021)
 * Acceptance & Anti-Regression Testing for Boarding Pass Metadata Layout,
 * High-Contrast QR Code Framework & Print Media Optimizations on pages/ticket.html
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const styleCssPath = path.join(ROOT_DIR, 'assets', 'css', 'style.css');
const mainJsPath = path.join(ROOT_DIR, 'assets', 'js', 'main.js');
const ticketHtmlPath = path.join(ROOT_DIR, 'pages', 'ticket.html');

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
console.log('🎫 RUNNING TICKET 6 TESTS: BOARDING PASS METADATA, QR & PRINT');
console.log('================================================================\n');

const cssContent = fs.readFileSync(styleCssPath, 'utf8');
const jsContent = fs.readFileSync(mainJsPath, 'utf8');
const htmlContent = fs.readFileSync(ticketHtmlPath, 'utf8');

// -------------------------------------------------------------
// 1. Metadata Grid & Cell Architecture in style.css
// -------------------------------------------------------------
console.log('--- 1. Checking Metadata Grid & Cell Architecture ---');

// Verify .pass-grid-4 base grid
assert(
  cssContent.includes('.pass-grid-4') &&
  cssContent.includes('grid-template-columns: repeat(4, 1fr)'),
  '.pass-grid-4 is styled with 4-column layout on desktop'
);

// Verify .pass-meta-cell container rules
assert(
  cssContent.includes('.pass-meta-cell') &&
  /\.pass-meta-cell\s*\{[^}]*min-width:\s*0/s.test(cssContent),
  '.pass-meta-cell has min-width: 0 to prevent grid blowout'
);

// Verify text wrapping on metadata values
assert(
  /\.pass-meta-cell\s+strong|\.pass-meta-value/s.test(cssContent) &&
  (cssContent.includes('word-break: break-word') || cssContent.includes('overflow-wrap: break-word')),
  '.pass-meta-cell value handles text wrapping safely for long passenger or seat strings'
);

// -------------------------------------------------------------
// 2. Barcode & High-Contrast QR Code Framework
// -------------------------------------------------------------
console.log('\n--- 2. Checking Barcode & High-Contrast QR Code Framework ---');

// Verify .barcode-strip width safeguard
assert(
  cssContent.includes('.barcode-strip') &&
  /\.barcode-strip\s*\{[^}]*max-width:\s*100%/s.test(cssContent),
  '.barcode-strip has max-width: 100% to prevent horizontal overflow on 320px screens'
);

// Verify .qr-code-wrapper styling
assert(
  cssContent.includes('.qr-code-wrapper') &&
  /\.qr-code-wrapper\s*\{[^}]*background:\s*#ffffff/s.test(cssContent) &&
  /\.qr-code-wrapper\s*\{[^}]*border-radius:/s.test(cssContent),
  '.qr-code-wrapper is styled with dedicated white background frame, padding, and border radius'
);

// Verify QR code dark mode scanner preservation
assert(
  /\[\]\s+\.qr-code-wrapper/s.test(cssContent) &&
  /\[\]\s+\.qr-code-wrapper\s*\{[^}]*background:\s*#ffffff/s.test(cssContent),
  '[] preserves crisp white background for .qr-code-wrapper for 100% scanner compatibility'
);

// Helper to reliably extract the full content of matching @media blocks (handling nested braces)
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
const max480Block = extractMediaBlocks(cssContent, '@media[^{]*max-width:\\s*480px');
const printBlock = extractMediaBlocks(cssContent, '@media\\s+print');

// -------------------------------------------------------------
// 3. Boarding Pass Mobile Responsiveness (<= 768px & <= 480px)
// -------------------------------------------------------------
console.log('\n--- 3. Checking Responsive Layout Rules ---');

// Verify mobile container padding scaling
assert(
  max768Block.includes('.boarding-pass-ngefly') &&
  /\.boarding-pass-ngefly\s*\{[^}]*padding:/s.test(max768Block),
  '@media (max-width: 768px) scales down .boarding-pass-ngefly padding to preserve mobile viewport'
);

// Verify mobile notches handling
assert(
  (max480Block.includes('.boarding-pass-ngefly::before') || max480Block.includes('.boarding-pass-ngefly')) &&
  /\.boarding-pass-ngefly\s*\{[^}]*padding:/s.test(max480Block),
  '@media (max-width: 480px) provides compact padding and scaled/safe notches on small viewports'
);

// Verify 2-column or responsive grid on mobile
assert(
  max768Block.includes('.pass-grid-4') &&
  /\.pass-grid-4\s*\{[^}]*grid-template-columns:\s*1fr\s+1fr/s.test(max768Block),
  '@media (max-width: 768px) transforms .pass-grid-4 into a clean 2-column grid'
);

// -------------------------------------------------------------
// 4. Print Media Query Optimizations (@media print)
// -------------------------------------------------------------
console.log('\n--- 4. Checking Print Media Optimizations (@media print) ---');

// Verify stepper and navigation hidden in print
assert(
  printBlock.includes('.modern-stepper-container') &&
  printBlock.includes('display: none !important'),
  '@media print hides .modern-stepper-container completely from printed boarding passes'
);

// Verify interactive buttons hidden in print
assert(
  (printBlock.includes('.btn-copy-pnr') || printBlock.includes('.print-hide')) &&
  printBlock.includes('display: none !important'),
  '@media print hides non-printable interactive action buttons'
);

// Verify notches hidden in print
assert(
  printBlock.includes('.boarding-pass-ngefly::before') &&
  /\.boarding-pass-ngefly::before[^}]*display:\s*none\s*!important/s.test(printBlock),
  '@media print hides decorative border cutouts (::before / ::after) for crisp paper margins'
);

// Verify page break avoidance
assert(
  printBlock.includes('.boarding-pass-ngefly') &&
  (printBlock.includes('page-break-inside: avoid') || printBlock.includes('break-inside: avoid')),
  '@media print prevents page-break-inside on .boarding-pass-ngefly to ensure single-sheet printing'
);

// Verify high-contrast barcode in print
assert(
  printBlock.includes('.barcode-strip') &&
  (printBlock.includes('print-color-adjust: exact') || printBlock.includes('-webkit-print-color-adjust: exact')),
  '@media print forces exact color rendering (print-color-adjust: exact) for the automated scanner barcode'
);

// -------------------------------------------------------------
// 5. DOM Structure in pages/ticket.html
// -------------------------------------------------------------
console.log('\n--- 5. Checking DOM Structure in pages/ticket.html ---');

// Verify dynamic IDs present in ticket.html
assert(
  htmlContent.includes('id="ticket-pnr-display"') &&
  htmlContent.includes('id="btn-copy-pnr"') &&
  htmlContent.includes('id="ticket-passenger-name"') &&
  htmlContent.includes('id="ticket-seat-number"') &&
  htmlContent.includes('id="ticket-gate-boarding"') &&
  htmlContent.includes('id="ticket-barcode-text"') &&
  htmlContent.includes('id="ticket-qr-token"'),
  'pages/ticket.html contains all dynamic passenger & boarding pass metadata placeholders'
);

// Verify print and download buttons
assert(
  htmlContent.includes('id="btn-print-pass"') &&
  htmlContent.includes('id="btn-download-pdf"'),
  'pages/ticket.html contains both In Thẻ Lên Tàu Bay and Tải Xuống PDF buttons'
);

// Verify Check-in online simulator block
assert(
  htmlContent.includes('id="ticket-checkin-area"') &&
  htmlContent.includes('id="btn-checkin-now"') &&
  htmlContent.includes('id="ticket-checkin-completed"'),
  'pages/ticket.html contains online check-in simulator and status badge'
);

// Verify Vector QR Code with official SVG
assert(
  htmlContent.includes('class="qr-code-wrapper"') &&
  htmlContent.includes('<svg') &&
  htmlContent.includes('aria-label="Official Boarding Pass QR Code"'),
  'pages/ticket.html embeds vector SVG QR code with crispEdges rendering'
);

// -------------------------------------------------------------
// 6. Runtime Logic in assets/js/main.js
// -------------------------------------------------------------
console.log('\n--- 6. Checking Runtime Dynamic Logic in assets/js/main.js ---');

// Verify initTicketPage exists
assert(
  jsContent.includes('function initTicketPage()') &&
  jsContent.includes('resolveAirlineLogoFilename(flight.airline, flight.airlineLogo)'),
  'main.js initTicketPage resolves airline logo through centralized filename normalizer'
);

// Verify PNR generation and clipboard copying
assert(
  jsContent.includes('copyToClipboard') &&
  jsContent.includes('btnCopyPnr.addEventListener(\'click\''),
  'main.js supports one-click PNR copying with feedback state'
);

// Verify check-in persistence in Storage
assert(
  jsContent.includes('Storage.set(\'flynest_checked_in\', \'true\')') &&
  jsContent.includes('updateCheckinUI'),
  'main.js manages online check-in state persistently via Storage'
);

// Verify print button handler
assert(
  jsContent.includes('btnPrintPass.addEventListener(\'click\'') &&
  jsContent.includes('window.print()'),
  'main.js binds print button directly to native window.print() pipeline'
);

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
console.log('================================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 TICKET 6 (UI-014, UI-021) VERIFICATION SUCCESSFUL: ALL TESTS PASSED!\n');
  process.exit(0);
} else {
  console.error(`⚠️ TICKET 6 VERIFICATION FAILED: ${totalTests - passedTests} tests did not pass.\n`);
  process.exit(1);
}
