/* --- NGĂN CHẶN TẢI ẢNH/VIDEO/VIEW SOURCE --- */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Chặn menu chuột phải (Context Menu)
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // 2. Chặn kéo thả bất cứ thứ gì (Ảnh/Text)
    document.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });

    // 3. Chặn các phím tắt (Ctrl+C, Ctrl+S, Ctrl+U, F12...)
    document.addEventListener('keydown', (e) => {
        // Chặn F12
        if (e.key === 'F12') {
            e.preventDefault();
            return;
        }

        // Chặn Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return;
        }

        // Chặn Ctrl+C (Copy), Ctrl+S (Save), Ctrl+U (View Source), Ctrl+P (Print)
        if (e.ctrlKey && (e.key === 'c' || e.key === 's' || e.key === 'u' || e.key === 'p')) {
            e.preventDefault();
            return;
        }
    });
});
