import express from "express";
import ScanController from "../controllers/scan.controller.js";
import upload from "../middlewares/upload.middleware.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/match", auth, upload.single("resume"), ScanController.matchJDandResume);

export default router;
