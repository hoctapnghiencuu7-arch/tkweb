/**
 * SKYWINGS CENTRAL DATA STORE (core-store.js)
 * Key: 'SKYWINGS_GLOBAL_DATA'
 * Synchronizes search state, flights, coupons, settings, theme, and language across all pages.
 */

(function(global) {
  'use strict';

  const STORAGE_KEY = 'SKYWINGS_GLOBAL_DATA';

  const INITIAL_DATA = {
    settings: {
      theme: 'light',
      lang: 'vi',
      demoMode: false,
      colors: {
        primary: '#ff6b00',
        bgDark: '#0b1325',
        cardDark: '#152238',
        textLight: '#ffffff'
      }
    },
    searchState: {
      from: 'SGN',
      to: 'HAN',
      date: '2026-09-19',
      adults: 1,
      children: 0,
      infants: 0,
      seatClass: 'Hạng Phổ Thông'
    },
    coupons: [
      { code: 'SKYWINGS2026', discount: 10, type: 'percent' },
      { code: 'BAYNHANH', discount: 500000, type: 'fixed' }
    ],
    flights: [
      {
        id: 'FL-001',
        flightNumber: 'SW-882',
        airline: 'FlyNest Airlines',
        airlineLogo: 'flynest.svg',
        airlineShort: 'FlyNest',
        aircraft: 'Boeing 787-9 Dreamliner',
        aircraftFamily: 'Boeing',
        from: 'SGN',
        to: 'HAN',
        depCity: 'TP. Hồ Chí Minh',
        arrCity: 'Hà Nội',
        depAirport: 'Sân bay Quốc tế Tân Sơn Nhất',
        arrAirport: 'Sân bay Quốc tế Nội Bài',
        depTime: '07:40 AM',
        arrTime: '09:50 AM',
        depTime24: '07:40',
        arrTime24: '09:50',
        duration: '02h 10m',
        price: 1970,
        priceVND: 48856000,
        terminalDep: 'Ga T1 (Quốc nội)',
        terminalArr: 'Ga T1 (Nội Bài)',
        stopInfo: 'Bay thẳng',
        isFlagship: true
      },
      {
        id: 'FL-002',
        flightNumber: 'VN-214',
        airline: 'Vietnam Airlines',
        airlineLogo: 'vietnam-airlines.svg',
        airlineShort: 'Vietnam Airlines',
        aircraft: 'Airbus A350-900',
        aircraftFamily: 'Airbus',
        from: 'SGN',
        to: 'HAN',
        depCity: 'TP. Hồ Chí Minh',
        arrCity: 'Hà Nội',
        depAirport: 'Sân bay Quốc tế Tân Sơn Nhất',
        arrAirport: 'Sân bay Quốc tế Nội Bài',
        depTime: '08:30 AM',
        arrTime: '10:45 AM',
        depTime24: '08:30',
        arrTime24: '10:45',
        duration: '02h 15m',
        price: 1650,
        priceVND: 40920000,
        terminalDep: 'Ga T1 (Quốc nội)',
        terminalArr: 'Ga T1 (Nội Bài)',
        stopInfo: 'Bay thẳng',
        isFlagship: false
      },
      {
        id: 'FL-003',
        flightNumber: 'VJ-136',
        airline: 'Vietjet Air',
        airlineLogo: 'vietjet-air.svg',
        airlineShort: 'Vietjet Air',
        aircraft: 'Airbus A321neo',
        aircraftFamily: 'Airbus',
        from: 'SGN',
        to: 'HAN',
        depCity: 'TP. Hồ Chí Minh',
        arrCity: 'Hà Nội',
        depAirport: 'Sân bay Quốc tế Tân Sơn Nhất',
        arrAirport: 'Sân bay Quốc tế Nội Bài',
        depTime: '06:15 AM',
        arrTime: '08:25 AM',
        depTime24: '06:15',
        arrTime24: '08:25',
        duration: '02h 10m',
        price: 950,
        priceVND: 23560000,
        terminalDep: 'Ga T1 (Quốc nội)',
        terminalArr: 'Ga T1 (Nội Bài)',
        stopInfo: 'Bay thẳng',
        isFlagship: false
      }
    ]
  };

  const CoreStore = {
    /**
     * Get the entire stored object or populate with defaults
     */
    getData: function() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.settings && parsed.searchState && Array.isArray(parsed.coupons) && Array.isArray(parsed.flights)) {
            // Ensure no legacy Ga T2 remains in cached data
            let modified = false;
            parsed.flights.forEach(f => {
              if (f.terminalDep && f.terminalDep.includes('T2')) {
                f.terminalDep = 'Ga T1 (Quốc nội)';
                modified = true;
              }
            });
            
            // Auto-repair buggy dark/blue state from old localStorage
            if (parsed.settings.theme === 'dark' && parsed.settings.colors.primary === '#0194f3') {
              parsed.settings.theme = 'light';
              if (parsed.settings.lang === 'en') parsed.settings.lang = 'vi';
              parsed.settings.colors.primary = '#ff6b00';
              if (parsed.searchState.seatClass === 'Economy') {
                 parsed.searchState.seatClass = 'Hạng Phổ Thông';
              }
              modified = true;
            }

            if (modified) {
              this.saveData(parsed);
            }
            return parsed;
          }
        }
      } catch (e) {
        console.warn('[CoreStore] Failed to read from localStorage, using INITIAL_DATA', e);
      }
      // Populate defaults if missing
      const fresh = JSON.parse(JSON.stringify(INITIAL_DATA));
      this.saveData(fresh);
      return fresh;
    },

    /**
     * Persist entire state to localStorage & sync legacy storage keys
     */
    saveData: function(data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        this.syncLegacy(data);
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
          window.dispatchEvent(new CustomEvent('flynest:store-update', { detail: data }));
        }
      } catch (e) {
        console.error('[CoreStore] Failed to save to localStorage', e);
      }
      return data;
    },

    /**
     * Sync with legacy keys used by main.js
     */
    syncLegacy: function(data) {
      if (!data) return;
      try {
        // Theme sync
        if (data.settings && data.settings.theme) {
          localStorage.setItem('ngefly_theme', data.settings.theme);
        }
        // Search state sync
        if (data.searchState) {
          const s = data.searchState;
          const paxString = `${s.adults} Người lớn${s.children ? ` • ${s.children} Trẻ em` : ''}${s.infants ? ` • ${s.infants} Em bé` : ''}, ${s.seatClass === 'Business' ? 'Thương gia' : 'Phổ thông'}`;
          const legacySearch = {
            from: s.from,
            to: s.to,
            date: s.date,
            passengers: paxString,
            passengerCount: s.adults + s.children,
            adults: s.adults,
            children: s.children,
            infants: s.infants,
            seatClass: s.seatClass === 'Business' ? 'Hạng Thương Gia' : 'Hạng Phổ Thông',
            tripType: 'Một chiều'
          };
          localStorage.setItem('ngefly_search_params', JSON.stringify(legacySearch));
          localStorage.setItem('from', s.from);
          localStorage.setItem('to', s.to);
          localStorage.setItem('date', s.date);
          localStorage.setItem('seatClass', legacySearch.seatClass);
        }
      } catch (e) {}
    },

    getSettings: function() {
      return this.getData().settings;
    },

    setSettings: function(settings) {
      const d = this.getData();
      d.settings = { ...d.settings, ...settings };
      this.saveData(d);
      this.applySettings(d.settings);
      return d.settings;
    },

    getSearchState: function() {
      return this.getData().searchState;
    },

    setSearchState: function(searchState) {
      const d = this.getData();
      d.searchState = { ...d.searchState, ...searchState };
      this.saveData(d);
      return d.searchState;
    },

    getCoupons: function() {
      return this.getData().coupons;
    },

    addCoupon: function(coupon) {
      const d = this.getData();
      const code = String(coupon.code || '').trim().toUpperCase();
      if (!code) return false;
      const idx = d.coupons.findIndex(c => c.code.toUpperCase() === code);
      const newCoupon = {
        code: code,
        discount: Number(coupon.discount) || 0,
        type: coupon.type === 'fixed' ? 'fixed' : 'percent'
      };
      if (idx >= 0) {
        d.coupons[idx] = newCoupon;
      } else {
        d.coupons.push(newCoupon);
      }
      this.saveData(d);
      return true;
    },

    deleteCoupon: function(code) {
      const d = this.getData();
      const target = String(code || '').trim().toUpperCase();
      d.coupons = d.coupons.filter(c => c.code.toUpperCase() !== target);
      this.saveData(d);
      return true;
    },

    getFlights: function() {
      return this.getData().flights;
    },

    addFlight: function(flight) {
      const d = this.getData();
      const newFlight = {
        id: flight.id || `FL-${Date.now().toString().slice(-4)}`,
        flightNumber: flight.flightNumber || 'SW-999',
        airline: flight.airline || 'FlyNest Airlines',
        airlineLogo: flight.airlineLogo || 'flynest.svg',
        airlineShort: flight.airlineShort || flight.airline || 'FlyNest',
        aircraft: flight.aircraft || 'Boeing 787-9 Dreamliner',
        aircraftFamily: flight.aircraftFamily || 'Boeing',
        from: flight.from || 'SGN',
        to: flight.to || 'HAN',
        depCity: flight.depCity || 'TP. Hồ Chí Minh',
        arrCity: flight.arrCity || 'Hà Nội',
        depAirport: flight.depAirport || 'Sân bay Quốc tế Tân Sơn Nhất',
        arrAirport: flight.arrAirport || 'Sân bay Quốc tế Nội Bài',
        depTime: flight.depTime || '09:00 AM',
        arrTime: flight.arrTime || '11:15 AM',
        depTime24: flight.depTime24 || '09:00',
        arrTime24: flight.arrTime24 || '11:15',
        duration: flight.duration || '02h 15m',
        price: Number(flight.price) || 1500,
        priceVND: (Number(flight.price) || 1500) * 24800,
        terminalDep: 'Ga T1 (Quốc nội)',
        terminalArr: flight.terminalArr || 'Ga T1 (Nội Bài)',
        stopInfo: flight.stopInfo || 'Bay thẳng',
        isFlagship: !!flight.isFlagship
      };
      d.flights.unshift(newFlight);
      this.saveData(d);
      return newFlight;
    },

    /**
     * Generate 1 random flight for quick testing
     */
    generateRandomFlight: function() {
      const airlines = [
        { name: 'FlyNest Airlines', short: 'FlyNest', logo: 'flynest.svg', prefix: 'SW' },
        { name: 'Vietnam Airlines', short: 'Vietnam Airlines', logo: 'vietnam-airlines.svg', prefix: 'VN' },
        { name: 'Bamboo Airways', short: 'Bamboo', logo: 'bamboo-airways.svg', prefix: 'QH' },
        { name: 'Vietjet Air', short: 'Vietjet Air', logo: 'vietjet-air.svg', prefix: 'VJ' }
      ];
      const aircrafts = ['Boeing 787-9 Dreamliner', 'Airbus A350-900', 'Airbus A321neo', 'Boeing 777-300ER'];
      const pickA = airlines[Math.floor(Math.random() * airlines.length)];
      const fNum = `${pickA.prefix}-${Math.floor(100 + Math.random() * 899)}`;
      const hDep = Math.floor(5 + Math.random() * 16);
      const mDep = Math.random() > 0.5 ? '30' : '00';
      const depHourStr = hDep.toString().padStart(2, '0');
      const ampm = hDep >= 12 ? 'PM' : 'AM';
      const displayH = (hDep % 12) || 12;
      const depTime = `${displayH.toString().padStart(2, '0')}:${mDep} ${ampm}`;
      const hArr = (hDep + 2) % 24;
      const arrHourStr = hArr.toString().padStart(2, '0');
      const arrAmpm = hArr >= 12 ? 'PM' : 'AM';
      const arrDisplayH = (hArr % 12) || 12;
      const arrTime = `${arrDisplayH.toString().padStart(2, '0')}:${mDep} ${arrAmpm}`;
      const priceUSD = Math.floor(750 + Math.random() * 1600);

      return this.addFlight({
        flightNumber: fNum,
        airline: pickA.name,
        airlineShort: pickA.short,
        airlineLogo: pickA.logo,
        aircraft: aircrafts[Math.floor(Math.random() * aircrafts.length)],
        depTime: depTime,
        arrTime: arrTime,
        depTime24: `${depHourStr}:${mDep}`,
        arrTime24: `${arrHourStr}:${mDep}`,
        duration: '02h 10m',
        price: priceUSD,
        terminalDep: 'Ga T1 (Quốc nội)',
        terminalArr: 'Ga T1 (Nội Bài)',
        stopInfo: 'Bay thẳng',
        isFlagship: pickA.prefix === 'SW'
      });
    },

    /**
     * Restore clean default state & clear localStorage
     */
    resetDefaults: function() {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
      const fresh = JSON.parse(JSON.stringify(INITIAL_DATA));
      this.saveData(fresh);
      this.applySettings(fresh.settings);
      return fresh;
    },

    /**
     * Apply colors, theme, language, and demoMode to DOM
     */
    applySettings: function(settings) {
      if (!settings) return;
      // 1. Theme
      if (settings.theme) {
        document.documentElement.setAttribute('data-theme', settings.theme);
      }
      // 2. Colors
      if (settings.colors) {
        const root = document.documentElement;
        if (settings.colors.primary) {
          root.style.setProperty('--primary-color', settings.colors.primary);
          root.style.setProperty('--accent-orange', settings.colors.primary);
        }
        if (settings.colors.bgDark) {
          root.style.setProperty('--bg-color', settings.colors.bgDark);
          if (settings.theme === 'dark') {
            root.style.setProperty('--bg-page', settings.colors.bgDark);
          }
        }
        if (settings.colors.cardDark) {
          root.style.setProperty('--card-bg', settings.colors.cardDark);
          if (settings.theme === 'dark') {
            root.style.setProperty('--bg-card', settings.colors.cardDark);
            root.style.setProperty('--bg-card-alt', settings.colors.cardDark);
          }
        }
        if (settings.colors.textLight) {
          root.style.setProperty('--text-color', settings.colors.textLight);
          if (settings.theme === 'dark') {
            root.style.setProperty('--text-dark', settings.colors.textLight);
          }
        }
      }
      // 3. Demo Mode
      if (typeof document !== 'undefined' && document.body) {
        if (settings.demoMode) {
          document.body.classList.add('demo-mode');
        } else {
          document.body.classList.remove('demo-mode');
        }
      }
      // 4. Language
      if (settings.lang) {
        this.applyLanguage(settings.lang);
      }
    },

    /**
     * Instant bilingual translation across DOM using data-en and data-vi
     */
    applyLanguage: function(lang) {
      const targetLang = (lang === 'vi') ? 'vi' : 'en';
      document.documentElement.lang = targetLang;
      if (typeof document === 'undefined') return;

      const elements = document.querySelectorAll('[data-en][data-vi]');
      elements.forEach(el => {
        const text = el.getAttribute(`data-${targetLang}`);
        if (text !== null) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = text;
          } else {
            el.textContent = text;
          }
        }
      });

      // Update placeholders
      const inputElements = document.querySelectorAll('[data-en-placeholder][data-vi-placeholder]');
      inputElements.forEach(el => {
        const ph = el.getAttribute(`data-${targetLang}-placeholder`);
        if (ph !== null) {
          el.placeholder = ph;
        }
      });

      // Update language toggle button text if present
      const langBtn = document.querySelector('#lang-toggle-btn');
      if (langBtn) {
        langBtn.textContent = targetLang === 'en' ? '🇺🇸 EN' : '🇻🇳 VI';
      }
    },

    init: function() {
      const data = this.getData();
      this.applySettings(data.settings);
    }
  };

  // Immediate initialization when script executes
  if (typeof window !== 'undefined') {
    global.CoreStore = CoreStore;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => CoreStore.init());
    } else {
      CoreStore.init();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoreStore;
  }
})(typeof window !== 'undefined' ? window : globalThis);
