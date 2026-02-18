/* --- HỆ THỐNG VẬT LÝ: FIX LỖI TỤM GÓC --- */

let animationFrameId;
const physicsItems = [];

function renderWritingList() {
    const container = document.getElementById('writings-list-container');
    if (!container || typeof writingData === 'undefined') return;

    // 1. Reset
    container.innerHTML = '';
    physicsItems.length = 0;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    // --- FIX QUAN TRỌNG: TÍNH TOÁN KÍCH THƯỚC AN TOÀN ---

    // Kiểm tra xem có đang ở trên mobile không (màn hình nhỏ hơn 768px)
    const isMobile = window.innerWidth < 768;

    // Nếu là mobile: Trừ đi rất ít (padding 20px) vì sidebar đã nằm ở trên đầu rồi
    // Nếu là desktop: Trừ đi 300px (sidebar) để chữ không bay đè lên sidebar
    const sidebarOffset = isMobile ? 20 : 300;

    // Tính chiều rộng an toàn
    const safeWidth = container.offsetWidth > 0 ? container.offsetWidth : (window.innerWidth - sidebarOffset);

    // Chiều cao an toàn
    const safeHeight = container.offsetHeight > 0 ? container.offsetHeight : window.innerHeight;

    // --- KHỞI TẠO VỊ TRÍ ---
    // Trừ thêm 50px - 100px để chữ không bị sát lề phải quá
    const startX = Math.random() * (safeWidth - 80);
    const startY = Math.random() * (safeHeight - 50);

    // 2. Tạo phần tử
    writingData.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = 'writings-scatter-item';

        // [MỚI] Gắn thẻ tên để Google Sheet tìm thấy và ẩn đi
        el.id = 'scatter-' + item.id;

        el.innerHTML = `
            <span class="content-vi">${item.title.vi}</span>
            <span class="content-en">${item.title.en}</span>
        `;

        el.onclick = () => openWritingDetail(item.id);

        // Style
        const fontSize = Math.floor(Math.random() * 2) + 12; // 12px - 13px
        el.style.fontSize = fontSize + 'px';
        el.style.position = 'absolute';
        el.style.whiteSpace = 'nowrap';
        el.style.userSelect = 'none';
        el.style.cursor = 'pointer';
        el.style.opacity = Math.max(0.6, 1 - (index * 0.03));

        container.appendChild(el);

        // --- KHỞI TẠO VỊ TRÍ (DÙNG KÍCH THƯỚC AN TOÀN) ---
        const startX = Math.random() * (safeWidth - 100);
        const startY = Math.random() * (safeHeight - 50);

        // Random vận tốc
        const vx = (Math.random() - 0.5) * 0.4;
        const vy = (Math.random() - 0.5) * 0.4;

        physicsItems.push({
            el: el,
            x: startX,
            y: startY,
            vx: vx,
            vy: vy,
            width: 0,
            height: 0
        });
    });

    // Đo kích thước thật ngay sau khi append
    physicsItems.forEach(item => {
        item.width = item.el.offsetWidth;
        item.height = item.el.offsetHeight;
    });

    runPhysicsLoop(container);
}

function runPhysicsLoop(container) {
    function update() {
        // Cập nhật lại kích thước khung chứa liên tục (đề phòng resize)
        // Nếu đang ẩn thì vẫn giữ logic cũ, nếu hiện thì lấy kích thước thật
        const containerW = container.offsetWidth > 0 ? container.offsetWidth : window.innerWidth;
        const containerH = container.offsetHeight > 0 ? container.offsetHeight : window.innerHeight;

        physicsItems.forEach((itemA, i) => {
            // A. Di chuyển
            itemA.x += itemA.vx;
            itemA.y += itemA.vy;

            // B. Va chạm tường (Wall Bounce)
            if (itemA.x <= 0) {
                itemA.x = 0;
                itemA.vx *= -1;
            } else if (itemA.x + itemA.width >= containerW) {
                itemA.x = containerW - itemA.width;
                itemA.vx *= -1;
            }

            if (itemA.y <= 0) {
                itemA.y = 0;
                itemA.vy *= -1;
            } else if (itemA.y + itemA.height >= containerH) {
                itemA.y = containerH - itemA.height;
                itemA.vy *= -1;
            }

            // C. Va chạm với nhau (Object Collision)
            for (let j = i + 1; j < physicsItems.length; j++) {
                const itemB = physicsItems[j];

                if (isOverlapping(itemA, itemB)) {
                    // Tính toán vector đẩy
                    let dx = (itemA.x + itemA.width/2) - (itemB.x + itemB.width/2);
                    let dy = (itemA.y + itemA.height/2) - (itemB.y + itemB.height/2);

                    if (dx === 0) dx = Math.random() - 0.5;
                    if (dy === 0) dy = Math.random() - 0.5;

                    const distance = Math.sqrt(dx*dx + dy*dy);
                    const unitX = dx / distance;
                    const unitY = dy / distance;

                    const pushForce = 0.2;

                    // Đẩy vận tốc
                    itemA.vx += unitX * pushForce;
                    itemA.vy += unitY * pushForce;
                    itemB.vx -= unitX * pushForce;
                    itemB.vy -= unitY * pushForce;

                    // Tách vị trí ngay lập tức (quan trọng để không bị dính)
                    const separateSpeed = 1; // Tăng lên một chút để tách nhanh hơn
                    itemA.x += unitX * separateSpeed;
                    itemA.y += unitY * separateSpeed;
                    itemB.x -= unitX * separateSpeed;
                    itemB.y -= unitY * separateSpeed;
                }
            }

            // D. Giới hạn tốc độ (Friction)
            const maxSpeed = 0.8; // Tăng nhẹ max speed để chúng nó linh hoạt hơn
            if (itemA.vx > maxSpeed) itemA.vx = maxSpeed;
            if (itemA.vx < -maxSpeed) itemA.vx = -maxSpeed;
            if (itemA.vy > maxSpeed) itemA.vy = maxSpeed;
            if (itemA.vy < -maxSpeed) itemA.vy = -maxSpeed;

            // E. Render
            itemA.el.style.left = itemA.x + 'px';
            itemA.el.style.top = itemA.y + 'px';
        });

        animationFrameId = requestAnimationFrame(update);
    }
    update();
}

// Hàm kiểm tra va chạm (+ padding 15px cho thoáng)
function isOverlapping(a, b) {
    const padding = 15;
    return (
        a.x < b.x + b.width + padding &&
        a.x + a.width + padding > b.x &&
        a.y < b.y + b.height + padding &&
        a.y + a.height + padding > b.y
    );
}

/* --- CÁC HÀM PHỤ TRỢ --- */
function renderWritingSidebar() {
    const sidebarList = document.getElementById('sidebar-writings-list');
    if (!sidebarList || typeof writingData === 'undefined') return;
    sidebarList.innerHTML = '';
    writingData.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="javascript:void(0)" onclick="showPage('${item.id}')" id="link-${item.id}">
                <span class="content-vi">${item.title.vi}</span>
                <span class="content-en">${item.title.en}</span>
            </a>
        `;
        sidebarList.appendChild(li);
    });
}

// --- HÀM MỞ BÀI VIẾT (CẬP NHẬT URL) ---
function openWritingDetail(id) {
    const post = writingData.find(item => item.id === id);
    if (!post) return;

    // 1. Điền dữ liệu
    const titleEl = document.getElementById('detail-title');
    const metaEl = document.getElementById('detail-meta');
    const contentEl = document.getElementById('detail-content');
    const viewEl = document.getElementById('writings-detail-view');

    if (titleEl) titleEl.innerHTML = `<span class="content-vi">${post.title.vi}</span><span class="content-en">${post.title.en}</span>`;
    if (metaEl) metaEl.innerText = `${post.location}, ${post.date}`;
    if (contentEl) contentEl.innerHTML = `<div class="content-vi">${post.content.vi}</div><div class="content-en">${post.content.en}</div>`;

    // 2. Hiện khung bài viết
    if (viewEl) {
        viewEl.style.display = 'block';
        setTimeout(() => {
            viewEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    // 3. [TỰ ĐỘNG HOÁ 100%] Tự tạo URL từ ID bài viết
    // Logic: Nếu ID là "writings-abc-xyz" -> Link sẽ là "/writings/abc-xyz"

    let newUrl = "";

    // Kiểm tra nếu có trong danh sách thủ công (urlMapping) thì ưu tiên dùng
    if (typeof urlMapping !== 'undefined' && urlMapping[id]) {
        newUrl = urlMapping[id];
    }
    // Nếu không có, tự động tạo ra từ ID
    else if (id.startsWith('writings-')) {
        const slug = id.replace('writings-', ''); // Cắt bỏ chữ "writings-" (6 ký tự đầu)
        newUrl = '/writings/' + slug;
    }

    // Tiến hành cập nhật URL nếu có thay đổi
    if (newUrl) {
        const currentPath = window.location.pathname;
        if (currentPath !== newUrl) {
            window.history.pushState({ pageId: id, groupId: 'group-writings' }, "", newUrl);
        }
    }
}

// --- HÀM ĐÓNG BÀI VIẾT (TRẢ VỀ URL GỐC) ---
function closeWritingDetail() {
    const viewEl = document.getElementById('writings-detail-view');
    if (viewEl) {
        viewEl.style.display = 'none';
        const topArea = document.querySelector('.writings-top-area');
        if (topArea) topArea.scrollIntoView({ behavior: 'smooth' });
    }

    // Trả URL về /writings
    window.history.pushState({ pageId: 'cat-writings', groupId: 'group-writings' }, "", '/writings');
}

// Bắt sự kiện Resize để không bị lỗi văng ra ngoài
window.addEventListener('resize', () => {
    const container = document.getElementById('writings-list-container');
    // Reset lại nếu cần thiết, hoặc để physics tự xử lý
});

document.addEventListener("DOMContentLoaded", () => {
    renderWritingList();
    renderWritingSidebar();
});
