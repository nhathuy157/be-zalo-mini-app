import express from "express";
import asyncHandler from "express-async-handler";
import Customer from "../Models/customerModel.js";
import { admin, protect } from "../Middleware/AuthMiddleware.js";
import categoriesRouter from "./categoriesRouter.js";

const customerRouter = express.Router();


/**
 * Get all customer
 */

customerRouter.get(
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
        const count = await Customer.countDocuments({ ...keyword });
        const customer = await Customer.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1));
        res.json({ customer, page, pages: Math.ceil(count / pageSize) });
    })
);

/**
 * Get all customer
 */

customerRouter.get(
    "/all",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const customer = await Customer.find({}).sort({_id : -1});
    })
);

/**
 * get type by id
 */
customerRouter.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            res.json(customer);
        } else {
            res.status(404);
            throw new Error("Customer not found");
        }
    })
);

/**
 * Create customer
 */

customerRouter.post(
    "/",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const { name_customer, email, phone, sex, registrationDate, customerCode } = req.body;

        const customerExist = await Customer.findOne({ phone_number });
        if (customerExist) {
            res.status(400);
            throw new Error("Category already exists");
        } else {
            const customer = new Customer({
                name_customer, email, phone, sex, registrationDate, customerCode
            });
            const createdCustomer = await customer.save();
            res.status(201).json(createdCustomer );
        }

    })
);

/**
 * Update customer
 */
customerRouter.put(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const { phone_number } = req.body;
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            customer.phone_number = phone_number || customer.phone_number;
            customer.name_customer= name_customer|| customer.name_customer;  
            customer.sex = sex || customer.sex; 
            customer.registrationDate = registrationDate || customer.registrationDate;
            customer.customerCode = customerCode || customer.customerCode;
            const updatedCustomer= await customer.save();
            res.json(updatedCustomer);
        } else {
            res.status(404);
            throw new Error("Category not found");
        }
    })
);

/**
 * Delete customer
 */

customerRouter.delete(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            await customer.remove();
            res.json({ message: "Customer removed" });
        } else {
            res.status(404);
            throw new Error("Customer not found");
        }
    })
);

export default customerRouter;
