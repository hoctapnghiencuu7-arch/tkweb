---
description: FWEA MODE 4 — Kiểm chứng thực tế: syntax, test, visual, regression
---
Không được báo hoàn thành chỉ dựa trên đọc source.

1. Scope: `node .agents/scripts/fwea.js check <TASK-ID>` (phải SCOPE OK).
2. Syntax: mỗi file JS đã sửa chạy `node --check <file>`; HTML/CSS đọc lại đoạn đã sửa, tìm thẻ/ngoặc lỗi.
3. Test: `node .agents/scripts/fwea.js test compare`. Có REGRESSION → DỪNG.
   Suite fail sẵn từ baseline mà không liên quan task: ghi lại, không sửa.
4. Regression file: `git diff --stat <base>` — mọi file FORBIDDEN phải không xuất hiện.
5. Visual QA (nếu task đụng UI): 1440x900, 768x1024, 390x844, 375x812. Dùng `tkweb/tests/take_all_screenshots.js` nếu chạy được. Không chạy được → ghi "VISUAL QA CHƯA THỰC HIỆN" kèm lý do. Tuyệt đối không nói đã kiểm tra khi chưa làm.
6. Kiểm tra: tràn ngang, căn lề, khoảng cách, font, contrast, hover/focus, sticky/fixed, dark mode, đúng flow người dùng.
7. Lệnh lỗi/timeout: đọc stderr, tái hiện, cô lập. Không giả định nguyên nhân, không ghi PASS.

Kết thúc: liệt kê từng mục PASS / FAIL / CHƯA KIỂM TRA. Sau đó chạy /report.
