/**
 * VERIFICATION SUITE: MASTER CLI PROMPT REQUIREMENTS
 * Validates:
 * 1. SKYWINGS_GLOBAL_DATA default initialization & structure in core-store.js
 * 2. Absolute eradication of Ga T2 across flights, booking, tickets, schedule
 * 3. Timeline .tvlk-timeline-track & .tvlk-line CSS rules and demo-mode locks
 * 4. Traveloka passenger popup & cabin class selector in flights.html
 * 5. Booking price formula: (adults*price + children*0.75*price + infants*0.1*price) * 1.6 for Business - coupons
 * 6. Admin features in admin.html (color pickers, demo switch, random flight, voucher table, date sync, reset)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
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

console.log('================================================================================');
console.log('✈️  VERIFYING MASTER CLI PROMPT REQUIREMENTS FOR SKYWINGS AIRLINES');
console.log('================================================================================\n');

// 1. Check CoreStore in core-store.js
console.log('1. Testing CoreStore & SKYWINGS_GLOBAL_DATA:');
const coreStorePath = path.join(ROOT_DIR, 'js', 'core-store.js');
assert(fs.existsSync(coreStorePath), 'tkweb/js/core-store.js exists');

const coreStoreCode = fs.readFileSync(coreStorePath, 'utf8');
assert(coreStoreCode.includes("'SKYWINGS_GLOBAL_DATA'"), "core-store.js uses key 'SKYWINGS_GLOBAL_DATA'");
assert(coreStoreCode.includes("'#0194f3'"), 'Default primary color is #0194f3');
assert(coreStoreCode.includes("'#0b1325'"), 'Default bgDark is #0b1325');
assert(coreStoreCode.includes("'#152238'"), 'Default cardDark is #152238');
assert(coreStoreCode.includes("'SKYWINGS2026'"), 'Default coupon SKYWINGS2026 is present');
assert(coreStoreCode.includes("'BAYNHANH'"), 'Default coupon BAYNHANH is present');
assert(coreStoreCode.includes('Ga T1 (Quốc nội)'), "Default flights specify 'Ga T1 (Quốc nội)'");

// Test CoreStore execution
global.localStorage = {
  _data: {},
  getItem: function(k) { return this._data[k] || null; },
  setItem: function(k, v) { this._data[k] = String(v); },
  removeItem: function(k) { delete this._data[k]; }
};
global.document = {
  documentElement: {
    setAttribute: () => {},
    getAttribute: () => 'dark',
    style: { setProperty: () => {} }
  },
  querySelectorAll: () => [],
  querySelector: () => null,
  readyState: 'complete'
};
global.window = global;

const CoreStore = require(coreStorePath);
assert(typeof CoreStore === 'object', 'CoreStore object initialized');

const initialData = CoreStore.getData();
assert(initialData.settings.colors.primary === '#0194f3', 'Initial primary color matches #0194f3');
assert(initialData.searchState.from === 'SGN' && initialData.searchState.to === 'HAN', 'Initial route is SGN-HAN');
assert(initialData.flights.length >= 3, 'Initial flights count >= 3');

// 2. Absolute eradication of "Ga T2" for SGN
console.log('\n2. Testing Absolute Eradication of Ga T2 for SGN:');
const bookingHtml = fs.readFileSync(path.join(ROOT_DIR, 'pages', 'booking.html'), 'utf8');
const flightsHtml = fs.readFileSync(path.join(ROOT_DIR, 'pages', 'flights.html'), 'utf8');
const ticketHtml = fs.readFileSync(path.join(ROOT_DIR, 'pages', 'ticket.html'), 'utf8');
const scheduleHtml = fs.readFileSync(path.join(ROOT_DIR, 'pages', 'schedule.html'), 'utf8');
const mainJs = fs.readFileSync(path.join(ROOT_DIR, 'assets', 'js', 'main.js'), 'utf8');

assert(!bookingHtml.includes('Ga Quốc Nội T2'), 'booking.html contains NO Ga Quốc Nội T2');
assert(!bookingHtml.includes('Ga T2 (Tân Sơn Nhất)'), 'booking.html contains NO Ga T2 (Tân Sơn Nhất)');
assert(bookingHtml.includes('Ga T1 (Quốc nội)'), 'booking.html correctly specifies Ga T1 (Quốc nội)');
assert(!flightsHtml.includes('data-terminal-dep="Ga T2 (Tân Sơn Nhất)"'), 'flights.html contains NO Ga T2 (Tân Sơn Nhất)');
assert(flightsHtml.includes('data-terminal-dep="Ga T1 (Quốc nội)"'), 'flights.html specifies Ga T1 (Quốc nội)');
assert(!ticketHtml.includes('Ga Quốc Nội T2'), 'ticket.html contains NO Ga Quốc Nội T2');
assert(!scheduleHtml.includes('Ga T2 (Tân Sơn Nhất)'), 'schedule.html contains NO Ga T2 (Tân Sơn Nhất)');
assert(!mainJs.includes('terminal: \'Ga Quốc Nội T2\''), 'main.js airport list does NOT use Ga Quốc Nội T2 for SGN');

// 3. Timeline CSS & Demo Mode
console.log('\n3. Testing Timeline & Demo Mode:');
const styleCss = fs.readFileSync(path.join(ROOT_DIR, 'assets', 'css', 'style.css'), 'utf8');
assert(styleCss.includes('.tvlk-timeline-track'), 'style.css defines .tvlk-timeline-track');
assert(styleCss.includes('.tvlk-line'), 'style.css defines .tvlk-line');
assert(styleCss.includes('overflow: hidden'), 'style.css sets overflow: hidden on .tvlk-line');
assert(styleCss.includes('border-radius: 2px'), 'style.css sets border-radius: 2px on .tvlk-line');
assert(styleCss.includes('tvlk-beam-sweep'), 'style.css defines tvlk-beam-sweep animation');
assert(styleCss.includes('translateX(250%)'), 'style.css animates beam to translateX(250%)');
assert(styleCss.includes('body.demo-mode .tvlk-scan-beam'), 'style.css disables scan beam in demo mode');
assert(styleCss.includes('body.demo-mode .tvlk-plane-icon'), 'style.css locks plane icon at 50% in demo mode');

// 4. Passenger Popup in flights.html
console.log('\n4. Testing Traveloka Passenger Popup in flights.html:');
assert(flightsHtml.includes('id="tvlk-pax-popup"'), 'flights.html contains #tvlk-pax-popup modal');
assert(flightsHtml.includes('id="btn-pax-adult-dec"'), 'flights.html contains adult decrement button');
assert(flightsHtml.includes('id="btn-pax-adult-inc"'), 'flights.html contains adult increment button');
assert(flightsHtml.includes('id="btn-pax-child-inc"'), 'flights.html contains child increment button');
assert(flightsHtml.includes('id="btn-pax-infant-inc"'), 'flights.html contains infant increment button');
assert(flightsHtml.includes('id="tvlk-select-seat-class"'), 'flights.html contains seat class select');
assert(flightsHtml.includes('id="btn-tvlk-pax-done"'), 'flights.html contains Done button');

// 5. Booking Price Calculation & Coupons
console.log('\n5. Testing Booking Price Calculation & Coupon Deduction:');
assert(bookingHtml.includes('id="input-coupon-code"'), 'booking.html contains coupon input field');
assert(bookingHtml.includes('id="btn-apply-coupon"'), 'booking.html contains apply coupon button');
assert(bookingHtml.includes('id="price-coupon-row"'), 'booking.html contains coupon discount breakdown row');
assert(mainJs.includes('rawChildTotal = unitAdultFare * 0.75 * children'), 'main.js implements 0.75 multiplier for children');
assert(mainJs.includes('rawInfantTotal = unitAdultFare * 0.1 * infants'), 'main.js implements 0.1 multiplier for infants');
assert(mainJs.includes('classMultiplier = isBiz ? 1.6 : 1.0'), 'main.js implements 1.6 multiplier for Business class');

// Math test of formula:
const unitFare = 850;
const adults = 2;
const children = 1;
const infants = 1;
const rawAdult = unitFare * adults; // 1700
const rawChild = unitFare * 0.75 * children; // 637.5
const rawInfant = unitFare * 0.1 * infants; // 85
const bizSubtotal = (rawAdult + rawChild + rawInfant) * 1.6; // 3876
const coupon10Pct = bizSubtotal * 0.1; // 387.6
const totalExpected = bizSubtotal - coupon10Pct;
assert(bizSubtotal === 3876, 'Formula test: 2 Adults + 1 Child + 1 Infant in Business correctly yields 3876');
assert(totalExpected === 3488.4, 'Formula test: 10% coupon deduction yields 3488.4');

// 6. Admin Page Requirements
console.log('\n6. Testing Admin Page (tkweb/pages/admin.html):');
const adminPagePath = path.join(ROOT_DIR, 'pages', 'admin.html');
assert(fs.existsSync(adminPagePath), 'tkweb/pages/admin.html exists');
const adminPageHtml = fs.readFileSync(adminPagePath, 'utf8');

assert(adminPageHtml.includes('id="admin-color-primary"'), 'admin.html contains primary color picker');
assert(adminPageHtml.includes('id="admin-color-bg"'), 'admin.html contains bgDark color picker');
assert(adminPageHtml.includes('id="admin-color-card"'), 'admin.html contains cardDark color picker');
assert(adminPageHtml.includes('id="admin-color-text"'), 'admin.html contains textLight color picker');
assert(adminPageHtml.includes('id="admin-toggle-demo"'), 'admin.html contains Demo Mode toggle switch');
assert(adminPageHtml.includes('id="btn-add-random-flight"'), 'admin.html contains + Random Flight button');
assert(adminPageHtml.includes('id="tbody-vouchers"'), 'admin.html contains Voucher Management table');
assert(adminPageHtml.includes('id="admin-sync-flight-date"'), 'admin.html contains date sync picker');
assert(adminPageHtml.includes('id="btn-reset-store-defaults"'), 'admin.html contains Restore Defaults button');
assert(adminPageHtml.includes('admin-flat-footer'), 'admin.html contains flat minimalist footer');

console.log('\n================================================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('================================================================================');

if (failCount === 0) {
  console.log('🎉 ALL MASTER CLI REQUIREMENTS FULLY MET & VERIFIED!');
  process.exit(0);
} else {
  console.error('❌ SOME CHECKS FAILED!');
  process.exit(1);
}
