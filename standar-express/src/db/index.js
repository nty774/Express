import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connectionResponse = await mongoose.connect(
      `${process.env.MONGO_URI}`
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
