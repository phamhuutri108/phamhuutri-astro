Bạn là chuyên gia Astro framework và CloudCannon CMS. Tôi là người KHÔNG BIẾT CODE.

# MỤC TIÊU
Setup website portfolio phamhuutri.com bằng Astro từ đầu trong folder `phamhuutri-astro`. Website cũ nằm trong folder `portfolio-phamhuutri` cùng cấp - hãy LUÔN đọc code cũ trước khi viết code mới để đảm bảo giao diện và logic KHÔNG THAY ĐỔI.

# NGUYÊN TẮC BẮT BUỘC
1. Trước MỖI bước: đọc file tương ứng trong `portfolio-phamhuutri/` để hiểu cấu trúc HTML, CSS class, JS logic
2. KHÔNG được thay đổi giao diện - phải pixel-perfect với website cũ
3. KHÔNG được thay đổi logic JS - giữ nguyên mọi tương tác
4. Làm TỪNG BƯỚC MỘT, mỗi bước phải chạy được (`npm run dev`) trước khi sang bước tiếp
5. Giải thích bằng tiếng Việt, NGẮN GỌN, chỉ nói điều cần thiết
6. Tiết kiệm tokens tối đa - không giải thích dài, không lặp lại code đã có

# KIẾN TRÚC WEBSITE CŨ (TÓM TẮT ĐỂ BẠN HIỂU TRƯỚC)

## Cấu trúc file cũ
```
portfolio-phamhuutri/
├── index.html          ← Toàn bộ HTML + inline JS (2322 dòng, SPA giả lập)
├── style.css           ← CSS (1911 dòng)
├── short-films-data.js ← Object: filmsData = { "short-films-slug": { title:{vi,en}, thumbnail, vi, en, crewData?, btsData? } }
├── commercials-data.js ← Object: commercialData = { "commercials-slug": { ... tương tự } }
├── others-data.js      ← Object: othersData = { "others-slug": { ... tương tự } }
└── writings-data.js    ← Array: writingData = [{ id, date, location, title:{vi,en}, content:{vi,en} }]
```

## Cách website cũ hoạt động
- SPA giả lập: 1 trang duy nhất, ẩn/hiện sections bằng JS `showPage()`
- Song ngữ: class `mode-en`/`mode-vi` trên `<body>`, hiện/ẩn `.content-en`/`.content-vi` qua CSS
- Sidebar cố định bên trái (260px), main content bên phải
- Lazy rendering: nội dung chi tiết project chỉ tạo DOM khi click vào (hàm `renderSectionContent()`)
- Data JS là biến global (filmsData, commercialData, othersData, writingData)
- History API pushState cho URL sạch (/short-films/slug, /writings/slug, etc.)
- 3 music player độc lập tự tắt nhau (Home chaos, Contact image, Writings playlist)
- Writings: tiêu đề bay vật lý (physics engine tự code, va chạm tường + va chạm nhau)
- Home: click ảnh → chaos words explosion + background music + drag-drop
- About: Resume link bay lơ lửng + chase mouse game
- Lightbox gallery: crew slider + BTS + swipe mobile + keyboard nav
- Google Sheets: fetch CSV từ Apps Script để ẩn/hiện projects realtime
- Content protection: chặn right-click, drag, copy, devtools

## Các sections trong HTML cũ
- `#home` → page-section, chứa ảnh trung tâm + play/pause hint + music credit
- `#about` → page-section, bio song ngữ + awards + resume chase
- `#contact` → page-section, thông tin liên hệ + ảnh musical
- `#not-found` → page-section, 404
- `#cat-short-films` → page-section, gallery grid (render từ JS)
- `#cat-commercials` → page-section, gallery grid (render từ JS)
- `#cat-others` → page-section, gallery grid (render từ JS)
- `#cat-writings` → page-section, writings physics list + detail view + music player
- Chi tiết project → page-section được tạo dynamic bởi `renderSectionContent()`

## CSS quan trọng cần giữ nguyên
- `.wrapper { display: flex }` - layout chính
- `.sidebar { width: 260px; position: sticky; top: 0; height: 100vh }` 
- `.content { flex: 1 }` - main area
- `.page-section { display: none }` + `.active-section { display: block }` - SPA
- `.mode-en .content-vi { display: none }` / `.mode-vi .content-en { display: none }` - song ngữ
- `.category-group .category-list { max-height: 0; overflow: hidden }` + `.is-open .category-list { max-height: 1000px }` - accordion sidebar
- `.active-link { color: #0033cc }` - active menu
- Responsive ở `@media (max-width: 768px)` - sidebar chuyển thành header

---

# CÁC BƯỚC THỰC HIỆN (LÀM LẦN LƯỢT)

## BƯỚC 0: Khởi tạo Astro project
**Trước khi làm:** Không cần đọc gì.
**Làm:**
```
cd phamhuutri-astro
npm create astro@latest . -- --template minimal --no-install --no-git
npm install
```
Sau đó chỉnh `astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://phamhuutri.com',
});
```
**Kiểm tra:** `npm run dev` → thấy trang Astro mặc định chạy trên localhost.

---

## BƯỚC 1: Tạo Layout chính
**Trước khi làm:** Đọc `portfolio-phamhuutri/index.html` dòng 1-32 (phần `<head>`) và dòng 36-120 (phần sidebar HTML). Đọc `portfolio-phamhuutri/style.css` dòng 1-50 (phần base + sidebar).
**Làm:** 
- Copy file `portfolio-phamhuutri/style.css` → `phamhuutri-astro/public/style.css` (NGUYÊN VẸN, không sửa gì)
- Tạo `src/layouts/BaseLayout.astro` chứa:
  - `<head>` giống hệt website cũ (meta, og, twitter, favicon, link CSS)
  - `<body>` → `<div class="wrapper">` → `<aside class="sidebar">` + `<main class="content"><slot /></main>`
  - Sidebar HTML copy nguyên vẹn từ website cũ (lang switch, avatar, main menu, category groups, copyright)
  - Cuối body: đặt tất cả `<script>` tags (sẽ thêm sau)

**Tạo `src/pages/index.astro`:**
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout>
  <!-- Sẽ thêm sections ở các bước sau -->
  <div id="home" class="page-section active-section">
    <p>Home - đang xây dựng</p>
  </div>
</BaseLayout>
```
**Kiểm tra:** `npm run dev` → thấy sidebar bên trái, nội dung "Home" bên phải, CSS hoạt động đúng.

---

## BƯỚC 2: Tạo các Sections tĩnh (Home, About, Contact, 404)
**Trước khi làm:** Đọc `portfolio-phamhuutri/index.html`:
- Dòng 123-143 → section `#home`
- Dòng 145-156 → section `#not-found`
- Dòng 158-270 → section `#about`
- Dòng 272-326 → section `#contact`

**Làm:** Tạo Astro components cho từng section:
- `src/components/sections/HomeSection.astro` - copy HTML nguyên vẹn từ `#home`
- `src/components/sections/NotFoundSection.astro` - copy HTML nguyên vẹn từ `#not-found`
- `src/components/sections/AboutSection.astro` - copy HTML nguyên vẹn từ `#about` 
- `src/components/sections/ContactSection.astro` - copy HTML nguyên vẹn từ `#contact`

Cập nhật `src/pages/index.astro` để import và dùng tất cả components.

**LƯU Ý QUAN TRỌNG:** Giữ nguyên tất cả:
- id attributes (home, about, contact, not-found)
- class names (page-section, active-section, content-en, content-vi, v.v.)
- inline styles
- onclick handlers (showPage, setLanguage, v.v.)
- Cấu trúc HTML y hệt - KHÔNG được "cải tiến" hay "tối ưu"

**Kiểm tra:** `npm run dev` → tất cả sections hiển thị đúng layout, đúng nội dung.

---

## BƯỚC 3: Tạo các Sections danh mục (Short Films, Commercials, Others, Writings)
**Trước khi làm:** Đọc `portfolio-phamhuutri/index.html`:
- Dòng 328-345 → `#cat-short-films` 
- Dòng 347-364 → `#cat-commercials`
- Dòng 367-383 → `#cat-others`
- Dòng 392-489 → `#cat-writings` (phức tạp nhất: writings top area + detail view + music player + text tools)

**Làm:** Tạo components:
- `src/components/sections/ShortFilmsSection.astro`
- `src/components/sections/CommercialsSection.astro`
- `src/components/sections/OthersSection.astro`
- `src/components/sections/WritingsSection.astro` ← PHẢI copy đầy đủ: writings-top-area, writing-control-wrapper, writing-player panel, writings-list-container, writings-detail-view, writing-tools-wrapper, audio tag

Cập nhật `index.astro` import tất cả.

**Kiểm tra:** `npm run dev` → tất cả sections hiện đúng cấu trúc HTML.

---

## BƯỚC 4: Thêm Lightbox overlay
**Trước khi làm:** Đọc `portfolio-phamhuutri/index.html` dòng 1222-1237 (lightbox HTML).
**Làm:** Tạo `src/components/Lightbox.astro`, copy nguyên vẹn HTML của lightbox overlay. Thêm vào `BaseLayout.astro` trước thẻ đóng `</div>` của wrapper (hoặc sau main).

**Kiểm tra:** `npm run dev` → lightbox overlay ẩn nhưng có trong DOM.

---

## BƯỚC 5: Thêm Data files
**Trước khi làm:** Đọc cấu trúc 4 file data trong `portfolio-phamhuutri/`:
- `short-films-data.js` → biến global `filmsData`
- `commercials-data.js` → biến global `commercialData`  
- `others-data.js` → biến global `othersData`
- `writings-data.js` → biến global `writingData`

**Làm:** Copy 4 file data nguyên vẹn vào `phamhuutri-astro/public/`:
```
cp portfolio-phamhuutri/short-films-data.js phamhuutri-astro/public/
cp portfolio-phamhuutri/commercials-data.js phamhuutri-astro/public/
cp portfolio-phamhuutri/others-data.js phamhuutri-astro/public/
cp portfolio-phamhuutri/writings-data.js phamhuutri-astro/public/
```

Trong `BaseLayout.astro`, thêm script tags trước thẻ đóng `</body>`:
```html
<script is:inline src="/short-films-data.js"></script>
<script is:inline src="/commercials-data.js"></script>
<script is:inline src="/others-data.js"></script>
<script is:inline src="/writings-data.js"></script>
```

**LƯU Ý:** Phải dùng `is:inline` vì Astro mặc định bundle JS - ta cần giữ chúng là global variables.

**Kiểm tra:** Mở browser console → gõ `filmsData` → thấy object data.

---

## BƯỚC 6: Thêm JS hệ thống chính (SPA + Routing + Rendering)
**Trước khi làm:** Đọc `portfolio-phamhuutri/index.html` dòng 493-792. Đây là CORE SYSTEM gồm:
- `urlMapping` - bảng mapping pageId ↔ URL
- `getProjectData()` - tìm data từ ID
- `renderSectionContent()` - tạo DOM chi tiết project (crew + BTS)
- `getIdFromUrl()` - parse URL thành pageId
- `showPage()` - ẩn/hiện sections + active menu + history
- `updateHistory()` - pushState
- `renderProjectSystem()` - tạo sidebar links + grid thumbnails
- DOMContentLoaded init + popstate handler

**Làm:** Tạo file `public/js/core-system.js`, copy NGUYÊN VẸN toàn bộ đoạn script từ dòng 494-791 (chỉ lấy nội dung bên trong thẻ `<script>`, không lấy thẻ script).

Trong `BaseLayout.astro`, thêm SAU các data script:
```html
<script is:inline src="/js/core-system.js"></script>
```

**Kiểm tra:** `npm run dev` → sidebar hiển thị danh sách phim, click vào thấy chuyển trang, URL thay đổi.

---

## BƯỚC 7: Thêm JS Language System
**Trước khi làm:** Đọc `portfolio-phamhuutri/index.html` dòng 1124-1152 (setLanguage + localStorage).
**Làm:** Tạo `public/js/language.js`, copy nguyên vẹn. Thêm vào `BaseLayout.astro`.

**Kiểm tra:** Click EN/VI → chuyển ngôn ngữ, F5 giữ nguyên lựa chọn.

---

## BƯỚC 8: Thêm JS Home Chaos System
**Trước khi làm:** Đọc `portfolio-phamhuutri/index.html` dòng 805-972. Đây là hệ thống:
- Chaos words explosion khi click ảnh home
- Background music (play/pause)
- Drag & drop words
- Floating animation
- stopHomeMusic() global function
- Lang switch cập nhật words

**Làm:** Tạo `public/js/home-chaos.js`, copy nguyên vẹn. Thêm vào `BaseLayout.astro`.

**Kiểm tra:** Click ảnh home → chữ bay ra + nhạc chạy. Click lại → reset. Kéo thả chữ hoạt động.

---

## BƯỚC 9: Thêm JS Resume Chase
**Trước khi làm:** Đọc `portfolio-phamhuutri/index.html` dòng 982-1120.
**Làm:** Tạo `public/js/resume-chase.js`, copy nguyên vẹn. Thêm vào `BaseLayout.astro`.

**Kiểm tra:** Vào trang About → hover Resume → nó chạy trốn.

---

## BƯỚC 10: Thêm JS Contact Music
**Trước khi làm:** Đọc `portfolio-phamhuutri/index.html` dòng 1165-1207.
**Làm:** Tạo `public/js/contact-music.js`, copy nguyên vẹn. Thêm vào `BaseLayout.astro`.

**Kiểm tra:** Vào Contact → click ảnh → nhạc chạy. Click lại → dừng.

---

## BƯỚC 11: Thêm JS Lightbox System
**Trước khi làm:** Đọc `portfolio-phamhuutri/index.html` dòng 1239-1441. Gồm:
- Click handler cho gallery-wall img và crew-card img
- Simple lightbox + Crew gallery lightbox
- Navigation (next/prev/keyboard/swipe)
- Lock/unlock body scroll
- Touch swipe handling

**Làm:** Tạo `public/js/lightbox.js`, copy nguyên vẹn. Thêm vào `BaseLayout.astro`.

**Kiểm tra:** Click vào ảnh BTS → lightbox mở, vuốt/arrow key chuyển ảnh.

---

## BƯỚC 12: Thêm JS Writings Physics + Sidebar + Detail
**Trước khi làm:** Đọc `portfolio-phamhuutri/index.html` dòng 1444-1721. Đây là hệ thống lớn:
- `renderWritingList()` - tạo writings-scatter-item với position absolute
- `runPhysicsLoop()` - animation frame loop: di chuyển + va chạm tường + va chạm nhau + friction
- `isOverlapping()` - collision detection
- `renderWritingSidebar()` - tạo sidebar links cho writings
- `openWritingDetail()` - mở bài viết chi tiết + pushState
- `closeWritingDetail()` - đóng + pushState về /writings

**Làm:** Tạo `public/js/writings-system.js`, copy nguyên vẹn. Thêm vào `BaseLayout.astro`.

**Kiểm tra:** Vào Writings → chữ bay va chạm. Click 1 bài → mở chi tiết. Bấm ← quay lại.

---

## BƯỚC 13: Thêm JS Writing Music Player
**Trước khi làm:** Đọc `portfolio-phamhuutri/index.html` dòng 1734-1951. Gồm:
- writingPlaylist array (15 bài Haruka Nakamura)
- Player controls (play/pause/next/prev/expand)
- Playlist rendering
- Time display + countdown
- Auto-next + preload durations
- stopWritingMusic() global

**Làm:** Tạo `public/js/writing-music.js`, copy nguyên vẹn. Thêm vào `BaseLayout.astro`.

**Kiểm tra:** Vào Writings → click tiêu đề "Writings" → player mở. Chọn bài → nhạc chạy.

---

## BƯỚC 14: Thêm JS Text Size + Content Protection + Google Sheets + Crew System + Hash Link
**Trước khi làm:** Đọc `portfolio-phamhuutri/index.html`:
- Dòng 1964-2015 → text size adjustment
- Dòng 2023-2060 → content protection (right-click, copy, devtools)
- Dòng 2071-2119 → Google Sheets fetch CSV
- Dòng 2130-2291 → crew scroller system (scroll snap, drag, click, lightbox)
- Dòng 2298-2322 → hash link handler

**Làm:** Tạo các file tương ứng trong `public/js/`:
- `text-size.js`
- `content-protection.js`
- `google-sheets.js`
- `crew-system.js`
- `hash-link.js`

Copy nguyên vẹn nội dung. Thêm tất cả vào `BaseLayout.astro`.

**Kiểm tra:** Tất cả tính năng hoạt động giống website cũ.

---

## BƯỚC 15: Kiểm tra toàn bộ
**Làm:** Mở `npm run dev` và kiểm tra từng mục:
1. ✅ Sidebar hiển thị đúng, avatar, menu, category groups
2. ✅ Click Home/About/Contact → chuyển section
3. ✅ EN/VI → chuyển ngôn ngữ
4. ✅ Click Short Films → grid ảnh hiện
5. ✅ Click 1 phim → chi tiết + crew slider + BTS
6. ✅ Home chaos explosion + music + drag
7. ✅ Resume chase trên About
8. ✅ Contact music click
9. ✅ Writings physics bay + chi tiết + music player
10. ✅ Lightbox + swipe + keyboard
11. ✅ URL routing (/about, /short-films/slug, v.v.)
12. ✅ Browser back/forward
13. ✅ Mobile responsive (sidebar → header)
14. ✅ Google Sheets ẩn/hiện
15. ✅ Content protection

**Nếu có lỗi:** Báo cho tôi lỗi cụ thể, tôi sẽ so sánh với code cũ để fix.

---

## BƯỚC 16: Chuẩn bị CloudCannon
**Trước khi làm:** Đọc tài liệu CloudCannon cho Astro tại https://cloudcannon.com/documentation/guides/astro-starter-guide/

**Làm:**
1. Tạo file `cloudcannon.config.yml` ở root:
```yaml
source: ''
paths:
  data: src/data
  static: public
  uploads: public/uploads

collections_config:
  short_films:
    path: src/data/short-films
    output: false
    name: Short Films
    icon: movie
    
  commercials:
    path: src/data/commercials
    output: false
    name: Commercials
    icon: videocam
    
  others:
    path: src/data/others
    output: false
    name: Others
    icon: folder
    
  writings:
    path: src/data/writings
    output: false
    name: Writings
    icon: edit
```

2. Trong tương lai, khi chuyển data từ JS sang YAML/JSON để CloudCannon edit được, sẽ cần:
   - Chuyển filmsData → từng file YAML trong `src/data/short-films/`
   - Chuyển commercialData → `src/data/commercials/`
   - Chuyển othersData → `src/data/others/`
   - Chuyển writingData → `src/data/writings/`
   - Đọc data bằng Astro content collections thay vì JS global
   
   **NHƯNG** bước này phức tạp và sẽ làm SAU. Hiện tại data JS vẫn hoạt động tốt.

**Kiểm tra:** Push lên GitHub → kết nối CloudCannon → build thành công.

---

# THỨ TỰ SCRIPT TAGS TRONG BaseLayout.astro

Đây là thứ tự CHÍNH XÁC các script cần đặt trước `</body>`:

```html
<!-- 1. Data files (phải load trước vì các JS khác phụ thuộc) -->
<script is:inline src="/short-films-data.js"></script>
<script is:inline src="/commercials-data.js"></script>
<script is:inline src="/others-data.js"></script>
<script is:inline src="/writings-data.js"></script>

<!-- 2. Core system (SPA routing - phụ thuộc data) -->
<script is:inline src="/js/core-system.js"></script>

<!-- 3. Language (độc lập) -->
<script is:inline src="/js/language.js"></script>

<!-- 4. Feature modules (phụ thuộc DOM + một số phụ thuộc lẫn nhau qua window.stop*Music) -->
<script is:inline src="/js/home-chaos.js"></script>
<script is:inline src="/js/resume-chase.js"></script>
<script is:inline src="/js/contact-music.js"></script>
<script is:inline src="/js/lightbox.js"></script>
<script is:inline src="/js/writings-system.js"></script>
<script is:inline src="/js/writing-music.js"></script>
<script is:inline src="/js/text-size.js"></script>
<script is:inline src="/js/content-protection.js"></script>
<script is:inline src="/js/google-sheets.js"></script>
<script is:inline src="/js/crew-system.js"></script>
<script is:inline src="/js/hash-link.js"></script>
```

**TẤT CẢ đều phải có `is:inline`** vì chúng dùng biến global và DOMContentLoaded.

---

# CẤU TRÚC FILE CUỐI CÙNG

```
phamhuutri-astro/
├── astro.config.mjs
├── cloudcannon.config.yml
├── package.json
├── public/
│   ├── style.css                    ← Copy nguyên từ website cũ
│   ├── short-films-data.js          ← Copy nguyên
│   ├── commercials-data.js          ← Copy nguyên
│   ├── others-data.js               ← Copy nguyên
│   ├── writings-data.js             ← Copy nguyên
│   └── js/
│       ├── core-system.js           ← Từ index.html dòng 494-791
│       ├── language.js              ← Từ index.html dòng 1126-1151
│       ├── home-chaos.js            ← Từ index.html dòng 807-971
│       ├── resume-chase.js          ← Từ index.html dòng 983-1119
│       ├── contact-music.js         ← Từ index.html dòng 1167-1206
│       ├── lightbox.js              ← Từ index.html dòng 1240-1441
│       ├── writings-system.js       ← Từ index.html dòng 1446-1720
│       ├── writing-music.js         ← Từ index.html dòng 1740-1950
│       ├── text-size.js             ← Từ index.html dòng 1966-2014
│       ├── content-protection.js    ← Từ index.html dòng 2028-2059
│       ├── google-sheets.js         ← Từ index.html dòng 2072-2118
│       ├── crew-system.js           ← Từ index.html dòng 2135-2290
│       └── hash-link.js             ← Từ index.html dòng 2299-2322
└── src/
    ├── layouts/
    │   └── BaseLayout.astro         ← Head + Sidebar + Script tags
    ├── components/
    │   ├── sections/
    │   │   ├── HomeSection.astro
    │   │   ├── AboutSection.astro
    │   │   ├── ContactSection.astro
    │   │   ├── NotFoundSection.astro
    │   │   ├── ShortFilmsSection.astro
    │   │   ├── CommercialsSection.astro
    │   │   ├── OthersSection.astro
    │   │   └── WritingsSection.astro
    │   └── Lightbox.astro
    └── pages/
        └── index.astro              ← Import tất cả sections
```

---

# HƯỚNG DẪN THỰC HIỆN

Bắt đầu từ BƯỚC 0. Sau mỗi bước:
1. Cho tôi biết bước đã xong
2. Hướng dẫn tôi kiểm tra (lệnh gì, nhìn gì trên browser)
3. Chờ tôi xác nhận OK rồi mới sang bước tiếp

Nếu gặp lỗi ở bước nào, DỪNG LẠI và:
1. Đọc lại code cũ tương ứng trong `portfolio-phamhuutri/`
2. So sánh với code mới
3. Fix lỗi
4. Cho tôi kiểm tra lại

**BẮT ĐẦU TỪ BƯỚC 0.**
```