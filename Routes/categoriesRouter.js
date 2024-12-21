import express from "express";
import asyncHandler from "express-async-handler";
import Category from "../Models/categoriesModel.js";
import { admin, protect } from "../Middleware/AuthMiddleware.js";

const categoriesRouter = express.Router();

/**
 * Get all type
 */


categoriesRouter.get(
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
        const count = await Category.countDocuments({ ...keyword });
        const data = await Category.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1));
        res.json({ data , page, pages: Math.ceil(count / pageSize) });
    })
);
/** 
 * Admin get all
 */



categoriesRouter.get(
    "/all",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const data  = await Category.find({}).sort({ _id: -1 });
        res.json(data );
    })
);

/**
 * Get type by id
 */

categoriesRouter.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const category = await Category.findById(req.params.id);
        if (category) {
            res.json(category);
        } else {
            res.status(404).send({ message: "category not found" });
            throw new Error("category not found");
        }
    })
);

/**
 * Create type
 */

categoriesRouter.post(
    "/",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const { categoryName } = req.body;

        const categoryExist = await Category.findOne({ categoryName });
        if (categoryExist) {
            res.status(400);
            throw new Error("Category already exists");
        } else {
            const category = new Category({
                categoryName
            });
            const createdCategory = await category.save();
            res.status(201).json(createdCategory );
        }
    })
    
);

/**
 *  Update type
 */

categoriesRouter.put(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const { categoryName } = req.body;
        const category = await Category.findById(req.params.id);
        if (category) {            
            category.categoryName = categoryName || category.categoryName;
            
            const updatedCategory = await category.save();
            res.json(updatedCategory);
        } else {
            res.status(404).send({ message: "Category not found" });            
            throw new Error("Category not found");
        }
    })
);

/**
 *  Delete type
 */ 

categoriesRouter.delete(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const category = await Category.findById(req.params.id);
        if (category) {
            await Category.remove();
            res.json({ message: "Category removed" });
        } else {
            res.status(404);
            throw new Error("Category not found");
        }
    })
); 


export default categoriesRouter;



