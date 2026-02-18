document.addEventListener("DOMContentLoaded", function() {
    // Đợi 0.5 giây để dữ liệu phim tải xong
    setTimeout(function() {
        // 1. Lấy phần đuôi sau dấu # (ví dụ: #/short-films/dad-dont-lie)
        var currentHash = window.location.hash;

        // 2. Kiểm tra nếu có dấu #
        if (currentHash && currentHash.length > 1) {
            // Xóa dấu # ở đầu để lấy đường dẫn sạch (ví dụ: /short-films/dad-dont-lie)
            var path = currentHash.substring(1);

            console.log("Phát hiện Hash Link:", path);

            // 3. Tận dụng hàm getIdFromUrl có sẵn để dịch đường dẫn thành ID bài viết
            var targetId = getIdFromUrl(path);

            // 4. Gọi hàm mở trang
            if (targetId && targetId !== 'not-found') {
                showPage(targetId);
            }
        }
    }, 500);
});
