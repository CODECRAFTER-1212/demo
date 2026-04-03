require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./models/Listing');

const deleteData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Listing.deleteMany({});
    console.log('Successfully deleted all listings from the database.');
    process.exit(0);
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
};

deleteData();
