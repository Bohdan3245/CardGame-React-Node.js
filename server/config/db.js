require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("BD успішно підключена");
  } catch (err) {
    console.log("Помилка підключення", err.message);
  }
};

module.exports = connectDB;
