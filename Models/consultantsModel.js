import mongoose from "mongoose";

const consultantsSchema = new mongoose.Schema({
    name_consultants: {
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
    facebook: {
        type: String,
        required: true
    }

},{
    timestamps: true
});

const Consultants = mongoose.model("Consultants", consultantsSchema);
export default Consultants;