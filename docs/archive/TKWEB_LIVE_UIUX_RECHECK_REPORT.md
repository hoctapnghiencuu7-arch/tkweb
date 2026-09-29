# TKWEB — LIVE UI/UX RE-CHECK REPORT
## Light / Dark / Responsive / Admin

Ngày kiểm tra: 14/09/2026

---

## 1. Kết luận quan trọng

Bản project hiện tại **chưa thể coi là "đã fix UI/UX"** chỉ dựa vào `tests/e2e-report.json` hoặc `tests/static-analysis.js`.

### Trạng thái kiểm tra

| Hạng mục | Kết quả |
|---|---|
| Static asset/link/syntax check | PASS |
| Existing project screenshots | Đã kiểm tra |
| Light desktop | Có bằng chứng screenshot |
| Dark desktop | Có bằng chứng screenshot |
| Light mobile | Có bằng chứng screenshot |
| Dark mobile | Chưa đủ bằng chứng |
| Live browser re-render trong môi trường hiện tại | BỊ CHẶN bởi browser policy |
| Admin desktop | Có screenshot + source evidence |
| Admin mobile | Chưa hoàn tất live run |
| UI/UX regression | **Còn nhiều điểm cần sửa** |

> Lưu ý: môi trường kiểm tra hiện tại chặn Chrome mở `127.0.0.1`, IP nội bộ và `file://` với `ERR_BLOCKED_BY_ADMINISTRATOR`. Vì vậy không nên giả vờ rằng em đã có một phiên browser live hoàn chỉnh. Phần kết luận UI dưới đây dựa trên source code + các screenshot render sẵn có trong project.

---

# 2. Phát hiện UI/UX trực tiếp từ screenshot

## UI-001 — Header mobile quá dày và dễ bị nén

### Bằng chứng
`tests/screenshots/13_mobile_homepage_light.png`

### Quan sát

Ở mobile, header đang cố chứa quá nhiều thành phần:

- Logo
- các link điều hướng
- search
- theme toggle
- đăng nhập
- đăng ký

Trong screenshot mobile, các thành phần đầu trang bị thu nhỏ mạnh và trở nên khó đọc/khó thao tác.

### Nguyên nhân kỹ thuật

`assets/css/style.css` đang chuyển `.nav-links` sang `display:none` ở `max-width:768px`, nhưng phần `.header-right` vẫn mang nhiều control desktop.

### Hướng sửa

Mobile header chỉ nên giữ:

```text
Logo
Theme
Menu button
```

Các thao tác:

```text
Tìm kiếm
Đăng nhập
Đăng ký
Quản trị
```

đưa vào mobile drawer.

Không cố ép mọi control vào một dòng.

---

# 3. UI-002 — Schedule mobile bị co nội dung về một cột hẹp

### Bằng chứng

`tests/screenshots/14_mobile_schedule_light.png`

### Quan sát

Nội dung schedule mobile chiếm một phần nhỏ bên trái trong khi phần bên phải để trống rất lớn.

Đây là dấu hiệu rõ của layout width/parent sizing không được đồng bộ với viewport.

### Rủi ro

- Người dùng phải đọc nội dung trong vùng quá hẹp.
- Các bảng/thẻ bị xuống dòng quá sớm.
- Không tận dụng màn hình điện thoại.
- UX gần giống một desktop layout bị ép thu nhỏ.

### Nguồn code cần kiểm tra

```text
.schedule-mobile-cards-view
.sched-mobile-card
.admin-main-area
.container
.schedule page wrapper
```

### Hướng sửa

Mobile phải dùng:

```css
width: 100%;
max-width: 100%;
margin-inline: 0;
```

và parent phải:

```css
min-width: 0;
```

Đồng thời kiểm tra mọi `width`, `max-width`, `min-width` kế thừa từ desktop.

---

# 4. UI-003 — Schedule desktop quá dài và quá đặc

### Bằng chứng

`tests/screenshots/10_schedule_desktop_light.png`
`tests/screenshots/11_schedule_desktop_dark.png`

### Quan sát

Trang có:

- bảng ma trận dài;
- FIDS table dài;
- nhiều badge;
- nhiều cột;
- nhiều thông tin phụ.

Trên desktop thì vẫn sử dụng được nhưng mật độ thông tin cao.

### Cần cải thiện

- Giảm thông tin phụ trên mỗi row.
- Dùng tooltip cho thông tin ít quan trọng.
- Cho phép sticky table header.
- Phân nhóm thông tin chính/phụ.
- Không để text nhỏ quá.

---

# 5. UI-004 — Admin quá dày thông tin

### Bằng chứng

`tests/screenshots/09_admin_dashboard_dark.png`
`tests/screenshots/12_admin_website_editor_light.png`

### Quan sát

Admin hiện có rất nhiều:

- card;
- table;
- statistic;
- form;
- editor;
- chart;
- control.

Mật độ thông tin cao khiến khả năng quét nhanh của người quản trị thấp.

Đặc biệt `admin/index.html` có khoảng **255 inline style**.

### Vấn đề

Inline style quá nhiều làm:

- khó kiểm soát theme;
- khó responsive;
- khó thay đổi spacing;
- dễ sinh style conflict;
- khó debug khi một page khác bị ảnh hưởng.

### Hướng sửa

Không rewrite toàn bộ.

Chia dần:

```text
admin-shell
admin-navigation
admin-cards
admin-tables
admin-editor
admin-preview
```

và chuyển style quan trọng sang CSS scoped.

---

# 6. UI-005 — CMS Editor tồn tại nhưng chưa nên coi là CMS production

### Bằng chứng source

`admin/index.html`
`assets/js/main.js`

Đã có:

```text
#website-editor
#website-editor-form
#websitePreviewFrame
```

và có:

```text
skywings_site_content
skywings_cms_revisions
```

### Nhưng

Dữ liệu hiện đang nằm ở client-side Storage.

Trong `main.js`, logic có dạng:

```js
this.set('skywings_site_content', SecurityVault.encrypt(updated));
```

và revision cũng lưu qua Storage.

### Kết luận

Đây phù hợp với:

```text
Prototype / Demo CMS
```

chưa phải:

```text
Production CMS
```

Không nên để UI hiển thị thông điệp khiến người dùng tưởng dữ liệu đã nằm trên server/database nếu backend chưa thực sự nối vào.

---

# 7. CRITICAL-001 — Admin vẫn có dev bypass nguy hiểm

### Bằng chứng source

`assets/js/main.js`

Code hiện có:

```js
const urlParams = new URLSearchParams(window.location.search);
const isDevBypass = urlParams.has('theme') || urlParams.has('dev');
```

và:

```js
if (!currentUser && !isDevBypass) {
    // redirect
}
```

### Vấn đề

Điều này làm:

```text
/admin/index.html?theme=dark
```

có thể bypass guard.

### Cần sửa

Theme không bao giờ được dùng làm authorization bypass.

Tách hoàn toàn:

```js
const isDevMode = false;
```

hoặc dùng biến môi trường dev thực sự.

Production phải:

```js
if (!currentUser || currentUser.role !== 'admin') {
   redirect();
}
```

---

# 8. CRITICAL-002 — Role admin đang được suy ra từ email phía client

### Bằng chứng source

`assets/js/main.js`

Logic hiện tại:

```js
const isEmailAdmin =
    email.toLowerCase().includes('admin') ||
    email.toLowerCase() === 'admin@skywings.vn' ||
    customRole === 'admin';
```

### Vấn đề

Đây không phải authorization thật.

Người dùng nhập một email có chuỗi:

```text
admin
```

thì client có thể tự tạo role admin.

### Kết luận

Đây là lỗi kiến trúc bảo mật, không phải UI.

### Cần sửa

Role phải do backend cấp:

```text
POST /auth/login
      ↓
server validates credentials
      ↓
server returns authenticated session/token
      ↓
server role = admin
```

Frontend chỉ đọc kết quả, không tự quyết định quyền.

---

# 9. UI-006 — Typography đang có nguy cơ không nhất quán

### Bằng chứng source

`index.html` đang load:

```html
Inter
Plus Jakarta Sans
```

trong khi `style.css` lại có:

```css
@import url('https://fonts.googleapis.com/...Plus+Jakarta+Sans...');
```

và body:

```css
font-family:
  'Plus Jakarta Sans',
  -apple-system,
  BlinkMacSystemFont,
  "Inter",
  "Segoe UI",
  Roboto,
  sans-serif;
```

### Vấn đề

Có nhiều cơ chế load font cùng lúc.

Điều này gây:

- tải font trùng;
- font swap;
- khác biệt rendering giữa máy;
- khó debug page nào đang sử dụng font nào;
- dễ xuất hiện lỗi khi Google Fonts không tải được.

### Cần chuẩn hóa

Chỉ nên có một nguồn typography chính:

```text
Plus Jakarta Sans
```

và một fallback stack rõ ràng.

---

# 10. UI-007 — CSS đang quá lớn và có quá nhiều override

### Kết quả scan

`assets/css/style.css`

- khoảng **310 KB**
- khoảng **1771 cặp `{}`**
- khoảng **291 lần `!important`**
- nhiều media query rải ở nhiều vị trí
- rất nhiều width cố định

Có các giá trị dạng:

```text
width: 450px
width: 500px
width: 480px
width: 420px
width: 380px
width: 360px
width: 320px
```

### Vấn đề

Đây là nguồn chính tạo ra:

```text
Desktop OK
→ Tablet vỡ
→ Mobile patch
→ Patch tạo override
→ Dark mode thêm override
→ Page khác vỡ
```

### Đây rất có thể là nguyên nhân Master đang thấy

> sửa header → footer lỗi  
> sửa mobile → desktop lỗi  
> sửa font → admin lỗi

---

# 11. UI-008 — Inline style cực nhiều ở những page quan trọng

### Scan

| Page | inline `style=` |
|---|---:|
| index.html | 72 |
| booking.html | 70 |
| flights.html | 33 |
| login.html | 14 |
| payment.html | 129 |
| register.html | 11 |
| schedule.html | **360** |
| seats.html | 37 |
| ticket.html | 80 |
| admin/index.html | **255** |

### Đặc biệt

```text
schedule.html = 360 inline styles
admin/index.html = 255 inline styles
payment.html = 129 inline styles
```

Đây là một trong các nguyên nhân làm UI khó maintain.

---

# 12. UI-009 — Stepper có min-width 580px

### Bằng chứng source

```css
.modern-stepper-track {
    min-width: 580px;
}
```

Stepper nằm trong:

```css
.modern-stepper-container {
    overflow-x: auto;
}
```

### Nhận xét

Đây không nhất thiết là bug vì nó đã có scroll ngang.

Nhưng UX mobile chưa tối ưu:

- phải kéo ngang;
- label dài;
- dễ bỏ sót bước;
- không thân thiện với màn hình 320–390px.

### Nên đổi

Mobile có thể chuyển sang:

```text
Step 3 / 5
```

hoặc compact stepper.

---

# 13. UI-010 — Website đang phụ thuộc nhiều vào external font/CDN

### Nguồn

```text
fonts.googleapis.com
cdn.tailwindcss.com
```

### Rủi ro

Trên môi trường:

- offline;
- máy chấm;
- mạng chậm;
- CSP chặt;

font hoặc Tailwind có thể không tải.

### Nên làm

Production build nên bundle dependency quan trọng.

---

# 14. Dark Mode — Đánh giá

### Kết luận chung

Dark mode desktop của:

- Homepage
- Schedule
- Admin

về tổng thể đã có hệ màu rõ ràng.

Các token như:

```css
--bg-page
--bg-card
--bg-input
--text-dark
--text-body
--text-muted
--border-subtle
```

đã tạo được nền tảng tốt.

### Nhưng

Vẫn cần regression test toàn bộ component, đặc biệt:

```text
input
select
date
toast
modal
badge
table
editor
iframe preview
chart
```

Lý do là project vẫn có rất nhiều inline color/background.

---

# 15. Light Mode — Đánh giá

Light mode tổng thể sáng, dễ đọc và có hierarchy rõ.

Nhưng:

- density khá cao ở các page nghiệp vụ;
- mobile schedule là điểm yếu rõ nhất;
- admin editor quá nhiều nội dung cùng lúc;
- một số phần dùng màu rất nhạt, dễ giảm readability trên màn hình chất lượng thấp.

---

# 16. Existing automated test có vấn đề

`tests/e2e-cdp-runner.js`
và các script screenshot đang hard-code:

```text
Microsoft Edge
C:\Program Files (x86)\...
```

Đây là Windows-specific.

Trong môi trường Linux hiện tại, script đó không thể phản ánh một browser run hoàn chỉnh.

### Vì vậy

`tests/e2e-report.json` ghi:

```text
PASS
```

không đồng nghĩa:

```text
UI responsive đã được nghiệm thu toàn diện.
```

Nó chủ yếu chứng minh các DOM/functionality được test không chết ở kịch bản đó.

---

# 17. Việc cần sửa trước tiên

Không tiếp tục sửa hàng loạt.

Thứ tự nên là:

## P0

```text
1. Remove admin dev bypass.
2. Remove client-generated admin role.
3. Backend authorization.
```

## P1

```text
4. Fix mobile header.
5. Fix schedule mobile width.
6. Stabilize admin shell.
7. Stabilize CMS editor.
8. Normalize typography.
```

## P2

```text
9. Reduce inline styles.
10. Reduce !important.
11. Consolidate responsive CSS.
12. Reduce hard-coded widths.
13. Optimize Three.js / heavy assets.
```

---

# 18. Quy trình sửa dành cho Antigravity

KHÔNG giao:

```text
"Fix all UI."
```

Giao từng ticket:

```text
BUG-UI-001
Fix mobile header only.

Files:
- assets/css/style.css
- assets/js/main.js
- affected page templates

Do not modify:
- payment
- schedule
- admin
- footer

Acceptance:
- 320px
- 390px
- 768px
- desktop unchanged
```

Sau đó:

```text
BUG-UI-002
Fix schedule mobile width only.
```

Sau đó:

```text
BUG-UI-003
Fix admin shell only.
```

Sau đó:

```text
BUG-UI-004
Normalize typography only.
```

---

# 19. Definition of Done mới

Không được ghi:

```text
PASS
```

chỉ vì:

```text
npm build
```

Mỗi ticket phải có:

```text
[ ] source check
[ ] build
[ ] console check
[ ] light
[ ] dark
[ ] mobile
[ ] tablet
[ ] desktop
[ ] regression pages
[ ] screenshot evidence
```

---

# 20. Kết luận cuối

Project **không phải không có tiến triển**.

Những phần như:

- design tokens;
- dark/light architecture;
- CMS editor;
- schedule mobile view;
- seat restriction;
- auth flow;
- header/footer structure

đã được xây khá nhiều.

Vấn đề hiện tại là **implementation đã trở nên quá phức tạp và chồng override**.

Đó là lý do Antigravity có thể:

```text
fix A
→ break B
→ fix B
→ break C
→ fix C
→ break A
```

Muốn thoát vòng lặp này phải chuyển từ:

```text
AI sửa toàn project
```

sang:

```text
baseline
→ one issue
→ smallest patch
→ screenshot
→ regression
→ commit
→ next issue
```

Đây là thay đổi quy trình quan trọng nhất đối với project hiện tại.
