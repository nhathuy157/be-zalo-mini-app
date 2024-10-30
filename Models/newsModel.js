import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageURL: {
        type: String,
        required: true
    },
    view: {
        type: Number,
        default: 0
    },
    // releaseDate: {
    //     type: Date,
    //     default: Date.now
    // },
}, {
    timestamps: true
}
);

const News = mongoose.model("News", newsSchema);
export default News;