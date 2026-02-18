/* --- WRITING MUSIC PLAYER: HARUKA NAKAMURA (AUTO STOP OTHERS) --- */

const writingPlaylist = [
    { title: "better day", src: "https://assets.phamhuutri.com/assets/writings/still-life/1_betterday_still_life_haruka_nakamura.mp3?v=2", duration: "--:--" },
    { title: "one light", src: "https://assets.phamhuutri.com/assets/writings/still-life/2_onelight_still_life_haruka_nakamura.mp3?v=2", duration: "--:--" },
    { title: "morning", src: "https://assets.phamhuutri.com/assets/writings/still-life/3_morning_still_life_haruka_nakamura.mp3?v=2", duration: "--:--" },
    { title: "fragile", src: "https://assets.phamhuutri.com/assets/writings/still-life/4_fragile_still_life_haruka_nakamura.mp3?v=2", duration: "--:--" },
    { title: "your sonnet", src: "https://assets.phamhuutri.com/assets/writings/still-life/5_yoursonnet_still_life_haruka_nakamura.mp3?v=2", duration: "--:--" },
    { title: "fly", src: "https://assets.phamhuutri.com/assets/writings/still-life/6_Fly_still_life_haruka_nakamura.mp3?v=2", duration: "--:--" },
    { title: "call from spring", src: "https://assets.phamhuutri.com/assets/writings/still-life/7_callfromspring_still_life_haruka_nakamura.mp3?v=2", duration: "--:--" },
    { title: "easel", src: "https://assets.phamhuutri.com/assets/writings/still-life/8_easel_still_life_haruka_nakamura.mp3?v=2", duration: "--:--" },
    { title: "sometime", src: "https://assets.phamhuutri.com/assets/writings/still-life/9_sometime_still_life_haruka_nakamura.mp3?v=2", duration: "--:--" },
    { title: "seasons when a wind passes by", src: "https://assets.phamhuutri.com/assets/writings/still-life/10_seasonswhenawindpassesby_still_life_haruka_nakamura.mp3?v=2", duration: "--:--" },
    { title: "rainy day", src: "https://assets.phamhuutri.com/assets/writings/still-life/11_rainyday_still_life_haruka_nakamura.mp3?v=2", duration: "--:--" },
    { title: "anthology", src: "https://assets.phamhuutri.com/assets/writings/still-life/12_anthology_still_life_haruka_nakamura.mp3?v=2", duration: "--:--" },
    { title: "call me", src: "https://assets.phamhuutri.com/assets/writings/still-life/13_callme_still_life_haruka_nakamura.mp3?v=2", duration: "--:--" },
    { title: "17:00", src: "https://assets.phamhuutri.com/assets/writings/still-life/14_1700_still_life_haruka_nakamura.mp3?v=2", duration: "--:--" },
    { title: "foresight light", src: "https://assets.phamhuutri.com/assets/writings/still-life/15_foresightlight_still_life_haruka_nakamura.mp3?v=2", duration: "--:--" }
];

let wpIsActive = false;
let wpIsPlaying = false;
let wpIsExpanded = false;
let wpCurrentIndex = 0;

const wpTitleEl = document.getElementById('writing-main-title');
const wpHintEl = document.getElementById('writing-hint');
const wpPanelEl = document.getElementById('writing-player');
const wpAudio = document.getElementById('writing-audio-source');

const displayWpTitle = document.getElementById('wp-song-title');
const displayWpTime = document.getElementById('wp-artist-name');
const wpPlayBtn = document.getElementById('wp-play-btn');
const wpPlaylistContainer = document.getElementById('wp-playlist');

const iconWpPlay = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
const iconWpPause = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
}

function preloadDurations() {
    writingPlaylist.forEach((item, index) => {
        const tempAudio = new Audio(item.src);
        tempAudio.addEventListener('loadedmetadata', () => {
            item.realDuration = tempAudio.duration;
            updatePlaylistItemDuration(index, tempAudio.duration);
        });
    });
}

function updatePlaylistItemDuration(index, duration) {
    const items = document.querySelectorAll('.wp-playlist-item');
    if (items[index]) {
        const timeSpan = items[index].querySelector('span:last-child');
        if (timeSpan && index !== wpCurrentIndex) {
            timeSpan.innerText = formatTime(duration);
        }
    }
}

// --- HÀM STOP CÔNG KHAI ---
window.stopWritingMusic = function() {
    if (wpIsPlaying) {
        wpAudio.pause();
        wpIsPlaying = false;
        updateWpPlayIcon();
    }
}

function toggleWritingMusic() {
    wpIsActive = !wpIsActive;
    const hintEn = wpHintEl.querySelector('.content-en');
    const hintVi = wpHintEl.querySelector('.content-vi');

    if (wpIsActive) {
        // TẮT NHẠC NƠI KHÁC KHI MỞ PLAYER
        if (window.stopHomeMusic) window.stopHomeMusic();
        if (window.stopContactMusic) window.stopContactMusic();

        wpTitleEl.classList.add('music-active');
        if(hintEn) hintEn.innerText = "Click to close";
        if(hintVi) hintVi.innerText = "Bấm để đóng";
        wpPanelEl.classList.add('visible');
        displayWpTitle.innerText = "Still Life - Haruka Nakamura";
        loadWpSong(wpCurrentIndex);
    } else {
        wpTitleEl.classList.remove('music-active');
        if(hintEn) hintEn.innerText = "Click to open";
        if(hintVi) hintVi.innerText = "Bấm để mở";
        wpPanelEl.classList.remove('visible');
        wpPanelEl.classList.remove('expanded');
        wpIsExpanded = false;

        wpAudio.pause();
        wpIsPlaying = false;
        updateWpPlayIcon();
    }
}

function wpToggleExpand() {
    if (!wpIsActive) return;
    wpIsExpanded = !wpIsExpanded;
    if (wpIsExpanded) wpPanelEl.classList.add('expanded');
    else wpPanelEl.classList.remove('expanded');
}

function loadWpSong(index) {
    if (index < 0 || index >= writingPlaylist.length) return;
    const song = writingPlaylist[index];
    displayWpTitle.innerText = "Still Life - Haruka Nakamura";
    displayWpTime.innerText = "Loading...";
    wpAudio.src = song.src;
    wpAudio.load();
    renderWpPlaylist();
}

wpAudio.addEventListener('loadedmetadata', () => {
    const totalDuration = wpAudio.duration;
    writingPlaylist[wpCurrentIndex].realDuration = totalDuration;
    if (!wpIsPlaying) {
        displayWpTime.innerText = formatTime(totalDuration);
    }
    renderWpPlaylist();
});

wpAudio.addEventListener('timeupdate', () => {
    if (wpAudio.duration) {
        const remaining = wpAudio.duration - wpAudio.currentTime;
        const formattedTime = "-" + formatTime(remaining);
        displayWpTime.innerText = formattedTime;
        const activeTimeEl = document.getElementById('wp-active-time-display');
        if (activeTimeEl) {
            activeTimeEl.innerText = formattedTime;
            activeTimeEl.style.fontVariantNumeric = "tabular-nums";
        }
    }
});

wpAudio.addEventListener('ended', () => {
    wpNext();
});

function renderWpPlaylist() {
    wpPlaylistContainer.innerHTML = '';
    writingPlaylist.forEach((song, index) => {
        const div = document.createElement('div');
        div.className = 'wp-playlist-item';
        let timeDisplay = "";
        if (index === wpCurrentIndex) {
            div.classList.add('active');
            timeDisplay = `<span id="wp-active-time-display">--:--</span>`;
        } else {
            const durationToShow = song.realDuration ? formatTime(song.realDuration) : song.duration;
            timeDisplay = `<span>${durationToShow}</span>`;
        }
        div.innerHTML = `<span>${index + 1}. ${song.title}</span> ${timeDisplay}`;

        div.onclick = () => {
            // TẮT NHẠC NƠI KHÁC KHI CHỌN BÀI
            if (window.stopHomeMusic) window.stopHomeMusic();
            if (window.stopContactMusic) window.stopContactMusic();

            wpCurrentIndex = index;
            loadWpSong(wpCurrentIndex);
            setTimeout(() => {
                wpIsPlaying = true;
                wpAudio.play().catch(e => console.log(e));
                updateWpPlayIcon();
            }, 50);
        };
        wpPlaylistContainer.appendChild(div);
    });
}

function wpTogglePlay() {
    if (wpIsPlaying) {
        wpAudio.pause();
        wpIsPlaying = false;
    } else {
        // TẮT NHẠC NƠI KHÁC KHI BẤM PLAY
        if (window.stopHomeMusic) window.stopHomeMusic();
        if (window.stopContactMusic) window.stopContactMusic();

        wpAudio.play();
        wpIsPlaying = true;
    }
    updateWpPlayIcon();
}

function updateWpPlayIcon() {
    wpPlayBtn.innerHTML = wpIsPlaying ? iconWpPause : iconWpPlay;
}

function wpNext() {
    wpCurrentIndex = (wpCurrentIndex + 1) % writingPlaylist.length;
    loadWpSong(wpCurrentIndex);
    setTimeout(() => { wpIsPlaying = true; wpAudio.play(); updateWpPlayIcon(); }, 50);
}

function wpPrev() {
    wpCurrentIndex = (wpCurrentIndex - 1 + writingPlaylist.length) % writingPlaylist.length;
    loadWpSong(wpCurrentIndex);
    setTimeout(() => { wpIsPlaying = true; wpAudio.play(); updateWpPlayIcon(); }, 50);
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(preloadDurations, 2000);
});
