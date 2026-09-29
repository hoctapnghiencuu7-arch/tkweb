---
description: FWEA MODE 1 — Đọc và lập bản đồ dự án, KHÔNG sửa file nào
---
Chế độ chỉ đọc. Không tạo/sửa/xóa file dự án (ngoại lệ duy nhất: `.agents/baseline.json`).

1. Chạy `git status` và `git log --oneline -5`. Ghi lại commit hiện tại.
2. Nếu chưa có `.agents/baseline.json`: chạy `node .agents/scripts/fwea.js test baseline`.
3. Nhận diện: frontend (`tkweb/`), admin (`admin-system/`, `tkweb/admin/`), assets, CSS/JS dùng chung, test, screenshot pipeline, tài liệu, file generated.
4. Với yêu cầu đang xét, dùng grep để tìm: file chứa selector/hàm liên quan, các file khác dùng chung cùng CSS/JS, test đang đọc các file đó (`grep -l` trong `tkweb/tests/`).
5. Trùng lặp/legacy/selector xung đột → ghi `LEGACY CANDIDATE`. Không xóa.

Xuất đúng các mục:
PROJECT MAP · PROJECT RISKS · DEPENDENCY MAP · UI/UX RISK MAP · TEST MAP (kèm baseline) · CHANGE HOTSPOTS

Kết thúc bằng: "AUDIT xong, chưa sửa file nào. Chạy /plan với yêu cầu cụ thể."
