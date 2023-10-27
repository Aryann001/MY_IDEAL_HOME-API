import express from "express";
import { isAuthenticated, authorizedRoles } from "../middleware/auth.js";
import {
  allBlogs,
  createBlog,
  deleteBlog,
  filteredBlogs,
  getLoggedInUserBlogs,
  getSingleBlog,
  updateBlog,
} from "../controllers/blogController.js";

const router = express.Router();

router.route(`/allblogs`).get(allBlogs);

router.route(`/blogs/filter`).get(filteredBlogs);

router
  .route(`/getloggedinuserblogs`)
  .get(isAuthenticated, authorizedRoles("broker"), getLoggedInUserBlogs);

router
  .route(`/blog/create`)
  .post(isAuthenticated, authorizedRoles("broker"), createBlog);

router
  .route(`/blog/:id`)
  .get(getSingleBlog)
  .put(isAuthenticated, authorizedRoles("broker"), updateBlog)
  .delete(isAuthenticated, authorizedRoles("broker"), deleteBlog);

export default router;
