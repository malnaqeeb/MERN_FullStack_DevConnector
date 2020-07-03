const mongoose = require('mongoose');
const config = require('config');

const db = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log('MongooDB connected');
  } catch (error) {
    console.log(error.message);
    // Exit process
    process.exit(1);
  }
};

module.exports = connectDB;
