import asyncError from "./asyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const isAuthenticated = asyncError(async (req, res, next) => {
  const { userToken } = req.cookies;

  if (!userToken) {
    return next(new ErrorHandler(`Please Login to access this Resource`, 400));
  }

  const decode = jwt.verify(userToken, process.env.JWT_SECRET);

  req.user = await User.findById(decode.id);

  next();
});

export const authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`Not Authorized for ${req.user.role} role`, 403)
      );
    }

    next();
  };
};
