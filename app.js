import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import errorMiddleware from "./middleware/errorMiddleware.js";
import uploadFile from "express-fileupload";
import cors from "cors";

const app = express();

dotenv.config({
  path: "./config/config.env",
});

//MIDDLEWARES
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(uploadFile());
app.use(
  cors({
    origin: [process.env.FRONTENDURL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

//IMPORTED ROUTES
import HouseRoute from "./routes/houseRoute.js";
import UserRoute from "./routes/userRoute.js";
import BlogRoute from "./routes/blogRoute.js";

//ROUTES USE
app.use(`/api/v1`, HouseRoute);
app.use(`/api/v1`, UserRoute);
app.use(`/api/v1`, BlogRoute);

app.use(errorMiddleware);

export default app;
