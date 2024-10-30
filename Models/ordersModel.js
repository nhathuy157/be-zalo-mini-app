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
    totalAmount: {
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
    }
}, {
    timestamps: true
});

const Orders = mongoose.model("Orders", ordersSchema);
export default Orders;
