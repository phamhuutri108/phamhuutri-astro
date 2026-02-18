/* ============================================================= */
/* --- HỆ THỐNG XỬ LÝ CREW: FIX LỖI NHẢY & QUÁ NHẠY MOBILE --- */
/* ============================================================= */

function initCrewSystem() {
    const sliders = document.querySelectorAll('.crew-scroller');

    sliders.forEach(slider => {
        if (slider.dataset.init === "true") return;
        slider.dataset.init = "true";

        const cards = Array.from(slider.querySelectorAll('.crew-card'));

        // Biến kiểm tra kéo/click
        let isDragging = false;
        let startDragX = 0;

        // --- 1. HÀM TÌM THẺ GIỮA (VISUAL ONLY) ---
        const updateActiveState = () => {
            const centerPoint = slider.scrollLeft + (slider.offsetWidth / 2);
            let closest = null;
            let minDistance = Infinity;

            // Dùng vòng lặp tối ưu để tìm thẻ gần tâm nhất
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i];
                const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
                const distance = Math.abs(centerPoint - cardCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    closest = card;
                }
            }

            // Cập nhật class active (chỉ thay đổi khi cần thiết để đỡ giật)
            cards.forEach(card => {
                if (card === closest) {
                    if (!card.classList.contains('active')) card.classList.add('active');
                } else {
                    if (card.classList.contains('active')) card.classList.remove('active');
                }
            });
        };

        // --- 2. LẮNG NGHE SỰ KIỆN CUỘN (TỐI ƯU HÓA) ---
        // Thay vì setTimeout, ta dùng requestAnimationFrame để mượt theo màn hình
        let ticking = false;

        slider.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateActiveState();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // --- 3. LOGIC CLICK THÔNG MINH ---
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (isDragging) {
                    e.preventDefault(); e.stopPropagation(); return;
                }

                if (!card.classList.contains('active')) {
                    e.preventDefault(); e.stopPropagation();
                    // Cuộn mượt khi click (JS scroll vẫn cần smooth)
                    card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }
                else {
                    const img = card.querySelector('img');
                    openCrewLightboxFromElement(img, slider);
                }
            });
        });

        // --- 4. HỖ TRỢ KÉO THẢ (DRAG) TRÊN DESKTOP ---
        // (Đã chặn xung đột với Touch của mobile)
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            isDragging = false;
            startDragX = e.pageX;
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;

            // Khi bắt đầu kéo bằng chuột, tắt snap để không bị khựng
            slider.style.scrollSnapType = 'none';
            slider.style.scrollBehavior = 'auto';
        });

        const stopDragging = () => {
            if (!isDown) return;
            isDown = false;
            slider.classList.remove('active');

            // Bật lại snap khi thả chuột ra
            slider.style.scrollSnapType = 'x mandatory';
            // Delay reset cờ drag để tránh click nhầm
            setTimeout(() => { isDragging = false; }, 50);
        };

        slider.addEventListener('mouseleave', stopDragging);
        slider.addEventListener('mouseup', stopDragging);

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();

            if (Math.abs(e.pageX - startDragX) > 5) isDragging = true;

            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            slider.scrollLeft = scrollLeft - walk;
        });

        // Chạy lần đầu
        updateActiveState();
    });
}

// --- HELPER MỞ LIGHTBOX (Thêm hàm này để nối với logic cũ) ---
function openCrewLightboxFromElement(clickedImg, container) {
    // Lấy danh sách ảnh trong slider hiện tại
    const allImages = Array.from(container.querySelectorAll('.crew-card img'));

    currentCrewArray = allImages.map(img => ({
        src: img.dataset.full,
        name: img.dataset.name,
        // Xử lý role song ngữ
        role: document.body.classList.contains('mode-vi')
              ? img.dataset.roleVi
              : img.dataset.roleEn
    }));

    currentCrewIndex = allImages.indexOf(clickedImg);

    // Gọi hàm mở lightbox có sẵn của bạn
    openCrewLightbox();
}

// Tự động chạy khi có thay đổi DOM (MutationObserver)
const observer = new MutationObserver((mutations) => {
    if (document.querySelector('.crew-scroller:not([data-init="true"])')) {
        initCrewSystem();
    }
});
observer.observe(document.body, { childList: true, subtree: true });

document.addEventListener("DOMContentLoaded", initCrewSystem);
window.addEventListener('resize', () => {
    const sliders = document.querySelectorAll('.crew-scroller');
    sliders.forEach(slider => slider.dispatchEvent(new Event('scroll')));
});
