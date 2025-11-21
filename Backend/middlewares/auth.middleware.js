import jwt from "jsonwebtoken";
import AsyncHandler from "express-async-handler";
import UserService from "../services/user.service.js";

const auth = AsyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token missing.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserService.getUserById(decoded.userId || decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User linked to token no longer exists.",
      });
    }

    req.user = {
      id: user._id,
      email: user.email,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
});

export default auth;

