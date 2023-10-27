import express from "express";
import {
  deleteProfile,
  forgotPassword,
  getUserProfile,
  login,
  logout,
  register,
  resetPassword,
  updatePassword,
  updateProfile,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.route(`/register`).post(register);

router.route(`/login`).post(login);

router.route(`/logout`).get(logout);

router.route(`/forgotpassword`).post(forgotPassword);

router.route(`/password/reset/:resetToken`).put(resetPassword);

//////////////////////////////////---USER ACTIONS ROUTES---//////////////////////////////////

router.route(`/profile`).get(isAuthenticated, getUserProfile);

router.route(`/updatepassword`).put(isAuthenticated, updatePassword);

router.route(`/updateprofile`).put(isAuthenticated, updateProfile);

router.route(`/deleteprofile`).delete(isAuthenticated, deleteProfile);

export default router;
