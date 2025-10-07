const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Review = require('../models/Review');
const CompanyReview = require('../models/CompanyReview');
const InternReview = require('../models/InternReview');
const CompanyIntern = require('../models/CompanyIntern');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const cleanupDatabase = async () => {
  try {
    console.log('Starting database cleanup...');
    
    // Delete all documents from all collections
    await User.deleteMany({});
    console.log('✅ Deleted all users');
    
    await Job.deleteMany({});
    console.log('✅ Deleted all jobs');
    
    await Application.deleteMany({});
    console.log('✅ Deleted all applications');
    
    await Interview.deleteMany({});
    console.log('✅ Deleted all interviews');
    
    await Review.deleteMany({});
    console.log('✅ Deleted all reviews');
    
    await CompanyReview.deleteMany({});
    console.log('✅ Deleted all company reviews');
    
    await InternReview.deleteMany({});
    console.log('✅ Deleted all intern reviews');
    
    await CompanyIntern.deleteMany({});
    console.log('✅ Deleted all company-intern relationships');
    
    console.log('🎉 Database cleanup completed successfully!');
    console.log('You can now start fresh with the new job creation system.');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run cleanup
connectDB().then(() => {
  cleanupDatabase();
});
