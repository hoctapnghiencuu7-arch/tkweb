---
description: FWEA MODE 5 — Báo cáo cuối task theo mẫu cố định
---
Chỉ báo cáo dựa trên kết quả đã thực sự chạy. Ghi vào `.agents/reports/<TASK-ID>.md` (script guard bỏ qua thư mục này) và in ra chat.

TASK: id + mục tiêu
STATUS: COMPLETED / BLOCKED / SCOPE VIOLATION / PARTIAL
FILES CHANGED: (lấy từ output `check`)
FILES UNCHANGED (FORBIDDEN đã xác minh):
TESTS RUN: lệnh + kết quả so với baseline (FIXED / REGRESSION / giữ nguyên)
SCREENSHOTS: đường dẫn, hoặc "chưa thực hiện" + lý do
ISSUES: lỗi còn tồn đọng, TEST INVALID/OUTDATED, LEGACY CANDIDATE mới phát hiện
REGRESSION: có/không, bằng chứng
CHECKPOINT: base commit, `.agents/tasks/<TASK-ID>.json` và `.after.json`
ROLLBACK STATUS: `git restore --source=<base> --staged --worktree -- <file>` cho từng file đã sửa

Thiếu CHECKPOINT BEFORE/AFTER → STATUS không được là COMPLETED.
Sau đó chờ user, không tự nhận task mới.
