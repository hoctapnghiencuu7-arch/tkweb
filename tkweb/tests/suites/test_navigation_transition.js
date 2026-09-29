/**
 * ACCEPTANCE TEST SUITE: TICKET 2 (UI-037)
 * Purpose: Verify global internal navigation transition unification, single pipeline controller,
 * elimination of duplicate click handlers, pre-navigation admin authorization guard, and back/forward restoration.
 * 
 * Acceptance Tests:
 * TEST 1: Confirm absence of inHeader bypass in main.js click listeners.
 * TEST 2: Confirm single global click listener for navigation (no competing handler in initThreeJSRunway).
 * TEST 3: Confirm presence of double-trigger protection guarding against rapid clicks.
 * TEST 4: Click "Trang Chủ" in Header on Homepage triggers airplane takeoff sequence.
 * TEST 5: All primary inner Header links (Chuyến Bay, Lịch Trình, Đặt Chỗ, Vé Của Bạn) trigger takeoff properly.
 * TEST 6: CTA Search button and Header links use the SAME unified navigation pipeline.
 * TEST 7: Pre-navigation Admin guard blocks unauthenticated visitor and redirects to login with redirect=admin.
 * TEST 8: Authenticated admin session allowed into admin via transition pipeline.
 * TEST 9: Double-click during takeoff does not trigger duplicate takeoff calls.
 * TEST 10: Exception links (hash, target=_blank, download, external, mailto, tel) are not intercepted.
 * TEST 11: Browser back/forward (pageshow) resets transition state cleanly.
 */

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const mainJsPath = path.resolve(__dirname, '../../assets/js/main.js');
const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');

console.log('========================================================');
console.log('✈️  RUNNING NAVIGATION TRANSITION TESTS: TICKET 2 (UI-037)');
console.log('========================================================\n');

let passedTests = 0;
let totalTests = 11;

function assert(condition, testName, detail = '') {
  if (condition) {
    console.log(`✅ ${testName} PASSED`);
    passedTests++;
  } else {
    console.error(`❌ ${testName} FAILED`);
    if (detail) console.error(`   Details: ${detail}`);
  }
}

// ----------------------------------------------------
// 1. Static Source Code Checks
// ----------------------------------------------------
console.log('--- Static Code Verification ---');

// TEST 1: inHeader bypass check
const hasInHeaderBypass = /if\s*\(\s*(!link\s*\|\|\s*inHeader|inHeader)\s*\)\s*return/.test(mainJsContent);
assert(!hasInHeaderBypass, 'TEST 1: Confirmed absence of inHeader bypass in main.js click listeners');

// TEST 2: Single global navigation listener (no competing click handler in initThreeJSRunway)
const runwayStart = mainJsContent.indexOf('function initThreeJSRunway()');
const runwayEnd = mainJsContent.indexOf('function initAudioSynthesis()');
const runwayBody = runwayStart !== -1 && runwayEnd !== -1 ? mainJsContent.slice(runwayStart, runwayEnd) : '';
const hasRunwayClickHandler = runwayBody.includes("addEventListener('click'") || runwayBody.includes('addEventListener("click"');
assert(!hasRunwayClickHandler, 'TEST 2: Confirmed single global click listener (no competing handler in initThreeJSRunway)');

// TEST 3: Double-trigger guard check
const hasDoubleTriggerGuard = /window\.__isTakingOff\s*\|\|\s*window\.__navigating/.test(mainJsContent);
assert(hasDoubleTriggerGuard, 'TEST 3: Confirmed presence of double-trigger protection');

// ----------------------------------------------------
// 2. Behavioral Execution Environment (node:vm)
// ----------------------------------------------------
console.log('\n--- Behavioral Execution Verification ---');

function createNavigationContext(options = {}) {
  const clickListeners = [];
  const domLoadedListeners = [];
  const pageshowListeners = [];
  let navigatedTo = null;
  const takeoffCalls = [];
  let toastMessage = null;

  const mockLocation = {
    pathname: options.pathname || '/index.html',
    search: options.search || '',
    hash: options.hash || '',
    get href() { return this.pathname + this.search + this.hash; },
    set href(val) { navigatedTo = val; }
  };

  const elementsById = {};

  function makeMockElement(tag = 'div') {
    return {
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      style: {},
      appendChild: () => {},
      removeChild: () => {},
      remove: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      }
    };
  }

  const mockDocument = {
    documentElement: {
      getAttribute: () => 'light',
      setAttribute: () => {}
    },
    body: {
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      style: {},
      appendChild: () => {}
    },
    getElementById: (id) => elementsById[id] || null,
    querySelector: (sel) => {
      if (sel === '#webgl-canvas') return { dataset: {} };
      if (sel === '.ngefly-toast-container') return makeMockElement('div');
      return null;
    },
    querySelectorAll: () => [],
    addEventListener: (evt, fn, opts) => {
      if (evt === 'DOMContentLoaded') domLoadedListeners.push(fn);
      if (evt === 'click') clickListeners.push({ fn, capture: Boolean(opts === true || (opts && opts.capture)) });
    },
    createElement: makeMockElement
  };

  const storageData = {};
  const mockLocalStorage = {
    getItem: (key) => storageData[key] || null,
    setItem: (key, val) => { storageData[key] = String(val); },
    removeItem: (key) => { delete storageData[key]; },
    clear: () => { Object.keys(storageData).forEach(k => delete storageData[k]); }
  };
  if (options.currentUser) {
    mockLocalStorage.setItem('flynest_user', JSON.stringify(options.currentUser));
    mockLocalStorage.setItem('ngefly_user', JSON.stringify(options.currentUser));
  }

  const contextObj = {
    console: { log: () => {}, warn: () => {}, error: () => {} },
    window: null,
    document: mockDocument,
    location: mockLocation,
    localStorage: mockLocalStorage,
    performance: { now: () => Date.now() },
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (id) => clearTimeout(id),
    requestAnimationFrame: (cb) => setImmediate(cb),
    URLSearchParams: URLSearchParams,
    MouseEvent: class {
      constructor(type, init = {}) {
        this.type = type;
        this.bubbles = init.bubbles ?? true;
        this.cancelable = init.cancelable ?? true;
        this.defaultPrevented = false;
        this.propagationStopped = false;
      }
      preventDefault() { this.defaultPrevented = true; }
      stopPropagation() { this.propagationStopped = true; }
    },
    addEventListener: (evt, fn) => {
      if (evt === 'pageshow') pageshowListeners.push(fn);
    }
  };

  contextObj.window = contextObj;
  contextObj.window.__planeGroup = { position: { x: 0, y: 0.65, z: -1.5 } };
  contextObj.window.__isTakingOff = false;
  contextObj.window.__navigated = false;
  contextObj.window.__navigating = false;

  contextObj.window.triggerAirplaneTakeoffAndNavigate = function(targetUrl) {
    if (contextObj.window.__isTakingOff) return false;
    contextObj.window.__isTakingOff = true;
    takeoffCalls.push(targetUrl);
    return true;
  };

  contextObj.window.playTakeoffSound = () => {};
  contextObj.window.playClickSound = () => {};

  const ctx = vm.createContext(contextObj);
  vm.runInContext(mainJsContent, ctx);

  const origShowToast = ctx.window.showToast;
  ctx.window.showToast = function(msg, dur) {
    toastMessage = msg;
    if (typeof origShowToast === 'function') {
      try { origShowToast(msg, dur); } catch(e) {}
    }
  };

  // Trigger DOMContentLoaded
  domLoadedListeners.forEach(fn => {
    try { fn(); } catch(e) {}
  });

  function simulateClick(elementMock) {
    const event = new contextObj.MouseEvent('click', { bubbles: true, cancelable: true });
    event.target = elementMock;

    const sortedListeners = [...clickListeners].sort((a, b) => (b.capture ? 1 : 0) - (a.capture ? 1 : 0));
    for (const { fn } of sortedListeners) {
      if (event.propagationStopped) break;
      fn(event);
    }
    return event;
  }

  function triggerPageshow() {
    pageshowListeners.forEach(fn => fn());
  }

  return { ctx, simulateClick, triggerPageshow, takeoffCalls, getToastMessage: () => toastMessage, getNavigatedTo: () => navigatedTo };
}

function createMockLink(href, text = '', inHeader = true, extra = {}) {
  const linkEl = {
    tagName: 'A',
    getAttribute: (attr) => {
      if (attr === 'href') return href;
      if (attr === 'target') return extra.target || null;
      if (attr === 'download') return extra.download ? '' : null;
      return null;
    },
    hasAttribute: (attr) => {
      if (attr === 'download') return Boolean(extra.download);
      return false;
    },
    target: extra.target || '',
    textContent: text,
    closest: (sel) => {
      if (sel === 'a') return linkEl;
      if (sel === '.ngefly-header') return inHeader ? { className: 'ngefly-header' } : null;
      if (sel.includes('#floating-search-bar') || sel.includes('search-submit-btn') || sel.includes('cta-search-btn')) {
        return extra.isCta ? linkEl : null;
      }
      return null;
    }
  };
  return linkEl;
}

// TEST 4: Click "Trang Chủ" in Header triggers takeoff
{
  const { ctx, simulateClick, takeoffCalls } = createNavigationContext({ pathname: '/index.html' });
  ctx.window.__isTakingOff = false;
  takeoffCalls.length = 0;

  const mockHome = createMockLink('index.html', 'Trang Chủ', true);
  const evt = simulateClick(mockHome);
  const ok = evt.defaultPrevented && takeoffCalls.length === 1 && takeoffCalls[0] === 'index.html';
  assert(ok, 'TEST 4: Click "Trang Chủ" in Header triggered airplane takeoff on Homepage');
}

// TEST 5: Inner Header navigation links (Chuyến Bay, Lịch Trình, Đặt Chỗ, Vé Của Bạn) trigger takeoff
{
  const { ctx, simulateClick, takeoffCalls } = createNavigationContext({ pathname: '/index.html' });

  const innerMenuItems = [
    { text: 'Chuyến Bay', href: 'pages/flights.html' },
    { text: 'Lịch Trình', href: 'pages/schedule.html' },
    { text: 'Đặt Chỗ', href: 'pages/booking.html' },
    { text: 'Vé Của Bạn', href: 'pages/ticket.html' }
  ];

  let allTriggered = true;
  for (const item of innerMenuItems) {
    ctx.window.__isTakingOff = false;
    takeoffCalls.length = 0;

    const mockA = createMockLink(item.href, item.text, true);
    const evt = simulateClick(mockA);

    const ok = evt.defaultPrevented && takeoffCalls.length === 1 && takeoffCalls[0] === item.href;
    if (!ok) {
      allTriggered = false;
      console.error(`   Failed on item: ${item.text} (${item.href}). Evt prevented: ${evt.defaultPrevented}, Calls: ${JSON.stringify(takeoffCalls)}`);
    }
  }

  assert(allTriggered, 'TEST 5: All inner Header navigation links triggered airplane takeoff');
}

// TEST 6: CTA Search button and Header links use the SAME unified navigation pipeline
{
  const { ctx, simulateClick, takeoffCalls } = createNavigationContext({ pathname: '/index.html' });
  ctx.window.__isTakingOff = false;
  takeoffCalls.length = 0;

  const ctaBtn = {
    tagName: 'BUTTON',
    closest: (sel) => {
      if (sel.includes('search-submit-btn') || sel.includes('cta-search-btn') || sel.includes('#floating-search-bar')) {
        return ctaBtn;
      }
      return null;
    }
  };

  const evtCta = simulateClick(ctaBtn);
  const ctaOk = evtCta.defaultPrevented && takeoffCalls.length === 1 && takeoffCalls[0] === 'pages/flights.html';

  assert(ctaOk, 'TEST 6: CTA Search Button and Header links use the SAME unified pipeline');
}

// TEST 7: Pre-navigation Admin guard blocks unauthenticated visitor and redirects to login
{
  const { ctx, simulateClick, takeoffCalls, getToastMessage } = createNavigationContext({
    pathname: '/index.html',
    currentUser: null // Unauthenticated visitor
  });
  ctx.window.__isTakingOff = false;
  takeoffCalls.length = 0;

  const adminLink = createMockLink('admin/index.html', 'Quản Trị', true);
  const evt = simulateClick(adminLink);

  const blockedAndRedirected = evt.defaultPrevented && takeoffCalls.length === 1 && takeoffCalls[0].includes('login.html?redirect=admin');
  const hadToast = Boolean(getToastMessage() && getToastMessage().includes('Quản Trị'));

  assert(blockedAndRedirected && hadToast, 'TEST 7: Pre-navigation Admin guard blocked unauthenticated visitor and redirected to login');
}

// TEST 8: Authenticated admin session allowed into admin via transition pipeline
{
  const { ctx, simulateClick, takeoffCalls } = createNavigationContext({
    pathname: '/index.html',
    currentUser: { id: 1, name: 'Admin', role: 'admin' }
  });
  ctx.window.__isTakingOff = false;
  takeoffCalls.length = 0;

  const adminLink = createMockLink('admin/index.html', 'Quản Trị', true);
  const evt = simulateClick(adminLink);

  const allowed = evt.defaultPrevented && takeoffCalls.length === 1 && takeoffCalls[0] === 'admin/index.html';
  assert(allowed, 'TEST 8: Authenticated admin session allowed into admin via transition pipeline');
}

// TEST 9: Double-click during takeoff does not trigger duplicate takeoff calls
{
  const { ctx, simulateClick, takeoffCalls } = createNavigationContext({ pathname: '/index.html' });
  ctx.window.__isTakingOff = false;
  takeoffCalls.length = 0;

  const flightLink = createMockLink('pages/flights.html', 'Chuyến Bay', true);

  simulateClick(flightLink);
  simulateClick(flightLink);
  simulateClick(flightLink);

  assert(takeoffCalls.length === 1, 'TEST 9: Double-click protection prevented multiple takeoff sequences', `Calls: ${takeoffCalls.length}`);
}

// TEST 10: Exception links (hash, target=_blank, download, external, mailto, tel) are bypassed
{
  const { ctx, simulateClick, takeoffCalls } = createNavigationContext({ pathname: '/index.html' });
  ctx.window.__isTakingOff = false;
  takeoffCalls.length = 0;

  const hashLink = createMockLink('#hero-section', 'Hash', true);
  const blankLink = createMockLink('https://flynest.vn/docs', 'Doc', true, { target: '_blank' });
  const downloadLink = createMockLink('ticket.pdf', 'PDF', true, { download: true });
  const mailLink = createMockLink('mailto:support@flynest.vn', 'Mail', true);
  const telLink = createMockLink('tel:19001100', 'Tel', true);

  const evtHash = simulateClick(hashLink);
  const evtBlank = simulateClick(blankLink);
  const evtDl = simulateClick(downloadLink);
  const evtMail = simulateClick(mailLink);
  const evtTel = simulateClick(telLink);

  const nonePrevented = !evtHash.defaultPrevented && !evtBlank.defaultPrevented && !evtDl.defaultPrevented && !evtMail.defaultPrevented && !evtTel.defaultPrevented;
  const noTakeoffs = takeoffCalls.length === 0;

  assert(nonePrevented && noTakeoffs, 'TEST 10: Exception links correctly bypassed without interception or takeoff');
}

// TEST 11: Browser back/forward (pageshow) resets transition state cleanly
{
  const { ctx, triggerPageshow } = createNavigationContext({ pathname: '/index.html' });
  ctx.window.__isTakingOff = true;
  ctx.window.__navigating = true;
  ctx.window.__navigated = true;

  triggerPageshow();

  const isReset = ctx.window.__isTakingOff === false && ctx.window.__navigating === false && ctx.window.__navigated === false;
  assert(isReset, 'TEST 11: Browser back/forward (pageshow) reset transition state flags cleanly');
}

// ----------------------------------------------------
// Summary
// ----------------------------------------------------
console.log('\n========================================================');
console.log(`📊 SUMMARY: ${passedTests}/${totalTests} ACCEPTANCE TESTS PASSED`);
console.log('========================================================');

if (passedTests === totalTests) {
  console.log('🎉 TICKET 2 (UI-037) NAVIGATION TRANSITION FULLY VERIFIED!\n');
  process.exit(0);
} else {
  console.error('❌ Some tests failed.');
  process.exit(1);
}
