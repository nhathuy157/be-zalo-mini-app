import express from "express";
import { getOderInfo } from "../controllers/apiController";

const router = express.Router();

router.post("/getOderInfo", getOderInfo);

export default router;