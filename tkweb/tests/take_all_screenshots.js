const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const PORT = 4570;
const CDP_PORT = 9226;
const ROOT_DIR = path.resolve(__dirname, '..');
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

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

async function main() {
  const server = await startServer();
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(require('node:os').tmpdir(), 'edge-ss-' + Date.now());

  const edgeProc = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-sync',
    '--window-size=1440,900',
    'about:blank'
  ]);

  // Wait for Edge CDP port
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(250);
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      const tabs = await res.json();
      const pageTab = tabs.find(t => t.type === 'page');
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

  const client = new CDPClient(wsUrl);
  await client.init();

  await client.send('Page.enable');
  await client.send('DOM.enable');

  // Pre-inject test fixtures (Admin credentials + Rich realistic booking state)
  await client.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      try {
        const adminUser = {
          id: 999999,
          name: "Quản Trị Viên Hệ Thống",
          email: "admin-test@flynest.vn",
          role: "admin",
          roleTitle: "Quản Trị Viên Hệ Thống (Test)",
          skyMiles: 99999,
          tier: "Diamond Admin"
        };
        localStorage.setItem('flynest_user', JSON.stringify(adminUser));
        localStorage.setItem('ngefly_user', JSON.stringify(adminUser));

        const bookingState = {
          flight: {
            airline: "FlyNest Airlines",
            flightNumber: "SW-882",
            aircraft: "Boeing 787-9 Dreamliner",
            from: "SGN",
            to: "HAN",
            departureCity: "TP. Hồ Chí Minh",
            arrivalCity: "Hà Nội",
            departureTime: "07:40 AM",
            arrivalTime: "09:50 AM",
            duration: "02h 10m",
            price: 48856000,
            priceFormatted: "48.856.000 ₫"
          },
          seatClass: "Hạng Thương Gia",
          passengerName: "Jonathan Ben",
          passengerEmail: "jonathan.ben@example.com",
          passengerPhone: "0901234567",
          passengerPassport: "A98765432",
          selectedSeat: "10F",
          seatPrice: 620000,
          taxPrice: 2976000,
          hotelCombo: true,
          hotelDiscount: 3720000,
          totalPrice: 48112000,
          totalPriceFormatted: "48.112.000 ₫",
          pnr: "SW882-JB789",
          qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SW882-JB789"
        };
        localStorage.setItem('flynest_booking_data', JSON.stringify(bookingState));
        localStorage.setItem('ngefly_booking_data', JSON.stringify(bookingState));
        localStorage.setItem('selected_seat', '10F');
        localStorage.setItem('ngefly_selected_seat', '10F');
        localStorage.setItem('ngefly_pnr', 'SW882-JB789');
      } catch(e) {}
    `
  });

  const pagesToCapture = [
    // 1. Homepage (Trang Chủ)
    { name: '01_homepage_light', url: `http://127.0.0.1:${PORT}/index.html`, theme: 'light', width: 1440, height: 900, aliases: ['index.png'] },
    { name: '01_homepage_dark', url: `http://127.0.0.1:${PORT}/index.html?theme=dark`, theme: 'dark', width: 1440, height: 900 },

    // 2. Flights (Danh Sách Chuyến Bay)
    { name: '02_flights_view_light', url: `http://127.0.0.1:${PORT}/pages/flights.html`, theme: 'light', width: 1440, height: 900, aliases: ['pages_flights.png', '02_flights_light.png'] },
    { name: '02_flights_view_dark', url: `http://127.0.0.1:${PORT}/pages/flights.html?theme=dark`, theme: 'dark', width: 1440, height: 900, aliases: ['02_flights_dark.png', '02_flights_schedule_dark.png'] },

    // 3. Schedule (Lịch Trình Chi Tiết)
    { name: '03_schedule_desktop_light', url: `http://127.0.0.1:${PORT}/pages/schedule.html`, theme: 'light', width: 1440, height: 900, aliases: ['10_schedule_desktop_light.png'] },
    { name: '03_schedule_desktop_dark', url: `http://127.0.0.1:${PORT}/pages/schedule.html?theme=dark`, theme: 'dark', width: 1440, height: 900, aliases: ['11_schedule_desktop_dark.png'] },

    // 4. Booking (Chi Tiết Đặt Chỗ)
    { name: '04_booking_light', url: `http://127.0.0.1:${PORT}/pages/booking.html`, theme: 'light', width: 1440, height: 900, aliases: ['03_booking_light.png', 'pages_booking.png'] },
    { name: '04_booking_dark', url: `http://127.0.0.1:${PORT}/pages/booking.html?theme=dark`, theme: 'dark', width: 1440, height: 900 },

    // 5. Seats (Sơ Đồ Ghế Ngồi 3D)
    { name: '05_seats_light', url: `http://127.0.0.1:${PORT}/pages/seats.html`, theme: 'light', width: 1440, height: 900, aliases: ['04_seats_light.png', 'pages_seats.png'] },
    { name: '05_seats_dark', url: `http://127.0.0.1:${PORT}/pages/seats.html?theme=dark`, theme: 'dark', width: 1440, height: 900 },

    // 6. Payment (Cổng Thanh Toán Đa Kênh)
    { name: '06_payment_light', url: `http://127.0.0.1:${PORT}/pages/payment.html`, theme: 'light', width: 1440, height: 900, aliases: ['05_payment_light.png', 'pages_payment.png'] },
    { name: '06_payment_dark', url: `http://127.0.0.1:${PORT}/pages/payment.html?theme=dark`, theme: 'dark', width: 1440, height: 900 },

    // 7. Ticket (Thẻ Lên Tàu Bay Boarding Pass)
    { name: '07_ticket_light', url: `http://127.0.0.1:${PORT}/pages/ticket.html`, theme: 'light', width: 1440, height: 900, aliases: ['06_ticket_boarding_pass.png', 'pages_ticket.png'] },
    { name: '07_ticket_dark', url: `http://127.0.0.1:${PORT}/pages/ticket.html?theme=dark`, theme: 'dark', width: 1440, height: 900 },

    // 8. Login (Đăng Nhập)
    { name: '08_login_light', url: `http://127.0.0.1:${PORT}/pages/login.html`, theme: 'light', width: 1440, height: 900, aliases: ['07_login_light.png', 'pages_login.png'] },
    { name: '08_login_dark', url: `http://127.0.0.1:${PORT}/pages/login.html?theme=dark`, theme: 'dark', width: 1440, height: 900 },

    // 9. Register (Đăng Ký)
    { name: '09_register_light', url: `http://127.0.0.1:${PORT}/pages/register.html`, theme: 'light', width: 1440, height: 900, aliases: ['08_register_light.png', 'pages_register.png'] },
    { name: '09_register_dark', url: `http://127.0.0.1:${PORT}/pages/register.html?theme=dark`, theme: 'dark', width: 1440, height: 900 },

    // 10. Admin Dashboard
    { name: '10_admin_dashboard_light', url: `http://127.0.0.1:${PORT}/admin/index.html`, theme: 'light', width: 1440, height: 900, requiresAdminSession: true },
    { name: '10_admin_dashboard_dark', url: `http://127.0.0.1:${PORT}/admin/index.html?theme=dark`, theme: 'dark', width: 1440, height: 900, requiresAdminSession: true, aliases: ['09_admin_dashboard_dark.png', 'admin_index.png'] },

    // 11. Admin Website Editor (CMS)
    { name: '11_admin_website_editor_light', url: `http://127.0.0.1:${PORT}/admin/index.html#website-editor`, theme: 'light', width: 1440, height: 900, requiresAdminSession: true, aliases: ['12_admin_website_editor_light.png'] },
    { name: '11_admin_website_editor_dark', url: `http://127.0.0.1:${PORT}/admin/index.html#website-editor?theme=dark`, theme: 'dark', width: 1440, height: 900, requiresAdminSession: true },

    // 12. Mobile Homepage
    { name: '12_mobile_homepage_light', url: `http://127.0.0.1:${PORT}/index.html`, theme: 'light', width: 375, height: 812, mobile: true, aliases: ['13_mobile_homepage_light.png'] },
    { name: '12_mobile_homepage_dark', url: `http://127.0.0.1:${PORT}/index.html?theme=dark`, theme: 'dark', width: 375, height: 812, mobile: true },

    // 13. Mobile Schedule
    { name: '13_mobile_schedule_light', url: `http://127.0.0.1:${PORT}/pages/schedule.html`, theme: 'light', width: 375, height: 812, mobile: true, aliases: ['14_mobile_schedule_light.png'] },
    { name: '13_mobile_schedule_dark', url: `http://127.0.0.1:${PORT}/pages/schedule.html?theme=dark`, theme: 'dark', width: 375, height: 812, mobile: true }
  ];

  console.log(`\n📸 Starting Full-Page Screenshot Capture for ${pagesToCapture.length} views (Light & Dark)...`);

  const summary = [];

  for (const item of pagesToCapture) {
    console.log(`\n▶ [${item.theme.toUpperCase()}] Navigating to: ${item.name} (${item.url})`);
    
    // Initial viewport set
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: item.width || 1440,
      height: item.height || 900,
      deviceScaleFactor: item.mobile ? 2 : 1,
      mobile: Boolean(item.mobile)
    });

    await client.send('Page.navigate', { url: item.url });
    await sleep(1400);

    // Apply explicit theme in document
    await client.send('Runtime.evaluate', {
      expression: `
        document.documentElement.setAttribute('data-theme', '${item.theme}');
        try {
          localStorage.setItem('ngefly_theme', '${item.theme}');
          localStorage.setItem('flynest_theme', '${item.theme}');
          const btns = document.querySelectorAll('#theme-toggle-btn, #theme-toggle');
          btns.forEach(b => b.textContent = '${item.theme}' === 'dark' ? '☀️' : '🌙');
        } catch(e) {}
      `
    });
    await sleep(400);

    // Measure the real full-scroll height of the entire page
    const heightMetrics = await client.send('Runtime.evaluate', {
      expression: `
        (function() {
          const body = document.body;
          const html = document.documentElement;
          return Math.max(
            body ? body.scrollHeight : 0,
            body ? body.offsetHeight : 0,
            html ? html.clientHeight : 0,
            html ? html.scrollHeight : 0,
            html ? html.offsetHeight : 0
          );
        })()
      `,
      returnByValue: true
    });
    
    const contentHeight = Math.max(heightMetrics.result ? (heightMetrics.result.value || 900) : 900, item.height || 900);

    // Override device metrics to full scroll height to render entire page
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: item.width || 1440,
      height: contentHeight,
      deviceScaleFactor: item.mobile ? 2 : 1,
      mobile: Boolean(item.mobile)
    });
    await sleep(350);

    // Capture screenshot of the entire page
    const ssResult = await client.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true
    });

    const fileName = `${item.name}.png`;
    const filePath = path.join(SCREENSHOT_DIR, fileName);
    const buffer = Buffer.from(ssResult.data, 'base64');
    fs.writeFileSync(filePath, buffer);
    const kbSize = (buffer.length / 1024).toFixed(1);
    console.log(`  ✅ Saved Full Page: ${fileName} [${item.width}x${contentHeight}] (${kbSize} KB)`);
    summary.push({ name: fileName, width: item.width, height: contentHeight, size: `${kbSize} KB` });

    // Save backward-compatible aliases
    if (item.aliases && item.aliases.length) {
      for (const alias of item.aliases) {
        const aliasPath = path.join(SCREENSHOT_DIR, alias);
        fs.writeFileSync(aliasPath, buffer);
        console.log(`     ↳ Alias saved: ${alias}`);
      }
    }

    // Reset viewport back to standard
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: item.width || 1440,
      height: item.height || 900,
      deviceScaleFactor: item.mobile ? 2 : 1,
      mobile: Boolean(item.mobile)
    });
  }

  console.log('\n================================================================================');
  console.log(`🎉 ALL ${summary.length} FULL-PAGE SCREENSHOTS (LIGHT & DARK) CAPTURED SUCCESSFULLY!`);
  console.log('================================================================================\n');

  client.close();
  edgeProc.kill();
  server.close();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
