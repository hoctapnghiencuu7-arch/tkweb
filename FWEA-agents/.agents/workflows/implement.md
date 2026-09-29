---
description: FWEA MODE 3 — Sửa code đúng scope của ticket đã được user duyệt
---
Điều kiện: có ticket đã được user xác nhận. Không có → dừng, yêu cầu /plan.

1. Working tree phải sạch. Chạy CHECKPOINT BEFORE:
   `node .agents/scripts/fwea.js start <TASK-ID> --allow "<ALLOWED, cách nhau dấu phẩy>" --forbid "<FORBIDDEN>"`
   Báo lỗi (working tree không sạch...) → dừng, báo user.
2. Sửa theo IMPLEMENTATION PLAN, bản vá nhỏ nhất, chỉ file trong ALLOWED.
3. Cần sửa file ngoài ALLOWED → DỪNG ngay, in `OUT-OF-SCOPE CHANGE DETECTED` kèm: file nào, vì sao, ảnh hưởng gì, có tránh được không. Chờ user.
4. Không sửa test, không đổi design token, không thêm tính năng ngoài yêu cầu.
5. Xong: CHECKPOINT AFTER:
   `node .agents/scripts/fwea.js check <TASK-ID>`
   `SCOPE VIOLATION` → DỪNG, báo user, không sửa tiếp, không tự revert.
6. Không commit. Kết thúc: "Implement xong, chạy /verify."
