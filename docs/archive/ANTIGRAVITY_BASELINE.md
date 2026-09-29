# ANTIGRAVITY REPOSITORY BASELINE & FORENSIC DISCOVERY REPORT
**Dự Án:** SkyWings Airlines (`tkweb`)  
**Workspace Root:** `D:\DuAnNhom` | **Project Directory:** `D:\DuAnNhom\tkweb`  
**Tiêu Chuẩn Kiểm Định:** ISO/IEC 25010, WCAG 2.1 AA & Antigravity Control Pack (`AGENTS.md`, `.agents/rules/*.md`, `tkweb-repair` skill)  
**Tài Liệu Tái Khảo Sát:** `d:\Download\TKWEB_LIVE_UIUX_RECHECK_REPORT.md` (Live UI/UX Re-check ngày 14/09/2026)  
**Thời Điểm Khảo Sát:** 14/09/2026  
**Chế Độ:** Phase 1 Forensic Discovery & Baseline Specification (Read-Only Audit)

---

## 1. Bản Đồ Cấu Trúc Toàn Bộ Repository (Repository Inventory)

```text
D:\DuAnNhom\
├── admin-system\                        # Hệ thống backend & admin React mở rộng
│   ├── backend\                         # Node.js + Express REST API + Prisma/SQLite
│   │   └── src\modules\                 # [analytics, audit, auth, bookings, cms, customers, flights, payments, pricing]
│   └── frontend\                        # React TypeScript + Vite + Tailwind CSS dashboard
├── .agents\                             # Cấu hình Antigravity Workspace Control Pack
│   ├── rules\
│   │   ├── 01-workflow.md               # Quy trình 8 bước sửa chữa & kiểm định chống hồi quy
│   │   ├── 02-scope-and-deletion.md     # Ranh giới an toàn, cấm rewrite & chống xóa file
│   │   └── token-optimization.md        # Tối ưu hóa ngữ cảnh và token
│   ├── scripts\
│   │   ├── check-diff.sh                # Kiểm tra git diff an toàn trước commit
│   │   └── repair-gate.sh               # Cổng kiểm định kiểm thử tự động
│   ├── skills\
│   │   └── tkweb-repair\
│   │       ├── SKILL.md                 # Kỹ năng định hướng sửa lỗi SkyWings
│   │       └── references\
│   │           └── repair-checklist.md  # Danh mục kiểm tra UI shell & form
│   └── hooks.json                       # Lifecycle hooks
├── tkweb\                               # CORE PORTAL: Cổng thông tin & Đặt vé máy bay trực tuyến
│   ├── .agents\                         # Bản sao Control Pack tại project root
│   │   ├── rules\
│   │   ├── scripts\
│   │   ├── skills\
│   │   └── hooks.json
│   ├── admin\
│   │   └── index.html                   # Quản trị điều hành, quản lý đơn hàng & Website CMS Editor
│   ├── assets\
│   │   ├── css\
│   │   │   └── style.css                # Toàn bộ CSS giao diện, design tokens & responsive
│   │   ├── images\
│   │   │   ├── airlines\ (*.svg)        # 13 logo vector SVG của các hãng hàng không
│   │   │   ├── avatars\                 # Avatar người dùng & ban quản trị
│   │   │   └── icons\                   # Hệ thống icon giao diện
│   │   ├── js\
│   │   │   ├── main.js                  # Engine ứng dụng, Central State Store & CMS Controller
│   │   │   └── three.min.js             # Thư viện Three.js WebGL 3D
│   │   └── vendor\
│   │       ├── chartjs\chart.umd.min.js # Biểu đồ doanh thu & tỷ lệ lấp đầy
│   │       ├── flatpickr\               # Bộ chọn ngày bay
│   │       ├── imask\imask.min.js       # Masking thẻ tín dụng
│   │       └── sweetalert2\             # Thông báo hộp thoại
│   ├── components\
│   │   ├── header.html                  # Header mẫu
│   │   └── footer.html                  # Footer chuẩn hàng không
│   ├── database\
│   │   └── database.sql                 # CSDL mẫu MySQL/SQLite (bảng flights, bookings, users)
│   ├── pages\
│   │   ├── booking.html                 # Bước 2 Funnel: Thông tin hành khách & Dịch vụ bổ trợ
│   │   ├── flights.html                 # Bước 1 Funnel: Kết quả tìm kiếm vé & Lọc chuyến bay
│   │   ├── login.html                   # Đăng nhập (Khách hàng & 1-Click Admin Demo)
│   │   ├── payment.html                 # Bước 4 Funnel: Cổng thanh toán Sandbox đa kênh
│   │   ├── register.html                # Đăng ký thành viên mới (+500 SkyMiles)
│   │   ├── schedule.html                # Tra cứu lịch trình bay tuần & Bảng FIDS thời gian thực
│   │   ├── seats.html                   # Bước 3 Funnel: Sơ đồ chọn chỗ ngồi Thương gia / Phổ thông
│   │   └── ticket.html                  # Bước 5 Funnel: Thẻ lên tàu bay Boarding Pass & QR Code
│   ├── portfolio\
│   │   └── index.html                   # Hồ sơ tác giả đồ án
│   ├── tests\
│   │   ├── screenshots\ (*.png)         # 16 ảnh chụp kiểm thử tự động Headless CDP
│   │   ├── static-analysis.js           # Kiểm thử tĩnh: 11 HTML, 13 SVG, cú pháp JS/CSS
│   │   ├── take_all_screenshots.js      # Runner chụp ảnh Headless Edge CDP đa kích thước
│   │   └── test_seat_class_restrictions.js # Kiểm thử logic phân vùng hạng ghế
│   ├── AGENTS.md                        # Hiến pháp quản trị mã nguồn của AI
│   ├── AUDIT_UIUX_AND_REPAIR_PLAN.md    # Tài liệu quy chuẩn sửa chữa & 4 Sprint Audit
│   ├── ANTIGRAVITY_BASELINE.md          # Báo cáo cơ sở pháp y này
│   ├── ANTIGRAVITY_ISSUES.md            # Sổ theo dõi danh mục lỗi BUG-ID chi tiết
│   ├── TKWEB_LIVE_UIUX_RECHECK_REPORT.md# Báo cáo tái kiểm tra thực tế (Live Re-Check)
│   ├── index.html                       # Trang chủ SkyWings + 3D Runway Engine
│   └── README.md                        # Giới thiệu & hướng dẫn cài đặt đồ án
└── docs\                                # Tài liệu đặc tả hệ thống
```

---

## 2. Danh Mục Các Trang & Phân Loại Định Tuyến (Page & Routing Inventory)

| STT | File Route | Tên Trang & Chức Năng | Phân Loại Quyền | Shared UI Dependencies | Kích Thước File |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `/index.html` | Trang chủ SkyWings: Hero 3D WebGL, Tìm vé 1 hàng, Chặng bay hot, Dịch vụ | Public | `.ngefly-header`, `.ngefly-footer`, `style.css`, `main.js`, `three.min.js` | 40,115 bytes |
| 2 | `/pages/flights.html` | Bước 1 Funnel: Danh sách vé máy bay, bộ lọc hãng/giờ/giá, ma trận giá vé | Public | `.ngefly-header`, `.results-header-bar`, `.ngefly-footer`, `style.css`, `main.js` | 58,158 bytes |
| 3 | `/pages/schedule.html` | Tra cứu lịch trình bay tuần, Bảng hiển thị điện tử FIDS thời gian thực | Public | `.ngefly-header`, `.ngefly-footer`, `style.css`, `main.js` | 74,327 bytes |
| 4 | `/pages/booking.html` | Bước 2 Funnel: Thông tin hành khách, khách sạn, đưa đón sân bay, bảo hiểm | Public | `.flight-context-strip`, `.modern-step-node`, `.ngefly-footer`, `style.css`, `main.js` | 37,824 bytes |
| 5 | `/pages/seats.html` | Bước 3 Funnel: Sơ đồ chọn chỗ ngồi Thương gia (10-12) / Phổ thông (14-16) | Public | `.flight-context-strip`, `.modern-step-node`, `.ngefly-footer`, `style.css`, `main.js` | 36,865 bytes |
| 6 | `/pages/payment.html` | Bước 4 Funnel: Cổng thanh toán Sandbox (VNPAY, MoMo, ZaloPay, Thẻ Visa/Master) | Public | `.flight-context-strip`, `.modern-step-node`, `.ngefly-footer`, `style.css`, `main.js` | 58,498 bytes |
| 7 | `/pages/ticket.html` | Bước 5 Funnel: Thẻ lên tàu bay điện tử chuẩn PNR, mã vạch PDF417 & mã QR | Public | `.flight-context-strip`, `.modern-step-node`, `.ngefly-footer`, `style.css`, `main.js` | 41,685 bytes |
| 8 | `/pages/login.html` | Đăng nhập tài khoản hành khách, Nút 1-Click Đăng nhập Quản trị viên Demo | Public | `style.css`, `main.js` | 20,089 bytes |
| 9 | `/pages/register.html` | Đăng ký thành viên SkyWings Club & Tặng 500 SkyMiles chào mừng | Public | `style.css`, `main.js` | 19,288 bytes |
| 10 | `/admin/index.html` | Bảng điều khiển quản trị, quản lý đơn hàng PNR & Website CMS Editor | Protected (Admin Guard) | Role Guard (`admin`), `Chart.js`, `style.css`, `main.js` | 59,115 bytes |
| 11 | `/portfolio/index.html`| Trang hồ sơ cá nhân tác giả đồ án | Public | `style.css` | 6,261 bytes |

---

## 3. Danh Mục Thành Phần Dùng Chung & Kiến Trúc Giao Diện (Shared UI Components)

1. **Header Điều Hướng Toàn Cục (`.ngefly-header`)**:
   - Logo thương hiệu SkyWings kết hợp huy hiệu vector.
   - Menu điều hướng đa tầng: Trang Chủ, Chuyến Bay, Lịch Trình, Đặt Chỗ, Vé Của Bạn, Quản Trị.
   - Nút chuyển chế độ Sáng/Tối (`#theme-toggle-btn`), Quick search, User menu & Avatar.
   - Mobile Navigation Drawer trượt tự động từ lề phải trên màn hình ≤ 768px.
   - *Điểm cần cải thiện đã phát hiện:* Trên mobile, `.header-right` đang nhồi nhét quá nhiều nút dẫn đến co ép layout. Cần tinh giản chỉ giữ Logo + Theme Toggle + Burger Menu.

2. **Chân Trang Chuẩn Hàng Không (`.ngefly-footer`)**:
   - Khối đăng ký bản tin giảm giá 25% (Mã: SKY25VIP).
   - Hotline hỗ trợ 24/7 (1900 6868) & email chăm sóc khách hàng (`support@skywings.vn`).
   - Huy hiệu minh bạch chế độ Sandbox (Không thu thập thẻ thật).
   - Hệ thống liên kết điều hướng, bản quyền và nút cuộn mượt lên đầu trang (`#footer-back-to-top`).

3. **Thanh Tiến Trình Đặt Vé 5 Bước (`.modern-step-node`)**:
   - Đồng bộ xuyên suốt 5 trang funnel:
     `1. Chọn Vé ➔ 2. Nhập Thông Tin ➔ 3. Chọn Chỗ Ngồi ➔ 4. Thanh Toán ➔ 5. Nhận Vé`
   - Hiển thị trực quan trạng thái: Hoàn tất (`.completed`), Đang thực hiện (`.active`), Chưa tới (`.pending`).
   - *Điểm cần cải thiện:* Stepper track đặt `min-width: 580px` cần tối ưu hiển thị gọn gàng trên mobile (Bước 3/5).

4. **Thanh Bối Cảnh Chuyến Bay Dùng Chung (`.flight-context-strip`)**:
   - Ghim thông tin chặng bay (SGN ➔ HAN), mã chuyến (SW-882), ngày giờ bay, hạng vé và tổng tiền tạm tính trên đầu các trang bước 2, 3, 4, 5.

---

## 4. Bản Đồ Phông Chữ, Biểu Tượng & Tài Nguyên (Font / Asset Map)

### 4.1. Hệ Thống Phông Chữ (Typography)
- **Phông chữ chính (Primary Font):** Cần chuẩn hóa thống nhất về `Plus Jakarta Sans` với fallback stack an toàn (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Phông chữ mã số / Boarding Pass:** `JetBrains Mono` / `SF Pro Display` cho mã PNR và giờ bay.
- **Rủi ro phát hiện:** Tồn tại sự phân tán giữa Google Fonts link trong HTML (`Inter`, `Plus Jakarta Sans`) và `@import` trong CSS. Cần hợp nhất 1 nguồn nạp duy nhất.

### 4.2. Hệ Thống Biểu Tượng & Vector (Icons & SVG Assets)
- **13 Logo SVG Vector Hãng Hàng Không Đối Tác (`assets/images/airlines/*.svg`):**
  1. `bamboo-airways.svg` (1,587 B)
  2. `dtw-airlines.svg` (2,003 B)
  3. `emirates.svg` (1,445 B)
  4. `flydubai.svg` (1,494 B)
  5. `khang-air.svg` (1,973 B)
  6. `ondy-air.svg` (2,339 B)
  7. `qatar-airways.svg` (1,765 B)
  8. `saudia.svg` (2,301 B)
  9. `singapore-airlines.svg` (1,746 B)
  10. `skywings.svg` (944 B)
  11. `vietjet-air.svg` (1,113 B)
  12. `vietnam-airlines.svg` (2,223 B)
  13. `vietravel-airlines.svg` (1,219 B)

---

## 5. Bản Đồ Dữ Liệu Phía Client & Liên Kết Backend (Data & Backend Map)

### 5.1. Tầng Lưu Trữ Client-Side (`localStorage` qua `SecurityVault`)

| Tên Khóa (Storage Key) | Mục Đích Lưu Trữ | Cơ Chế Xử Lý | Phạm Vi Ảnh Hưởng |
| :--- | :--- | :--- | :--- |
| `skywings_site_content` | Nội dung trang web biên tập qua CMS Admin (Hero, Why Choose, Footer, SEO) | `SecurityVault.encrypt()` | CMS Admin ➔ Trang chủ (`index.html`) |
| `skywings_cms_revisions` | Lưu trữ 10 phiên bản sửa đổi gần nhất để Rollback 1-click | `SecurityVault.encrypt()` | CMS Admin (`admin/index.html`) |
| `skywings_orders` | Danh sách đơn đặt vé PNR động, thông tin hành khách & trạng thái vé | `SecurityVault.encrypt()` | Payment ➔ Admin Orders Table |
| `skywings_user` | Phiên đăng nhập người dùng & phân quyền vai trò (`admin` / `customer`) | `SecurityVault.encrypt()` | Toàn bộ trang web & Admin Guard |
| `ngefly_search_params` | Tiêu chí tìm kiếm vé (Điểm đi, điểm đến, ngày bay, số khách, hạng vé) | JSON Plain / Storage | Search ➔ Flights ➔ Booking |
| `ngefly_flight_details` | Thông tin chi tiết chuyến bay đã chọn (Mã chuyến, giờ bay, giá cơ sở) | JSON Plain / Storage | Flights ➔ Booking ➔ Seats |
| `ngefly_booking_info` | Thông tin liên hệ hành khách, hành lý, dịch vụ bổ trợ đã chọn | `SecurityVault.encrypt()` | Booking ➔ Seats ➔ Payment |
| `ngefly_selected_seat` | Mã vị trí ghế ngồi đã xác nhận (VD: `10F` Thương gia, `14A` Phổ thông) | Plain string | Seats ➔ Payment ➔ Ticket |
| `ngefly_pnr` | Mã đặt chỗ 6 ký tự PNR độc nhất sinh ngẫu nhiên (VD: `SW-9824K1`) | Plain string | Payment ➔ Ticket ➔ Admin |

---

## 6. Lệnh Kiểm Định & Quy Trình Chống Hồi Quy (Verification & Test Map)

Dự án sở hữu bộ ba công cụ kiểm thử:
1. **Kiểm thử phân tích cú pháp tĩnh:** `node tests/static-analysis.js` (11/11 HTML PASS, 13/13 SVG PASS, 0 lỗi cú pháp).
2. **Kiểm thử logic phân vùng hạng ghế:** `node tests/test_seat_class_restrictions.js` (100% PASS).
3. **Kiểm thử chụp ảnh toàn diện Headless CDP:** `node tests/take_all_screenshots.js` (16 screenshots).

---

## 7. Đánh Giá Các Thành Phần Rủi Ro Cao Nhất (High-Risk Shared Dependencies)

1. **`assets/js/main.js` (7,900+ dòng lệnh):**
   - Chứa lỗ hổng nghiêm trọng `isDevBypass` tại dòng 7147 và cấp role admin client-side tùy tiện tại dòng 6978. Phải xử lý triệt để tại Ticket 1.
2. **`assets/css/style.css` (310+ KB, 1,771 khối rule, 291 `!important`):**
   - Kích thước quá lớn và nhiều layer override đè lên nhau gây ra hiện tượng "sửa header hỏng footer, sửa mobile hỏng desktop". Phải tuân thủ nghiêm ngặt nguyên tắc sửa từng component khu biệt.
3. **`admin/index.html` (255 inline styles):**
   - Mật độ thông tin quá dày đặc và số lượng inline styles quá lớn gây khó khăn cho việc bảo trì theme dark/light.

---

## 8. Nguyên Tắc Sửa Chữa & Định Nghĩa Hoàn Thành (Definition of Done)

Từ kết luận của `TKWEB_LIVE_UIUX_RECHECK_REPORT.md`, Antigravity chuyển đổi quy trình từ "Sửa toàn bộ dự án cùng lúc" sang mô hình:
```text
ONE TICKET ➔ LOCALIZED PATCH ➔ BUILD CHECK ➔ CONSOLE CHECK ➔ LIGHT/DARK CHECK ➔ MULTI-VIEWPORT VERIFY ➔ SCREENSHOT EVIDENCE ➔ REGRESSION ➔ LOG
```
Tuyệt đối không tuyên bố PASS chỉ dựa vào biên dịch tĩnh; mỗi bản vá phải được kiểm tra thực tế trên 5 dải màn hình: `320px`, `375px`, `390px`, `768px`, và `1440px`.
