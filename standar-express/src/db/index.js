import mongoose from "mongoose";

const DB_NAME = "standard-express";

export const connectDB = async () => {
  try {
    const connectionResponse = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(
      "DB Connection successful.",
      connectionResponse.connection.host
    );
  } catch (error) {
    console.log("DB Connection error", error);
    process.exit(1);
  }
};
