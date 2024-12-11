import express from "express";
import {
  searchUsers,
  getUserProfile,
  updateProfile,
} from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/search", searchUsers);
router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, updateProfile);

export default router;
