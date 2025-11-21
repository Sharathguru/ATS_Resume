import express from "express";
import UserController from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", UserController.registerUser);
router.post("/login", UserController.loginUser);
router.get("/:email", UserController.getUser);

export default router;
