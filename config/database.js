import mongoose from "mongoose";

const DB = () => {
  mongoose
    .connect(process.env.DB_URI, {
      dbName: "MyIdealHome",
    })
    .then((data) =>
      console.log(`Database connected to : ${data.connection.host}`)
    );
};

export default DB;
