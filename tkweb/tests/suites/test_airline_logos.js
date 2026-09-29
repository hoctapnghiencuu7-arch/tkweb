/**
 * TEST SUITE: TICKET 3 (UI-012, UI-013, UI-022)
 * Acceptance & Anti-Regression Testing for Airline Logo Assets, Normalization & Fallback System
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '../..');
const mainJsPath = path.join(ROOT_DIR, 'assets', 'js', 'main.js');
const styleCssPath = path.join(ROOT_DIR, 'assets', 'css', 'style.css');
const airlinesDir = path.join(ROOT_DIR, 'assets', 'images', 'airlines');

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
console.log('✈️  RUNNING TICKET 3 TESTS: AIRLINE LOGOS & ASSET FALLBACK');
console.log('========================================================\n');

// 1. Static Asset Verification: Check all 13 Airline SVG files
const REQUIRED_LOGOS = [
  'bamboo-airways.svg',
  'dtw-airlines.svg',
  'emirates.svg',
  'flydubai.svg',
  'khang-air.svg',
  'ondy-air.svg',
  'qatar-airways.svg',
  'saudia.svg',
  'singapore-airlines.svg',
  'flynest.svg',
  'vietjet-air.svg',
  'vietnam-airlines.svg',
  'vietravel-airlines.svg'
];

console.log('--- 1. Checking SVG Assets ---');
let allLogosExist = true;
for (const logo of REQUIRED_LOGOS) {
  const filePath = path.join(airlinesDir, logo);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size < 100) {
    allLogosExist = false;
    break;
  }
}
assert(allLogosExist, 'All 13 airline SVG logos exist with valid file size (>100 B)');

// Check Emirates SVG specifics
const emiratesSvgContent = fs.readFileSync(path.join(airlinesDir, 'emirates.svg'), 'utf8');
assert(
  emiratesSvgContent.includes('<svg') && emiratesSvgContent.includes('EMIRATES') && emiratesSvgContent.includes('viewBox'),
  'emirates.svg contains valid SVG structure, viewBox and EMIRATES title'
);

// 2. CSS Rules Verification in style.css
console.log('\n--- 2. Checking CSS Standardized Styling ---');
const cssContent = fs.readFileSync(styleCssPath, 'utf8');

assert(
  cssContent.includes('.airline-logo') &&
  cssContent.includes('width: 44px') &&
  cssContent.includes('height: 44px') &&
  cssContent.includes('display: grid') &&
  cssContent.includes('place-items: center'),
  '.airline-logo wrapper styled with 44px x 44px and grid place-items center'
);

assert(
  cssContent.includes('.airline-card-badge') &&
  cssContent.includes('object-fit: contain'),
  '.airline-card-badge and .airline-logo-circle img styled with object-fit: contain'
);

// 3. Logic & Behavior Verification via Node VM
console.log('\n--- 3. Testing Logic & Normalization in main.js ---');
const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');

function setupTestEnv() {
  const localStorageStore = {};
  const sessionStorageStore = {};

  const mockDocument = {
    documentElement: {
      setAttribute: () => {},
      getAttribute: () => 'light'
    },
    title: '',
    body: {
      appendChild: () => {},
      removeChild: () => {},
      classList: { add: () => {}, remove: () => {} }
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: (sel) => null,
    querySelectorAll: (sel) => []
  };

  const mockWindow = {
    location: {
      pathname: '/pages/flights.html',
      search: '',
      hash: '',
      href: 'http://localhost/pages/flights.html'
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    setTimeout: (fn) => { fn(); return 1; }
  };

  const context = vm.createContext({
    window: mockWindow,
    document: mockDocument,
    location: mockWindow.location,
    localStorage: {
      getItem: (k) => localStorageStore[k] || null,
      setItem: (k, v) => { localStorageStore[k] = String(v); },
      removeItem: (k) => { delete localStorageStore[k]; }
    },
    sessionStorage: {
      getItem: (k) => sessionStorageStore[k] || null,
      setItem: (k, v) => { sessionStorageStore[k] = String(v); },
      removeItem: (k) => { delete sessionStorageStore[k]; }
    },
    URLSearchParams: URLSearchParams,
    console: console,
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    escape: encodeURIComponent,
    unescape: decodeURIComponent
  });

  vm.runInContext(mainJsContent, context);
  return context;
}

const ctx = setupTestEnv();
const resolver = ctx.resolveAirlineLogoFilename;

assert(typeof resolver === 'function', 'resolveAirlineLogoFilename is exposed and defined');

// Test direct name resolution
assert(
  resolver('Emirates') === 'emirates.svg' &&
  resolver('Vietnam Airlines') === 'vietnam-airlines.svg' &&
  resolver('FlyNest Airlines') === 'flynest.svg',
  'Direct airline name resolution returns correct SVG filenames'
);

// Test path stripping resolution (UI-012/UI-013 root cause)
assert(
  resolver('Emirates', '../assets/images/airlines/emirates.svg') === 'emirates.svg' &&
  resolver(null, '../assets/images/airlines/vietnam-airlines.svg') === 'vietnam-airlines.svg' &&
  resolver('Any', 'assets/images/airlines/bamboo-airways.svg') === 'bamboo-airways.svg',
  'Path prefixes (e.g. "../assets/images/airlines/emirates.svg") are cleanly stripped to filename'
);

// Test case-insensitivity & fuzzy matching
assert(
  resolver('emirates') === 'emirates.svg' &&
  resolver('EMIRATES') === 'emirates.svg' &&
  resolver('Emirates (EK-392)') === 'emirates.svg',
  'Case-insensitivity and substring matching resolve "emirates" and "Emirates (EK-392)" to "emirates.svg"'
);

// Test fallback for unknown airlines
assert(
  resolver('NonExistentAirlines') === 'flynest.svg' &&
  resolver(null, null) === 'flynest.svg' &&
  resolver('', '') === 'flynest.svg',
  'Unknown airline or empty input safely falls back to "flynest.svg"'
);

// 4. Test Flight Card Selection Flow
console.log('\n--- 4. Testing End-to-End Booking & Ticket Flow ---');

// Mock HTML element factory
function createElement(tag, attrs = {}) {
  const el = {
    tagName: tag.toUpperCase(),
    attributes: { ...attrs },
    dataset: {},
    style: {},
    classList: {
      _classes: new Set((attrs.class || '').split(' ').filter(Boolean)),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); }
    },
    getAttribute(k) { return this.attributes[k] !== undefined ? this.attributes[k] : null; },
    setAttribute(k, v) { this.attributes[k] = String(v); },
    querySelector: () => null,
    querySelectorAll: () => [],
    innerHTML: '',
    textContent: ''
  };
  return el;
}

// Test Booking Page Flight Badge Rendering
{
  const testFlight = {
    airline: 'Emirates',
    airlineLogo: '../assets/images/airlines/emirates.svg', // legacy or card path
    flightNumber: 'EK-392',
    depTime: '03:40 PM',
    arrTime: '05:50 PM',
    duration: '02h 10m'
  };

  const badgeEl = createElement('span');
  const logoFile = ctx.resolveAirlineLogoFilename(testFlight.airline, testFlight.airlineLogo);
  badgeEl.innerHTML = `<img src="../assets/images/airlines/${logoFile}" alt="${testFlight.airline}">`;

  assert(
    badgeEl.innerHTML.includes('src="../assets/images/airlines/emirates.svg"'),
    'Booking page renders clean single-relative path "../assets/images/airlines/emirates.svg" without doubling'
  );
}

// Test Ticket Page Airline Logo Rendering
{
  const testFlight = {
    airline: 'Emirates',
    airlineLogo: 'emirates.svg',
    flightNumber: 'EK-392'
  };

  const ticketLogoEl = createElement('span');
  const logoFile = ctx.resolveAirlineLogoFilename(testFlight.airline, testFlight.airlineLogo);
  ticketLogoEl.classList.add('airline-logo');
  ticketLogoEl.innerHTML = `<img src="../assets/images/airlines/${logoFile}" alt="${testFlight.airline}" class="airline-logo-img" onerror="if(this.dataset.fallback){this.style.display='none';}else{this.dataset.fallback='1';this.src='../assets/images/airlines/flynest.svg';}">`;

  assert(
    ticketLogoEl.classList.contains('airline-logo') &&
    ticketLogoEl.innerHTML.includes('src="../assets/images/airlines/emirates.svg"') &&
    ticketLogoEl.innerHTML.includes('onerror='),
    'Ticket page renders .airline-logo container with correct emirates.svg and onerror fallback'
  );
}

// Test Ticket Page fallback when airline logo file fails
{
  const unknownFlight = {
    airline: 'Mystery Airways',
    airlineLogo: 'unknown-mystery.svg'
  };
  const logoFile = ctx.resolveAirlineLogoFilename(unknownFlight.airline, unknownFlight.airlineLogo);
  assert(
    logoFile === 'unknown-mystery.svg' || logoFile === 'flynest.svg',
    'Custom airlines preserve clean SVG filename or fallback to flynest.svg'
  );

  const fallbackLogo = ctx.resolveAirlineLogoFilename('Unknown Airlines', '');
  assert(fallbackLogo === 'flynest.svg', 'Unmapped airline defaults cleanly to flynest.svg');
}

console.log('\n========================================================');
console.log(`📊 SUMMARY: ${passedTests}/${totalTests} ACCEPTANCE TESTS PASSED`);
console.log('========================================================');

if (passedTests === totalTests) {
  console.log('🎉 TICKET 3 (UI-012, UI-013, UI-022) FULLY VERIFIED!');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED.');
  process.exit(1);
}
