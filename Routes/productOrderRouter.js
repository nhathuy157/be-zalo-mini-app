import express from "express";
import asyncHandler from "express-async-handler";
import ProductOrder from "../Models/productOrdersModel.js";
import { admin, protect } from "../Middleware/AuthMiddleware.js";

const productOrderRouter = express.Router();

/**
 * get all product order
 */

productOrderRouter.get(
    "/",
    asyncHandler(async (req, res) => {
        const pageSize = 12;
        const page = Number(req.query.pageNumber) || 1;
        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: "i"
                }
            }
            : {};
        const count = await ProductOrder.countDocuments({ ...keyword });
        const data = await ProductOrder.find({ ...keyword })
            .limit(pageSize)
            .skip(pageSize * (page - 1));
        res.json({ data, page, pages: Math.ceil(count / pageSize) });
    })
);


/**
 * admin get all product order
 */


productOrderRouter.get(
    "/all",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const data = await ProductOrder.find({}).sort({ _id: -1 });
        res.json(data);
    })
);

/**
 * get productoder by id 
 */

productOrderRouter.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const productOrder = await ProductOrder.findById(req.params.id);
        if (productOrder) {
            res.json(productOrder);
        } else {
            res.status(404);
            throw new Error("ProductOrder not found");
        }
    })
);

/**
 * create product order
 */

productOrderRouter.post(
    "/",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const {
            productName,
            color,
            image,
            price,
            material,
            quantity,

        } = req.body;
        const productOrderExist = await ProductOrder.findOne({});
        if (productOrderExist) {
            res.status(400);
            throw new Error("ProductOrder already exists");
        } else {
            const productOrder = new ProductOrder({
                productName,
                color,
                image,
                price,
                material,
                quantity,
            });
            const createdProductOrder = await productOrder.save();
            res.status(201).json(createdProductOrder);
        }
    })
);

/**
 * Update type
 */


productOrderRouter.put(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const {
            productName,
            color,
            image,
            price,
            material,
            quantity,
        } = req.body;
        const productOrder = await ProductOrder.findById(req.params.id);
        if (productOrder) {
            productOrder.productName = productName || productOrder.productName;
            productOrder.color = color || productOrder.color;
            productOrder.image = image || productOrder.image;
            productOrder.price = price || productOrder.price;
            productOrder.material = material || productOrder.material;
            productOrder.quantity = quantity || productOrder.quantity;
            const updatedProductOrder = await productOrder.save();
            res.json(updatedProductOrder);
        } else {
            res.status(404);
            throw new Error("ProductOrder not found");
        }
    })
);

/**
 * Delete product order
 */

productOrderRouter.delete(
    ":/id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const productOrder = await ProductOrder.findById(req.params.id);
        if (productOrder) {
            await productOrder.remove();
            res.json({ message: "ProductOrder removed" });
        } else {
            res.status(404);
            throw new Error("ProductOrder not found");
        }
    })
);


export default productOrderRouter;