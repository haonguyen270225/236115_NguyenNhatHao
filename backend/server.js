
const dns = require("node:dns");
dns.setServers(["8.8.8.8"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const foodRoutes = require("./routes/foodRoutes");

const app = express();

// ==================== CẤU HÌNH ====================

// Đọc cổng từ biến môi trường, mặc định là 5000
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================

app.use(cors());
app.use(express.json());

// ==================== TRANG CHỦ ====================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Food Management API is running!",
  });
});

// ==================== HEALTH CHECK ====================

app.get("/health", (req, res) => {
  const isDatabaseConnected = mongoose.connection.readyState === 1;

  if (!isDatabaseConnected) {
    return res.status(503).json({
      success: false,
      message: "Cơ sở dữ liệu tạm thời không khả dụng",
      database: "disconnected",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Food Management API is running",
    database: "connected",
  });
});

// ==================== API QUẢN LÝ MÓN ĂN ====================

app.use("/api/foods", foodRoutes);

// ==================== XỬ LÝ LỖI JSON ====================

app.use((err, req, res, next) => {
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    Object.prototype.hasOwnProperty.call(err, "body")
  ) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu JSON không hợp lệ",
    });
  }

  return next(err);
});

// ==================== XỬ LÝ ROUTE KHÔNG TỒN TẠI ====================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "API endpoint không tồn tại",
  });
});

// ==================== XỬ LÝ LỖI MÁY CHỦ ====================

app.use((err, req, res, next) => {
  console.error("Lỗi máy chủ:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    success: false,
    message: "Đã xảy ra lỗi máy chủ",
  });
});

// ==================== KHỞI ĐỘNG SERVER ====================

async function startServer() {
  try {
    // Kết nối MongoDB trước khi khởi động server
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Foods API: http://localhost:${PORT}/api/foods`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Không thể khởi động backend:", error.message);
    process.exit(1);
  }
}

startServer();
