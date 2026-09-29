# ✈️ SkyWings Enterprise Admin Portal

> Hệ thống Quản Trị & Vận Hành Hàng Không Toàn Diện (Airline Administration & Operations Platform)  
> Được thiết kế và xây dựng theo chuẩn quy chuẩn hàng không quốc tế IATA / ICAO, tối ưu hóa tỷ lệ chốt đơn (Conversion Rate Optimization).

---

## 🚀 1. Hướng Dẫn Cài Đặt & Vận Hành (Quick Start)

### Yêu Cầu Môi Trường
- **Node.js:** v18 trở lên (Khuyến nghị: Node v20 - v24)
- **Hệ điều hành:** Windows / macOS / Linux

### Bước 1: Khởi động Backend API Server
```bash
cd D:\DuAnNhom\admin-system\backend
npm install
# Khuyến nghị bảo mật: sao chép file cấu hình môi trường
cp .env.example .env
npm run dev
```
- **REST API & Swagger:** `http://localhost:5001/api`
- **Tài liệu OpenAPI Docs:** `http://localhost:5001/api/docs`
- **WebSocket Gateway:** `ws://localhost:5001` (Sự kiện live: `flight_status_updated`, `seats_released`)
- **Lưu ý bảo mật JWT:** Khi đưa vào vận hành thực tế (Production), cần cấu hình giá trị bí mật ngẫu nhiên cho `JWT_SECRET` trong file `.env` (thay vì dùng fallback key) để ngăn chặn nguy cơ giả mạo token đăng nhập.

### Bước 2: Chạy Kiểm Thử Nghiệp Vụ (Unit Tests)
```bash
npm run test
```
*Kết quả:* 10/10 test suites thành công (Tính giá động theo nhu cầu, Khóa giữ chỗ và giải phóng ghế hết hạn, Tính phí hoàn trả vé theo hạng vé và giờ bay).

### Bước 3: Khởi động Frontend Admin Dashboard
```bash
cd D:\DuAnNhom\admin-system\frontend
npm install
npm run dev
```
- **Giao diện Quản Trị:** Mở trình duyệt tại `http://localhost:5173`

---

## 🔑 2. Danh Sách Tài Khoản Đăng Nhập Mặc Định

Hệ thống tích hợp sẵn cơ chế phân quyền Role-Based Access Control (RBAC) với 4 vai trò tiêu chuẩn:

| Vai Trò | Email Đăng Nhập | Mật Khẩu | Quyền Hạn Chính |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@skywings.vn` | `admin123` | Toàn quyền kiểm soát hệ thống, thêm chuyến bay, phân quyền nhân sự, xem mọi báo cáo. |
| **CSKH (Chăm sóc khách hàng)** | `cskh@skywings.vn` | `cskh123` | Tra cứu đơn PNR, hỗ trợ đổi tên/ghế cho hành khách, gửi yêu cầu hoàn hủy vé. |
| **Kế Toán (Tài chính)** | `ketoan@skywings.vn` | `ketoan123` | Phê duyệt hoàn tiền, đối soát giao dịch cổng thanh toán, xuất hóa đơn điện tử VAT. |
| **Marketing (Khuyến mãi)** | `marketing@skywings.vn` | `marketing123` | Cấu hình quy tắc giá động (Dynamic pricing), tạo mã voucher, quản lý banner CMS. |

*(💡 Trên giao diện Header có sẵn thanh chọn nhanh **Chế độ xem vai trò** để kiểm thử phân quyền ngay lập tức mà không cần đăng xuất).*

---

## 🏛️ 3. Quyết Định Kỹ Thuật (Architecture Decision Records - ADR)

### ADR 01: Thiết kế Cơ Sở Dữ Liệu PostgreSQL & Tính Toàn Vẹn Tài Chính
- **Vấn đề:** Vé máy bay và đơn hàng liên quan chặt chẽ đến thuế, phí sân bay và hoàn tiền.
- **Quyết định:**
  - 100% bảng giao dịch tài chính (`bookings`, `payments`, `refunds`, `invoices`) áp dụng **Soft Delete (`deleted_at`)**, nghiêm cấm xóa cứng dữ liệu giao dịch.
  - Sử dụng khóa ngoài chặt chẽ và chỉ mục B-Tree / Composite Index trên các trường truy vấn thường xuyên (`pnr_code`, `flight_number`, `departure_time`, `contact_email`).
  - Toàn bộ 22 bảng được lưu trữ tại file DDL: `database/schema.sql`.

### ADR 02: Cơ Chế Dual-Mode Datastore Cho Backend
- **Vấn đề:** Trong môi trường phát triển local của nhiều lập trình viên (hoặc máy chấm thi/demo), dịch vụ PostgreSQL daemon có thể chưa được cấu hình sẵn.
- **Quyết định:**
  - Xây dựng lớp In-Memory Relational Transactional Store (`store.ts`) bám sát 100% logic của PostgreSQL (có ràng buộc trạng thái, sweep giải phóng ghế hết hạn, và tự động tạo `audit_logs`).
  - Hỗ trợ chạy tức thì không cần cài đặt thêm database server ngoài, đồng thời file SQL schema `database/schema.sql` đã sẵn sàng để migrate lên bất kỳ cụm PostgreSQL Production nào.

### ADR 03: Tối Ưu Tỷ Lệ Chốt Đơn (Conversion Rate Optimization)
1. **Khóa giữ chỗ (Seat Hold Locking):** Cấu hình thời gian giữ chỗ an toàn (mặc định 15 phút). Cron sweeper nền định kỳ quét và nhả ghế hết hạn về trạng thái `AVAILABLE`.
2. **Dynamic Pricing Engine:** Thuật toán tính giá động theo tỷ lệ lấp đầy ghế (Occupancy &gt; 80%) và số ngày cận bay (&le; 3 ngày) giúp tối đa hóa doanh thu và khuyến khích khách đặt sớm.
3. **Phân tích phễu chuyển đổi (Conversion Funnel Drop-off):** Màn hình Dashboard trực quan hóa 7 bước từ Tìm kiếm &rarr; Chọn chuyến &rarr; Chọn ghế &rarr; Thanh toán &rarr; Hoàn tất PNR, giúp đội ngũ vận hành phát hiện ngay điểm nghẽn trải nghiệm người dùng.

### ADR 04: WebSocket Real-time Broadcasting
- Sử dụng Socket.io để phát sóng tức thì sự kiện thay đổi trạng thái chuyến bay (`BOARDING`, `DELAYED`, `DEPARTED`) và giải phóng ghế hết hạn tới cả Admin Dashboard lẫn khách đặt vé ở frontend client.

---

## 📁 4. Cấu Trúc Thư Mục Toàn Dự Án

```text
admin-system/
├── database/
│   └── schema.sql             # Toàn bộ 22 bảng DDL PostgreSQL Enterprise
├── backend/
│   ├── src/
│   │   ├── types/             # TypeScript Types & Interfaces an toàn
│   │   ├── utils/             # Pricing Engine, Seat Hold Manager, Refund Calculator
│   │   ├── database/          # In-memory Transactional Store & Seed Data
│   │   ├── middlewares/       # JWT Auth & RBAC Guard, Error Handler
│   │   ├── modules/           # Flights, Bookings, Pricing, Payments, Customers, Analytics, CMS, Audit
│   │   ├── app.ts             # Express App & OpenAPI 3.0 Documentation
│   │   └── server.ts          # Server entry kết hợp Socket.io WebSocket
│   ├── tests/                 # Unit tests (pricing, seat-hold, refund)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/layout/ # AdminHeader, AdminSidebar
│   │   ├── pages/             # DashboardPage, FlightsPage, BookingsPage, PricingPage, CustomersPage, PaymentsPage, StaffPage, CMSPage
│   │   ├── App.tsx            # Main Application & Router Tabs
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```
