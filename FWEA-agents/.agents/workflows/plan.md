---
description: FWEA MODE 2 — Biến yêu cầu thành ticket có scope rõ, chờ user duyệt
---
Đầu vào: yêu cầu của user. Chưa audit vùng này thì audit ngắn trước (chỉ đọc).

Scope không rõ → DỪNG và hỏi user. Không tự suy diễn.

Xuất ticket đúng mẫu:
TASK ID: (dạng T-YYYYMMDD-01)
OBJECTIVE:
SCOPE:
AFFECTED FILES (ALLOWED): từng file
NON-AFFECTED FILES (FORBIDDEN): các file/trang liên quan mà tuyệt đối không đụng
WHAT MUST NOT CHANGE:
DEPENDENCIES: file khác dùng chung CSS/JS này; test nào đọc các file này
IMPLEMENTATION PLAN: các bước nhỏ nhất, bản vá nhỏ nhất
TEST PLAN: suite nào phải giữ nguyên trạng thái so với baseline
VISUAL QA PLAN: trang nào, kích thước nào
ROLLBACK PLAN: `git restore --source=<base> --staged --worktree -- <file>` cho từng file ALLOWED
PRIORITY: lấy từ user/ISSUES, không có thì UNPRIORITIZED
OPEN QUESTIONS: mọi điểm scope còn mơ hồ

Kết thúc: "Chờ user xác nhận ticket. Chưa sửa gì." KHÔNG bắt đầu /implement.
