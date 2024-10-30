import express from "express";
import asyncHandler from "express-async-handler";
import News from "../Models/newsModel.js";
import { admin, protect } from "../Middleware/AuthMiddleware.js";

const newsRouter = express.Router();

//get all news
newsRouter.get(
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
        const count = await News.countDocuments({ ...keyword });
        const news = await News.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1));
        res.json({ news, page, pages: Math.ceil(count / pageSize) });
    })
);

newsRouter.get(
    "/all",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const news = await News.find({}).sort({ _id: -1 });
        res.json(news);
    })
);

newsRouter.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const news = await News.findById(req.params.id);
        if (news) {
            res.json(news);
        } else {
            res.status(404).send({ message: "News not found" });
            throw new Error("News not found");
        }
    })
);

newsRouter.post(
    "/",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const { title, description, imageURL } = req.body;

        const newsExist = await News.findOne({ title });
        if (newsExist) {
            res.status(400);
            throw new Error("News already exists");
        } else {
            const news = new News({
                title,
                description,
                imageURL,
            });
            const createdNews = await news.save();
            res.status(201).json(createdNews);
        }
    })
    
);

newsRouter.put(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const { title, description, imageURL } = req.body;
        const news = await News.findById(req.params.id);
        if (news) {            
            news.title = title || news.title;
            news.description = description || news.description;
            news.imageURL = imageURL || news.imageURL;
            const updatedNews = await news.save();
            res.json(updatedNews);
        } else {
            res.status(404).send({ message: "News not found" });            
            throw new Error("News not found");
        }
    })
);

newsRouter.delete(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const news = await News.findById(req.params.id);
        if (news) {
            await news.remove();
            res.json({ message: "News removed" });
        } else {
            res.status(404);
            throw new Error("News not found");
        }
    })
); 


export default newsRouter;



