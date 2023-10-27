import House from "../models/houseModel.js";
import asyncError from "../middleware/asyncError.js";
import cloudinary from "cloudinary";
import ErrorHandler from "../utils/errorHandler.js";
import Features from "../utils/feature.js";

export const getAllHouse = asyncError(async (req, res, next) => {
  const houses = await House.find();

  res.status(200).json({
    success: true,
    houses,
  });
});

export const getSingleHouse = asyncError(async (req, res, next) => {
  const house = await House.findById(req.params.id);

  if (!house) {
    return next(new ErrorHandler(`Invalid Id... House Not Found`, 400));
  }

  res.status(200).json({
    success: true,
    house,
  });
});

export const getLoggedInUserHouse = asyncError(async (req, res, next) => {
  const houses = await House.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    houses,
  });
});

export const getFilteredHouse = asyncError(async (req, res, next) => {
  const resultPerPage = 8;
  const houseCount = await House.countDocuments();

  const features = new Features(House.find(), req.query)
    .filter()
    .search()
    .pinSearch();

  let houses = await features.query;

  const filteredHouse = houses.length;

  features.pagination(resultPerPage);

  houses = await features.query.clone();

  res.status(200).json({
    success: true,
    houses,
    houseCount,
    filteredHouse,
    resultPerPage,
  });
});

export const createHouseListing = asyncError(async (req, res, next) => {
  if (req.body.images !== undefined) {
    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    let imagesLink = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "House Images",
      });

      imagesLink.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLink;
  }
  req.body.user = req.user._id;

  const house = await House.create(req.body);

  res.status(201).json({
    success: true,
    house,
  });
});

export const updateHouseListing = asyncError(async (req, res, next) => {
  let house = await House.findById(req.params.id);

  if (!house) {
    return next(new ErrorHandler(`Invalid Id... House Not Found`, 400));
  }

  if (req.body.images !== undefined) {
    for (let i = 0; i < house.images.length; i++) {
      await cloudinary.v2.uploader.destroy(house.images[i].public_id);
    }

    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    let imagesLink = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "House Images",
      });

      imagesLink.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLink;
  }

  house = await House.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(201).json({
    success: true,
    house,
  });
});

export const deleteHouseListing = asyncError(async (req, res, next) => {
  let house = await House.findById(req.params.id);

  if (!house) {
    return next(new ErrorHandler(`Invalid Id... House Not Found`, 400));
  }

  for (let i = 0; i < house.images.length; i++) {
    await cloudinary.v2.uploader.destroy(house.images[i].public_id);
  }

  await house.deleteOne();

  res.status(201).json({
    success: true,
    message: `House Deleted Successfully`,
  });
});
