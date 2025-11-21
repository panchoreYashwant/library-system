const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected → skip
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Mongo connected");
  } catch (err) {
    console.error("Mongo connection error:", err);
  }
};

module.exports = connectDB;
