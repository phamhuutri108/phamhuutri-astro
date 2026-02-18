document.addEventListener("DOMContentLoaded", () => {
    // --- CẤU HÌNH ---
    // Link Apps Script của bạn (Đã điền sẵn)
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwhHX8zkSAu5CigMgY4MWn_ifa5f0J8p5V7fgDxHFkUE9EKd8P3TyEuthivR5UwPBOB/exec";

    console.log("Đang tải dữ liệu Real-time...");

    fetch(APPS_SCRIPT_URL)
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.split('\n');

            rows.forEach(row => {
                const cols = row.split(',');
                if (cols.length < 2) return;

                const targetId = cols[0].trim();
                const status = cols[1].trim().toUpperCase();

                // Nếu lệnh là OFF -> Ẩn ngay lập tức
                if (status === 'OFF') {
                    // 1. Ẩn chính nó (Nếu là ID nhóm)
                    const element = document.getElementById(targetId);
                    if (element) element.style.display = 'none';

                    // 2. Ẩn Link trên Sidebar
                    const sidebarLink = document.getElementById(`link-${targetId}`);
                    if (sidebarLink) {
                        if(sidebarLink.parentElement.tagName === 'LI') {
                            sidebarLink.parentElement.style.display = 'none';
                        } else {
                            sidebarLink.style.display = 'none';
                        }
                    }

                    // 3. Ẩn Ảnh Thumbnail
                    const thumbItem = document.getElementById(`thumb-${targetId}`);
                    if (thumbItem) thumbItem.style.display = 'none';

                    // 4. Ẩn Chữ bay
                    const scatterItem = document.getElementById(`scatter-${targetId}`);
                    if (scatterItem) scatterItem.style.display = 'none';
                }
            });
        })
        .catch(error => console.error("Lỗi:", error));
});
