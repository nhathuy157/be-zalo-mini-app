import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import Customer from '../Models/customerModel.js'; 

// Middleware xác thực JWT và thêm khách hàng vào req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Kiểm tra xem token có trong header không và có bắt đầu bằng "Bearer" không
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Tách token từ header
      token = req.headers.authorization.split(' ')[1];

      // Giải mã token để lấy thông tin khách hàng (user ID)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin');

      // Lấy thông tin khách hàng từ bảng `Customers` bằng `decoded.id` (ID của người dùng)
    //  req.user = await Customer.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(404);
        throw new Error('Không tìm thấy người dùng');
      }

      // Tiếp tục xử lý nếu tìm thấy khách hàng
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Không có quyền truy cập, token không hợp lệ');
    }
  } else {
    res.status(401);
    throw new Error('Không có quyền truy cập, thiếu token');
  }
});

// Middleware kiểm tra quyền Admin của người dùng
const admin = (req, res, next) => {
  // Nếu người dùng tồn tại và có quyền admin thì tiếp tục xử lý
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error('Không có quyền truy cập, không phải admin');
  }
};

export { protect, admin };
