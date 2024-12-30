import asyncHandler from "express-async-handler";
import ZaloService from "../services/zaloServices.js";



const getOderInfo = asyncHandler(async (req, res) => {
    const {  accessToken } = req.body;

    if (!numberPhone || !accessToken) {
        return res.status(400).json({ message: "Missing required parameters" });
     }

     try {
        const orderDetails = await ZaloService.getZaloProfile(accessToken);
        res.json({
            message : "Success",
            data : orderDetails
        });
     }
      catch (error) {
        console.error('Lỗi khi gọi API', error.message);
        res.status(500).json({ message: error.message });

       }
});

export {getOderInfo} ;