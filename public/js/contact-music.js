/* --- LOGIC: CONTACT MUSIC PLAYER (AUTO STOP OTHERS) --- */
document.addEventListener("DOMContentLoaded", () => {
    const musicalImage = document.getElementById('musical-image');
    const contactAudio = document.getElementById('contact-audio');
    const contactWrapper = document.querySelector('.contact-image-wrapper');

    // --- HÀM STOP CÔNG KHAI ---
    window.stopContactMusic = function() {
        if (contactAudio && !contactAudio.paused) {
            contactAudio.pause();
            if (contactWrapper) contactWrapper.classList.remove('music-on');
            if (musicalImage) musicalImage.style.opacity = "1";
        }
    };

    if (musicalImage && contactAudio && contactWrapper) {
        function toggleContactMusic() {
            if (contactAudio.paused) {
                // TẮT NHẠC Ở 2 NƠI KHÁC
                if (window.stopHomeMusic) window.stopHomeMusic();
                if (window.stopWritingMusic) window.stopWritingMusic();

                // --- BẬT ---
                contactAudio.play();
                contactWrapper.classList.add('music-on');
                musicalImage.style.opacity = "0.8";
            } else {
                // --- TẮT (PAUSE) ---
                window.stopContactMusic(); // Gọi chính hàm stop của mình cho gọn
            }
        }

        musicalImage.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleContactMusic();
        });
        musicalImage.addEventListener('touchstart', (e) => {
            e.stopPropagation(); e.preventDefault(); toggleContactMusic();
        });
    }
});
