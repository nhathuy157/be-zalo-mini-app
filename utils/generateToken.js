import jwt from "jsonwebtoken";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "admin", {
        expiresIn: "1000d",
    });
};

export default generateToken;