import express from "express";
import asyncHandler from "express-async-handler";
import Consultants from "../Models/consultantsModel.js";
import { admin, protect } from "../Middleware/AuthMiddleware.js";

const consultantsRouter = express.Router();

// Get all consultants with pagination
consultantsRouter.get(
    "/",
    asyncHandler(async (req, res) => {
        const pageSize = 12;
        const page = Number(req.query.pageNumber) || 1;
        const keyword = req.query.keyword 
        ? {
            name_consultants: {
                $regex: req.query.keyword,
                $options: "i"
            }
        }
        : {};

        const count = await Consultants.countDocuments({ ...keyword });
        const consultants = await Consultants.find({ ...keyword })
            .limit(pageSize)
            .skip(pageSize * (page - 1));
        res.json({ consultants, page, pages: Math.ceil(count / pageSize) });
    })
);

// Get all consultants (admin access only)
consultantsRouter.get(
    "/all",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const consultants = await Consultants.find({}).sort({ _id: -1 });
        res.json(consultants);
    })
);

// Get a single consultant by ID
consultantsRouter.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const consultant = await Consultants.findById(req.params.id);
        if (consultant) {
            res.json(consultant);
        } else {
            res.status(404).send({ message: "Consultant not found" });
            throw new Error("Consultant not found");
        }
    })
);

// Create a new consultant (admin access only)
consultantsRouter.post(
    "/",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const { name_consultants, email, phone, facebook } = req.body;

        // Check if the consultant already exists
        const consultantExist = await Consultants.findOne({ phone });
        if (consultantExist) {
            res.status(400);
            throw new Error("Consultant already exists with this phone number");
        } else {
            const consultant = new Consultants({
                name_consultants,
                email,
                phone,
                facebook,
            });

            const createdConsultant = await consultant.save();
            res.status(201).json(createdConsultant);
        }
    })
);

// Update an existing consultant by ID (admin access only)
consultantsRouter.put(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const { name_consultants, email, phone, facebook } = req.body;

        const consultant = await Consultants.findById(req.params.id);
        if (consultant) {
            consultant.name_consultants = name_consultants || consultant.name_consultants;
            consultant.email = email || consultant.email;
            consultant.phone = phone || consultant.phone;
            consultant.facebook = facebook || consultant.facebook;

            const updatedConsultant = await consultant.save();
            res.json(updatedConsultant);
        } else {
            res.status(404).send({ message: "Consultant not found" });
            throw new Error("Consultant not found");
        }
    })
);

// Delete a consultant by ID (admin access only)
consultantsRouter.delete(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const consultant = await Consultants.findById(req.params.id);
        if (consultant) {
            await consultant.remove();
            res.json({ message: "Consultant removed" });
        } else {
            res.status(404).send({ message: "Consultant not found" });
            throw new Error("Consultant not found");
        }
    })
);

export default consultantsRouter;
