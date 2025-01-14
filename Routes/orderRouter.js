import express from "express";
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
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        }
      : {};

    const count = await Orders.countDocuments({ ...keyword });
    const data = await Orders.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    res.json({ data, page, pages: Math.ceil(count / pageSize) });
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
    const data = await Orders.find({}).sort({ _id: -1 });
    res.json(data);
  })
);

/**
 * get oder by id
 */
orderRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const data= await Orders.findById(req.params.id);
    if (data) {
      res.json(data);
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
      products,
      consultant,
      totalAccountAll,
      VAT,
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
        products,
        consultant,
        totalAccountAll,
        VAT,

      });
      const createdOrder = await order.save();
      res.status(201).json(createdOrder);
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
    const { codeOrder, orderDate, statusOrder, totalAmount, customer } =
      req.body;
    const order = await Orders.findById(req.params.id);
    if (order) {
      order.codeOrder = codeOrder || order.codeOrder;
      order.orderDate = orderDate || order.orderDate;
      order.statusOrder = statusOrder || order.statusOrder;
      order.totalAmount = totalAmount || order.totalAmount;
      order.customer = customer || order.customer;
      order.products = products || order.products;
      order.consultant = consultant || order.consultant;
      order.VAT = VAT || order.VAT;
      order.totalAccountAll = totalAccountAll || order.totalAccountAll;
      const data= await order.save();
      res.json(data);
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
