import Blog from "../models/blogModel.js";
import asyncError from "../middleware/asyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import Features from "../utils/feature.js";
import cloudinary from "cloudinary";

export const allBlogs = asyncError(async (req, res, next) => {
  const blogs = await Blog.find();

  res.status(200).json({
    success: true,
    blogs,
  });
});

export const filteredBlogs = asyncError(async (req, res, next) => {
  const resultPerPage = 8;
  const blogCount = await Blog.countDocuments();

  const features = new Features(Blog.find(), req.query).pagination(
    resultPerPage
  );

  const blogs = await features.query;


  res.status(200).json({
    success: true,
    blogs,
    blogCount,
    resultPerPage,
  });
});

export const getSingleBlog = asyncError(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new ErrorHandler(`Invalid Id... Blog Not Found`, 400));
  }

  res.status(200).json({
    success: true,
    blog,
  });
});

export const getLoggedInUserBlogs = asyncError(async (req, res, next) => {
  const blogs = await Blog.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    blogs,
  });
});

export const createBlog = asyncError(async (req, res, next) => {
  const { title, previewContent, content } = req.body;

  if (req.body.image !== undefined) {
    const result = await cloudinary.v2.uploader.upload(image, {
      folder: "Blog Images",
    });

    const resultImg = {
      public_id: result.public_id,
      url: result.secure_url,
    };

    req.body.image = resultImg;
  }

  req.body.image = { public_id: "Blog_Image", url: "/BlogImage.png" };

  const blog = await Blog.create({
    title,
    previewContent,
    content,
    image: req.body.image,
    user: req.user._id,
    author: req.user.name,
  });

  res.status(200).json({
    success: true,
    blog,
  });
});

export const updateBlog = asyncError(async (req, res, next) => {
  const blogData = {
    title: req.body.title,
    previewContent: req.body.previewContent,
    content: req.body.content,
  };

  let blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new ErrorHandler(`Invalid Id... Blog Not Found`, 400));
  }

  if (req.body.image !== undefined) {
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    const result = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "Blog Images",
    });

    blogData.image = { public_id: result.public_id, url: result.secure_url };
  }

  blog = await Blog.findByIdAndUpdate(req.params.id, blogData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    blog,
  });
});

export const deleteBlog = asyncError(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new ErrorHandler(`Invalid Id... Blog Not Found`, 400));
  }

  await cloudinary.v2.uploader.destroy(blog.image.public_id);

  await blog.deleteOne();

  res.status(200).json({
    success: true,
    message: `Blog Deleted Successfully`,
  });
});
