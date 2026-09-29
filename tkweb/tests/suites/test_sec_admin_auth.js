/**
 * ACCEPTANCE TEST SUITE: SEC-001 & SEC-002
 * Purpose: Rigorously verify removal of Admin dev bypasses and client-side privilege escalation.
 * 
 * Acceptance Tests:
 * TEST 1: /admin/index.html?dev=true when unauthenticated -> Cannot access Admin (Redirects to login).
 * TEST 2: /admin/index.html?theme=dark when unauthenticated -> Cannot access Admin (Redirects to login).
 * TEST 3: Login with email "testadmin@gmail.com" -> Resulting user role is strictly "customer", NOT "admin".
 * TEST 4: Regular user with role "customer" -> Cannot access Admin (403 Forbidden / Redirects to login).
 * TEST 5: Authenticated admin test session (role: 'admin') -> Can access Admin without redirection.
 * TEST 6: Query parameter theme=dark -> Only alters visual theme, absolutely never alters authorization state.
 */

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const mainJsPath = path.resolve(__dirname, '../../assets/js/main.js');
const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');

console.log('========================================================');
console.log('🔒 RUNNING SECURITY ACCEPTANCE TESTS: SEC-001 & SEC-002');
console.log('========================================================\n');

let passedTests = 0;
let totalTests = 6;

// --- Static Code / Regex Security Checks ---
console.log('--- Static Code Verification ---');
const forbiddenPatterns = [
  { name: 'isDevBypass variable', regex: /\bisDevBypass\b/ },
  { name: "urlParams.has('dev')", regex: /urlParams\.has\(['"]dev['"]\)/ },
  { name: "email.includes('admin')", regex: /email(\.toLowerCase\(\))?\.includes\(['"]admin['"]\)/ }
];

let hasStaticViolation = false;
forbiddenPatterns.forEach(({ name, regex }) => {
  if (regex.test(mainJsContent)) {
    console.error(`❌ FAILED: Found forbidden pattern in main.js: ${name}`);
    hasStaticViolation = true;
  } else {
    console.log(`✅ PASS: Confirmed absence of ${name}`);
  }
});

if (hasStaticViolation) {
  console.error('\nStopping due to static security violation.');
  process.exit(1);
}

// --- Browser Mock Environment ---
function createMockEnvironment(options = {}) {
  const localStorageStore = {};
  const sessionStorageStore = {};

  if (options.initialUser) {
    const userStr = typeof options.initialUser === 'object' ? JSON.stringify(options.initialUser) : options.initialUser;
    localStorageStore['flynest_user'] = userStr;
    localStorageStore['ngefly_user'] = userStr;
  }

  let redirectedTo = null;
  const submitHandlers = [];

  const mockLocation = {
    pathname: options.pathname || '/admin/index.html',
    search: options.search || '',
    hash: options.hash || '',
    get href() { return this.pathname + this.search + this.hash; },
    set href(target) { redirectedTo = target; }
  };

  const mockLoginForm = {
    addEventListener(event, fn) {
      if (event === 'submit') submitHandlers.push(fn);
    },
    querySelector(selector) {
      return { disabled: false };
    }
  };

  const domListeners = {};

  const mockDocument = {
    documentElement: {
      attributes: {},
      setAttribute(name, val) { this.attributes[name] = val; },
      getAttribute(name) { return this.attributes[name] || null; }
    },
    querySelector(selector) {
      if (selector === '#orders table tbody') return { querySelectorAll: () => [], addEventListener: () => {} };
      if (selector === '#login-form' || selector === '.auth-card-ngefly form') {
        return mockLoginForm;
      }
      if (selector === '#login-email') return { value: options.loginEmail || '' };
      if (selector === '#btn-quick-admin-login') return { addEventListener: () => {} };
      return null;
    },
    querySelectorAll() { return []; },
    getElementById() { return null; },
    addEventListener(evt, fn) {
      if (!domListeners[evt]) domListeners[evt] = [];
      domListeners[evt].push(fn);
    },
    removeEventListener: () => {},
    createElement: (tag) => ({
      tagName: tag,
      className: '',
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false,
        toggle: () => {}
      },
      style: {},
      appendChild: () => {},
      removeChild: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      querySelector: () => null,
      querySelectorAll: () => []
    }),
    body: {
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false,
        toggle: () => {}
      },
      appendChild: () => {},
      removeChild: () => {},
      querySelector: () => null,
      querySelectorAll: () => []
    }
  };

  const mockWindow = {
    location: mockLocation,
    addEventListener: () => {},
    removeEventListener: () => {},
    setTimeout(fn) { fn(); return 1; }
  };

  const mockLocalStorage = {
    getItem(k) { return localStorageStore[k] || null; },
    setItem(k, v) { localStorageStore[k] = String(v); },
    removeItem(k) { delete localStorageStore[k]; }
  };

  const mockSessionStorage = {
    getItem(k) { return sessionStorageStore[k] || null; },
    setItem(k, v) { sessionStorageStore[k] = String(v); },
    removeItem(k) { delete sessionStorageStore[k]; }
  };

  return {
    window: mockWindow,
    location: mockLocation,
    document: mockDocument,
    localStorage: mockLocalStorage,
    sessionStorage: mockSessionStorage,
    getRedirection: () => redirectedTo,
    triggerLoginSubmit: () => {
      submitHandlers.forEach(fn => fn({ preventDefault: () => {} }));
    }
  };
}

function runTestContext(env) {
  const context = vm.createContext({
    window: env.window,
    document: env.document,
    location: env.window.location,
    localStorage: env.localStorage,
    sessionStorage: env.sessionStorage,
    setTimeout: (fn, ms) => { fn(); return 1; },
    requestAnimationFrame: (fn) => { fn(); return 1; },
    cancelAnimationFrame: () => {},
    URLSearchParams: URLSearchParams,
    console: console,
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    escape: encodeURIComponent,
    unescape: decodeURIComponent
  });

  // Execute main.js inside test context and hook showToast
  vm.runInContext(mainJsContent + `
    ;globalThis.Storage = Storage;
    globalThis.SecurityVault = SecurityVault;
    const _origToast = typeof showToast === 'function' ? showToast : null;
    globalThis.showToast = function(msg, dur) {
      globalThis._lastToast = msg;
      if (_origToast) {
        try { _origToast(msg, dur); } catch(e) {}
      }
    };
  `, context);

  context.getLastToast = () => context._lastToast;
  return context;
}

console.log('\n--- Executing Behavioral Acceptance Tests ---');

// TEST 1: /admin/index.html?dev=true when unauthenticated -> Cannot access Admin
{
  const env = createMockEnvironment({ pathname: '/admin/index.html', search: '?dev=true' });
  const ctx = runTestContext(env);
  ctx.initAdminPage();

  const redirected = env.getRedirection();
  const blocked = redirected && redirected.includes('login.html');
  if (blocked) {
    console.log('✅ TEST 1 PASSED: /admin/index.html?dev=true rejected unauthenticated visitor and redirected to login.');
    passedTests++;
  } else {
    console.error(`❌ TEST 1 FAILED: Expected redirect to login, got: ${redirected}`);
  }
}

// TEST 2: /admin/index.html?theme=dark when unauthenticated -> Cannot access Admin
{
  const env = createMockEnvironment({ pathname: '/admin/index.html', search: '?theme=dark' });
  const ctx = runTestContext(env);
  ctx.initAdminPage();

  const redirected = env.getRedirection();
  const blocked = redirected && redirected.includes('login.html');
  if (blocked) {
    console.log('✅ TEST 2 PASSED: /admin/index.html?theme=dark rejected unauthenticated visitor and redirected to login.');
    passedTests++;
  } else {
    console.error(`❌ TEST 2 FAILED: Expected redirect to login, got: ${redirected}`);
  }
}

// TEST 3: Login form submitted with email "testadmin@gmail.com" -> Resulting role is strictly "customer"
{
  const env = createMockEnvironment({ pathname: '/pages/login.html', loginEmail: 'testadmin@gmail.com' });
  const ctx = runTestContext(env);
  
  // Wire up auth UI form listeners
  ctx.initAuthUI();
  // Trigger login form submit
  env.triggerLoginSubmit();

  const storedUser = ctx.Storage.getUser();
  const isStrictCustomer = storedUser && storedUser.role === 'customer';

  if (isStrictCustomer) {
    console.log(`✅ TEST 3 PASSED: Form submission with "testadmin@gmail.com" granted role="${storedUser.role}" (strictly non-admin).`);
    passedTests++;
  } else {
    console.error(`❌ TEST 3 FAILED: Role escalated unexpectedly: ${storedUser ? storedUser.role : 'null'}`);
  }
}

// TEST 4: Regular user (role: 'customer') accessing /admin/index.html -> 403 Forbidden / Redirects
{
  const regularUser = { id: 101, name: 'Normal Passenger', role: 'customer', email: 'passenger@example.com' };
  const env = createMockEnvironment({ pathname: '/admin/index.html', initialUser: regularUser });
  const ctx = runTestContext(env);
  ctx.initAdminPage();

  const redirected = env.getRedirection();
  const blocked = redirected && redirected.includes('login.html');
  const toast = ctx.getLastToast();
  const has403 = toast && toast.includes('403');

  if (blocked && has403) {
    console.log('✅ TEST 4 PASSED: Regular user denied access with 403 Forbidden notice and redirected to login.');
    passedTests++;
  } else {
    console.error(`❌ TEST 4 FAILED: Regular user was not properly blocked. Redirect: ${redirected}, Toast: ${toast}`);
  }
}

// TEST 5: Authenticated admin test session accessing /admin/index.html -> Granted access
{
  const adminUser = { id: 999, name: 'Verified Admin', role: 'admin', email: 'admin-demo@flynest.vn' };
  const env = createMockEnvironment({ pathname: '/admin/index.html', initialUser: adminUser });
  const ctx = runTestContext(env);
  ctx.initAdminPage();

  const redirected = env.getRedirection();
  if (redirected === null) {
    console.log('✅ TEST 5 PASSED: Authenticated admin test session granted access without redirection.');
    passedTests++;
  } else {
    console.error(`❌ TEST 5 FAILED: Authenticated admin was unexpectedly redirected to: ${redirected}`);
  }
}

// TEST 6: Query parameter theme=dark alters visual styling only, never affects authorization
{
  const env = createMockEnvironment({ pathname: '/admin/index.html', search: '?theme=dark' });
  const ctx = runTestContext(env);

  // Apply theme logic
  ctx.initThemeSupport();
  const themeAttr = env.document.documentElement.getAttribute('data-theme');
  const themeChanged = themeAttr === 'dark';

  // Apply admin authorization check
  ctx.initAdminPage();
  const redirected = env.getRedirection();
  const unauthenticatedBlocked = redirected && redirected.includes('login.html');

  if (themeChanged && unauthenticatedBlocked) {
    console.log('✅ TEST 6 PASSED: ?theme=dark altered visual theme to dark while strictly enforcing auth denial.');
    passedTests++;
  } else {
    console.error(`❌ TEST 6 FAILED: Theme changed: ${themeChanged}, Auth blocked: ${unauthenticatedBlocked}`);
  }
}

console.log('\n========================================================');
console.log(`📊 SUMMARY: ${passedTests}/${totalTests} ACCEPTANCE TESTS PASSED`);
console.log('========================================================');

if (passedTests === totalTests) {
  console.log('🎉 SEC-001 & SEC-002 FULLY VERIFIED!');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED.');
  process.exit(1);
}
