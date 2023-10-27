import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, `Please Enter the Title of the Blog`],
  },
  previewContent: {
    type: String,
    required: [true, `Please Enter the Preview of the Blog`],
  },
  content: {
    type: String,
    required: [true, `Please Enter the Content of the Blog`],
  },
  author: {
    type: String,
    required: [true, `Please Enter the Author of the Blog`],
  },
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
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

export default mongoose.model("Blog", blogSchema);
