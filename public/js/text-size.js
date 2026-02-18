// --- LOGIC CHỈNH CỠ CHỮ (FINAL) ---

// 1. Hàm Toggle Menu Mobile (Gắn vào nút AA)
function toggleMobileMenu() {
    const tools = document.getElementById('mobile-text-tools');
    tools.classList.toggle('is-open');
}

// 2. Hàm Tăng/Giảm (Gắn vào nút + / - và nút Desktop)
let currentFontSize = 16;

function adjustWritingSize(amount) {
    const contentEl = document.getElementById('detail-content');
    if (!contentEl) return;

    currentFontSize += amount;

    // Giới hạn
    if (currentFontSize < 12) currentFontSize = 12;
    if (currentFontSize > 26) currentFontSize = 26;

    contentEl.style.fontSize = currentFontSize + "px";
    contentEl.style.lineHeight = (1.6 + (amount * 0.05)) + "";

    // QUAN TRỌNG: KHÔNG ĐÓNG MENU Ở ĐÂY
    // Để người dùng có thể bấm liên tiếp nhiều lần
}

// 3. Logic tự đóng khi cuộn trang (Chỉ cho Mobile)
document.addEventListener("DOMContentLoaded", () => {
    const writingContainer = document.getElementById('writings-detail-view'); // Vùng cuộn
    let scrollTimeout;

    if (writingContainer) {
        // Lắng nghe sự kiện cuộn trên toàn bộ cửa sổ (Window) vì trên mobile body cuộn
        window.addEventListener('scroll', function() {
            const tools = document.getElementById('mobile-text-tools');

            // Chỉ chạy logic nếu menu đang mở
            if (tools && tools.classList.contains('is-open')) {
                clearTimeout(scrollTimeout);

                // Nếu người dùng cuộn, chờ 100ms rồi đóng lại
                scrollTimeout = setTimeout(() => {
                     tools.classList.remove('is-open');
                }, 100);
            }
        }, { passive: true });
    }
});
