const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');

const PORT = 4567;
const CDP_PORT = 9223;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqUrl = req.url.split('?')[0].split('#')[0];
      if (reqUrl === '/') reqUrl = '/index.html';

      reqUrl = decodeURIComponent(reqUrl);
      const filePath = path.join(ROOT_DIR, reqUrl);

      if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403);
        return res.end('Forbidden');
      }

      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('404 Not Found: ' + reqUrl);
        }

        const ext = path.extname(filePath).toLowerCase();
        const mime = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        fs.createReadStream(filePath).pipe(res);
      });
    });

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`[HTTP Server] Running at http://127.0.0.1:${PORT}`);
      resolve(server);
    });
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.callbacks = new Map();
    this.events = new Map();
  }

  init() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        } else if (msg.method) {
          const handlers = this.events.get(msg.method) || [];
          for (const h of handlers) h(msg.params);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, handler) {
    if (!this.events.has(method)) {
      this.events.set(method, []);
    }
    this.events.get(method).push(handler);
  }

  close() {
    try {
      this.ws.close();
    } catch(e) {}
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runE2ETests() {
  console.log('========================================================');
  console.log('🚀 PHASE 2: AUTOMATED HEADLESS EDGE CDP E2E TESTING');
  console.log('========================================================\n');

  const server = await startServer();

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-flynest-e2e-'));

  console.log('[Edge] Spawning headless browser...');
  const edgeProc = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-gpu',
    '--window-size=1280,900',
    'about:blank'
  ]);

  let versionData = null;
  for (let i = 0; i < 30; i++) {
    await sleep(200);
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (res.ok) {
        versionData = await res.json();
        break;
      }
    } catch (e) {}
  }

  if (!versionData) {
    edgeProc.kill('SIGKILL');
    server.close();
    throw new Error('Could not initialize Edge CDP');
  }

  console.log(`[Edge] Connected to ${versionData.Browser}`);

  const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await listRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];

  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await cdp.init();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  await cdp.send('Console.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  const testPages = [
    { name: 'index.html', path: '/index.html' },
    { name: 'pages/flights.html', path: '/pages/flights.html' },
    { name: 'pages/booking.html', path: '/pages/booking.html' },
    { name: 'pages/seats.html', path: '/pages/seats.html' },
    { name: 'pages/payment.html', path: '/pages/payment.html' },
    { name: 'pages/ticket.html', path: '/pages/ticket.html' },
    { name: 'pages/login.html', path: '/pages/login.html' },
    { name: 'pages/register.html', path: '/pages/register.html' },
    { name: 'admin/index.html', path: '/admin/index.html' }
  ];

  const report = [];

  for (const p of testPages) {
    console.log(`\n----------------------------------------------------`);
    console.log(`Testing Page: ${p.name} (${p.path})`);
    console.log(`----------------------------------------------------`);

    const pageErrors = [];
    const page404s = [];

    const handleConsole = (params) => {
      if (params.message && (params.message.level === 'error' || params.message.type === 'error')) {
        pageErrors.push(`[Console Error] ${params.message.text}`);
      }
    };

    const handleException = (params) => {
      const desc = params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || 'Unknown Exception';
      pageErrors.push(`[Uncaught Exception] ${desc}`);
    };

    const handleResponse = (params) => {
      const resp = params.response;
      if (resp.status >= 400) {
        page404s.push(`HTTP ${resp.status}: ${resp.url}`);
      }
    };

    const handleLoadingFailed = (params) => {
      if (!params.canceled && !params.errorText?.includes('net::ERR_ABORTED')) {
        pageErrors.push(`[Loading Failed] ${params.errorText}`);
      }
    };

    cdp.on('Console.messageAdded', handleConsole);
    cdp.on('Runtime.exceptionThrown', handleException);
    cdp.on('Network.responseReceived', handleResponse);
    cdp.on('Network.loadingFailed', handleLoadingFailed);

    const fullUrl = `http://127.0.0.1:${PORT}${p.path}`;
    await cdp.send('Page.navigate', { url: fullUrl });

    await sleep(1500);

    // Capture screenshot of page
    try {
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      const shotName = p.name.replace(/[\/\\]/g, '_').replace('.html', '') + '.png';
      const shotPath = path.join(ROOT_DIR, 'tests', 'screenshots', shotName);
      fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
      console.log(`[Screenshot] Saved: tests/screenshots/${shotName}`);
    } catch (err) {
      console.log(`[Screenshot] Failed: ${err.message}`);
    }

    if (p.name === 'pages/flights.html') {
      try {
        await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/pages/flights.html?view=schedule` });
        await sleep(1200);
        const schedShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
        const schedPath = path.join(ROOT_DIR, 'tests', 'screenshots', 'pages_flights_schedule.png');
        fs.writeFileSync(schedPath, Buffer.from(schedShot.data, 'base64'));
        console.log(`[Screenshot] Saved: tests/screenshots/pages_flights_schedule.png`);
        // Navigate back
        await cdp.send('Page.navigate', { url: fullUrl });
        await sleep(800);
      } catch (e) {}
    }

    let pageEvalResult = null;
    try {
      const evalResp = await cdp.send('Runtime.evaluate', {
        expression: `
          (function() {
            const checks = {};
            checks.title = document.title;
            checks.hasHeader = !!document.querySelector('header, .ngefly-header');
            checks.hasFooter = !!document.querySelector('footer, .ngefly-footer');
            checks.theme = document.documentElement.getAttribute('data-theme');
            
            const path = window.location.pathname;
            if (path.includes('index.html') || path === '/') {
              checks.hasHero = !!document.querySelector('#webgl-container, .hero-section');
              checks.hasSearchCard = !!document.querySelector('.search-card, form, #flight-search-form');
              checks.themeToggleBtn = !!document.querySelector('#theme-toggle-btn');
              if (checks.themeToggleBtn) {
                document.querySelector('#theme-toggle-btn').click();
                checks.themeAfterClick = document.documentElement.getAttribute('data-theme');
                document.querySelector('#theme-toggle-btn').click();
              }
              const tabOneway = document.querySelector('[data-tab="oneway"]');
              if (tabOneway) tabOneway.click();
              checks.tabSwitchTested = true;
            } else if (path.includes('flights.html')) {
              checks.flightCardsCount = document.querySelectorAll('.flight-card-ngefly').length;
              checks.filterTabs = document.querySelectorAll('.sort-pill').length;
              checks.airlineCheckboxes = document.querySelectorAll('input[type="checkbox"]').length;
              const cheapestTab = document.querySelector('.sort-pill[data-sort="cheapest"]');
              if (cheapestTab) cheapestTab.click();
              checks.sortTested = true;
            } else if (path.includes('booking.html')) {
              checks.formPresent = !!document.querySelector('form, #booking-form');
              checks.nameInput = !!document.querySelector('#pax-full-name, input[placeholder*="Jonathan"]');
              checks.emailInput = !!document.querySelector('#pax-email, input[type="email"]');
              checks.phoneInput = !!document.querySelector('#pax-phone, input[type="tel"]');
              checks.btnProceed = !!document.querySelector('#btn-save-passengers, .btn-proceed, a[href*="seats"]');
            } else if (path.includes('seats.html')) {
              checks.cabinBox = !!document.querySelector('.plane-cabin-box, .cabin-map');
              checks.seatCount = document.querySelectorAll('.seat-cell').length;
              checks.freeSeatCount = document.querySelectorAll('.seat-cell.seat-free').length;
              checks.proceedBtn = !!document.querySelector('#btn-proceed-payment, a[href*="payment"]');
              const availableSeat = document.querySelector('.seat-cell.seat-free');
              if (availableSeat) {
                availableSeat.click();
                checks.seatClicked = availableSeat.getAttribute('data-seat') || true;
              }
            } else if (path.includes('payment.html')) {
              checks.paymentTabs = document.querySelectorAll('.payment-tab').length;
              checks.creditCardMockup = !!document.querySelector('#credit-card-metallic, .credit-card-mockup');
              checks.cardHolderInput = !!document.querySelector('#input-card-holder');
              checks.cardExpInput = !!document.querySelector('#input-card-exp');
              checks.cardCvvInput = !!document.querySelector('#input-card-cvv');
              checks.btnConfirmPay = !!document.querySelector('#btn-confirm-pay');
              const vnpayTab = document.querySelector('.payment-tab[data-target="panel-vnpay"]');
              if (vnpayTab) {
                vnpayTab.click();
                checks.vnpayTabClicked = true;
              }
            } else if (path.includes('ticket.html')) {
              checks.boardingPass = !!document.querySelector('.boarding-pass-ngefly');
              checks.pnrDisplay = !!document.querySelector('#ticket-pnr-display');
              checks.airlineLogo = !!document.querySelector('#ticket-airline-logo');
              checks.barcode = !!document.querySelector('.barcode-strip');
              checks.qrCode = !!document.querySelector('.qr-code-wrapper');
              checks.btnCopyPnr = !!document.querySelector('#btn-copy-pnr');
            } else if (path.includes('login.html')) {
              checks.emailField = !!document.querySelector('#login-email, input[type="email"]');
              checks.passwordField = !!document.querySelector('#login-password, input[type="password"]');
              checks.submitBtn = !!document.querySelector('button[type="submit"]');
            } else if (path.includes('register.html')) {
              checks.nameField = !!document.querySelector('#reg-name');
              checks.emailField = !!document.querySelector('#reg-email');
              checks.phoneField = !!document.querySelector('#reg-phone');
              checks.passwordField = !!document.querySelector('#reg-password');
              checks.termsCheckbox = !!document.querySelector('#terms-agree');
            } else if (path.includes('admin')) {
              checks.kpiCards = document.querySelectorAll('.stat-metric-card').length;
              checks.tables = document.querySelectorAll('table').length;
              checks.flightRows = document.querySelectorAll('table tbody tr').length;
              checks.searchInput = !!document.querySelector('#orders input');
            }
            return checks;
          })()
        `,
        returnByValue: true
      });
      pageEvalResult = evalResp.result?.value;
    } catch (evalErr) {
      pageErrors.push(`[DOM Eval Error] ${evalErr.message}`);
    }

    const isPass = pageErrors.length === 0 && page404s.length === 0;
    console.log(`Title: "${pageEvalResult?.title}"`);
    console.log(`Status: ${isPass ? '✅ PASS' : '❌ FAIL'}`);
    if (page404s.length) console.log('404 Responses:', page404s);
    if (pageErrors.length) console.log('Console/Runtime Errors:', pageErrors);
    console.log('Evaluation Checks:', JSON.stringify(pageEvalResult, null, 2));

    report.push({
      page: p.name,
      status: isPass ? 'PASS' : 'FAIL',
      title: pageEvalResult?.title,
      errors: pageErrors,
      http404s: page404s,
      details: pageEvalResult
    });

    cdp.events.delete('Console.messageAdded');
    cdp.events.delete('Runtime.exceptionThrown');
    cdp.events.delete('Network.responseReceived');
    cdp.events.delete('Network.loadingFailed');
  }

  // PHASE 3: END-TO-END BOOKING FUNNEL WORKFLOW TEST
  console.log('\n========================================================');
  console.log('🔄 PHASE 3: FULL BOOKING FUNNEL END-TO-END INTERACTION');
  console.log('========================================================');

  const funnelSteps = [];

  // Step 1: Search flight on index.html
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/index.html` });
  await sleep(1000);
  const step1 = await cdp.send('Runtime.evaluate', {
    expression: `
      (function() {
        const btn = document.querySelector('button[type="submit"], .btn-search, #btn-submit-search');
        return { ok: !!btn, text: btn ? btn.textContent.trim() : null };
      })()
    `,
    returnByValue: true
  });
  funnelSteps.push({ step: '1. Index Search Flight', result: step1.result?.value?.ok ? 'PASS' : 'FAIL' });

  // Step 2: Select flight on flights.html
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/pages/flights.html` });
  await sleep(1000);
  const step2 = await cdp.send('Runtime.evaluate', {
    expression: `
      (function() {
        const firstFlightBtn = document.querySelector('.btn-select-flight, .flight-card-ngefly a, a[href*="booking"]');
        return { ok: !!firstFlightBtn, href: firstFlightBtn ? firstFlightBtn.getAttribute('href') : null };
      })()
    `,
    returnByValue: true
  });
  funnelSteps.push({ step: '2. Select Flight Card', result: step2.result?.value?.ok ? 'PASS' : 'FAIL' });

  // Step 3: Fill passenger in booking.html
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/pages/booking.html` });
  await sleep(1000);
  const step3 = await cdp.send('Runtime.evaluate', {
    expression: `
      (function() {
        const nameInput = document.querySelector('#pax-full-name');
        const proceedBtn = document.querySelector('#btn-save-passengers, a[href*="seats"]');
        if (nameInput) nameInput.value = "Nguyen Van FlyNest";
        return { ok: !!proceedBtn, nameValue: nameInput ? nameInput.value : null };
      })()
    `,
    returnByValue: true
  });
  funnelSteps.push({ step: '3. Booking Passenger Form', result: step3.result?.value?.ok ? 'PASS' : 'FAIL' });

  // Step 4: Select Seat in seats.html
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/pages/seats.html` });
  await sleep(1000);
  const step4 = await cdp.send('Runtime.evaluate', {
    expression: `
      (function() {
        const seatCell = document.querySelector('.seat-cell.seat-free');
        let seatNum = null;
        if (seatCell) {
          seatNum = seatCell.getAttribute('data-seat');
          seatCell.click();
        }
        const proceedBtn = document.querySelector('#btn-proceed-payment, a[href*="payment"]');
        return { ok: !!proceedBtn, seatSelected: seatNum };
      })()
    `,
    returnByValue: true
  });
  funnelSteps.push({ step: '4. Seat Map Selection', result: step4.result?.value?.ok ? 'PASS' : 'FAIL' });

  // Step 5: Confirm Payment on payment.html
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/pages/payment.html` });
  await sleep(1000);
  const step5 = await cdp.send('Runtime.evaluate', {
    expression: `
      (function() {
        const payBtn = document.querySelector('#btn-confirm-pay');
        const cardHolder = document.querySelector('#input-card-holder');
        return { ok: !!payBtn, cardHolder: cardHolder ? cardHolder.value : null };
      })()
    `,
    returnByValue: true
  });
  funnelSteps.push({ step: '5. Payment Gateway Verification', result: step5.result?.value?.ok ? 'PASS' : 'FAIL' });

  // Step 6: Boarding Pass on ticket.html
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/pages/ticket.html` });
  await sleep(1000);
  const step6 = await cdp.send('Runtime.evaluate', {
    expression: `
      (function() {
        const pnr = document.querySelector('#ticket-pnr-display');
        const passCard = document.querySelector('.boarding-pass-ngefly');
        const airlineTitle = document.querySelector('#ticket-airline-title');
        return {
          ok: !!passCard && !!pnr,
          pnrText: pnr ? pnr.textContent.trim() : null,
          airline: airlineTitle ? airlineTitle.textContent.trim() : null
        };
      })()
    `,
    returnByValue: true
  });
  funnelSteps.push({ step: '6. E-Ticket Boarding Pass Issuance', result: step6.result?.value?.ok ? 'PASS' : 'FAIL' });

  console.log('\nFunnel Steps Results:');
  console.table(funnelSteps);

  cdp.close();
  edgeProc.kill('SIGKILL');
  server.close();

  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch(e) {}

  console.log('\n========================================================');
  console.log('AUTOMATED E2E TEST SUMMARY:');
  const passCount = report.filter(r => r.status === 'PASS').length;
  console.log(`Results: ${passCount}/${report.length} Pages PASSED`);
  console.log(`Funnel: ${funnelSteps.filter(s => s.result === 'PASS').length}/${funnelSteps.length} Steps PASSED`);
  console.log('========================================================\n');

  fs.writeFileSync(
    path.join(__dirname, 'e2e-report.json'),
    JSON.stringify({ pages: report, funnel: funnelSteps }, null, 2),
    'utf8'
  );
  console.log('Report saved to tests/e2e-report.json');
}

runE2ETests().catch(err => {
  console.error('Test Suite Failed with Fatal Error:', err);
  process.exit(1);
});
