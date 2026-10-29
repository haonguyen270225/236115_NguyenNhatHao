
const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    // Mã món ăn: bắt buộc và duy nhất
    foodId: {
      type: String,
      required: [true, "Mã món ăn không được để trống"],
      unique: true,
      trim: true,
      minlength: [3, "Mã món ăn phải có ít nhất 3 ký tự"],
    },

    // Tên món ăn
    name: {
      type: String,
      required: [true, "Tên món ăn không được để trống"],
      trim: true,
      minlength: [2, "Tên món ăn phải có ít nhất 2 ký tự"],
      maxlength: [100, "Tên món ăn không được vượt quá 100 ký tự"],
    },

    // Loại món ăn
    category: {
      type: String,
      required: [true, "Loại món ăn không được để trống"],
      trim: true,
    },

    // Quốc gia hoặc phong cách ẩm thực
    cuisine: {
      type: String,
      trim: true,
      default: "Ẩm thực Việt Nam",
    },

    // Danh sách nguyên liệu
    ingredients: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },

    // Giá món ăn
    price: {
      type: Number,
      required: [true, "Giá món ăn không được để trống"],
      min: [0, "Giá món ăn không được âm"],
      validate: {
        validator: Number.isFinite,
        message: "Giá món ăn phải là số hữu hạn",
      },
    },

    // Số lượng tồn kho
    quantity: {
      type: Number,
      required: [true, "Số lượng không được để trống"],
      min: [0, "Số lượng không được âm"],
      default: 0,
      validate: [
        {
          validator: Number.isInteger,
          message: "Số lượng phải là số nguyên",
        },
        {
          validator: Number.isFinite,
          message: "Số lượng phải là số hữu hạn",
        },
      ],
    },

    // Mô tả món ăn
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Mô tả không được vượt quá 500 ký tự"],
      default: "",
    },

    // Đường dẫn hình ảnh
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Xuất model Food
module.exports = mongoose.model("Food", foodSchema);
