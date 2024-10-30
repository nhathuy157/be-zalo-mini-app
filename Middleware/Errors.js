const notFound = (req, res, next) => {
    // Tạo một đối tượng Error mới với thông báo đường dẫn không tìm thấy
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404); // Đặt mã trạng thái HTTP là 404
    next(error); // Chuyển tiếp lỗi đến middleware tiếp theo (errorHandler)
  };
  
  const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Mặc định là 500 nếu không có mã trạng thái khác
    res.status(statusCode);
    res.json({
      message: err.message, // Trả về thông báo lỗi
      stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Ẩn thông tin stack trace khi ở chế độ production
    });
  };
  
  export { notFound, errorHandler };
  