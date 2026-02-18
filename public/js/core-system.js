/* --- HỆ THỐNG TỰ ĐỘNG HOÁ (OPTIMIZED: LAZY RENDERING) --- */

// 1. CẤU HÌNH ĐƯỜNG DẪN TĨNH
const urlMapping = {
    'home': '/',
    'about': '/about',
    'contact': '/contact',
    'cat-short-films': '/short-films',
    'cat-commercials': '/commercials',
    'cat-others': '/others',
    'cat-writings': '/writings'
};

// 2. HÀM TÌM DỮ LIỆU DỰ ÁN (Helper mới)
// Giúp tìm thông tin dự án từ ID mà không cần loop nhiều lần
function getProjectData(id) {
    if (typeof filmsData !== 'undefined' && filmsData[id]) return filmsData[id];
    if (typeof commercialData !== 'undefined' && commercialData[id]) return commercialData[id];
    if (typeof othersData !== 'undefined' && othersData[id]) return othersData[id];
    return null;
}

// 3. HÀM RENDER NỘI DUNG CHI TIẾT (ĐÃ NÂNG CẤP: CREW + BTS)
function renderSectionContent(id) {
    if (document.getElementById(id)) return;

    const item = getProjectData(id);
    if (!item) return;

    const contentContainer = document.querySelector('.content');
    const section = document.createElement('div');
    section.id = id;
    section.className = 'page-section';

    // 1. Tạo nội dung chính (Text & Video)
    let bodyHtml = '';

    const isShortFilm = item.genre_vi !== undefined || item.genre_en !== undefined;
    const isCommercial = item.brand_vi !== undefined || item.brand_en !== undefined;

    if (isShortFilm || isCommercial) {
        // ── CẤU TRÚC MỚI: Short Films (flat genre/year/duration/awards) ──
        if (isShortFilm) {
            let infoVi = '<p>';
            if (item.genre_vi) infoVi += `<b>Thể loại:</b> ${item.genre_vi}<br>`;
            if (item.year)     infoVi += `<b>Năm:</b> ${item.year}<br>`;
            if (item.duration) infoVi += `<b>Thời lượng:</b> ${item.duration}<br>`;
            if (item.awards_vi) {
                const lines = item.awards_vi.split('\n').filter(l => l.trim());
                infoVi += `<b>Giải thưởng:</b> ${lines.join('<br>')}`;
            }
            infoVi += '</p>';

            let infoEn = '<p>';
            if (item.genre_en) infoEn += `<b>Genre:</b> ${item.genre_en}<br>`;
            if (item.year)     infoEn += `<b>Year:</b> ${item.year}<br>`;
            if (item.duration) infoEn += `<b>Duration:</b> ${item.duration}<br>`;
            if (item.awards_en) {
                const lines = item.awards_en.split('\n').filter(l => l.trim());
                infoEn += `<b>Awards:</b> ${lines.join('<br>')}`;
            }
            infoEn += '</p>';

            bodyHtml += `<div class="content-vi">${infoVi}</div>
            <div class="content-en">${infoEn}</div>`;
        }

        // ── CẤU TRÚC MỚI: Commercials (flat brand/year/country/role) ──
        if (isCommercial) {
            let infoVi = '<p>';
            if (item.brand_vi)  infoVi += `<b>Thương hiệu:</b> ${item.brand_vi}<br>`;
            if (item.year)      infoVi += `<b>Năm:</b> ${item.year}<br>`;
            if (item.country)   infoVi += `<b>Quốc gia:</b> ${item.country}<br>`;
            if (item.role_vi)   infoVi += `<b>Vai trò:</b> ${item.role_vi}`;
            infoVi += '</p>';

            let infoEn = '<p>';
            if (item.brand_en)  infoEn += `<b>Brand:</b> ${item.brand_en}<br>`;
            if (item.year)      infoEn += `<b>Year:</b> ${item.year}<br>`;
            if (item.country)   infoEn += `<b>Country:</b> ${item.country}<br>`;
            if (item.role_en)   infoEn += `<b>Role:</b> ${item.role_en}`;
            infoEn += '</p>';

            bodyHtml += `<div class="content-vi">${infoVi}</div>
            <div class="content-en">${infoEn}</div>`;
        }

        // Trailer / Video embed
        const videoUrl = item.trailer_url || item.video_url || '';
        if (videoUrl) {
            bodyHtml += `<div style="text-align: left; margin: 30px 0;">
                <iframe width="100%" height="315" style="max-width: 560px; border-radius: 4px;"
                    src="${videoUrl}" frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen></iframe>
            </div>`;
        }

        // Logline (Short Films) — flat fields: logline_vi, logline_en
        if (item.logline_vi || item.logline_en) {
            bodyHtml += `<h3>Logline</h3>
            <div class="content-vi">${item.logline_vi || ''}</div>
            <div class="content-en">${item.logline_en || ''}</div>`;
        }

        // Director's Statement (Short Films) — flat fields: statement_vi, statement_en
        if (item.statement_vi || item.statement_en) {
            bodyHtml += `<h3>Director\u2019s Statement</h3>
            <div class="content-vi">${item.statement_vi || ''}</div>
            <div class="content-en">${item.statement_en || ''}</div>`;
        }

        // Role Description (Commercials) — flat fields: description_vi, description_en
        if (item.description_vi || item.description_en) {
            bodyHtml += `<h3><span class="content-vi">M\u00f4 t\u1ea3 vai tr\u00f2</span><span class="content-en">Role Description</span></h3>
            <div class="content-vi">${item.description_vi || ''}</div>
            <div class="content-en">${item.description_en || ''}</div>`;
        }

        // Soundtrack (Short Films)
        if (item.soundtrack_url) {
            bodyHtml += `<h3><span class="content-vi">Nh\u1ea1c phim</span><span class="content-en">Soundtrack</span></h3>
            <div style="max-width: 560px; margin-top: 15px;">
                <iframe width="100%" height="450" scrolling="no" frameborder="no" allow="autoplay"
                    src="${item.soundtrack_url}"></iframe>
            </div>`;
        }

        // Crew text list (Short Films) — flat fields: crew_vi, crew_en
        if (item.crew_vi || item.crew_en) {
            bodyHtml += `<h3>Crew</h3>
            <div class="content-vi">${item.crew_vi || ''}</div>
            <div class="content-en">${item.crew_en || ''}</div>`;
        }

    } else {
        // ── CẤU TRÚC CŨ: Others (vi/en blob) and Writings (content_vi/content_en) ──
        const viContent = item.vi || item.content_vi || '';
        const enContent = item.en || item.content_en || '';
        bodyHtml += `<div class="content-vi">${viContent}</div>
        <div class="content-en">${enContent}</div>`;
    }

    let htmlContent = `
        <h2 class="page-title">
            <span class="content-en">${item.title.en}</span>
            <span class="content-vi">${item.title.vi}</span>
        </h2>
        <div class="about-text">
            ${bodyHtml}
        </div>
    `;

    // 2. Tự động sinh Crew Slider (nếu có)
    if (item.crewData && item.crewData.length > 0) {
        // htmlContent += `<h3 style="margin-top: 40px;"><span class="content-vi">Ê-kíp</span><span class="content-en">Crew</span></h3>`;

        let crewHtml = `<div class="crew-scroller-container"><div class="crew-scroller">`;
        item.crewData.forEach(member => {
            crewHtml += `
                <div class="crew-card">
                    <img
                        src="${member.img}"
                        data-full="${member.img}"
                        data-name="${member.name}"
                        data-role-vi="${member.role.vi}"
                        data-role-en="${member.role.en}">
                    <div class="crew-info">
                        <div class="crew-role">
                            <span class="content-vi">${member.role.vi}</span>
                            <span class="content-en">${member.role.en}</span>
                        </div>
                        <div class="crew-name">${member.name}</div>
                    </div>
                </div>
            `;
        });
        crewHtml += `</div></div>`;
        htmlContent += crewHtml;
    }

    // 4. Tự động sinh BTS Gallery Wall (nếu có)
    if (item.btsData && item.btsData.length > 0) {
        htmlContent += `
            <h3 style="margin-top: 50px;">
                <span class="content-vi">Hậu trường</span>
                <span class="content-en">Behind The Scene</span>
            </h3>
            <div class="gallery-wall">
        `;

        item.btsData.forEach(pic => {
            // Kiểm tra xem ảnh có class riêng (wide, tall, big) không
            const cssClass = pic.class ? ` class="${pic.class}"` : '';
            htmlContent += `<img src="${pic.src}"${cssClass} loading="lazy">`;
        });

        htmlContent += `</div>`;
    }

    section.innerHTML = htmlContent;
    contentContainer.appendChild(section);
}

// 4. HÀM XỬ LÝ URL
function getIdFromUrl(path) {
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    for (const [id, url] of Object.entries(urlMapping)) {
        if (url === path) return id;
    }

    const dynamicRoutes = [
        { prefix: '/short-films/',  idPrefix: 'short-films-' },
        { prefix: '/commercials/', idPrefix: 'commercials-' },
        { prefix: '/others/',      idPrefix: 'others-' },
        { prefix: '/writings/',    idPrefix: 'writings-' }
    ];

    for (const route of dynamicRoutes) {
        if (path.startsWith(route.prefix)) {
            const slug = path.replace(route.prefix, '');
            return route.idPrefix + slug;
        }
    }
    return 'not-found';
}

// 5. HÀM SHOW PAGE (ĐÃ TỐI ƯU)
// 5. HÀM SHOW PAGE (ĐÃ SỬA LỖI)
// Thêm tham số doScroll = true vào dòng này để sửa lỗi ReferenceError
function showPage(pageId, groupId = null, addToHistory = true, doScroll = true) {
    if (!pageId) pageId = 'home';

    // A. Tự động xác định Group
    if (!groupId) {
        if (pageId.startsWith('short-films-') || pageId === 'cat-short-films') groupId = 'group-short-films';
        else if (pageId.startsWith('commercials-') || pageId === 'cat-commercials') groupId = 'group-commercials';
        else if (pageId.startsWith('others-') || pageId === 'cat-others') groupId = 'group-others';
        else if (pageId.startsWith('writings-') || pageId === 'cat-writings') groupId = 'group-writings';
    }

    // B. Xử lý Writing (ĐÃ SỬA: Thêm phần Active Sidebar)
    if (pageId.startsWith('writings-')) {
        // 1. Mở trang chủ Writings để hiện layout, nhưng không cần cuộn
        showPage('cat-writings', 'group-writings', false, false);

        // 2. Mở nội dung chi tiết bài viết
        setTimeout(() => openWritingDetail(pageId), 50);

        // 3. [FIX] Tự tay kích hoạt màu xanh cho Link bên Sidebar
        // Xóa active cũ của các link khác
        const allLinks = document.querySelectorAll('a');
        allLinks.forEach(l => l.classList.remove('active-link'));

        // Tìm link của bài viết hiện tại và tô xanh
        const specificLink = document.getElementById('link-' + pageId);
        if (specificLink) {
            specificLink.classList.add('active-link');

            // Đảm bảo menu con vẫn mở ra (nếu chưa mở)
            const group = document.getElementById('group-writings');
            if (group) group.classList.add('is-open');
        }

        // 4. Cập nhật lịch sử duyệt web
        if (addToHistory) {
            const slug = pageId.replace('writings-', '');
            updateHistory(pageId, 'group-writings', '/writings/' + slug);
        }
        return;
    }

    // C. RENDER DỮ LIỆU NẾU CHƯA CÓ
    renderSectionContent(pageId);

    // D. XỬ LÝ GIAO DIỆN CHUNG
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(s => s.classList.remove('active-section'));

    const activeSection = document.getElementById(pageId);

    // --- ĐOẠN CODE XỬ LÝ CUỘN TRANG ---
    if (activeSection) {
        activeSection.classList.add('active-section');

        // Kiểm tra Mobile (<= 768px)
        if (window.innerWidth <= 768) {
            // Chỉ cuộn nếu doScroll là true (tức là người dùng bấm link)
            if (doScroll) {
                setTimeout(() => {
                    activeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        } else {
            // Desktop: Luôn cuộn lên đầu
            window.scrollTo(0, 0);
        }
    } else {
        if (pageId !== 'not-found') console.warn("Không tìm thấy section:", pageId);
    }
    // -----------------------------------

    // Active Menu & Sidebar
    const allLinks = document.querySelectorAll('a');
    allLinks.forEach(l => l.classList.remove('active-link'));
    const activeLink = document.getElementById('link-' + pageId);
    if (activeLink) activeLink.classList.add('active-link');

    const allGroups = document.querySelectorAll('.category-group');
    allGroups.forEach(g => g.classList.remove('is-open'));
    if (groupId) {
        const g = document.getElementById(groupId);
        if (g) g.classList.add('is-open');
    }

    // E. Cập nhật History
    if (addToHistory) {
        let url = urlMapping[pageId];
        if (!url) {
            if (pageId.startsWith('short-films-')) url = '/short-films/' + pageId.replace('short-films-', '');
            else if (pageId.startsWith('commercials-')) url = '/commercials/' + pageId.replace('commercials-', '');
            else if (pageId.startsWith('others-')) url = '/others/' + pageId.replace('others-', '');
        }
        if (url) updateHistory(pageId, groupId, url);
    }

    // F. Fix Writing List Animation
    if (pageId === 'cat-writings' && typeof renderWritingList === 'function') {
        setTimeout(renderWritingList, 10);
    }
}

function updateHistory(pageId, groupId, url) {
    if (window.location.pathname !== url) {
        window.history.pushState({ pageId, groupId }, "", url);
    }
}

// 6. NHÀ MÁY SẢN XUẤT (CHỈ TẠO SIDEBAR & GRID - KHÔNG TẠO CHI TIẾT)
function renderProjectSystem(dataObj, sidebarId, gridId, groupId) {
    const sidebar = document.getElementById(sidebarId);
    const grid = document.getElementById(gridId);

    if (!dataObj) return;

    for (const [id, item] of Object.entries(dataObj)) {
        // A. Sidebar Link
        if (sidebar) {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="javascript:void(0)" onclick="showPage('${id}', '${groupId}')" id="link-${id}">
                    <span class="content-en">${item.title.en}</span>
                    <span class="content-vi">${item.title.vi}</span>
                </a>
            `;
            sidebar.appendChild(li);
        }

        // B. Grid Thumbnail
        if (grid) {
            const a = document.createElement('a');
            a.href = "javascript:void(0)";
            a.onclick = () => showPage(id, groupId);
            a.className = "gallery-item";

            // [MỚI] Gắn thẻ tên để Google Sheet tìm thấy và ẩn đi
            a.id = 'thumb-' + id;

            // THÊM loading="lazy" vào thẻ img
            // Đây là cách tối ưu ảnh tốt nhất mà không cần giảm chất lượng
            a.innerHTML = `
                <img src="${item.thumbnail || ''}" alt="${item.title.en}" loading="lazy">
                <p style="margin-top: 5px; font-weight: bold;">
                    <span class="content-en">${item.title.en}</span>
                    <span class="content-vi">${item.title.vi}</span>
                </p>
            `;
            grid.appendChild(a);
        }

        // LƯU Ý: Đã xóa phần tạo "Page Section" ở đây để tránh tải video ngầm
    }
}

// 7. KHỞI CHẠY
document.addEventListener("DOMContentLoaded", () => {
    if (typeof filmsData !== 'undefined') renderProjectSystem(filmsData, 'sidebar-short-films-list', 'grid-short-films', 'group-short-films');
    if (typeof commercialData !== 'undefined') renderProjectSystem(commercialData, 'sidebar-commercials-list', 'grid-commercials', 'group-commercials');
    if (typeof othersData !== 'undefined') renderProjectSystem(othersData, 'sidebar-others-list', 'grid-others', 'group-others');

    if (typeof renderWritingList === 'function') {
        renderWritingList();
        renderWritingSidebar();
    }

    const path = window.location.pathname;
    const initialId = getIdFromUrl(path);

    showPage(initialId, null, false, false);
});

window.onpopstate = function(event) {
    if (event.state) showPage(event.state.pageId, event.state.groupId, false);
    else showPage('home', null, false);
};
