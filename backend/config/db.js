
const mongoose = require("mongoose");

// Kết nối MongoDB Atlas
async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;

  // Kiểm tra biến môi trường
  if (!mongoURI) {
    throw new Error(
      "Thiếu biến môi trường MONGODB_URI trong file .env"
    );
  }

  // Thiết lập kết nối
  await mongoose.connect(mongoURI);

  console.log("MongoDB Atlas connected successfully!");
  console.log(`Database: ${mongoose.connection.name}`);
}

// Xuất hàm kết nối
module.exports = connectDB;
