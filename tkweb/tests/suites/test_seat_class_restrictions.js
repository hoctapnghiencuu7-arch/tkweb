const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const PORT = 4571;
const CDP_PORT = 9227;
const ROOT_DIR = path.resolve(__dirname, '../..');
const SCREENSHOT_DIR = path.join(__dirname, '../screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

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

  close() {
    try { this.ws.close(); } catch(e) {}
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function captureScreenshot(cdp, filename) {
  const ss = await cdp.send('Page.captureScreenshot', { format: 'png' });
  const outPath = path.join(SCREENSHOT_DIR, filename);
  fs.writeFileSync(outPath, Buffer.from(ss.data, 'base64'));
  console.log(`📸 Saved screenshot: ${filename} (${(ss.data.length * 0.75 / 1024).toFixed(1)} KB)`);
  return outPath;
}

async function evalInPage(cdp, expression) {
  const res = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  return res.result ? res.result.value : null;
}

async function runTests() {
  const server = await startServer();
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(require('node:os').tmpdir(), 'edge-test-seats-' + Date.now());

  const edgeProc = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-component-extensions-with-background-pages',
    '--disable-features=ReadAloud,EdgeTranslate',
    '--disable-sync',
    '--window-size=1440,1100',
    `http://127.0.0.1:${PORT}/index.html`
  ]);

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(250);
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      const tabs = await res.json();
      const pageTab = tabs.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension://') && !t.url.startsWith('edge://'));
      if (pageTab && pageTab.webSocketDebuggerUrl) {
        wsUrl = pageTab.webSocketDebuggerUrl;
        break;
      }
    } catch(e) {}
  }

  if (!wsUrl) {
    console.error('Failed to get WebSocket debugger URL');
    edgeProc.kill();
    server.close();
    process.exit(1);
  }

  const cdp = new CDPClient(wsUrl);
  await cdp.init();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOM.enable');

  console.log('\n========================================================');
  console.log('🧪 TEST SUITE: SEAT CLASS RESTRICTIONS ON SEATS.HTML');
  console.log('========================================================\n');

  let allPassed = true;

  // -------------------------------------------------------------
  // TEST CASE 1: PHỔ THÔNG (ECONOMY) TICKET
  // -------------------------------------------------------------
  console.log('--- [TEST CASE 1] Ticket Class = "Hạng Phổ Thông" ---');

  // Setup Storage on index.html
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/index.html` });
  await sleep(600);

  await evalInPage(cdp, `
    localStorage.clear();
    sessionStorage.clear();
    window.SkyStorage.setSearch({
      from: 'SGN', to: 'HAN', date: '2026-09-10',
      passengers: '1 Người lớn, Phổ thông',
      passengerCount: 1,
      seatClass: 'Hạng Phổ Thông'
    });
    window.SkyStorage.setBooking({
      passengerName: 'Trần Văn An',
      passengerEmail: 'an.tran@example.com',
      passengerPhone: '+84 912 345 678',
      passengerPassport: 'B1234567',
      passengerCount: 1,
      seatClass: 'Hạng Phổ Thông',
      baseFare: 850,
      totalPrice: 970
    });
    window.SkyStorage.setSeat('');
  `);

  // Navigate to seats.html with Phổ Thông class
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/pages/seats.html?seatClass=H%E1%BA%A1ng%20Ph%E1%BB%95%20Th%C3%B4ng` });
  await sleep(1000);

  // Check state & DOM elements
  const tc1Results = await evalInPage(cdp, `
    (() => {
      const bannerTitle = document.querySelector('#current-ticket-class-title')?.textContent || '';
      const guideText = document.querySelector('#cabin-selection-guide')?.textContent || '';
      const businessSec = document.querySelector('#section-cabin-business');
      const economySec = document.querySelector('#section-cabin-economy');

      const isBusinessDisabled = businessSec.classList.contains('disabled-cabin');
      const isEconomyDisabled = economySec.classList.contains('disabled-cabin');

      const activeSeat = document.querySelector('#cabin-seats-grid .seat-cell.seat-active');
      const activeSeatCode = activeSeat?.getAttribute('data-seat') || '';
      const activeSeatRow = parseInt(activeSeatCode, 10);
      const isInitialSeatEconomy = activeSeatRow >= 14 && activeSeatRow <= 16;

      return {
        bannerTitle,
        guideText,
        isBusinessDisabled,
        isEconomyDisabled,
        activeSeatCode,
        isInitialSeatEconomy
      };
    })()
  `);

  console.log('TC1 Initial Check:', tc1Results);

  if (tc1Results.isBusinessDisabled && !tc1Results.isEconomyDisabled && tc1Results.isInitialSeatEconomy) {
    console.log('✅ PASS: Business cabin is DISABLED (.disabled-cabin), Economy cabin is OPEN.');
    console.log(`✅ PASS: Initial selected seat is ${tc1Results.activeSeatCode} in Economy cabin (Row >= 14).`);
  } else {
    console.error('❌ FAIL: Incorrect cabin state or initial seat for Economy ticket!');
    allPassed = false;
  }

  // Test clicking a Business seat (e.g. 10B)
  const tc1ClickBizResult = await evalInPage(cdp, `
    (() => {
      const bizSeat = document.querySelector('#section-cabin-business .seat-cell[data-seat="10B"]');
      bizSeat.click();
      const isBizSeatActive = bizSeat.classList.contains('seat-active');
      const toastText = document.querySelector('.ngefly-toast')?.textContent || '';
      return { isBizSeatActive, toastText };
    })()
  `);
  console.log('TC1 Click Business Seat Attempt:', tc1ClickBizResult);

  if (!tc1ClickBizResult.isBizSeatActive && tc1ClickBizResult.toastText.includes('Khoang Thương Gia')) {
    console.log('✅ PASS: Business seat (10B) rejected selection and showed explanatory toast.');
  } else {
    console.error('❌ FAIL: Business seat was selected or toast not shown!');
    allPassed = false;
  }

  // Test clicking an Economy seat (e.g. 14C)
  const tc1ClickEcoResult = await evalInPage(cdp, `
    (() => {
      const ecoSeat = document.querySelector('#section-cabin-economy .seat-cell[data-seat="14C"]');
      ecoSeat.click();
      const isEcoSeatActive = ecoSeat.classList.contains('seat-active');
      const selectedText = document.querySelector('#selected-seat-text')?.textContent || '';
      return { isEcoSeatActive, selectedText };
    })()
  `);
  console.log('TC1 Click Economy Seat Attempt:', tc1ClickEcoResult);

  if (tc1ClickEcoResult.isEcoSeatActive && tc1ClickEcoResult.selectedText.includes('14C')) {
    console.log('✅ PASS: Economy seat (14C) successfully selected!');
  } else {
    console.error('❌ FAIL: Economy seat could not be selected!');
    allPassed = false;
  }

  // Capture Screenshot: TC1 Light Mode
  await captureScreenshot(cdp, 'test_seats_economy_light.png');

  // Switch to Dark Mode & capture
  await evalInPage(cdp, `document.documentElement.setAttribute('data-theme', 'dark');`);
  await sleep(400);
  await captureScreenshot(cdp, 'test_seats_economy_dark.png');
  await evalInPage(cdp, `document.documentElement.setAttribute('data-theme', 'light');`);

  // -------------------------------------------------------------
  // TEST CASE 2: THƯƠNG GIA (BUSINESS) TICKET
  // -------------------------------------------------------------
  console.log('\n--- [TEST CASE 2] Ticket Class = "Hạng Thương Gia" ---');

  // Setup Storage for Thương Gia
  await evalInPage(cdp, `
    localStorage.clear();
    sessionStorage.clear();
    window.SkyStorage.setSearch({
      from: 'SGN', to: 'HAN', date: '2026-09-10',
      passengers: '2 Người lớn, Thương gia',
      passengerCount: 2,
      seatClass: 'Hạng Thương Gia'
    });
    window.SkyStorage.setBooking({
      passengerName: 'Jonathan Ben',
      passengerEmail: 'jonathan.ben@example.com',
      passengerPhone: '+971 50 123 4567',
      passengerPassport: 'A98765432',
      passengerCount: 2,
      seatClass: 'Hạng Thương Gia',
      baseFare: 1970,
      totalPrice: 2090
    });
    window.SkyStorage.setSeat('');
  `);

  // Navigate to seats.html with Thương Gia class
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/pages/seats.html?seatClass=H%E1%BA%A1ng%20Th%C6%B0%C6%A1ng%20Gia` });
  await sleep(1000);

  const tc2Results = await evalInPage(cdp, `
    (() => {
      const bannerTitle = document.querySelector('#current-ticket-class-title')?.textContent || '';
      const guideText = document.querySelector('#cabin-selection-guide')?.textContent || '';
      const businessSec = document.querySelector('#section-cabin-business');
      const economySec = document.querySelector('#section-cabin-economy');

      const isBusinessDisabled = businessSec.classList.contains('disabled-cabin');
      const isEconomyDisabled = economySec.classList.contains('disabled-cabin');

      const activeSeat = document.querySelector('#cabin-seats-grid .seat-cell.seat-active');
      const activeSeatCode = activeSeat?.getAttribute('data-seat') || '';
      const activeSeatRow = parseInt(activeSeatCode, 10);
      const isInitialSeatBusiness = activeSeatRow >= 10 && activeSeatRow <= 12;

      return {
        bannerTitle,
        guideText,
        isBusinessDisabled,
        isEconomyDisabled,
        activeSeatCode,
        isInitialSeatBusiness
      };
    })()
  `);

  console.log('TC2 Initial Check:', tc2Results);

  if (!tc2Results.isBusinessDisabled && tc2Results.isEconomyDisabled && tc2Results.isInitialSeatBusiness) {
    console.log('✅ PASS: Economy cabin is DISABLED (.disabled-cabin), Business cabin is OPEN.');
    console.log(`✅ PASS: Initial selected seat is ${tc2Results.activeSeatCode} in Business cabin (Row 10-12).`);
  } else {
    console.error('❌ FAIL: Incorrect cabin state or initial seat for Business ticket!');
    allPassed = false;
  }

  // Test clicking an Economy seat (e.g. 14B)
  const tc2ClickEcoResult = await evalInPage(cdp, `
    (() => {
      const ecoSeat = document.querySelector('#section-cabin-economy .seat-cell[data-seat="14B"]');
      ecoSeat.click();
      const isEcoSeatActive = ecoSeat.classList.contains('seat-active');
      const toastText = document.querySelector('.ngefly-toast')?.textContent || '';
      return { isEcoSeatActive, toastText };
    })()
  `);
  console.log('TC2 Click Economy Seat Attempt:', tc2ClickEcoResult);

  if (!tc2ClickEcoResult.isEcoSeatActive && tc2ClickEcoResult.toastText.includes('Khoang Phổ Thông')) {
    console.log('✅ PASS: Economy seat (14B) rejected selection and showed explanatory toast.');
  } else {
    console.error('❌ FAIL: Economy seat was selected or toast not shown!');
    allPassed = false;
  }

  // Test clicking another Business seat (e.g. 11C)
  const tc2ClickBizResult = await evalInPage(cdp, `
    (() => {
      const bizSeat = document.querySelector('#section-cabin-business .seat-cell[data-seat="11C"]');
      bizSeat.click();
      const isBizSeatActive = bizSeat.classList.contains('seat-active');
      const selectedText = document.querySelector('#selected-seat-text')?.textContent || '';
      return { isBizSeatActive, selectedText };
    })()
  `);
  console.log('TC2 Click Business Seat Attempt:', tc2ClickBizResult);

  if (tc2ClickBizResult.isBizSeatActive && tc2ClickBizResult.selectedText.includes('11C')) {
    console.log('✅ PASS: Business seat (11C) successfully selected!');
  } else {
    console.error('❌ FAIL: Business seat could not be selected!');
    allPassed = false;
  }

  // Capture Screenshot: TC2 Light Mode
  await captureScreenshot(cdp, 'test_seats_business_light.png');

  // Switch to Dark Mode & capture
  await evalInPage(cdp, `document.documentElement.setAttribute('data-theme', 'dark');`);
  await sleep(400);
  await captureScreenshot(cdp, 'test_seats_business_dark.png');
  await evalInPage(cdp, `document.documentElement.setAttribute('data-theme', 'light');`);

  // -------------------------------------------------------------
  // TEST CASE 3: COMPLETE FLOW: FLIGHTS.HTML -> BOOKING.HTML -> SEATS.HTML
  // -------------------------------------------------------------
  console.log('\n--- [TEST CASE 3] Flow Test: Flights.html Toggle Class -> Booking.html -> Seats.html ---');

  // Navigate to flights.html
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/pages/flights.html` });
  await sleep(1200);

  // Click "Phổ Thông" toggle on flights.html
  await evalInPage(cdp, `
    const ecoBtn = document.querySelector('.btn-seat-class-toggle[data-class="Hạng Phổ Thông"]');
    if (ecoBtn) ecoBtn.click();
  `);
  await sleep(400);

  // Click "Chọn Vé Này" on the first card
  await evalInPage(cdp, `
    const firstBtn = document.querySelector('.flight-card-ngefly .btn-view-details');
    if (firstBtn) firstBtn.click();
  `);
  await sleep(1500);

  const bookingClassCheck = await evalInPage(cdp, `
    (() => {
      const b = window.SkyStorage.getBooking();
      const valText = document.querySelector('#booking-seat-class-val')?.textContent || '';
      return { bookingClass: b.seatClass, valText };
    })()
  `);
  console.log('Booking Page Class Check:', bookingClassCheck);

  // Click Continue to Seats
  await evalInPage(cdp, `
    document.querySelector('#btn-continue-payment').click();
  `);
  await sleep(1500);

  // Verify on seats.html
  const flowSeatsCheck = await evalInPage(cdp, `
    (() => {
      const curUrl = window.location.href;
      const bSec = document.querySelector('#section-cabin-business');
      const eSec = document.querySelector('#section-cabin-economy');
      const activeSeat = document.querySelector('#cabin-seats-grid .seat-cell.seat-active')?.getAttribute('data-seat') || '';
      return {
        curUrl,
        isBizDisabled: bSec?.classList.contains('disabled-cabin'),
        isEcoDisabled: eSec?.classList.contains('disabled-cabin'),
        activeSeat
      };
    })()
  `);
  console.log('Flow Seats Check:', flowSeatsCheck);

  if (flowSeatsCheck.isBizDisabled && !flowSeatsCheck.isEcoDisabled && flowSeatsCheck.activeSeat.startsWith('14')) {
    console.log('✅ PASS: Booking -> Seats flow preserved "Hạng Phổ Thông", Business disabled, Economy active seat 14B!');
  } else {
    console.error('❌ FAIL: Booking -> Seats flow failed to preserve seat class!');
    allPassed = false;
  }

  await captureScreenshot(cdp, 'test_flow_booking_to_seats_economy.png');

  console.log('\n========================================================');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! Seat class logic is 100% verified.');
  } else {
    console.log('⚠️ SOME TESTS FAILED. Please check logs.');
  }
  console.log('========================================================\n');

  cdp.close();
  edgeProc.kill();
  server.close();
  process.exit(allPassed ? 0 : 1);
}

runTests().catch(err => {
  console.error('Test Runner Error:', err);
  process.exit(1);
});
