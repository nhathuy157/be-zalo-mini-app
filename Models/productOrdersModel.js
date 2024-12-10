import mongoose from "mongoose";

const productOrdersSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    material: {
        type: String,
        required: true
    },
    quantity:{
        type: Number,
        default: 0
    }
    
    // releaseDate: {
    //     type: Date,
    //     default: Date.now
},{
    timestamps: true
});

const ProductOrders = mongoose.model("ProductOrders", productOrdersSchema);
export default ProductOrders;