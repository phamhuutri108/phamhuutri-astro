document.addEventListener("DOMContentLoaded", () => {
    const resumeLink = document.getElementById('wandering-resume');
    const aboutSection = document.getElementById('about');
    const resumeHolder = document.getElementById('resume-holder');

    let hasStarted = false; // Kiểm tra xem đã kích hoạt bay chưa
    let isHovering = false;
    let moveTimer = null;

    // Biến đếm số lần người dùng phải rượt đuổi
    let catchAttempt = 0;
    const MAX_EVASION = 3; // Số lần nó bỏ chạy trước khi chịu đứng lại

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Hàm tính toán vùng an toàn (Hành lang bên phải)
    function getNewCoordinates() {
        const containerW = aboutSection.offsetWidth;
        const containerH = aboutSection.offsetHeight;
        const itemW = resumeLink.offsetWidth;
        const itemH = resumeLink.offsetHeight;

        // Vùng an toàn: Nửa bên phải màn hình
        const safeZoneX = containerW * 0.40;
        const minLeft = safeZoneX;
        const maxLeft = containerW - itemW - 20;

        const minTop = 80; // Tránh tiêu đề
        const maxTop = containerH - itemH - 20;

        // Fallback nếu màn hình quá nhỏ
        if (maxLeft < minLeft) return { left: containerW - itemW - 10, top: random(minTop, maxTop) };

        return {
            left: random(minLeft, maxLeft),
            top: random(minTop, maxTop)
        };
    }

    // HÀM 1: Di chuyển lơ lửng (Chậm)
    function moveResume() {
        if (!hasStarted) return; // Chưa bắt đầu thì không chạy

        // Nếu đang hover (đã bắt được) hoặc không ở tab About thì dừng
        if (isHovering || !aboutSection.classList.contains('active-section')) {
            moveTimer = setTimeout(moveResume, 1000);
            return;
        }

        // Xóa class bỏ chạy (nếu có) để trở về bay lơ lửng
        resumeLink.classList.remove('evading');

        const coords = getNewCoordinates();
        resumeLink.style.left = `${coords.left}px`;
        resumeLink.style.top = `${coords.top}px`;

        moveTimer = setTimeout(moveResume, 1300); // Tốc độ lơ lửng
    }

    // HÀM 2: Bỏ chạy (Nhanh)
    function evadeMouse() {
        // Thêm class evading để transition nhanh hơn (0.2s)
        resumeLink.classList.add('evading');

        const coords = getNewCoordinates();
        resumeLink.style.left = `${coords.left}px`;
        resumeLink.style.top = `${coords.top}px`;

        // Reset trạng thái hover để nó tiếp tục bay sau khi né
        isHovering = false;

        // Sau khi né xong (0.3s) thì quay lại chế độ bay lơ lửng
        setTimeout(() => {
            if (!isHovering) moveResume();
        }, 300);
    }

    // --- SỰ KIỆN TƯƠNG TÁC ---

    resumeLink.addEventListener('mouseenter', () => {
        // TRƯỜNG HỢP 1: Lần đầu tiên chạm vào -> KÍCH HOẠT GAME
        if (!hasStarted) {
            hasStarted = true;

            // Tính toán vị trí hiện tại so với khung cha để gán absolute không bị giật
            const rect = resumeLink.getBoundingClientRect();
            const parentRect = aboutSection.getBoundingClientRect();

            const startLeft = rect.left - parentRect.left;
            const startTop = rect.top - parentRect.top;

            // Chuyển sang Absolute
            resumeLink.style.left = `${startLeft}px`;
            resumeLink.style.top = `${startTop}px`;
            resumeLink.classList.add('flying');

            // Ngay lập tức bỏ chạy lần đầu tiên!
            catchAttempt++;
            evadeMouse();
            return;
        }

        // TRƯỜNG HỢP 2: Đã bay rồi -> XỬ LÝ RƯỢT ĐUỔI
        if (catchAttempt < MAX_EVASION) {
            catchAttempt++;
            // Bỏ chạy tiếp
            evadeMouse();
        } else {
            // TRƯỜNG HỢP 3: Đã đuổi đủ số lần -> ĐẦU HÀNG (Đứng yên)
            isHovering = true;
            clearTimeout(moveTimer);

            const computedStyle = window.getComputedStyle(resumeLink);
            resumeLink.style.transition = 'none'; // Freeze
            resumeLink.style.left = computedStyle.left;
            resumeLink.style.top = computedStyle.top;
        }
    });

    resumeLink.addEventListener('mouseleave', () => {
        // Nếu đã bắt được rồi mà thả ra thì reset lại game (hoặc cho bay tiếp tùy ý)
        // Ở đây mình cho nó bay tiếp lơ lửng
        if (hasStarted && isHovering) {
            isHovering = false;

            // Trả lại transition mượt
            resumeLink.style.transition = 'top 1.3s ease-in-out, left 1.3s ease-in-out, color 0.2s';
            moveResume();

            // MẸO: Reset lại số lần bắt để lần sau vào lại phải đuổi tiếp?
            // Nếu muốn khó thì uncomment dòng dưới:
            // catchAttempt = 0;
        }
    });
});
