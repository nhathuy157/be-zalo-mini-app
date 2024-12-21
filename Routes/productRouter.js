import express from "express";
import asyncHandler from "express-async-handler";
import Product from "../Models/productsModel.js";
import { admin, protect } from "../Middleware/AuthMiddleware.js";

const productRouter = express.Router();

// productRouter.get(
//     "/",
//     asyncHandler(async (req, res) => {
//         const pageSize = 12;
//         const page = Number(req.query.pageNumber) || 1;

//         // Điều kiện lọc theo category ID (nếu có)
//         const categoryFilter = req.query.type
//             ? { category: req.query.type } // category ID lấy từ query string
//             : {};

//         // Điều kiện tìm kiếm keyword
//         const keyword = req.query.keyword
//             ? {
//                   productName: {
//                       $regex: req.query.keyword,
//                       $options: "i",
//                   },
//               }
//             : {};

//         // Kết hợp cả 2 điều kiện
//         const filterCondition = { ...categoryFilter, ...keyword };

//          const count = await Product.countDocuments(filterCondition);
        

//         const products = await Product.find(filterCondition)
//             .limit(pageSize)
//             .skip(pageSize * (page - 1));

//         res.json({
//             product: products,
//             page,
//             pages: Math.ceil(count / pageSize),
//         });
//     })
// );


/**
 * get all product
 */

productRouter.get(
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

        const categoryFilter = req.query.type
            ? { category: req.query.type } // category ID lấy từ query string
            : {};
        const count = await Product.countDocuments({ ...keyword, ...categoryFilter });
        const data = await Product.find({ ...keyword, ...categoryFilter })
        .limit(pageSize)
        .skip(pageSize * (page - 1));
        res.json({ data, page, pages: Math.ceil(count / pageSize) });
    })
);



/**
 * admin get all
 */

productRouter.get(
    "/all",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const data = await Product.find({}).sort({ _id: -1 });
        res.json(data);
    })
);
/**
 * get product by id
 */
productRouter.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const data = await Product.findById(req.params.id);
        if (data) {
            res.json(data);
        } else {
            res.status(404).send({ message: "product not found" });
            throw new Error("product not found");
        }
    })
);

/**
 * Create product
 */
productRouter.post(
    "/",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const { category,
            productName,
            image,
            description,
        } = req.body;

        const productExist = await Product.findOne({ productName });
        if (productExist) {
            res.status(400);
            throw new Error("Product already exists");
        } else {
            const product= new Product({
                category,
                productName,
                image,
                description,
            });
            const createdProduct = await product.save();
            res.status(201).json(product );
        }
    })
    
);

/**
 * update product
 */

productRouter.put(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const { category,
            productName,
            image,
            description, } = req.body;
        const product = await Product.findById(req.params.id);
        if (product) {            
            product.category = category || product.category;
            product.productName = productName || product.productName;
            product.image = image || product.image;
            product.description = description || product.description;
            
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).send({ message: "Category not found" });            
            throw new Error("Category not found");
        }
    })
);
/**
 * Delete product
 */
productRouter.delete(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const product = await Product.findById(req.params.id);
        if (product) {
            await Product.remove();
            res.json({ message: "Product removed" });
        } else {
            res.status(404);
            throw new Error("Product not found");
        }
    })
); 

/**
 * Get products by category ID and pagination
 */






export default productRouter;



