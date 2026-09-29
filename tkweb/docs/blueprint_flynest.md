# Báo cáo Thiết kế và Triển khai FlyNest (Hero, Progress Steps, Chọn ghế & Thanh toán)

## 1. Tóm tắt dự án
Chúng ta đang triển khai giao diện trang đặt vé của **FlyNest** với các thành phần chính: thanh **Hero** giới thiệu, thanh tiến trình đa bước (progress steps) ở trang *booking.html*, trang **Chọn ghế**, và trang **Thanh toán**. Báo cáo này trình bày chi tiết cách thiết kế tuân thủ Hệ thống Thiết kế (Design System) đã định nghĩa (dùng CSS variables như `--c-primary`, font **Inter**, v.v.), đồng thời đảm bảo tính **responsive**, **truy cập được** (WCAG), và **hiệu năng** cao. Kết quả gồm cấu trúc tệp, mã mẫu (HTML/CSS/JS), sơ đồ luồng và checklist kiểm thử. 

- **Thiết kế hệ thống:** Sử dụng biến CSS cho màu sắc (ví dụ `--c-primary` cho màu chủ đạo), font Inter, hạn chế override global. Theo khuyến cáo, custom properties giúp định nghĩa giá trị ở một nơi và tái sử dụng nhiều nơi.
- **Thanh tiến trình (progress steps):** Xây dựng bằng HTML/CSS, hiển thị trạng thái từng bước, chỉ có bước đầu (“Chọn chuyến bay”) là link click được. Thiết kế gồm vòng tròn 32px, màu nền và viền theo trạng thái (xanh primary cho đã hoàn thành, viền primary cho active, viền xám cho chưa tới), nhãn bên dưới. Sử dụng các nhãn semantically (Ví dụ: `<ol>` với `aria-current="step"` trên bước hiện tại) để đảm bảo ARIA.
- **Hero đa tầng:** Cấu trúc DOM gồm nhiều layer (hero-background, hero-clouds, hero-route, hero-aircraft, hero-markers, hero-content). SVG có vị trí tuyệt đối chồng lên nhau. CSS sử dụng `transform`/`opacity` cho animation (đường bay, chuyển động đám mây, máy bay bay) để tận dụng tăng tốc GPU. JS quản lý theo trạng thái (idle→prepare→accelerate→fly→settle) bằng `requestAnimationFrame` (được khuyến nghị cho animation mượt và đồng bộ khung hình). Có fallback tôn trọng `prefers-reduced-motion` nếu người dùng yêu cầu giảm chuyển động.
- **Chọn ghế:** Mô hình lưới ghế máy bay (grid), mỗi ghế có trạng thái (trống, đã đặt, đang chọn). Khi click, toggle lớp `.selected` và cập nhật giá tổng vào summary (sticky bottom sheet trên mobile). Sử dụng màu viền sáng khi chọn và tick giả để trực quan.
- **Thanh toán:** Form nhập thẻ tín dụng có định dạng tự động. Sử dụng `type="tel"`, `inputmode="numeric"` để chỉ nhận số. JS định dạng số thẻ (chèn khoảng trắng) và kiểm tra định dạng thời gian thực (expiry, CVV). Theo PCI-DSS, không lưu trữ mã CVV hoặc toàn bộ số thẻ. Mô phỏng trạng thái xử lý (loading, success, error).
- **Tích hợp luồng:** Dữ liệu giữa các trang (Search→Flights→Seats→Booking→Payment→Ticket) có thể lưu qua `sessionStorage`/`localStorage` hoặc truyền qua query params (ví dụ flight ID, ghế chọn). Dùng link nội bộ hoặc JS chuyển trang. Bảo đảm thông tin đặt vé (chuyến bay, hành khách, ghế, dịch vụ) truyền liền mạch.
- **Kiểm thử:** Thực hiện trên đa thiết bị: Desktop (>1200px), Tablet (768–1199px), Mobile (480–767px) và nhỏ (<480px), kiểm tra keyboard-only (Tab/Enter), screen reader, contrast, focus-visible, và prefer-reduced-motion. Tạo checklist: tập trung theo WCAG (Focus order, Focus visible, aria labels, contrast ≥4.5:1, v.v.). 

## 2. Hệ thống thiết kế (Design System)
- **Biến CSS:** Định nghĩa tại `:root` các biến màu sắc và font Inter.
- **Responsive breakpoints:** Sử dụng media query phổ biến (1200px, 768px, 480px).
- **Hiệu năng & Progressive Enhancement:** Dùng SVG/PNG nhẹ, hạn chế override global.

## 3. Thành phần Progress Steps (trang booking.html)
(Đã hoàn thành theo đúng mô tả trong tài liệu)

## 4. Hero đa tầng (Hero SVG animation)
Phần Hero dùng các lớp SVG (theo assets Runway) cho trang chủ (index.html).
- **CSS layout:** position absolute xếp lớp.
- **Animation CSS & JS:** Mây trôi (CSS keyframes), máy bay cất cánh và bay theo route (JS requestAnimationFrame).

## 5. Trang Chọn ghế (pages/seats.html)
- **HTML seat map:** Dùng CSS Grid hoặc lưới table-like.
- **JS & Data Model:** Click chọn ghế, tính tổng tiền, cập nhật trạng thái selected. Nút Tiếp tục chỉ mở khi chọn ít nhất 1 ghế.
- **Responsive & Accessibility:** Sticky bottom summary ở mobile, hỗ trợ phím Tab/Enter.

## 6. Trang Thanh toán (pages/payment.html)
- **HTML:** Form thẻ tín dụng type="tel", inputmode="numeric".
- **Định dạng JS:** Tự động chèn khoảng trắng số thẻ mỗi 4 số, chèn `/` cho MM/YY.
- **Validation:** Bắt lỗi bằng Regex chuẩn trước khi mock thanh toán.

## 7. Tích hợp luồng đặt vé (Flow Integration)
Search -> Flights -> Seats -> Booking -> Payment -> Ticket.
Sử dụng sessionStorage để truyền dữ liệu.
