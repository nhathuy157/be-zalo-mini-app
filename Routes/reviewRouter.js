import express from "express";
import asyncHandler from "express-async-handler";
import Reviews from "../Models/reviewModel.js";
import { admin, protect } from "../Middleware/AuthMiddleware.js";

const reviewRouter = express.Router();

// Lấy tất cả reviews (phân trang + tìm kiếm theo từ khóa)
reviewRouter.get(
    "/",
    asyncHandler(async (req, res) => {
        const pageSize = 12;
        const page = Number(req.query.pageNumber) || 1;
        const keyword = req.query.keyword
            ? {
                  reviewText: {
                      $regex: req.query.keyword,
                      $options: "i",
                  },
              }
            : {};
        const count = await Reviews.countDocuments({ ...keyword });
        const reviews = await Reviews.find({ ...keyword })
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .populate("orderID", "name") // Populate thông tin đơn hàng
            .populate("consultantID", "name"); // Populate thông tin tư vấn viên
        res.json({ reviews, page, pages: Math.ceil(count / pageSize) });
    })
);

// Lấy tất cả reviews (chỉ dành cho admin)
reviewRouter.get(
    "/all",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const reviews = await Reviews.find({})
            .sort({ _id: -1 })
            .populate("orderID", "name")
            .populate("consultantID", "name");
        res.json(reviews);
    })
);

// Lấy chi tiết một review theo ID
reviewRouter.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const review = await Reviews.findById(req.params.id)
            .populate("orderID", "name")
            .populate("consultantID", "name");
        if (review) {
            res.json(review);
        } else {
            res.status(404).send({ message: "Review không tìm thấy" });
            throw new Error("Review không tìm thấy");
        }
    })
);

// Tạo mới một review
reviewRouter.post(
    "/",
    protect,
    asyncHandler(async (req, res) => {
        const {
            orderID,
            consultantID,
            ratingOder,
            reviewText,
            image,
            ratingConsultants,
            reviewTextConsultants,
        } = req.body;

        const review = new Reviews({
            orderID,
            consultantID,
            ratingOder,
            reviewText,
            image,
            ratingConsultants,
            reviewTextConsultants,
        });

        const createdReview = await review.save();
        res.status(201).json(createdReview);
    })
);

// Cập nhật một review
reviewRouter.put(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const {
            ratingOder,
            reviewText,
            image,
            ratingConsultants,
            reviewTextConsultants,
        } = req.body;

        const review = await Reviews.findById(req.params.id);

        if (review) {
            review.ratingOder = ratingOder || review.ratingOder;
            review.reviewText = reviewText || review.reviewText;
            review.image = image || review.image;
            review.ratingConsultants = ratingConsultants || review.ratingConsultants;
            review.reviewTextConsultants = reviewTextConsultants || review.reviewTextConsultants;

            const updatedReview = await review.save();
            res.json(updatedReview);
        } else {
            res.status(404).send({ message: "Review không tìm thấy" });
            throw new Error("Review không tìm thấy");
        }
    })
);

// Xóa một review
reviewRouter.delete(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const review = await Reviews.findById(req.params.id);

        if (review) {
            await review.remove();
            res.json({ message: "Review đã được xóa" });
        } else {
            res.status(404).send({ message: "Review không tìm thấy" });
            throw new Error("Review không tìm thấy");
        }
    })
);

export default reviewRouter;
