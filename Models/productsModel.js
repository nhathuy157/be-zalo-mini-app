import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    category : {
        type : mongoose.Schema.Types.ObjectId,
        required: true,
        ref : "Category"
        
    },
    productName: {
        type: String,
        required: true
    },
    image: {
        type: [String],
        required: true
    },
    description: {
        type: String,
        required: true
    },

},{
    timestamps: true
});

const Product = mongoose.model("Product", productSchema);
export default Product;