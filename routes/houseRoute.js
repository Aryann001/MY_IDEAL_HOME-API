import express from "express";
import {
  createHouseListing,
  deleteHouseListing,
  getAllHouse,
  getFilteredHouse,
  getLoggedInUserHouse,
  getSingleHouse,
  updateHouseListing,
} from "../controllers/houseController.js";
import { isAuthenticated, authorizedRoles } from "../middleware/auth.js";

const router = express.Router();

router.route(`/allhouses`).get(getAllHouse);

router.route(`/house/filter`).get(getFilteredHouse);

router
  .route(`/getloggedinuserhouses`)
  .get(isAuthenticated, authorizedRoles("broker"), getLoggedInUserHouse);

router
  .route(`/house/create`)
  .post(isAuthenticated, authorizedRoles("broker"), createHouseListing);

router
  .route(`/house/:id`)
  .get(getSingleHouse)
  .put(isAuthenticated, authorizedRoles("broker"), updateHouseListing)
  .delete(isAuthenticated, authorizedRoles("broker"), deleteHouseListing);

export default router;
