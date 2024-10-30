import express  from "express";
import asyncHandler from "express-async-handler";
import Orders from "../Models/ordersModel.js";
import { admin, protect } from "../Middleware/AuthMiddleware.js";
import productRouter from "./productRouter.js";

const orderRouter = express.Router();
/**
 * get all order
 */
orderRouter.get(
    "/",
    asyncHandler(async (req, res) => {
        const pageSize = 12;
        const page = Number(req.query.pageNumber) || 1;
        const keyword = req.query.keyword ? {
            name : {
                $regex : req.query.keyword,
                $options : "i"
            }
        } : {

        };

        const count = await Orders.countDocuments({ ...keyword });
        const orders = await Orders.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1));
        res.json({ orders, page, pages: Math.ceil(count / pageSize) });
    
    })

);

/**
 * admin get all oder
 */

orderRouter.get(
    "/all",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const orders = await Orders.find({}).sort({ _id: -1 });
        res.json(orders);
    })
);


/**
 * get oder by id
 */
orderRouter.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const order = await Orders.findById(req.params.id);
        if (order) {
            res.json(order);
        } else {
            res.status(404);
            throw new Error("Order not found");
        }
    })
);

/**
 * create order
 */
productRouter.post(
    "/",
    protect,
    admin, 
    asyncHandler(async (req, res) => {
        const {
            codeOrder,
            orderDate,
            statusOrder,
            totalAmount,
            customer,
            products
        } = req.body;

        const orderExist = await Orders.findOne({});
        if (orderExist) {
            res.status(400);
            throw new Error("Order already exists");
        } else {
            const order = new Orders({
                codeOrder,
                orderDate,
                statusOrder,
                totalAmount,
                customer,
                products
            });
            const createdOrder = await order.save();
            res.status(201).json(createdOrder );
        }
    })

);

/**
 * update order
 *  */

orderRouter.put(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
      const { codeOrder,orderDate, statusOrder, totalAmount, customer } = req.body;
      const order = await Orders.findById(req.params.id);
      if (order) {
          order.codeOrder = codeOrder || order.codeOrder;
          order.orderDate = orderDate || order.orderDate;
          order.statusOrder = statusOrder || order.statusOrder;
          order.totalAmount = totalAmount ||    order.totalAmount;
          order.customer = customer || order.customer;
          order.products = products || order.products;
          const updatedOrder = await order.save();
          res.json(updatedOrder);
      } else {
          res.status(404);
          throw new Error("Order not found");
      }
  })  
);


/**
 * Delete order
 */
orderRouter.delete(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const order = await Orders.findById(req.params.id);
        if (order) {
            await Orders.remove();
            res.json({ message: "Order removed" });
        } else {
            res.status(404);
            throw new Error("Order not found");
        }
    })
);


export default orderRouter;