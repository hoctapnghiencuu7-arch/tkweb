
const AIRLINE_SVG_MAP = {
  'FlyNest Airlines': 'flynest.svg',
  'Vietnam Airlines': 'vietnam-airlines.svg',
  'Bamboo Airways': 'bamboo-airways.svg',
  'Vietjet Air': 'vietjet-air.svg',
  'Vietravel Airlines': 'vietravel-airlines.svg',
  'Singapore Airlines': 'singapore-airlines.svg',
  'Emirates': 'emirates.svg',
  'Qatar Airways': 'qatar-airways.svg',
  'Flydubai': 'flydubai.svg',
  'Saudia': 'saudia.svg',
  'Ondy Air': 'ondy-air.svg',
  'Khang Air': 'khang-air.svg',
  'Dtw Airlines': 'dtw-airlines.svg'
};

/**
 * Normalizes airline name or logo path to a clean SVG filename within assets/images/airlines/
 * Strips path prefixes ('../assets/images/airlines/emirates.svg' -> 'emirates.svg'),
 * handles case-insensitivity, and falls back gracefully to 'flynest.svg'.
 */
function resolveAirlineLogoFilename(airline, rawLogo) {
  if (rawLogo && typeof rawLogo === 'string') {
    const trimmed = rawLogo.trim();
    const cleanName = trimmed.split('/').pop().split('\\').pop().trim();
    if (cleanName.toLowerCase().endsWith('.svg') && cleanName.length > 4) {
      const knownFiles = Object.values(AIRLINE_SVG_MAP);
      const lowerClean = cleanName.toLowerCase();
      const matched = knownFiles.find(f => f.toLowerCase() === lowerClean);
      if (matched) return matched;
      return cleanName;
    }
  }

  if (airline && typeof airline === 'string') {
    const trimmed = airline.trim();
    if (AIRLINE_SVG_MAP[trimmed]) {
      return AIRLINE_SVG_MAP[trimmed];
    }
    const lower = trimmed.toLowerCase();
    for (const [name, file] of Object.entries(AIRLINE_SVG_MAP)) {
      if (name.toLowerCase() === lower) return file;
    }
    for (const [name, file] of Object.entries(AIRLINE_SVG_MAP)) {
      const nLower = name.toLowerCase();
      if (lower.includes(nLower) || nLower.includes(lower)) return file;
    }
  }

  return 'flynest.svg';
}
if (typeof window !== 'undefined') {
  window.resolveAirlineLogoFilename = resolveAirlineLogoFilename;
}

/**
 * Global fallback handler for airline logo asset load failures (UI-022)
 * Uses event capture (useCapture: true) to intercept image error events across the entire site.
 */
function initAirlineAssetFallbacks() {
  if (typeof window === 'undefined') return;
  if (window.__airlineFallbackInitialized) return;
  window.__airlineFallbackInitialized = true;
  window.addEventListener('error', function(event) {
    const target = event.target;
    if (target && target.tagName === 'IMG') {
      const isAirlineImg = target.classList.contains('airline-card-badge') ||
                           target.classList.contains('chip-logo-img') ||
                           target.classList.contains('airline-logo-img') ||
                           Boolean(target.closest && target.closest('.airline-logo')) ||
                           Boolean(target.closest && target.closest('.airline-logo-circle')) ||
                           (target.src && target.src.includes('/airlines/'));
      if (isAirlineImg) {
        if (!target.dataset.fallback) {
          target.dataset.fallback = '1';
          const isSubpage = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/admin/');
          target.src = isSubpage ? '../assets/images/airlines/flynest.svg' : 'assets/images/airlines/flynest.svg';
        } else {
          target.style.display = 'none';
        }
      }
    }
  }, true);
}
if (typeof window !== 'undefined') {
  initAirlineAssetFallbacks();
}
/**
 * FlyNest - Flight Booking Interactive Logic, 3D Runway Engine & State Management
 * Features: Three.js 3D Airport Runway Animation, Web Audio Sound Synthesis,
 *           Complete End-to-End Flight Booking Funnel with localStorage State Flow.
 */

// Immediate theme & hardware performance synchronization before DOM load
(function() {
  try {
    const urlP = new URLSearchParams(window.location.search);
    const hashTheme = window.location.hash.includes('theme=dark') ? 'dark' : (window.location.hash.includes('theme=light') ? 'light' : null);
    const t = urlP.get('theme') || hashTheme || localStorage.getItem('ngefly_theme') || 'light';
    document.documentElement.setAttribute('data-theme-disabled', t);

    // Hardware capability & battery saver detection
    const urlPerf = urlP.get('perf');
    let perf = urlPerf || localStorage.getItem('flynest_perf_mode');
    if (!perf) {
      const cores = navigator.hardwareConcurrency || 4;
      const mem = navigator.deviceMemory || 4;
      const saveData = Boolean(navigator.connection && navigator.connection.saveData);
      const prefersReduced = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      perf = (cores <= 4 || mem <= 4 || saveData || prefersReduced || window.innerWidth <= 768) ? 'eco' : 'standard';
    }
    document.documentElement.setAttribute('data-perf-mode', perf);
    window.__perfMode = perf;
    window.__ecoMode = (perf === 'eco');
  } catch(e) {}
})();

document.addEventListener('DOMContentLoaded', () => {
  initAirlineAssetFallbacks();
  initPerformanceMode();
  initThreeJSRunway();
  initAudioSynthesis();
  initThemeSupport();
  initFloatingCardTabs();
  initSearchFormInteractions();
  initFlightsPage();
  initSchedulePage();
  initBookingPage();
  initSeatsPage();
  initPaymentPage();
  initTicketPage();
  initMobileDrawer();
  initSmoothPageTransitions();
  // initInertialSmoothScroll(); // Tắt cuộn chuột quán tính, sử dụng cuộn tự nhiên của trình duyệt
  initScrollReveal();
  initFloatingPillHeader();
  initNavbarActiveState();
  initAuthUI();
  initAdminPage();
  initFooterFeatures();
  initVendorEnhancements();
  initAnimatedBanners();
  initSiteContentSync();
});

/* ==============================================================================
   DATA DEFINITIONS & STORAGE MANAGEMENT (CENTRALIZED STATE STORE)
   ============================================================================== */
const AIRPORTS = {
  SGN: { code: 'SGN', city: 'TP. Hồ Chí Minh', airportName: 'Sân bay Quốc tế Tân Sơn Nhất', country: 'Việt Nam', label: 'SGN, TP. Hồ Chí Minh (Tân Sơn Nhất)', terminal: 'Ga T1 (Quốc nội)' },
  HAN: { code: 'HAN', city: 'Hà Nội', airportName: 'Sân bay Quốc tế Nội Bài', country: 'Việt Nam', label: 'HAN, Hà Nội (Nội Bài)', terminal: 'Ga Quốc Nội T1' },
  DAD: { code: 'DAD', city: 'Đà Nẵng', airportName: 'Sân bay Quốc tế Đà Nẵng', country: 'Việt Nam', label: 'DAD, Đà Nẵng', terminal: 'Ga Quốc Tế T1' },
  PQC: { code: 'PQC', city: 'Phú Quốc', airportName: 'Sân bay Quốc tế Phú Quốc', country: 'Việt Nam', label: 'PQC, Phú Quốc', terminal: 'Ga T1' },
  CXR: { code: 'CXR', city: 'Nha Trang', airportName: 'Sân bay Quốc tế Cam Ranh', country: 'Việt Nam', label: 'CXR, Nha Trang (Cam Ranh)', terminal: 'Ga T1' },
  SIN: { code: 'SIN', city: 'Singapore', airportName: 'Sân bay Quốc tế Changi', country: 'Singapore', label: 'SIN, Singapore (Changi)', terminal: 'Terminal T3' },
  BKK: { code: 'BKK', city: 'Bangkok', airportName: 'Sân bay Quốc tế Suvarnabhumi', country: 'Thái Lan', label: 'BKK, Bangkok (Suvarnabhumi)', terminal: 'Terminal T2' },
  DXB: { code: 'DXB', city: 'Dubai', airportName: 'Sân bay Quốc tế Dubai', country: 'UAE', label: 'DXB, Dubai (United Arab Emirates)', terminal: 'Terminal 3' },
  RUH: { code: 'RUH', city: 'Riyadh', airportName: 'Sân bay Quốc tế King Khalid', country: 'Saudi Arabia', label: 'RUH, Riyadh (King Khalid)', terminal: 'Terminal 2' }
};

const DEFAULT_STATE = {
  search: {
    from: 'SGN',
    to: 'HAN',
    fromCity: 'TP. Hồ Chí Minh (Tân Sơn Nhất)',
    toCity: 'Hà Nội (Nội Bài)',
    date: '2026-09-10',
    returnDate: '2026-09-18',
    passengers: '2 Người lớn, Hạng Thương gia',
    passengerCount: 2,
    seatClass: 'Hạng Thương gia',
    tripType: 'Một chiều'
  },
  flight: {
    airline: 'FlyNest Airlines',
    airlineLogo: 'flynest.svg',
    flightNumber: 'SW-882',
    aircraft: 'Boeing 787-9 Dreamliner',
    depTime: '07:40 AM',
    arrTime: '09:50 AM',
    duration: '02h 10m',
    price: 1970,
    priceFormatted: '$1,970.00',
    terminalDep: 'Ga T1 (Quốc nội)',
    terminalArr: 'Ga Quốc Nội T1 (Nội Bài)',
    from: 'SGN',
    to: 'HAN'
  },
  booking: {
    passengerName: 'Jonathan Ben',
    passengerEmail: 'jonathan.ben@example.com',
    passengerPhone: '+84 901 234 567',
    passengerPassport: 'A98765432',
    passengerCount: 2,
    passengers: '2 Người lớn, Hạng Thương gia',
    seatClass: 'Hạng Thương gia',
    hotelDiscount: true,
    airportTransfer: false,
    baseFare: 1970,
    seatFee: 150,
    taxes: 120,
    hotelDiscountAmount: 150,
    transferAmount: 0,
    totalPrice: 1940
  },
  seat: {
    number: '10F',
    type: 'Ghế Cửa Sổ',
    class: 'Hạng Thương Gia'
  },
  ticket: {
    pnr: 'SW882P',
    gate: 'B12',
    boardingTime: '07:00 AM'
  }
};

/**
 * Utility helpers to determine and normalize flight seat / cabin classes across the booking flow.
 * Ensures consistent behavior between Phổ Thông (Economy) and Thương Gia (Business).
 */
function isBusinessClass(classStr) {
  if (!classStr) return false;
  const s = String(classStr).toLowerCase();
  if (s.includes('phổ thông') || s.includes('pho thong') || s.includes('economy')) {
    return false;
  }
  return s.includes('thương gia') || s.includes('thuong gia') || s.includes('business') || s.includes('first');
}

function normalizeSeatClass(classStr) {
  return isBusinessClass(classStr) ? 'Hạng Thương Gia' : 'Hạng Phổ Thông';
}

/**
 * Nguồn sự thật DUY NHẤT cho hạng ghế khách đang chọn trong toàn bộ funnel.
 * Không đọc trực tiếp search.seatClass hay flight.seatClass ở bất kỳ đâu khác.
 */
function getCustomerSeatClass() {
  const booking = (typeof Storage !== 'undefined' && Storage.getBooking) ? (Storage.getBooking() || {}) : {};
  if (booking.seatClass) return normalizeSeatClass(booking.seatClass);
  const search = (typeof Storage !== 'undefined' && Storage.getSearch) ? (Storage.getSearch() || {}) : {};
  return normalizeSeatClass(search.seatClass || 'Hạng Thương Gia');
}

/**
 * Điểm ghi DUY NHẤT khi khách đổi hạng ghế. Gọi hàm này thay vì tự
 * Storage.setBooking({...}) rải rác ở nhiều nơi.
 */
function setCustomerSeatClass(newClass) {
  const normalized = normalizeSeatClass(newClass);
  const booking = (typeof Storage !== 'undefined' && Storage.getBooking) ? (Storage.getBooking() || {}) : {};
  booking.seatClass = normalized;
  if (typeof Storage !== 'undefined' && Storage.setBooking) {
    Storage.setBooking(booking);
  }
  return normalized;
}

/**
 * Thuật toán định vị tooltip an toàn chống va chạm với các phần tử tiêu đề khoang / lối thoát hiểm.
 */
function positionTooltipSafely(tooltipEl, anchorRect, collisionSelectors) {
  const tooltipHeight = tooltipEl.offsetHeight || 120;
  let top = anchorRect.top - tooltipHeight - 12;
  let placement = 'above';

  const collides = (testTop) => {
    if (testTop < 85) return true; // vẫn giữ check header cố định
    if (!collisionSelectors) return false;
    return Array.from(document.querySelectorAll(collisionSelectors)).some(el => {
      const r = el.getBoundingClientRect();
      return testTop < r.bottom && (testTop + tooltipHeight) > r.top;
    });
  };

  if (collides(top)) {
    top = anchorRect.bottom + 12;
    placement = 'below';
  }
  return { top, placement };
}

if (typeof window !== 'undefined') {
  window.getCustomerSeatClass = getCustomerSeatClass;
  window.setCustomerSeatClass = setCustomerSeatClass;
  window.positionTooltipSafely = positionTooltipSafely;
}

function isSeatInCustomerCabin(seatCode, isBusiness) {
  if (!seatCode) return false;
  const row = parseInt(seatCode, 10);
  if (isNaN(row)) return false;
  return isBusiness ? (row >= 10 && row <= 12) : (row >= 14 && row <= 16);
}

/**
 * MASTER_FLIGHTS_DATABASE: Single Source of Truth for Flights & Timetables
 * Synchronizes schedule.html, flights.html and booking flow
 */
const MASTER_FLIGHTS_DATABASE = [
  {
    flightNumber: 'SW-882',
    airline: 'FlyNest Airlines',
    airlineLogo: 'flynest.svg',
    airlineShort: 'FlyNest',
    aircraft: 'Boeing 787-9 Dreamliner',
    aircraftFamily: 'Boeing',
    route: 'SGN-HAN',
    from: 'SGN',
    to: 'HAN',
    depTime: '07:40 AM',
    arrTime: '09:50 AM',
    depTime24: '07:40',
    arrTime24: '09:50',
    duration: '02h 10m',
    price: 1970,
    priceFormatted: '$1,970.00',
    days: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    frequency: 'daily',
    frequencyLabel: 'Hàng Ngày',
    onTimeRate: 98.8,
    isFlagship: true,
    isPeak: false,
    terminalDep: 'Ga T1 (Quốc nội)',
    terminalArr: 'Ga Quốc Nội T1 (Nội Bài)'
  },
  {
    flightNumber: 'VN-214',
    airline: 'Vietnam Airlines',
    airlineLogo: 'vietnam-airlines.svg',
    airlineShort: 'Vietnam Airlines',
    aircraft: 'Airbus A350-900',
    aircraftFamily: 'Airbus',
    route: 'SGN-HAN',
    from: 'SGN',
    to: 'HAN',
    depTime: '08:30 AM',
    arrTime: '10:45 AM',
    depTime24: '08:30',
    arrTime24: '10:45',
    duration: '02h 15m',
    price: 1650,
    priceFormatted: '$1,650.00',
    days: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    frequency: 'daily',
    frequencyLabel: 'Hàng Ngày',
    onTimeRate: 97.5,
    isFlagship: false,
    isPeak: true,
    terminalDep: 'Ga T1 (Quốc nội)',
    terminalArr: 'Ga Quốc Nội T1 (Nội Bài)'
  },
  {
    flightNumber: 'QH-242',
    airline: 'Bamboo Airways',
    airlineLogo: 'bamboo-airways.svg',
    airlineShort: 'Bamboo',
    aircraft: 'Boeing 787-9',
    aircraftFamily: 'Boeing',
    route: 'SGN-HAN',
    from: 'SGN',
    to: 'HAN',
    depTime: '10:15 AM',
    arrTime: '12:25 PM',
    depTime24: '10:15',
    arrTime24: '12:25',
    duration: '02h 10m',
    price: 1450,
    priceFormatted: '$1,450.00',
    days: ['T2', 'T4', 'T6', 'CN'],
    frequency: 'custom',
    frequencyLabel: 'Thứ 2, 4, 6, CN',
    onTimeRate: 96.8,
    isFlagship: false,
    isPeak: false,
    terminalDep: 'Ga T1 (Quốc nội)',
    terminalArr: 'Ga Quốc Nội T1 (Nội Bài)'
  },
  {
    flightNumber: 'VJ-136',
    airline: 'Vietjet Air',
    airlineLogo: 'vietjet-air.svg',
    airlineShort: 'Vietjet',
    aircraft: 'Airbus A321neo',
    aircraftFamily: 'Airbus',
    route: 'SGN-HAN',
    from: 'SGN',
    to: 'HAN',
    depTime: '06:15 AM',
    arrTime: '08:25 AM',
    depTime24: '06:15',
    arrTime24: '08:25',
    duration: '02h 10m',
    price: 950,
    priceFormatted: '$950.00',
    days: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    frequency: 'daily',
    frequencyLabel: 'Hàng Ngày',
    onTimeRate: 92.5,
    isFlagship: false,
    isPeak: false,
    terminalDep: 'Ga T1 (Quốc nội)',
    terminalArr: 'Ga Quốc Nội T1 (Nội Bài)'
  },
  {
    flightNumber: 'VU-772',
    airline: 'Vietravel Airlines',
    airlineLogo: 'vietravel-airlines.svg',
    airlineShort: 'Vietravel',
    aircraft: 'Airbus A321',
    aircraftFamily: 'Airbus',
    route: 'SGN-HAN',
    from: 'SGN',
    to: 'HAN',
    depTime: '11:45 AM',
    arrTime: '01:55 PM',
    depTime24: '11:45',
    arrTime24: '13:55',
    duration: '02h 10m',
    price: 880,
    priceFormatted: '$880.00',
    days: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    frequency: 'daily',
    frequencyLabel: 'Hàng Ngày',
    onTimeRate: 97.4,
    isFlagship: false,
    isPeak: false,
    terminalDep: 'Ga T1 (Quốc nội)',
    terminalArr: 'Ga Quốc Nội T1 (Nội Bài)'
  },
  {
    flightNumber: 'SQ-178',
    airline: 'Singapore Airlines',
    airlineLogo: 'singapore-airlines.svg',
    airlineShort: 'Singapore Air',
    aircraft: 'Boeing 777-300ER',
    aircraftFamily: 'Boeing',
    route: 'SGN-HAN',
    from: 'SGN',
    to: 'HAN',
    depTime: '01:20 PM',
    arrTime: '03:30 PM',
    depTime24: '13:20',
    arrTime24: '15:30',
    duration: '02h 10m',
    price: 2100,
    priceFormatted: '$2,100.00',
    days: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    frequency: 'daily',
    frequencyLabel: 'Hàng Ngày',
    onTimeRate: 99.1,
    isFlagship: false,
    isPeak: true,
    terminalDep: 'Ga T1 (Quốc nội)',
    terminalArr: 'Ga Quốc Nội T1 (Nội Bài)'
  },
  {
    flightNumber: 'EK-392',
    airline: 'Emirates',
    airlineLogo: 'emirates.svg',
    airlineShort: 'Emirates',
    aircraft: 'Airbus A380-800',
    aircraftFamily: 'Airbus',
    route: 'SGN-HAN',
    from: 'SGN',
    to: 'HAN',
    depTime: '03:40 PM',
    arrTime: '05:50 PM',
    depTime24: '15:40',
    arrTime24: '17:50',
    duration: '02h 10m',
    price: 2250,
    priceFormatted: '$2,250.00',
    days: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    frequency: 'daily',
    frequencyLabel: 'Hàng Ngày',
    onTimeRate: 98.6,
    isFlagship: false,
    isPeak: true,
    terminalDep: 'Ga T1 (Quốc nội)',
    terminalArr: 'Ga Quốc Nội T1 (Nội Bài)'
  },
  {
    flightNumber: 'QR-970',
    airline: 'Qatar Airways',
    airlineLogo: 'qatar-airways.svg',
    airlineShort: 'Qatar Airways',
    aircraft: 'Airbus A350-1000',
    aircraftFamily: 'Airbus',
    route: 'SGN-HAN',
    from: 'SGN',
    to: 'HAN',
    depTime: '05:15 PM',
    arrTime: '07:25 PM',
    depTime24: '17:15',
    arrTime24: '19:25',
    duration: '02h 10m',
    price: 2050,
    priceFormatted: '$2,050.00',
    days: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    frequency: 'daily',
    frequencyLabel: 'Hàng Ngày',
    onTimeRate: 98.9,
    isFlagship: false,
    isPeak: true,
    terminalDep: 'Ga T1 (Quốc nội)',
    terminalArr: 'Ga Quốc Nội T1 (Nội Bài)'
  },
  {
    flightNumber: 'SV-824',
    airline: 'Saudia',
    airlineLogo: 'saudia.svg',
    airlineShort: 'Saudia',
    aircraft: 'Boeing 787-10',
    aircraftFamily: 'Boeing',
    route: 'SGN-HAN',
    from: 'SGN',
    to: 'HAN',
    depTime: '08:30 PM',
    arrTime: '10:40 PM',
    depTime24: '20:30',
    arrTime24: '22:40',
    duration: '02h 10m',
    price: 1800,
    priceFormatted: '$1,800.00',
    days: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    frequency: 'daily',
    frequencyLabel: 'Hàng Ngày',
    onTimeRate: 97.8,
    isFlagship: false,
    isPeak: false,
    terminalDep: 'Ga T1 (Quốc nội)',
    terminalArr: 'Ga Quốc Nội T1 (Nội Bài)'
  },
  {
    flightNumber: 'FZ-512',
    airline: 'Flydubai',
    airlineLogo: 'flydubai.svg',
    airlineShort: 'Flydubai',
    aircraft: 'Boeing 737 MAX 8',
    aircraftFamily: 'Boeing',
    route: 'SGN-HAN',
    from: 'SGN',
    to: 'HAN',
    depTime: '10:30 PM',
    arrTime: '12:40 AM',
    depTime24: '22:30',
    arrTime24: '00:40',
    duration: '02h 10m',
    price: 1150,
    priceFormatted: '$1,150.00',
    days: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    frequency: 'daily',
    frequencyLabel: 'Hàng Ngày',
    onTimeRate: 96.2,
    isFlagship: false,
    isPeak: false,
    terminalDep: 'Ga T1 (Quốc nội)',
    terminalArr: 'Ga Quốc Nội T1 (Nội Bài)'
  }
];

/**
 * Data Integrity Verification Helper
 * Logs warning to console if passenger count or seat class mismatch across funnel steps
 */
function verifyBookingDataIntegrity(stepName) {
  try {
    const s = Storage.getSearch();
    const b = Storage.getBooking();
    const f = Storage.getFlight();
    const expectedPax = s.passengerCount || 2;
    const bookingPax = b.passengerCount || expectedPax;
    const expectedClass = getCustomerSeatClass();

    const mismatches = [];
    if (bookingPax !== expectedPax && b.passengerCount) {
      mismatches.push(`Số lượng khách không khớp: Search có ${expectedPax}, Booking ghi nhận ${b.passengerCount}`);
    }

    if (mismatches.length > 0) {
      console.warn(`[FlyNest Data Integrity Warning at ${stepName}]:\n` + mismatches.join('\n'));
    } else {
      console.log(`%c[FlyNest Data Integrity OK at ${stepName}]: %c${expectedPax} khách · ${expectedClass} · Chuyến ${f.flightNumber || 'SW-882'} (${f.depTime || '07:40 AM'})`, 'color: #10b981; font-weight: bold;', 'color: #38bdf8;');
    }
  } catch(e) {}
}

// In-memory fallback if storage is blocked
const memStorage = {};

/* ==============================================================================
   DATA SERIALIZATION & STORAGE SANITIZER (PROTOTYPE/DEMO DATA LAYER)
   NOTE: Client-side encoding for local demo serialization and masking.
   Real production must use backend Argon2/bcrypt and HTTPS session tokens.
   ============================================================================== */
const SecurityVault = {
  _salt: 'SKYWINGS_AERO_v2026_SANDBOX',

  // Salted cryptographic hash for passwords and verification tokens
  hash(input) {
    let h = 0x811c9dc5;
    const str = String(input) + this._salt;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    const hex = ('0000000' + (h >>> 0).toString(16)).slice(-8);
    return 'hsh_' + hex + hex.split('').reverse().join('') + ('0000000' + (str.length * 31).toString(16)).slice(-8);
  },

  // Encrypt sensitive JSON object or string before saving to storage
  encrypt(data) {
    if (!data) return '';
    try {
      const raw = typeof data === 'object' ? JSON.stringify(data) : String(data);
      let output = '';
      for (let i = 0; i < raw.length; i++) {
        const c = raw.charCodeAt(i);
        const k = this._salt.charCodeAt(i % this._salt.length);
        output += String.fromCharCode(c ^ k);
      }
      return 'enc_v2_' + btoa(unescape(encodeURIComponent(output)));
    } catch(e) {
      return typeof data === 'object' ? JSON.stringify(data) : String(data);
    }
  },

  // Decrypt cipher string back to original
  decrypt(ciphertext) {
    if (!ciphertext) return null;
    if (typeof ciphertext !== 'string' || !ciphertext.startsWith('enc_v2_')) {
      return ciphertext; // already plain string or legacy JSON
    }
    try {
      const b64 = ciphertext.slice(7);
      const str = decodeURIComponent(escape(atob(b64)));
      let decoded = '';
      for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        const k = this._salt.charCodeAt(i % this._salt.length);
        decoded += String.fromCharCode(c ^ k);
      }
      return decoded;
    } catch(e) {
      return null;
    }
  },

  // Mask sensitive credit card numbers (e.g. •••• •••• •••• 4242)
  maskCardNumber(num) {
    const clean = String(num || '').replace(/\D/g, '');
    if (clean.length < 4) return '•••• •••• •••• 4242';
    const last4 = clean.slice(-4);
    return `•••• •••• •••• ${last4}`;
  },

  // Mask CVV / CVC
  maskCvv(cvv) {
    return '•••';
  },

  // Mask email for customer privacy
  maskEmail(email) {
    if (!email || !email.includes('@')) return email;
    const [u, d] = email.split('@');
    if (u.length <= 2) return `*@${d}`;
    return `${u[0]}***${u[u.length - 1]}@${d}`;
  }
};

const Storage = {
  get(key) {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const sVal = sessionStorage.getItem(key);
        if (sVal !== null) return sVal;
      }
    } catch (e) {}
    try {
      if (typeof localStorage !== 'undefined') {
        const lVal = localStorage.getItem(key);
        if (lVal !== null) return lVal;
      }
    } catch (e) {}
    return memStorage[key] || null;
  },
  set(key, value) {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, value);
      }
    } catch (e) {}
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (e) {}
    memStorage[key] = value;
  },

  getSearch() {
    try {
      let urlFrom = null;
      let urlTo = null;
      let urlDate = null;
      let urlPax = null;
      if (typeof window !== 'undefined' && window.location && window.location.search) {
        const urlP = new URLSearchParams(window.location.search);
        urlFrom = urlP.get('from');
        urlTo = urlP.get('to');
        urlDate = urlP.get('date');
        urlPax = urlP.get('pax');
      }

      const stored = this.get('ngefly_search_params');
      let base = stored ? { ...DEFAULT_STATE.search, ...JSON.parse(stored) } : null;

      if (!base) {
        const from = this.get('from') || DEFAULT_STATE.search.from;
        const to = this.get('to') || DEFAULT_STATE.search.to;
        const date = this.get('date') || DEFAULT_STATE.search.date;
        const returnDate = this.get('return_date') || DEFAULT_STATE.search.returnDate;
        const passengers = this.get('passengers') || DEFAULT_STATE.search.passengers;
        const seatClass = this.get('seatClass') || DEFAULT_STATE.search.seatClass;
        const tripType = this.get('trip_type') || DEFAULT_STATE.search.tripType;
        base = {
          ...DEFAULT_STATE.search,
          from,
          to,
          fromCity: getAirportCity(from),
          toCity: getAirportCity(to),
          date,
          returnDate,
          passengers,
          seatClass,
          tripType
        };
      }

      if (urlFrom && AIRPORTS[urlFrom]) {
        base.from = urlFrom;
        base.fromCity = getAirportCity(urlFrom);
      }
      if (urlTo && AIRPORTS[urlTo]) {
        base.to = urlTo;
        base.toCity = getAirportCity(urlTo);
      }
      if (urlDate) {
        base.date = urlDate;
      }
      if (urlPax) {
        base.passengers = decodeURIComponent(urlPax);
      }
      return base;
    } catch (e) {
      return DEFAULT_STATE.search;
    }
  },

  setSearch(data) {
    this.set('ngefly_search_params', JSON.stringify(data));
    if (data.from) this.set('from', data.from);
    if (data.to) this.set('to', data.to);
    if (data.date) this.set('date', data.date);
    if (data.returnDate) this.set('return_date', data.returnDate);
    if (data.passengers) this.set('passengers', data.passengers);
    if (data.seatClass) this.set('seatClass', data.seatClass);
    if (data.tripType) this.set('trip_type', data.tripType);
  },

  getFlight() {
    try {
      const stored = this.get('ngefly_flight_details');
      if (stored) return { ...DEFAULT_STATE.flight, ...JSON.parse(stored) };
      const airline = this.get('airline') || DEFAULT_STATE.flight.airline;
      const flightNumber = this.get('flight_number') || DEFAULT_STATE.flight.flightNumber;
      const price = parseFloat(this.get('flight_price')) || DEFAULT_STATE.flight.price;
      return {
        ...DEFAULT_STATE.flight,
        airline,
        flightNumber,
        price,
        priceFormatted: `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      };
    } catch (e) {
      return DEFAULT_STATE.flight;
    }
  },

  setFlight(data) {
    this.set('ngefly_flight_details', JSON.stringify(data));
    this.set('airline', data.airline);
    this.set('flight_number', data.flightNumber);
    this.set('flight_price', String(data.price));
  },

  getBooking() {
    try {
      const stored = this.get('ngefly_booking_info');
      if (stored) {
        let jsonStr = stored;
        if (stored.startsWith('enc_v2_')) {
          jsonStr = SecurityVault.decrypt(stored);
        }
        if (jsonStr) return { ...DEFAULT_STATE.booking, ...JSON.parse(jsonStr) };
      }
      const name = this.get('passenger_name') || DEFAULT_STATE.booking.passengerName;
      const total = parseFloat(this.get('total_amount')) || DEFAULT_STATE.booking.totalPrice;
      return {
        ...DEFAULT_STATE.booking,
        passengerName: name,
        totalPrice: total
      };
    } catch (e) {
      return DEFAULT_STATE.booking;
    }
  },

  setBooking(data) {
    const secureData = { ...data };
    if (secureData.cardNumber) {
      secureData.cardNumber = SecurityVault.maskCardNumber(secureData.cardNumber);
    }
    if (secureData.cardCvv) {
      delete secureData.cardCvv; // Never persist CVV
    }
    const enc = SecurityVault.encrypt(secureData);
    this.set('ngefly_booking_info', enc);
    if (data.passengerName) this.set('passenger_name', data.passengerName);
    if (data.totalPrice) this.set('total_amount', String(data.totalPrice));
  },

  getSeat() {
    return this.get('ngefly_selected_seat') || this.get('selected_seat') || this.get('seat') || DEFAULT_STATE.seat.number;
  },

  setSeat(seatNumber) {
    this.set('ngefly_selected_seat', seatNumber);
    this.set('selected_seat', seatNumber);
    this.set('seat', seatNumber);
  },

  getPassenger() {
    try {
      const stored = this.get('ngefly_passenger_info');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return {
      name: DEFAULT_STATE.booking.passengerName,
      email: DEFAULT_STATE.booking.passengerEmail,
      phone: DEFAULT_STATE.booking.passengerPhone,
      passport: DEFAULT_STATE.booking.passengerPassport
    };
  },

  setPassenger(paxData) {
    try {
      this.set('ngefly_passenger_info', JSON.stringify(paxData));
      if (paxData.name) this.set('passenger_name', paxData.name);
    } catch(e) {}
  },

  getPnr() {
    return this.get('ngefly_pnr') || this.get('pnr') || DEFAULT_STATE.ticket.pnr;
  },

  setPnr(pnr) {
    this.set('ngefly_pnr', pnr);
    this.set('pnr', pnr);
  },

  getUser() {
    try {
      const stored = this.get('flynest_user') || this.get('ngefly_user');
      if (stored) {
        if (stored.startsWith('enc_v2_')) {
          const dec = SecurityVault.decrypt(stored);
          return dec ? JSON.parse(dec) : null;
        }
        return JSON.parse(stored);
      }
    } catch (e) {}
    return null;
  },

  setUser(user) {
    const enc = SecurityVault.encrypt(user);
    this.set('flynest_user', enc);
    this.set('ngefly_user', enc);
  },

  getOrders() {
    try {
      const stored = this.get('flynest_orders');
      if (stored) {
        let jsonStr = stored;
        if (stored.startsWith('enc_v2_')) {
          jsonStr = SecurityVault.decrypt(stored);
        }
        if (jsonStr) return JSON.parse(jsonStr);
      }
    } catch (e) {}
    return [];
  },

  addOrder(order) {
    const orders = this.getOrders();
    const safeOrder = { ...order };
    if (safeOrder.cardNumber) {
      safeOrder.cardNumber = SecurityVault.maskCardNumber(safeOrder.cardNumber);
    }
    if (safeOrder.cardCvv) {
      delete safeOrder.cardCvv;
    }
    orders.unshift(safeOrder);
    this.set('flynest_orders', SecurityVault.encrypt(orders.slice(0, 50)));
  },

  logout() {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('flynest_user');
        sessionStorage.removeItem('ngefly_user');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('flynest_current_user');
        sessionStorage.clear();
      }
    } catch (e) {}
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('flynest_user');
        localStorage.removeItem('ngefly_user');
        localStorage.removeItem('user');
        localStorage.removeItem('flynest_current_user');
      }
    } catch (e) {}
    delete memStorage['flynest_user'];
    delete memStorage['ngefly_user'];
    delete memStorage['user'];
    delete memStorage['flynest_current_user'];
  },

  isLoggedIn() {
    return this.getUser() !== null;
  },

  getSiteContent() {
    try {
      const stored = this.get('flynest_site_content');
      if (stored) {
        let jsonStr = stored;
        if (stored.startsWith('enc_v2_')) {
          jsonStr = SecurityVault.decrypt(stored);
        }
        if (jsonStr) return { ...DEFAULT_SITE_CONTENT, ...JSON.parse(jsonStr) };
      }
    } catch (e) {}
    return { ...DEFAULT_SITE_CONTENT };
  },

  setSiteContent(data, status = 'published') {
    const current = this.getSiteContent();
    const updated = {
      ...current,
      ...data,
      status: status,
      updatedAt: new Date().toISOString()
    };
    this.set('flynest_site_content', SecurityVault.encrypt(updated));
    return updated;
  },

  getRevisions() {
    try {
      const stored = this.get('flynest_cms_revisions');
      if (stored) {
        let jsonStr = stored;
        if (stored.startsWith('enc_v2_')) {
          jsonStr = SecurityVault.decrypt(stored);
        }
        if (jsonStr) return JSON.parse(jsonStr);
      }
    } catch (e) {}
    return [
      {
        id: 1,
        timestamp: '14/09/2026 08:00',
        summary: 'Nội dung chuẩn giao diện FlyNest 2026',
        content: { ...DEFAULT_SITE_CONTENT }
      }
    ];
  },

  addRevision(rev) {
    const revs = this.getRevisions();
    revs.unshift(rev);
    this.set('flynest_cms_revisions', SecurityVault.encrypt(revs.slice(0, 10)));
  },

  updateOrderStatus(pnr, newStatus) {
    try {
      const orders = this.getOrders();
      let matched = false;
      const updated = orders.map(order => {
        if (order.pnr === pnr) {
          matched = true;
          return { ...order, status: newStatus };
        }
        return order;
      });
      if (!matched) {
        updated.unshift({
          pnr: pnr,
          passengerName: 'Jonathan Ben',
          route: 'SGN ➔ HAN',
          airline: 'FlyNest Airlines (SW-882)',
          seat: '10F',
          amount: 1940,
          amountFormatted: '$1,940.00',
          status: newStatus
        });
      }
      this.set('flynest_orders', SecurityVault.encrypt(updated.slice(0, 50)));
      return updated;
    } catch (e) {
      return [];
    }
  }
};

const DEFAULT_SITE_CONTENT = {
  heroBadge: 'Khám Phá Bầu Trời Cùng FlyNest • Ưu Đãi 2026',
  heroTitle: 'Chạm Đến Bầu Trời Với Đẳng Cấp Thượng Lưu',
  heroDesc: 'Trải nghiệm những chuyến bay tuyệt vời cùng dịch vụ 5 sao quốc tế, đường bay kết nối toàn cầu và hỗ trợ khách hàng chu đáo 24/7.',
  heroCtaText: 'Khám Phá Chuyến Bay ➔',
  heroCtaLink: 'pages/flights.html',
  whyTitle: 'Tại Sao Lựa Chọn FlyNest?',
  whyDesc: 'Hệ thống đặt vé máy bay thế hệ mới kết hợp mô phỏng đường băng 3D tương tác và thanh toán an toàn chuẩn quốc tế',
  supportHotline: '1900 6868 (Miễn cước)',
  supportEmail: 'hotro@flynest.vn',
  newsletterTitle: 'Đăng Ký Nhận Đặc Quyền & Ưu Đãi Bay FlyNest',
  seoTitle: 'FlyNest - Hệ Thống Đặt Vé Máy Bay Trực Tuyến & Trải Nghiệm 3D',
  seoDesc: 'Đặt vé máy bay trực tuyến giá tốt nhất với công nghệ mô phỏng 3D hiện đại, so sánh vé hơn 500 hãng bay uy tín và check-in thẻ bay số tức thì.',
  status: 'published',
  updatedAt: '2026-09-14T08:00:00.000Z'
};

function applySiteContentToDOM(content) {
  if (!content) return;
  const heroBadge = document.getElementById('hero-momentum-badge');
  if (heroBadge && content.heroBadge) heroBadge.textContent = content.heroBadge;

  const heroTitle = document.getElementById('hero-main-title');
  if (heroTitle && content.heroTitle) heroTitle.textContent = content.heroTitle;

  const heroDesc = document.getElementById('hero-subtitle-desc');
  if (heroDesc && content.heroDesc) heroDesc.innerHTML = `<span class="hero-live-badge-dot"></span> ` + content.heroDesc;

  const whyTitle = document.getElementById('why-main-title');
  if (whyTitle && content.whyTitle) whyTitle.textContent = content.whyTitle;

  const whyDesc = document.getElementById('why-main-desc');
  if (whyDesc && content.whyDesc) whyDesc.textContent = content.whyDesc;

  const hotlineVal = document.getElementById('footer-hotline-val');
  if (hotlineVal && content.supportHotline) hotlineVal.textContent = content.supportHotline;

  const emailVal = document.getElementById('footer-email-val');
  if (emailVal && content.supportEmail) emailVal.textContent = content.supportEmail;

  const newsletterTitle = document.getElementById('footer-newsletter-title');
  if (newsletterTitle && content.newsletterTitle) newsletterTitle.textContent = content.newsletterTitle;

  const isHome = document.location.pathname.endsWith('index.html') || document.location.pathname.endsWith('/') || document.location.pathname.endsWith('tkweb');
  if (content.seoTitle && isHome) document.title = content.seoTitle;

  if (content.seoDesc) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = content.seoDesc;
  }
}

function initSiteContentSync() {
  try {
    const urlP = new URLSearchParams(window.location.search);
    const isPreview = urlP.has('preview');
    const content = Storage.getSiteContent();
    if (content && (content.status === 'published' || isPreview)) {
      applySiteContentToDOM(content);
    }
  } catch(e) {}

  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKYWINGS_CMS_LIVE_PREVIEW' && event.data.content) {
      applySiteContentToDOM(event.data.content);
    }
  });
}

if (typeof window !== 'undefined') {
  window.NgeflyStorage = Storage;
  window.SkyStorage = Storage;
}

function getAirportCity(code) {
  if (AIRPORTS[code]) {
    return `${AIRPORTS[code].city} - ${AIRPORTS[code].country}`;
  }
  return code || 'Unknown';
}

function getAirportShortCity(code) {
  if (AIRPORTS[code]) {
    return AIRPORTS[code].city;
  }
  return code || 'Unknown';
}

function formatCurrencyVND(amount) {
  const num = Number(amount) || 0;
  return Math.round(num * 24800).toLocaleString('vi-VN') + ' ₫';
}

function formatCurrencyUSD(amount) {
  const num = Number(amount) || 0;
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCurrency(amount) {
  return formatCurrencyVND(amount);
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return { short: '10 Thg 9', full: '10 THÁNG 9, 2026', medium: '10 Thg 9, Thứ Tư' };
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) {
      return { short: dateStr, full: dateStr.toUpperCase(), medium: dateStr };
    }
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    const monthsShort = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const month = months[d.getMonth()];
    const monthShort = monthsShort[d.getMonth()];
    const year = d.getFullYear();
    const weekday = days[d.getDay()];

    return {
      short: `${day} ${monthShort}`,
      full: `${day} ${month.toUpperCase()}, ${year}`,
      medium: `${day} ${monthShort}, ${weekday}`
    };
  } catch (e) {
    return { short: dateStr, full: dateStr, medium: dateStr };
  }
}

/* ==============================================================================
   1. THREE.JS 3D DAYTIME AIRPORT RUNWAY & COMMERCIAL AIRLINER SCENE
   ============================================================================== */
function initThreeJSRunway() {
  const container = document.getElementById('webgl-container') || document.querySelector('.hero-stage') || document.body;
  const canvas = document.querySelector('#webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;
  if (canvas.dataset.threejsInitialized === 'true') return;
  canvas.dataset.threejsInitialized = 'true';

  const scene = new THREE.Scene();

  // Nền trời xanh pastel trong trẻo đồng bộ hoàn hảo với CSS bg-[#EBF4FE]
  scene.background = new THREE.Color(0xebf4fe);
  scene.fog = new THREE.FogExp2(0xebf4fe, 0.018);

  const getWidth = () => (container ? container.clientWidth : window.innerWidth) || window.innerWidth;
  const getHeight = () => (container ? container.clientHeight : 620) || 620;

  // 1. Master Camera - Bird's Eye Top-Down Perspective (Desktop 1440px - Nhìn từ trên cao chúc xuống)
  const camera = new THREE.PerspectiveCamera(40, getWidth() / getHeight(), 0.1, 1000);
  camera.position.set(0, 16, 11);
  camera.lookAt(0, 0, -2);
  window.__camera = camera;

  const isEcoInitial = (window.__perfMode === 'eco' || window.__ecoMode);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: false,
    antialias: !isEcoInitial,
    powerPreference: isEcoInitial ? 'default' : 'high-performance'
  });
  renderer.setSize(getWidth(), getHeight());
  renderer.setPixelRatio(isEcoInitial ? 1.0 : Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = !isEcoInitial;
  if (renderer.shadowMap.enabled) {
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  // 2. Comprehensive Aviation Lighting System (Day / Night Adaptive)
  // A. Key Light / Sun Light: Ánh nắng tự nhiên chiếu xiên từ trên cao tạo bóng đổ mềm dưới thân máy bay
  const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
  keyLight.position.set(6, 22, 10);
  keyLight.castShadow = !isEcoInitial;
  keyLight.shadow.mapSize.width = isEcoInitial ? 512 : 2048;
  keyLight.shadow.mapSize.height = isEcoInitial ? 512 : 2048;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 70;
  keyLight.shadow.camera.left = -25;
  keyLight.shadow.camera.right = 25;
  keyLight.shadow.camera.top = 25;
  keyLight.shadow.camera.bottom = -25;
  keyLight.shadow.bias = -0.0003;
  keyLight.target.position.set(0, 0, -1.5);
  scene.add(keyLight);
  scene.add(keyLight.target);

  // B. Rim Light: Neon Cyan Backlight (chỉ kích hoạt ở Dark mode)
  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0);
  rimLight.position.set(0, 8, -15);
  scene.add(rimLight);

  // C. Ambient & Sky Hemisphere
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdbeafe, 0.65);
  hemiLight.position.set(0, 30, 0);
  scene.add(hemiLight);

  // D. Wingtip Navigation PointLights (Flashing Red / Green)
  const wingPointL = new THREE.PointLight(0xef4444, 2.5, 10);
  const wingPointR = new THREE.PointLight(0x10b981, 2.5, 10);

  // --- 3. Airport Ground: Bird's-Eye Vertical Runway & Airfield Landscape (Trục Z) ---
  const runwayLength = 180; // Dọc theo trục Z
  const runwayWidth = 10.5; // Chiều rộng đường băng chính

  // Nền mặt đất bao quanh hòa sắc hoàn hảo với trang web #ebf4fe
  const groundGeo = new THREE.PlaneGeometry(260, 240);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0xebf4fe,
    roughness: 0.95,
    metalness: 0.02
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.02, 0);
  ground.receiveShadow = true;
  scene.add(ground);

  // Mặt đường băng bê tông nhựa đường sẫm màu (Dark Slate Asphalt #242c37 - Tương phản cực cao chuẩn video TikTok)
  const tarmacGeo = new THREE.PlaneGeometry(runwayWidth, runwayLength);
  const tarmacMat = new THREE.MeshStandardMaterial({
    color: 0x242c37,
    roughness: 0.88,
    metalness: 0.05
  });
  const tarmac = new THREE.Mesh(tarmacGeo, tarmacMat);
  tarmac.rotation.x = -Math.PI / 2;
  tarmac.position.set(0, 0, 0);
  tarmac.receiveShadow = true;
  scene.add(tarmac);

  // Lề đường băng 2 bên (Runway Shoulders - #334155)
  const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
  const shoulderGeo = new THREE.PlaneGeometry(1.0, runwayLength);
  const shoulderL = new THREE.Mesh(shoulderGeo, shoulderMat);
  shoulderL.rotation.x = -Math.PI / 2;
  shoulderL.position.set(-runwayWidth / 2 - 0.5, 0.003, 0);
  shoulderL.receiveShadow = true;
  scene.add(shoulderL);

  const shoulderR = new THREE.Mesh(shoulderGeo, shoulderMat);
  shoulderR.rotation.x = -Math.PI / 2;
  shoulderR.position.set(runwayWidth / 2 + 0.5, 0.003, 0);
  shoulderR.receiveShadow = true;
  scene.add(shoulderR);

  // Dải cỏ sân bay xanh ngắt 2 bên đường băng (Lush Airfield Turf #2e7d32 chuẩn video TikTok)
  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x2e7d32,
    roughness: 0.92,
    metalness: 0.02
  });
  window.__grassMat = grassMat;

  const grassGeo = new THREE.PlaneGeometry(42, runwayLength);
  const grassL = new THREE.Mesh(grassGeo, grassMat);
  grassL.rotation.x = -Math.PI / 2;
  grassL.position.set(-runwayWidth / 2 - 1.0 - 21, 0.002, 0);
  grassL.receiveShadow = true;
  scene.add(grassL);

  const grassR = new THREE.Mesh(grassGeo, grassMat);
  grassR.rotation.x = -Math.PI / 2;
  grassR.position.set(runwayWidth / 2 + 1.0 + 21, 0.002, 0);
  grassR.receiveShadow = true;
  scene.add(grassR);

  // HỆ THỐNG VẠCH SƠN ĐƯỜNG BĂNG & PHONG CẢNH CUỘN LIÊN TỤC (Full Scrolling Landscape Group)
  const scrollingGroup = new THREE.Group();
  const scrollingElements = [];

  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const yellowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const darkAsphaltMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });

  // A. Vạch tim đường băng (Centerline Dashes) & Vạch chỉ dẫn bên trong
  for (let z = -56; z <= 32; z += 4.0) {
    // Vạch trắng tim đường
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 2.2), whiteMat);
    strip.position.set(0, 0.015, z);
    scrollingGroup.add(strip);
    scrollingElements.push(strip);

    // Vạch vàng an toàn 2 bên
    const yL = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.02, 1.8), yellowMat);
    yL.position.set(-2.2, 0.015, z);
    scrollingGroup.add(yL);
    scrollingElements.push(yL);

    const yR = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.02, 1.8), yellowMat);
    yR.position.set(2.2, 0.015, z);
    scrollingGroup.add(yR);
    scrollingElements.push(yR);

    // Vạch kẻ trắng mép đường băng 2 bên (Runway Side Edge Stripes)
    const edgeL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 2.8), whiteMat);
    edgeL.position.set(-5.0, 0.015, z);
    scrollingGroup.add(edgeL);
    scrollingElements.push(edgeL);

    const edgeR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 2.8), whiteMat);
    edgeR.position.set(5.0, 0.015, z);
    scrollingGroup.add(edgeR);
    scrollingElements.push(edgeR);
  }

  // B. Vạch chạm bánh (Touchdown Aiming Point Marks - Cặp vạch lớn) & Đường lăn nối trên cỏ
  for (let z = -48; z <= 24; z += 24.0) {
    const aimL = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 4.2), whiteMat);
    aimL.rotation.x = -Math.PI / 2;
    aimL.position.set(-3.2, 0.016, z);
    scrollingGroup.add(aimL);
    scrollingElements.push(aimL);

    const aimR = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 4.2), whiteMat);
    aimR.rotation.x = -Math.PI / 2;
    aimR.position.set(3.2, 0.016, z);
    scrollingGroup.add(aimR);
    scrollingElements.push(aimR);
  }

  // C. Vạch kẻ piano đầu đường băng (Threshold Piano Keys)
  for (const pz of [-44, 16]) {
    for (let x = -4.2; x <= 4.2; x += 1.05) {
      const pMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 3.6), whiteMat);
      pMesh.rotation.x = -Math.PI / 2;
      pMesh.position.set(x, 0.016, pz);
      scrollingGroup.add(pMesh);
      scrollingElements.push(pMesh);
    }
  }

  // D. Biển chỉ báo khoảng cách đường băng (Distance Marker Boards)
  for (let idx = 0; idx < 5; idx++) {
    const bz = -36 + idx * 16;
    const signGeo = new THREE.BoxGeometry(0.35, 0.35, 0.08);
    const signMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const signL = new THREE.Mesh(signGeo, signMat);
    signL.position.set(-5.8, 0.18, bz);
    scrollingGroup.add(signL);
    scrollingElements.push(signL);

    const signR = new THREE.Mesh(signGeo, signMat);
    signR.position.set(5.8, 0.18, bz);
    scrollingGroup.add(signR);
    scrollingElements.push(signR);
  }

  // E. Dàn đèn mép đường băng cuộn theo chuyển động (Scrolling Runway Edge Lights)
  const runwayLights = [];
  const runwayPostGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.18, 6);
  const runwayPostMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
  const runwayBulbGeo = new THREE.SphereGeometry(0.07, 8, 8);
  const runwayBulbMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    emissive: 0x000000,
    emissiveIntensity: 0
  });
  window.__runwayBulbMat = runwayBulbMat;

  // Đại diện 4 cụm đèn chiếu sáng (representative runway glow lights)
  const runwayGlowLights = [];
  for (let gz = -40; gz <= 20; gz += 20) {
    const pL = new THREE.PointLight(0xf59e0b, 0, 16);
    pL.position.set(0, 0.8, gz);
    scrollingGroup.add(pL);
    runwayGlowLights.push(pL);
  }
  window.__runwayGlowLights = runwayGlowLights;

  function createScrollingRunwayLight(x, z) {
    const lGroup = new THREE.Group();
    const post = new THREE.Mesh(runwayPostGeo, runwayPostMat);
    post.position.y = 0.09;
    lGroup.add(post);

    const bulb = new THREE.Mesh(runwayBulbGeo, runwayBulbMat);
    bulb.position.y = 0.20;
    lGroup.add(bulb);

    lGroup.position.set(x, 0, z);
    scrollingGroup.add(lGroup);
    scrollingElements.push(lGroup);
    runwayLights.push({ bulb, light: null });
  }

  for (let z = -54; z <= 30; z += 4.5) {
    createScrollingRunwayLight(-5.4, z);
    createScrollingRunwayLight(5.4, z);
  }

  // F. Xe ô tô con bãi đỗ & Xe công vụ sân bay (Low-Poly Parked Cars matching TikTok frame_7.0s)
  function createLowPolyCar(colorHex, roofColor = 0x0f172a) {
    const car = new THREE.Group();
    // Thân xe
    const bodyMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.88, 0.36, 1.6),
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35, metalness: 0.2 })
    );
    bodyMesh.position.y = 0.26;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    car.add(bodyMesh);

    // Cabin xe / Kính đen bóng
    const cabinMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.74, 0.28, 0.82),
      new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.1, metalness: 0.7 })
    );
    cabinMesh.position.set(0, 0.52, -0.06);
    cabinMesh.castShadow = true;
    car.add(cabinMesh);

    // Đèn pha trước
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.03), hlMat);
    hlL.position.set(-0.28, 0.26, -0.81);
    const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.03), hlMat);
    hlR.position.set(0.28, 0.26, -0.81);
    car.add(hlL);
    car.add(hlR);

    // Đèn hậu đỏ
    const tlMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const tlL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.03), tlMat);
    tlL.position.set(-0.28, 0.26, 0.81);
    const tlR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.03), tlMat);
    tlR.position.set(0.28, 0.26, 0.81);
    car.add(tlL);
    car.add(tlR);

    // 4 Bánh xe cao su đen
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const wheelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.12, 8);
    wheelGeo.rotateZ(Math.PI / 2);
    [[-0.45, 0.14, -0.48], [0.45, 0.14, -0.48], [-0.45, 0.14, 0.48], [0.45, 0.14, 0.48]].forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(wx, wy, wz);
      car.add(w);
    });

    return car;
  }

  // Bãi đỗ xe ô tô 2 bên cánh sân đỗ (chuẩn video mẫu TikTok frame_6.0s & frame_7.0s)
  const parkedCars = [
    // Bên trái đường băng
    { color: 0xffffff, x: -8.2, z: -10 },
    { color: 0xef4444, x: -9.6, z: -10 },
    { color: 0x3b82f6, x: -8.2, z: 12 },
    { color: 0xffffff, x: -9.6, z: 12 },
    { color: 0xffffff, x: -8.2, z: -34 },
    { color: 0xef4444, x: -9.6, z: -34 },
    { color: 0x10b981, x: -8.2, z: -50 },
    { color: 0xffffff, x: -9.6, z: -50 },
    // Bên phải đường băng
    { color: 0xffffff, x: 8.2, z: -16 },
    { color: 0xef4444, x: 9.6, z: -16 },
    { color: 0x1e293b, x: 11.0, z: -16 },
    { color: 0x3b82f6, x: 8.4, z: 16 },
    { color: 0xffffff, x: 9.8, z: 16 },
    { color: 0xef4444, x: 8.4, z: -38 },
    { color: 0xffffff, x: 9.8, z: -38 },
    { color: 0xf59e0b, x: 8.4, z: -52 },
    { color: 0xffffff, x: 9.8, z: -52 }
  ];

  parkedCars.forEach(cfg => {
    const cMesh = createLowPolyCar(cfg.color);
    cMesh.position.set(cfg.x, 0, cfg.z);
    scrollingGroup.add(cMesh);
    scrollingElements.push(cMesh);
  });

  // Decal lục giác trên mặt sân đỗ (Hexagon decals chuẩn video TikTok frame_7.0s)
  const hexMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, wireframe: true, transparent: true, opacity: 0.4 });
  [-44, -22, 0, 22].forEach(hz => {
    const hL = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.0, 6), hexMat);
    hL.rotation.x = -Math.PI / 2;
    hL.position.set(-8.8, 0.012, hz);
    scrollingGroup.add(hL);
    scrollingElements.push(hL);

    const hR = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.0, 6), hexMat);
    hR.rotation.x = -Math.PI / 2;
    hR.position.set(8.8, 0.012, hz);
    scrollingGroup.add(hR);
    scrollingElements.push(hR);
  });

  // --- 4. TOÀN BỘ PHONG CẢNH SÂN BAY CUỘN ĐỒNG BỘ: ĐÀI QUAN SÁT, NHÀ KHO, BỒN NHIÊN LIỆU, TRẠM CỨU HỎA, CỜ GIÓ, CÂY XANH ---
  // Toàn bộ các công trình đài quan sát, nhà kho và vật thể sân bay được kết nối vào hệ thống scrollingElements để di chuyển đồng bộ với đường băng
  const hangarWallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.3 });
  const hangarRoofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.25, metalness: 0.5 });
  const hangarTrimMat = new THREE.MeshStandardMaterial({ color: 0xff5f38, roughness: 0.2, metalness: 0.4 });
  const apronPadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.1 });
  const cabGlassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.08, metalness: 0.85, transparent: true, opacity: 0.88 });
  const cabMat = cabGlassMat; // Alias cho theme toggle

  // Khai báo các đối tượng có chi tiết chuyển động xoay độc lập
  let radarDisc, secondaryRadarDish, satelliteRadarDisc;
  let windsockGroup1, windsockGroup2, windsockGroup;

  // 1. KHO MÁY BAY CHÍNH (Main Aviation Maintenance Hangar 01 - Phía Tây bên trái)
  const mainHangarGroup = new THREE.Group();
  const hangarApron = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.06, 11.5), apronPadMat);
  hangarApron.position.set(0, 0.03, 0);
  hangarApron.receiveShadow = true;
  mainHangarGroup.add(hangarApron);

  const hangarBody = new THREE.Mesh(new THREE.BoxGeometry(9.2, 3.4, 9.8), hangarWallMat);
  hangarBody.position.set(0, 1.7, 0);
  hangarBody.castShadow = true;
  hangarBody.receiveShadow = true;
  mainHangarGroup.add(hangarBody);

  const barrelRoof = new THREE.Mesh(
    new THREE.CylinderGeometry(4.8, 4.8, 10.0, 32, 1, false, 0, Math.PI),
    hangarRoofMat
  );
  barrelRoof.rotation.z = Math.PI / 2;
  barrelRoof.position.set(0, 3.4, 0);
  barrelRoof.castShadow = true;
  mainHangarGroup.add(barrelRoof);

  const hangarPortal = new THREE.Mesh(
    new THREE.BoxGeometry(7.2, 3.0, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
  );
  hangarPortal.position.set(0, 1.5, 4.95);
  mainHangarGroup.add(hangarPortal);

  const leftDoor = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 2.7, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.6 })
  );
  leftDoor.position.set(-1.8, 1.4, 5.05);
  mainHangarGroup.add(leftDoor);

  const rightDoor = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 2.7, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.6 })
  );
  rightDoor.position.set(2.4, 1.4, 5.05);
  mainHangarGroup.add(rightDoor);

  const hangarInteriorLight = new THREE.Mesh(
    new THREE.PlaneGeometry(3.0, 2.4),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.75 })
  );
  hangarInteriorLight.position.set(0.6, 1.4, 4.98);
  mainHangarGroup.add(hangarInteriorLight);

  const hangarSign = new THREE.Mesh(
    new THREE.BoxGeometry(5.8, 0.45, 0.1),
    hangarTrimMat
  );
  hangarSign.position.set(0, 3.2, 5.02);
  mainHangarGroup.add(hangarSign);

  const floodlightPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 4.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7 })
  );
  floodlightPole.position.set(4.8, 2.3, 4.8);
  mainHangarGroup.add(floodlightPole);

  const floodlightFixture = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.25, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x0f172a })
  );
  floodlightFixture.position.set(4.8, 4.6, 4.8);
  mainHangarGroup.add(floodlightFixture);

  const floodlightGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.45, 0.2),
    new THREE.MeshBasicMaterial({ color: 0xffedd5 })
  );
  floodlightGlow.position.set(4.8, 4.55, 4.98);
  mainHangarGroup.add(floodlightGlow);

  mainHangarGroup.position.set(-13.2, 0, -2.0);

  // 2. ĐÀI QUAN SÁT KHÔNG LƯU CHÍNH (Primary ATC Observation Tower - Phía Đông bên phải)
  const towerGroup = new THREE.Group();
  const towerBase = new THREE.Mesh(
    new THREE.CylinderGeometry(2.0, 2.4, 0.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 })
  );
  towerBase.position.y = 0.4;
  towerBase.receiveShadow = true;
  towerGroup.add(towerBase);

  const shaftGeo = new THREE.CylinderGeometry(0.85, 1.35, 7.6, 16);
  const shaftMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  shaft.position.y = 4.6;
  shaft.castShadow = true;
  shaft.receiveShadow = true;
  towerGroup.add(shaft);

  const ringGeo = new THREE.CylinderGeometry(0.96, 1.05, 1.2, 16);
  const ring = new THREE.Mesh(ringGeo, hangarTrimMat);
  ring.position.y = 6.2;
  ring.castShadow = true;
  towerGroup.add(ring);

  const catwalk = new THREE.Mesh(
    new THREE.CylinderGeometry(2.5, 1.25, 0.85, 16),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
  );
  catwalk.position.y = 8.5;
  catwalk.castShadow = true;
  towerGroup.add(catwalk);

  const towerCab = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 1.85, 1.5, 16),
    cabGlassMat
  );
  towerCab.position.y = 9.6;
  towerCab.castShadow = true;
  towerGroup.add(towerCab);

  const cabRoof = new THREE.Mesh(
    new THREE.ConeGeometry(2.7, 0.95, 16),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 })
  );
  cabRoof.position.y = 10.7;
  cabRoof.castShadow = true;
  towerGroup.add(cabRoof);

  const radarPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
  );
  radarPole.position.y = 11.6;
  towerGroup.add(radarPole);

  radarDisc = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.32, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xff5f38, roughness: 0.3 })
  );
  radarDisc.position.y = 12.0;
  radarDisc.name = "radarDisc";
  towerGroup.add(radarDisc);

  const beaconMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  beaconMesh.position.y = 12.4;
  towerGroup.add(beaconMesh);

  towerGroup.position.set(13.2, 0, -12.0);

  // 3. KHO HÀNG KHÔNG VẬN 02 (Air Cargo Logistics Hangar 02 - Phía Đông Nam)
  const cargoHangarGroup = new THREE.Group();
  const cargoApron = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.06, 8.0), apronPadMat);
  cargoApron.position.set(0, 0.03, 0);
  cargoHangarGroup.add(cargoApron);

  const cargoBody = new THREE.Mesh(new THREE.BoxGeometry(8.5, 3.2, 6.8), hangarWallMat);
  cargoBody.position.set(0, 1.6, 0);
  cargoBody.castShadow = true;
  cargoHangarGroup.add(cargoBody);

  const cargoRoof = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.35, 7.2), hangarRoofMat);
  cargoRoof.position.set(0, 3.3, 0);
  cargoRoof.castShadow = true;
  cargoHangarGroup.add(cargoRoof);

  [-2.4, 0, 2.4].forEach(doorX => {
    const doorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 2.2, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.4 })
    );
    doorMesh.position.set(doorX, 1.1, 3.42);
    cargoHangarGroup.add(doorMesh);

    const hazardStripe = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 0.15),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    hazardStripe.position.set(doorX, 0.08, 3.65);
    hazardStripe.rotation.x = -Math.PI / 2;
    cargoHangarGroup.add(hazardStripe);
  });
  cargoHangarGroup.position.set(13.2, 0, 10.0);

  // 4. ĐÀI QUAN SÁT PHỤ & TRẠM RADAR DOPPLER (Secondary ATC Radome Station - Phía Tây Nam)
  const radomeGroup = new THREE.Group();
  const radomePost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 1.1, 3.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
  );
  radomePost.position.y = 1.8;
  radomeGroup.add(radomePost);

  const radomePlatform = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.3, 0.35, 8),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
  );
  radomePlatform.position.y = 3.7;
  radomeGroup.add(radomePlatform);

  const radomeSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.25, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 })
  );
  radomeSphere.position.y = 4.9;
  radomeSphere.castShadow = true;
  radomeGroup.add(radomeSphere);

  secondaryRadarDish = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.65, 0.06, 12),
    new THREE.MeshStandardMaterial({ color: 0xff5f38, metalness: 0.6 })
  );
  secondaryRadarDish.position.set(1.4, 4.4, 0);
  secondaryRadarDish.rotation.z = Math.PI / 4;
  secondaryRadarDish.name = "secondaryRadarDish";
  radomeGroup.add(secondaryRadarDish);

  radomeGroup.position.set(-13.5, 0, 18.0);

  // 5. CỤM BỒN CHỨA NHIÊN LIỆU HÀNG KHÔNG JET A-1 (Aviation Fuel Storage Depot - Phía Tây)
  const fuelDepotGroup = new THREE.Group();
  const fuelApron = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.06, 8.5), apronPadMat);
  fuelApron.position.set(0, 0.03, 0);
  fuelDepotGroup.add(fuelApron);

  const bermWallMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
  const bermWall = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.4, 8.1), bermWallMat);
  bermWall.position.set(0, 0.2, 0);
  fuelDepotGroup.add(bermWall);

  const tankMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.65 });
  const tankCapMat = new THREE.MeshStandardMaterial({ color: 0xff5f38, roughness: 0.3 });
  [-2.2, 2.2].forEach(tx => {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 3.2, 24), tankMat);
    tank.position.set(tx, 1.8, 0);
    tank.castShadow = true;
    fuelDepotGroup.add(tank);

    const cap = new THREE.Mesh(new THREE.ConeGeometry(1.55, 0.45, 24), tankCapMat);
    cap.position.set(tx, 3.6, 0);
    fuelDepotGroup.add(cap);

    const signBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.35, 0.06),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    signBox.position.set(tx, 2.2, 1.54);
    fuelDepotGroup.add(signBox);
  });

  const pipeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.4, 12), pipeMat);
  pipe.rotation.z = Math.PI / 2;
  pipe.position.set(0, 3.2, 0);
  fuelDepotGroup.add(pipe);

  fuelDepotGroup.position.set(-14.2, 0, -24.0);

  // 6. TRẠM CỨU HỎA & CỨU HỘ KHẨN CẤP SÂN BAY (Airport Fire & Rescue Station - Phía Đông)
  const fireStationGroup = new THREE.Group();
  const fireApron = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.06, 8.5), apronPadMat);
  fireApron.position.set(0, 0.03, 0);
  fireStationGroup.add(fireApron);

  const fireBody = new THREE.Mesh(
    new THREE.BoxGeometry(9.2, 3.4, 7.5),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 })
  );
  fireBody.position.set(0, 1.7, 0);
  fireBody.castShadow = true;
  fireStationGroup.add(fireBody);

  const fireRoof = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.35, 7.9), hangarRoofMat);
  fireRoof.position.set(0, 3.5, 0);
  fireStationGroup.add(fireRoof);

  [-2.2, 2.2].forEach(dx => {
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 2.5, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4, metalness: 0.3 })
    );
    door.position.set(dx, 1.25, 3.76);
    fireStationGroup.add(door);

    const cautionMark = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 0.18),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    cautionMark.rotation.x = -Math.PI / 2;
    cautionMark.position.set(dx, 0.08, 4.0);
    fireStationGroup.add(cautionMark);
  });

  const sirenPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 2.0, 8),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
  );
  sirenPole.position.set(3.8, 4.5, 3.0);
  fireStationGroup.add(sirenPole);

  const sirenLightR = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  sirenLightR.position.set(3.8, 5.6, 3.0);
  fireStationGroup.add(sirenLightR);

  fireStationGroup.position.set(13.8, 0, -34.0);

  // 7. KHO MÁY BAY SKYWINGS EXPRESS 03 (Express Modern Hangar 03 - Phía Tây Bắc)
  const expressHangarGroup = new THREE.Group();
  const expressApron = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.06, 9.0), apronPadMat);
  expressApron.position.set(0, 0.03, 0);
  expressHangarGroup.add(expressApron);

  const expressBody = new THREE.Mesh(new THREE.BoxGeometry(8.8, 3.6, 7.8), hangarWallMat);
  expressBody.position.set(0, 1.8, 0);
  expressBody.castShadow = true;
  expressHangarGroup.add(expressBody);

  const expressRoof = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.35, 8.4), hangarRoofMat);
  expressRoof.position.set(0, 3.7, 0);
  expressRoof.rotation.x = 0.06;
  expressHangarGroup.add(expressRoof);

  const expressDoor = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 2.8, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.5 })
  );
  expressDoor.position.set(0, 1.4, 3.92);
  expressHangarGroup.add(expressDoor);

  const expressTrim = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.35, 0.1), hangarTrimMat);
  expressTrim.position.set(0, 3.3, 3.95);
  expressHangarGroup.add(expressTrim);

  expressHangarGroup.position.set(-13.5, 0, -46.0);

  // 8. ĐÀI QUAN SÁT PHỤ VÒM KÍNH HƯỚNG ĐÔNG (East Satellite ATC Lookout Tower - Phía Đông Bắc)
  const satelliteTowerGroup = new THREE.Group();
  const satBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.7, 0.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 })
  );
  satBase.position.y = 0.3;
  satelliteTowerGroup.add(satBase);

  const satShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.9, 5.8, 12),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 })
  );
  satShaft.position.y = 3.4;
  satShaft.castShadow = true;
  satelliteTowerGroup.add(satShaft);

  const satDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 1.0, 0.5, 12),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
  );
  satDeck.position.y = 6.4;
  satelliteTowerGroup.add(satDeck);

  const satCab = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.3, 1.2, 8),
    cabGlassMat
  );
  satCab.position.y = 7.2;
  satelliteTowerGroup.add(satCab);

  const satRoof = new THREE.Mesh(
    new THREE.ConeGeometry(1.8, 0.7, 8),
    hangarTrimMat
  );
  satRoof.position.y = 8.1;
  satelliteTowerGroup.add(satRoof);

  satelliteRadarDisc = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.22, 0.06),
    new THREE.MeshStandardMaterial({ color: 0xff5f38 })
  );
  satelliteRadarDisc.position.y = 8.8;
  satelliteTowerGroup.add(satelliteRadarDisc);

  satelliteTowerGroup.position.set(13.8, 0, -56.0);

  // 9. CỘT CỜ GIÓ SÂN BAY (ICAO Windsocks - 2 cột cờ bố trí hai bên đường băng)
  function createICAOWindsock() {
    const ws = new THREE.Group();
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.055, 3.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 })
    );
    mast.position.y = 1.6;
    ws.add(mast);

    const mTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.8 })
    );
    mTop.position.y = 3.25;
    ws.add(mTop);

    const basket = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.02, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
    );
    basket.position.set(0.2, 3.15, 0);
    basket.rotation.y = Math.PI / 2;
    ws.add(basket);

    const coneGeo = new THREE.ConeGeometry(0.22, 1.6, 12, 1, true);
    coneGeo.rotateZ(-Math.PI / 2);
    const cone = new THREE.Mesh(coneGeo, new THREE.MeshStandardMaterial({ color: 0xff5f38, roughness: 0.6 }));
    cone.position.set(1.0, 3.12, 0);
    cone.rotation.z = -0.12;
    ws.add(cone);

    const stripeGeo = new THREE.CylinderGeometry(0.16, 0.19, 0.5, 12, 1, true);
    stripeGeo.rotateZ(-Math.PI / 2);
    const stripe = new THREE.Mesh(stripeGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }));
    stripe.position.set(0.9, 3.13, 0);
    stripe.rotation.z = -0.12;
    ws.add(stripe);

    ws.scale.setScalar(0.75);
    return ws;
  }

  windsockGroup1 = createICAOWindsock();
  windsockGroup1.position.set(-14.5, 0, 8.0);

  windsockGroup2 = createICAOWindsock();
  windsockGroup2.position.set(14.5, 0, 27.0);
  windsockGroup = windsockGroup1; // backward compatibility

  // 10. HÀNG CÂY XANH VÀ BỤI CÂY VEN PHI TRƯỜNG (Airfield Perimeter Trees & Shrub Clusters)
  function createTreeCluster() {
    const cluster = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85 });
    const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.85 });

    function addPine(px, pz, scale) {
      const p = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.8, 6), trunkMat);
      trunk.position.y = 0.4;
      p.add(trunk);

      const f1 = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.4, 6), foliageMat1);
      f1.position.y = 1.3;
      p.add(f1);

      const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.1, 6), foliageMat2);
      f2.position.y = 1.9;
      p.add(f2);

      p.scale.setScalar(scale);
      p.position.set(px, 0, pz);
      cluster.add(p);
    }

    addPine(0, 0, 1.1);
    addPine(0.8, -0.6, 0.9);
    addPine(-0.7, 0.5, 0.8);
    return cluster;
  }

  const treeClusters = [];
  [
    [-17.5, -52], [-17.2, -35], [-17.5, -13], [-17.0, 4], [-17.5, 24],
    [17.5, -46], [17.2, -24], [17.5, -2], [17.0, 18], [17.5, 30]
  ].forEach(([tx, tz]) => {
    const tc = createTreeCluster();
    tc.position.set(tx, 0, tz);
    treeClusters.push(tc);
  });

  // TẬP HỢP TẤT CẢ CÔNG TRÌNH VÀ PHONG CẢNH SÂN BAY VÀO HỆ THỐNG SCROLLING
  const allAirportScenery = [
    mainHangarGroup,
    towerGroup,
    cargoHangarGroup,
    radomeGroup,
    fuelDepotGroup,
    fireStationGroup,
    expressHangarGroup,
    satelliteTowerGroup,
    windsockGroup1,
    windsockGroup2,
    ...treeClusters
  ];

  allAirportScenery.forEach(struct => {
    scrollingGroup.add(struct);
    scrollingElements.push(struct);
  });

  scene.add(scrollingGroup);
  window.__scrollingElements = scrollingElements;
  window.__scrollingStrips = scrollingElements; // backward compatibility
  window.runwayLights = runwayLights;

  // --- 5. Authentic Commercial Airliner Model (Boeing 787-9 Dreamliner FlyNest) ---
  const planeGroup = new THREE.Group();

  // Premium Aviation Materials
  const fuselageMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, // Pure aviation white gloss lacquer
    roughness: 0.12,
    metalness: 0.18
  });
  const orangeLiveryMat = new THREE.MeshStandardMaterial({
    color: 0xff5f38, // FlyNest Coral Orange
    roughness: 0.15,
    metalness: 0.22
  });
  const navyLiveryMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a, // FlyNest Deep Navy
    roughness: 0.20,
    metalness: 0.35
  });
  // Kính buồng lái và cửa sổ thân chuẩn hàng không: #0b1329 xanh đen bóng bẩy, bắt specular phản chiếu tự nhiên
  const airlineGlassMat = new THREE.MeshStandardMaterial({
    color: 0x0b1329,
    roughness: 0.05,
    metalness: 0.85
  });
  const cockpitGlassMat = airlineGlassMat;
  const windowMat = airlineGlassMat;

  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9, // Aeronautical lightweight composite grey-white
    roughness: 0.20,
    metalness: 0.15
  });
  const nacelleMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
    metalness: 0.20
  });
  const chromeLipMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.04,
    metalness: 0.98
  });
  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.28,
    metalness: 0.88
  });
  const strobeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const navGreenMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  const navRedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  // A. Seamless Aerodynamic Fuselage (Single Continuous Lathe Profile)
  const fuselagePoints = [];
  fuselagePoints.push(new THREE.Vector2(0.001, -5.3)); // Radome tip
  fuselagePoints.push(new THREE.Vector2(0.14, -5.15));
  fuselagePoints.push(new THREE.Vector2(0.28, -4.85));
  fuselagePoints.push(new THREE.Vector2(0.42, -4.35));
  fuselagePoints.push(new THREE.Vector2(0.52, -3.65));
  fuselagePoints.push(new THREE.Vector2(0.58, -2.8));
  fuselagePoints.push(new THREE.Vector2(0.60, -1.8));  // Cockpit/forward cabin
  fuselagePoints.push(new THREE.Vector2(0.60, -0.8));
  fuselagePoints.push(new THREE.Vector2(0.60, 0.5));   // Center cabin / wing root
  fuselagePoints.push(new THREE.Vector2(0.60, 1.8));
  fuselagePoints.push(new THREE.Vector2(0.60, 2.7));
  fuselagePoints.push(new THREE.Vector2(0.57, 3.4));   // Aft taper
  fuselagePoints.push(new THREE.Vector2(0.50, 4.1));
  fuselagePoints.push(new THREE.Vector2(0.38, 4.7));
  fuselagePoints.push(new THREE.Vector2(0.24, 5.2));
  fuselagePoints.push(new THREE.Vector2(0.12, 5.55));
  fuselagePoints.push(new THREE.Vector2(0.05, 5.75));  // APU tail cone

  const fuselageGeo = new THREE.LatheGeometry(fuselagePoints, 48);
  fuselageGeo.rotateX(Math.PI / 2);
  const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
  fuselage.castShadow = true;
  fuselage.receiveShadow = true;
  planeGroup.add(fuselage);

  // APU exhaust metallic nozzle ring at extreme tail
  const apuRing = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.024, 12, 24), titaniumMat);
  apuRing.position.set(0, 0.05, 5.75);
  planeGroup.add(apuRing);

  // APU intake/exhaust vents (2 small oval vents on tail)
  const ventGeo = new THREE.CylinderGeometry(0.04, 0.055, 0.08, 8);
  ventGeo.rotateX(Math.PI / 2);
  for (const vx of [0.06, -0.06]) {
    const vent = new THREE.Mesh(ventGeo, titaniumMat);
    vent.position.set(vx, 0.06, 5.65);
    planeGroup.add(vent);
  }

  // Aerodynamic Wing-Body Fairing (Belly fairing that smoothly blends wings)
  const bellyFairing = new THREE.Mesh(
    new THREE.BoxGeometry(1.42, 0.28, 3.0),
    fuselageMat
  );
  bellyFairing.position.set(0, -0.36, 0.25);
  bellyFairing.castShadow = true;
  planeGroup.add(bellyFairing);

  // B. Kính buồng lái khí động học chuẩn Boeing 787 (Aerodynamic Wrap-Around Cockpit Visor)
  // Xóa bỏ khối hộp lồi; tạo dải kính vát chéo phẳng ôm theo đường cong chóp mũi, phẳng liền mạch với vỏ thân
  function buildCockpitVisor() {
    const visorGroup = new THREE.Group();
    const positions = [];
    const indices = [];

    function addQuad(v0, v1, v2, v3) {
      const baseIdx = positions.length / 3;
      [v0, v1, v2, v3].forEach(v => {
        const r = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        const factor = r > 0.001 ? (r + 0.006) / r : 1;
        positions.push(v[0] * factor, v[1] * factor, v[2]);
      });
      // Double-sided rendering
      indices.push(baseIdx, baseIdx + 1, baseIdx + 2);
      indices.push(baseIdx, baseIdx + 2, baseIdx + 3);
      indices.push(baseIdx, baseIdx + 2, baseIdx + 1);
      indices.push(baseIdx, baseIdx + 3, baseIdx + 2);
    }

    [1, -1].forEach(sign => {
      // 1. Kính chắn gió chính phía trước (Center-front windshield panel vát chéo 38°)
      addQuad(
        [0, 0.485, -3.72],
        [sign * 0.22, 0.460, -3.80],
        [sign * 0.24, 0.325, -4.16],
        [0, 0.355, -4.20]
      );
      // 2. Kính bên hông buồng lái ôm má mũi (Wrap-around side cheek panel)
      addQuad(
        [sign * 0.22, 0.460, -3.80],
        [sign * 0.46, 0.385, -3.45],
        [sign * 0.49, 0.255, -3.52],
        [sign * 0.24, 0.325, -4.16]
      );
      // 3. Kính đuôi mắt buồng lái (Aft eyebrow window panel)
      addQuad(
        [sign * 0.46, 0.385, -3.45],
        [sign * 0.54, 0.325, -3.22],
        [sign * 0.55, 0.225, -3.28],
        [sign * 0.49, 0.255, -3.52]
      );
    });

    const visorGeo = new THREE.BufferGeometry();
    visorGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    visorGeo.setIndex(indices);
    visorGeo.computeVertexNormals();

    const visorMesh = new THREE.Mesh(visorGeo, airlineGlassMat);
    visorGroup.add(visorMesh);
    return visorGroup;
  }
  planeGroup.add(buildCockpitVisor());

  // C. Airline Livery & Hàng cửa sổ hành khách (12 ô oval bo góc xếp thẳng hàng tăm tắp)
  // Livery cheatlines chạy bên dưới cửa sổ, cách một khoảng trắng sạch sẽ (không lem nhem)
  function createStripeGroup(sign) {
    const grp = new THREE.Group();
    // Dải sọc cam san hô ở y = 0.04 (bên dưới cửa sổ y = 0.16)
    const stripeOrange = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.045, 5.2), orangeLiveryMat);
    stripeOrange.position.set(sign * 0.601, 0.04, 0.1);
    grp.add(stripeOrange);

    // Dải sọc xanh navy viền dưới ở y = 0.005
    const stripeNavy = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.025, 5.2), navyLiveryMat);
    stripeNavy.position.set(sign * 0.601, 0.005, 0.1);
    grp.add(stripeNavy);

    // Vuốt nhọn vạt sọc về phía đầu mũi (z = -2.5 đến -3.8)
    const noseOrange = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.04, 1.4), orangeLiveryMat);
    noseOrange.position.set(sign * 0.548, 0.035, -3.2);
    noseOrange.rotation.y = sign * 0.065;
    grp.add(noseOrange);

    const noseNavy = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.02, 1.4), navyLiveryMat);
    noseNavy.position.set(sign * 0.548, 0.005, -3.2);
    noseNavy.rotation.y = sign * 0.065;
    grp.add(noseNavy);

    return grp;
  }

  planeGroup.add(createStripeGroup(1));
  planeGroup.add(createStripeGroup(-1));

  // Hàng cửa sổ hành khách Boeing 787: 12 ô oval bo góc xếp thẳng hàng tăm tắp ở y = 0.16
  const windowGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.014, 16);
  windowGeo.rotateZ(Math.PI / 2);
  windowGeo.scale(1, 1.35, 0.95);

  for (let i = 0; i < 12; i++) {
    const z = -2.2 + i * 0.38; // Xếp đều từ z = -2.2 đến z = 1.98
    const winR = new THREE.Mesh(windowGeo, airlineGlassMat);
    winR.position.set(0.584, 0.16, z);
    planeGroup.add(winR);

    const winL = new THREE.Mesh(windowGeo, airlineGlassMat);
    winL.position.set(-0.584, 0.16, z);
    planeGroup.add(winL);
  }

  // C2. Cửa ra vào hành khách & Cảm biến Pitot khí động học (Door outlines & Pitot probes)
  const doorGeo = new THREE.BoxGeometry(0.04, 0.44, 0.24);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.35, metalness: 0.2 });
  for (const sign of [1, -1]) {
    // Cửa trước L1 / R1
    const door1 = new THREE.Mesh(doorGeo, doorMat);
    door1.position.set(sign * 0.598, 0.08, -2.55);
    planeGroup.add(door1);

    // Cửa sau L2 / R2
    const door2 = new THREE.Mesh(doorGeo, doorMat);
    door2.position.set(sign * 0.598, 0.08, 2.35);
    planeGroup.add(door2);

    // Cặp cảm biến Pitot trên đầu mũi
    const pitot = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 6), titaniumMat);
    pitot.rotation.z = Math.PI / 2;
    pitot.position.set(sign * 0.35, -0.05, -4.5);
    planeGroup.add(pitot);
  }

  // D. Swept Wings with Natural Dreamliner Wing Flex & Raked Wingtips
  function buildAirlinerWing(isRight) {
    const wingGroup = new THREE.Group();
    const sign = isRight ? 1 : -1;

    // 1. Inboard Wing Root (thick, high lift)
    const rootMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.14, 1.8), wingMat);
    rootMesh.position.set(sign * 1.3, -0.06, 0.15);
    rootMesh.rotation.y = -sign * 0.32;
    rootMesh.rotation.z = sign * 0.02;
    rootMesh.castShadow = true;
    wingGroup.add(rootMesh);

    // 2. Mid Wing (aerodynamic transition)
    const midMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.09, 1.3), wingMat);
    midMesh.position.set(sign * 3.0, -0.01, 0.75);
    midMesh.rotation.y = -sign * 0.36;
    midMesh.rotation.z = sign * 0.035;
    midMesh.castShadow = true;
    wingGroup.add(midMesh);

    // 3. Outboard Wing with natural resting ground dihedral
    const tipMesh = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.05, 0.85), wingMat);
    tipMesh.position.set(sign * 4.75, 0.06, 1.45);
    tipMesh.rotation.y = -sign * 0.40;
    tipMesh.rotation.z = sign * 0.055;
    tipMesh.castShadow = true;
    wingGroup.add(tipMesh);

    // 4. Authentic 787 Raked Wingtip (curved aerodynamic blade raked back and up)
    const rakedTipGeo = new THREE.ConeGeometry(0.22, 1.25, 8);
    rakedTipGeo.rotateZ(sign * Math.PI / 2);
    rakedTipGeo.scale(0.2, 1, 0.65);
    const rakedTip = new THREE.Mesh(rakedTipGeo, orangeLiveryMat);
    rakedTip.position.set(sign * 5.85, 0.16, 1.9);
    rakedTip.rotation.y = -sign * 0.48;
    rakedTip.rotation.x = -0.12;
    rakedTip.rotation.z = sign * 0.10;
    rakedTip.castShadow = true;
    wingGroup.add(rakedTip);

    // 5. Flap track canoes (3 teardrop fairings under each wing)
    const canoeGeo = new THREE.CylinderGeometry(0.04, 0.07, 0.95, 8);
    canoeGeo.rotateX(Math.PI / 2);
    for (let c = 0; c < 3; c++) {
      const canoe = new THREE.Mesh(canoeGeo, wingMat);
      canoe.position.set(sign * (1.8 + c * 1.05), -0.16, 0.8 + c * 0.35);
      canoe.castShadow = true;
      wingGroup.add(canoe);
    }

    // 6. Navigation light beacon & strobe
    const navMat = isRight ? navGreenMat : navRedMat;
    const navLight = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), navMat);
    navLight.position.set(sign * 5.95, 0.20, 1.82);
    wingGroup.add(navLight);

    const strobe = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), strobeMat);
    strobe.position.set(sign * 5.98, 0.20, 1.98);
    wingGroup.add(strobe);

    if (isRight) {
      wingPointR.position.set(sign * 5.95, 0.20, 1.82);
      wingGroup.add(wingPointR);
    } else {
      wingPointL.position.set(sign * 5.95, 0.20, 1.82);
      wingGroup.add(wingPointL);
    }

    return wingGroup;
  }

  planeGroup.add(buildAirlinerWing(true));
  planeGroup.add(buildAirlinerWing(false));

  // E. Twin High-Bypass Turbofan Engines (GE GEnx with Chevron Exhaust)
  const turbofans = [];
  function buildTurbofanEngine(isRight) {
    const engineGroup = new THREE.Group();
    const sign = isRight ? 1 : -1;

    // Aerodynamic pylon strut securely connecting nacelle into wing underside
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.56, 1.05), wingMat);
    pylon.position.set(0, 0.32, -0.05);
    pylon.castShadow = true;
    engineGroup.add(pylon);

    // Engine nacelle cowling
    const nacelleGeo = new THREE.CylinderGeometry(0.38, 0.35, 1.6, 28);
    nacelleGeo.rotateX(Math.PI / 2);
    const nacelle = new THREE.Mesh(nacelleGeo, nacelleMat);
    nacelle.castShadow = true;
    engineGroup.add(nacelle);

    // Polished Chrome intake lip ring
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.038, 14, 28), chromeLipMat);
    lip.position.set(0, 0, -0.8);
    engineGroup.add(lip);

    // Titanium fan assembly inside intake
    const fanAssembly = new THREE.Group();
    fanAssembly.position.set(0, 0, -0.62);

    // Dark titanium backplate
    const fanBack = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 24), titaniumMat);
    fanBack.rotateX(Math.PI / 2);
    fanAssembly.add(fanBack);

    // 12 Titanium fan blades
    const bladeGeo = new THREE.BoxGeometry(0.04, 0.28, 0.015);
    for (let b = 0; b < 12; b++) {
      const blade = new THREE.Mesh(bladeGeo, titaniumMat);
      blade.rotation.z = (b / 12) * Math.PI * 2;
      blade.position.set(Math.cos(blade.rotation.z) * 0.14, Math.sin(blade.rotation.z) * 0.14, 0);
      fanAssembly.add(blade);
    }

    // Center conical fan spinner with white spiral tip
    const spinGeo = new THREE.ConeGeometry(0.11, 0.38, 16);
    spinGeo.rotateX(-Math.PI / 2);
    const spinner = new THREE.Mesh(spinGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.15 }));
    spinner.position.set(0, 0, 0.08);
    fanAssembly.add(spinner);

    engineGroup.add(fanAssembly);
    turbofans.push(fanAssembly);

    // Signature 787 Chevron Serrated Exhaust Cowling (8 teeth around nozzle)
    const chevronRing = new THREE.Group();
    chevronRing.position.set(0, 0, 0.8);
    const toothGeo = new THREE.ConeGeometry(0.06, 0.18, 4);
    toothGeo.rotateX(Math.PI / 2);
    for (let c = 0; c < 8; c++) {
      const angle = (c / 8) * Math.PI * 2;
      const tooth = new THREE.Mesh(toothGeo, orangeLiveryMat);
      tooth.position.set(Math.cos(angle) * 0.33, Math.sin(angle) * 0.33, 0);
      tooth.rotation.z = angle;
      chevronRing.add(tooth);
    }
    engineGroup.add(chevronRing);

    // Core exhaust plug
    const corePlug = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.42, 16), titaniumMat);
    corePlug.rotateX(Math.PI / 2);
    corePlug.position.set(0, 0, 1.05);
    engineGroup.add(corePlug);

    engineGroup.position.set(sign * 2.15, -0.52, -0.32);
    return engineGroup;
  }

  planeGroup.add(buildTurbofanEngine(true));
  planeGroup.add(buildTurbofanEngine(false));

  // F. Empennage (Vertical Fin with Seamless Aerodynamic Profile & Flush Livery)
  // Vertical Stabilizer (Fin) - Scaled to authentic 787 proportion with flush livery
  const finGroup = new THREE.Group();

  // 1. Aerodynamic Upper Fin (FlyNest Coral Orange #ff5f38 with extruded aerofoil bevel)
  const orangeShape = new THREE.Shape();
  orangeShape.moveTo(3.9, 1.15);
  orangeShape.lineTo(4.85, 2.15);
  orangeShape.quadraticCurveTo(5.10, 2.18, 5.30, 2.10);
  orangeShape.lineTo(5.36, 1.25);
  orangeShape.quadraticCurveTo(4.60, 1.18, 3.9, 1.15);

  const extrudeSettings = {
    depth: 0.065,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2
  };

  const finMainGeo = new THREE.ExtrudeGeometry(orangeShape, extrudeSettings);
  finMainGeo.translate(0, 0, -0.065 / 2);
  finMainGeo.rotateY(-Math.PI / 2);
  const finMain = new THREE.Mesh(finMainGeo, orangeLiveryMat);
  finMain.castShadow = true;
  finGroup.add(finMain);

  // 2. Lower Dorsal Fairing & Rudder Root (FlyNest Deep Navy - Flush seamless paint layer)
  const navyShape = new THREE.Shape();
  navyShape.moveTo(2.8, 0.52);
  navyShape.quadraticCurveTo(3.3, 0.62, 3.9, 1.15);
  navyShape.quadraticCurveTo(4.60, 1.18, 5.36, 1.25);
  navyShape.lineTo(5.42, 0.35);
  navyShape.quadraticCurveTo(4.1, 0.48, 2.8, 0.52);

  const finNavyGeo = new THREE.ExtrudeGeometry(navyShape, extrudeSettings);
  finNavyGeo.translate(0, 0, -0.065 / 2);
  finNavyGeo.rotateY(-Math.PI / 2);
  const finNavy = new THREE.Mesh(finNavyGeo, navyLiveryMat);
  finNavy.castShadow = true;
  finGroup.add(finNavy);

  // 3. FlyNest Wing Crest Decal (Dynamic flush white swoop stripe)
  const crestShape = new THREE.Shape();
  crestShape.moveTo(3.95, 1.16);
  crestShape.lineTo(5.08, 1.98);
  crestShape.lineTo(5.18, 1.86);
  crestShape.lineTo(4.12, 1.14);
  crestShape.closePath();

  const crestExtrude = {
    depth: 0.069,
    bevelEnabled: false
  };
  const crestGeo = new THREE.ExtrudeGeometry(crestShape, crestExtrude);
  crestGeo.translate(0, 0, -0.069 / 2);
  crestGeo.rotateY(-Math.PI / 2);
  const finCrest = new THREE.Mesh(crestGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
  finGroup.add(finCrest);

  // Red beacon on top of tail fin
  const finBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), beaconMat);
  finBeacon.position.set(0, 2.16, 5.25);
  finGroup.add(finBeacon);

  planeGroup.add(finGroup);

  // FlyNest fin logo: white "SW" swoosh symbol on the vertical stabilizer
  const swooshShape = new THREE.Shape();
  swooshShape.moveTo(4.0, 1.55);
  swooshShape.quadraticCurveTo(4.5, 1.85, 5.1, 1.65);
  swooshShape.quadraticCurveTo(4.6, 1.45, 4.0, 1.55);
  const swooshGeo = new THREE.ShapeGeometry(swooshShape);
  const swoosh = new THREE.Mesh(swooshGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
  swoosh.rotation.y = -Math.PI / 2;
  swoosh.position.set(-0.04, 0, 0);
  finGroup.add(swoosh);

  // Horizontal Tail Stabilizers (Swept tail wings with slight dihedral)
  const hStabGeo = new THREE.BoxGeometry(2.3, 0.05, 0.85);
  const hStabR = new THREE.Mesh(hStabGeo, wingMat);
  hStabR.position.set(1.25, 0.35, 4.4);
  hStabR.rotation.y = -0.38;
  hStabR.rotation.z = 0.06;
  hStabR.castShadow = true;
  planeGroup.add(hStabR);

  const hStabL = new THREE.Mesh(hStabGeo, wingMat);
  hStabL.position.set(-1.25, 0.35, 4.4);
  hStabL.rotation.y = 0.38;
  hStabL.rotation.z = -0.06;
  hStabL.castShadow = true;
  planeGroup.add(hStabL);

  // G. Tricycle Landing Gear (Authentic Aircraft Wheels & Hydraulic Struts)
  const gearMetalMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.2
  });
  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.85,
    metalness: 0.1
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.9,
    roughness: 0.15
  });

  const aircraftWheels = [];
  function createWheel() {
    const wGroup = new THREE.Group();
    // Tire
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.11, 18), tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wGroup.add(tire);
    // Rim
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.115, 18), rimMat);
    rim.rotation.z = Math.PI / 2;
    wGroup.add(rim);
    aircraftWheels.push(wGroup);
    return wGroup;
  }

  // 1. Nose Gear (Front Hydraulic Strut + Dual Steering Wheels)
  const noseGear = new THREE.Group();
  const noseStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.95, 8), gearMetalMat);
  noseStrut.position.set(0, -0.65, -3.2);
  noseStrut.castShadow = true;
  noseGear.add(noseStrut);

  const noseWheelL = createWheel();
  noseWheelL.position.set(-0.09, -1.05, -3.2);
  noseGear.add(noseWheelL);

  const noseWheelR = createWheel();
  noseWheelR.position.set(0.09, -1.05, -3.2);
  noseGear.add(noseWheelR);
  planeGroup.add(noseGear);

  // 2. Main Gear Left (Port Strut + 4-Wheel Heavy Bogie)
  const mainGearL = new THREE.Group();
  const mainStrutL = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.07, 1.15, 8), gearMetalMat);
  mainStrutL.position.set(-1.65, -0.68, 0.4);
  mainStrutL.castShadow = true;
  mainGearL.add(mainStrutL);

  for (const zOff of [-0.18, 0.18]) {
    const w1 = createWheel();
    w1.position.set(-1.82, -1.18, 0.4 + zOff);
    mainGearL.add(w1);
    const w2 = createWheel();
    w2.position.set(-1.48, -1.18, 0.4 + zOff);
    mainGearL.add(w2);
  }
  planeGroup.add(mainGearL);

  // 3. Main Gear Right (Starboard Strut + 4-Wheel Heavy Bogie)
  const mainGearR = new THREE.Group();
  const mainStrutR = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.07, 1.15, 8), gearMetalMat);
  mainStrutR.position.set(1.65, -0.68, 0.4);
  mainStrutR.castShadow = true;
  mainGearR.add(mainStrutR);

  for (const zOff of [-0.18, 0.18]) {
    const w1 = createWheel();
    w1.position.set(1.48, -1.18, 0.4 + zOff);
    mainGearR.add(w1);
    const w2 = createWheel();
    w2.position.set(1.82, -1.18, 0.4 + zOff);
    mainGearR.add(w2);
  }
  planeGroup.add(mainGearR);

  // Wheel chocks (safety chocks under main gear wheels - bright orange)
  const chockMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.7 });
  const chockGeo = new THREE.BoxGeometry(0.14, 0.10, 0.12);
  const chockPositions = [
    [-1.82, -1.05, 0.55], [-1.48, -1.05, 0.55],
    [1.48, -1.05, 0.55],  [1.82, -1.05, 0.55]
  ];
  chockPositions.forEach(([cx, cy, cz]) => {
    const chock = new THREE.Mesh(chockGeo, chockMat);
    chock.position.set(cx, cy, cz);
    chock.rotation.x = 0.35; // wedge tilt angle
    planeGroup.add(chock);
  });

  // THREE.Box3 Bounding Box Normalization & Ground Snapping
  const initialBox = new THREE.Box3().setFromObject(planeGroup);
  const center = new THREE.Vector3();
  initialBox.getCenter(center);

  // Auto-center X and Z
  planeGroup.children.forEach(child => {
    child.position.x -= center.x;
    child.position.z -= center.z;
  });

  // Snap landing gear wheels to touch runway surface at exactly y = 0.05
  const boxAfterCenter = new THREE.Box3().setFromObject(planeGroup);
  const groundDelta = boxAfterCenter.min.y - 0.05;
  planeGroup.children.forEach(child => {
    child.position.y -= groundDelta;
  });

  // Đảm bảo 100% chi tiết máy bay đổ bóng rõ nét xuống mặt đường băng
  planeGroup.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true;
    }
  });

  // Scale vừa vặn: Thân máy bay nằm gọn gàng giữa tiêu đề "Ready to take off?" và mép trên Card tìm kiếm
  planeGroup.scale.setScalar(0.78);

  // Soft Ambient Occlusion Contact Shadow Mesh under Aircraft
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const sCtx = shadowCanvas.getContext('2d');
  const sGrad = sCtx.createRadialGradient(128, 128, 15, 128, 128, 115);
  sGrad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
  sGrad.addColorStop(0.35, 'rgba(15, 23, 42, 0.22)');
  sGrad.addColorStop(0.7, 'rgba(15, 23, 42, 0.08)');
  sGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  sCtx.fillStyle = sGrad;
  sCtx.fillRect(0, 0, 256, 256);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);

  const shadowGeo = new THREE.PlaneGeometry(12.0, 12.0);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.65,
    depthWrite: false
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.set(0, 0.008, -1.5);
  scene.add(contactShadow);

  // High-altitude soft cumulus clouds drifting across the airport
  const cloudGroup = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1.0,
    transparent: true,
    opacity: 0.22,
    depthWrite: false
  });
  function createCloud(cx, cy, cz, s) {
    const cg = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), cloudMat);
      puff.position.set((i - 1.5) * 1.3, Math.sin(i) * 0.3, (i % 2) * 0.5);
      puff.scale.set(1.3, 0.4, 0.9);
      cg.add(puff);
    }
    cg.scale.setScalar(s);
    cg.position.set(cx, cy, cz);
    cloudGroup.add(cg);
    return cg;
  }
  const driftingClouds = [
    createCloud(-24, 16, -12, 2.0),
    createCloud(18, 17, 3, 1.8),
    createCloud(-8, 18, -26, 2.4)
  ];
  scene.add(cloudGroup);

  // 1. CỐ ĐỊNH MÁY BAY ĐỨNG YÊN TRÊN ĐƯỜNG BĂNG (Static Parked Commercial Airliner)
  // Chuẩn theo yêu cầu người dùng: Máy bay đứng yên tuyệt đối, chỉ bắt đầu bay khi chuyển trang
  planeGroup.position.set(0, 0.05, -1.5);
  planeGroup.rotation.set(0, 0, 0);
  scene.add(planeGroup);
  window.__planeGroup = planeGroup;
  window.__scene = scene;

  // Trạng thái cất cánh khi chuyển trang (Takeoff transition state)
  window.__isTakingOff = false;
  window.__takeoffStartTime = 0;
  window.__takeoffTargetUrl = null;
  window.__navigated = false;

  // Hàm kích hoạt cất cánh phi cơ ngoạn mục và chuyển trang
  window.triggerAirplaneTakeoffAndNavigate = function(targetUrl) {
    if (window.__isTakingOff) return;
    window.__isTakingOff = true;
    window.__navigated = false;
    try {
      window.__takeoffStartTime = performance.now() / 1000;
      window.__takeoffTargetUrl = targetUrl;
      if (window.playTakeoffSound) {
        window.playTakeoffSound();
      } else if (window.playClickSound) {
        window.playClickSound();
      }

      let bar = document.getElementById('page-progress-bar');
      if (bar) {
        bar.style.opacity = '1';
        bar.style.transition = 'width 1.0s cubic-bezier(0.4, 0, 0.2, 1)';
        bar.style.width = '100%';
      }

      // Fallback an toàn phòng khi tab bị ẩn hoặc frame bị gián đoạn:
      // Tự động chuyển trang sau 1.0s khớp hoàn toàn với thời gian máy bay bay ra khỏi khung hình
      setTimeout(() => {
        if (!window.__navigated) {
          window.__navigated = true;
          window.location.href = targetUrl;
        }
      }, 1000);
    } catch (err) {
      console.warn('Takeoff animation fallback:', err);
      window.location.href = targetUrl;
    }
  };

  // Note: Sự kiện click điều hướng nội bộ và CTA cất cánh được hợp nhất tập trung qua
  // bộ điều khiển navigateTo() tại Section 11 (tránh xung đột hai listener cùng bắt một sự kiện).

  let animationFrameId = null;
  let isTabVisible = !document.hidden;
  let isCanvasInView = true;

  // Tạm dừng render loop khi tab ẩn để tiết kiệm GPU/RAM
  const handleVisibilityChange = () => {
    isTabVisible = !document.hidden;
    if (isTabVisible && isCanvasInView && !animationFrameId) {
      lastFrameTime = performance.now();
      animate();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Performance (P2-02): IntersectionObserver pauses 60fps loop when scrolled out of view
  if (typeof IntersectionObserver !== 'undefined' && container) {
    const runwayObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isCanvasInView = entry.isIntersecting;
        if (isCanvasInView && isTabVisible && !animationFrameId) {
          lastFrameTime = performance.now();
          animate();
        }
      });
    }, { threshold: 0.05 });
    runwayObserver.observe(container);
  }

  // Accessibility (P2-02): Check prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Render Animation Loop - 60 FPS / Adaptive 30 FPS Eco Mode
  let lastFrameTime = performance.now();
  let lastRenderTimestamp = 0;
  let simTime = 0;
  let slowFrameCounter = 0;

  function animate() {
    if (!isTabVisible || (!isCanvasInView && !window.__isTakingOff)) {
      animationFrameId = null;
      return;
    }
    // If user prefers reduced motion and not transitioning, render single frame and pause loop
    if (prefersReducedMotion && !window.__isTakingOff && simTime > 0.05) {
      renderer.render(scene, camera);
      animationFrameId = null;
      return;
    }

    animationFrameId = requestAnimationFrame(animate);
    const now = performance.now();

    // ⚡ Framerate Throttling for low-spec hardware / eco mode: Caps at ~30 FPS floor (saves >50% CPU/GPU and battery)
    const isEcoRunning = (window.__perfMode === 'eco' || window.__ecoMode);
    if (isEcoRunning && !window.__isTakingOff) {
      if (now - lastRenderTimestamp < 32.5) {
        return;
      }
    }
    lastRenderTimestamp = now;

    const rawDelta = (now - lastFrameTime) / 1000;
    // Cap max delta to 33ms (30fps floor) to eliminate stutter during theme toggle DOM reflows
    const delta = Math.min(rawDelta, 0.033);
    lastFrameTime = now;
    simTime += delta;
    const t = simTime;

    // ⚡ Dynamic lag detection: if in standard mode and experiencing severe lag (>38ms per frame for >90 frames)
    if (!isEcoRunning && !window.__isTakingOff && simTime > 2.0) {
      if (rawDelta > 0.038) {
        slowFrameCounter++;
        if (slowFrameCounter > 90) {
          if (typeof window.__setPerformanceMode === 'function') {
            window.__setPerformanceMode('eco', true);
          }
          slowFrameCounter = 0;
        }
      } else if (slowFrameCounter > 0) {
        slowFrameCounter--;
      }
    }

    // Khóa chặt góc camera chuẩn top-down nhìn từ trên cao xuống (0, 16, 11) nhìn (0, 0, -2)
    camera.position.set(0, 16, 11);
    camera.lookAt(0, 0, -2);

    // KIỂM TRA TRẠNG THÁI: BAY TẦM THẤP Ở TRANG CHỦ vs CẤT CÁNH LÊN CAO KHI CHUYỂN TRANG
    if (window.__isTakingOff) {
      // 1. KHI CHUYỂN TRANG: BẮT ĐẦU CẤT CÁNH LÊN CAO (Dynamic High-Altitude Takeoff Climb)
      // Giảm thời gian chuyển trang xuống khớp chuẩn với thời gian máy bay bay ra khỏi khung hình web (~1.3s)
      const elapsed = t - (window.__takeoffStartTime || t);
      const takeoffDuration = 1.30; // 1.3 giây: chu trình bay diễn ra trọn vẹn và thoát màn hình đúng lúc chuyển trang
      const takeoffProgress = Math.min(1.0, Math.max(0.0, elapsed / takeoffDuration));

      // Đường băng và phong cảnh tăng tốc lùi nhanh về sau
      const takeoffRunwaySpeed = 0.22 + takeoffProgress * 2.6;
      const scrollList = window.__scrollingElements || window.__scrollingStrips;
      if (scrollList) {
        scrollList.forEach(item => {
          item.position.z += takeoffRunwaySpeed;
          if (item.position.z > 32) {
            item.position.z -= 88;
          }
        });
      }

      // Động lực học phi cơ cất cánh:
      // Tăng tốc chạy đà ➔ ngóc đầu Rotate ➔ bay vút thẳng hướng trên thoát khỏi khung hình
      const climbCurve = Math.pow(takeoffProgress, 1.75);

      // Căn thẳng trục X về 0 (khóa hướng bay thẳng tâm)
      planeGroup.position.x = THREE.MathUtils.lerp(planeGroup.position.x, 0, Math.min(1.0, takeoffProgress * 3.5));

      // Nâng độ cao vút lên bầu trời (Y): đạt 5.8 khi thoát khỏi mép trên màn hình
      planeGroup.position.y = THREE.MathUtils.lerp(0.65, 5.8, climbCurve);

      // Phóng thẳng về phía trước theo hướng trên màn hình (-Z): đạt -25.0 khi đuôi vừa ra khỏi khung hình
      planeGroup.position.z = THREE.MathUtils.lerp(-1.5, -25.0, climbCurve);

      // Đầu máy bay ngẩng thẳng lên bầu trời chuẩn tư thế cất cánh (pitch up)
      planeGroup.rotation.x = THREE.MathUtils.lerp(-0.02, -0.40, Math.pow(takeoffProgress, 1.3));

      // Cân bằng 2 cánh thẳng tắp không nghiêng lắc (roll = 0, yaw = 0)
      planeGroup.rotation.z = THREE.MathUtils.lerp(planeGroup.rotation.z, 0, Math.min(1.0, takeoffProgress * 3.5));
      planeGroup.rotation.y = 0;

      // Bóng đổ mờ dần, mở rộng và lùi xa khi bay lên cao
      contactShadow.position.set(0, 0.008, planeGroup.position.z + climbCurve * 3.5);
      contactShadow.scale.setScalar(THREE.MathUtils.lerp(0.95, 3.2, climbCurve));
      contactShadow.material.opacity = THREE.MathUtils.lerp(0.52, 0.0, climbCurve);

      // Cánh quạt động cơ quay tít hết công suất cất cánh
      turbofans.forEach(sp => {
        sp.rotation.z += 1.35;
      });

      // Kiểm tra khoảnh khắc máy bay vừa bay ra khỏi khung hình web:
      // Ở góc nhìn camera (0, 16, 11), khi z <= -16.5 và y >= 3.8, toàn bộ thân và đuôi phi cơ đã bay thoát khỏi mép trên màn hình
      const isPlaneOffScreen = (planeGroup.position.z <= -16.5 && planeGroup.position.y >= 3.8);

      // NGAY KHI MÁY BAY VỪA BAY RA KHỎI KHUNG HÌNH WEB -> BẮT ĐẦU CHUYỂN TRANG TỨC THÌ (KHÔNG CÒN ĐỘ TRỄ)
      if ((isPlaneOffScreen || takeoffProgress >= 1.0) && !window.__navigated && window.__takeoffTargetUrl) {
        window.__navigated = true;
        window.location.href = window.__takeoffTargetUrl;
      }
    } else {
      // 2. Ở TRANG CHỦ: MÁY BAY VẪN BAY NHƯNG CHỈ BAY TẦM THẤP (Low-Altitude Cruising Flight)
      // Phong cảnh đường băng cuộn chạy mượt mà phía dưới
      const runwaySpeed = 0.22;
      const scrollList = window.__scrollingElements || window.__scrollingStrips;
      if (scrollList) {
        scrollList.forEach(item => {
          item.position.z += runwaySpeed;
          if (item.position.z > 32) {
            item.position.z -= 88;
          }
        });
      }

      // Phi cơ bay lượn tầm thấp ổn định với độ bồng bềnh khí động học nhẹ nhàng
      planeGroup.position.x = Math.sin(t * 0.75) * 0.16;
      planeGroup.position.y = 0.65 + Math.sin(t * 1.5) * 0.08;
      planeGroup.position.z = -1.5 + Math.sin(t * 0.6) * 0.10;
      planeGroup.rotation.x = -0.02 + Math.sin(t * 1.2) * 0.01;
      planeGroup.rotation.z = Math.sin(t * 0.75) * 0.032;
      planeGroup.rotation.y = Math.sin(t * 0.75) * 0.012;

      // Bóng đổ mặt đất sắc nét theo sát máy bay khi bay tầm thấp
      contactShadow.position.set(planeGroup.position.x, 0.008, planeGroup.position.z);
      contactShadow.scale.setScalar(0.95);
      contactShadow.material.opacity = 0.52;

      // Cánh quạt động cơ quay đều tốc độ bay hành trình
      turbofans.forEach(sp => {
        sp.rotation.z += 0.48;
      });
    }

    // Đèn nhấp nháy dẫn đường trên đầu cánh máy bay
    const isFlash = Math.floor(t * 2.5) % 2 === 0;
    wingPointL.intensity = isFlash ? 3.5 : 0.2;
    wingPointR.intensity = isFlash ? 3.5 : 0.2;
    strobeMat.color.setHex(isFlash ? 0xffffff : 0x1e293b);

    // Đĩa radar thứ cấp trên đài quan sát chính quay 360 độ liên tục
    if (typeof radarDisc !== 'undefined' && radarDisc) {
      radarDisc.rotation.y += 0.035;
    }

    // Đĩa radar trạm Doppler phụ quay đồng bộ
    if (typeof secondaryRadarDish !== 'undefined' && secondaryRadarDish) {
      secondaryRadarDish.rotation.y += 0.028;
    }

    // Đĩa radar đài quan sát phụ hướng Đông
    if (typeof satelliteRadarDisc !== 'undefined' && satelliteRadarDisc) {
      satelliteRadarDisc.rotation.y += 0.040;
    }

    // Cờ gió sân bay 01 và 02 dao động theo làn gió nhẹ
    if (typeof windsockGroup1 !== 'undefined' && windsockGroup1) {
      windsockGroup1.rotation.y = Math.sin(t * 1.2) * 0.15;
    }
    if (typeof windsockGroup2 !== 'undefined' && windsockGroup2) {
      windsockGroup2.rotation.y = Math.sin(t * 1.2 + 1.2) * 0.15;
    }
    if (typeof windsockGroup !== 'undefined' && windsockGroup) {
      windsockGroup.rotation.y = Math.sin(t * 1.2) * 0.15;
    }

    // Mây bồng bềnh trôi nhẹ nhàng trên nền trời theo trục Z & X
    driftingClouds.forEach(cl => {
      cl.position.z += 0.035;
      cl.position.x += 0.010;
      if (cl.position.z > 25) cl.position.z = -35;
      if (cl.position.x > 35) cl.position.x = -35;
    });

    renderer.render(scene, camera);
  }
  animate();

  // 2. Cơ chế ánh sáng & Bật/Tắt đèn đường băng theo Theme (Tối ưu hóa 60 FPS không khựng giật)
  function applyThemeToScene(isDark) {
    if (isDark) {
      // 1. Cảnh đêm (Dark Mode - Đêm sang trọng #070b14)
      scene.background.setHex(0x070b14);
      if (scene.fog) {
        scene.fog.color.setHex(0x070b14);
      }
      renderer.toneMappingExposure = 1.25;

      // Chiếu sáng chính: Ánh trăng dịu 1.1 + Rim Light xanh cyan 0.9
      keyLight.color.setHex(0xe2e8f0);
      keyLight.intensity = 1.1;
      keyLight.position.set(6, 22, 10);

      rimLight.color.setHex(0x38bdf8);
      rimLight.intensity = 0.9;

      hemiLight.color.setHex(0x1e293b);
      hemiLight.groundColor.setHex(0x070b14);
      hemiLight.intensity = 0.35;

      ambientLight.color.setHex(0x0e172a);
      ambientLight.intensity = 0.35;

      // Màu nền mặt đất & đường băng Dark Mode
      tarmacMat.color.setHex(0x0f172a);
      groundMat.color.setHex(0x070b14);
      if (typeof shoulderMat !== 'undefined') shoulderMat.color.setHex(0x1e293b);
      if (window.__grassMat) window.__grassMat.color.setHex(0x0c2518);

      // Kính đài quan sát tháp không lưu (ATC Cab)
      cabMat.color.setHex(0x0284c7);
      if (cabMat.emissive) {
        cabMat.emissive.setHex(0x0284c7);
        cabMat.emissiveIntensity = 0.4;
      }

      // 2. BẬT SÁNG ĐÈN ĐƯỜNG BĂNG - O(1) Instant update không recompile shader
      if (window.__runwayBulbMat) {
        window.__runwayBulbMat.color.setHex(0xf59e0b);
        window.__runwayBulbMat.emissive.setHex(0xf59e0b);
        window.__runwayBulbMat.emissiveIntensity = 3.5;
      }
      if (window.__runwayGlowLights) {
        window.__runwayGlowLights.forEach(l => { l.intensity = 1.6; });
      }

      if (typeof terminalWallMat !== 'undefined') terminalWallMat.color.setHex(0x141f33);
      if (typeof terminalGlassMat !== 'undefined') {
        terminalGlassMat.color.setHex(0x0a1628);
        terminalGlassMat.emissive.setHex(0x0284c7);
        terminalGlassMat.emissiveIntensity = 0.35;
      }
    } else {
      // 1. Cảnh ngày (Light Mode - Chuẩn Dribbble #EBF4FE)
      scene.background.setHex(0xebf4fe);
      if (scene.fog) {
        scene.fog.color.setHex(0xebf4fe);
      }
      renderer.toneMappingExposure = 1.15;

      // Chiếu sáng chính: Ánh sáng ban ngày tự nhiên dịu mát
      keyLight.color.setHex(0xfffbeb);
      keyLight.intensity = 1.45;
      keyLight.position.set(6, 22, 10);

      rimLight.intensity = 0.05;

      hemiLight.color.setHex(0xffffff);
      hemiLight.groundColor.setHex(0xdbeafe);
      hemiLight.intensity = 0.65;

      ambientLight.color.setHex(0xffffff);
      ambientLight.intensity = 0.45;

      // Màu nền mặt đất & đường băng Light Mode
      tarmacMat.color.setHex(0x242c37);
      groundMat.color.setHex(0xebf4fe);
      if (typeof shoulderMat !== 'undefined') shoulderMat.color.setHex(0x334155);
      if (window.__grassMat) window.__grassMat.color.setHex(0x2e7d32);

      // Kính đài quan sát tháp không lưu ban ngày
      cabMat.color.setHex(0x0284c7);
      if (cabMat.emissive) {
        cabMat.emissiveIntensity = 0;
      }

      // 2. TẮT ĐÈN ĐƯỜNG BĂNG BAN NGÀY - O(1) Instant update không recompile shader
      if (window.__runwayBulbMat) {
        window.__runwayBulbMat.color.setHex(0x94a3b8);
        window.__runwayBulbMat.emissive.setHex(0x000000);
        window.__runwayBulbMat.emissiveIntensity = 0;
      }
      if (window.__runwayGlowLights) {
        window.__runwayGlowLights.forEach(l => { l.intensity = 0; });
      }

      if (typeof terminalWallMat !== 'undefined') terminalWallMat.color.setHex(0x1e293b);
      if (typeof terminalGlassMat !== 'undefined') {
        terminalGlassMat.color.setHex(0x0f172a);
        terminalGlassMat.emissiveIntensity = 0;
      }
    }
  }

  window.updateThreeJSSceneTheme = function(theme) {
    applyThemeToScene(theme === 'dark');
  };
  window.applyThemeToScene = applyThemeToScene;

  const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
  window.updateThreeJSSceneTheme(initialTheme);

  // Dynamic Performance & Eco Mode Scene Updater
  window.__applyPerfModeToRunway = function(isEco) {
    try {
      renderer.setPixelRatio(isEco ? 1.0 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = !isEco;
      keyLight.castShadow = !isEco;
      if (renderer.shadowMap.enabled) {
        renderer.shadowMap.needsUpdate = true;
      }
      renderer.setSize(getWidth(), getHeight(), false);
    } catch(e) {}
  };

  // WebGL Context Lost & Restored Protection (prevents browser freezing on weak GPUs)
  const handleContextLost = (e) => {
    e.preventDefault();
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    canvas.style.opacity = '0';
    if (container) {
      container.classList.add('webgl-fallback-active');
    }
  };

  const handleContextRestored = () => {
    canvas.style.opacity = '0.9';
    if (container) {
      container.classList.remove('webgl-fallback-active');
    }
    lastFrameTime = performance.now();
    lastRenderTimestamp = performance.now();
    animate();
  };

  canvas.addEventListener('webglcontextlost', handleContextLost, false);
  canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

  function onResize() {
    const w = getWidth();
    const h = getHeight();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const isEco = (window.__perfMode === 'eco' || window.__ecoMode);
    renderer.setPixelRatio(isEco ? 1.0 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', onResize);
  setTimeout(onResize, 150);

  // Clean memory disposal method to guarantee zero WebGL memory leaks
  window.cleanupThreeJSRunway = function() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    window.removeEventListener('resize', onResize);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseleave', handleMouseLeave);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    if (canvas) canvas.dataset.threejsInitialized = 'false';
    try {
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
    } catch (e) {}
  };
}

/* ==============================================================================
   2. PURE WEB AUDIO API SYNTHESIZER (NO EXTERNAL AUDIO FILES REQUIRED)
   ============================================================================== */
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Rapid high-frequency tick sound for clicks and button interactions
window.playClickSound = function() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2600, ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {}
};

// Frequency sweep ascending effect (Takeoff / Payment success)
window.playTakeoffSound = function() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Fundamental oscillator frequency sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.65);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Harmonic overtone layer
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(260, now);
    osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.65);

    gain2.gain.setValueAtTime(0.01, now);
    gain2.gain.linearRampToValueAtTime(0.08, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.68);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.72);
    osc2.start(now);
    osc2.stop(now + 0.72);
  } catch (e) {
    console.warn('Audio unlock required:', e);
  }
};

window.playJetTakeoffSound = window.playTakeoffSound;

function initAudioSynthesis() {
  // Web Audio auto-unlock on first user gesture
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };
  document.addEventListener('click', unlockAudio, { once: true });
  document.addEventListener('keydown', unlockAudio, { once: true });
  document.addEventListener('touchstart', unlockAudio, { once: true });
  document.addEventListener('pointerdown', unlockAudio, { once: true });

  // Attach click sound to interactive buttons, links, and tabs
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, .search-tab, .seat-cell, .payment-tab, .badge-pill-link, .deal-card, .btn-view-details');
    if (target && window.playClickSound) {
      window.playClickSound();
    }
  });
}

/* ==============================================================================
   3. THEME SUPPORT
   ============================================================================== */
function initThemeSupport() {
  const toggleBtns = document.querySelectorAll('#theme-toggle-btn, #theme-toggle');
  
  // Read preference from URL, Hash, or storage, default to 'light' (Ngefly Dribbble Light Mode #EBF4FE)
  const urlP = new URLSearchParams(window.location.search);
  const hashTheme = window.location.hash.includes('theme=dark') ? 'dark' : (window.location.hash.includes('theme=light') ? 'light' : null);
  let current = urlP.get('theme') || hashTheme || Storage.get('ngefly_theme') || 'light';
  document.documentElement.setAttribute('data-theme-disabled', current);

  function updateButtons(theme) {
    toggleBtns.forEach(btn => {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('title', theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối');
    });
  }

  updateButtons(current);

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.playClickSound) window.playClickSound();
      const now = document.documentElement.getAttribute('data-theme') || 'light';
      const next = now === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme-disabled', next);
      Storage.set('ngefly_theme', next);
      updateButtons(next);

      // Sync 3D scene smoothly on next animation frame so DOM reflow and WebGL update don't collide
      requestAnimationFrame(() => {
        if (typeof window.updateThreeJSSceneTheme === 'function') {
          window.updateThreeJSSceneTheme(next);
        }
      });
    });
  });
}

function initFloatingCardTabs() {
  const flightBtn = document.querySelector('#tab-round-flight');
  const cruiseBtn = document.querySelector('#tab-round-cruise');
  if (!flightBtn || !cruiseBtn) return;

  flightBtn.addEventListener('click', () => {
    flightBtn.classList.add('active');
    cruiseBtn.classList.remove('active');
    if (window.playClickSound) window.playClickSound();
  });

  cruiseBtn.addEventListener('click', () => {
    cruiseBtn.classList.add('active');
    flightBtn.classList.remove('active');
    if (window.playClickSound) window.playClickSound();
    if (typeof showToast === 'function') {
      showToast('🚢 Dịch vụ Siêu du thuyền Round Cruise đang cập nhật hải trình mùa hè 2026!', 3500);
    }
  });
}

function initFlightModeToggle() {
  const btn = document.querySelector('#btn-toggle-flight-mode');
  const textEl = document.querySelector('#flight-mode-text');
  const dotEl = document.querySelector('#flight-mode-dot');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isRunning = window.isRunwayMotionActive ? window.isRunwayMotionActive() : true;
    const nextState = !isRunning;
    if (window.setRunwayMotionActive) window.setRunwayMotionActive(nextState);
    if (window.playClickSound) window.playClickSound();

    if (nextState) {
      if (textEl) textEl.textContent = 'Chế độ: Đang Chạy Đà Cất Cánh';
      if (dotEl) {
        dotEl.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse';
      }
      if (typeof showToast === 'function') {
        showToast('🛫 Máy bay bắt đầu lăn bánh và chạy đà tăng tốc trên đường băng!', 3500);
      }
    } else {
      if (textEl) textEl.textContent = 'Chế độ: Đang Đỗ Tại Chỗ (Parked)';
      if (dotEl) {
        dotEl.className = 'w-2.5 h-2.5 rounded-full bg-amber-500';
      }
      if (typeof showToast === 'function') {
        showToast('🛑 Máy bay chuyển về chế độ sa bàn tĩnh đỗ tại chỗ.', 3500);
      }
    }
  });

  // Kích hoạt bứt tốc cất cánh cực mạnh khi bấm nút tìm kiếm chuyến bay
  const heroSearchArrow = document.querySelector('.group\\/btn, [aria-label="Tìm kiếm chuyến bay"]');
  if (heroSearchArrow) {
    heroSearchArrow.addEventListener('click', (e) => {
      if (window.triggerTakeoffBoost) {
        window.triggerTakeoffBoost();
      }
    });
  }
}

/* ==============================================================================
   4. INDEX.HTML: SEARCH FORM & TRENDING DEALS
   ============================================================================== */
function initSearchFormInteractions() {
  const form = document.querySelector('#ngefly-search-form');
  const swapBtn = document.querySelector('#btn-swap-cities');
  const depSelect = document.querySelector('#dep-city-select');
  const arrSelect = document.querySelector('#arr-city-select');
  const depBox = document.querySelector('#dep-city-box');
  const arrBox = document.querySelector('#arr-city-box');
  const depDateInput = document.querySelector('#dep-date');
  const returnDateInput = document.querySelector('#return-date');
  const returnBox = document.querySelector('#return-field-box');
  const tabs = document.querySelectorAll('.search-tab');

  const today = new Date().toISOString().split('T')[0];

  // 1. Pre-fill existing search state
  if (form && depSelect && arrSelect) {
    const existing = Storage.getSearch();
    if (existing.from && depSelect.querySelector(`option[value="${existing.from}"]`)) {
      depSelect.value = existing.from;
    }
    if (existing.to && arrSelect.querySelector(`option[value="${existing.to}"]`)) {
      arrSelect.value = existing.to;
    }
    if (depDateInput) {
      depDateInput.min = today;
      if (existing.date) {
        depDateInput.value = existing.date;
      }
    }
    if (returnDateInput) {
      returnDateInput.min = (depDateInput && depDateInput.value) || today;
      if (existing.returnDate) {
        returnDateInput.value = existing.returnDate;
      }
    }

    // Activate round trip tab if saved state was round trip
    if (existing.tripType === 'Round trip' && returnBox) {
      tabs.forEach(t => {
        if (t.getAttribute('data-type') === 'round') {
          t.classList.add('active');
        } else {
          t.classList.remove('active');
        }
      });
      returnBox.style.display = 'block';
      returnBox.classList.remove('disabled');
      const fieldsGrid = form.querySelector('.search-fields-grid');
      if (fieldsGrid) fieldsGrid.classList.add('round-active');
    }
  }

  // 2. Smooth Departure & Return Date Synchronization
  if (depDateInput) {
    depDateInput.addEventListener('change', () => {
      if (returnDateInput) {
        returnDateInput.min = depDateInput.value || today;
        if (returnDateInput.value && returnDateInput.value < depDateInput.value) {
          const depD = new Date(depDateInput.value + 'T00:00:00');
          depD.setDate(depD.getDate() + 7);
          returnDateInput.value = depD.toISOString().split('T')[0];
        }
      }
    });
  }

  if (returnDateInput) {
    returnDateInput.addEventListener('change', () => {
      if (depDateInput && depDateInput.value && returnDateInput.value < depDateInput.value) {
        alert('Ngày trở về không thể trước ngày khởi hành. Hệ thống đã tự động đặt về ngày khởi hành.');
        returnDateInput.value = depDateInput.value;
      }
    });
  }

  // 3. Search Type Tabs (Flight, Round, Cruise)
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (window.playClickSound) window.playClickSound();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const type = tab.getAttribute('data-type');
      if (returnBox) {
        const fieldsGrid = form ? form.querySelector('.search-fields-grid') : null;
        if (type === 'round' || type === 'cruise') {
          returnBox.style.display = 'block';
          returnBox.classList.remove('disabled');
          if (fieldsGrid) fieldsGrid.classList.add('round-active');
          if (returnDateInput && depDateInput) {
            returnDateInput.min = depDateInput.value || today;
            if (!returnDateInput.value || returnDateInput.value < depDateInput.value) {
              const depD = new Date((depDateInput.value || today) + 'T00:00:00');
              depD.setDate(depD.getDate() + 7);
              returnDateInput.value = depD.toISOString().split('T')[0];
            }
          }
        } else {
          returnBox.style.display = 'none';
          returnBox.classList.add('disabled');
          if (fieldsGrid) fieldsGrid.classList.remove('round-active');
        }
      }
    });
  });

  // 4. Seamless Swap Animation & Logic
  let swapDegree = 0;
  if (swapBtn && depSelect && arrSelect) {
    swapBtn.addEventListener('click', () => {
      if (window.playClickSound) window.playClickSound();

      swapDegree += 180;
      swapBtn.style.transform = `rotate(${swapDegree}deg)`;

      const cellA = depBox || depSelect.closest('.field-cell');
      const cellB = arrBox || arrSelect.closest('.field-cell');
      if (cellA) cellA.classList.add('field-swapping');
      if (cellB) cellB.classList.add('field-swapping');

      setTimeout(() => {
        if (cellA) cellA.classList.remove('field-swapping');
        if (cellB) cellB.classList.remove('field-swapping');
      }, 350);

      const temp = depSelect.value;
      depSelect.value = arrSelect.value;
      arrSelect.value = temp;
    });
  }

  // 4b. Passenger & Cabin Class Controller
  const paxSelect = document.querySelector('#pax-count');
  const paxCard = document.querySelector('#hero-pax-card');

  // Pre-fill passenger state if available in storage
  const existingSearch = Storage.getSearch();
  if (existingSearch && existingSearch.passengers && paxSelect) {
    const rawPax = existingSearch.passengers;
    let matched = false;
    for (const opt of paxSelect.options) {
      if (opt.value === rawPax) {
        paxSelect.value = opt.value;
        matched = true;
        break;
      }
    }
    if (!matched) {
      for (const opt of paxSelect.options) {
        if (opt.value.includes(rawPax) || rawPax.includes(opt.value)) {
          paxSelect.value = opt.value;
          matched = true;
          break;
        }
      }
    }
    if (!matched) {
      for (const opt of paxSelect.options) {
        if (rawPax.includes('Thương gia') && opt.value.includes('Thương gia')) {
          paxSelect.value = opt.value;
          break;
        } else if (rawPax.includes('Phổ thông') && opt.value.includes('Phổ thông')) {
          paxSelect.value = opt.value;
          break;
        }
      }
    }
  }

  // Handle clicking anywhere on the card or label to activate the selector
  if (paxCard && paxSelect) {
    paxCard.addEventListener('click', (e) => {
      if (e.target !== paxSelect) {
        paxSelect.focus();
        if (typeof paxSelect.showPicker === 'function') {
          try {
            paxSelect.showPicker();
          } catch (err) {}
        }
      }
    });

    const paxLabel = paxCard.querySelector('label');
    if (paxLabel) {
      paxLabel.addEventListener('click', (e) => {
        e.preventDefault();
        paxSelect.focus();
        if (typeof paxSelect.showPicker === 'function') {
          try {
            paxSelect.showPicker();
          } catch (err) {}
        }
      });
    }
  }

  // Synchronize choice into Storage when changed
  if (paxSelect) {
    paxSelect.addEventListener('change', () => {
      const curSearch = Storage.getSearch() || {};
      const chosenPax = paxSelect.value;
      const seatClass = chosenPax.includes('Thương gia') ? 'Hạng Thương gia' : 'Hạng Phổ thông';
      Storage.setSearch({
        ...curSearch,
        passengers: chosenPax,
        seatClass: seatClass
      });
      if (window.playClickSound) window.playClickSound();
    });
  }

  // Flatpickr on #dep-date
  if (depDateInput && typeof flatpickr !== 'undefined') {
    flatpickr(depDateInput, {
      dateFormat: 'Y-m-d',
      minDate: today,
      defaultDate: depDateInput.value || today,
      disableMobile: true,
      onChange: function(selectedDates, dateStr) {
        depDateInput.value = dateStr;
      }
    });
  }

  // 5. Handle Form Submit
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (window.playJetTakeoffSound) window.playJetTakeoffSound();

      const fromVal = depSelect ? depSelect.value : 'SGN';
      const toVal = arrSelect ? arrSelect.value : 'HAN';

      if (fromVal === toVal) {
        if (typeof showToast === 'function') {
          showToast('⚠️ Điểm khởi hành và điểm đến không được trùng nhau. Vui lòng chọn hai điểm khác nhau.', 3500);
        } else {
          alert('Điểm khởi hành và điểm đến không được trùng nhau. Vui lòng chọn hai điểm khác nhau.');
        }
        return;
      }

      const activeTab = document.querySelector('.floating-service-tab.active, .search-tab.active');
      const tabType = activeTab?.id?.includes('cruise') ? 'Round cruise' : 'One way';
      const tripType = tabType;

      const dateVal = (depDateInput && depDateInput.value) || '2026-09-10';
      const returnVal = (returnDateInput && returnDateInput.value) || '2026-09-18';

      const paxRaw = paxSelect ? paxSelect.value : '2 Lớn - 1 Trẻ, Thương gia';
      let passengers = paxRaw;
      let seatClass = paxRaw.includes('Thương gia') ? 'Hạng Thương gia' : 'Hạng Phổ thông';

      const searchParams = {
        from: fromVal,
        to: toVal,
        fromCity: getAirportCity(fromVal),
        toCity: getAirportCity(toVal),
        date: dateVal,
        returnDate: returnVal,
        passengers,
        seatClass,
        tripType
      };

      Storage.setSearch(searchParams);

      if (window.triggerTakeoffBoost) {
        window.triggerTakeoffBoost();
      }

      navigateTo(`pages/flights.html?from=${fromVal}&to=${toVal}&date=${dateVal}&pax=${encodeURIComponent(passengers)}`);
    });
  }

  // Handle Trending Flight Deal Cards on index.html
  const dealCards = document.querySelectorAll('.deal-card');
  dealCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.playClickSound) window.playClickSound();

      const from = card.getAttribute('data-from') || 'SGN';
      const to = card.getAttribute('data-to') || 'HAN';

      const searchParams = {
        from,
        to,
        fromCity: getAirportCity(from),
        toCity: getAirportCity(to),
        date: '2026-09-10',
        returnDate: '2026-09-18',
        passengers: '1 Passenger',
        seatClass: 'Business Class',
        tripType: 'One way'
      };

      Storage.setSearch(searchParams);

      setTimeout(() => {
        navigateTo('pages/flights.html');
      }, 250);
    });
  });
}

/* ==============================================================================
   5. PAGES/FLIGHTS.HTML: 10 SEARCH RESULTS
   ============================================================================== */
function initFlightsPage() {
  const routeSummary = document.querySelector('#flights-route-summary');
  const resultsContainer = document.querySelector('#flight-results-container');
  if (!routeSummary && !resultsContainer) return;

  // Check if viewing airport schedule (FIDS)
  const urlParams = new URLSearchParams(window.location.search);
  const isScheduleView = urlParams.get('view') === 'schedule';

  // Synchronize URL search parameters into Storage if present
  const urlFrom = urlParams.get('from');
  const urlTo = urlParams.get('to');
  const urlDate = urlParams.get('date');
  const urlPax = urlParams.get('pax');

  let search = Storage.getSearch();
  const todayIso = new Date().toISOString().split('T')[0];

  // In schedule mode without date, default to today
  if (isScheduleView && !urlDate && (!search.date || search.date === '2026-09-10')) {
    search.date = todayIso;
  }

  if (urlFrom || urlTo || urlDate || urlPax) {
    search = {
      ...search,
      from: urlFrom || search.from || 'SGN',
      to: urlTo || search.to || 'HAN',
      date: urlDate || search.date || todayIso,
      passengers: urlPax ? decodeURIComponent(urlPax) : (search.passengers || '2 Người lớn • 1 Trẻ, Thương gia')
    };
    const curB = Storage.getBooking() || {};
    if (!curB.seatClass) {
      setCustomerSeatClass(urlPax ? decodeURIComponent(urlPax) : (search.passengers || 'Hạng Thương Gia'));
    }
    Storage.setSearch(search);
  }

  const dateInfo = formatDateDisplay(search.date);

  // 1. Update Summary Header Bar
  const fromTextEl = document.querySelector('#summary-from-text');
  const toTextEl = document.querySelector('#summary-to-text');
  if (fromTextEl && toTextEl) {
    fromTextEl.textContent = `${search.from}, ${getAirportCity(search.from)}`;
    toTextEl.textContent = `${search.to}, ${getAirportCity(search.to)}`;
  }

  // Update Meta Pills
  const pillDate = document.querySelector('#pill-date');
  const pillPax = document.querySelector('#pill-pax');
  const pillClass = document.querySelector('#pill-class');
  if (pillDate) {
    if (isScheduleView) {
      pillDate.textContent = `📅 ${dateInfo.medium} • Bảng Điện Tử (Live FIDS)`;
    } else if (search.tripType === 'Round trip' && search.returnDate) {
      const retInfo = formatDateDisplay(search.returnDate);
      pillDate.textContent = `📅 ${dateInfo.short} - ${retInfo.short} • Khứ hồi`;
    } else {
      pillDate.textContent = `📅 ${dateInfo.medium} • ${search.tripType || 'Một chiều'}`;
    }
  }
  if (pillPax) pillPax.textContent = `👤 ${search.passengers || '2 Người lớn • 1 Trẻ, Thương gia'}`;
  if (pillClass) pillClass.textContent = `✨ ${getCustomerSeatClass()}`;

  // Update Page Title & Subtitle
  const subtitleEl = document.querySelector('#flights-results-subtitle');
  const resultsTitleEl = document.querySelector('#flights-results-title');
  const animatedBanner = document.querySelector('#flights-animated-banner');

  if (isScheduleView) {
    document.title = 'Lịch Trình & Bảng Điện Tử Sân Bay (FIDS) - FlyNest';
    if (resultsTitleEl) resultsTitleEl.textContent = 'Bảng Thông Tin Chuyến Bay & Lịch Trình (FIDS)';
    if (subtitleEl) {
      subtitleEl.textContent = `Bảng điện tử theo dõi giờ cất cánh / hạ cánh thời gian thực ngày ${dateInfo.medium} (${getAirportShortCity(search.from)} ➔ ${getAirportShortCity(search.to)})`;
    }
    if (animatedBanner) {
      animatedBanner.classList.remove('is-flights-mode');
      animatedBanner.classList.add('is-schedule-mode');
    }
  } else {
    if (subtitleEl) {
      subtitleEl.textContent = `Hành trình ${getAirportShortCity(search.from)} (${search.from}) ➔ ${getAirportShortCity(search.to)} (${search.to}) · Tuyển chọn 10 chuyến bay thẳng tối ưu về khung giờ cất cánh & mức giá ưu đãi`;
    }
    if (animatedBanner) {
      animatedBanner.classList.remove('is-schedule-mode');
      animatedBanner.classList.add('is-flights-mode');
    }
  }

  // Real-time FIDS terminal clock updater
  const fidsClockEl = document.querySelector('#fids-live-clock');
  if (fidsClockEl) {
    const updateClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      fidsClockEl.textContent = `${h}:${m}:${s}`;
    };
    updateClock();
    if (!window._fidsClockTimer) {
      window._fidsClockTimer = setInterval(updateClock, 1000);
    }
  }

  // 2. Update Flight Cards to match chosen route codes and dates
  const flightCards = Array.from(document.querySelectorAll('.flight-card-ngefly'));
  
  // Real-time FIDS departure statuses for schedule mode
  const fidsStatuses = [
    { text: '🟢 Đúng Giờ', color: 'var(--badge-green)', bg: 'var(--badge-green-bg)', gate: 'Cửa 06 • Ga T1 (Quốc nội)' },
    { text: '🟡 Đang Lên Tàu', color: '#b45309', bg: 'rgba(245, 158, 11, 0.15)', gate: 'Cửa 12 • Ga T1 (Quốc nội)' },
    { text: '🟢 Đúng Giờ', color: 'var(--badge-green)', bg: 'var(--badge-green-bg)', gate: 'Cửa 04 • Ga T1 (Quốc nội)' },
    { text: '🔵 Đã Cất Cánh', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.15)', gate: 'Cửa 08 • Ga T1 (Quốc nội)' },
    { text: '🟢 Đúng Giờ', color: 'var(--badge-green)', bg: 'var(--badge-green-bg)', gate: 'Cửa 03 • Ga T1 (Quốc nội)' },
    { text: '🟠 Đổi Cửa Ra', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.15)', gate: 'Cửa 14 • Ga Quốc Tế T2' },
    { text: '🟢 Đúng Giờ', color: 'var(--badge-green)', bg: 'var(--badge-green-bg)', gate: 'Cửa 18 • Ga Quốc Tế T2' },
    { text: '🟡 Đang Lên Tàu', color: '#b45309', bg: 'rgba(245, 158, 11, 0.15)', gate: 'Cửa 21 • Ga Quốc Tế T2' },
    { text: '🟢 Đúng Giờ', color: 'var(--badge-green)', bg: 'var(--badge-green-bg)', gate: 'Cửa 07 • Ga Quốc Tế T2' },
    { text: '🟢 Đúng Giờ', color: 'var(--badge-green)', bg: 'var(--badge-green-bg)', gate: 'Cửa 09 • Ga Quốc Tế T2' }
  ];

  // Set schedule mode CSS hook
  if (isScheduleView && resultsContainer) {
    resultsContainer.classList.add('schedule-fids-mode');
  }

  flightCards.forEach((card, idx) => {
    const depCodeEl = card.querySelector('.card-dep-code');
    const arrCodeEl = card.querySelector('.card-arr-code');
    const depDayEl = card.querySelector('.card-dep-day');
    const arrDayEl = card.querySelector('.card-arr-day');

    if (depCodeEl) depCodeEl.textContent = search.from;
    if (arrCodeEl) arrCodeEl.textContent = search.to;
    if (depDayEl) depDayEl.textContent = dateInfo.medium || '10 Thg 9, Thứ Năm';
    if (arrDayEl) arrDayEl.textContent = dateInfo.medium || '10 Thg 9, Thứ Năm';

    // Standardize stop info text
    const stopInfoEl = card.querySelector('.stop-info');
    if (stopInfoEl) stopInfoEl.textContent = 'Bay thẳng';

    // In Schedule View: inject FIDS flight status badge into price-action-block (preserves 3-column grid)
    if (isScheduleView) {
      // Remove any previously orphaned sibling badges
      card.querySelectorAll(':scope > .fids-status-badge').forEach(b => b.remove());

      // Hide marketing scarcity ribbon in FIDS schedule view so status badge has exclusive focus
      const scarcityRibbon = card.querySelector('.card-scarcity-ribbon');
      if (scarcityRibbon) scarcityRibbon.style.display = 'none';

      const st = fidsStatuses[idx % fidsStatuses.length];
      const priceBlock = card.querySelector('.price-action-block');
      if (priceBlock) {
        let fidsBadge = priceBlock.querySelector('.fids-status-badge');
        if (!fidsBadge) {
          fidsBadge = document.createElement('div');
          fidsBadge.className = 'fids-status-badge';
          fidsBadge.style.cssText = `margin-bottom: 0.45rem; padding: 0.32rem 0.85rem; border-radius: 9999px; font-size: 0.78rem; font-weight: 800; display: inline-flex; align-items: center; gap: 0.5rem; background: ${st.bg}; color: ${st.color}; border: 1px solid ${st.color}40; white-space: nowrap; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);`;
          fidsBadge.innerHTML = `<span style="white-space: nowrap; flex-shrink: 0;">${st.text}</span> <span style="opacity: 0.35;">|</span> <span style="font-weight: 600; white-space: nowrap; flex-shrink: 0;">${st.gate}</span>`;
          priceBlock.insertBefore(fidsBadge, priceBlock.firstChild);
        }
      }
    } else {
      // Ensure scarcity ribbon is visible in regular flight search view
      const scarcityRibbon = card.querySelector('.card-scarcity-ribbon');
      if (scarcityRibbon) scarcityRibbon.style.display = '';
    }

    // "View details" button click handler
    const btn = card.querySelector('.btn-view-details');
    if (btn) {
      if (isScheduleView) {
        btn.textContent = 'Xem Chi Tiết ➔';
      }
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.playClickSound) window.playClickSound();

        const airline = card.getAttribute('data-airline') || card.querySelector('.airline-title-text')?.textContent.trim() || 'FlyNest Airlines';
        const rawLogo = card.getAttribute('data-logo') || card.querySelector('.airline-logo-circle img')?.getAttribute('src') || '';
        const logo = resolveAirlineLogoFilename(airline, rawLogo);
        const flightNo = card.getAttribute('data-flight') || 'SW-882';
        const aircraft = card.getAttribute('data-aircraft') || 'Boeing 787-9 Dreamliner';
        const depTime = card.getAttribute('data-deptime') || '07:40 AM';
        const arrTime = card.getAttribute('data-arrtime') || '09:50 AM';
        const duration = card.getAttribute('data-duration') || '02h 10m';
        const price = parseFloat(card.getAttribute('data-price')) || 1970;
        const priceFormatted = card.getAttribute('data-price-formatted') || formatCurrency(price);
        const terminalDep = card.getAttribute('data-terminal-dep') || 'Ga T1 (Quốc nội)';
        const terminalArr = card.getAttribute('data-terminal-arr') || 'Ga Quốc Nội T1 (Nội Bài)';

        const chosenFlight = {
          airline,
          airlineLogo: logo,
          flightNumber: flightNo,
          aircraft,
          depTime,
          arrTime,
          duration,
          price,
          priceFormatted,
          terminalDep,
          terminalArr,
          from: search.from,
          to: search.to,
          date: search.date
        };

        Storage.setFlight(chosenFlight);

        // Keep booking state prices cleanly synchronized
        const curBooking = Storage.getBooking() || {};
        const chosenSeatClass = curBooking.seatClass ? normalizeSeatClass(curBooking.seatClass) : getCustomerSeatClass();
        const newTotal = price + (curBooking.taxes || 120) + (curBooking.airportTransfer ? 45 : 0) - (curBooking.hotelDiscount ? 150 : 0);
        Storage.setBooking({
          ...curBooking,
          passengers: search.passengers,
          passengerCount: search.passengerCount || 1,
          seatClass: chosenSeatClass,
          baseFare: price,
          totalPrice: newTotal
        });

        setTimeout(() => {
          navigateTo('booking.html');
        }, 250);
      });
    }
  });

  // 2.1. Dedicated Interactive Seat Class Selector (Single Source of Truth)
  const seatClassToggles = document.querySelectorAll('.btn-seat-class-toggle');
  const updateFlightCardsForSeatClass = (newClass) => {
    const isBiz = isBusinessClass(newClass);
    seatClassToggles.forEach(btn => {
      const btnClass = btn.getAttribute('data-class');
      const active = isBiz ? isBusinessClass(btnClass) : !isBusinessClass(btnClass);
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });

    if (pillClass) pillClass.textContent = `✨ ${newClass}`;

    flightCards.forEach(card => {
      let bizPrice = parseFloat(card.getAttribute('data-price-biz'));
      if (!bizPrice || isNaN(bizPrice)) {
        bizPrice = parseFloat(card.getAttribute('data-price')) || 1970;
        card.setAttribute('data-price-biz', bizPrice);
      }
      const ecoPrice = Math.round(bizPrice * 0.45);
      const effectivePrice = isBiz ? bizPrice : ecoPrice;
      card.setAttribute('data-price', effectivePrice);
      card.setAttribute('data-price-formatted', formatCurrencyVND(effectivePrice));

      const priceVal = card.querySelector('.price-display-val');
      if (priceVal) {
        priceVal.innerHTML = `${(effectivePrice * 24800).toLocaleString('vi-VN')}<small> ₫ /khách</small>`;
      }
      const priceContainer = card.querySelector('.card-price-container');
      const usdEl = priceContainer ? priceContainer.querySelector(':scope > small') : null;
      if (usdEl) {
        usdEl.textContent = `(~${formatCurrencyUSD(effectivePrice)} USD)`;
      }
      const origVal = card.querySelector('.original-price-val');
      if (origVal) {
        origVal.textContent = `${Math.round(effectivePrice * 1.15 * 24800).toLocaleString('vi-VN')} ₫`;
      }
      const cabinBadge = card.querySelector('.badge-tag-row .badge-pill-link:nth-child(2)');
      if (cabinBadge) {
        cabinBadge.textContent = isBiz ? 'Khoang Thương Gia' : 'Khoang Phổ Thông';
      }
    });
  };

  if (seatClassToggles.length > 0) {
    updateFlightCardsForSeatClass(getCustomerSeatClass());
    seatClassToggles.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetClass = btn.getAttribute('data-class') || 'Hạng Thương Gia';
        setCustomerSeatClass(targetClass);
        updateFlightCardsForSeatClass(targetClass);
        if (window.playClickSound) window.playClickSound();
      });
    });
  }

  // 3. Interactive Airline Filter Implementation
  const airlineCheckboxes = document.querySelectorAll('.airline-filter-input');
  const activeCountEl = document.querySelector('#active-filter-count');
  const emptyStateEl = document.querySelector('#no-flights-empty-state');
  const selectAllBtn = document.querySelector('#btn-filter-select-all');
  const clearAllBtn = document.querySelector('#btn-filter-clear-all');
  const resetFiltersBtn = document.querySelector('#btn-reset-filters');
  const toggleFilterBtn = document.querySelector('#btn-toggle-filter-panel');
  const filterPanel = document.querySelector('#airline-filter-panel');

  // Item 4: Time-of-Day Filter Controller
  const timePills = document.querySelectorAll('.time-pill');
  let currentTimeFilter = 'all';

  function matchesTimeSlot(deptimeStr, slot) {
    if (slot === 'all' || !slot) return true;
    const minutes = parseTimeToMinutes(deptimeStr);
    if (slot === 'morning') return minutes >= 0 && minutes < 720;       // 00:00 - 11:59 (Sáng)
    if (slot === 'noon') return minutes >= 720 && minutes < 900;        // 12:00 - 14:59 (Trưa)
    if (slot === 'afternoon') return minutes >= 900 && minutes < 1080;  // 15:00 - 17:59 (Chiều)
    if (slot === 'evening') return minutes >= 1080 && minutes <= 1440;  // 18:00 - 23:59 (Tối)
    return true;
  }

  timePills.forEach(pill => {
    pill.addEventListener('click', () => {
      if (window.playClickSound) window.playClickSound();
      timePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentTimeFilter = pill.getAttribute('data-time') || 'all';
      applyAirlineFilters();
    });
  });

  function applyAirlineFilters() {
    const checkedAirlines = Array.from(airlineCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value.trim().toLowerCase());

    let visibleCount = 0;
    flightCards.forEach(card => {
      const cardAirline = (card.getAttribute('data-airline') || '').trim().toLowerCase();
      const cardDepTime = card.getAttribute('data-deptime') || '';

      const matchAirline = checkedAirlines.includes(cardAirline);
      const matchTime = matchesTimeSlot(cardDepTime, currentTimeFilter);

      if (matchAirline && matchTime) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Update active filter counter
    if (activeCountEl) {
      activeCountEl.textContent = checkedAirlines.length;
    }

    // Update results title
    if (resultsTitleEl) {
      if (visibleCount === flightCards.length) {
        resultsTitleEl.textContent = `${flightCards.length} Chuyến Bay Phù Hợp Nhất`;
      } else if (visibleCount === 1) {
        resultsTitleEl.textContent = '1 Chuyến Bay Phù Hợp Nhất';
      } else {
        resultsTitleEl.textContent = `${visibleCount} Chuyến Bay Phù Hợp Nhất`;
      }
    }

    // Empty state handling
    if (emptyStateEl && resultsContainer) {
      if (visibleCount === 0) {
        emptyStateEl.style.display = 'block';
        resultsContainer.style.display = 'none';
      } else {
        emptyStateEl.style.display = 'none';
        resultsContainer.style.display = '';
      }
    }
  }

  airlineCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      if (window.playClickSound) window.playClickSound();
      applyAirlineFilters();
    });
  });

  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      if (window.playClickSound) window.playClickSound();
      airlineCheckboxes.forEach(cb => cb.checked = true);
      applyAirlineFilters();
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (window.playClickSound) window.playClickSound();
      airlineCheckboxes.forEach(cb => cb.checked = false);
      applyAirlineFilters();
    });
  }

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      if (window.playClickSound) window.playClickSound();
      airlineCheckboxes.forEach(cb => cb.checked = true);
      timePills.forEach(p => p.classList.remove('active'));
      const allPill = document.querySelector('.time-pill[data-time="all"]');
      if (allPill) allPill.classList.add('active');
      currentTimeFilter = 'all';
      applyAirlineFilters();
    });
  }

  if (toggleFilterBtn && filterPanel) {
    toggleFilterBtn.addEventListener('click', () => {
      if (window.playClickSound) window.playClickSound();
      const isHidden = filterPanel.style.display === 'none';
      filterPanel.style.display = isHidden ? 'block' : 'none';
      toggleFilterBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });
  }

  // 4. Instant Sorting Pills Implementation
  const sortPills = document.querySelectorAll('.sort-pill');
  sortPills.forEach(pill => {
    pill.addEventListener('click', () => {
      if (window.playClickSound) window.playClickSound();
      sortPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const sortType = pill.getAttribute('data-sort') || 'cheapest';
      sortFlightCards(sortType);
    });
  });

  function parseDuration(str) {
    if (!str) return 999;
    const hMatch = str.match(/(\d+)h/);
    const mMatch = str.match(/(\d+)m/);
    const h = hMatch ? parseInt(hMatch[1], 10) : 0;
    const m = mMatch ? parseInt(mMatch[1], 10) : 0;
    return h * 60 + m;
  }

  function parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(/\s+/);
    const timeParts = (parts[0] || '').split(':');
    let hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;
    const meridian = (parts[1] || '').toUpperCase();

    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  function sortFlightCards(type) {
    if (!resultsContainer) return;
    const cards = Array.from(resultsContainer.querySelectorAll('.flight-card-ngefly'));
    cards.sort((a, b) => {
      const priceA = parseFloat(a.getAttribute('data-price')) || 0;
      const priceB = parseFloat(b.getAttribute('data-price')) || 0;
      const durationA = parseDuration(a.getAttribute('data-duration'));
      const durationB = parseDuration(b.getAttribute('data-duration'));
      const depTimeA = a.getAttribute('data-deptime') || '';
      const depTimeB = b.getAttribute('data-deptime') || '';

      if (type === 'cheapest') return priceA - priceB;
      if (type === 'fastest') return durationA - durationB;
      if (type === 'best') {
        // Balanced score based on duration and fare
        const scoreA = priceA + durationA * 6;
        const scoreB = priceB + durationB * 6;
        return scoreA - scoreB;
      }
      if (type === 'schedule') {
        return parseTimeToMinutes(depTimeA) - parseTimeToMinutes(depTimeB);
      }
      return 0;
    });

    cards.forEach(c => resultsContainer.appendChild(c));
    // Re-apply filter visibility
    applyAirlineFilters();
  }

  // Initial Sort & Filter on page load
  if (isScheduleView) {
    sortFlightCards('schedule');
    const scheduleBtn = document.querySelector('.sort-pill[data-sort="schedule"]');
    if (scheduleBtn) {
      document.querySelectorAll('.sort-pill').forEach(p => p.classList.remove('active'));
      scheduleBtn.classList.add('active');
    }
  } else {
    sortFlightCards('cheapest');
  }
  applyAirlineFilters();

  // 5. Interactive Inline Search Modifier Controller
  const toggleEditBtn = document.querySelector('#btn-toggle-change-search');
  const searchEditDrawer = document.querySelector('#flights-inline-search-panel');
  const editForm = document.querySelector('#flights-modify-search-form');
  const editDepSelect = document.querySelector('#edit-dep-select');
  const editArrSelect = document.querySelector('#edit-arr-select');
  const editDateInput = document.querySelector('#edit-dep-date');
  const editPaxSelect = document.querySelector('#edit-pax-select');
  const editSwapBtn = document.querySelector('#btn-swap-edit-cities');
  const editCancelBtn = document.querySelector('#btn-cancel-edit-search');
  const changeSearchLabel = document.querySelector('#btn-change-search-label');

  if (toggleEditBtn && searchEditDrawer) {
    const populateEditDrawer = () => {
      const curSearch = Storage.getSearch();
      if (editDepSelect && curSearch.from) editDepSelect.value = curSearch.from;
      if (editArrSelect && curSearch.to) editArrSelect.value = curSearch.to;
      if (editDateInput) {
        editDateInput.min = new Date().toISOString().split('T')[0];
        editDateInput.value = curSearch.date || '2026-09-10';

        if (typeof flatpickr !== 'undefined' && !editDateInput._flatpickr) {
          flatpickr(editDateInput, {
            dateFormat: 'Y-m-d',
            minDate: new Date().toISOString().split('T')[0],
            defaultDate: editDateInput.value,
            disableMobile: true,
            onChange: function(selectedDates, dateStr) {
              editDateInput.value = dateStr;
            }
          });
        }
      }
      if (editPaxSelect && curSearch.passengers) {
        Array.from(editPaxSelect.options).forEach(opt => {
          if (opt.value === curSearch.passengers || curSearch.passengers.includes(opt.value.split(',')[0])) {
            editPaxSelect.value = opt.value;
          }
        });
      }
    };

    populateEditDrawer();

    toggleEditBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.playClickSound) window.playClickSound();
      const isVisible = searchEditDrawer.style.display !== 'none';
      if (isVisible) {
        searchEditDrawer.style.display = 'none';
        if (changeSearchLabel) changeSearchLabel.textContent = 'Thay Đổi Tìm Kiếm';
      } else {
        populateEditDrawer();
        searchEditDrawer.style.display = 'block';
        if (changeSearchLabel) changeSearchLabel.textContent = 'Ẩn Bộ Tìm Kiếm';
        searchEditDrawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    if (editCancelBtn) {
      editCancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        searchEditDrawer.style.display = 'none';
        if (changeSearchLabel) changeSearchLabel.textContent = 'Thay Đổi Tìm Kiếm';
      });
    }

    if (editSwapBtn && editDepSelect && editArrSelect) {
      editSwapBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.playClickSound) window.playClickSound();
        const tmp = editDepSelect.value;
        editDepSelect.value = editArrSelect.value;
        editArrSelect.value = tmp;
      });
    }

    if (editForm) {
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newFrom = editDepSelect ? editDepSelect.value : 'SGN';
        const newTo = editArrSelect ? editArrSelect.value : 'HAN';

        if (newFrom === newTo) {
          if (typeof showToast === 'function') {
            showToast('⚠️ Điểm khởi hành và điểm đến không được trùng nhau.', 3500);
          } else {
            alert('Điểm khởi hành và điểm đến không được trùng nhau.');
          }
          return;
        }

        const newDate = editDateInput?.value || '2026-09-10';
        const newPax = editPaxSelect?.value || '2 Lớn - 1 Trẻ, Thương gia';
        const newSeatClass = newPax.includes('Thương gia') ? 'Hạng Thương gia' : 'Hạng Phổ thông';

        const updatedSearch = {
          ...Storage.getSearch(),
          from: newFrom,
          to: newTo,
          fromCity: getAirportCity(newFrom),
          toCity: getAirportCity(newTo),
          date: newDate,
          passengers: newPax,
          seatClass: newSeatClass
        };

        Storage.setSearch(updatedSearch);

        // Update Summary texts and pills
        if (fromTextEl && toTextEl) {
          fromTextEl.textContent = `${newFrom}, ${getAirportCity(newFrom)}`;
          toTextEl.textContent = `${newTo}, ${getAirportCity(newTo)}`;
        }
        const updatedDateInfo = formatDateDisplay(newDate);
        if (pillDate) pillDate.textContent = `📅 ${updatedDateInfo.medium} • Một chiều`;
        if (pillPax) pillPax.textContent = `👤 ${newPax}`;
        if (pillClass) pillClass.textContent = `✨ ${newSeatClass}`;

        // Update cards origin and destination codes
        flightCards.forEach(card => {
          const depCode = card.querySelector('.card-dep-code');
          const arrCode = card.querySelector('.card-arr-code');
          const depDay = card.querySelector('.card-dep-day');
          const arrDay = card.querySelector('.card-arr-day');
          if (depCode) depCode.textContent = newFrom;
          if (arrCode) arrCode.textContent = newTo;
          if (depDay) depDay.textContent = updatedDateInfo.medium || '10 Thg 9, Thứ Năm';
          if (arrDay) arrDay.textContent = updatedDateInfo.medium || '10 Thg 9, Thứ Năm';
        });

        // Update Subtitle
        if (subtitleEl) {
          subtitleEl.textContent = `Tìm hành trình bay lý tưởng từ ${getAirportShortCity(newFrom)} đến ${getAirportShortCity(newTo)} với mức giá ưu đãi nhất`;
        }

        // Update browser URL state without reload
        const newUrl = `flights.html?from=${newFrom}&to=${newTo}&date=${newDate}&pax=${encodeURIComponent(newPax)}`;
        window.history.replaceState(null, '', newUrl);

        // Hide drawer
        searchEditDrawer.style.display = 'none';
        if (changeSearchLabel) changeSearchLabel.textContent = 'Thay Đổi Tìm Kiếm';

        if (window.playClickSound) window.playClickSound();
        if (typeof showToast === 'function') {
          showToast(`✅ Đã cập nhật hành trình tìm kiếm: ${newFrom} ➔ ${newTo}!`, 3500);
        }
      });
    }
  }
}

/* ==============================================================================
   6. PAGES/BOOKING.HTML: FLIGHT DETAILS & EXTRAS WITH REAL-TIME VALIDATION
   ============================================================================== */
function initBookingPage() {
  const routeHeading = document.querySelector('#booking-route-heading');
  const priceBox = document.querySelector('#price-breakdown-box');
  if (!routeHeading && !priceBox) return;

  verifyBookingDataIntegrity('Trang Đặt Chỗ (booking.html)');

  const search = Storage.getSearch();
  const flight = Storage.getFlight();
  const bookingState = Storage.getBooking();
  const dateInfo = formatDateDisplay(flight.date || search.date);

  const fromCode = flight.from || search.from || 'SGN';
  const toCode = flight.to || search.to || 'HAN';
  const fromInfo = AIRPORTS[fromCode];
  const toInfo = AIRPORTS[toCode];

  // 1. Populate Route Overview & Flight Context Strip
  if (routeHeading) {
    routeHeading.textContent = `Chuyến bay từ ${fromCode}, ${getAirportCity(fromCode)} đến ${toCode}, ${getAirportCity(toCode)}`;
  }

  const fcsStrip = document.querySelector('#booking-context-strip');
  if (fcsStrip) {
    const fcsFromCode = fcsStrip.querySelector('.fcs-route .fcs-airport:first-child .fcs-airport-code');
    const fcsFromName = fcsStrip.querySelector('.fcs-route .fcs-airport:first-child .fcs-airport-name');
    const fcsToCode = fcsStrip.querySelector('.fcs-route .fcs-airport:last-child .fcs-airport-code');
    const fcsToName = fcsStrip.querySelector('.fcs-route .fcs-airport:last-child .fcs-airport-name');
    const fcsDuration = fcsStrip.querySelector('.fcs-duration');
    const fcsChips = fcsStrip.querySelectorAll('.fcs-chip');

    if (fcsFromCode) fcsFromCode.textContent = fromCode;
    if (fcsFromName) fcsFromName.textContent = fromInfo ? fromInfo.city : getAirportShortCity(fromCode);
    if (fcsToCode) fcsToCode.textContent = toCode;
    if (fcsToName) fcsToName.textContent = toInfo ? toInfo.city : getAirportShortCity(toCode);
    if (fcsDuration) fcsDuration.textContent = `${flight.duration || '02h 10m'} · Bay thẳng`;
    if (fcsChips && fcsChips.length >= 3) {
      fcsChips[0].innerHTML = `<span class="fcs-chip-icon">✈</span> ${flight.flightNumber || 'SW-882'} · ${flight.aircraft ? flight.aircraft.replace('Dreamliner', '').trim() : 'Boeing 787-9'}`;
      fcsChips[1].innerHTML = `<span class="fcs-chip-icon">🧳</span> ${bookingState.baggage || 'Hành lý 23kg'}`;
      fcsChips[2].innerHTML = `<span class="fcs-chip-icon">💺</span> ${getCustomerSeatClass().replace('Hạng ', '')}`;
    }
  }

  const depTimeEl = document.querySelector('#booking-dep-time');
  const depDateEl = document.querySelector('#booking-dep-date');
  const depStationEl = document.querySelector('#booking-dep-station');
  const durationEl = document.querySelector('#booking-duration');
  const flightBadgeEl = document.querySelector('#booking-flight-badge');
  const arrTimeEl = document.querySelector('#booking-arr-time');
  const arrDateEl = document.querySelector('#booking-arr-date');
  const arrStationEl = document.querySelector('#booking-arr-station');

  // 1. Resolve active ticket class via getCustomerSeatClass() (Single Source of Truth)
  const currentSeatClass = getCustomerSeatClass();

  // Ensure booking state contains canonical seatClass without touching search.seatClass
  if (bookingState.seatClass !== currentSeatClass) {
    bookingState.seatClass = currentSeatClass;
    Storage.setBooking(bookingState);
  }

  const seatClassVal = document.querySelector('#booking-seat-class-val');
  if (seatClassVal) {
    seatClassVal.textContent = currentSeatClass;
  }

  const depTerminal = (fromCode !== 'SGN')
    ? (fromInfo?.terminal || 'Terminal 2')
    : (flight.terminalDep || 'Ga T1 (Quốc nội)');

  const arrTerminal = (toCode !== 'HAN')
    ? (toInfo?.terminal || 'Terminal 1')
    : (flight.terminalArr || 'Ga Quốc Nội T1 (Nội Bài)');

  if (depTimeEl) depTimeEl.textContent = flight.depTime;
  if (depDateEl) depDateEl.textContent = dateInfo.medium;
  if (depStationEl) depStationEl.textContent = `${fromCode} • ${depTerminal}`;
  if (durationEl) durationEl.textContent = flight.duration;
  if (flightBadgeEl) {
    const logoFile = resolveAirlineLogoFilename(flight.airline, flight.airlineLogo);
    flightBadgeEl.innerHTML = `<img src="../assets/images/airlines/${logoFile}" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 6px; border-radius: 50%; object-fit: contain;" alt="${flight.airline || 'Hãng Bay'}" onerror="if(this.dataset.fallback){this.style.display='none';}else{this.dataset.fallback='1';this.src='../assets/images/airlines/flynest.svg';}"> ${flight.airline || 'FlyNest Airlines'} (${flight.flightNumber || 'SW-882'})`;
  }
  if (arrTimeEl) arrTimeEl.textContent = flight.arrTime;
  if (arrDateEl) arrDateEl.textContent = dateInfo.medium;
  if (arrStationEl) arrStationEl.textContent = `${toCode} • ${arrTerminal}`;

  // 2. Populate Flight Schedule Timeline (Traveloka redesign)
  const schedDepTime = document.querySelector('#sched-dep-time');
  const schedDepCity = document.querySelector('#sched-dep-city');
  const schedDepAirport = document.querySelector('#sched-dep-airport');
  
  const schedAirlineLogo = document.querySelector('#sched-airline-logo');
  const schedAirlineName = document.querySelector('#sched-airline-name');
  const schedFlightNumber = document.querySelector('#sched-flight-number');
  const schedAircraft = document.querySelector('#sched-aircraft');
  const schedDuration = document.querySelector('#sched-duration');
  
  const schedArrTimeNew = document.querySelector('#sched-arr-time-new');
  const schedArrCity = document.querySelector('#sched-arr-city');
  const schedArrAirport = document.querySelector('#sched-arr-airport');

  if (schedDepTime) schedDepTime.textContent = flight.depTime;
  if (schedDepCity) schedDepCity.textContent = (fromInfo ? fromInfo.city : fromCode) + ' (' + fromCode + ')';
  if (schedDepAirport) {
    const airportName = fromInfo ? fromInfo.airportName : `${fromCode} International Airport`;
    schedDepAirport.textContent = `${airportName} • ${depTerminal}`;
  }

  if (schedAirlineLogo) schedAirlineLogo.src = `../assets/images/airlines/${flight.airlineLogo || 'flynest.svg'}`;
  if (schedAirlineName) schedAirlineName.textContent = flight.airline;
  if (schedFlightNumber) schedFlightNumber.textContent = flight.flightNumber;
  if (schedAircraft) schedAircraft.textContent = flight.aircraft;
  if (schedDuration) schedDuration.textContent = flight.duration;

  if (schedArrTimeNew) schedArrTimeNew.textContent = flight.arrTime;
  if (schedArrCity) schedArrCity.textContent = (toInfo ? toInfo.city : toCode) + ' (' + toCode + ')';
  if (schedArrAirport) {
    const arrAirportName = toInfo ? toInfo.airportName : `${toCode} International Airport`;
    schedArrAirport.textContent = `${arrAirportName} • ${arrTerminal}`;
  }

  // 3. Convenience Addon Cards & Dynamic Price Recalculation
  const hotelCheck = document.querySelector('#addon-hotel-check');
  const transferCheck = document.querySelector('#addon-transfer-check');
  const hotelCard = document.querySelector('#hotel-addon-card');
  const transferCard = document.querySelector('#transfer-addon-card');
  const hotelBadge = document.querySelector('#hotel-price-badge');
  const transferBadge = document.querySelector('#transfer-price-badge');
  const priceBaseLabel = document.querySelector('#price-base-label');
  const priceBaseVal = document.querySelector('#price-base-val');
  const priceHotelRow = document.querySelector('#price-hotel-row');
  const priceTransferRow = document.querySelector('#price-transfer-row');
  const priceTotalVal = document.querySelector('#price-total-val');

  if (hotelCheck && typeof bookingState.hotelDiscount !== 'undefined') {
    hotelCheck.checked = !!bookingState.hotelDiscount;
  }
  if (transferCheck && typeof bookingState.airportTransfer !== 'undefined') {
    transferCheck.checked = !!bookingState.airportTransfer;
  }

  function updatePriceBreakdown(animate = false) {
    const searchState = (typeof CoreStore !== 'undefined' && CoreStore.getSearchState)
      ? CoreStore.getSearchState()
      : (Storage.getSearch() || {});

    const adults = Math.max(1, Number(searchState.adults) || 1);
    const children = Math.max(0, Number(searchState.children) || 0);
    const infants = Math.max(0, Number(searchState.infants) || 0);

    const isBiz = isBusinessClass(currentSeatClass) || (searchState.seatClass === 'Business');
    const classMultiplier = isBiz ? 1.6 : 1.0;

    let unitAdultFare = Number(flight.price) || (isBiz ? 1230 : 850);
    if (unitAdultFare > 50000) {
      unitAdultFare = Math.round(unitAdultFare / 24800);
    }
    if (!isBiz && unitAdultFare > 1200) unitAdultFare = 850;

    // Formula:
    // Giá gốc = (Giá vé người lớn x số người lớn) + (Giá vé x 0.75 x số trẻ em) + (Giá vé x 0.1 x số em bé)
    // Nếu chọn hạng Thương gia: nhân hệ số 1.6
    const rawAdultTotal = unitAdultFare * adults;
    const rawChildTotal = unitAdultFare * 0.75 * children;
    const rawInfantTotal = unitAdultFare * 0.1 * infants;
    const subtotalBase = (rawAdultTotal + rawChildTotal + rawInfantTotal) * classMultiplier;

    // Coupon discount check
    let couponDiscountAmount = 0;
    let activeCoupon = null;
    const couponInput = document.querySelector('#input-coupon-code');
    const couponCode = (couponInput ? couponInput.value.trim().toUpperCase() : '') || (window.__activeCouponCode || '');
    if (couponCode) {
      const coupons = (typeof CoreStore !== 'undefined' && CoreStore.getCoupons)
        ? CoreStore.getCoupons()
        : [{ code: 'SKYWINGS2026', discount: 10, type: 'percent' }, { code: 'BAYNHANH', discount: 500000, type: 'fixed' }];
      const matched = coupons.find(c => c.code.toUpperCase() === couponCode);
      if (matched) {
        activeCoupon = matched;
        if (matched.type === 'percent') {
          couponDiscountAmount = subtotalBase * (matched.discount / 100);
        } else if (matched.type === 'fixed') {
          couponDiscountAmount = matched.discount / 24800; // convert fixed VND to internal units
        }
      }
    }

    const totalPax = adults + children;
    const taxes = 120 * totalPax;
    const isHotel = !!(hotelCheck && hotelCheck.checked);
    const isTransfer = !!(transferCheck && transferCheck.checked);
    const hotelSave = isHotel ? 150 : 0;
    const transferAdd = isTransfer ? 45 : 0;
    const total = Math.max(0, subtotalBase + taxes + transferAdd - hotelSave - couponDiscountAmount);

    if (priceBaseLabel) {
      const paxDetails = `${adults} Lớn${children ? `, ${children} Trẻ` : ''}${infants ? `, ${infants} Bé` : ''}`;
      priceBaseLabel.textContent = `Vé tiêu chuẩn (${paxDetails} • ${isBiz ? 'Thương gia' : 'Phổ thông'})`;
    }
    if (priceBaseVal) priceBaseVal.textContent = formatCurrencyVND(subtotalBase);

    const priceTaxVal = document.querySelector('#price-tax-val');
    if (priceTaxVal) priceTaxVal.textContent = formatCurrencyVND(taxes);

    // Coupon breakdown row
    const priceCouponRow = document.querySelector('#price-coupon-row');
    const priceCouponVal = document.querySelector('#price-coupon-val');
    const couponLabel = document.querySelector('#applied-coupon-code');
    if (priceCouponRow) {
      if (activeCoupon && couponDiscountAmount > 0) {
        priceCouponRow.style.display = 'flex';
        if (couponLabel) couponLabel.textContent = activeCoupon.code;
        if (priceCouponVal) priceCouponVal.textContent = '-' + formatCurrencyVND(couponDiscountAmount);
      } else {
        priceCouponRow.style.display = 'none';
      }
    }

    // Hotel Card & Row Visual Feedback
    if (hotelCard) {
      hotelCard.classList.toggle('active', isHotel);
      hotelCard.setAttribute('aria-checked', isHotel ? 'true' : 'false');
    }
    if (hotelBadge) {
      if (isHotel) {
        hotelBadge.className = 'addon-badge-pill active';
        hotelBadge.textContent = '✓ Đã Chọn (Tiết kiệm 3.720.000 ₫)';
      } else {
        hotelBadge.className = 'addon-badge-pill inactive';
        hotelBadge.textContent = 'Tiết kiệm 3.720.000 ₫';
      }
    }
    const priceHotelVal = document.querySelector('#price-hotel-val');
    if (priceHotelVal) priceHotelVal.textContent = '-' + formatCurrencyVND(150);
    if (priceHotelRow) {
      priceHotelRow.style.display = isHotel ? 'flex' : 'none';
    }

    // Transfer Card & Row Visual Feedback
    if (transferCard) {
      transferCard.classList.toggle('active', isTransfer);
      transferCard.setAttribute('aria-checked', isTransfer ? 'true' : 'false');
    }
    if (transferBadge) {
      if (isTransfer) {
        transferBadge.className = 'addon-badge-pill active';
        transferBadge.textContent = '✓ Đã Chọn (+1.116.000 ₫)';
      } else {
        transferBadge.className = 'addon-badge-pill inactive';
        transferBadge.textContent = '+1.116.000 ₫';
      }
    }
    const priceTransferVal = document.querySelector('#price-transfer-val');
    if (priceTransferVal) priceTransferVal.textContent = '+' + formatCurrencyVND(45);
    if (priceTransferRow) {
      priceTransferRow.style.display = isTransfer ? 'flex' : 'none';
    }

    // Update total with pulse animation and secondary USD reference
    const priceTotalUsd = document.querySelector('#price-total-usd');
    if (priceTotalVal) {
      priceTotalVal.textContent = formatCurrencyVND(total);
      if (animate) {
        priceTotalVal.classList.remove('price-pulse-anim');
        void priceTotalVal.offsetWidth;
        priceTotalVal.classList.add('price-pulse-anim');
      }
    }
    if (priceTotalUsd) {
      priceTotalUsd.textContent = `(~${formatCurrencyUSD(total)} USD)`;
    }

    bookingState.totalPrice = total;
    bookingState.baseFare = subtotalBase;
    bookingState.passengerCount = adults + children;
    bookingState.passengers = `${adults} Người lớn${children ? `, ${children} Trẻ em` : ''}${infants ? `, ${infants} Em bé` : ''}`;

    return total;
  }

  // Bind Card Toggling (Clicking checkbox or card body)
  function setupAddonCard(cardEl, checkboxEl) {
    if (!cardEl || !checkboxEl) return;

    checkboxEl.addEventListener('change', () => {
      if (window.playClickSound) window.playClickSound();
      updatePriceBreakdown(true);
      saveCurrentBookingState();
    });

    // Keyboard support for accessibility (Enter or Space when card focused)
    cardEl.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        checkboxEl.checked = !checkboxEl.checked;
        if (typeof Event !== 'undefined') {
          checkboxEl.dispatchEvent(new Event('change'));
        } else {
          checkboxEl.dispatchEvent({ type: 'change' });
        }
      }
    });
  }

  setupAddonCard(hotelCard, hotelCheck);
  setupAddonCard(transferCard, transferCheck);

  // Coupon Voucher Code Interaction
  const btnApplyCoupon = document.querySelector('#btn-apply-coupon');
  const inputCoupon = document.querySelector('#input-coupon-code');
  const couponFeedback = document.querySelector('#coupon-feedback-msg');

  if (btnApplyCoupon && inputCoupon) {
    const handleApplyCoupon = () => {
      const code = inputCoupon.value.trim().toUpperCase();
      if (!code) {
        window.__activeCouponCode = '';
        if (couponFeedback) couponFeedback.style.display = 'none';
        updatePriceBreakdown(true);
        saveCurrentBookingState();
        return;
      }
      const coupons = (typeof CoreStore !== 'undefined' && CoreStore.getCoupons)
        ? CoreStore.getCoupons()
        : [{ code: 'SKYWINGS2026', discount: 10, type: 'percent' }, { code: 'BAYNHANH', discount: 500000, type: 'fixed' }];
      const matched = coupons.find(c => c.code.toUpperCase() === code);
      if (matched) {
        window.__activeCouponCode = code;
        if (couponFeedback) {
          couponFeedback.style.display = 'block';
          couponFeedback.style.color = 'var(--badge-green, #10b981)';
          couponFeedback.textContent = `✓ Áp dụng mã ${matched.code} thành công (${matched.type === 'percent' ? `-${matched.discount}%` : `-${formatCurrencyVND(matched.discount / 24800)}`})`;
        }
        if (window.playClickSound) window.playClickSound();
      } else {
        window.__activeCouponCode = '';
        if (couponFeedback) {
          couponFeedback.style.display = 'block';
          couponFeedback.style.color = '#ef4444';
          couponFeedback.textContent = '✕ Mã giảm giá không hợp lệ hoặc đã hết hạn.';
        }
      }
      updatePriceBreakdown(true);
      saveCurrentBookingState();
    };

    btnApplyCoupon.addEventListener('click', handleApplyCoupon);
    inputCoupon.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleApplyCoupon();
      }
    });
  }

  // 4. Passenger Form Real-Time Field Validation & Dynamic Multi-Passenger Accordion (Part A)
  const nameInput = document.querySelector('#pax-full-name');
  const emailInput = document.querySelector('#pax-email');
  const phoneInput = document.querySelector('#pax-phone');
  const passportInput = document.querySelector('#pax-passport');
  const alertBanner = document.querySelector('#booking-validation-alert');
  const alertBannerText = document.querySelector('#booking-validation-alert-text');
  const paxCountDisplay = document.querySelector('#pax-count-display');
  const extraContainer = document.querySelector('#extra-passengers-container');

  // Pre-fill primary passenger from Storage if present
  if (nameInput && bookingState.passengerName) nameInput.value = bookingState.passengerName;
  if (emailInput && bookingState.passengerEmail) emailInput.value = bookingState.passengerEmail;
  if (phoneInput && bookingState.passengerPhone) phoneInput.value = bookingState.passengerPhone;
  if (passportInput && bookingState.passengerPassport) passportInput.value = bookingState.passengerPassport;

  // Calculate total passenger count from search parameters (e.g. "2 Lớn - 1 Trẻ", "2 Người lớn", or numeric count)
  let totalPaxCount = 1;
  const rawPaxStr = search.passengers || '';
  if (search.passengerCount && typeof search.passengerCount === 'number') {
    totalPaxCount = search.passengerCount;
  } else if (rawPaxStr) {
    const adultM = rawPaxStr.match(/(\d+)\s*(?:Lớn|Người)/i);
    const childM = rawPaxStr.match(/(\d+)\s*(?:Trẻ|Em bé)/i);
    let sum = 0;
    if (adultM) sum += parseInt(adultM[1], 10);
    if (childM) sum += parseInt(childM[1], 10);
    if (sum > 0) {
      totalPaxCount = sum;
    } else {
      const firstDigit = rawPaxStr.match(/\d+/);
      if (firstDigit) totalPaxCount = parseInt(firstDigit[0], 10);
    }
  }
  totalPaxCount = Math.max(1, Math.min(totalPaxCount, 9)); // Safe bounds

  if (paxCountDisplay) {
    if (totalPaxCount > 1) {
      paxCountDisplay.textContent = `Hành khách 1 (Người đại diện đặt vé) • ${totalPaxCount} Hành khách`;
    } else {
      paxCountDisplay.textContent = 'Hành khách 1 (Người đại diện đặt vé)';
    }
  }

  // Validation Rules
  const validators = {
    name(val) {
      const trimmed = (val || '').trim();
      if (!trimmed) return { valid: false, message: 'Họ và tên theo hộ chiếu/CCCD là bắt buộc.' };
      if (trimmed.length < 2) return { valid: false, message: 'Họ và tên phải có ít nhất 2 ký tự.' };
      const nameRegex = /^[a-zA-ZÀ-ỹ\s'-\.]{2,50}$/u;
      if (!nameRegex.test(trimmed)) {
        return { valid: false, message: 'Họ tên chứa ký tự không hợp lệ (không chứa số hoặc ký tự lạ).' };
      }
      return { valid: true, message: 'Thông tin hợp lệ!' };
    },
    email(val) {
      const trimmed = (val || '').trim();
      if (!trimmed) return { valid: false, message: 'Địa chỉ email là bắt buộc để nhận vé điện tử.' };
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(trimmed)) {
        return { valid: false, message: 'Vui lòng nhập đúng định dạng email (VD: name@example.com).' };
      }
      return { valid: true, message: 'Email hợp lệ!' };
    },
    phone(val) {
      const trimmed = (val || '').trim();
      if (!trimmed) return { valid: false, message: 'Số điện thoại là bắt buộc để nhận thông báo hành trình.' };
      const digitsOnly = trimmed.replace(/\D/g, '');
      if (digitsOnly.length < 8 || digitsOnly.length > 15) {
        return { valid: false, message: 'Số điện thoại phải chứa từ 8 đến 15 chữ số.' };
      }
      const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{6,16}$/;
      if (!phoneRegex.test(trimmed)) {
        return { valid: false, message: 'Vui lòng nhập số điện thoại hợp lệ (VD: +84 901 234 567).' };
      }
      return { valid: true, message: 'Số điện thoại hợp lệ!' };
    },
    passport(val) {
      const trimmed = (val || '').trim();
      if (!trimmed) return { valid: false, message: 'Số hộ chiếu hoặc CCCD là bắt buộc để làm thủ tục bay.' };
      const cleanId = trimmed.replace(/[\s\-]/g, '');
      if (cleanId.length < 6 || cleanId.length > 15) {
        return { valid: false, message: 'Số giấy tờ tùy thân phải có từ 6 đến 15 ký tự.' };
      }
      const passportRegex = /^[a-zA-Z0-9\s\-]{6,18}$/;
      if (!passportRegex.test(trimmed)) {
        return { valid: false, message: 'Số giấy tờ chỉ bao gồm chữ cái và số.' };
      }
      return { valid: true, message: 'Giấy tờ tùy thân hợp lệ!' };
    }
  };

  function validateField(inputEl, type, showErrorIfInvalid = true, suffix = '') {
    if (!inputEl) return true;
    const feedbackId = suffix ? `#feedback-pax-${type}-${suffix}` : `#feedback-pax-${type}`;
    const iconId = suffix ? `#icon-pax-${type}-${suffix}` : `#icon-pax-${type}`;
    const feedbackEl = document.querySelector(feedbackId);
    const iconEl = document.querySelector(iconId);
    const validator = validators[type];
    if (!validator) return true;

    const res = validator(inputEl.value);

    if (res.valid) {
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');
      if (iconEl) iconEl.textContent = '✓';
      if (feedbackEl) {
        feedbackEl.className = 'field-feedback-msg show-success';
        feedbackEl.innerHTML = `✓ ${res.message}`;
      }
      return true;
    } else {
      if (showErrorIfInvalid) {
        inputEl.classList.remove('is-valid');
        inputEl.classList.add('is-invalid');
        if (iconEl) iconEl.textContent = '✕';
        if (feedbackEl) {
          feedbackEl.className = 'field-feedback-msg show-error';
          feedbackEl.innerHTML = `⚠️ ${res.message}`;
        }
      }
      return false;
    }
  }

  function validateOptionalField(inputEl, type, showErrorIfInvalid = true, suffix = '') {
    if (!inputEl) return true;
    const val = (inputEl.value || '').trim();
    const feedbackId = suffix ? `#feedback-pax-${type}-${suffix}` : `#feedback-pax-${type}`;
    const iconId = suffix ? `#icon-pax-${type}-${suffix}` : `#icon-pax-${type}`;
    const feedbackEl = document.querySelector(feedbackId);
    const iconEl = document.querySelector(iconId);

    if (!val) {
      inputEl.classList.remove('is-invalid');
      inputEl.classList.remove('is-valid');
      if (feedbackEl) {
        feedbackEl.className = 'field-feedback-msg';
        feedbackEl.innerHTML = '';
      }
      if (iconEl) iconEl.textContent = '';
      return true;
    }
    return validateField(inputEl, type, showErrorIfInvalid, suffix);
  }

  // Setup Passenger 1 listeners
  const primaryConfigs = [
    { input: nameInput, type: 'name' },
    { input: emailInput, type: 'email' },
    { input: phoneInput, type: 'phone' },
    { input: passportInput, type: 'passport' }
  ];

  primaryConfigs.forEach(({ input, type }) => {
    if (!input) return;
    input.addEventListener('input', () => {
      validateField(input, type, true);
      saveCurrentBookingState();
      const status = checkAllFieldsValid(false);
      if (status.allValid && alertBanner) {
        alertBanner.style.display = 'none';
      }
    });
    input.addEventListener('blur', () => {
      validateField(input, type, true);
    });
    if (input.value) {
      validateField(input, type, false);
    }
  });

  // Dynamic Extra Passenger Accordions
  const extraPaxItems = [];
  const storedExtraPax = (bookingState.extraPassengers && Array.isArray(bookingState.extraPassengers))
    ? bookingState.extraPassengers
    : [];

  if (extraContainer) {
    extraContainer.innerHTML = '';
    if (totalPaxCount > 1) {
      const adultM = rawPaxStr.match(/(\d+)\s*(?:Lớn|Người)/i);
      const adultCount = adultM ? parseInt(adultM[1], 10) : 1;

      for (let i = 2; i <= totalPaxCount; i++) {
        const isChild = i > adultCount;
        const paxTypeLabel = isChild ? 'Trẻ em' : 'Người lớn';
        const savedData = storedExtraPax[i - 2] || {};

        const card = document.createElement('div');
        card.className = 'pax-accordion-card';
        card.id = `pax-accordion-card-${i}`;

        card.innerHTML = `
          <button type="button" class="pax-accordion-header" aria-expanded="false" aria-controls="pax-accordion-body-${i}">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <span style="background: var(--accent-light); color: var(--accent-orange); border-radius: 50%; width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.82rem; font-weight: 800;">${i}</span>
              <span>Hành khách ${i} (${paxTypeLabel})</span>
              <span class="pax-accordion-status-chip" id="pax-status-${i}">Chưa điền</span>
            </div>
            <span class="pax-accordion-arrow">▼</span>
          </button>
          <div class="pax-accordion-body" id="pax-accordion-body-${i}">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; margin-bottom: 1.25rem;">
              <div>
                <label for="pax-full-name-${i}" class="field-meta-tag">Họ và Tên (Theo Hộ chiếu/CCCD) <span class="required-star">*</span></label>
                <div class="field-input-wrapper with-icon">
                  <span class="input-prefix-icon">👤</span>
                  <input type="text" id="pax-full-name-${i}" class="booking-field-input" value="${savedData.name || ''}" placeholder="VD: Nguyễn Văn B" autocomplete="off" required>
                  <span class="field-status-icon" id="icon-pax-name-${i}"></span>
                </div>
                <div class="field-feedback-msg" id="feedback-pax-name-${i}"></div>
              </div>
              <div>
                <label for="pax-email-${i}" class="field-meta-tag">Địa Chỉ Email (Tùy chọn)</label>
                <div class="field-input-wrapper with-icon">
                  <span class="input-prefix-icon">✉</span>
                  <input type="email" id="pax-email-${i}" class="booking-field-input" value="${savedData.email || ''}" placeholder="VD: passenger${i}@example.com" autocomplete="off">
                  <span class="field-status-icon" id="icon-pax-email-${i}"></span>
                </div>
                <div class="field-feedback-msg" id="feedback-pax-email-${i}"></div>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem;">
              <div>
                <label for="pax-phone-${i}" class="field-meta-tag">Số Điện Thoại (Tùy chọn)</label>
                <div class="field-input-wrapper with-icon">
                  <span class="input-prefix-icon">📞</span>
                  <input type="tel" id="pax-phone-${i}" class="booking-field-input" value="${savedData.phone || ''}" placeholder="VD: +84 902 345 678" autocomplete="off">
                  <span class="field-status-icon" id="icon-pax-phone-${i}"></span>
                </div>
                <div class="field-feedback-msg" id="feedback-pax-phone-${i}"></div>
              </div>
              <div>
                <label for="pax-passport-${i}" class="field-meta-tag">Số Hộ Chiếu / Căn Cước Công Dân <span class="required-star">*</span></label>
                <div class="field-input-wrapper with-icon">
                  <span class="input-prefix-icon">🪪</span>
                  <input type="text" id="pax-passport-${i}" class="booking-field-input" value="${savedData.passport || ''}" placeholder="VD: B9876543" autocomplete="off" required>
                  <span class="field-status-icon" id="icon-pax-passport-${i}"></span>
                </div>
                <div class="field-feedback-msg" id="feedback-pax-passport-${i}"></div>
              </div>
            </div>
          </div>
        `;

        extraContainer.appendChild(card);

        const headerBtn = card.querySelector('.pax-accordion-header');
        headerBtn.addEventListener('click', () => {
          card.classList.toggle('open');
          headerBtn.setAttribute('aria-expanded', card.classList.contains('open') ? 'true' : 'false');
          if (window.playClickSound) window.playClickSound();
        });

        const nIn = card.querySelector(`#pax-full-name-${i}`);
        const eIn = card.querySelector(`#pax-email-${i}`);
        const pIn = card.querySelector(`#pax-phone-${i}`);
        const passIn = card.querySelector(`#pax-passport-${i}`);
        const statusChip = card.querySelector(`#pax-status-${i}`);

        const itemObj = {
          index: i,
          typeLabel: paxTypeLabel,
          card,
          statusChip,
          nameInput: nIn,
          emailInput: eIn,
          phoneInput: pIn,
          passportInput: passIn
        };

        function refreshItemStatus() {
          const hasName = nIn.value.trim().length >= 2;
          const hasPass = passIn.value.trim().length >= 6;
          const hasAnyInput = nIn.value.trim().length > 0 || passIn.value.trim().length > 0 || (eIn && eIn.value.trim().length > 0) || (pIn && pIn.value.trim().length > 0);

          if (hasName && hasPass) {
            statusChip.textContent = '✓ Hoàn tất';
            statusChip.className = 'pax-accordion-status-chip is-complete';
          } else if (hasAnyInput) {
            statusChip.textContent = 'Đang điền...';
            statusChip.className = 'pax-accordion-status-chip is-filling';
          } else {
            statusChip.textContent = 'Chưa điền';
            statusChip.className = 'pax-accordion-status-chip';
          }
          syncContinueButtonState();
        }

        [nIn, passIn].forEach(input => {
          input.addEventListener('input', () => {
            validateField(input, input === nIn ? 'name' : 'passport', true, String(i));
            refreshItemStatus();
            saveCurrentBookingState();
          });
          input.addEventListener('blur', () => {
            validateField(input, input === nIn ? 'name' : 'passport', true, String(i));
            refreshItemStatus();
          });
          if (input.value) {
            validateField(input, input === nIn ? 'name' : 'passport', false, String(i));
          }
        });

        [eIn, pIn].forEach(input => {
          input.addEventListener('input', () => {
            validateOptionalField(input, input === eIn ? 'email' : 'phone', true, String(i));
            refreshItemStatus();
            saveCurrentBookingState();
          });
          input.addEventListener('blur', () => {
            validateOptionalField(input, input === eIn ? 'email' : 'phone', true, String(i));
            refreshItemStatus();
          });
          if (input.value) {
            validateOptionalField(input, input === eIn ? 'email' : 'phone', false, String(i));
          }
        });

        refreshItemStatus();
        extraPaxItems.push(itemObj);
      }
    }
  }

  function checkAllFieldsValid(showErrors = true) {
    let allValid = true;
    let firstInvalidInput = null;
    let firstInvalidCard = null;

    // 1. Primary passenger
    primaryConfigs.forEach(({ input, type }) => {
      const valid = validateField(input, type, showErrors);
      if (!valid) {
        allValid = false;
        if (!firstInvalidInput) firstInvalidInput = input;
      }
    });

    // 2. Extra passengers
    extraPaxItems.forEach(item => {
      const validName = validateField(item.nameInput, 'name', showErrors, String(item.index));
      const validPass = validateField(item.passportInput, 'passport', showErrors, String(item.index));
      const validEmail = validateOptionalField(item.emailInput, 'email', showErrors, String(item.index));
      const validPhone = validateOptionalField(item.phoneInput, 'phone', showErrors, String(item.index));

      const itemValid = validName && validPass && validEmail && validPhone;
      if (!itemValid) {
        allValid = false;
        // Auto-expand accordion so user sees what needs fixing
        if (showErrors) {
          item.card.classList.add('open');
          const headerBtn = item.card.querySelector('.pax-accordion-header');
          if (headerBtn) headerBtn.setAttribute('aria-expanded', 'true');
        }
        if (!firstInvalidInput) {
          firstInvalidCard = item.card;
          if (!validName) firstInvalidInput = item.nameInput;
          else if (!validPass) firstInvalidInput = item.passportInput;
          else if (!validEmail) firstInvalidInput = item.emailInput;
          else if (!validPhone) firstInvalidInput = item.phoneInput;
        }
      }
    });

    return { allValid, firstInvalidInput, firstInvalidCard };
  }

  function syncContinueButtonState() {
    const btnContinue = document.querySelector('#btn-continue-payment');
    if (!btnContinue) return;
    const { allValid } = checkAllFieldsValid(false);
    if (!allValid) {
      btnContinue.classList.add('btn-continue-locked');
      btnContinue.setAttribute('aria-disabled', 'true');
    } else {
      btnContinue.classList.remove('btn-continue-locked');
      btnContinue.removeAttribute('aria-disabled');
    }
  }

  // Hook primary inputs into syncContinueButtonState
  primaryConfigs.forEach(({ input }) => {
    if (input) {
      input.addEventListener('input', syncContinueButtonState);
    }
  });

  function saveCurrentBookingState() {
    const total = updatePriceBreakdown(false);
    const prevBooking = Storage.getBooking() || {};

    const extraPassengersData = extraPaxItems.map(item => ({
      index: item.index,
      type: item.typeLabel,
      name: item.nameInput ? item.nameInput.value.trim() : '',
      email: item.emailInput ? item.emailInput.value.trim() : '',
      phone: item.phoneInput ? item.phoneInput.value.trim() : '',
      passport: item.passportInput ? item.passportInput.value.trim() : ''
    }));

    const updated = {
      ...prevBooking,
      passengerName: nameInput ? nameInput.value.trim() : 'Jonathan Ben',
      passengerEmail: emailInput ? emailInput.value.trim() : 'jonathan.ben@example.com',
      passengerPhone: phoneInput ? phoneInput.value.trim() : '+971 50 123 4567',
      passengerPassport: passportInput ? passportInput.value.trim() : 'A98765432',
      extraPassengers: extraPassengersData,
      passengerCount: totalPaxCount,
      passengers: search.passengers || `${totalPaxCount} Hành khách`,
      seatClass: getCustomerSeatClass(),
      hotelDiscount: hotelCheck ? hotelCheck.checked : true,
      airportTransfer: transferCheck ? transferCheck.checked : false,
      baseFare: flight.price || 2000,
      taxes: 120,
      hotelDiscountAmount: 150,
      transferAmount: 45,
      totalPrice: total
    };
    Storage.setBooking(updated);
    // Also save primary passenger info directly
    Storage.setPassenger({
      name: updated.passengerName,
      email: updated.passengerEmail,
      phone: updated.passengerPhone,
      passport: updated.passengerPassport
    });
  }

  // Initial calculation
  updatePriceBreakdown(false);

  // 5. Live 15-Minute Countdown Timer (A7 requirement)
  const timerEl = document.querySelector('#booking-countdown-timer');
  const countdownBox = document.querySelector('.booking-countdown-box');
  let countdownInterval = null;

  if (timerEl) {
    const TIMER_KEY = 'ngefly_booking_timer_start';
    let startTime = parseInt(sessionStorage.getItem(TIMER_KEY), 10);
    const TOTAL_SECONDS = 15 * 60; // 15 minutes = 900 seconds

    // Reset if missing or already expired more than 10 mins ago
    if (!startTime || isNaN(startTime) || (Date.now() - startTime) > (TOTAL_SECONDS + 600) * 1000) {
      startTime = Date.now();
      try {
        sessionStorage.setItem(TIMER_KEY, String(startTime));
      } catch(e) {}
    }

    function renderTimer() {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const remaining = TOTAL_SECONDS - elapsedSeconds;

      if (remaining <= 0) {
        timerEl.textContent = '00:00';
        // Thực tế nhả ghế đã chọn trong Storage & hệ thống (Part A/B data release)
        try {
          const curBooking = Storage.getBooking() || {};
          delete curBooking.selectedSeat;
          delete curBooking.seat;
          delete curBooking.seatSurcharge;
          Storage.setBooking(curBooking);
          Storage.setSeat('');
          sessionStorage.removeItem('ngefly_selected_seat');
          sessionStorage.removeItem('selected_seat');
          sessionStorage.removeItem('seat');
          localStorage.removeItem('ngefly_selected_seat');
          localStorage.removeItem('selected_seat');
          localStorage.removeItem('seat');
        } catch(e) {}

        if (countdownBox) {
          countdownBox.classList.add('is-urgent');
          countdownBox.innerHTML = `
            <div style="color: #ef4444; font-weight: 700; font-size: 0.88rem; line-height: 1.5; font-family: inherit;">
              ⚠️ <span style="font-weight: 800; font-family: inherit;">Thời gian giữ chỗ đã hết hạn!</span><br>
              <span style="font-size: 0.82rem; font-weight: 500; color: var(--text-muted); font-family: inherit;">Ghế đã chọn đã được nhả lại khoang vé. Giá vé có thể đã thay đổi.</span>
              <div style="margin-top: 0.6rem;">
                <a href="flights.html" class="btn-signin" style="display: inline-block; padding: 0.4rem 0.95rem; font-size: 0.8rem; text-decoration: none; border-radius: 999px;">Tìm lại chuyến bay ➔</a>
              </div>
            </div>
          `;
        }
        if (countdownInterval) clearInterval(countdownInterval);
        return;
      }

      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      if (remaining < 120 && countdownBox) {
        countdownBox.classList.add('is-urgent');
      }
    }

    renderTimer();
    countdownInterval = setInterval(renderTimer, 1000);
  }

  // Form submission handler
  function handleProceed(targetUrl) {
    const { allValid, firstInvalidInput, firstInvalidCard } = checkAllFieldsValid(true);

    if (!allValid) {
      if (alertBanner) {
        alertBanner.style.display = 'flex';
        if (alertBannerText) {
          alertBannerText.textContent = 'Vui lòng hoàn thiện đầy đủ thông tin cho tất cả hành khách trước khi tiếp tục.';
        }
      }

      if (firstInvalidCard) {
        firstInvalidCard.classList.add('open');
        const headerBtn = firstInvalidCard.querySelector('.pax-accordion-header');
        if (headerBtn) headerBtn.setAttribute('aria-expanded', 'true');
        firstInvalidCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (firstInvalidInput) {
        firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (firstInvalidInput) {
        firstInvalidInput.classList.remove('field-shake');
        void firstInvalidInput.offsetWidth;
        firstInvalidInput.classList.add('field-shake');
        firstInvalidInput.focus();
        setTimeout(() => {
          firstInvalidInput.classList.remove('field-shake');
        }, 600);
      }

      if (typeof showToast === 'function') {
        showToast('⚠️ Vui lòng điền đủ thông tin các hành khách còn thiếu!', 3000);
      }
      return false;
    }

    if (alertBanner) alertBanner.style.display = 'none';
    saveCurrentBookingState();
    if (window.playClickSound) window.playClickSound();

    setTimeout(() => {
      navigateTo(targetUrl);
    }, 250);
    return true;
  }

  // Initial sync of continue button state
  syncContinueButtonState();

  // Continue to Seats Selection (Part B - Fix missing seats flow)
  const btnContinue = document.querySelector('#btn-continue-payment');
  if (btnContinue) {
    btnContinue.addEventListener('click', (e) => {
      e.preventDefault();
      handleProceed('seats.html');
    });
  }

  // Pick Seats Link
  const btnSeats = document.querySelector('#btn-pick-seats');
  if (btnSeats) {
    btnSeats.addEventListener('click', (e) => {
      e.preventDefault();
      handleProceed('seats.html');
    });
  }
}

/* ==============================================================================
   7. PAGES/SEATS.HTML: INTERACTIVE CABIN SEAT MAP & HOVER TOOLTIPS
   ============================================================================== */
function initSeatsPage() {
  const cabinGrid = document.querySelector('#cabin-seats-grid');
  const selectedSeatText = document.querySelector('#selected-seat-text');
  const seatBadgeChip = document.querySelector('#seat-badge-chip');
  const tooltip = document.querySelector('#seat-map-tooltip');
  if (!cabinGrid && !selectedSeatText) return;

  verifyBookingDataIntegrity('Trang Chọn Ghế (seats.html)');

  const booking = Storage.getBooking() || {};
  const search = Storage.getSearch() || {};
  const flight = Storage.getFlight() || {};

  // Kiểm tra thời hạn giữ vé 15 phút (Nếu hết hạn thì thực tế nhả ghế đã chọn)
  try {
    const TIMER_KEY = 'ngefly_booking_timer_start';
    const timerStart = parseInt(sessionStorage.getItem(TIMER_KEY), 10);
    const TOTAL_SECONDS = 15 * 60;
    if (timerStart && !isNaN(timerStart) && (Date.now() - timerStart) >= TOTAL_SECONDS * 1000) {
      Storage.setSeat('');
      delete booking.selectedSeat;
      delete booking.seat;
      delete booking.seatSurcharge;
      Storage.setBooking(booking);
      sessionStorage.removeItem('ngefly_selected_seat');
      localStorage.removeItem('ngefly_selected_seat');
      if (typeof showToast === 'function') {
        showToast('⚠️ Thời hạn giữ chỗ 15 phút đã hết. Ghế cũ đã được giải phóng!', 4000);
      }
    }
  } catch(e) {}

  const customerSeatClass = getCustomerSeatClass();
  const isCustomerBusiness = isBusinessClass(customerSeatClass);
  const numAdults = Math.max(1, Number(search.adults) || 1);
  const numChildren = Math.max(0, Number(search.children) || 0);
  const paxCount = numAdults + numChildren;
  let selectedSeats = [];

  // Synchronize canonical seatClass into storage
  if (booking.seatClass !== customerSeatClass) {
    booking.seatClass = customerSeatClass;
    Storage.setBooking(booking);
  }

  // Update Ticket Class Banner & cabin guides
  const titleClassEl = document.querySelector('#current-ticket-class-title');
  const guideClassEl = document.querySelector('#cabin-selection-guide');
  const businessSec = document.querySelector('#section-cabin-business');
  const economySec = document.querySelector('#section-cabin-economy');

  if (titleClassEl) {
    titleClassEl.textContent = isCustomerBusiness ? 'Hạng Thương Gia (SkyFirst)' : 'Hạng Phổ Thông Đặc Biệt (Premium)';
  }
  if (guideClassEl) {
    guideClassEl.textContent = isCustomerBusiness
      ? '✓ Được chọn chỗ trong Khoang Thương Gia (Hàng 10 - 12)'
      : '✓ Được chọn chỗ trong Khoang Phổ Thông (Hàng 14 - 16)';
  }

  // Visually deemphasize and disable the unselected cabin section
  if (businessSec && economySec) {
    if (isCustomerBusiness) {
      businessSec.classList.remove('disabled-cabin');
      businessSec.removeAttribute('aria-disabled');
      businessSec.querySelectorAll('.seat-cell').forEach(c => {
        if (!c.classList.contains('seat-taken')) c.setAttribute('tabindex', '0');
      });

      economySec.classList.add('disabled-cabin');
      economySec.setAttribute('aria-disabled', 'true');
      economySec.querySelectorAll('.seat-cell').forEach(c => {
        c.setAttribute('tabindex', '-1');
      });
    } else {
      economySec.classList.remove('disabled-cabin');
      economySec.removeAttribute('aria-disabled');
      economySec.querySelectorAll('.seat-cell').forEach(c => {
        if (!c.classList.contains('seat-taken')) c.setAttribute('tabindex', '0');
      });

      businessSec.classList.add('disabled-cabin');
      businessSec.setAttribute('aria-disabled', 'true');
      businessSec.querySelectorAll('.seat-cell').forEach(c => {
        c.setAttribute('tabindex', '-1');
      });
    }
  }

  const subtitleEl = document.querySelector('#seats-flight-subtitle');
  if (subtitleEl) {
    subtitleEl.textContent = `Khoang tàu bay ${flight.aircraft || 'Boeing 787-9 Dreamliner'} • ${flight.airline || 'FlyNest Airlines'} Chuyến bay ${flight.flightNumber || 'SW-882'} (${flight.from || 'SGN'} ➔ ${flight.to || 'HAN'})`;
  }

  // Tooltip DOM Elements
  const ttSeatCode = document.querySelector('#tt-seat-code');
  const ttSeatBadge = document.querySelector('#tt-seat-badge');
  const ttSeatType = document.querySelector('#tt-seat-type');
  const ttSeatClass = document.querySelector('#tt-seat-class');
  const ttSeatPerk = document.querySelector('#tt-seat-perk');

  // Helper to extract comprehensive seat details
  function getSeatDetails(cell) {
    let seatCode = cell.getAttribute('data-seat');
    if (!seatCode) {
      const row = cell.closest('.seat-row-strip')?.querySelector('.row-index')?.textContent.trim() || '12';
      const letter = cell.textContent.replace(/[✓✕]/g, '').trim();
      seatCode = `${row}${letter}`;
    }

    const rowNum = parseInt(seatCode, 10) || 12;
    const colLetter = seatCode.slice(-1).toUpperCase();
    const surcharge = Number(cell.getAttribute('data-surcharge')) || 0;

    // Cabin class based on row number or data-class
    const seatClass = cell.getAttribute('data-class') === 'Economy' || rowNum > 12 ? 'Hạng Phổ Thông Đặc Biệt' : 'Hạng Thương Gia';

    // Seat type based on column letter or data-type
    let rawType = cell.getAttribute('data-type');
    let seatType = 'Ghế Giữa';
    if (rawType === 'Window' || colLetter === 'A' || colLetter === 'F') seatType = 'Ghế Cửa Sổ';
    else if (rawType === 'Aisle' || colLetter === 'C' || colLetter === 'D') seatType = 'Ghế Lối Đi';

    const isTaken = cell.classList.contains('seat-taken');
    const isActive = cell.classList.contains('seat-active');

    let status = 'Còn Trống';
    let statusBadgeClass = 'badge-available';
    if (isTaken) {
      status = 'Đã Có Người';
      statusBadgeClass = 'badge-occupied';
    } else if (isActive) {
      status = 'Đang Chọn';
      statusBadgeClass = 'badge-selected';
    }

    let perk = surcharge > 0
      ? ('★ Ghế ưu tiên view đẹp / rộng rãi (Phụ phí +' + formatCurrencyVND(surcharge) + ')')
      : '✈ Ghế tiêu chuẩn đã bao gồm trong giá vé • Cổng sạc USB & HD riêng';

    if (isTaken) {
      const passenger = cell.getAttribute('data-passenger');
      perk = passenger ? `🔒 Hành khách: ${passenger} (Đã có người đặt)` : '🔒 Ghế này đã có hành khách khác đặt';
    } else if (seatClass.includes('Thương Gia')) {
      perk = surcharge > 0
        ? ('★ Ghế ngả phẳng 180° cạnh cửa sổ (Phụ phí +' + formatCurrencyVND(surcharge) + ')')
        : '★ Ghế ngả phẳng 180° • Lối đi riêng thuận tiện • Ẩm thực thượng hạng';
    }

    return {
      seatCode,
      rowNum,
      colLetter,
      seatClass,
      seatType,
      surcharge,
      status,
      statusBadgeClass,
      isTaken,
      isActive,
      perk
    };
  }

  // Biến lưu ô vuông ghế đang được tương tác (hover hoặc click chọn)
  let currentTargetSeatCell = null;

  // Cập nhật và định vị Tooltip
  function showTooltip(cell) {
    if (!tooltip || !cell) return;
    currentTargetSeatCell = cell;
    const details = getSeatDetails(cell);

    const cellClass = cell.getAttribute('data-class') || (cell.closest('#section-cabin-business') ? 'Business' : 'Economy');
    const rowNum = parseInt(cell.getAttribute('data-seat') || '10', 10);
    const isCellBusiness = cellClass === 'Business' || rowNum <= 12;
    const isCellDisabledCabin = (isCustomerBusiness && !isCellBusiness) || (!isCustomerBusiness && isCellBusiness);

    if (ttSeatCode) ttSeatCode.textContent = details.seatCode;
    if (ttSeatBadge) {
      if (isCellDisabledCabin) {
        ttSeatBadge.textContent = 'Không Khả Dụng ✕';
        ttSeatBadge.className = 'tooltip-badge badge-occupied';
      } else {
        ttSeatBadge.textContent = details.status;
        ttSeatBadge.className = `tooltip-badge ${details.statusBadgeClass}`;
      }
    }
    if (ttSeatType) ttSeatType.textContent = details.seatType;
    if (ttSeatClass) ttSeatClass.textContent = details.seatClass;
    if (ttSeatPerk) {
      if (isCellDisabledCabin) {
        ttSeatPerk.textContent = isCustomerBusiness
          ? '🚫 Ghế thuộc Khoang Phổ Thông, không khả dụng cho vé Hạng Thương Gia của bạn.'
          : '🚫 Ghế thuộc Khoang Thương Gia, không khả dụng cho vé Hạng Phổ Thông của bạn.';
      } else {
        ttSeatPerk.textContent = details.perk;
      }
    }

    tooltip.classList.add('is-visible');
    tooltip.setAttribute('aria-hidden', 'false');

    const rect = cell.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth > 50 ? tooltip.offsetWidth : 240;
    const tooltipHeight = tooltip.offsetHeight > 50 ? tooltip.offsetHeight : 140;

    const seatCenterX = rect.left + (rect.width / 2);
    let left = seatCenterX - (tooltipWidth / 2);
    left = Math.max(12, Math.min(window.innerWidth - tooltipWidth - 12, left));

    const arrowOffsetX = Math.max(16, Math.min(tooltipWidth - 16, seatCenterX - left));
    tooltip.style.setProperty('--arrow-offset-x', `${Math.round(arrowOffsetX)}px`);

    const safePos = positionTooltipSafely(tooltip, rect, '.cabin-class-header, .exit-row-label');
    const top = safePos.top;
    const arrowSide = safePos.placement === 'above' ? 'arrow-bottom' : 'arrow-top';

    tooltip.style.left = `${Math.round(left)}px`;
    tooltip.style.top = `${Math.round(top)}px`;
    tooltip.classList.remove('arrow-left', 'arrow-right', 'arrow-top', 'arrow-bottom');
    tooltip.classList.add(arrowSide);
  }

  window.showSeatTooltip = showTooltip;

  function restoreActiveTooltip() {
    if (!tooltip) return;
    const activeSeat = cabinGrid.querySelector('.seat-cell.seat-active');
    if (activeSeat) {
      currentTargetSeatCell = activeSeat;
      showTooltip(activeSeat);
    } else {
      tooltip.classList.remove('is-visible');
      tooltip.setAttribute('aria-hidden', 'true');
    }
  }

  // Gắn sự kiện hover và focus cho toàn bộ các ô vuông ghế
  const allSeats = cabinGrid.querySelectorAll('.seat-cell');
  allSeats.forEach(cell => {
    cell.addEventListener('mouseenter', () => showTooltip(cell));
    cell.addEventListener('focus', () => showTooltip(cell));
  });

  cabinGrid.addEventListener('mouseleave', restoreActiveTooltip);

  let seatTooltipRaf = null;
  const updateSeatTooltipPosition = () => {
    if (seatTooltipRaf) return;
    seatTooltipRaf = requestAnimationFrame(() => {
      seatTooltipRaf = null;
      const target = currentTargetSeatCell || cabinGrid.querySelector('.seat-cell.seat-active');
      if (target && tooltip && tooltip.classList.contains('is-visible')) {
        showTooltip(target);
      }
    });
  };

  window.addEventListener('scroll', updateSeatTooltipPosition, { passive: true });
  window.addEventListener('resize', updateSeatTooltipPosition, { passive: true });

  function updateSeatSummaryDisplay(details) {
    if (selectedSeatText) {
      selectedSeatText.innerHTML = `${details.seatCode} <span style="font-size: 0.95rem; color: var(--text-muted); font-weight: 600;">(${details.seatType} • ${details.seatClass})</span>`;
    }

    const feeBadge = document.querySelector('#selected-seat-fee-badge');
    const surcharge = details.surcharge || 0;
    if (feeBadge) {
      if (surcharge > 0) {
        feeBadge.textContent = 'Phụ phí: +' + formatCurrencyVND(surcharge);
        feeBadge.style.color = '#f59e0b';
        feeBadge.style.background = 'rgba(245, 158, 11, 0.12)';
        feeBadge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      } else {
        feeBadge.textContent = 'Miễn phí theo hạng vé ✓';
        feeBadge.style.color = '#10b981';
        feeBadge.style.background = 'rgba(16, 185, 129, 0.12)';
        feeBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      }
    }

    if (seatBadgeChip) {
      if (details.seatClass === 'Business Class' || details.seatClass.includes('Thương Gia') || details.seatClass.includes('Business')) {
        seatBadgeChip.innerHTML = '★ Đã Bao Gồm Quyền Lợi Hạng Thương Gia';
        seatBadgeChip.style.background = 'var(--accent-light)';
        seatBadgeChip.style.color = 'var(--accent-orange)';
        seatBadgeChip.style.borderColor = 'var(--accent-light-border)';
      } else {
        seatBadgeChip.innerHTML = '✈ Khoang Phổ Thông Tiện Nghi Thêm Chỗ Để Chân';
        seatBadgeChip.style.background = 'var(--badge-blue-bg)';
        seatBadgeChip.style.color = 'var(--badge-blue)';
        seatBadgeChip.style.borderColor = 'rgba(59, 130, 246, 0.3)';
      }
    }
  }

  // Restore previously selected seats if any, or default
  let storedSeats = booking.selectedSeats || (booking.selectedSeat ? [booking.selectedSeat] : []);
  // Make sure they are in customer cabin
  storedSeats = storedSeats.filter(s => isSeatInCustomerCabin(s, isCustomerBusiness));

  // Initialize display
  allSeats.forEach(s => {
    s.classList.remove('seat-active');
    const code = s.getAttribute('data-seat') || '';
    if (!s.classList.contains('seat-taken')) {
      s.classList.add('seat-free');
      s.textContent = code.slice(-1) || s.textContent.replace(/[✓✕]/g, '').trim();
    }
  });

  if (storedSeats.length > 0) {
    storedSeats.forEach(code => {
      const cell = cabinGrid.querySelector(`.seat-cell[data-seat="${code}"]`);
      if (cell && !cell.classList.contains('seat-taken')) {
        cell.classList.remove('seat-free');
        cell.classList.add('seat-active');
        cell.textContent = '✓';
        selectedSeats.push(getSeatDetails(cell));
      }
    });
  } else {
    // If no seats selected, we can try to pick default if paxCount == 1, else just wait for user
    if (paxCount === 1) {
      const defaultSeat = isCustomerBusiness ? '10F' : '14B';
      const cell = cabinGrid.querySelector(`.seat-cell[data-seat="${defaultSeat}"]`);
      if (cell && !cell.classList.contains('seat-taken')) {
        cell.classList.remove('seat-free');
        cell.classList.add('seat-active');
        cell.textContent = '✓';
        selectedSeats.push(getSeatDetails(cell));
      }
    }
  }
  
  updateSeatSummaryDisplay(selectedSeats);

  // Seat Click Listener
  cabinGrid.addEventListener('click', (e) => {
    const cell = e.target.closest('.seat-cell');
    if (!cell) return;

    if (cell.classList.contains('seat-taken')) {
      cell.classList.remove('shake-taken'); void cell.offsetWidth; cell.classList.add('shake-taken');
      if (ttSeatBadge) ttSeatBadge.textContent = 'Đã Có Người ✕';
      if (ttSeatPerk) ttSeatPerk.textContent = '⚠️ Ghế này đã được đặt trước. Vui lòng chọn ghế còn trống khác.';
      return;
    }

    const cellClass = cell.getAttribute('data-class') || (cell.closest('#section-cabin-business') ? 'Business' : 'Economy');
    const rowNum = parseInt(cell.getAttribute('data-seat') || '10', 10);
    const isCellBusiness = cellClass === 'Business' || rowNum <= 12;

    if (isCustomerBusiness && !isCellBusiness) {
      cell.classList.remove('shake-taken'); void cell.offsetWidth; cell.classList.add('shake-taken');
      if(typeof showToast==='function') showToast('⚠️ Ghế thuộc Khoang Phổ Thông, không khả dụng cho vé Hạng Thương Gia của bạn.', 3500);
      return;
    }

    if (!isCustomerBusiness && isCellBusiness) {
      cell.classList.remove('shake-taken'); void cell.offsetWidth; cell.classList.add('shake-taken');
      if(typeof showToast==='function') showToast('⚠️ Ghế thuộc Khoang Thương Gia, không khả dụng cho vé Hạng Phổ Thông của bạn.', 3500);
      return;
    }

    if (window.playClickSound) window.playClickSound();

    const details = getSeatDetails(cell);
    const isActive = cell.classList.contains('seat-active');

    if (isActive) {
      // Unselect
      cell.classList.remove('seat-active');
      cell.classList.add('seat-free');
      const code = cell.getAttribute('data-seat') || '';
      cell.textContent = code.slice(-1) || 'A';
      selectedSeats = selectedSeats.filter(s => s.seatCode !== details.seatCode);
    } else {
      // Select
      if (selectedSeats.length >= paxCount) {
        if(typeof showToast==='function') showToast(`Bạn chỉ được chọn tối đa ${paxCount} ghế cho ${paxCount} hành khách.`, 3500);
        cell.classList.remove('shake-taken'); void cell.offsetWidth; cell.classList.add('shake-taken');
        return;
      }
      cell.classList.remove('seat-free');
      cell.classList.add('seat-active');
      cell.textContent = '✓';
      selectedSeats.push(details);
    }

    updateSeatSummaryDisplay(selectedSeats);
    
    // Save to booking state
    const currentBooking = Storage.getBooking() || {};
    currentBooking.selectedSeats = selectedSeats.map(s => s.seatCode);
    if (selectedSeats.length > 0) {
        currentBooking.selectedSeat = selectedSeats[0].seatCode; // legacy compatibility
        currentBooking.seatSurcharge = selectedSeats.reduce((sum, d) => sum + (d.surcharge || 0), 0);
    } else {
        currentBooking.selectedSeat = '';
        currentBooking.seatSurcharge = 0;
    }
    const baseTotal = (Number(currentBooking.baseFare) || (isCustomerBusiness ? 2000 : 850)) +
                      (Number(currentBooking.taxes) || 120) -
                      (currentBooking.hotelDiscount ? 150 : 0) +
                      (currentBooking.airportTransfer ? 45 : 0);
    currentBooking.totalPrice = baseTotal + currentBooking.seatSurcharge;
    Storage.setBooking(currentBooking);
    Storage.setSeat(currentBooking.selectedSeat);

    showTooltip(cell);
  });

  // Skip Seat Button (Part B - Auto choose seat)
  const btnSkipSeat = document.querySelector('#btn-skip-seat');
  if (btnSkipSeat) {
    btnSkipSeat.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.playClickSound) window.playClickSound();

      const targetSec = isCustomerBusiness ? businessSec : economySec;
      const searchRoot = targetSec || cabinGrid;
      let freeSeats = Array.from(searchRoot.querySelectorAll('.seat-cell.seat-free')).filter(s => (Number(s.getAttribute('data-surcharge'))||0) === 0 && !s.classList.contains('seat-taken'));
      if (freeSeats.length < paxCount) {
        freeSeats = Array.from((isCustomerBusiness ? businessSec : economySec).querySelectorAll('.seat-cell.seat-free')).filter(s => !s.classList.contains('seat-taken'));
      }
      
      // Clear current
      selectedSeats.forEach(details => {
        const c = cabinGrid.querySelector(`.seat-cell[data-seat="${details.seatCode}"]`);
        if (c) {
          c.classList.remove('seat-active');
          c.classList.add('seat-free');
          c.textContent = details.colLetter;
        }
      });
      selectedSeats = [];

      for (let i = 0; i < Math.min(paxCount, freeSeats.length); i++) {
        const chosen = freeSeats[i];
        chosen.classList.remove('seat-free');
        chosen.classList.add('seat-active');
        chosen.textContent = '✓';
        selectedSeats.push(getSeatDetails(chosen));
      }

      updateSeatSummaryDisplay(selectedSeats);
      
      if (selectedSeats.length > 0) {
        const currentB = Storage.getBooking() || {};
        currentB.selectedSeats = selectedSeats.map(s => s.seatCode);
        currentB.selectedSeat = selectedSeats[0].seatCode;
        currentB.seatSurcharge = selectedSeats.reduce((sum, d) => sum + (d.surcharge || 0), 0);
        Storage.setBooking(currentB);
        Storage.setSeat(currentB.selectedSeat);
        if(typeof showToast==='function') showToast(`⚡ Hệ thống đã tự động gán ${selectedSeats.length} ghế cho bạn!`, 2000);
      }

      setTimeout(() => {
        navigateTo('payment.html');
      }, 500);
    });
  }

  // Confirm Seat Button
  const btnConfirmSeat = document.querySelector('#btn-confirm-seat');
  if (btnConfirmSeat) {
    btnConfirmSeat.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.playClickSound) window.playClickSound();

      if (selectedSeats.length < paxCount) {
        if(typeof showToast==='function') showToast(`⚠️ Vui lòng chọn đủ ${paxCount} ghế cho ${paxCount} hành khách trước khi tiếp tục.`, 3500);
        return;
      }

      const currentB = Storage.getBooking() || {};
      currentB.selectedSeats = selectedSeats.map(s => s.seatCode);
      currentB.selectedSeat = selectedSeats[0].seatCode;
      currentB.seatSurcharge = selectedSeats.reduce((sum, d) => sum + (d.surcharge || 0), 0);
      Storage.setBooking(currentB);
      Storage.setSeat(currentB.selectedSeat);

      setTimeout(() => {
        navigateTo('payment.html');
      }, 250);
    });
  }
}


/* ==============================================================================
   UTILITY HELPERS: TOAST, CLIPBOARD, PNR GENERATOR
   ============================================================================== */
function showToast(message, duration = 3000) {
  let container = document.querySelector('.ngefly-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'ngefly-toast-container';
    document.body.appendChild(container);
  }

  // Clear existing toasts for a clean single-toast presentation
  const existing = container.querySelector('.ngefly-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'ngefly-toast';
  toast.innerHTML = `<span class="toast-icon-badge">✓</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 280);
  }, duration);
}

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((resolve, reject) => {
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        successful ? resolve() : reject(new Error('Copy failed'));
      } catch (err) {
        document.body.removeChild(textArea);
        reject(err);
      }
    });
  }
}

function generatePNR(seed) {
  let prefix = 'NF';
  if (seed) {
    const clean = seed.replace(/[^A-Za-z]/g, '').toUpperCase();
    if (clean.length >= 2) prefix = clean.slice(0, 2);
  }
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}${suffix}`.slice(0, 6);
}

if (typeof window !== 'undefined') {
  window.showToast = showToast;
  window.showNgeflyToast = showToast;
  window.copyToClipboard = copyToClipboard;
  window.generatePNR = generatePNR;
}
const showNgeflyToast = showToast;

/* ==============================================================================
   8. PAGES/PAYMENT.HTML: CREDIT CARD, VNPAY QR, MOMO, APPLE PAY GATEWAYS
   ============================================================================== */
function initPaymentPage() {
  const paymentForm = document.querySelector('#ngefly-payment-form');
  const cardMockup = document.querySelector('.credit-card-mockup');
  const tabsContainer = document.querySelector('.payment-tabs-container');
  if (!paymentForm && !cardMockup && !tabsContainer) return;

  const search = Storage.getSearch();
  const flight = Storage.getFlight();
  const booking = Storage.getBooking();
  const seat = Storage.getSeat();

  verifyBookingDataIntegrity('Trang Thanh Toán (payment.html)');

  const passengerName = (booking.passengerName || 'Jonathan Ben').trim();
  const totalAmount = Number(booking.totalPrice) || 2120;
  const formattedTotal = formatCurrencyUSD(totalAmount);
  const vndEstimated = formatCurrencyVND(totalAmount);

  // 1. Update Flight Summary Sidebar
  const summaryDepCode = document.querySelector('#summary-dep-code');
  const summaryDepCity = document.querySelector('#summary-dep-city');
  const summaryArrCode = document.querySelector('#summary-arr-code');
  const summaryArrCity = document.querySelector('#summary-arr-city');
  const summaryFlight = document.querySelector('#summary-flight-text');
  const summaryPax = document.querySelector('#summary-pax-text');
  const summaryClass = document.querySelector('#summary-class-text');
  const summarySeat = document.querySelector('#summary-seat-text');
  const summaryTotal = document.querySelector('#summary-total-val');
  const summaryTotalUsd = document.querySelector('#summary-total-usd');

  const paxCount = booking.passengerCount || search.passengerCount || 2;
  const paxLabel = booking.passengers || `${paxCount} Người lớn`;

  if (summaryDepCode) summaryDepCode.textContent = flight.from || search.from || 'SGN';
  if (summaryDepCity) summaryDepCity.textContent = getAirportShortCity(flight.from || search.from || 'SGN');
  if (summaryArrCode) summaryArrCode.textContent = flight.to || search.to || 'HAN';
  if (summaryArrCity) summaryArrCity.textContent = getAirportShortCity(flight.to || search.to || 'HAN');
  if (summaryFlight) summaryFlight.textContent = `${flight.airline || 'FlyNest Airlines'} (${flight.flightNumber || 'SW-882'})`;
  const customerClass = getCustomerSeatClass();
  if (summaryClass) summaryClass.textContent = `${customerClass} (${booking.baggage || '20kg + 7kg'})`;
  if (summarySeat) {
    const surchargeText = booking.seatSurcharge ? (' • Phụ phí +' + formatCurrencyVND(booking.seatSurcharge)) : '';
    summarySeat.textContent = `${seat || (customerClass.includes('Thương Gia') ? '10F' : '14B')} (${customerClass})${surchargeText}`;
  }
  if (summaryTotal) summaryTotal.textContent = vndEstimated;
  if (summaryTotalUsd) summaryTotalUsd.textContent = `(~${formattedTotal} USD)`;

  // 2. Synchronize Amounts Across All Payment Panels (VND Primary, USD Secondary)
  const btnPay = document.querySelector('#btn-confirm-pay');
  if (btnPay) btnPay.textContent = `🔒 Xác Nhận & Thanh Toán ${vndEstimated} (${formattedTotal})`;

  const vnpayTotalDisplay = document.querySelector('#vnpay-total-display');
  if (vnpayTotalDisplay) vnpayTotalDisplay.textContent = vndEstimated;

  const vnpayUsdDisplay = document.querySelector('#vnpay-usd-display');
  if (vnpayUsdDisplay) vnpayUsdDisplay.textContent = `(~${formattedTotal} USD • Đã gồm thuế phí)`;

  const momoTotalDisplay = document.querySelector('#momo-total-display');
  if (momoTotalDisplay) momoTotalDisplay.textContent = vndEstimated;

  const momoUsdDisplay = document.querySelector('#momo-usd-display');
  if (momoUsdDisplay) momoUsdDisplay.textContent = `(~${formattedTotal} USD • Đã gồm thuế phí)`;

  const zalopayTotalDisplay = document.querySelector('#zalopay-total-display');
  if (zalopayTotalDisplay) zalopayTotalDisplay.textContent = vndEstimated;

  const zalopayUsdDisplay = document.querySelector('#zalopay-usd-display');
  if (zalopayUsdDisplay) zalopayUsdDisplay.textContent = `(~${formattedTotal} USD • Đã gồm thuế phí)`;

  const applepayTotalDisplay = document.querySelector('#applepay-total-display');
  if (applepayTotalDisplay) applepayTotalDisplay.innerHTML = `${vndEstimated} <small style="font-size: 0.82rem; font-weight: 600; color: #cbd5e1;">(${formattedTotal} USD)</small>`;

  // Dynamic Installment Terms Calculation
  const inst3 = document.querySelector('#inst-term-3');
  const inst6 = document.querySelector('#inst-term-6');
  const inst12 = document.querySelector('#inst-term-12');
  if (inst3) inst3.textContent = Math.round((totalAmount * 24800) / 3).toLocaleString('vi-VN') + ' ₫';
  if (inst6) inst6.textContent = Math.round((totalAmount * 24800) / 6).toLocaleString('vi-VN') + ' ₫';
  if (inst12) inst12.textContent = Math.round(((totalAmount * 24800) * 1.09) / 12).toLocaleString('vi-VN') + ' ₫';

  // Interactive Term Cards Selection
  const instCards = document.querySelectorAll('.installment-term-card');
  instCards.forEach(c => {
    c.addEventListener('click', () => {
      instCards.forEach(card => card.classList.remove('selected'));
      c.classList.add('selected');
    });
  });

  // 3. VNPAY 15-Minute Countdown Timer
  const countdownEl = document.querySelector('#vnpay-countdown');
  if (countdownEl) {
    let timeLeft = 14 * 60 + 59; // 14:59
    const timerInterval = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        countdownEl.textContent = '00:00 (Expired)';
        return;
      }
      timeLeft--;
      const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
      const s = String(timeLeft % 60).padStart(2, '0');
      countdownEl.textContent = `${m}:${s}`;
    }, 1000);
  }

  // 4. Payment Gateway Option Tabs Switcher
  const paymentTabs = document.querySelectorAll('.payment-tab');
  const paymentPanels = document.querySelectorAll('.payment-panel');

  paymentTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');
      if (!targetId) return;

      if (window.playClickSound) window.playClickSound();

      paymentTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      paymentPanels.forEach(panel => {
        if (panel.id === targetId) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });

  // 5. Credit Card Interactive Form & Real-time Live Metallic Mockup Sync
  const displayCardName = document.querySelector('#display-card-name');
  const displayCardNum = document.querySelector('#display-card-num');
  const displayCardExp = document.querySelector('#display-card-exp');
  const cardBrandBadge = document.querySelector('#card-brand-badge');

  const cardHolderInput = document.querySelector('#input-card-holder');
  const cardNumInput = document.querySelector('#input-card-num');
  const cardExpInput = document.querySelector('#input-card-exp');
  const cardCvvInput = document.querySelector('#input-card-cvv');
  const btnToggleCvv = document.querySelector('#btn-toggle-cvv');

  if (btnToggleCvv && cardCvvInput) {
    btnToggleCvv.addEventListener('click', (e) => {
      e.preventDefault();
      if (cardCvvInput.type === 'password') {
        cardCvvInput.type = 'text';
        btnToggleCvv.textContent = '🔒';
        btnToggleCvv.setAttribute('title', 'Ẩn mã CVV');
      } else {
        cardCvvInput.type = 'password';
        btnToggleCvv.textContent = '👁️';
        btnToggleCvv.setAttribute('title', 'Hiện mã CVV');
      }
    });
  }

  // Pre-fill initial values
  if (cardHolderInput && passengerName) {
    cardHolderInput.value = passengerName;
    if (displayCardName) displayCardName.textContent = passengerName.toUpperCase();
  }

  // Live Cardholder Name sync
  if (cardHolderInput && displayCardName) {
    cardHolderInput.addEventListener('input', () => {
      const val = cardHolderInput.value.trim().toUpperCase();
      displayCardName.textContent = val || 'CARD HOLDER';
    });
  }

  // Live Card Number Formatting (blocks of 4 digits, max 16 digits) & Brand Detection
  if (cardNumInput && displayCardNum) {
    cardNumInput.addEventListener('input', () => {
      // Strip non-digits and cap at 16 digits
      let digits = cardNumInput.value.replace(/\D/g, '').slice(0, 16);
      // Format into blocks of 4
      let blocks = digits.match(/.{1,4}/g) || [];
      let formatted = blocks.join(' ');
      cardNumInput.value = formatted;

      // Update card mockup display
      displayCardNum.textContent = formatted || '•••• •••• •••• ••••';

      // Dynamic Card Brand Detection
      if (cardBrandBadge) {
        if (digits.startsWith('4')) {
          cardBrandBadge.textContent = 'VISA';
        } else if (/^(5[1-5]|2[2-7])/.test(digits)) {
          cardBrandBadge.textContent = 'MASTERCARD';
        } else if (/^(34|37)/.test(digits)) {
          cardBrandBadge.textContent = 'AMEX';
        } else if (digits.startsWith('9704')) {
          cardBrandBadge.textContent = 'NAPAS';
        } else {
          cardBrandBadge.textContent = 'VISA';
        }
      }
    });
  }

  // Live Expiration Date Formatting (MM/YY)
  if (cardExpInput && displayCardExp) {
    cardExpInput.addEventListener('input', () => {
      let raw = cardExpInput.value.replace(/\D/g, '').slice(0, 4);

      if (raw.length >= 2) {
        let mm = parseInt(raw.slice(0, 2), 10);
        if (mm > 12) raw = '12' + raw.slice(2);
        if (raw.slice(0, 2) === '00') raw = '01' + raw.slice(2);
        raw = raw.slice(0, 2) + '/' + raw.slice(2);
      }

      cardExpInput.value = raw;
      displayCardExp.textContent = raw ? (raw.length >= 2 ? raw.slice(0, 2) + ' / ' + (raw.slice(3) || 'YY') : raw + ' / YY') : '08 / 29';
    });
  }

  // Live CVV input restriction, 3D tilt highlight & real-time mockup sync
  const displayCardCvv = document.querySelector('#display-card-cvv');
  if (cardCvvInput) {
    if (cardMockup) {
      cardCvvInput.addEventListener('focus', () => {
        cardMockup.classList.add('cvv-focused');
      });
      cardCvvInput.addEventListener('blur', () => {
        cardMockup.classList.remove('cvv-focused');
      });
    }

    const updateCvvPreview = () => {
      let val = cardCvvInput.value.replace(/\D/g, '').slice(0, 4);
      cardCvvInput.value = val;
      if (displayCardCvv) {
        if (!val) {
          displayCardCvv.textContent = '•••';
        } else if (cardCvvInput.type === 'password') {
          displayCardCvv.textContent = '•'.repeat(val.length);
        } else {
          displayCardCvv.textContent = val;
        }
      }
    };

    cardCvvInput.addEventListener('input', updateCvvPreview);
    if (btnToggleCvv) {
      btnToggleCvv.addEventListener('click', () => {
        setTimeout(updateCvvPreview, 30);
      });
    }
  }

  // 6. Unified Payment Submission Handler (Generates 6-character PNR)
  function processPayment(method, submitBtn, loadingMsg) {
    // Generate valid 6-character PNR code
    const generatedPnr = generatePNR(flight.flightNumber || flight.airline || 'NF');

    Storage.setPnr(generatedPnr);
    Storage.set('ngefly_payment_method', method);
    Storage.set('ngefly_payment_date', new Date().toISOString());

    // Record order in state store for Admin portal & reporting
    const orderRecord = {
      pnr: generatedPnr,
      passengerName: passengerName,
      from: flight.from || search.from || 'SGN',
      to: flight.to || search.to || 'HAN',
      route: `${flight.from || search.from || 'SGN'} ➔ ${flight.to || search.to || 'HAN'}`,
      airline: flight.airline || 'FlyNest Airlines',
      flightNumber: flight.flightNumber || 'SW-882',
      seat: seat || '10F',
      amount: totalAmount,
      amountFormatted: formattedTotal,
      paymentMethod: method,
      date: new Date().toISOString(),
      status: 'Đã Xác Nhận'
    };
    Storage.addOrder(orderRecord);

    if (window.playTakeoffSound) window.playTakeoffSound();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = loadingMsg || '⏳ Processing Payment...';
      submitBtn.style.opacity = '0.85';
    }

    setTimeout(() => {
      navigateTo('ticket.html');
    }, 650);
  }

  // Method 1 Submit: Credit Card
  if (paymentForm) {
    paymentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const numDigits = cardNumInput ? cardNumInput.value.replace(/\D/g, '') : '';
      const expVal = cardExpInput ? cardExpInput.value.trim() : '';
      const cvvVal = cardCvvInput ? cardCvvInput.value.trim() : '';
      const holderVal = cardHolderInput ? cardHolderInput.value.trim() : '';

      if (numDigits.length < 15) {
        showToast('⚠️ Vui lòng nhập đủ 16 chữ số thẻ thanh toán.');
        if (cardNumInput) cardNumInput.focus();
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(expVal)) {
        showToast('⚠️ Vui lòng nhập đúng định dạng hạn dùng (MM/YY).');
        if (cardExpInput) cardExpInput.focus();
        return;
      }
      if (cvvVal.length < 3) {
        showToast('⚠️ Vui lòng nhập mã bảo mật CVV / CVC gồm 3-4 chữ số.');
        if (cardCvvInput) cardCvvInput.focus();
        return;
      }
      if (holderVal.length < 2) {
        showToast('⚠️ Vui lòng nhập họ tên chủ thẻ in trên thẻ.');
        if (cardHolderInput) cardHolderInput.focus();
        return;
      }

      processPayment('Credit Card', btnPay, '⏳ Đang xác thực thẻ thanh toán...');
    });
  }

  // Method 2 Submit: VNPAY QR
  const btnVnpay = document.querySelector('#btn-vnpay-simulate');
  if (btnVnpay) {
    btnVnpay.addEventListener('click', (e) => {
      e.preventDefault();
      processPayment('VNPAY QR', btnVnpay, '⏳ Đang xác nhận VNPAY QR...');
    });
  }

  // Method 3 Submit: MoMo E-Wallet
  const btnMomo = document.querySelector('#btn-momo-simulate');
  if (btnMomo) {
    btnMomo.addEventListener('click', (e) => {
      e.preventDefault();
      processPayment('MoMo E-Wallet', btnMomo, '⚡ Đang xử lý giao dịch MoMo...');
    });
  }

  // Method 4 Submit: Apple Pay
  const btnApplePay = document.querySelector('#btn-apple-pay-simulate');
  if (btnApplePay) {
    btnApplePay.addEventListener('click', (e) => {
      e.preventDefault();
      processPayment('Apple Pay', btnApplePay, '<span></span> Đang xác thực Face ID...');
    });
  }

  // Method 5 Submit: ZaloPay E-Wallet
  const btnZaloPay = document.querySelector('#btn-zalopay-simulate');
  if (btnZaloPay) {
    btnZaloPay.addEventListener('click', (e) => {
      e.preventDefault();
      processPayment('ZaloPay E-Wallet', btnZaloPay, '⚡ Đang xử lý giao dịch ZaloPay...');
    });
  }

  // Method 6 Submit: Trả Góp 0% PayLater
  const btnInstallment = document.querySelector('#btn-installment-simulate');
  if (btnInstallment) {
    btnInstallment.addEventListener('click', (e) => {
      e.preventDefault();
      const phoneInput = document.querySelector('#input-installment-phone');
      if (phoneInput && phoneInput.value.replace(/\D/g, '').length < 9) {
        showToast('⚠️ Vui lòng nhập số điện thoại hợp lệ để đăng ký xét duyệt trả góp.');
        phoneInput.focus();
        return;
      }
      processPayment('Trả Góp 0% PayLater', btnInstallment, '🛍️ Đang xác thực hồ sơ trả góp...');
    });
  }
}

/* ==============================================================================
   9. PAGES/TICKET.HTML: BOARDING PASS, CRISP QR CODE & ONE-CLICK PNR COPY
   ============================================================================== */
function initTicketPage() {
  const pnrDisplay = document.querySelector('#ticket-pnr-display');
  const passengerEl = document.querySelector('#ticket-passenger-name');
  if (!pnrDisplay && !passengerEl) return;

  verifyBookingDataIntegrity('Trang Thẻ Lên Máy Bay (ticket.html)');

  const search = Storage.getSearch();
  const flight = Storage.getFlight();
  const booking = Storage.getBooking();
  const seat = Storage.getSeat();
  const storedPnr = Storage.getPnr();
  const paymentMethod = Storage.get('ngefly_payment_method') || 'Credit Card';
  const dateInfo = formatDateDisplay(flight.date || search.date);

  // Ensure 6-character PNR code
  let pnr = storedPnr;
  if (!pnr || pnr.length !== 6) {
    pnr = generatePNR(flight.flightNumber || flight.airline || 'NF');
    Storage.setPnr(pnr);
  }

  // 1. Airline Brand & Class Pill
  const airlineLogoEl = document.querySelector('#ticket-airline-logo');
  if (airlineLogoEl) {
    const logoFile = resolveAirlineLogoFilename(flight.airline, flight.airlineLogo);
    airlineLogoEl.classList.add('airline-logo');
    airlineLogoEl.innerHTML = `<img src="../assets/images/airlines/${logoFile}" alt="${flight.airline || 'FlyNest Airlines'}" class="airline-logo-img" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;" onerror="if(this.dataset.fallback){this.style.display='none';}else{this.dataset.fallback='1';this.src='../assets/images/airlines/flynest.svg';}">`;
  }
  const airlineTitleEl = document.querySelector('#ticket-airline-title');
  if (airlineTitleEl) {
    airlineTitleEl.textContent = flight.airline || 'FlyNest Airlines';
  }
  const seatClassEl = document.querySelector('#ticket-seat-class');
  const actualSeatClass = getCustomerSeatClass();
  if (seatClassEl) {
    seatClassEl.textContent = actualSeatClass;
  }

  // 2. PNR Reference Display
  if (pnrDisplay) {
    pnrDisplay.textContent = pnr;
  }

  // 3. One-Click PNR Reference Copying with Toast Notification
  const btnCopyPnr = document.querySelector('#btn-copy-pnr');
  const copyIconEl = document.querySelector('#copy-pnr-icon');

  if (btnCopyPnr) {
    btnCopyPnr.addEventListener('click', () => {
      const codeToCopy = pnrDisplay ? pnrDisplay.textContent.trim() : pnr;
      copyToClipboard(codeToCopy).then(() => {
        if (window.playClickSound) window.playClickSound();

        // Visual button feedback
        btnCopyPnr.classList.add('copied');
        if (copyIconEl) copyIconEl.textContent = '✓';

        // Elegant Toast notification
        showToast(`Đã sao chép mã đặt chỗ (PNR) <strong>${codeToCopy}</strong> vào khay nhớ tạm!`);

        setTimeout(() => {
          btnCopyPnr.classList.remove('copied');
          if (copyIconEl) copyIconEl.textContent = '📋';
        }, 2200);
      }).catch(() => {
        showToast(`Mã PNR: ${codeToCopy}`);
      });
    });
  }

  // 4. Flight Route Timeline
  const depCodeEl = document.querySelector('#ticket-dep-code');
  const depCityEl = document.querySelector('#ticket-dep-city');
  const depTimeEl = document.querySelector('#ticket-dep-time');
  const flightNoEl = document.querySelector('#ticket-flight-no');
  const durationEl = document.querySelector('#ticket-duration');
  const arrCodeEl = document.querySelector('#ticket-arr-code');
  const arrCityEl = document.querySelector('#ticket-arr-city');
  const arrTimeEl = document.querySelector('#ticket-arr-time');

  const depCode = flight.from || search.from || 'SGN';
  const arrCode = flight.to || search.to || 'HAN';

  if (depCodeEl) depCodeEl.textContent = depCode;
  if (depCityEl) depCityEl.textContent = `${getAirportShortCity(depCode)}, ${AIRPORTS[depCode]?.country || 'Việt Nam'} (${flight.terminalDep || 'Ga T1 (Quốc nội)'})`;
  if (depTimeEl) depTimeEl.textContent = flight.depTime || '07:40 AM';
  if (flightNoEl) flightNoEl.textContent = flight.flightNumber || 'SW-882';
  if (durationEl) durationEl.textContent = `Bay thẳng • Tiết kiệm ${flight.duration || '02h 10m'}`;
  if (arrCodeEl) arrCodeEl.textContent = arrCode;
  if (arrCityEl) arrCityEl.textContent = `${getAirportShortCity(arrCode)}, ${AIRPORTS[arrCode]?.country || 'Việt Nam'} (${flight.terminalArr || 'Ga Quốc Nội T1'})`;
  if (arrTimeEl) arrTimeEl.textContent = flight.arrTime || '09:50 AM';

  // 5. Grid 4: Passenger, Date, Seat, Gate
  if (passengerEl) {
    passengerEl.textContent = (booking.passengerName || 'JONATHAN BEN').toUpperCase();
  }

  const dateEl = document.querySelector('#ticket-flight-date');
  if (dateEl) {
    dateEl.textContent = dateInfo.full;
  }

  const seatEl = document.querySelector('#ticket-seat-number');
  if (seatEl) {
    const seatTypeLabel = booking.seatType || (seat?.includes('A') || seat?.includes('F') ? 'Ghế Cửa Sổ' : 'Ghế Tiêu Chuẩn');
    const seatClassShort = actualSeatClass.replace('Hạng ', '').replace(' Class', '');
    seatEl.textContent = `${seat || '10F'} (${seatTypeLabel} • ${seatClassShort})`;
  }

  const gateEl = document.querySelector('#ticket-gate-boarding');
  if (gateEl) {
    gateEl.textContent = 'B12 / 07:00 AM';
  }

  // 6. Dynamic Barcode & QR Code Token Preview
  const barcodeTextEl = document.querySelector('#ticket-barcode-text');
  const flightDateSlug = (flight.date || search.date || '2026-09-10').replace(/-/g, '');
  const flightCodeClean = (flight.flightNumber || 'SW-882').replace(/[^A-Za-z0-9]/g, '');

  if (barcodeTextEl) {
    barcodeTextEl.textContent = `${flightCodeClean}-${flightDateSlug}-${depCode}${arrCode}-${seat || '10F'}`;
  }

  const qrTokenEl = document.querySelector('#ticket-qr-token');
  if (qrTokenEl) {
    const rawPayload = `${pnr}:${depCode}${arrCode}:${seat || '10F'}`;
    const secureToken = SecurityVault.encrypt(rawPayload);
    qrTokenEl.textContent = `SECURE-TOKEN: ${secureToken}`;
  }

  // 7. Payment Verification Badge
  const paymentStatusEl = document.querySelector('#ticket-payment-status');
  if (paymentStatusEl) {
    paymentStatusEl.textContent = `Đã Thanh Toán Thành Công (${paymentMethod})`;
  }

  // 8. Item 17: Online Check-in Simulator
  const checkinPendingEl = document.querySelector('#ticket-checkin-pending');
  const checkinCompletedEl = document.querySelector('#ticket-checkin-completed');
  const btnCheckinNow = document.querySelector('#btn-checkin-now');
  
  const updateCheckinUI = () => {
    const isCheckedIn = Storage.get('flynest_checked_in') === 'true';
    if (checkinPendingEl && checkinCompletedEl) {
      if (isCheckedIn) {
        checkinPendingEl.style.display = 'none';
        checkinCompletedEl.style.display = 'block';
      } else {
        checkinPendingEl.style.display = 'flex';
        checkinCompletedEl.style.display = 'none';
      }
    }
  };
  updateCheckinUI();

  if (btnCheckinNow) {
    btnCheckinNow.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.playClickSound) window.playClickSound();
      btnCheckinNow.disabled = true;
      btnCheckinNow.innerHTML = '✈️ Đang làm thủ tục...';

      setTimeout(() => {
        Storage.set('flynest_checked_in', 'true');
        updateCheckinUI();
        btnCheckinNow.disabled = false;
        btnCheckinNow.innerHTML = '✈️ Check-in Ngay';
        if (window.FlyNestAlert) {
          window.FlyNestAlert.success('Check-in Thành Công!', 'Thủ tục lên tàu bay cho chuyến bay ' + (flight.flightNumber || 'SW-882') + ' đã hoàn tất. Thẻ lên tàu bay và mã QR đã được kích hoạt ưu tiên.');
        } else {
          showToast('✓ Check-in trực tuyến thành công! Thẻ lên tàu bay đã sẵn sàng.');
        }
      }, 900);
    });
  }

  // 9. Item 16: Toggle Security Details
  const btnToggleSecurity = document.querySelector('#btn-toggle-security-details');
  const securityDetailsEl = document.querySelector('#ticket-security-details');
  const toggleSecurityText = document.querySelector('#toggle-security-text');

  if (btnToggleSecurity && securityDetailsEl) {
    btnToggleSecurity.addEventListener('click', () => {
      const isHidden = securityDetailsEl.style.display === 'none' || !securityDetailsEl.style.display;
      if (isHidden) {
        securityDetailsEl.style.display = 'block';
        if (toggleSecurityText) toggleSecurityText.textContent = 'Thu gọn chi tiết bảo mật';
      } else {
        securityDetailsEl.style.display = 'none';
        if (toggleSecurityText) toggleSecurityText.textContent = 'Xem chi tiết bảo mật';
      }
    });
  }

  // 10. Item 13: Download PDF Button
  const btnDownloadPdf = document.querySelector('#btn-download-pdf');
  if (btnDownloadPdf) {
    btnDownloadPdf.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.playClickSound) window.playClickSound();
      const origHtml = btnDownloadPdf.innerHTML;
      btnDownloadPdf.innerHTML = '⏳ Đang khởi tạo PDF...';
      btnDownloadPdf.disabled = true;

      setTimeout(() => {
        btnDownloadPdf.innerHTML = origHtml;
        btnDownloadPdf.disabled = false;
        showToast('📄 Đang mở giao diện xuất Thẻ Lên Tàu Bay dưới dạng file PDF chuẩn IATA...');
        window.print();
      }, 700);
    });
  }

  // 11. Item 14: Apple Wallet & Google Wallet Integration
  const btnAppleWallet = document.querySelector('#btn-apple-wallet');
  if (btnAppleWallet) {
    btnAppleWallet.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.playClickSound) window.playClickSound();
      if (window.FlyNestAlert) {
        window.FlyNestAlert.success('Thêm vào Apple Wallet', `Đã đồng bộ thẻ lên tàu bay điện tử (Mã PNR: ${pnr}) vào ứng dụng Apple Wallet của bạn.`);
      } else {
        showToast(` Đã thêm thẻ lên tàu bay PNR ${pnr} vào Apple Wallet thành công!`);
      }
    });
  }

  const btnGoogleWallet = document.querySelector('#btn-google-wallet');
  if (btnGoogleWallet) {
    btnGoogleWallet.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.playClickSound) window.playClickSound();
      if (window.FlyNestAlert) {
        window.FlyNestAlert.success('Google Wallet', `Thẻ lên tàu bay điện tử (Mã PNR: ${pnr}) đã được lưu trữ an toàn vào Google Wallet.`);
      } else {
        showToast(`📱 Đã lưu thẻ lên tàu bay PNR ${pnr} vào Google Wallet thành công!`);
      }
    });
  }

  // 12. Item 15: Resend Ticket via Email / SMS Modal
  const btnResendTicket = document.querySelector('#btn-resend-ticket');
  const modalResendTicket = document.querySelector('#modal-resend-ticket');
  const btnCloseResendModal = document.querySelector('#btn-close-resend-modal');
  const formResendTicket = document.querySelector('#form-resend-ticket');
  const tabResendEmail = document.querySelector('#tab-resend-email');
  const tabResendSms = document.querySelector('#tab-resend-sms');
  const groupResendEmail = document.querySelector('#group-resend-email');
  const groupResendSms = document.querySelector('#group-resend-sms');
  const inputResendEmail = document.querySelector('#input-resend-email');
  const inputResendPhone = document.querySelector('#input-resend-phone');
  let currentResendChannel = 'email';

  if (btnResendTicket && modalResendTicket) {
    btnResendTicket.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.playClickSound) window.playClickSound();
      if (inputResendEmail && !inputResendEmail.value) {
        inputResendEmail.value = booking.passengerEmail || 'jonathan.ben@flynest.vn';
      }
      if (inputResendPhone && !inputResendPhone.value) {
        inputResendPhone.value = booking.passengerPhone || '0988 888 888';
      }
      modalResendTicket.style.display = 'flex';
    });

    if (btnCloseResendModal) {
      btnCloseResendModal.addEventListener('click', () => {
        modalResendTicket.style.display = 'none';
      });
    }

    modalResendTicket.addEventListener('click', (e) => {
      if (e.target === modalResendTicket) {
        modalResendTicket.style.display = 'none';
      }
    });

    if (tabResendEmail && tabResendSms) {
      tabResendEmail.addEventListener('click', () => {
        currentResendChannel = 'email';
        tabResendEmail.style.background = 'var(--accent-orange)';
        tabResendEmail.style.color = '#ffffff';
        tabResendSms.style.background = 'transparent';
        tabResendSms.style.color = 'var(--text-muted)';
        if (groupResendEmail) groupResendEmail.style.display = 'block';
        if (groupResendSms) groupResendSms.style.display = 'none';
        if (inputResendEmail) inputResendEmail.required = true;
        if (inputResendPhone) inputResendPhone.required = false;
      });

      tabResendSms.addEventListener('click', () => {
        currentResendChannel = 'sms';
        tabResendSms.style.background = 'var(--accent-orange)';
        tabResendSms.style.color = '#ffffff';
        tabResendEmail.style.background = 'transparent';
        tabResendEmail.style.color = 'var(--text-muted)';
        if (groupResendEmail) groupResendEmail.style.display = 'none';
        if (groupResendSms) groupResendSms.style.display = 'block';
        if (inputResendEmail) inputResendEmail.required = false;
        if (inputResendPhone) inputResendPhone.required = true;
      });
    }

    if (formResendTicket) {
      formResendTicket.addEventListener('submit', (e) => {
        e.preventDefault();
        const btnSubmit = formResendTicket.querySelector('#btn-submit-resend');
        const origText = btnSubmit.innerHTML;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '⚡ Đang gửi thông tin vé...';

        setTimeout(() => {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = origText;
          modalResendTicket.style.display = 'none';

          const targetDestination = currentResendChannel === 'email' 
            ? (inputResendEmail ? inputResendEmail.value : 'hộp thư của bạn')
            : (inputResendPhone ? inputResendPhone.value : 'số điện thoại của bạn');

          if (window.FlyNestAlert) {
            window.FlyNestAlert.success('Đã Gửi Thành Công!', `Thẻ lên tàu bay điện tử và mã QR đã được gửi đến: ${targetDestination}`);
          } else {
            showToast(`✓ Đã gửi lại vé điện tử và mã QR tới ${targetDestination}!`);
          }
        }, 900);
      });
    }
  }

  // 13. Print Boarding Pass Button Listener
  const btnPrintPass = document.querySelector('#btn-print-pass');
  if (btnPrintPass) {
    btnPrintPass.addEventListener('click', (e) => {
      e.preventDefault();
      window.print();
    });
  }
}

/* ==============================================================================
   10. MOBILE NAVIGATION DRAWER
   ============================================================================== */
function initMobileDrawer() {
  let toggleBtn = document.querySelector('.mobile-nav-toggle');
  const header = document.querySelector('.ngefly-header, header');
  if (!header) return;

  // If toggle button doesn't exist in HTML, dynamically inject into header-right
  if (!toggleBtn) {
    const headerRight = header.querySelector('.header-right');
    if (headerRight) {
      toggleBtn = document.createElement('button');
      toggleBtn.className = 'mobile-nav-toggle';
      toggleBtn.setAttribute('aria-label', 'Toggle mobile menu');
      toggleBtn.innerHTML = '<span></span><span></span><span></span>';
      headerRight.appendChild(toggleBtn);
    }
  }

  // Create or select backdrop & drawer
  let backdrop = document.querySelector('.mobile-drawer-backdrop');
  let drawer = document.querySelector('.mobile-drawer');

  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'mobile-drawer-backdrop';
    document.body.appendChild(backdrop);
  }

  if (!drawer) {
    drawer = document.createElement('div');
    drawer.className = 'mobile-drawer';

    const isInsidePages = window.location.pathname.includes('/pages/');
    const isInsideAdmin = window.location.pathname.includes('/admin/');
    const basePath = (isInsidePages || isInsideAdmin) ? '../' : '';
    const pagesPath = isInsidePages ? '' : (isInsideAdmin ? '../pages/' : 'pages/');

    drawer.innerHTML = `
      <div class="drawer-header">
        <a href="${basePath}index.html" class="logo-wrap">
          <span class="logo-icon-svg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
            </svg>
          </span>
          <span class="logo-brand">Sky<span class="logo-accent">Wings</span></span>
        </a>
        <button class="drawer-close-btn" aria-label="Close menu">✕</button>
      </div>
      <ul class="drawer-nav-list">
        <li><a href="${basePath}index.html">🏠 Trang Chủ</a></li>
        <li><a href="${pagesPath}flights.html">✈️ Tất Cả Chuyến Bay</a></li>
        <li><a href="${pagesPath}flights.html?view=schedule">📅 Lịch Trình Bay</a></li>
        <li><a href="${pagesPath}booking.html">👤 Đặt Chỗ (Thông Tin Khách)</a></li>
        <li><a href="${pagesPath}seats.html">💺 Chọn Chỗ Ngồi</a></li>
        <li><a href="${pagesPath}ticket.html">🎫 Thẻ Lên Tàu Bay (PNR)</a></li>
        <li><a href="${basePath}admin/index.html" style="color: var(--accent-orange);">📊 Quản Trị Hệ Thống</a></li>
      </ul>
      <div class="drawer-perf-section" style="padding: 0.75rem 1.25rem; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-dark);">⚡ Chế độ máy yếu</span>
        <button type="button" class="btn-perf-toggle" title="Bật hoặc tắt chế độ tối ưu máy yếu" aria-label="Bật hoặc tắt chế độ tối ưu máy yếu">⚡</button>
      </div>
      <div class="drawer-footer">
        <a href="${pagesPath}login.html" class="btn-signin" style="text-align: center;">Đăng Nhập</a>
        <a href="${pagesPath}register.html" class="btn-signup-pill" style="justify-content: center;">Đăng Ký</a>
      </div>
    `;
    document.body.appendChild(drawer);
  }

  const closeBtn = drawer.querySelector('.drawer-close-btn');

  function openDrawer() {
    if (window.playClickSound) window.playClickSound();
    drawer.classList.add('active');
    backdrop.classList.add('active');
    if (toggleBtn) toggleBtn.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    if (toggleBtn) toggleBtn.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (drawer.classList.contains('active')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeDrawer();
    }
  });
}

/* ==============================================================================
   11. SMOOTH PAGE TRANSITIONS & FLUID NAVIGATION INTERCEPTOR
   ============================================================================== */
function navigateTo(url) {
  if (!url) return;
  // UI-037: Chống double-trigger / click dồn dập
  if (window.__isTakingOff || window.__navigating) return;

  // UI-037 & P0 Security: Kiểm tra quyền Admin trước khi kích hoạt chuyển trang
  const isAdminTarget = url.includes('admin/') || url.includes('/admin') || url.endsWith('admin/index.html');
  if (isAdminTarget) {
    const currentUser = (typeof Storage !== 'undefined' && Storage.getUser) ? Storage.getUser() : null;
    const hasAdminRole = Boolean(currentUser && currentUser.role === 'admin');
    if (!hasAdminRole) {
      if (typeof showToast === 'function') {
        const warningMsg = currentUser
          ? '⛔ Quyền truy cập bị từ chối (403 Forbidden): Tài khoản này không có quyền Quản Trị Viên!'
          : '⚠️ Vui lòng đăng nhập phiên Quản Trị Viên (Admin Demo) để tiếp tục.';
        showToast(warningMsg, 4000);
      }
      const isInsidePages = window.location.pathname.includes('/pages/');
      const loginRedirectUrl = (isInsidePages ? 'login.html' : 'pages/login.html') + '?redirect=admin';
      url = loginRedirectUrl;
    }
  }

  const currentClean = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const targetClean = (url.split('#')[0].split('?')[0].split('/').pop() || 'index.html').toLowerCase();

  // If already on the same page with query changes only, handle directly
  if (currentClean === targetClean && (url.includes('?view=schedule') || (!url.includes('?') && window.location.search.includes('view=schedule')))) {
    window.location.href = url;
    return;
  }

  // Nếu đang ở trang chủ có phi cơ 3D, ưu tiên cất cánh bay thẳng lên trời (UI-037: bao gồm cả Trang Chủ, Chuyến Bay, Lịch Trình, Đặt Chỗ, Vé Của Bạn, Quản Trị)
  if (window.__planeGroup && typeof window.triggerAirplaneTakeoffAndNavigate === 'function' && !window.__isTakingOff) {
    window.triggerAirplaneTakeoffAndNavigate(url);
    return;
  }

  window.__navigating = true;
  let bar = document.getElementById('page-progress-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'page-progress-bar';
    document.body.appendChild(bar);
  }

  if (window.playClickSound) window.playClickSound();

  // Kick off airplane progress bar
  bar.style.opacity = '1';
  bar.style.transition = 'width 0.26s cubic-bezier(0.16, 1, 0.3, 1)';
  bar.style.width = '75%';

  // Smooth cinematic exit animation (fade & glide out)
  document.body.classList.add('page-is-navigating');

  setTimeout(() => {
    bar.style.width = '100%';
    setTimeout(() => {
      window.location.href = url;
    }, 60);
  }, 220);
}

if (typeof window !== 'undefined') {
  window.navigateTo = navigateTo;
}

function initSmoothPageTransitions() {
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  if (currentFile === 'index.html' || currentFile === '') {
    document.body.classList.add('home-page');
  }

  let bar = document.getElementById('page-progress-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'page-progress-bar';
    document.body.appendChild(bar);
  }

  // Smooth bloom-in entrance transition on page load
  document.body.classList.add('page-entering');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.remove('page-entering');
      setTimeout(() => {
        document.body.style.transform = 'none';
        document.body.style.filter = 'none';
      }, 420);
    });
  });

  // Smooth progress bar complete on page load
  bar.style.opacity = '1';
  bar.style.width = '100%';
  setTimeout(() => {
    bar.style.opacity = '0';
    setTimeout(() => {
      bar.style.width = '0%';
    }, 200);
  }, 220);

  // Intercept internal page links, CTA buttons, and header navigation (UI-037)
  document.addEventListener('click', (e) => {
    // 1. Nút tìm kiếm chuyến bay CTA trên thanh tìm kiếm
    const ctaBtn = e.target.closest('#floating-search-bar button[type="submit"], #cta-search-btn, .search-submit-btn, #btn-search-submit');
    if (ctaBtn) {
      if (window.__isTakingOff || window.__navigating) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      navigateTo('pages/flights.html');
      return;
    }

    // 2. Liên kết điều hướng nội bộ
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Ngoại lệ không can thiệp (Master Plan Section 5)
    if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank' || link.hasAttribute('download')) {
      return;
    }

    const isLocal = href.includes('.html') || href.startsWith('./') || href.startsWith('../') || href.startsWith('pages/') || href.startsWith('admin/') || href === 'index.html';
    if (!isLocal) return;

    const targetFile = href.split('?')[0].split('#')[0].split('/').pop() || 'index.html';

    if (currentFile === targetFile && currentFile.includes('flights.html')) {
      return;
    }

    // Chống double-click dồn dập
    if (window.__isTakingOff || window.__navigating) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    navigateTo(href);
  });

  window.addEventListener('pageshow', () => {
    window.__isTakingOff = false;
    window.__navigating = false;
    window.__navigated = false;
    document.body.classList.remove('page-is-navigating');
    document.body.classList.remove('page-entering');
    document.body.style.transform = 'none';
    document.body.style.filter = 'none';
    if (bar) {
      bar.style.width = '100%';
      setTimeout(() => {
        bar.style.opacity = '0';
        bar.style.width = '0%';
      }, 180);
    }
  });
}

/* ==============================================================================
   13. INERTIAL MOMENTUM SMOOTH SCROLLING (LENIS / LOCOMOTIVE STYLE) - DISABLED
   ============================================================================== */
function initInertialSmoothScroll() {
  // Hiệu ứng cuộn chuột quán tính (Inertial Smooth Scroll) đã được gỡ bỏ theo yêu cầu người dùng.
  // Trình duyệt sẽ sử dụng cơ chế cuộn chuột tự nhiên (native scroll) mượt mà, phản hồi tức thì và không bị trễ/trôi trang.
}

/* ==============================================================================
   14. SCROLL REVEALS & STAGGERED ENTRANCE (AS SEEN IN VIDEO)
   ============================================================================== */
function initScrollReveal() {
  // Auto-stagger children ONLY in explicit presentation grids (never forms or cards)
  const containers = document.querySelectorAll(
    '.features-grid, .scroll-reveal-stagger'
  );

  containers.forEach(container => {
    // Safety: never stagger forms, white panels, or containers with inputs
    if (container.closest('form, #passenger-info-card, .white-panel-card') || container.querySelector('input, select, textarea, button')) {
      return;
    }
    const children = Array.from(container.children);
    children.forEach((child, index) => {
      child.style.setProperty('--reveal-index', index);
      if (!child.classList.contains('scroll-reveal')) {
        child.classList.add('scroll-reveal');
      }
    });
  });

  const rawRevealElements = document.querySelectorAll(
    '.scroll-reveal, .deal-card, .feature-item-card, .why-us-card, .stat-card, .stepper-item, .flight-summary-card'
  );

  // Safety filter: ensure form controls, labels, and form parents are never hidden by scroll reveals
  const revealElements = Array.from(rawRevealElements).filter(el => {
    if (el.matches('input, select, textarea, label, button, .field-input-wrapper, .booking-field-input, .auth-input-control')) {
      el.classList.remove('scroll-reveal');
      return false;
    }
    if (el.closest('form, #passenger-info-card, .payment-panel')) {
      el.classList.remove('scroll-reveal');
      return false;
    }
    return true;
  });

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.10,
    rootMargin: '0px 0px -30px 0px'
  });

  revealElements.forEach(el => {
    if (!el.classList.contains('scroll-reveal')) {
      el.classList.add('scroll-reveal');
    }
    observer.observe(el);
  });
}

/* ==============================================================================
   15. FLOATING PILL HEADER DOCK CONTROLLER
   ============================================================================== */
function initFloatingPillHeader() {
  const header = document.querySelector('.ngefly-header');
  if (!header) return;

  let headerRaf = null;
  let lastScrolledState = null;
  function updateHeaderState() {
    if (headerRaf) return;
    headerRaf = requestAnimationFrame(() => {
      headerRaf = null;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const shouldBeScrolled = (scrollY > 25);
      if (shouldBeScrolled !== lastScrolledState) {
        lastScrolledState = shouldBeScrolled;
        if (shouldBeScrolled) {
          header.classList.add('header-scrolled');
        } else {
          header.classList.remove('header-scrolled');
        }
      }
    });
  }

  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();
}

/**
 * Dynamic Active Navbar Controller
 * Synchronizes active tab highlight with the exact route and query parameter (?view=schedule)
 */
function initNavbarActiveState() {
  const currentPath = (window.location.pathname || '').toLowerCase();
  const currentSearch = (window.location.search || '').toLowerCase();

  // Redirect legacy flights.html?view=schedule cleanly to dedicated schedule.html
  if (currentPath.includes('flights.html') && currentSearch.includes('view=schedule')) {
    window.location.replace('schedule.html');
    return;
  }

  const isSchedule = currentPath.includes('schedule.html') || currentSearch.includes('view=schedule') || window.location.hash === '#schedule';
  const isFlights = (currentPath.includes('flights.html') || currentPath.endsWith('/flights')) && !isSchedule;
  const isBooking = currentPath.includes('booking.html') || currentPath.includes('seats.html') || currentPath.includes('payment.html');
  const isTicket = currentPath.includes('ticket.html');
  const isAdmin = currentPath.includes('admin');
  const isHome = !isSchedule && !isFlights && !isBooking && !isTicket && !isAdmin;

  const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
  if (!navLinks.length) return;

  // Clear any pre-existing active class
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.parentElement && link.parentElement.classList.contains('nav-item')) {
      link.parentElement.classList.remove('active');
    }
  });

  navLinks.forEach(link => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    const text = link.textContent.trim();
    let match = false;

    if (isSchedule && (href.includes('schedule.html') || href.includes('view=schedule') || text === 'Lịch Trình')) {
      match = true;
    } else if (isFlights && href.includes('flights.html') && !href.includes('schedule.html') && !href.includes('view=schedule') && text === 'Chuyến Bay') {
      match = true;
    } else if (isBooking && (href.includes('booking.html') || text === 'Đặt Chỗ' || text === 'Hành Khách')) {
      match = true;
    } else if (isTicket && (href.includes('ticket.html') || text === 'Vé Của Bạn')) {
      match = true;
    } else if (isAdmin && (href.includes('admin') || text.includes('Quản Trị'))) {
      match = true;
    } else if (isHome && (href.endsWith('index.html') || href === '../index.html' || href === './index.html' || href === 'index.html' || href === '/' || text === 'Trang Chủ')) {
      match = true;
    }

    if (match) {
      link.classList.add('active');
      if (link.parentElement && link.parentElement.classList.contains('nav-item')) {
        link.parentElement.classList.add('active');
      }
    }
  });
}

/* ==============================================================================
   19. PAGES/SCHEDULE.HTML: TIMETABLE MATRIX & FIDS FLIGHT LOOKUP CONTROLLER
   ============================================================================== */
function initSchedulePage() {
  const tableBody = document.querySelector('#schedule-table-body');
  if (!tableBody) return;

  const clockEl = document.querySelector('#live-system-clock');
  const codeInput = document.querySelector('#search-flight-code');
  const routeSelect = document.querySelector('#filter-schedule-route');
  const dayTabs = document.querySelectorAll('#schedule-day-tabs .sched-day-pill');
  const countEl = document.querySelector('#schedule-results-count');
  const emptyState = document.querySelector('#schedule-empty-state');
  const btnReset = document.querySelector('#btn-reset-schedule-filter');
  const btnClearEmpty = document.querySelector('#btn-clear-empty-search');
  const btnRefresh = document.querySelector('#btn-refresh-schedule');

  // 1. Live System Clock (GMT+7) & Analog Clock Hands
  const handHour = document.querySelector('#clock-hand-hour');
  const handMinute = document.querySelector('#clock-hand-minute');
  const handSecond = document.querySelector('#clock-hand-second');

  function updateClock() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    if (clockEl) {
      clockEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    if (handHour && handMinute && handSecond) {
      const secondDeg = (s / 60) * 360;
      const minuteDeg = ((m + s / 60) / 60) * 360;
      const hourDeg = (((h % 12) + m / 60) / 12) * 360;

      handSecond.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;
      handMinute.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
      handHour.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    }
  }
  updateClock();
  const schedClockTimer = setInterval(updateClock, 1000);
  window.addEventListener('beforeunload', () => clearInterval(schedClockTimer), { once: true });

  // 2. Filter Table Function & Mobile Cards Sync
  let activeDay = 'ALL';
  function applyScheduleFilters() {
    const codeQuery = (codeInput?.value || '').trim().toUpperCase();
    const routeQuery = (routeSelect?.value || 'ALL').toUpperCase();
    const rows = Array.from(tableBody.querySelectorAll('.schedule-row'));
    const mobileCards = Array.from(document.querySelectorAll('.sched-mobile-card'));
    let matchCount = 0;

    rows.forEach(row => {
      const code = (row.getAttribute('data-code') || '').toUpperCase();
      const route = (row.getAttribute('data-route') || '').toUpperCase();
      const days = (row.getAttribute('data-days') || '').split(',');

      const matchCode = !codeQuery || code.includes(codeQuery);
      const matchRoute = routeQuery === 'ALL' || route === routeQuery;
      const matchDay = activeDay === 'ALL' || days.includes(activeDay);

      if (matchCode && matchRoute && matchDay) {
        row.style.display = '';
        matchCount++;
      } else {
        row.style.display = 'none';
      }
    });

    mobileCards.forEach(card => {
      const code = (card.getAttribute('data-code') || card.querySelector('strong')?.textContent || '').trim().toUpperCase();
      const route = (card.getAttribute('data-route') || '').toUpperCase();
      const days = (card.getAttribute('data-days') || '').split(',');

      const matchCode = !codeQuery || code.includes(codeQuery);
      const matchRoute = routeQuery === 'ALL' || !route || route === routeQuery;
      const matchDay = activeDay === 'ALL' || days.includes(activeDay);

      card.style.display = (matchCode && matchRoute && matchDay) ? '' : 'none';
    });

    const matrixRows = Array.from(document.querySelectorAll('.schedule-matrix-row'));
    matrixRows.forEach(row => {
      const code = (row.getAttribute('data-code') || '').toUpperCase();
      const route = (row.getAttribute('data-route') || '').toUpperCase();
      const days = (row.getAttribute('data-days') || '').split(',');

      const matchCode = !codeQuery || code.includes(codeQuery);
      const matchRoute = routeQuery === 'ALL' || route === routeQuery;
      const matchDay = activeDay === 'ALL' || days.includes(activeDay);

      row.style.display = (matchCode && matchRoute && matchDay) ? '' : 'none';
    });

    if (countEl) {
      countEl.textContent = `Hiển thị ${matchCount} chuyến bay cố định theo bộ lọc hiện tại`;
    }

    if (emptyState) {
      emptyState.style.display = matchCount === 0 ? 'block' : 'none';
    }
  }

  // 3. Events
  if (codeInput) {
    codeInput.addEventListener('input', applyScheduleFilters);
  }

  if (routeSelect) {
    routeSelect.addEventListener('change', applyScheduleFilters);
  }

  dayTabs.forEach(pill => {
    pill.addEventListener('click', () => {
      dayTabs.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeDay = pill.getAttribute('data-day') || 'ALL';
      applyScheduleFilters();
    });
  });

  function resetFilters() {
    if (codeInput) codeInput.value = '';
    if (routeSelect) routeSelect.value = 'ALL';
    activeDay = 'ALL';
    dayTabs.forEach(p => {
      if (p.getAttribute('data-day') === 'ALL') p.classList.add('active');
      else p.classList.remove('active');
    });
    applyScheduleFilters();
  }

  if (btnReset) btnReset.addEventListener('click', resetFilters);
  if (btnClearEmpty) btnClearEmpty.addEventListener('click', resetFilters);

  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      btnRefresh.innerHTML = '<span>⏳</span> Đang tải...';
      setTimeout(() => {
        btnRefresh.innerHTML = '<span>✓</span> Đã Cập Nhật';
        applyScheduleFilters();
        setTimeout(() => {
          btnRefresh.innerHTML = '<span>🔄</span> Làm Mới Giờ Bay';
        }, 1200);
      }, 400);
    });
  }

  // Check URL query parameters for direct flight lookup
  const urlParams = new URLSearchParams(window.location.search);
  const flightParam = urlParams.get('flight') || urlParams.get('code');
  const routeParam = urlParams.get('route');
  if (flightParam && codeInput) {
    codeInput.value = flightParam;
  }
  if (routeParam && routeSelect) {
    routeSelect.value = routeParam;
  }
  applyScheduleFilters();
}


/* ==============================================================================
   13. CENTRAL AUTHENTICATION & USER PROFILE CONTROLLER
   ============================================================================== */
function initAuthUI() {
  const user = Storage.getUser();
  const isInsidePages = window.location.pathname.includes('/pages/');
  const isInsideAdmin = window.location.pathname.includes('/admin/');
  const basePath = (isInsidePages || isInsideAdmin) ? '../' : '';
  const pagesPath = isInsidePages ? '' : (isInsideAdmin ? '../pages/' : 'pages/');
  const adminPath = isInsideAdmin ? 'index.html' : (isInsidePages ? '../admin/index.html' : 'admin/index.html');

  // 1. Desktop Navbar Auth State
  const headerRight = document.querySelector('.header-right');
  if (headerRight) {
    // Remove existing capsule if re-rendering
    const existingCapsule = headerRight.querySelector('.user-account-menu-wrap');
    if (existingCapsule) existingCapsule.remove();

    const signinBtn = headerRight.querySelector('.btn-signin');
    const signupBtn = headerRight.querySelector('.btn-signup-pill');

    if (user) {
      // Hide static login/signup
      if (signinBtn) signinBtn.style.display = 'none';
      if (signupBtn) signupBtn.style.display = 'none';

      const initials = user.avatar || user.name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase();
      const capsule = document.createElement('div');
      capsule.className = 'user-account-menu-wrap';
      capsule.innerHTML = `
        <button type="button" class="user-capsule-btn" id="user-menu-toggle" aria-expanded="false" title="Tài khoản ${user.name}">
          <div class="user-avatar-badge">${initials}</div>
          <div class="user-info-preview">
            <span class="user-name">${user.name}</span>
            <span class="user-badge-gold">⭐ ${(user.skyMiles || 2450).toLocaleString()} SkyMiles</span>
          </div>
          <span class="dropdown-chevron">▾</span>
        </button>
        <div class="user-dropdown-popover" id="user-dropdown-menu">
          <div class="user-popover-header">
            <div class="user-popover-avatar">${initials}</div>
            <div class="user-popover-meta">
              <div class="user-popover-name">${user.name}</div>
              <div class="user-popover-email">${user.email}</div>
              <span class="user-popover-tag">${user.tier || 'Hội viên Vàng'}</span>
            </div>
          </div>
          <div class="user-popover-divider"></div>
          <ul class="user-popover-links">
            <li>
              <a href="${pagesPath}ticket.html">
                <span class="popover-icon">🎫</span>
                <div class="popover-link-text">
                  <strong>Vé Máy Bay Của Tôi</strong>
                  <small>Xem mã PNR và thẻ lên tàu bay</small>
                </div>
              </a>
            </li>
            <li>
              <a href="${pagesPath}booking.html">
                <span class="popover-icon">✈️</span>
                <div class="popover-link-text">
                  <strong>Đặt Chỗ Hành Khách</strong>
                  <small>Thông tin vé & Hạng dịch vụ</small>
                </div>
              </a>
            </li>
            <li>
              <a href="javascript:void(0)" id="popover-skymiles-btn">
                <span class="popover-icon">⭐</span>
                <div class="popover-link-text">
                  <strong>SkyMiles Rewards</strong>
                  <small>${(user.skyMiles || 2450).toLocaleString()} dặm thưởng tích lũy</small>
                </div>
              </a>
            </li>
            <li>
              <a href="${adminPath}" style="color: var(--accent-orange);">
                <span class="popover-icon">📊</span>
                <div class="popover-link-text">
                  <strong style="color: var(--accent-orange);">Cổng Quản Trị Hệ Thống</strong>
                  <small>Quản lý chuyến bay & Doanh thu</small>
                </div>
              </a>
            </li>
          </ul>
          <div class="user-popover-divider"></div>
          <div class="user-popover-footer">
            <button type="button" id="auth-logout-btn" class="btn-logout-popover">
              <span>🚪</span> Đăng Xuất Tài Khoản
            </button>
          </div>
        </div>
      `;
      headerRight.appendChild(capsule);

      // Toggle Popover
      const toggleBtn = capsule.querySelector('#user-menu-toggle');
      const dropdown = capsule.querySelector('#user-dropdown-menu');

      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('active');
        dropdown.classList.toggle('active');
        toggleBtn.setAttribute('aria-expanded', !isOpen);
        if (window.playClickSound) window.playClickSound();
      });

      document.addEventListener('click', (e) => {
        if (!capsule.contains(e.target)) {
          dropdown.classList.remove('active');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // SkyMiles Toast Info
      const skyMilesBtn = capsule.querySelector('#popover-skymiles-btn');
      if (skyMilesBtn) {
        skyMilesBtn.addEventListener('click', () => {
          showToast(`⭐ Bạn đang có ${(user.skyMiles || 2450).toLocaleString()} dặm SkyMiles. Tích thêm 550 dặm để nâng hạng Platinum!`, 4000);
        });
      }

      // Logout handler
      const logoutBtn = capsule.querySelector('#auth-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          Storage.logout();
          showToast('✅ Đã đăng xuất tài khoản thành công.', 3000);
          const currentCapsule = headerRight.querySelector('.user-account-menu-wrap');
          if (currentCapsule) currentCapsule.remove();
          if (signinBtn) signinBtn.style.display = '';
          if (signupBtn) signupBtn.style.display = '';
          initAuthUI();
          updateMobileDrawerAuth();
          setTimeout(() => {
            window.location.reload();
          }, 350);
        });
      }
    } else {
      // User is logged out
      if (signinBtn) signinBtn.style.display = '';
      if (signupBtn) signupBtn.style.display = '';
      const existingCapsule = headerRight.querySelector('.user-account-menu-wrap');
      if (existingCapsule) existingCapsule.remove();
    }
  }

  // 2. Mobile Drawer Auth State
  function updateMobileDrawerAuth() {
    const drawerFooter = document.querySelector('.drawer-footer');
    if (!drawerFooter) return;

    const currentUser = Storage.getUser();
    if (currentUser) {
      const initials = currentUser.avatar || currentUser.name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase();
      drawerFooter.innerHTML = `
        <div class="drawer-user-card">
          <div class="drawer-user-avatar">${initials}</div>
          <div class="drawer-user-details">
            <div class="drawer-user-name">${currentUser.name}</div>
            <div class="drawer-user-tag">⭐ ${(currentUser.skyMiles || 2450).toLocaleString()} SkyMiles (${currentUser.tier || 'Gold'})</div>
          </div>
        </div>
        <button type="button" id="drawer-logout-btn" class="btn-drawer-logout">🚪 Đăng Xuất</button>
      `;
      const drawerLogout = drawerFooter.querySelector('#drawer-logout-btn');
      if (drawerLogout) {
        drawerLogout.addEventListener('click', (e) => {
          e.preventDefault();
          Storage.logout();
          showToast('✅ Đã đăng xuất tài khoản thành công.', 3000);
          initAuthUI();
          updateMobileDrawerAuth();
          setTimeout(() => {
            window.location.reload();
          }, 350);
        });
      }
    } else {
      drawerFooter.innerHTML = `
        <a href="${pagesPath}login.html" class="btn-signin" style="text-align: center;">Đăng Nhập</a>
        <a href="${pagesPath}register.html" class="btn-signup-pill" style="justify-content: center;">Đăng Ký</a>
      `;
    }
  }
  updateMobileDrawerAuth();

  // 3. Login Page Specific Logic (P0-01 & P1-01 fix: single submit, double-submit protection, admin role check)
  const loginForm = document.querySelector('#login-form') || document.querySelector('.auth-card-ngefly form');
  const isLoginPage = window.location.pathname.toLowerCase().includes('login.html') || document.querySelector('#login-form') !== null;
  if (isLoginPage && loginForm) {
    let isSubmitting = false;

    // SEC-002: Prototype Authentication & Authorization Logic
    // Security Architecture Boundary:
    // Client-side code CANNOT and MUST NOT determine administrative privileges based on email string matching.
    // In this prototype, all regular form submissions default strictly to the 'customer' role.
    // An explicit admin session is ONLY instantiated when customRole is explicitly specified as 'admin'
    // via the dedicated prototype testing helper (#btn-quick-admin-login) for demo/evaluation purposes.
    const performLogin = (email, customName, customRole) => {
      const isExplicitDemoAdmin = customRole === 'admin';
      const role = isExplicitDemoAdmin ? 'admin' : 'customer';
      let userName = customName || (isExplicitDemoAdmin ? 'Quản Trị Hệ Thống FlyNest (Demo)' : 'Jonathan Ben');

      if (!isExplicitDemoAdmin && !customName) {
        if (email.toLowerCase().includes('alex')) userName = 'Alex Rivera';
        else if (email.toLowerCase().includes('sarah')) userName = 'Sarah Jenkins';
        else if (email.toLowerCase().includes('david')) userName = 'David Miller';
        else if (!email.toLowerCase().includes('jonathan.ben')) {
          const prefix = email.split('@')[0].replace(/[._-]/g, ' ');
          userName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }
      }

      const userData = {
        id: Date.now(),
        name: userName,
        email: email,
        phone: '+84 901 234 567',
        role: role,
        roleTitle: role === 'admin' ? 'Quản Trị Viên Hệ Thống (Demo)' : 'Khách hàng FlyNest VIP',
        skyMiles: role === 'admin' ? 99999 : 2450,
        tier: role === 'admin' ? 'Diamond Admin' : 'Hội viên Vàng',
        avatar: userName.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
      };

      Storage.setUser(userData);
      showToast(`✅ Đăng nhập thành công! Chào mừng ${userName} (${role === 'admin' ? 'Quản Trị Viên' : 'Hội Viên'}).`, 3000);
      if (window.playClickSound) window.playClickSound();

      // Check for redirect param
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTarget = urlParams.get('redirect') || urlParams.get('next');

      let target = isInsidePages ? '../index.html' : 'index.html';
      if (role === 'admin') {
        target = isInsidePages ? '../admin/index.html' : 'admin/index.html';
      } else if (redirectTarget && (redirectTarget.includes('admin') || redirectTarget === 'admin')) {
        // Customer trying to redirect to admin: route them to home since customer lacks admin authorization
        target = isInsidePages ? '../index.html' : 'index.html';
      }

      setTimeout(() => {
        window.location.href = target;
      }, 350);
    };

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      const submitBtn = loginForm.querySelector('button[type="submit"], .btn-view-details');
      if (submitBtn) submitBtn.disabled = true;
      isSubmitting = true;

      const emailInput = document.querySelector('#login-email');
      const email = emailInput && emailInput.value.trim() ? emailInput.value.trim() : 'jonathan.ben@example.com';
      // Regular customer authentication: customRole is omitted so role is ALWAYS 'customer'
      performLogin(email);
    });

    // Quick Admin Login Helper Button (Dedicated Prototype Admin Demo Session)
    const btnQuickAdmin = document.querySelector('#btn-quick-admin-login');
    if (btnQuickAdmin) {
      btnQuickAdmin.addEventListener('click', (e) => {
        e.preventDefault();
        performLogin('admin-demo@flynest.vn', 'Quản Trị Hệ Thống FlyNest (Demo)', 'admin');
      });
    }

    // Social login buttons on login page
    document.querySelectorAll('.auth-card-ngefly .btn-social-auth').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        performLogin('jonathan.ben@example.com', 'Jonathan Ben', 'customer');
      };
    });
  }

  // 4. Register Page Specific Logic (P1-01 fix: single submit listener)
  const registerForm = document.querySelector('#register-form') || (!isLoginPage ? document.querySelector('.auth-card-ngefly form') : null);
  const isRegisterPage = window.location.pathname.toLowerCase().includes('register.html') || document.querySelector('#reg-name') !== null;
  if (isRegisterPage && registerForm) {
    let isRegSubmitting = false;

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (isRegSubmitting) return;

      const regSubmitBtn = registerForm.querySelector('button[type="submit"], .btn-view-details');
      if (regSubmitBtn) regSubmitBtn.disabled = true;
      isRegSubmitting = true;

      const nameInput = document.querySelector('#reg-name');
      const emailInput = document.querySelector('#reg-email');
      const phoneInput = document.querySelector('#reg-phone');

      const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Hành Khách Mới';
      const email = emailInput && emailInput.value.trim() ? emailInput.value.trim() : 'member@flynest.vn';
      const phone = phoneInput && phoneInput.value.trim() ? phoneInput.value.trim() : '+84 901 234 567';

      const userData = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        role: 'customer',
        roleTitle: 'Thành viên Mới',
        skyMiles: 500, // 500 Welcome Bonus SkyMiles!
        tier: 'Hội viên Bạc',
        avatar: name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
      };

      Storage.setUser(userData);
      showToast(`🎉 Đăng ký thành công! Bạn nhận được +500 dặm bay SkyMiles chào mừng.`, 3000);
      if (window.playClickSound) window.playClickSound();

      const target = isInsidePages ? '../index.html' : 'index.html';
      setTimeout(() => {
        window.location.href = target;
      }, 350);
    });

    // Social buttons on register page
    document.querySelectorAll('.auth-card-ngefly .btn-social-auth').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const userData = {
          id: 102,
          name: 'Jonathan Ben',
          email: 'jonathan.ben@example.com',
          phone: '+84 901 234 567',
          role: 'customer',
          roleTitle: 'Khách hàng FlyNest VIP',
          skyMiles: 1000,
          tier: 'Hội viên Vàng',
          avatar: 'JB'
        };
        Storage.setUser(userData);
        showToast('🎉 Kết nối tài khoản thành công! Nhận ngay +1,000 SkyMiles thưởng.', 3000);
        if (window.playClickSound) window.playClickSound();
        const target = isInsidePages ? '../index.html' : 'index.html';
        setTimeout(() => {
          window.location.href = target;
        }, 300);
      };
    });
  }

  // 5. Pre-fill Passenger in Booking Page if user is logged in
  if (user && window.location.pathname.includes('booking.html')) {
    const paxName = document.querySelector('#pax-full-name');
    const paxEmail = document.querySelector('#pax-email');
    const paxPhone = document.querySelector('#pax-phone');
    if (paxName && (!paxName.value || paxName.value === 'Jonathan Ben')) paxName.value = user.name;
    if (paxEmail && (!paxEmail.value || paxEmail.value === 'jonathan.ben@example.com')) paxEmail.value = user.email;
    if (paxPhone && (!paxPhone.value || paxPhone.value === '+84 901 234 567')) paxPhone.value = user.phone || '+84 901 234 567';
  }
}

/* ==============================================================================
   ADMIN PORTAL CONTROLLER (DYNAMIC BOOKINGS, REAL-TIME FILTER, CSV EXPORT)
   ============================================================================== */
function initAdminPage() {
  const isAdmin = window.location.pathname.toLowerCase().includes('admin');
  const ordersTable = document.querySelector('#orders table tbody');
  if (!isAdmin && !ordersTable) return;

  // Frontend Authorization Guard (P0 Security: SEC-001 & SEC-002)
  // Security Architecture Boundary Notice:
  // This client-side guard protects the Admin view in the standalone prototype environment.
  // URL query parameters (?theme, ?dev) are strictly decoupled from authentication and can NEVER bypass this guard.
  // In an enterprise production deployment with a real backend API, all admin routes, data endpoints,
  // and mutations must be authenticated and authorized server-side (e.g., via cryptographic session/JWT verification).
  const currentUser = Storage.getUser();

  if (isAdmin) {
    const hasAdminRole = Boolean(currentUser && currentUser.role === 'admin');

    if (!hasAdminRole) {
      if (typeof showToast === 'function') {
        const warningMsg = currentUser
          ? '⛔ Quyền truy cập bị từ chối (403 Forbidden): Tài khoản này không có quyền Quản Trị Viên!'
          : '⚠️ Vui lòng đăng nhập phiên Quản Trị Viên (Admin Demo) để tiếp tục.';
        showToast(warningMsg, 4000);
      }
      setTimeout(() => {
        window.location.href = '../pages/login.html?redirect=admin';
      }, 400);
      return;
    }
  }

  const orders = Storage.getOrders();

  // 1. Prepend dynamic user bookings into Recent Orders table
  if (ordersTable && orders && orders.length > 0) {
    ordersTable.querySelectorAll('.dynamic-order-row').forEach(r => r.remove());

    orders.forEach((order) => {
      const tr = document.createElement('tr');
      tr.className = 'dynamic-order-row';
      tr.style.backgroundColor = 'rgba(255, 95, 56, 0.05)';
      tr.innerHTML = `
        <td>
          <strong style="color: var(--accent-orange); letter-spacing: 1px;">${order.pnr}</strong>
          <span style="display: inline-block; font-size: 0.68rem; background: var(--accent-orange); color: white; border-radius: 4px; padding: 1px 6px; margin-left: 5px; font-weight: 800;">MỚI</span>
        </td>
        <td><strong>${order.passengerName}</strong></td>
        <td>${order.route || `${order.from} ➔ ${order.to}`}</td>
        <td>${order.airline} (${order.flightNumber})</td>
        <td><span class="meta-pill" style="color: var(--accent-orange); font-weight: 800;">${order.seat}</span></td>
        <td><strong>${order.amountFormatted || formatCurrency(order.amount)}</strong></td>
        <td><span style="background: var(--badge-green-bg); color: var(--badge-green); padding: 0.3rem 0.75rem; border-radius: var(--radius-full); font-weight: 800; font-size: 0.8rem;">${order.status || 'Đã Xác Nhận'}</span></td>
        <td style="white-space: nowrap; text-align: center;">
          <div style="display: flex; gap: 0.35rem; justify-content: center;">
            <button type="button" class="btn-order-action btn-order-view" data-pnr="${order.pnr}" data-pax="${order.passengerName}" data-route="${order.route || `${order.from} ➔ ${order.to}`}" data-flight="${order.airline} (${order.flightNumber})" data-seat="${order.seat}" data-amount="${order.amountFormatted || formatCurrency(order.amount)}" data-status="${order.status || 'Đã Xác Nhận'}" title="Xem chi tiết" style="background: rgba(0, 104, 255, 0.1); color: #0068ff; border: none; border-radius: 6px; padding: 0.25rem 0.55rem; cursor: pointer; font-size: 0.85rem;">👁</button>
            <button type="button" class="btn-order-action btn-order-edit" title="Sửa thông tin" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: none; border-radius: 6px; padding: 0.25rem 0.55rem; cursor: pointer; font-size: 0.85rem;">✏</button>
            <button type="button" class="btn-order-action btn-order-cancel" title="Hủy / Hoàn tiền" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; border-radius: 6px; padding: 0.25rem 0.55rem; cursor: pointer; font-size: 0.85rem;">⛔</button>
          </div>
        </td>
      `;
      ordersTable.insertBefore(tr, ordersTable.firstChild);
    });

    // Dynamically update Metric Stat Cards
    const metricCards = document.querySelectorAll('.stat-metric-card');
    if (metricCards.length >= 3) {
      // Metric 2: Vé Đã Đặt Hôm Nay (default 342)
      const bookingCountEl = metricCards[1].querySelector('.stat-metric-val');
      if (bookingCountEl) {
        bookingCountEl.textContent = String(342 + orders.length);
      }
      // Metric 3: Doanh Thu Hôm Nay (default $684,200)
      const revenueEl = metricCards[2].querySelector('.stat-metric-val');
      if (revenueEl) {
        const addedRevenue = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
        const totalRev = 684200 + addedRevenue;
        revenueEl.textContent = '$' + totalRev.toLocaleString('en-US');
      }
    }
  }

  // 2. Real-time Live Orders Search Filter
  const searchInput = document.querySelector('#orders input.auth-input-control');
  if (searchInput && ordersTable) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const rows = ordersTable.querySelectorAll('tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  // 3. Export CSV Button
  const allBtns = Array.from(document.querySelectorAll('button'));
  const csvBtn = allBtns.find(b => b.textContent.includes('Xuất Báo Cáo CSV'));
  if (csvBtn) {
    csvBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.playClickSound) window.playClickSound();

      const table = document.querySelector('#orders table');
      if (!table) return;

      const rows = Array.from(table.querySelectorAll('tr'));
      const csvLines = [];

      rows.forEach(row => {
        if (row.style.display === 'none') return;
        const cols = Array.from(row.querySelectorAll('th, td')).map(cell => {
          let text = cell.innerText.replace(/\n/g, ' ').replace(/"/g, '""').trim();
          return `"${text}"`;
        });
        csvLines.push(cols.join(','));
      });

      // UTF-8 BOM for accurate display in Microsoft Excel & modern spreadsheet tools
      const csvBlob = new Blob(['\uFEFF' + csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(csvBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FlyNest_Orders_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('📊 Đã xuất báo cáo danh sách đơn đặt vé thành công!');
    });
  }

  // 4. "+ Điều Phối Chuyến Bay Mới" Action
  const newFlightBtn = allBtns.find(b => b.textContent.includes('+ Điều Phối Chuyến Bay Mới'));
  if (newFlightBtn) {
    newFlightBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.playClickSound) window.playClickSound();

      const flightNo = prompt('Nhập số hiệu chuyến bay mới điều phối (VD: SW-990):', 'SW-990');
      if (!flightNo) return;
      const route = prompt('Nhập chặng bay điều phối (VD: SGN ➔ HAN hoặc DXB ➔ RUH):', 'SGN ➔ HAN');
      if (!route) return;

      showToast(`✈️ Đã điều phối thành công chuyến bay ${flightNo} cho chặng ${route}!`, 4000);
      const flightsMetric = document.querySelector('#flights .stat-metric-val');
      if (flightsMetric) {
        flightsMetric.textContent = String(parseInt(flightsMetric.textContent, 10) + 1);
      }
    });
  }

  // 5. Sidebar Navigation Hash Smooth Scrolling
  const sidebarLinks = document.querySelectorAll('.admin-nav-list a');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        const targetEl = document.querySelector(href);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (window.playClickSound) window.playClickSound();
      }
    });
  });

  // 6. Order Detail Modal & Action Handlers (View 👁, Edit ✏, Cancel ⛔)
  const orderModal = document.querySelector('#admin-order-modal');
  const btnCloseModal = document.querySelector('#btn-close-order-modal');
  const btnDismissModal = document.querySelector('#btn-modal-dismiss');
  const btnPrintModal = document.querySelector('#btn-modal-print');

  const hideModal = () => {
    if (orderModal) orderModal.style.display = 'none';
  };

  if (btnCloseModal) btnCloseModal.addEventListener('click', hideModal);
  if (btnDismissModal) btnDismissModal.addEventListener('click', hideModal);
  if (orderModal) {
    orderModal.addEventListener('click', (e) => {
      if (e.target === orderModal) hideModal();
    });
  }
  if (btnPrintModal) {
    btnPrintModal.addEventListener('click', () => {
      window.print();
    });
  }

  // Delegated click for view / edit / cancel buttons
  if (ordersTable) {
    ordersTable.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('.btn-order-view');
      const editBtn = e.target.closest('.btn-order-edit');
      const cancelBtn = e.target.closest('.btn-order-cancel');

      if (viewBtn) {
        e.preventDefault();
        const tr = viewBtn.closest('tr');
        const pnr = viewBtn.getAttribute('data-pnr') || tr.cells[0].innerText.replace(/\n.*/g, '').trim();
        const pax = viewBtn.getAttribute('data-pax') || tr.cells[1].innerText.trim();
        const route = viewBtn.getAttribute('data-route') || tr.cells[2].innerText.trim();
        const flight = viewBtn.getAttribute('data-flight') || tr.cells[3].innerText.trim();
        const seat = viewBtn.getAttribute('data-seat') || tr.cells[4].innerText.trim();
        const amount = viewBtn.getAttribute('data-amount') || tr.cells[5].innerText.trim();
        const status = viewBtn.getAttribute('data-status') || tr.cells[6].innerText.trim();

        const titleEl = document.querySelector('#modal-pnr-title');
        const paxEl = document.querySelector('#modal-pax-name');
        const routeEl = document.querySelector('#modal-route');
        const flightEl = document.querySelector('#modal-flight');
        const seatEl = document.querySelector('#modal-seat');
        const amountEl = document.querySelector('#modal-amount');
        const statusEl = document.querySelector('#modal-status');

        if (titleEl) titleEl.textContent = `Mã PNR: ${pnr}`;
        if (paxEl) paxEl.textContent = pax;
        if (routeEl) routeEl.textContent = route;
        if (flightEl) flightEl.textContent = flight;
        if (seatEl) seatEl.textContent = seat;
        if (amountEl) amountEl.textContent = amount;
        if (statusEl) statusEl.textContent = status;

        if (orderModal) orderModal.style.display = 'flex';
        return;
      }

      if (editBtn) {
        e.preventDefault();
        const tr = editBtn.closest('tr');
        const statusCell = tr.cells[6];
        const newStatus = statusCell.innerText.includes('Đã Xác Nhận') ? 'Đang Xử Lý' : 'Đã Xác Nhận';
        statusCell.innerHTML = `<span style="background: var(--badge-blue-bg); color: var(--badge-blue); padding: 0.3rem 0.75rem; border-radius: var(--radius-full); font-weight: 800; font-size: 0.8rem;">${newStatus}</span>`;
        const pnr = tr.cells[0].innerText.split('\n')[0].trim();
        Storage.updateOrderStatus(pnr, newStatus);
        showToast(`✏️ Đã cập nhật trạng thái đơn ${pnr} thành "${newStatus}".`);
        return;
      }

      if (cancelBtn) {
        e.preventDefault();
        const tr = cancelBtn.closest('tr');
        const pnr = tr.cells[0].innerText.split('\n')[0].trim();
        if (confirm(`Bạn có chắc muốn hủy đơn và hoàn tiền cho vé ${pnr}?`)) {
          tr.cells[6].innerHTML = `<span style="background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 0.3rem 0.75rem; border-radius: var(--radius-full); font-weight: 800; font-size: 0.8rem;">Đã Hủy / Hoàn Tiền</span>`;
          Storage.updateOrderStatus(pnr, 'Đã Hủy / Hoàn Tiền');
          showToast(`⛔ Đã hủy đơn ${pnr} và kích hoạt quy trình hoàn tiền tự động!`);
        }
        return;
      }
    });
  }

  // 7. Admin Profile Dropdown
  const adminUserBtn = document.querySelector('#admin-user-menu-btn');
  const adminDropdownMenu = document.querySelector('#admin-user-dropdown-menu');
  if (adminUserBtn && adminDropdownMenu) {
    adminUserBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isShown = adminDropdownMenu.style.display === 'block';
      adminDropdownMenu.style.display = isShown ? 'none' : 'block';
    });
    document.addEventListener('click', () => {
      adminDropdownMenu.style.display = 'none';
    });
  }

  // 8. Create promo & Export Excel triggers
  const btnCreatePromo = document.querySelector('#btn-create-promo');
  if (btnCreatePromo) {
    btnCreatePromo.addEventListener('click', () => {
      const code = prompt('Nhập mã khuyến mãi mới (VD: AUTUMN2026):', 'AUTUMN2026');
      if (code) {
        showToast(`🎉 Đã tạo mã khuyến mãi "${code.toUpperCase()}" giảm 20% thành công!`);
      }
    });
  }

  const btnExportExcel = document.querySelector('#btn-export-excel');
  if (btnExportExcel) {
    btnExportExcel.addEventListener('click', () => {
      showToast('📊 Đang tải xuống báo cáo doanh thu Excel (.xlsx)...');
    });
  }

  // 6. Chart.js Dashboard Visualizations
  if (typeof Chart !== 'undefined') {
    const revCanvas = document.getElementById('revenueTrendChart');
    if (revCanvas) {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const textColor = isDark ? '#94a3b8' : '#64748b';
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';

      new Chart(revCanvas, {
        type: 'line',
        data: {
          labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN (Hôm nay)'],
          datasets: [{
            label: 'Doanh Thu ($)',
            data: [420000, 485000, 520000, 490000, 610000, 750000, 684200],
            borderColor: '#ff5f38',
            backgroundColor: 'rgba(255, 95, 56, 0.12)',
            borderWidth: 3,
            fill: true,
            tension: 0.38,
            pointBackgroundColor: '#ff5f38',
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { weight: '600' } }
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                callback: function(val) { return '$' + (val / 1000) + 'k'; }
              }
            }
          }
        }
      });
    }

    const classCanvas = document.getElementById('ticketClassChart');
    if (classCanvas) {
      new Chart(classCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Thương Gia', 'Phổ Thông', 'Gia Đình'],
          datasets: [{
            data: [35, 55, 10],
            backgroundColor: ['#ff5f38', '#0ea5e9', '#10b981'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                font: { weight: '700', size: 11 }
              }
            }
          }
        }
      });
    }
  }

  // 9. WEBSITE CONTENT EDITOR & CMS CONTROLLER (P1-03 & P1-03b)
  const cmsForm = document.querySelector('#website-editor-form');
  if (cmsForm) {
    const statusBadge = document.querySelector('#cms-status-indicator');
    const previewFrame = document.querySelector('#websitePreviewFrame');
    const previewWrapper = document.querySelector('#preview-frame-wrapper');
    const btnSaveDraft = document.querySelector('#btn-cms-save-draft');
    const btnPublish = document.querySelector('#btn-cms-publish');
    const btnResetDefault = document.querySelector('#btn-cms-reset-default');
    const revisionsList = document.querySelector('#cms-revisions-list');
    const lastSavedTime = document.querySelector('#cms-last-saved-time');

    function updateCmsStatusBadge(status) {
      if (!statusBadge) return;
      if (status === 'published') {
        statusBadge.className = 'cms-status-badge published';
        statusBadge.textContent = '✓ Đã Xuất Bản (Mô Phỏng)';
      } else {
        statusBadge.className = 'cms-status-badge draft';
        statusBadge.textContent = '● Bản Nháp Chưa Xuất Bản';
      }
    }

    function populateCmsForm(content) {
      if (!content) return;
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el && val !== undefined) el.value = val;
      };
      setVal('cms-hero-badge', content.heroBadge);
      setVal('cms-hero-title', content.heroTitle);
      setVal('cms-hero-desc', content.heroDesc);
      setVal('cms-hero-cta-text', content.heroCtaText);
      setVal('cms-hero-cta-link', content.heroCtaLink);
      setVal('cms-why-title', content.whyTitle);
      setVal('cms-why-desc', content.whyDesc);
      setVal('cms-support-hotline', content.supportHotline);
      setVal('cms-support-email', content.supportEmail);
      setVal('cms-newsletter-title', content.newsletterTitle);
      setVal('cms-seo-title', content.seoTitle);
      setVal('cms-seo-desc', content.seoDesc);

      updateCmsStatusBadge(content.status || 'published');
      if (lastSavedTime && content.updatedAt) {
        try {
          const d = new Date(content.updatedAt);
          lastSavedTime.textContent = 'Cập nhật: ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('vi-VN');
        } catch(e) {}
      }
    }

    function getCmsFormData() {
      const getVal = id => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
      };
      return {
        heroBadge: getVal('cms-hero-badge'),
        heroTitle: getVal('cms-hero-title'),
        heroDesc: getVal('cms-hero-desc'),
        heroCtaText: getVal('cms-hero-cta-text'),
        heroCtaLink: getVal('cms-hero-cta-link'),
        whyTitle: getVal('cms-why-title'),
        whyDesc: getVal('cms-why-desc'),
        supportHotline: getVal('cms-support-hotline'),
        supportEmail: getVal('cms-support-email'),
        newsletterTitle: getVal('cms-newsletter-title'),
        seoTitle: getVal('cms-seo-title'),
        seoDesc: getVal('cms-seo-desc')
      };
    }

    function broadcastToPreview(data) {
      if (previewFrame && previewFrame.contentWindow) {
        previewFrame.contentWindow.postMessage({
          type: 'SKYWINGS_CMS_LIVE_PREVIEW',
          content: data
        }, '*');
      }
    }

    // Initial populate
    const currentSiteContent = Storage.getSiteContent();
    populateCmsForm(currentSiteContent);

    // Live preview sync on input
    cmsForm.addEventListener('input', () => {
      const data = getCmsFormData();
      broadcastToPreview(data);
      updateCmsStatusBadge('draft');
    });

    if (previewFrame) {
      previewFrame.addEventListener('load', () => {
        broadcastToPreview(getCmsFormData());
      });
    }

    // Save draft
    if (btnSaveDraft) {
      btnSaveDraft.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.playClickSound) window.playClickSound();
        const data = getCmsFormData();
        Storage.setSiteContent(data, 'draft');
        updateCmsStatusBadge('draft');
        showToast('💾 Đã lưu bản nháp vào bộ nhớ trình duyệt (Local Prototype)!');
      });
    }

    // Publish
    if (btnPublish) {
      btnPublish.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.playClickSound) window.playClickSound();
        const data = getCmsFormData();
        const updated = Storage.setSiteContent(data, 'published');
        updateCmsStatusBadge('published');

        Storage.addRevision({
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
          summary: `Xuất bản: "${data.heroTitle.slice(0, 32)}..."`,
          content: updated
        });

        renderRevisionsList();
        broadcastToPreview(updated);
        showToast('🚀 Đã xuất bản lên bộ nhớ trình duyệt (Local Prototype) — Trang chủ đã cập nhật tức thì!');
      });
    }

    // Reset default
    if (btnResetDefault) {
      btnResetDefault.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.playClickSound) window.playClickSound();
        if (confirm('Bạn có chắc muốn khôi phục toàn bộ nội dung website về cấu hình mặc định gốc?')) {
          const resetContent = Storage.setSiteContent(DEFAULT_SITE_CONTENT, 'published');
          populateCmsForm(resetContent);
          broadcastToPreview(resetContent);
          renderRevisionsList();
          showToast('↺ Đã khôi phục nội dung website về mặc định gốc trong bộ nhớ trình duyệt!');
        }
      });
    }

    // Render revisions list
    function renderRevisionsList() {
      if (!revisionsList) return;
      const revs = Storage.getRevisions();
      revisionsList.innerHTML = '';
      revs.forEach((rev, idx) => {
        const div = document.createElement('div');
        div.className = 'revision-item-chip';
        div.setAttribute('data-rev-id', String(rev.id));
        div.innerHTML = `
          <span><strong>Phiên bản #${revs.length - idx}</strong> (${rev.timestamp}) • ${rev.summary}</span>
          <span style="color: var(--accent-orange); font-weight: 800;">Khôi phục ↺</span>
        `;
        div.addEventListener('click', () => {
          if (confirm(`Khôi phục website về phiên bản #${revs.length - idx} (${rev.timestamp})?`)) {
            const rolledBack = Storage.setSiteContent(rev.content, 'published');
            populateCmsForm(rolledBack);
            broadcastToPreview(rolledBack);
            showToast(`↺ Đã khôi phục về phiên bản #${revs.length - idx}!`);
          }
        });
        revisionsList.appendChild(div);
      });
    }

    renderRevisionsList();

    // Device switcher
    document.querySelectorAll('.btn-preview-device').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-preview-device').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const dev = btn.getAttribute('data-device');
        if (previewWrapper) {
          previewWrapper.classList.remove('device-desktop', 'device-tablet', 'device-mobile');
          previewWrapper.classList.add(`device-${dev}`);
        }
      });
    });
  }
}

/* ==============================================================================
   14. MODERN AVIATION LUXURY FOOTER CONTROLLER
   ============================================================================== */
function initFooterFeatures() {
  // 1. Footer Newsletter Subscription
  const newsletterForms = document.querySelectorAll('#footer-newsletter-form, .newsletter-form-wrap');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email) return;

      if (window.playClickSound) window.playClickSound();
      showToast(`🎉 Đăng ký thành công! Mã đặc quyền giảm 25% (SKY25VIP) đã được gửi đến ${email}.`, 4500);
      if (emailInput) emailInput.value = '';
    });
  });

  // 2. Smooth Back to Top Scroll
  const backToTopBtns = document.querySelectorAll('.btn-back-to-top, #footer-back-to-top');
  backToTopBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.playClickSound) window.playClickSound();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  });
}

/* ==============================================================================
   15. VENDOR ENHANCEMENTS CONTROLLER (IMASK & SWEETALERT2 INTEGRATION)
   ============================================================================== */
function initVendorEnhancements() {
  // 1. IMask for Payment Form Fields (Card Number, Expiry, CVV)
  if (typeof IMask !== 'undefined') {
    const cardNumInput = document.querySelector('#input-card-num');
    if (cardNumInput) {
      window.__maskCardNum = IMask(cardNumInput, {
        mask: '0000 0000 0000 0000'
      });
    }

    const cardExpInput = document.querySelector('#input-card-exp');
    if (cardExpInput) {
      window.__maskCardExp = IMask(cardExpInput, {
        mask: '00/00'
      });
    }

    const cardCvvInput = document.querySelector('#input-card-cvv');
    if (cardCvvInput) {
      window.__maskCardCvv = IMask(cardCvvInput, {
        mask: '0000'
      });
    }

    // Phone mask on booking page
    const phoneInput = document.querySelector('#pax-phone');
    if (phoneInput) {
      window.__maskPhone = IMask(phoneInput, {
        mask: [
          { mask: '+{84} 000 000 000' },
          { mask: '+00 00 000 0000' },
          { mask: '0000 000 000' }
        ]
      });
    }
  }

  // 2. SweetAlert2 Theme Wrapper
  if (typeof Swal !== 'undefined') {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    window.FlyNestAlert = {
      success: (title, text) => {
        return Swal.fire({
          icon: 'success',
          title: title,
          text: text,
          confirmButtonColor: '#ff5f38',
          background: isDark ? '#151f33' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a'
        });
      },
      confirm: (title, text, confirmText = 'Đồng ý', cancelText = 'Hủy bỏ') => {
        return Swal.fire({
          icon: 'question',
          title: title,
          text: text,
          showCancelButton: true,
          confirmButtonColor: '#ff5f38',
          cancelButtonColor: '#64748b',
          confirmButtonText: confirmText,
          cancelButtonText: cancelText,
          background: isDark ? '#151f33' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a'
        });
      }
    };
  }

  // 3. Flatpickr Aviation Departure Calendar
  if (typeof flatpickr !== 'undefined') {
    const depDateInput = document.querySelector('#dep-date');
    if (depDateInput) {
      window.__flatpickrDepDate = flatpickr(depDateInput, {
        minDate: 'today',
        defaultDate: new Date(),
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'd/m/Y (D)',
        locale: {
          firstDayOfWeek: 1
        }
      });
    }
  }
}

/* ==============================================================================
   16. ANIMATED LUXURY BANNERS & CELEBRATION CONTROLLER
   ============================================================================== */
function initAnimatedBanners() {
  const flight = Storage.getFlight();

  // 1. Dynamic sync flight route for booking banner
  const bookingBanner = document.querySelector('#booking-animated-banner');
  if (bookingBanner && flight) {
    const statusBadge = bookingBanner.querySelector('.flights-flight-status-badge');
    if (statusBadge) {
      statusBadge.innerHTML = `<span class="flight-pulse-dot"></span> Tuyến Bay ${flight.flightNumber || 'SW-882'} • ${flight.from || 'SGN'} ➔ ${flight.to || 'HAN'} • Khoảng cách 1,165 km • 2h 10m`;
    }
  }

  // 2. Ticket Page: Celebration Confetti Burst
  const ticketBanner = document.querySelector('#ticket-animated-banner');
  if (ticketBanner) {
    triggerCelebrationConfetti(ticketBanner);
  }

  // 3. Admin AOCC: Real-time Live UTC+7 Clock
  const adminClock = document.querySelector('#admin-live-clock');
  if (adminClock) {
    const updateClock = () => {
      const now = new Date();
      adminClock.textContent = now.toLocaleTimeString('vi-VN', { hour12: false });
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  // 4. Interactive Mouse Parallax 3D Tilt on all Banners (Throttled & Bypassed in Eco Mode)
  const allBanners = document.querySelectorAll('.sky-clouds-banner-wrap');
  allBanners.forEach(banner => {
    const stage = banner.querySelector('.banner-airplane-stage, .booking-radar-stage, .seats-aircraft-stage, .payment-cyber-stage, .ticket-runway-stage');
    const sunFlare = banner.querySelector('.sky-sun-flare');
    if (!stage && !sunFlare) return;

    let cachedRect = null;
    let isInside = false;
    let bannerRaf = null;

    banner.addEventListener('mouseenter', () => {
      isInside = true;
      cachedRect = banner.getBoundingClientRect();
    }, { passive: true });

    banner.addEventListener('mousemove', (e) => {
      if (window.__ecoMode || window.__perfMode === 'eco') return;
      if (!cachedRect) cachedRect = banner.getBoundingClientRect();
      if (bannerRaf) return;

      bannerRaf = requestAnimationFrame(() => {
        bannerRaf = null;
        if (!cachedRect || !isInside) return;
        const x = e.clientX - cachedRect.left - cachedRect.width / 2;
        const y = e.clientY - cachedRect.top - cachedRect.height / 2;
        const tiltX = (x / cachedRect.width) * 16;
        const tiltY = (y / cachedRect.height) * 12;

        if (stage) {
          stage.style.transform = `translate3d(${tiltX * 0.8}px, ${tiltY * 0.8}px, 0)`;
          stage.style.transition = 'transform 0.08s ease-out';
        }
        if (sunFlare) {
          sunFlare.style.transform = `translate3d(${-tiltX * 1.2}px, ${-tiltY * 1.2}px, 0)`;
          sunFlare.style.transition = 'transform 0.08s ease-out';
        }
      });
    }, { passive: true });

    banner.addEventListener('mouseleave', () => {
      isInside = false;
      cachedRect = null;
      if (bannerRaf) {
        cancelAnimationFrame(bannerRaf);
        bannerRaf = null;
      }
      if (stage) {
        stage.style.transform = 'translate3d(0, 0, 0)';
        stage.style.transition = 'transform 0.4s ease';
      }
      if (sunFlare) {
        sunFlare.style.transform = 'translate3d(0, 0, 0)';
        sunFlare.style.transition = 'transform 0.4s ease';
      }
    }, { passive: true });
  });
}

function triggerCelebrationConfetti(container) {
  try {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '5';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = (rect.width || 800) * dpr;
    canvas.height = (rect.height || 280) * dpr;
    ctx.scale(dpr, dpr);

    const colors = ['#f59e0b', '#10b981', '#38bdf8', '#ffedd5', '#f43f5e', '#a855f7'];
    const particles = [];
    const width = rect.width || 800;
    const height = rect.height || 280;

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: width * 0.5 + (Math.random() - 0.5) * 140,
        y: 40 + Math.random() * 30,
        vx: (Math.random() - 0.5) * 7,
        vy: Math.random() * 2.5 + 1.5,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    let startTime = performance.now();
    function animate(time) {
      const elapsed = time - startTime;
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rotation += p.vr;
        if (elapsed > 2000) {
          p.opacity = Math.max(0, 1 - (elapsed - 2000) / 1500);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      });

      if (elapsed < 3500) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(animate);
  } catch(e) {}
}

/* ==============================================================================
   17. HARDWARE ACCELERATION & LOW-SPEC ECO PERFORMANCE CONTROLLER
   Automatically adapts graphics & frame rates for low-end hardware,
   dual-core CPUs, integrated GPUs, and battery-saver mode.
   ============================================================================== */
function initPerformanceMode() {
  const isLowSpecHardware = () => {
    try {
      const cores = navigator.hardwareConcurrency || 4;
      const mem = navigator.deviceMemory || 4;
      const saveData = Boolean(navigator.connection && navigator.connection.saveData);
      const prefersReduced = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      return cores <= 4 || mem <= 4 || saveData || prefersReduced || window.innerWidth <= 768;
    } catch(e) {
      return false;
    }
  };

  let currentMode = 'standard';
  if (window.CoreStore) {
    const data = window.CoreStore.getData();
    if (data && data.settings && data.settings.perfMode) {
      currentMode = data.settings.perfMode;
    } else {
      currentMode = isLowSpecHardware() ? 'eco' : 'standard';
    }
  } else {
    currentMode = isLowSpecHardware() ? 'eco' : 'standard';
  }
  
  window.__perfMode = currentMode;

  function applyPerfMode(mode, persist = false) {
    window.__perfMode = mode;
    if (persist && window.CoreStore) {
      const data = window.CoreStore.getData();
      if (!data.settings) data.settings = {};
      data.settings.perfMode = mode;
      window.CoreStore.saveData(data);
    }
    
    if (mode === 'eco') {
      document.body.classList.add('perf-mode-eco');
    } else {
      document.body.classList.remove('perf-mode-eco');
    }

    // Notify Three.js 3D Runway engine if present
    if (typeof window.__applyPerfModeToRunway === 'function') {
      window.__applyPerfModeToRunway(mode === 'eco');
    }
  }

  applyPerfMode(currentMode, false);
  window.__setPerformanceMode = applyPerfMode;
}


