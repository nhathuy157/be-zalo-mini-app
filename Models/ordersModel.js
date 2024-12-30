import mongoose from "mongoose";

const ordersSchema = new mongoose.Schema({
    codeOrder: {
        type: String,
        required: true,
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    statusOrder: { 
        type: String,
        required: true
    },
    totalAmount: {  // Tổng tiền
        type: Number,
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Customer"
    },
    products: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
        ref: "ProductOrders"
    },
    consultant: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Consultants"
    },
    totalAccountAll: { // Tổng tiền đã cọc
        type: Number,
        required: true
    },
    VAT : {
        type: Number,
        required: true
    } 
    
    
}, {
    timestamps: true
});

const Orders = mongoose.model("Orders", ordersSchema);
export default Orders;
