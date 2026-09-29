# FWEA — cách dùng
1. Chép thư mục `.agents/` vào `D:\DuAnNhom\` (cạnh `AGENTS.md`).
2. `git add .agents` rồi `git commit -m "them FWEA"` (working tree phải sạch trước mỗi task).
3. Mở `D:\DuAnNhom` trong Antigravity, chọn Gemini Pro 3.1 High.
4. Gọi theo thứ tự: `/audit` → `/plan <yêu cầu>` → (bạn duyệt ticket) → `/implement` → `/verify` → `/report`.

## DRY-RUN (không sửa web)
Gõ `/audit`, rồi: `/plan Kiểm tra progress steps của tkweb/pages/booking.html và xác định những file nào sẽ được phép sửa`
Đạt khi agent: (1) không sửa file nào; (2) chỉ ra booking/seats/payment dùng stepper cũ, ticket.html dùng stepper mới; (3) nêu 2 test đọc booking.html (test_mobile_stepper_responsive, test_e2e_booking_funnel_integrity); (4) liệt kê FORBIDDEN rõ ràng; (5) dừng chờ bạn duyệt.
Sau đó chạy `git status`: chỉ được thấy thay đổi trong `.agents/`.
