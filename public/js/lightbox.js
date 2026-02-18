// --- BIẾN TOÀN CỤC CHO GALLERY ---
let currentCrewArray = [];
let currentCrewIndex = 0;

// 1. Lắng nghe sự kiện click toàn trang
document.addEventListener('click', function(e) {
    // A. Click vào Gallery Wall (Ảnh BTS thường) -> BÂY GIỜ SẼ CÓ NÚT NEXT/PREV
    if (e.target && e.target.closest('.gallery-wall img')) {
        const clickedImg = e.target;
        const container = clickedImg.closest('.gallery-wall');

        // 1. Gom tất cả ảnh trong nhóm Gallery Wall đó lại thành 1 danh sách
        const allImagesArray = Array.from(container.querySelectorAll('img'));

        // 2. Tạo mảng dữ liệu (BTS không có tên/vai trò nên để trống)
        currentCrewArray = allImagesArray.map(img => ({
            src: img.src, // Lấy src hiện tại
            name: "",     // Không có tên
            role: ""      // Không có vai trò
        }));

        // 3. Xác định vị trí ảnh đang bấm
        currentCrewIndex = allImagesArray.indexOf(clickedImg);

        // 4. Mở Lightbox bằng chế độ Slide (Crew) thay vì chế độ đơn
        openCrewLightbox();
    }

    // B. Click vào Crew Scroll Item
    if (e.target && e.target.closest('.crew-card img')) {
        const clickedImg = e.target;
        const container = clickedImg.closest('.crew-scroller');

        const allImagesNodeList = container.querySelectorAll('.crew-card img');
        const allImagesArray = Array.from(allImagesNodeList);

        currentCrewArray = allImagesArray.map(img => ({
            src: img.dataset.full,
            name: img.dataset.name,
            role: img.dataset.role
        }));

        currentCrewIndex = allImagesArray.indexOf(clickedImg);
        openCrewLightbox();
    }
});

const lightbox = document.getElementById('lightbox-overlay');
const lightboxImg = document.getElementById('lightbox-img');
const lbPrev = document.getElementById('lb-prev');
const lbNext = document.getElementById('lb-next');
const lbCaption = document.getElementById('lb-caption');
const lbName = document.getElementById('lb-name');
const lbRole = document.getElementById('lb-role');

// --- HÀM KHÓA SCROLL BACKGROUND (QUAN TRỌNG) ---
function lockBodyScroll() {
    document.body.style.overflow = 'hidden'; // Ẩn thanh cuộn
    document.body.style.touchAction = 'none'; // Chặn các thao tác chạm mặc định của trình duyệt
}

function unlockBodyScroll() {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
}

// --- CHẾ ĐỘ 1: ẢNH ĐƠN ---
function openSimpleLightbox(src) {
    lightboxImg.src = src;
    lightbox.style.display = "flex";

    lockBodyScroll(); // Khóa cuộn nền

    lbPrev.style.display = 'none';
    lbNext.style.display = 'none';
    lbCaption.style.display = 'none';

    disableSwipe(); // Tắt vuốt ở chế độ đơn
}

// --- CHẾ ĐỘ 2: CREW GALLERY ---
function openCrewLightbox() {
    lightbox.style.display = "flex";

    lockBodyScroll(); // Khóa cuộn nền

    lbPrev.style.display = 'block';
    lbNext.style.display = 'block';
    lbCaption.style.display = 'block';

    updateLbContent();
    enableSwipe(); // Bật vuốt
}

// --- CẬP NHẬT HÀM UPDATE ĐỂ ẨN CHÚ THÍCH KHI KHÔNG CÓ CHỮ (QUAN TRỌNG) ---
function updateLbContent() {
    if (!currentCrewArray || currentCrewArray.length === 0) return;
    const item = currentCrewArray[currentCrewIndex];
    lightboxImg.src = item.src;

    // Cập nhật nội dung
    lbName.innerHTML = item.name;
    lbRole.innerHTML = item.role;

    // --- THÊM LOGIC NÀY: Nếu không có tên thì ẩn khung Caption đi cho đẹp ---
    if (!item.name && !item.role) {
        lbCaption.style.display = 'none';
    } else {
        lbCaption.style.display = 'block';
    }
}

function changeLbSlide(step, e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }

    if (!currentCrewArray || currentCrewArray.length === 0) return;

    // --- SỬA LẠI: Thêm logic cộng trừ Index ---
    currentCrewIndex += step;

    // Xử lý vòng lặp: Nếu quá cuối thì về đầu, nếu quá đầu thì về cuối
    if (currentCrewIndex >= currentCrewArray.length) currentCrewIndex = 0;
    if (currentCrewIndex < 0) currentCrewIndex = currentCrewArray.length - 1;

    // Sau khi tính toán xong Index mới, gọi hàm update để hiển thị
    updateLbContent();
}

function closeLightbox(e) {
    if (!e || e.target === lightbox || e.target.classList.contains('lightbox-close')) {
        lightbox.style.display = "none";
        unlockBodyScroll(); // Mở khóa cuộn nền
        lightboxImg.src = "";
    }
}

document.addEventListener('keydown', function(e) {
    if (lightbox.style.display === "flex" && lbNext.style.display === 'block') {
        if (e.key === "ArrowLeft") changeLbSlide(-1, e);
        if (e.key === "ArrowRight") changeLbSlide(1, e);
    }
    if (e.key === "Escape") closeLightbox(e);
});

/* =========================================================== */
/* --- TÍNH NĂNG VUỐT (SWIPE) + CHẶN CUỘN NỀN --- */
/* =========================================================== */

let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}

function handleTouchMove(e) {
    // Đây là hàm QUAN TRỌNG NHẤT để chặn nền bị trôi

    // 1. Nếu người dùng đang chạm vào phần Chữ (Caption) -> Cho phép cuộn (để đọc chữ dài)
    if (e.target.closest('.lb-caption')) {
        return; // Thoát ra, không chặn
    }

    // 2. Nếu chạm vào Ảnh hoặc Nền đen -> CHẶN TUYỆT ĐỐI
    // preventDefault() sẽ bảo trình duyệt: "Đừng cuộn trang web, để yên đấy!"
    if (e.cancelable) {
        e.preventDefault();
    }
}

function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
}

function handleSwipeGesture() {
    const SWIPE_THRESHOLD = 50;
    if (touchStartX - touchEndX > SWIPE_THRESHOLD) {
        changeLbSlide(1); // Vuốt trái -> Next
    }
    if (touchEndX - touchStartX > SWIPE_THRESHOLD) {
        changeLbSlide(-1); // Vuốt phải -> Prev
    }
}

function enableSwipe() {
    // start và end dùng passive: true cho mượt
    lightbox.addEventListener('touchstart', handleTouchStart, {passive: true});
    lightbox.addEventListener('touchend', handleTouchEnd, {passive: true});

    // move BẮT BUỘC phải dùng passive: false để dùng được preventDefault (chặn cuộn)
    lightbox.addEventListener('touchmove', handleTouchMove, {passive: false});
}

function disableSwipe() {
    lightbox.removeEventListener('touchstart', handleTouchStart);
    lightbox.removeEventListener('touchend', handleTouchEnd);
    lightbox.removeEventListener('touchmove', handleTouchMove);
}
