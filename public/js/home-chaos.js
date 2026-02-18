/* --- LOGIC: EXPLOSION + MUSIC HOME (AUTO STOP OTHERS) --- */
document.addEventListener("DOMContentLoaded", () => {
    const homeSection = document.getElementById('home');
    const centerImage = document.querySelector('.home-center-img');

    const bgMusic = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3?v=2');
    bgMusic.loop = true; bgMusic.volume = 0.5;

    let hasChaosStarted = false;
    let resetTimer = null;

    let isDragging = false;
    let currentDragItem = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    const wordsListEn = ["one", "Buddha", "is", "not", "enough"];
    const wordsListVi = ["một", "ông Bụt", "là", "không", "đủ"];
    const isMobile = window.innerWidth < 768;
    const WORD_COUNT = isMobile ? 50 : 120;
    const MIN_SIZE = 7; const MAX_SIZE = 30;

    function randomRange(min, max) { return Math.random() * (max - min) + min; }

    function startFloating(element) {
        const animations = element.getAnimations();
        animations.forEach(anim => anim.cancel());
        element.animate([
            { transform: `translate(-50%, -50%) rotate(0deg)` },
            { transform: `translate(calc(-50% + ${randomRange(-50,50)}px), calc(-50% + ${randomRange(-50,50)}px)) rotate(${randomRange(-90,90)}deg)` },
            { transform: `translate(-50%, -50%) rotate(0deg)` }
        ], { duration: randomRange(10000, 30000), iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    }

    // --- HÀM STOP CÔNG KHAI CHO CÁC TRANG KHÁC GỌI ---
    window.stopHomeMusic = function() {
        if (hasChaosStarted) resetChaos();
    };

    function createExplosion() {
        // TẮT NHẠC Ở 2 NƠI KHÁC TRƯỚC KHI CHẠY
        if (window.stopContactMusic) window.stopContactMusic();
        if (window.stopWritingMusic) window.stopWritingMusic();

        hasChaosStarted = true;
        if (resetTimer) clearTimeout(resetTimer);
        bgMusic.play().catch(e => console.log("Lỗi:", e));

        homeSection.classList.add('music-on');

        const isVietnamese = document.body.classList.contains('mode-vi');
        const currentList = isVietnamese ? wordsListVi : wordsListEn;
        for (let i = 0; i < WORD_COUNT; i++) {
            const span = document.createElement('span');
            span.innerText = currentList[Math.floor(Math.random() * currentList.length)];
            span.className = 'chaos-word';
            span.style.pointerEvents = 'auto';
            span.style.cursor = 'grab';

            const size = randomRange(MIN_SIZE, MAX_SIZE);
            span.style.fontSize = `${size}px`;
            span.style.opacity = randomRange(0.2, 0.8);
            span.style.left = '50%'; span.style.top = '50%';
            span.style.transform = 'translate(-50%, -50%)';

            const flyDuration = randomRange(4.0, 8.0);
            homeSection.appendChild(span);

            requestAnimationFrame(() => {
                span.style.transition = `left ${flyDuration}s cubic-bezier(0.165, 0.84, 0.44, 1), top ${flyDuration}s cubic-bezier(0.165, 0.84, 0.44, 1), opacity ${flyDuration}s ease`;
                const targetX = randomRange(-10, 110); const targetY = randomRange(-10, 110);
                span.style.left = `${targetX}%`; span.style.top = `${targetY}%`;
                setTimeout(() => { if (hasChaosStarted && currentDragItem !== span) startFloating(span); }, flyDuration * 1000);
            });
        }
    }

    function resetChaos() {
        hasChaosStarted = false;
        homeSection.classList.remove('music-on');

        const words = document.querySelectorAll('.chaos-word');
        words.forEach(word => {
            const anims = word.getAnimations();
            anims.forEach(anim => anim.cancel());
            word.style.transition = "all 1.5s ease-in-out";
            word.style.left = '50%'; word.style.top = '50%'; word.style.opacity = '0';
        });
        resetTimer = setTimeout(() => {
            words.forEach(w => w.remove());
            bgMusic.pause();
        }, 1500);
    }

    function toggleChaos() { if (!hasChaosStarted) createExplosion(); else resetChaos(); }

    // --- DRAG & DROP LOGIC ---
    function getClientCoords(e) {
        if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        return { x: e.clientX, y: e.clientY };
    }

    function onDragStart(e) {
        if (e.target.classList.contains('chaos-word')) {
            isDragging = true;
            currentDragItem = e.target;
            currentDragItem.style.cursor = 'grabbing';
            currentDragItem.style.transition = 'none';

            const anims = currentDragItem.getAnimations();
            anims.forEach(anim => anim.cancel());

            const rect = currentDragItem.getBoundingClientRect();
            const coords = getClientCoords(e);
            dragOffsetX = coords.x - rect.left;
            dragOffsetY = coords.y - rect.top;

            if (e.cancelable && e.type === 'touchstart') e.preventDefault();
        }
    }

    function onDragMove(e) {
        if (isDragging && currentDragItem) {
            if (e.cancelable) e.preventDefault();
            const containerRect = homeSection.getBoundingClientRect();
            const coords = getClientCoords(e);
            const newLeft = coords.x - containerRect.left - dragOffsetX + (currentDragItem.offsetWidth / 2);
            const newTop = coords.y - containerRect.top - dragOffsetY + (currentDragItem.offsetHeight / 2);
            currentDragItem.style.left = `${newLeft}px`;
            currentDragItem.style.top = `${newTop}px`;
        }
    }

    function onDragEnd() {
        if (isDragging && currentDragItem) {
            currentDragItem.style.cursor = 'grab';
            if (hasChaosStarted) startFloating(currentDragItem);
            isDragging = false;
            currentDragItem = null;
        }
    }

    document.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchstart', onDragStart, { passive: false });
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);

    const langSwitchBtn = document.querySelector('.lang-switch');
    if (langSwitchBtn) {
        langSwitchBtn.addEventListener('click', () => {
            if (hasChaosStarted) {
                const isVietnamese = document.body.classList.contains('mode-vi');
                const currentList = isVietnamese ? wordsListVi : wordsListEn;
                document.querySelectorAll('.chaos-word').forEach(w => w.innerText = currentList[Math.floor(Math.random() * currentList.length)]);
            }
        });
    }

    if (centerImage) {
        centerImage.style.cursor = 'pointer';
        centerImage.addEventListener('click', (e) => { e.stopPropagation(); toggleChaos(); });
        centerImage.addEventListener('touchstart', (e) => { e.stopPropagation(); e.preventDefault(); toggleChaos(); });
    }
});
