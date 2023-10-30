import User from "../models/userModel.js";
import Blog from "../models/blogModel.js";
import House from "../models/houseModel.js";
import asyncError from "../middleware/asyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendCookie from "../utils/sendCookie.js";
import cloudinary from "cloudinary";
import sendEmail from "../utils/sendEmail.js";
import sendEmailText from "../utils/sendEmailText.js";
import crypto from "crypto";

export const register = asyncError(async (req, res, next) => {
  let avatar = { public_id: "Profile_Pic", url: "/Profile.png" };

  if (req.body.avatar !== undefined) {
    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "Profile_Pics",
    });

    avatar = { public_id: result.public_id, url: result.secure_url };
  }

  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
    avatar,
  });

  sendCookie(res, user, 201);
});

export const login = asyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler(`Please Enter Email And Password`, 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler(`Invalid Email and Password`, 400));
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorHandler(`Invalid Email and Password`, 400));
  }

  sendCookie(res, user, 200);
});

export const forgotPassword = asyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler(`Invalid Email`, 400));
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTENDURL}/api/v1/password/reset/${resetToken}`;

  const message = sendEmailText(resetPasswordUrl, user.name);

  try {
    await sendEmail({
      email: user.email,
      subject: `My Ideal Home Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email Sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

export const resetPassword = asyncError(async (req, res, next) => {
  const resetToken = req.params.resetToken;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(`Invalid Token or Token has been Expired`, 400)
    );
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler(`Passwords Doesn't Match`, 400));
  }

  user.password = req.body.newPassword;

  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save({ validateBeforeSave: false });

  sendCookie(res, user, 200);
});

export const logout = asyncError(async (req, res, next) => {
  res.cookie("userToken", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "Production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "Production" ? true : false,
  });

  res.status(200).json({
    success: true,
    message: `Logout Successfully`,
  });
});

//////////////////////////////////---USER ACTIONS---//////////////////////////////////

export const getUserProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

export const updatePassword = asyncError(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return next(new ErrorHandler(`Please Enter Passwords`, 400));
  }

  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatch = await user.comparePassword(oldPassword);

  if (!isPasswordMatch) {
    return next(new ErrorHandler(`Old Password is Incorrect`, 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler(`Passwords Doesn't Match`, 400));
  }

  user.password = newPassword;

  await user.save();

  sendCookie(res, user, 200);
});

export const updateProfile = asyncError(async (req, res, next) => {
  const userData = {
    name: req.body.name,
    email: req.body.email,
  };

  let user = await User.findById(req.user.id);

  if (req.body.avatar !== undefined) {
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "Profile_Pics",
    });

    userData.avatar = { public_id: result.public_id, url: result.secure_url };
  }

  user = await User.findByIdAndUpdate(req.user.id, userData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  sendCookie(res, user, 200);
});

export const deleteProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const blogs = await Blog.find({ user: req.user._id });
  const houses = await House.find({ user: req.user._id });

  if (!user) {
    return next(new ErrorHandler(`Invalid Id... User Not Found`, 400));
  }

  if (blogs.length !== 0) {
    for (let i = 0; i < blogs.length; i++) {
      await cloudinary.v2.uploader.destroy(blogs[i].image.public_id);
    }

    await Blog.deleteMany({ user: req.user._id });
  }

  if (houses.length !== 0) {
    for (let i = 0; i < houses.length; i++) {
      for (let j = 0; j < houses[i].images.length; j++) {
        await cloudinary.v2.uploader.destroy(houses[i].images[j].public_id);
      }
    }

    await House.deleteMany({ user: req.user._id });
  }

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: `User Deleted Successfully`,
  });
});
