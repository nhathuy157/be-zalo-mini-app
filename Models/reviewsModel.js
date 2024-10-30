import mongoose from "mongoose";

const reviewsSchema = new mongoose.Schema({
   orderID : {
       type : mongoose.Schema.Types.ObjectId,
       required : true,
       ref : "Orders"
   },
   consultantID : {
    type : mongoose.Schema.Types.ObjectId,
       required : true,
       ref : "Consultants"

   },
   ratingOder : {
       type : Number,   
       default : 0
   },
   reviewText : {
       type : String,
       required : true
   },
   imageURL : {
       type : String,
       required : true
   },
   reviewDate : {
       type : Date,
       default : Date.now
   },
   ratingConsultants : {
       type : Number,   
       default : 0
   },
   reviewTextConsultants : {
       type : String,
       required : true
   }
},{
    timestamps : true

});

const Reviews = mongoose.model("Reviews", reviewsSchema);
export default Reviews;