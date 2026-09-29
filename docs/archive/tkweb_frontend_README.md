# ✈️ SkyWings (Ngefly) - Nền Tảng Đặt Vé Máy Bay Trực Tuyến Thế Hệ Mới

> **Đề tài:** Nền tảng đặt vé máy bay thông minh thế hệ mới (Next-Gen Travel & Aviation Web Platform)  
> **Phong cách thiết kế:** Giao diện Ngefly UI Design System chuẩn quốc tế, tích hợp đường băng 3D Three.js WebGL, âm thanh phản lực Web Audio API Synthesizer, hiệu ứng chuyển trang mượt mà (Smooth Page Transitions), kiến trúc nhà ga/kho máy bay & đài quan sát không lưu chân thực, bảo mật mã hóa Base64 và Việt hóa 100% chuẩn hàng không IATA/ICAO.

---

## 📑 Bảng Mục Lục

1. [Giới Thiệu Dự Án](#-giới-thiệu-dự-án)
2. [Cấu Trúc Đội Ngũ Agent & Phân Công Nhiệm Vụ](#-cấu-trúc-đội-ngũ-agent--phân-công-nhiệm-vụ)
3. [Công Nghệ, Thư Viện & Nguồn Mã Nguồn GitHub Áp Dụng](#-công-nghệ-thư-viện--nguồn-mã-nguồn-github-áp-dụng)
4. [Các Tính Năng & Đổi Mới Nổi Bật](#-các-tính-năng--đổi-mới-nổi-bật)
5. [Cấu Trúc Thư Mục Toàn Dự Án](#-cấu-trúc-thư-mục-toàn-dự-án)
6. [Quy Trình Trải Nghiệm Khách Hàng (Funnel 5 Bước)](#-quy-trình-trải-nghiệm-khách-hàng-funnel-5-bước)
7. [Hệ Thống Quản Trị Hệ Thống (Admin Portal)](#-hệ-thống-quản-trị-hệ-thống-admin-portal)
8. [Trải Nghiệm Tương Tác & Hiệu Ứng Cao Cấp (Smooth Scroll & Transitions)](#-trải-nghiệm-tương-tác--hiệu-ứng-cao-cấp)
9. [Hướng Dẫn Cài Đặt & Vận Hành](#-hướng-dẫn-cài-đặt--vận-hành)

---

## 🛫 Giới Thiệu Dự Án

**SkyWings** (tên thương hiệu chuyển giao từ nguyên mẫu *Ngefly Travel Platform*) là ứng dụng web thương mại điện tử hàng không cao cấp, mang lại trải nghiệm đặt vé trực tuyến thông minh, trực quan và liền mạch từ khâu tìm kiếm chuyến bay đến khi xuất thẻ lên tàu bay điện tử (E-Boarding Pass).

Dự án được xây dựng với mục tiêu:
- Tối ưu hóa trải nghiệm người dùng (UX) với giao diện tối giản, sang trọng, hỗ trợ chế độ **Sáng (Light Mode)** và **Tối (Dark Mode)** đồng bộ 100% trên toàn bộ các trang.
- Tái hiện không gian phi trường sống động với **Three.js WebGL**: phi cơ Boeing 787-9 Dreamliner tĩnh tại trên đường băng, hệ thống nhà chứa máy bay (Hangars), tháp kiểm soát không lưu (ATC Towers) xoay radar 360°, và hiệu ứng cất cánh ngoạn mục khi người dùng thực hiện chuyển trang.
- Bảo mật thông tin thành viên, mã hóa dữ liệu giao dịch bằng chuẩn Base64 an toàn, đồng thời cung cấp đầy đủ chức năng quản lý đặt chỗ theo thời gian thực (Real-time Booking Engine).

---

## 👥 Cấu Trúc Đội Ngũ Agent & Phân Công Nhiệm Vụ

Dự án được phối hợp và thực thi bởi hệ thống đa Agent chuyên biệt hóa cao độ:

| Agent / Chuyên Gia | Vai Trò Chính | Nhiệm Vụ Chi Tiết Đã Thực Hiện |
| :--- | :--- | :--- |
| **Lead Architect (Core)** | Điều phối kiến trúc & Tích hợp | Thiết kế luồng dữ liệu trung tâm (`Storage`), đồng bộ trạng thái đăng nhập/đăng xuất đa tab (`localStorage` & `sessionStorage`), bảo mật mã hóa Base64 cho thông tin vận hành, xây dựng hệ thống chuyển trang mượt mà (Page Transition Bar). |
| **Airport Scene 3D Dev** | Kỹ sư Đồ họa WebGL Three.js | Xây dựng phối cảnh sân bay 3D cuộn chuyển động đồng bộ: Nhà chứa bảo dưỡng máy bay (Main Hangar 01, Hangar 02, Express 03), Tháp kiểm soát không lưu (ATC Tower 12m & Radar xoay 360°), trạm Doppler Radome, trạm cứu hỏa khẩn cấp, bồn nhiên liệu Jet A-1, cột cờ gió ICAO, dàn đèn mép đường băng đổi màu theo theme. Toàn bộ hơn 230 công trình di chuyển mượt mà cùng đường băng. |
| **Aircraft Detail Engineer** | Kỹ sư Mô hình Phi cơ 3D | Tinh chỉnh mô hình Boeing 787-9 Dreamliner: sơn phủ livery trắng ngọc trai bóng bẩy, cánh đuôi đứng nhận diện SkyWings Coral Orange, cửa sổ buồng lái specular, đèn chớp nháy Strobe & Nav Lights (đỏ cánh trái, xanh cánh phải), cánh quạt phản lực (turbofans) quay idle khi đỗ và gầm rú tăng tốc khi cất cánh. |
| **Takeoff Motion Engineer** | Kỹ sư Động lực học & Chuyển động | Lập trình logic bay lượn & cất cánh tương tác: Máy bay bay lướt tầm thấp trên đường băng trang chủ với chuyển động bồng bềnh khí động học và phong cảnh cuộn trôi bên dưới; kích hoạt chu trình cất cánh chân thực (tăng tốc cực đại ➔ ngửa mũi Rotate ➔ vút bay lên tầng mây) khi người dùng bấm tìm kiếm CTA hoặc click chuyển trang. |
| **UI/UX Frontend Dev** | Thiết kế Giao diện & Layout | Tái cấu trúc thanh tìm kiếm 1 hàng ngang (1-Row Search Bar), kéo dài Hero Banner trải dọc màn hình, đồng bộ Header trong suốt và định vị khoảng cách Logo - Menu nhất quán tuyệt đối giữa Trang Chủ và các trang con. |
| **Pages Polish & I18n Lead**| Chuẩn hóa Giao diện & Việt hóa | Việt hóa 100% toàn bộ hệ thống biểu mẫu, thông báo, quy tắc đặt chỗ, loại bỏ toàn bộ dữ liệu thành viên cá nhân hardcode, hoàn thiện hệ thống Stepper 5 bước và Footer chuyên nghiệp. |
| **DevOps & QA Automation** | Tự động hóa Kiểm thử & Chụp ảnh | Viết kịch bản Chrome DevTools Protocol (CDP) tự động chụp toàn bộ 18 ảnh màn hình full-page độ phân giải cao (từ Header đến Footer) ở cả hai chế độ Sáng và Tối, quay video demo kiểm thử nghiệm thu. |

---

## 🛠 Công Nghệ, Thư Viện & Nguồn Mã Nguồn GitHub Áp Dụng

### 1. Nguồn Mã Nguồn Mở, Thiết Kế & UI Kit Tham Chiếu
* **Ngefly Travel App UI Kit (Figma Community & Open Design):** Kế thừa và phát triển ngôn ngữ thiết kế hàng không đương đại với tông màu Deep Navy (`#0f172a`), Coral Orange (`#ff5f38`), hệ lưới căn lề chuẩn 1220px và các thẻ bo góc lớn (Rounded 24px - 32px).
* **Tailwind CSS Components Ecosystem (`tailwindlabs/tailwindcss`):** Tận dụng hệ thống utility classes hiện đại cho bố cục responsive, flexbox, grid, và các lớp chuyển đổi trạng thái màu (`transition-colors duration-300`).
* **Lucide & Heroicons SVG Collection (`lucide-icons/lucide`, `tailwindlabs/heroicons`):** Sử dụng các icon vector SVG hàng không sắc nét (máy bay, la bàn, lịch trình, ghế ngồi, khiên bảo mật, mã QR).
* **Three.js Examples & WebGL Shaders (`mrdoob/three.js`):** Tham khảo kiến trúc chiếu sáng PBR (`MeshStandardMaterial`), ánh sáng mặt trời tự nhiên (`DirectionalLight`), bóng đổ tiếp xúc (`contactShadow`) và kỹ thuật cuộn vô hạn phong cảnh sân bay.
* **ICAO Annex 14 Aerodrome Standards:** Áp dụng tiêu chuẩn quốc tế về phân bố sơn kẻ tim đường băng, vạch sơn ngưỡng cất hạ cánh (Threshold Stripes), biển báo hướng dẫn di chuyển (Taxiway Guidance), màu đèn mép đường băng (Amber/White) và cột cờ gió (Windsock).

### 2. Các Thư Viện & Công Cụ Đã Tích Hợp
* **Three.js (r128):** Thư viện dựng hình 3D WebGL chính để hiển thị máy bay Boeing 787-9, nhà kho, tháp kiểm soát không lưu và phong cảnh sân bay.
* **Tailwind CSS (CDN v3):** Framework tiện ích CSS cho trang chủ, kết hợp song song với hệ thống CSS thuần tùy biến cao (`style.css`).
* **Web Audio API (Native Browser API):** Bộ tổng hợp âm thanh ảo mô phỏng tiếng click nút bấm tinh tế và âm thanh động cơ phản lực cất cánh chân thực mà không cần tải file MP3 nặng nề.
* **Canvas Confetti (`catdad/canvas-confetti`):** Hiệu ứng pháo hoa chúc mừng bùng nổ rực rỡ khi hành khách hoàn tất thanh toán và nhận vé máy bay thành công.
* **Playwright & Microsoft Edge CDP (Chrome DevTools Protocol):** Công cụ tự động hóa chạy headless browser chụp ảnh màn hình full-page độ phân giải 1440px và kiểm tra độ ổn định giao diện.
* **Google Fonts (`Plus Jakarta Sans` & `Space Grotesk`):** Hệ phông chữ hình học hiện đại, hiển thị sắc nét chữ tiếng Việt có dấu và các con số giá vé chuẩn quốc tế.

---

## 🌟 Các Tính Năng & Đổi Mới Nổi Bật

#### 1. Đường Băng 3D Tương Tác & Hiệu Ứng Cất Cánh Khi Chuyển Trang
- **Bay tầm thấp ở trang chủ (Low-Altitude Cruising Flight):** Khi người dùng duyệt trang chủ, phi cơ thương mại bay lượn ở tầm thấp (`y = 0.65`) ngay phía trên đường băng với độ bồng bềnh khí động học nhẹ nhàng, bóng đổ tiếp xúc di chuyển sắc nét theo thân máy bay, động cơ turbofan quay đều tốc độ bay hành trình và phong cảnh đường băng cuộn chạy mượt mà phía dưới.
- **Không gian sân bay tráng lệ & Cuộn chuyển động đồng bộ:** Bổ sung **Kho bảo dưỡng máy bay chính (Hangar 01)** với mái vòm uốn cong và biển hiệu SkyWings rực sáng; **Kho logistics hàng không (Cargo Hangar 02)**; **Tháp kiểm soát không lưu (ATC Tower 12m)** với cabin kính 360° và đĩa radar thứ cấp quét liên tục; **Trạm radar thời tiết Doppler (Radome)**; cùng hơn 230 phần tử sân bay cuộn trôi tuần hoàn vô tận theo máy bay.
- **Hiệu ứng cất cánh bay thẳng hướng trên & Khớp chuẩn thời gian thoát khung hình (~1.0s):** Khi người dùng bấm nút tìm kiếm CTA hoặc click vào bất kỳ liên kết điều hướng nào ("Chuyến Bay", "Lịch Trình", "Đặt Chỗ", "Quản Trị"), phi cơ lập tức cân bằng trọng tâm trục X = 0, tăng tốc chạy đà trên đường băng, ngửa mũi cất cánh (pitch up) và phóng thẳng về phía trước theo hướng trên màn hình vút lên tầng mây xanh (`y` nâng lên 5.8, `z` lao về -25.0 ra khỏi đỉnh màn hình). Thời gian chuyển trang được tối ưu hóa khớp sát gần bằng thời gian máy bay bay ra khỏi khung hình web (~0.98s – 1.0s). Ngay khoảnh khắc đuôi máy bay vừa bay thoát hoàn toàn khỏi mép trên của màn hình, trình duyệt lập tức kích hoạt chuyển sang trang đích mượt mà, triệt tiêu hoàn toàn thời gian chờ đợi trống trơn.

### 2. Nâng Cấp Banner Bầu Trời Động Trang Chuyến Bay & Hiệu Ứng Bay Từ Trái Sang Tới Giữa (`pages/flights.html`)
- **Chuyển Banner lên trên cùng trang Chuyến Bay:** Chuyển toàn bộ khối Banner `"10 Chuyến Bay Phù Hợp Nhất"` từ vị trí chìm phía dưới lên trên cùng của trang (ngay dưới Header và trên thanh Funnel Stepper Bar), tạo điểm nhấn thị giác hàng không cao cấp ngay khi người dùng bước vào trang.
- **Biến đổi thành Bầu trời động (Dynamic Animated Sky Scene):**
  - **Tầng mây cuộn trôi đa lớp (Multi-layer Parallax Clouds):** Tầng mây cao mỏng (Cirrus) và tầng mây trung tâm (Cumulus) cuộn trôi liên tục không vết nối từ phải sang trái, tạo cảm giác phi cơ đang lướt nhanh về phía trước ở độ cao hành trình 36.000 ft.
  - **Ánh sáng tầng khí quyển:** Tỏa sáng vầng hào quang mặt trời rực rỡ vào ban ngày (Light Mode) và bầu trời đêm ngàn sao lấp lánh cùng ánh trăng thanh vào ban đêm (Dark Mode).
- **Hiệu ứng phi cơ bay từ trái sang tới giữa:**
  - Khi chuyển từ trang chủ sang trang chuyến bay (hoặc khi tải trang `flights.html`), chiếc Boeing 787-9 Dreamliner lướt nhanh từ bên ngoài mép trái màn hình (`left: -320px`) bay xuyên qua bầu trời vào chính giữa banner (`left: 50%`) trong 1.75 giây với gia tốc khí động học mượt mà (`cubic-bezier(0.16, 1, 0.3, 1)`).
  - Khi đã đến vị trí trung tâm, phi cơ tự động chuyển sang chế độ bay hành trình tuần hoàn (Cruising Loop): bồng bềnh êm ái lên xuống ($\pm 8\text{px}$), hơi lắc cánh khí động học ($\pm 1.5^\circ$), cặp luồng khí ngưng tụ (Contrails) phun dài sau động cơ turbofan và dàn đèn hiệu Strobe (đỏ cánh trái, xanh cánh phải, trắng ở đuôi) chớp nháy chân thực.
- **Biểu tượng phi cơ chuyển trang:** Tích hợp phi cơ phát sáng `✈` ở đầu thanh tiến trình `#page-progress-bar` lướt từ trái sang phải mỗi khi chuyển trang.

### 3. Khắc Phục Lỗi Header Trên Các Trang Con & Đồng Bộ Giao Diện
- **Khắc phục triệt để lỗi Header trên các trang con:** Đã xử lý lỗi chữ menu bị gãy làm 2 dòng dọc gây méo mó ("Trang\nChủ", "Chuyến\nBay"...) bằng cách áp dụng `white-space: nowrap !important;`, `display: inline-block !important;` và tinh chỉnh `gap: 1.45rem` trên thanh điều hướng. Chiều cao các nút điều hướng trở về chuẩn mực 36-37px trên toàn bộ 9 trang web.
- **Header trong suốt & Acrylic Frosted Glass:** Header trang chủ giữ độ trong suốt 100% không viền nổi trên nền 3D. Header trên các trang con tích hợp lớp nền mờ kính Acrylic (`rgba(255, 255, 255, 0.90)` / `rgba(11, 17, 30, 0.88)` kèm `backdrop-filter: blur(16px)` và viền dưới thanh mảnh) giúp nội dung cuộn bên dưới không gây rối mắt.
- **Căn lề Logo đồng bộ:** Logo `SkyWings` và cụm điều hướng `Trang Chủ`, `Chuyến Bay`, `Lịch Trình`... được neo cố định với khoảng cách đồng nhất (`margin-right: 2.2rem`) trên tất cả các trang, chuẩn độ rộng `max-width: 1220px` với `margin: 0 auto`.

### 4. Đăng Xuất Đa Kênh An Toàn (Multi-Storage Clear)
- Cơ chế `Storage.logout()` đồng thời làm sạch toàn bộ dữ liệu người dùng trên `localStorage`, `sessionStorage` và bộ nhớ RAM `memStorage`.
- Giao diện Header lập tức chuyển đổi mượt mà sang trạng thái chưa đăng nhập (`Đăng Nhập` & `Đăng Ký`), sẵn sàng cho lượt người dùng mới.

### 5. Giao Diện Sáng / Tối Toàn Diện (Dual Theme Engine)
- Chuyển đổi toàn diện với 1 nút bấm (🌙 / ☀️), lưu trạng thái vào `localStorage`.
- Chữ tiêu đề *"Ready to take off?"* hiển thị màu đen đậm sắc nét trên nền trời sáng, và chuyển sang màu trắng ngọc ngà trên nền trời đêm.
- Phối cảnh Three.js tự động chuyển đổi giữa ánh sáng ban ngày trong vắt và ánh trăng xanh đêm sang trọng với dàn đèn đường băng bừng sáng.

### 6. Form Tìm Kiếm Tương Tác Chuẩn Xác & Khắc Phục Lỗi Nhảy Trang Trên Trang Chủ
- **Khắc phục triệt để lỗi nhảy trang sớm:** Thay thế hoàn toàn các thẻ liên kết tĩnh `<a>` bằng form tương tác `<form id="ngefly-search-form">` với các phần tử chọn lựa thực sự.
- **Tương tác linh hoạt:** Người dùng có thể click chọn Điểm khởi hành (`dep-city-select`), Điểm đến (`arr-city-select`), Ngày khởi hành (`dep-date`), Số hành khách (`pax-count`) và nút hoán đổi chiều bay nhanh (`btn-swap-cities`) mà không bị chuyển trang ngoài ý muốn.
- **Kích hoạt cất cánh khi tìm kiếm:** Chỉ khi người dùng bấm nút CTA tìm kiếm `➜`, hệ thống mới xác thực dữ liệu, lưu thông số bay và kích hoạt chuỗi cất cánh 3D chuyển trang mượt mà.

### 7. Ngăn Kéo Chỉnh Sửa Tìm Kiếm Tại Chỗ Trang Chuyến Bay ("Thay Đổi Tìm Kiếm")
- **Loại bỏ việc văng về trang chủ:** Thay thế link tĩnh `href="../index.html"` bằng nút tương tác `#btn-toggle-change-search`.
- **Ngăn kéo điều phối nhanh (`#flights-inline-search-panel`):** Cho phép người dùng chỉnh sửa điểm đi, điểm đến, ngày bay và số hành khách ngay trên trang `flights.html`.
- Khi bấm *"Cập Nhật"*, toàn bộ thanh tóm tắt hành trình và danh sách 10 chuyến bay được đồng bộ tức thì theo tuyến bay mới, cập nhật URL trình duyệt (`history.replaceState`) mà không gây gián đoạn hay tải lại trang.

### 8. Mã Hóa & Bảo Mật Dữ Liệu Toàn Diện (SecurityVault & PCI-DSS)
- **Mô-đun SecurityVault (`main.js`):** Tích hợp thuật toán mã hóa đối xứng với Salt bí mật và Base64 Encoding (`enc_v2_...`).
- **Bảo mật lưu trữ:** Dữ liệu người dùng, đặt vé và đơn hàng trong `localStorage` / `sessionStorage` đều được mã hóa tự động trước khi ghi vào bộ nhớ.
- **Mặt nạ dữ liệu nhạy cảm:** Số thẻ tín dụng được che mặt nạ chuẩn PCI-DSS (`•••• •••• •••• 4242`), mã CVV/CVC không lưu vào bộ nhớ, mật khẩu người dùng trong CSDL `database.sql` được băm bằng bcrypt `$2y$12$...`.
- **Bảo mật Boarding Pass:** Mã token hành khách trên thẻ lên tàu bay được mã hóa dưới dạng chuỗi bảo mật `SECURE-TOKEN: enc_v2_...`.

---

## 📂 Cấu Trúc Thư Mục Toàn Dự Án

```text
DuAnNhom/
├── tkweb/
│   ├── admin/
│   │   └── index.html             # Dashboard Cổng Quản Trị Hệ Thống (Booking, Filter, CSV Export)
│   ├── assets/
│   │   ├── css/
│   │   │   └── style.css          # Design System hoàn chỉnh, biến Theme, Navbar & Popover CSS
│   │   ├── js/
│   │   │   └── main.js            # Engine Three.js 3D, Flight Controller, Auth & LocalStorage
│   │   ├── fonts/                 # Phông chữ nội bộ tối ưu hóa
│   │   └── images/
│   │       ├── airlines/          # 12 logo vector hãng hàng không SVG
│   │       ├── icons/             # Bộ icon sân bay & tiện ích chuyến bay SVG
│   │       └── *.svg              # Huy hiệu thẻ, logo SkyWings, chip thanh toán
│   ├── components/
│   │   ├── header.html            # Header template chuẩn hóa
│   │   └── footer.html            # Footer template chuẩn hóa với chứng chỉ IATA & PCI-DSS
│   ├── database/
│   │   └── database.sql           # Script khởi tạo 10 bảng CSDL quan hệ MariaDB/MySQL
│   ├── pages/
│   │   ├── flights.html           # Bước 1: 10 Chuyến bay, Bộ lọc hãng bay, Sắp xếp giá
│   │   ├── booking.html           # Bước 2: Thông tin hành khách, Combo khách sạn & xe đưa đón
│   │   ├── seats.html             # Bước 3: Sơ đồ cabin chọn chỗ ngồi Thương gia / Phổ thông
│   │   ├── payment.html           # Bước 4: Thanh toán Thẻ quốc tế, VNPAY-QR, MoMo, Apple Pay
│   │   ├── ticket.html            # Bước 5: Thẻ lên tàu bay Boarding Pass, PNR Code & QR Check-in
│   │   ├── login.html             # Cổng đăng nhập tài khoản khách hàng & quản trị
│   │   └── register.html          # Đăng ký tài khoản mới + tặng 500 SkyMiles chào mừng
│   ├── index.html                 # Trang chủ SkyWings với Hero Canvas 3D & 1-Row Search Bar
│   ├── prompt.txt                 # Nhật ký Prompt kỹ thuật dự án
│   └── README.md                  # Bản tài liệu kỹ thuật dự án
└── BAO_CAO_TONG_HOP_DU_AN.md      # Văn bản báo cáo tổng kết toàn diện các nhiệm vụ và công nghệ
```

---

## 🧭 Quy Trình Trải Nghiệm Khách Hàng (Funnel 5 Bước)

1. **Bước 1 - Tìm kiếm & Chọn Chuyến Bay (`pages/flights.html`):**
   - Lựa chọn trong danh sách 10 chuyến bay thực tế của các hãng hàng không hàng đầu (*Vietnam Airlines, SkyWings, Vietjet, Bamboo, Emirates, Qatar Airways...*).
   - Sử dụng bộ lọc đa năng: lọc theo hãng bay, mức giá, thời gian bay và hạng dịch vụ.

2. **Bước 2 - Điền Thông Tin Hành Khách (`pages/booking.html`):**
   - Điền thông tin cá nhân, liên hệ và hộ chiếu (tự động điền nếu đã đăng nhập).
   - Tùy chọn combo khách sạn đối tác (giảm ngay $150) và xe đưa đón VIP tận sân bay.

3. **Bước 3 - Chọn Chỗ Ngồi Trực Quan (`pages/seats.html`):**
   - Khám phá sơ đồ khoang máy bay thân rộng hiện đại.
   - Chọn ghế cửa sổ, lối đi hoặc ghế hạng thương gia với mức phí minh bạch.

4. **Bước 4 - Thanh Toán Đa Cổng (`pages/payment.html`):**
   - Thẻ tín dụng/ghi nợ quốc tế (Visa, Mastercard, JCB) với hiệu ứng thẻ phát sáng 3D.
   - Quét mã VNPAY-QR với đồng hồ đếm ngược 15 phút, Ví điện tử MoMo hoặc Apple Pay.

5. **Bước 5 - Nhận Thẻ Lên Tàu Bay & Check-in (`pages/ticket.html`):**
   - Mã PNR 6 ký tự chuẩn IATA (sao chép nhanh với 1 chạm).
   - Mã QR và Barcode phục vụ quét tại cửa an ninh phi trường, hỗ trợ in vé PDF tiêu chuẩn.

---

## 📊 Hệ Thống Quản Trị Hệ Thống (Admin Portal)

Truy cập tại `admin/index.html`:
- **Thống kê thời gian thực:** Doanh thu đặt vé, lượng chuyến bay vận hành, số lượng hành khách và tỷ lệ lấp đầy ghế.
- **Bảng quản lý đơn đặt chỗ:** Tự động đồng bộ các booking phát sinh từ giao diện người dùng, hỗ trợ lọc theo mã PNR, họ tên, hãng bay và trạng thái thanh toán.
- **Xuất dữ liệu Excel/CSV:** Hỗ trợ kết xuất báo cáo nhanh phục vụ đối soát tài chính và vận hành mặt đất.

---

## 💎 Trải Nghiệm Tương Tác & Hiệu Ứng Cao Cấp

Hệ thống được trang bị bộ đôi hiệu ứng tương tác thị giác tiêu chuẩn quốc tế:

1. **Header Dạng Viên Thuốc Nổi (Floating Capsule Pill Dock):**
   - Header lơ lửng căn giữa màn hình với góc bo tròn tuyệt đối (`border-radius: 9999px`), phủ kính mờ Acrylic (`backdrop-filter: blur(20px)`) và bóng mờ thanh lịch.
   - Tự động co giãn và bám đỉnh khi cuộn trang (`.header-scrolled`).

2. **Cuộn Trang Quán Tính Mượt Mà (Inertial Momentum Smooth Scroll):**
   - Tích hợp bộ điều phối cuộn tùy biến sử dụng vòng lặp `requestAnimationFrame` và nội suy giảm chấn tuyến tính (`lerp = 0.10`), triệt tiêu hoàn toàn cảm giác khấc giật của con lăn chuột mặc định.

3. **Thẻ Nội Dung Đè Lớp Parallax (Layered Card / Sheet Stacking):**
   - Khung nội dung chính (`.main-sheet-elevated`) được thiết kế với 2 góc trên bo cong lớn (`border-radius: 36px 36px 0 0`) và đổ bóng âm hướng lên, trượt đè lên bối cảnh đường băng 3D tạo chiều sâu thị giác.

4. **Xuất Hiện So Le Từng Khối Khi Cuộn (Scroll Stagger Reveals):**
   - Bộ lắng nghe `IntersectionObserver` tự động kích hoạt hiệu ứng trôi lên mượt mà theo thứ tự domino (`stagger-delay: 90ms`) cho các thẻ chuyến bay, tính năng và bảng giá.

5. **Chuyển Trang Điện Ảnh (Cinematic Transitions):**
   - Hiệu ứng thoát trang nhẹ nhàng (`scale(0.985) translateY(-16px)` mờ dần) kết hợp cùng thanh tiến trình phi cơ phát sáng `✈` và âm thanh phản lực ảo trước khi tải trang mới.

---

## 🚀 Hướng Dẫn Cài Đặt & Vận Hành

Dự án sử dụng công nghệ Web thuần túy (Vanilla Modern JavaScript, Three.js và CSS3), **không yêu cầu cài đặt môi trường Node.js hay Build Tool phức tạp để chạy ứng dụng**:

1. **Chạy Trực Tiếp:**
   - Nhấp đúp chuột vào file `index.html` để mở trên Google Chrome, Microsoft Edge, Firefox hoặc Safari.
2. **Chạy Qua Local Web Server (Khuyến khích):**
   ```bash
   # Sử dụng VS Code Live Server hoặc Python HTTP Server:
   cd D:\DuAnNhom\tkweb
   python -m http.server 8080
   # Truy cập trình duyệt: http://localhost:8080
   ```
3. **Kiểm Tra CSDL Quan Hệ (Tùy chọn):**
   - Import file `database/database.sql` vào phpMyAdmin hoặc MySQL Workbench để kiểm tra thiết kế 10 bảng dữ liệu chuẩn hóa 3NF.

---
*© 2026 SkyWings Airlines Inc. Bản quyền giải pháp công nghệ thuộc về Nhóm Phát Triển Dự Án Hàng Không Thông Minh.*
