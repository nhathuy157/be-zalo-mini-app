import express from "express";
import asyncHandler from "express-async-handler";
import Banner from "../Models/bannerModel.js";
import { admin, protect } from "../Middleware/AuthMiddleware.js";

const bannerRouter = express.Router();

// Lấy tất cả banner
// bannerRouter.get(
//   "/",
//   asyncHandler(async (req, res) => {
//     const banners = await Banner.find({});
//     res.json(banners);
//   })
// );

bannerRouter.get(
    "/",
    asyncHandler(async (req, res) => {
        const pageSize = 12;
        const page = Number(req.query.pageNumber) || 1;
        const keyword = req.query.keyword 
        ? {
            name : {
                $regex : req.query.keyword,
                $options : "i"
            }
        }
        : {};
        const count = await Banner.countDocuments({ ...keyword });
        const data = await Banner.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1));
        res.json({ data, page, pages: Math.ceil(count / pageSize) });
    })
);

// Thêm một banner mới
bannerRouter.post(
  "/",
  protect, // Yêu cầu đăng nhập
  admin,   // Chỉ admin có quyền thêm
  asyncHandler(async (req, res) => {
    const { image } = req.body;

    if (!image) {
      res.status(400);
      throw new Error("Image URL is required");
    }

    const banner = new Banner({ image });
    const createdBanner = await banner.save();
    res.status(201).json(createdBanner);
  })
);

// Cập nhật banner
bannerRouter.put(
  "/:id",
  protect, // Yêu cầu đăng nhập
  admin,   // Chỉ admin có quyền sửa
  asyncHandler(async (req, res) => {
    const { image } = req.body;
    const banner = await Banner.findById(req.params.id);

    if (banner) {
      banner.image = image || banner.image;
      const updatedBanner = await banner.save();
      res.json(updatedBanner);
    } else {
      res.status(404);
      throw new Error("Banner not found");
    }
  })
);

// Xóa banner
bannerRouter.delete(
  "/:id",
  protect, // Yêu cầu đăng nhập
  admin,   // Chỉ admin có quyền xóa
  asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);

    if (banner) {
      await banner.remove();
      res.json({ message: "Banner removed" });
    } else {
      res.status(404);
      throw new Error("Banner not found");
    }
  })
);

export default bannerRouter;
