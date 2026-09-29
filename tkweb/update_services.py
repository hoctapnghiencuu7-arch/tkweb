import re

filepath = "d:/DuAnNhom/tkweb/index.html"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. New CSS for Services & Forms & Modal
new_css = """
/* SERVICES NAVIGATION */
.services-nav {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;
    overflow-x: auto;
    scrollbar-width: none; /* Firefox */
}
.services-nav::-webkit-scrollbar { display: none; }
.service-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 70px;
    padding: 8px;
    cursor: pointer;
    border-radius: 8px;
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
    font-weight: 600;
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

/* SCENE MODES EXTENSION */
.hero-scene.mode-neutral { background: #e2e8f0; }
.hero-scene.mode-neutral .env-layer { opacity: 0; }
.hero-scene.mode-neutral .vehicle { display: none; }
"""

# SVG Icons
icons = {
    "hotel": '<svg viewBox="0 0 24 24"><path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zm-9-1a2 2 0 0 1 4 0v1h-4V6zM6 19V9h12v10H6zm3-5h6v2H9v-2z"/></svg>',
    "flight": '<svg viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',
    "train": '<svg viewBox="0 0 24 24"><path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm4.5-6H6V6h12v5h-6zm4.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
    "bus": '<svg viewBox="0 0 24 24"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 2c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v8z"/></svg>',
    "airport": '<svg viewBox="0 0 24 24"><path d="M18.89 12.77c.4-.41.61-1 .61-1.6 0-1.21-.98-2.2-2.19-2.2-.42 0-.82.12-1.16.34L10 6H7l2.5 5.5-3.48-.3L4.74 9H3l1 4-1 4h1.74l1.28-2.2 3.48-.3L7 20h3l6.15-3.31c.34.22.74.34 1.16.34 1.21 0 2.19-.99 2.19-2.2 0-.6-.21-1.19-.61-1.6V12.77z"/></svg>',
    "car": '<svg viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>',
    "activity": '<svg viewBox="0 0 24 24"><path d="M14 6c0-2.21-1.79-4-4-4S6 3.79 6 6s1.79 4 4 4 4-1.79 4-4zm-8 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm12 5.5c0-.83-.67-1.5-1.5-1.5S15 10.67 15 11.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zm-5 4V13h-2v2.5L9.5 17l1.5 5 2.5-1.5V17h1.5l2 4 1.5-1-2.5-4.5z"/></svg>',
    "more": '<svg viewBox="0 0 24 24"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>'
}

services_html = f"""
      <!-- SERVICES NAVIGATION -->
      <div class="services-nav">
        <div class="service-item" data-mode="mode-hotel" data-form="hotel" tabindex="0">
          {icons['hotel']}
          <span>Khách sạn</span>
        </div>
        <div class="service-item active" data-mode="mode-flight" data-form="flight" tabindex="0">
          {icons['flight']}
          <span>Vé máy bay</span>
        </div>
        <div class="service-item" data-mode="mode-train" data-form="train" tabindex="0">
          {icons['train']}
          <span>Vé tàu hỏa</span>
        </div>
        <div class="service-item" data-mode="mode-neutral" data-form="bus" tabindex="0">
          {icons['bus']}
          <span>Vé xe khách</span>
        </div>
        <div class="service-item" data-mode="mode-neutral" data-form="airport-transfer" tabindex="0">
          {icons['airport']}
          <span>Đưa đón sân bay</span>
        </div>
        <div class="service-item" data-mode="mode-neutral" data-form="car-rental" tabindex="0">
          {icons['car']}
          <span>Cho thuê xe</span>
        </div>
        <div class="service-item" data-mode="mode-neutral" data-form="activity" tabindex="0">
          {icons['activity']}
          <span>Hoạt động & Vui chơi</span>
        </div>
        <div class="service-item" id="btn-more-services" tabindex="0">
          {icons['more']}
          <span>Khác</span>
        </div>
      </div>

      <!-- MORE SERVICES POPOVER -->
      <div class="more-popover" id="moreServicesPopover">
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
            <div class="popover-item" data-mode="mode-cruise" data-form="cruise">Du thuyền</div>
          </div>
        </div>
      </div>
"""

# Forms HTML
forms_html = """
      <!-- Flight Search -->
      <div class="search-form-view active" id="search-flight">
        <div style="display: flex; gap: 16px; margin-bottom: 8px; font-size: 13px; color: #1c2430; font-weight: 500;">
          <label><input type="radio" name="flight_trip" checked style="accent-color: #0194f3; margin-right: 6px;"> Một chiều</label>
          <label><input type="radio" name="flight_trip" style="accent-color: #0194f3; margin-right: 6px;"> Khứ hồi</label>
        </div>
        <div class="search-inputs-grid">
          <div class="input-item"><label>Điểm đi</label><input type="text" value="Hà Nội (HAN)"></div>
          <div class="input-item"><label>Điểm đến</label><input type="text" value="TP. HCM (SGN)"></div>
          <div class="input-item"><label>Ngày đi</label><input type="date" value="2026-09-25"></div>
          <div class="input-item"><label>Hành khách</label><input type="text" value="1 Người lớn, Phổ thông"></div>
          <button class="btn-search-trigger" onclick="alert('Chức năng đang phát triển!')">Tìm chuyến bay</button>
        </div>
      </div>

      <!-- Hotel Search -->
      <div class="search-form-view" id="search-hotel">
        <div class="search-inputs-grid" style="grid-template-columns: 1fr 1fr 1fr 1.5fr auto;">
          <div class="input-item"><label>Điểm đến</label><input type="text" value="Đà Lạt"></div>
          <div class="input-item"><label>Nhận phòng</label><input type="date" value="2026-10-01"></div>
          <div class="input-item"><label>Trả phòng</label><input type="date" value="2026-10-03"></div>
          <div class="input-item"><label>Khách & phòng</label><input type="text" value="2 Khách, 1 Phòng"></div>
          <button class="btn-search-trigger" onclick="alert('Chưa triển khai!')">Tìm khách sạn</button>
        </div>
      </div>

      <!-- Train Search -->
      <div class="search-form-view" id="search-train">
        <div class="search-inputs-grid">
          <div class="input-item"><label>Ga đi</label><input type="text" value="Hà Nội"></div>
          <div class="input-item"><label>Ga đến</label><input type="text" value="Lào Cai"></div>
          <div class="input-item"><label>Ngày đi</label><input type="date" value="2026-11-05"></div>
          <div class="input-item"><label>Hành khách</label><input type="text" value="1 Người lớn, Ngồi mềm"></div>
          <button class="btn-search-trigger" onclick="alert('Chưa triển khai!')">Tìm vé tàu</button>
        </div>
      </div>

      <!-- Bus Search -->
      <div class="search-form-view" id="search-bus">
        <div class="search-inputs-grid">
          <div class="input-item"><label>Điểm đi</label><input type="text" value="TP. HCM"></div>
          <div class="input-item"><label>Điểm đến</label><input type="text" value="Nha Trang"></div>
          <div class="input-item"><label>Ngày đi</label><input type="date" value="2026-12-01"></div>
          <div class="input-item"><label>Hành khách</label><input type="text" value="1 Người lớn"></div>
          <button class="btn-search-trigger" onclick="alert('Chưa triển khai!')">Tìm vé xe</button>
        </div>
      </div>

      <!-- Airport Transfer Search -->
      <div class="search-form-view" id="search-airport-transfer">
        <div class="search-inputs-grid">
          <div class="input-item"><label>Sân bay</label><input type="text" value="Nội Bài (HAN)"></div>
          <div class="input-item"><label>Điểm đón / Điểm đến</label><input type="text" value="Quận Cầu Giấy"></div>
          <div class="input-item"><label>Ngày / giờ</label><input type="datetime-local" value="2026-09-26T08:00"></div>
          <div class="input-item"><label>Số hành khách</label><input type="text" value="2 Người lớn"></div>
          <button class="btn-search-trigger" onclick="alert('Chưa triển khai!')">Tìm xe</button>
        </div>
      </div>

      <!-- Car Rental Search -->
      <div class="search-form-view" id="search-car-rental">
        <div class="search-inputs-grid">
          <div class="input-item"><label>Địa điểm nhận xe</label><input type="text" value="Đà Nẵng"></div>
          <div class="input-item"><label>Địa điểm trả xe</label><input type="text" value="Đà Nẵng"></div>
          <div class="input-item"><label>Ngày / giờ</label><input type="datetime-local" value="2026-10-15T09:00"></div>
          <div class="input-item"><label>Loại xe</label><input type="text" value="Tự lái (4 chỗ)"></div>
          <button class="btn-search-trigger" onclick="alert('Chưa triển khai!')">Tìm xe</button>
        </div>
      </div>

      <!-- Activity Search -->
      <div class="search-form-view" id="search-activity">
        <div class="search-inputs-grid" style="grid-template-columns: 1fr 1fr 1fr auto;">
          <div class="input-item"><label>Địa điểm</label><input type="text" value="Phú Quốc"></div>
          <div class="input-item"><label>Ngày</label><input type="date" value="2026-11-20"></div>
          <div class="input-item"><label>Loại hoạt động</label><input type="text" value="Tất cả"></div>
          <button class="btn-search-trigger" onclick="alert('Chưa triển khai!')">Tìm hoạt động</button>
        </div>
      </div>
      
      <!-- Insurance Search -->
      <div class="search-form-view" id="search-insurance">
        <div class="search-inputs-grid">
          <div class="input-item"><label>Điểm đến</label><input type="text" value="Châu Âu"></div>
          <div class="input-item"><label>Ngày đi</label><input type="date" value="2026-10-01"></div>
          <div class="input-item"><label>Ngày về</label><input type="date" value="2026-10-15"></div>
          <div class="input-item"><label>Số người</label><input type="text" value="2 Người"></div>
          <button class="btn-search-trigger" onclick="alert('Chưa triển khai!')">Tìm bảo hiểm</button>
        </div>
      </div>
      
      <!-- Tour Search -->
      <div class="search-form-view" id="search-tour">
        <div class="search-inputs-grid" style="grid-template-columns: 1.5fr 1fr 1fr auto;">
          <div class="input-item"><label>Điểm đến</label><input type="text" value="Sapa"></div>
          <div class="input-item"><label>Ngày</label><input type="date" value="2026-12-24"></div>
          <div class="input-item"><label>Số khách</label><input type="text" value="2 Khách"></div>
          <button class="btn-search-trigger" onclick="alert('Chưa triển khai!')">Tìm tour</button>
        </div>
      </div>

      <!-- Cruise Search (replaces old) -->
      <div class="search-form-view" id="search-cruise">
        <div class="search-inputs-grid">
          <div class="input-item"><label>Điểm đi</label><input type="text" value="Hạ Long"></div>
          <div class="input-item"><label>Điểm đến</label><input type="text" value="Cát Bà"></div>
          <div class="input-item"><label>Ngày khởi hành</label><input type="date" value="2026-10-10"></div>
          <div class="input-item"><label>Số khách</label><input type="text" value="2 Người lớn, 1 Cabin"></div>
          <button class="btn-search-trigger" onclick="alert('Chưa triển khai!')">Tìm du thuyền</button>
        </div>
      </div>
      
      <!-- Generic Fallback Search -->
      <div class="search-form-view" id="search-generic">
        <div class="search-inputs-grid" style="grid-template-columns: 1fr auto;">
          <div class="input-item"><label>Khám phá</label><input type="text" placeholder="Bạn muốn tìm gì?"></div>
          <button class="btn-search-trigger" onclick="alert('Chưa triển khai!')">Tìm kiếm</button>
        </div>
      </div>
"""

# New JS logic for Tabs & Modal
js_logic = """
    // Extended Scene & Search Switcher
    const serviceItems = document.querySelectorAll('.service-item[data-mode], .popover-item[data-mode]');
    const searchForms = document.querySelectorAll('.search-form-view');
    const heroScene = document.getElementById('heroScene');
    const btnMoreServices = document.getElementById('btn-more-services');
    const popover = document.getElementById('moreServicesPopover');
    const titleTexts = {
        'flight': 'Ready to take off?',
        'hotel': 'Ready to relax?',
        'train': 'Ready to depart?',
        'cruise': 'Ready to sail?',
        'bus': 'Ready to ride?',
        'airport-transfer': 'Ready for pickup?',
        'car-rental': 'Ready to drive?',
        'activity': 'Ready to explore?',
        'generic': 'Ready to discover?'
    };
    
    // Toggle popover
    if (btnMoreServices) {
        btnMoreServices.addEventListener('click', (e) => {
            e.stopPropagation();
            popover.classList.toggle('show');
            btnMoreServices.classList.toggle('active');
        });
    }
    document.addEventListener('click', (e) => {
        if (popover && popover.classList.contains('show') && !popover.contains(e.target) && !btnMoreServices.contains(e.target)) {
            popover.classList.remove('show');
            btnMoreServices.classList.remove('active');
        }
    });

    serviceItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active state in main nav
            document.querySelectorAll('.service-item').forEach(t => t.classList.remove('active'));
            if (item.classList.contains('service-item')) {
                item.classList.add('active');
            } else {
                // If it's a popover item, highlight the 'More' button
                btnMoreServices.classList.add('active');
                popover.classList.remove('show');
            }
            
            const mode = item.dataset.mode;
            const formId = item.dataset.form;
            
            // Switch Mode Class on Hero
            heroScene.className = 'hero-scene ' + mode;
            
            // Update Title (best effort fallback)
            const heroTitle = document.getElementById('heroTitle');
            if (heroTitle) {
                heroTitle.textContent = titleTexts[formId] || titleTexts['generic'];
            }
            
            // Switch Search Form
            searchForms.forEach(f => f.classList.remove('active'));
            let targetForm = document.getElementById('search-' + formId);
            if (!targetForm) {
                targetForm = document.getElementById('search-generic');
            }
            if (targetForm) targetForm.classList.add('active');
        });
    });
"""

# Inject CSS
content = content.replace("</style>", new_css + "\n</style>")

# Replace Old Tabs with New Navigation & Popover
content = re.sub(
    r'<div class="travel-tabs".*?</div>',
    services_html,
    content,
    flags=re.DOTALL
)

# Replace Old Forms with New Forms
content = re.sub(
    r'<!-- Flight Search -->.*?</div>\s*</section>',
    forms_html + '\n    </div>\n  </section>',
    content,
    flags=re.DOTALL
)

# Replace JS logic
# Remove old logic:
content = re.sub(
    r'// Scene Switcher.*?\}\);',
    '',
    content,
    flags=re.DOTALL,
    count=1
)
# We need to insert the new JS right after `document.addEventListener('DOMContentLoaded', () => {`
body_start = content.find("document.addEventListener('DOMContentLoaded', () => {")
if body_start != -1:
    insert_pos = body_start + len("document.addEventListener('DOMContentLoaded', () => {")
    content = content[:insert_pos] + js_logic + content[insert_pos:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
