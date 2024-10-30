import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

// Kiểm tra model "Category" đã tồn tại chưa, nếu chưa thì mới tạo
const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
