import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    name_customer: {
        type: String,
        required: true // Trường này vẫn bắt buộc
    },
    email: {
        type: String,
        required: false // Không bắt buộc
    },
    phone: {
        type: String,
        required: true // Vẫn bắt buộc
    },
    sex: {
        type: Boolean,
        default: true // Không bắt buộc và có giá trị mặc định
    },
    registrationDate: {
        type: Date,
        default: Date.now // Không bắt buộc, tự động lấy ngày hiện tại nếu không có giá trị
    },
    customerCode: {
        type: String,
        required: false // Không bắt buộc
    }
}, {
    timestamps: true
});

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
