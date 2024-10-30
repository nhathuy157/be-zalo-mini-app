import mongoose from "mongoose";

const consultantsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type:  String,
        required: true
    },
    email: {
        type: String,
        required: true
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