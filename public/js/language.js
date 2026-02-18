// Hàm thiết lập ngôn ngữ
function setLanguage(lang) {
    // 1. Gán class cho body (mode-en hoặc mode-vi)
    document.body.className = 'mode-' + lang;

    // 2. Đổi màu nút bấm (đậm nhạt)
    const btnEn = document.getElementById('btn-en');
    const btnVi = document.getElementById('btn-vi');

    if (lang === 'en') {
        btnEn.classList.add('active');
        btnVi.classList.remove('active');
    } else {
        btnVi.classList.add('active');
        btnEn.classList.remove('active');
    }

    // 3. Lưu lại lựa chọn (để F5 không bị mất)
    localStorage.setItem('preferredLang', lang);
}

// Tự động chạy khi vừa vào web
document.addEventListener("DOMContentLoaded", () => {
    // Kiểm tra xem trước đó khách chọn gì, nếu chưa chọn thì mặc định là 'en' (Tiếng Anh)
    const savedLang = localStorage.getItem('preferredLang') || 'en';
    setLanguage(savedLang);
});
