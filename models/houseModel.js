import mongoose from "mongoose";

const houseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, `Title is Required`],
    trim: true,
  },
  description: {
    type: String,
    required: [true, `Description is Required`],
  },
  address: {
    type: String,
    required: true,
  },
  pincode: {
    type: Number,
    required: [true, `Pincode is Required`],
  },
  price: {
    type: Number,
    required: [true, `Price is Required`],
  },
  discountedPrice: {
    type: Number,
    required: true,
  },
  bedrooms: {
    type: Number,
    required: true,
  },
  bathrooms: {
    type: Number,
    required: true,
  },
  furnished: {
    type: Boolean,
    default: false,
  },
  parking: {
    type: Boolean,
    default: false,
  },
  offer: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: [true, `Location is Required`],
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  contactInfo: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("House", houseSchema);
