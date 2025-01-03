import express from "express";
import asyncHandler from "express-async-handler";
import Customer from "../Models/customerModel.js";
import { admin, protect } from "../Middleware/AuthMiddleware.js";
import auth from "../services/auth-service.js";
import ZaloService from "../services/zaloServices.js";


const customerRouter = express.Router();

customerRouter.get(
    "/logged-in",
    auth.verify,
    asyncHandler(async (req, res) => {
      res.json({
        error: 0,
        message: "Success",
        data: req.user, // `req.user` được gắn bởi middleware `verify`
      });
    })
  );
  
customerRouter.post(
    "/login",
    asyncHandler(async (req, res) => {
      const { accessToken } = req.body;
      if (!accessToken) {
        res.status(400);
        throw new Error("Access token is required");
      }
  
      // Lấy thông tin từ Zalo
      const { id, birthday, name, gender, picture } = await ZaloService.getZaloProfile(accessToken);
  
      // Xử lý ngày sinh
      let birthDate = null;
      if (birthday) {
        const parts = birthday.split("/");
        birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
      }
  
      // Xử lý ảnh đại diện
      let pictureUrl = picture?.data?.url || picture;
  
      
      const customer = await Customer.findOneAndUpdate(
        { zaloId: id },
        {
          name_customer: name,
          sex: gender === "male",
          registrationDate: birthDate,
          picture: pictureUrl,
       
        },
        { new: true, upsert: true }
      );
  
      // Tạo JWT token
      const jwt = auth.genJSONWebToken(id, 3600);
  
      res.json({
        error: 0,
        message: "Success",
        data: { ...customer.toObject(), jwt },
      });
    })
  );

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
// customerRouter.get(
//     "/:id",
//     asyncHandler(async (req, res) => {
//         const customer = await Customer.findById(req.params.id);
//         if (customer) {
//             res.json(customer);
//         } else {
//             res.status(404);
//             throw new Error("Customer not found");
//         }
//     })
// );

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
                name_customer, email, phone, sex, registrationDate, customerCode, zaloId, followerId, picture
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
            customer.email = email || customer.email;
            customer.zaloId = zaloId || customer.zaloId;
            customer.followerId = followerId || customer.followerId;
            customer.picture = picture || customer.picture; 
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
