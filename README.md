# ✈️ SKYWINGS AIRLINES — HỆ THỐNG ĐẶT VÉ MÁY BAY TRỰC TUYẾN

> **Đồ án môn học:** Lập trình Web / Thiết Kế & Phát Triển Ứng Dụng Web  
> **Thương hiệu dự án:** SkyWings Airlines (Ngefly Booking Platform)  
> **Mã nguồn dự án:** `D:\DuAnNhom`

---

## 📌 1. Giới Thiệu Tổng Quan & Cấu Trúc Dự Án

Dự án được quy hoạch thành các phân hệ độc lập, rõ ràng theo đúng chuẩn phân tách trách nhiệm (Separation of Concerns):

```text
DuAnNhom/
├── README.md                          ← Hướng dẫn vận hành, kiến trúc và kiểm thử duy nhất của dự án
├── .gitignore                         ← Cấu hình loại trừ cache AI, node_modules, log và file môi trường
├── AGENTS.md                          ← Bộ quy tắc kiểm soát mã nguồn và kiểm thử hồi quy nghiêm ngặt
├── docs/                              ← Tài liệu tổng hợp & báo cáo nghiệm thu kỹ thuật
│   ├── BAO_CAO_TONG_HOP_DU_AN.md      ← Báo cáo tổng hợp chi tiết tính năng & nghiệp vụ
│   └── reports/                       ← Kho lưu trữ các báo cáo kiểm thử (Audit / Progress / Baseline)
│       ├── ANTIGRAVITY_BASELINE.md
│       ├── ANTIGRAVITY_ISSUES.md
│       ├── ANTIGRAVITY_MASTER_REPAIR_PROTOCOL.md
│       ├── AUDIT_UIUX_AND_REPAIR_PLAN.md
│       ├── TKWEB_LIVE_UIUX_RECHECK_REPORT.md
│       └── TKWEB_PROGRESS_AND_HANDOVER_REPORT.md
├── portfolio/                         ← Trang hồ sơ năng lực cá nhân (Personal Portfolio của sinh viên)
│   └── index.html
├── tkweb/                             ← Phân hệ Web Đặt Vé Khách Hàng (Customer Booking Site)
│   ├── index.html                     (Trang chủ: Đồ họa 3D Three.js mô phỏng máy bay & đường băng)
│   ├── pages/                         (flights.html, booking.html, seats.html, payment.html, ticket.html, schedule.html, ...)
│   ├── assets/                        (css/, js/, images/, lib/)
│   ├── components/                    (header.html, footer.html)
│   ├── database/                      (database.sql - Lược đồ CSDL quan hệ MySQL chuẩn đồ án Web)
│   ├── admin/                         (Bản Prototype giao diện Admin tĩnh ban đầu - Client-side Storage)
│   └── tests/                         (Hệ thống 15 test suites tự động kiểm thử toàn diện giao diện & A11y)
└── admin-system/                      ← Phân hệ Quản Trị Doanh Nghiệp Chính Thức (Official Admin Portal)
    ├── database/                      (schema.sql - Tài liệu thiết kế DDL PostgreSQL Enterprise 22 bảng)
    ├── backend/                       (Express, TypeScript, JWT Auth, RBAC, Dynamic Pricing, Unit Tests)
    ├── frontend/                      (React, Vite, TypeScript, Tailwind CSS, Lucide Icons)
    └── README.md
```

---

## 🏛️ 2. Làm Rõ Kiến Trúc & Tính Trung Thực Về Dữ Liệu (Architecture Truths)

Nhằm đảm bảo tính minh bạch, nhất quán và trung thực tuyệt đối trong báo cáo đồ án:

### 2.1. Phân định Hệ thống Quản Trị (Admin Portal)
* **Hệ thống Quản Trị Chính Thức (`admin-system/`):**
  - Đây là cổng quản trị doanh nghiệp **duy nhất** được sử dụng để đánh giá năng lực lập trình Fullstack.
  - Xây dựng trên nền tảng **React (Vite) + Express (TypeScript)**, tích hợp cơ chế bảo mật **JWT (JSON Web Token)**, xác thực mật khẩu nghiêm ngặt, phân quyền 4 vai trò (**RBAC**), thuật toán tính giá động (**Dynamic Pricing Engine**), bộ giải phóng ghế tự động (**Seat Hold Sweeper**) và hệ thống **15 Unit Tests**.
* **Bản Prototype cũ (`tkweb/admin/`):**
  - Đây là bản **phác thảo giao diện tĩnh ban đầu** (HTML/CSS/JS thuần, lưu tạm vào `localStorage`). 
  - Bản này được giữ lại với mục đích học thuật nhằm đối chiếu tiến độ giao diện và đảm bảo tính tương thích cho bộ kiểm thử tĩnh (Static Analysis & WCAG A11y), **không phải hệ thống quản trị phục vụ vận hành thực tế**.

### 2.2. Cơ Sở Dữ Liệu & Cơ Chế Zero-Configuration Demo
* **Tài liệu thiết kế CSDL (`admin-system/database/schema.sql`):**
  - File SQL này là **tài liệu thiết kế lược đồ quan hệ DDL chuẩn PostgreSQL Enterprise** gồm 22 bảng (phân quyền RBAC, ràng buộc khóa ngoại, soft-delete cho giao dịch tài chính).
  - ⚠️ **Lưu ý minh bạch:** Phân hệ `admin-system` **chưa kết nối trực tiếp với PostgreSQL server ngoài** (không phụ thuộc driver `pg`).
* **Lớp lưu trữ In-Memory Transactional Store (`store.ts`):**
  - Backend của `admin-system` chủ động vận hành trên lớp **In-Memory Transactional Store** tự sinh dữ liệu mẫu giả lập theo đúng cấu trúc của `schema.sql`.
  - **Mục đích thiết kế:** Giúp giảng viên và ban giám khảo có thể chạy thử nghiệm và chấm điểm ngay lập tức (**Zero-Configuration Demo**) mà không cần cài đặt, khởi tạo hay cấu hình daemon PostgreSQL trên máy cá nhân.
* **Lược đồ MySQL (`tkweb/database/database.sql`):**
  - Cung cấp cấu trúc bảng quan hệ và dữ liệu mẫu chuẩn cú pháp MySQL theo đúng tiêu chuẩn môn học Lập trình Web.

---

## 🚀 3. Hướng Dẫn Vận Hành & Khởi Chạy

### 3.1. Chạy Phân Hệ Web Khách Hàng (`tkweb/`)
Trang web khách hàng được xây dựng hoàn toàn bằng HTML5, CSS3 hiện đại, JavaScript ES6+ và WebGL (Three.js):
- **Cách 1 (Nhanh nhất):** Nhấp đúp chuột vào file `tkweb/index.html` hoặc mở qua tiện ích **Live Server** trong VS Code.
- **Cách 2 (HTTP Server):**
  ```bash
  cd D:\DuAnNhom\tkweb
  npx serve -l 3000 .
  ```
  Truy cập trình duyệt: `http://localhost:3000`

### 3.2. Chạy Phân Hệ Quản Trị Doanh Nghiệp (`admin-system/`)

#### Bước 1: Cấu hình Môi Trường & Khởi động Backend API
```bash
cd D:\DuAnNhom\admin-system\backend
npm install
# Khuyến nghị bảo mật khi deploy: tạo file môi trường riêng từ file mẫu
cp .env.example .env
npm run dev
```
- **REST API Base URL:** `http://localhost:5001/api`
- **Tài liệu OpenAPI 3.0 / Swagger Specs:** `http://localhost:5001/api/docs`
- **Kiểm tra Health Check:** `http://localhost:5001/api/health`

> ⚠️ **Lưu ý bảo mật JWT Token**: Hệ thống cung cấp sẵn file mẫu `admin-system/backend/.env.example`. Trong môi trường thử nghiệm cục bộ, nếu chưa tạo `.env`, backend tự động fallback sang khóa dev để đảm bảo chạy mượt mà không bị gián đoạn. Khi đưa lên môi trường sản phẩm (production/staging), **bắt buộc tạo file `.env` và thiết lập `JWT_SECRET` ngẫu nhiên bí mật riêng** (ví dụ tạo bằng `openssl rand -base64 48`) để ngăn ngừa tấn công giả mạo token quản trị viên.

#### Bước 2: Khởi động Frontend Admin Dashboard
```bash
cd D:\DuAnNhom\admin-system\frontend
npm install
npm run dev
```
- **Giao diện Quản Trị:** Mở trình duyệt tại `http://localhost:5173`

---

## 🔐 4. Danh Sách Tài Khoản Đăng Nhập Quản Trị (RBAC)

Cơ chế xác thực sử dụng mã hóa mật khẩu và **JWT ký số thuật toán HMAC-SHA256**. Hệ thống từ chối mọi yêu cầu đăng nhập sai mật khẩu:

| Vai Trò (Role) | Tên Đăng Nhập / Email | Mật Khẩu Chuẩn | Quyền Hạn & Phạm Vi Thao Tác |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin` hoặc `admin@skywings.vn` | `admin123` | Toàn quyền kiểm soát hệ thống, thêm chuyến bay, quản lý nhân sự, xem audit logs. |
| **CSKH (Dịch Vụ)** | `cskh` hoặc `cskh@skywings.vn` | `cskh123` | Tra cứu PNR, hỗ trợ đổi thông tin hành khách/chỗ ngồi, tạo yêu cầu hoàn hủy vé. |
| **Kế Toán (Tài Chính)** | `ketoan` hoặc `ketoan@skywings.vn` | `ketoan123` | Phê duyệt hoàn tiền, đối soát giao dịch cổng thanh toán, xuất hóa đơn VAT điện tử. |
| **Marketing** | `marketing` hoặc `marketing@skywings.vn` | `marketing123` | Cấu hình giá vé động (Dynamic Pricing), phát hành mã voucher, quản lý banner CMS. |

*(💡 Frontend có sẵn thanh chọn vai trò trực quan trên Header để người chấm có thể kiểm thử chuyển đổi phân quyền RBAC nhanh chóng).*

---

## 🧪 5. Báo Cáo Kiểm Thử Tự Động (Quality & Test Verification)

Toàn bộ dự án đã được cài đặt và kiểm thử nghiêm ngặt thông qua hai bộ kiểm thử độc lập:

### 5.1. Kiểm thử Backend Phân Hệ Quản Trị (`admin-system/backend`)
Chạy lệnh kiểm thử tự động:
```bash
cd D:\DuAnNhom\admin-system\backend
npm test
```
**Kết quả: 15/15 tests PASS (100% Passed)**:
- `Admin Authentication & JWT Security`: Xác thực mật khẩu chính xác, từ chối mật khẩu sai, ký và kiểm tra chữ ký token JWT, kiểm tra tài khoản mặc định.
- `Dynamic Pricing Engine`: Tính toán phụ thu theo tỷ lệ lấp đầy ghế (>80%) và số ngày cận bay (≤ 3 ngày).
- `Refund Calculator`: Tính toán khấu trừ phí hoàn vé theo hạng ghế (Economy, Business) và thời gian trước giờ bay.
- `Seat Hold Manager`: Khóa giữ chỗ an toàn và cơ chế định kỳ quét nhả ghế hết hạn (Sweep expired holds).

### 5.2. Kiểm thử Giao Diện & Trải Nghiệm Phân Hệ Khách Hàng (`tkweb`)
Chạy lệnh kiểm thử toàn diện:
```bash
cd D:\DuAnNhom\tkweb\tests
node run_all_tests.js
```
**Kết quả: 15/15 test suites PASS (100% Passed)**:
1. Static Analysis & Code Integrity (Cấu trúc file, đường dẫn tài nguyên)
2. Admin Auth & Security Backdoor Elimination
3. Unified Navigation Transition Pipeline (Chuyển trang 3D mượt mà)
4. Airline Logo Normalization & Asset Fallbacks
5. Flight Price Layout & Scarcity Headroom
6. Schedule Dark Mode & Mobile Full-Width Responsive
7. Boarding Pass Metadata, QR Frame & Print Media CSS
8. Typography Normalization & Lean Mobile Header
9. Sticky Tables, CMS Prototype Banner & Scoped Admin
10. Mobile Stepper Compact Responsive Indicator
11. CSS `!important` Decoupling & Max-Width Normalization
12. Payment & Schedule Inline Style Reduction
13. Offline Fallback & Local Font Stack Resilience
14. End-to-End Booking Funnel Flow & PNR Integrity
15. Accessibility WCAG 2.1 AA & Keyboard Focus Rings

---

## 👤 6. Thông Tin Sinh Viên Thực Hiện

- **Sinh viên:** Lê Nhật Duy
- **Hồ sơ năng lực cá nhân (Portfolio):** Xem trực tiếp tại `portfolio/index.html`
- **Kho lưu trữ GitHub:** [https://github.com/honguyen1888-art/tkweb](https://github.com/honguyen1888-art/tkweb)
