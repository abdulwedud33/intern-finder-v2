const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    // Mongoose.connect now returns a promise of the connection object
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    // REFINED: Log the host of the connected database for better debugging.
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // REFINED: Exit process with failure code. Your original code did this correctly.
    process.exit(1);
  }
};

module.exports = connectDB;
