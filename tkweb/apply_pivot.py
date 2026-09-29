import re

filepath = "d:/DuAnNhom/tkweb/index.html"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Restore Horizontal Service Navigation HTML
services_html = """
      <!-- RESTORED HORIZONTAL SERVICES NAVIGATION -->
      <div class="services-nav">
        <div class="service-item" data-mode="mode-hotel" data-form="hotel" data-index="3" tabindex="0">
          <svg viewBox="0 0 24 24"><path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zm-9-1a2 2 0 0 1 4 0v1h-4V6zM6 19V9h12v10H6zm3-5h6v2H9v-2z"/></svg>
          <span>Khách sạn</span>
        </div>
        <div class="service-item active" data-mode="mode-flight" data-form="flight" data-index="0" tabindex="0">
          <svg viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
          <span>Vé máy bay</span>
        </div>
        <div class="service-item" data-mode="mode-train" data-form="train" data-index="2" tabindex="0">
          <svg viewBox="0 0 24 24"><path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm4.5-6H6V6h12v5h-6zm4.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
          <span>Vé tàu hỏa</span>
        </div>
        <div class="service-item" data-mode="mode-neutral" data-form="bus" tabindex="0">
          <svg viewBox="0 0 24 24"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 2c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v8z"/></svg>
          <span>Vé xe khách</span>
        </div>
        <div class="service-item" data-mode="mode-neutral" data-form="airport-transfer" tabindex="0">
          <svg viewBox="0 0 24 24"><path d="M18.89 12.77c.4-.41.61-1 .61-1.6 0-1.21-.98-2.2-2.19-2.2-.42 0-.82.12-1.16.34L10 6H7l2.5 5.5-3.48-.3L4.74 9H3l1 4-1 4h1.74l1.28-2.2 3.48-.3L7 20h3l6.15-3.31c.34.22.74.34 1.16.34 1.21 0 2.19-.99 2.19-2.2 0-.6-.21-1.19-.61-1.6V12.77z"/></svg>
          <span>Đưa đón sân bay</span>
        </div>
        <div class="service-item" data-mode="mode-neutral" data-form="car-rental" tabindex="0">
          <svg viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
          <span>Cho thuê xe</span>
        </div>
        <div class="service-item" data-mode="mode-neutral" data-form="activity" tabindex="0">
          <svg viewBox="0 0 24 24"><path d="M14 6c0-2.21-1.79-4-4-4S6 3.79 6 6s1.79 4 4 4 4-1.79 4-4zm-8 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm12 5.5c0-.83-.67-1.5-1.5-1.5S15 10.67 15 11.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zm-5 4V13h-2v2.5L9.5 17l1.5 5 2.5-1.5V17h1.5l2 4 1.5-1-2.5-4.5z"/></svg>
          <span>Hoạt động & Vui chơi</span>
        </div>
        <div class="service-item" id="btn-more-services" tabindex="0">
          <svg viewBox="0 0 24 24"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
          <span>Khác</span>
        </div>
      </div>
      
      <!-- MORE SERVICES POPOVER -->
      <div class="more-popover" id="moreServicesPopover">
        <div class="popover-group">
          <h4>VẬN TẢI</h4>
          <div class="popover-list">
            <div class="popover-item" data-mode="mode-cruise" data-form="cruise" data-index="1">Du thuyền</div>
          </div>
        </div>
        <div class="popover-group">
          <h4>TIỆN ÍCH</h4>
          <div class="popover-list">
            <div class="popover-item" data-mode="mode-neutral" data-form="insurance">Bảo hiểm du lịch</div>
          </div>
        </div>
        <div class="popover-group">
          <h4>HOẠT ĐỘNG & VUI CHƠI</h4>
          <div class="popover-list">
            <div class="popover-item" data-mode="mode-neutral" data-form="beauty">Làm đẹp & Spa</div>
            <div class="popover-item" data-mode="mode-neutral" data-form="playground">Sân chơi</div>
            <div class="popover-item" data-mode="mode-neutral" data-form="class">Lớp học & Hội thảo</div>
            <div class="popover-item" data-mode="mode-neutral" data-form="event">Sự kiện</div>
            <div class="popover-item" data-mode="mode-neutral" data-form="attraction">Điểm tham quan</div>
            <div class="popover-item" data-mode="mode-neutral" data-form="tour">Tour</div>
          </div>
        </div>
      </div>
"""

# We need to replace `.hero-layout-stack` with just the `heroTitle` + `services_html`.
content = re.sub(
    r'<div class="hero-layout-stack">.*?<div class="search-box-wrapper">',
    f"""<h1 class="hero-title" id="heroTitle" style="text-align: center; margin-top: 4vh; color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,0.5); position: relative; z-index: 20;">Ready to take off?</h1>
{services_html}
<div class="search-box-wrapper">""",
    content,
    flags=re.DOTALL
)

# 2. Add the Ferris Wheel Stage behind everything
# We will inject it inside `<section id="heroScene">`
ferris_wheel_html = """
    <!-- FERRIS WHEEL STAGE (PIVOT ROTATION) -->
    <div class="ferris-pivot" id="ferrisPivot">
        <div class="ferris-wheel" id="ferrisWheel">
            
            <!-- SLOT 0: FLIGHT (0 deg) -->
            <div class="ferris-slot" style="transform: rotate(0deg) translateY(-45vh);">
                <div class="env-layer env-flight">
                  <div class="env-left-fields"></div>
                  <div class="env-runway"><div class="runway-center-line"></div></div>
                  <div class="env-right-terminal"></div>
                </div>
                <div class="vehicle-container">
                    <svg class="vehicle airplane-idle" viewBox="0 0 400 400">
                        <defs><filter id="drop-shadow"><feDropShadow dx="-10" dy="15" stdDeviation="8" flood-color="#000000" flood-opacity="0.5"/></filter></defs>
                        <path d="M200,50 L210,120 L350,180 L350,210 L210,200 L205,300 L240,330 L240,350 L200,340 L160,350 L160,330 L195,300 L190,200 L50,210 L50,180 L190,120 Z" fill="#ffffff" filter="url(#drop-shadow)"/>
                        <path d="M200,50 L210,120 L210,200 L205,300 L200,340 L195,300 L190,200 L190,120 Z" fill="#f1f5f9"/>
                        <path d="M200,50 L210,120 L190,120 Z" fill="#0194f3"/>
                    </svg>
                </div>
            </div>
            
            <!-- SLOT 1: CRUISE (90 deg) -->
            <div class="ferris-slot" style="transform: rotate(90deg) translateY(-45vh);">
                <div class="env-layer env-cruise">
                  <div style="position: absolute; inset: 0; background: linear-gradient(180deg, #0284c7 0%, #0369a1 100%);"></div>
                </div>
                <div class="vehicle-container">
                    <svg class="vehicle airplane-idle" viewBox="0 0 400 400">
                        <defs><filter id="ship-shadow"><feDropShadow dx="-8" dy="12" stdDeviation="6" flood-color="#000000" flood-opacity="0.4"/></filter></defs>
                        <path d="M120,250 L280,250 L320,150 L80,150 Z" fill="#ffffff" filter="url(#ship-shadow)"/>
                        <rect x="140" y="100" width="120" height="50" fill="#f1f5f9" />
                        <rect x="160" y="70" width="80" height="30" fill="#0194f3" />
                        <path d="M80,150 L320,150" stroke="#0ea5e9" stroke-width="4"/>
                    </svg>
                </div>
            </div>

            <!-- SLOT 2: TRAIN (180 deg) -->
            <div class="ferris-slot" style="transform: rotate(180deg) translateY(-45vh);">
                <div class="env-layer env-train">
                  <div style="position: absolute; inset: 0; background: #475569;">
                    <div style="position: absolute; top: 0; bottom: 0; left: 50%; width: 20px; margin-left: -10px; background: repeating-linear-gradient(0deg, #94a3b8, #94a3b8 20px, transparent 20px, transparent 40px);"></div>
                  </div>
                </div>
                <div class="vehicle-container">
                    <svg class="vehicle airplane-idle" viewBox="0 0 400 400">
                        <defs><filter id="train-shadow"><feDropShadow dx="-5" dy="10" stdDeviation="5" flood-color="#000000" flood-opacity="0.5"/></filter></defs>
                        <rect x="170" y="100" width="60" height="200" rx="10" fill="#0194f3" filter="url(#train-shadow)"/>
                        <rect x="180" y="110" width="40" height="30" rx="5" fill="#ffffff"/>
                        <rect x="180" y="150" width="40" height="130" fill="#f8fafc"/>
                    </svg>
                </div>
            </div>
            
            <!-- SLOT 3: HOTEL (270 deg) -->
            <div class="ferris-slot" style="transform: rotate(270deg) translateY(-45vh);">
                <div class="env-layer env-hotel">
                  <div style="position: absolute; inset: 0; background: linear-gradient(135deg, #10b981 0%, #059669 100%);"></div>
                </div>
                <div class="vehicle-container">
                    <svg class="vehicle airplane-idle" viewBox="0 0 400 400">
                        <defs><filter id="hotel-shadow"><feDropShadow dx="-10" dy="15" stdDeviation="8" flood-color="#000000" flood-opacity="0.3"/></filter></defs>
                        <rect x="120" y="150" width="160" height="150" fill="#ffffff" filter="url(#hotel-shadow)"/>
                        <rect x="140" y="170" width="30" height="30" fill="#cbd5e1"/>
                        <rect x="185" y="170" width="30" height="30" fill="#cbd5e1"/>
                        <rect x="230" y="170" width="30" height="30" fill="#cbd5e1"/>
                        <rect x="140" y="220" width="30" height="30" fill="#cbd5e1"/>
                        <rect x="185" y="220" width="30" height="30" fill="#cbd5e1"/>
                        <rect x="230" y="220" width="30" height="30" fill="#cbd5e1"/>
                        <polygon points="100,150 200,80 300,150" fill="#ef4444"/>
                    </svg>
                </div>
            </div>

        </div>
    </div>
"""

# Replace old env layers and vehicle container with the ferris wheel
content = re.sub(
    r'<div class="env-layer env-flight">.*?<h1 class="hero-title" id="heroTitle"',
    ferris_wheel_html + '\n    <h1 class="hero-title" id="heroTitle"',
    content,
    flags=re.DOTALL
)

# 3. New CSS for Ferris Wheel and original Service Nav
new_css = """
/* FERRIS WHEEL PIVOT SYSTEM */
.ferris-pivot {
    position: absolute;
    bottom: 2vh; /* Vị trí pivot đỏ ngay dưới form tìm kiếm */
    left: 50%;
    width: 0; height: 0;
    z-index: 10;
}
.ferris-wheel {
    position: absolute;
    top: 0; left: 0;
    width: 0; height: 0;
    transition: transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ferris-slot {
    position: absolute;
    top: 0; left: 0;
    width: 0; height: 0;
    /* Centers the slot at 0,0. translateY moves it radially outwards */
}
.ferris-slot .env-layer {
    position: absolute;
    /* Massive background to cover the screen even when rotating */
    width: 300vw; height: 300vh;
    left: 50%; top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    opacity: 1;
    z-index: 1;
}
.ferris-slot .vehicle-container {
    position: absolute;
    width: 300px; height: 300px;
    left: 50%; top: 50%;
    transform: translate(-50%, -50%);
    z-index: 15;
    pointer-events: none;
}
.vehicle { width: 100%; height: 100%; }
.airplane-idle { animation: planeHover 2s ease-in-out infinite alternate; }
@keyframes planeHover {
  0% { transform: translateY(-5px); }
  100% { transform: translateY(5px); }
}

/* HORIZONTAL SERVICES NAVIGATION */
.services-nav {
    position: relative;
    z-index: 20;
    display: flex;
    gap: 8px;
    margin: 20px auto;
    max-width: 880px;
    padding: 12px 20px;
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(8px);
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    overflow-x: auto;
    scrollbar-width: none;
}
.services-nav::-webkit-scrollbar { display: none; }
.service-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 75px;
    padding: 10px 8px;
    cursor: pointer;
    border-radius: 12px;
    transition: background 0.2s, color 0.2s;
    color: #64748b;
    flex-shrink: 0;
}
.service-item:hover, .service-item:focus {
    background: #f1f5f9;
    color: #0f172a;
    outline: none;
}
.service-item.active {
    background: #e0f2fe;
    color: #0194f3;
}
.service-item.active svg {
    fill: #0194f3;
}
.service-item svg {
    width: 24px;
    height: 24px;
    fill: #64748b;
    transition: fill 0.2s;
}
.service-item span {
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
}

/* POPOVER MENU */
.more-popover {
    position: absolute;
    top: calc(100% - 10px);
    right: 20px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    padding: 20px;
    width: 320px;
    z-index: 50;
    display: none;
    flex-direction: column;
    gap: 16px;
}
.more-popover.show {
    display: flex;
}
.popover-group h4 {
    font-size: 11px;
    text-transform: uppercase;
    color: #94a3b8;
    margin: 0 0 8px 0;
    font-weight: 700;
    letter-spacing: 0.5px;
}
.popover-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}
.popover-item {
    font-size: 13px;
    color: #334155;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
}
.popover-item:hover {
    background: #f1f5f9;
    color: #0194f3;
}
"""

content = re.sub(r'/\* CIRCULAR WHEEL CAROUSEL \*/.*?/\* SCENE MODES EXTENSION \*/', new_css, content, flags=re.DOTALL)

# 4. Update JS logic for Pivot
js_logic = """
<script>
document.addEventListener('DOMContentLoaded', () => {
    const serviceItems = document.querySelectorAll('.service-item[data-mode], .popover-item[data-mode]');
    const searchForms = document.querySelectorAll('.search-form-view');
    const ferrisWheel = document.getElementById('ferrisWheel');
    const btnMoreServices = document.getElementById('btn-more-services');
    const popover = document.getElementById('moreServicesPopover');
    const heroTitle = document.getElementById('heroTitle');
    
    let currentAngle = 0;
    
    const titleTexts = {
        'flight': 'Ready to take off?',
        'cruise': 'Ready to set sail?',
        'train': 'Ready to depart?',
        'hotel': 'Ready for your stay?',
        'generic': 'Ready to discover?'
    };

    function switchService(formId, index) {
        // Update Title
        if (heroTitle) heroTitle.textContent = titleTexts[formId] || titleTexts['generic'];
        
        // Switch Search Form
        searchForms.forEach(f => f.classList.remove('active'));
        let targetForm = document.getElementById('search-' + formId);
        if (!targetForm) targetForm = document.getElementById('search-generic');
        if (targetForm) targetForm.classList.add('active');
        
        // Pivot Rotation Animation
        if (index !== null && index !== undefined) {
            // Shortest path calculation
            const targetWheelAngle = -index * 90;
            let diff = (targetWheelAngle - currentAngle) % 360;
            if (diff < -180) diff += 360;
            if (diff > 180) diff -= 360;
            
            currentAngle += diff;
            if(ferrisWheel) ferrisWheel.style.transform = `rotate(${currentAngle}deg)`;
        }
    }

    serviceItems.forEach(item => {
        item.addEventListener('click', () => {
            // UI Active State
            document.querySelectorAll('.service-item').forEach(t => t.classList.remove('active'));
            if (item.classList.contains('service-item')) {
                item.classList.add('active');
                if (btnMoreServices) btnMoreServices.classList.remove('active');
            } else {
                if (btnMoreServices) btnMoreServices.classList.add('active');
            }
            
            // If it's a popover item, close popover
            if (item.classList.contains('popover-item') && popover) {
                popover.classList.remove('show');
            }
            
            const formId = item.dataset.form;
            const idx = item.hasAttribute('data-index') ? parseInt(item.getAttribute('data-index')) : null;
            
            switchService(formId, idx);
        });
    });

    // Toggle popover
    if (btnMoreServices) {
        btnMoreServices.addEventListener('click', (e) => {
            e.stopPropagation();
            if(popover) popover.classList.toggle('show');
        });
    }
    document.addEventListener('click', (e) => {
        if (popover && popover.classList.contains('show') && !popover.contains(e.target) && !btnMoreServices.contains(e.target)) {
            popover.classList.remove('show');
        }
    });

    // Logo
    const brandLogo = document.getElementById('brandLogo');
    if (brandLogo) {
        brandLogo.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }
});
</script>
"""

content = re.sub(r'<script>.*?</script>', js_logic, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
