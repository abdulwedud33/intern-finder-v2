const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {

    mongoose.connection.on('connected', () => {
      console.log('MongoDB: Connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    // Mongoose.connect with additional options for better reliability
    const conn = await mongoose.connect(process.env.MONGODB_URI);

  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // REFINED: Exit process with failure code. Your original code did this correctly.
    process.exit(1);
  }
};

module.exports = connectDB;
