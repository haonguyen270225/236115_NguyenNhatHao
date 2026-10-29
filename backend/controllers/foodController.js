
const mongoose = require("mongoose");
const Food = require("../models/Food");

// Các trường được phép thêm hoặc cập nhật
const allowedFields = [
  "foodId",
  "name",
  "category",
  "cuisine",
  "ingredients",
  "price",
  "quantity",
  "description",
  "imageUrl",
];

// Tìm món ăn bằng MongoDB _id hoặc foodId, ví dụ FOOD001
async function findFoodById(id) {
  if (mongoose.isValidObjectId(id)) {
    const food = await Food.findById(id);
    if (food) return food;
  }

  return Food.findOne({ foodId: id });
}

// Kiểm tra body có phải đối tượng JSON hợp lệ không
function isValidBody(body) {
  return (
    body !== null &&
    typeof body === "object" &&
    !Array.isArray(body)
  );
}

// Kiểm tra các trường không được hỗ trợ
function getInvalidFields(body) {
  return Object.keys(body).filter(
    (field) => !allowedFields.includes(field)
  );
}

// Chuẩn hóa lỗi validation của Mongoose
function getValidationErrors(error) {
  if (error.errors) {
    return Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }

  return [{ message: error.message }];
}

// GET /api/foods
// GET /api/foods?search=Phở
// Tìm theo mã, tên, loại món, ẩm thực và mô tả
exports.getFoods = async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const filter = {};

    if (search) {
      // Tránh để ký tự đặc biệt làm thay đổi biểu thức tìm kiếm
      const escapedKeyword = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const regex = new RegExp(escapedKeyword, "i");

      filter.$or = [
        { foodId: regex },
        { name: regex },
        { category: regex },
        { cuisine: regex },
        { description: regex },
      ];
    }

    const foods = await Food.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách món ăn:", error.message);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách món ăn",
    });
  }
};

// GET /api/foods/:id
exports.getFoodById = async (req, res) => {
  try {
    const food = await findFoodById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    return res.status(200).json({
      success: true,
      data: food,
    });
  } catch (error) {
    console.error("Lỗi lấy thông tin món ăn:", error.message);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin món ăn",
    });
  }
};

// POST /api/foods
// Thêm món ăn và kiểm tra dữ liệu đầu vào
exports.createFood = async (req, res) => {
  try {
    const body = req.body;

    if (!isValidBody(body)) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu gửi lên không hợp lệ",
      });
    }

    const invalidFields = getInvalidFields(body);

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Có trường dữ liệu không được hỗ trợ",
        fields: invalidFields,
      });
    }

    const food = await Food.create(body);

    return res.status(201).json({
      success: true,
      message: "Thêm món ăn thành công",
      data: food,
    });
  } catch (error) {
    // Mã món ăn bị trùng
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Mã món ăn đã tồn tại",
      });
    }

    // Dữ liệu không đáp ứng yêu cầu của Schema
    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu món ăn không hợp lệ",
        errors: getValidationErrors(error),
      });
    }

    console.error("Lỗi thêm món ăn:", error.message);

    return res.status(500).json({
      success: false,
      message: "Không thể thêm món ăn",
    });
  }
};

// PUT /api/foods/:id
// Cập nhật món ăn và kiểm tra dữ liệu đầu vào
exports.updateFood = async (req, res) => {
  try {
    const body = req.body;

    if (!isValidBody(body)) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu gửi lên không hợp lệ",
      });
    }

    const fields = Object.keys(body);

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp dữ liệu cần cập nhật",
      });
    }

    const invalidFields = getInvalidFields(body);

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Có trường dữ liệu không được hỗ trợ",
        fields: invalidFields,
      });
    }

    const food = await findFoodById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    // Cập nhật các trường được cho phép
    for (const field of fields) {
      food.set(field, body[field]);
    }

    // Kiểm tra toàn bộ dữ liệu trước khi lưu
    await food.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật món ăn thành công",
      data: food,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Mã món ăn đã tồn tại",
      });
    }

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu cập nhật không hợp lệ",
        errors: getValidationErrors(error),
      });
    }

    console.error("Lỗi cập nhật món ăn:", error.message);

    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật món ăn",
    });
  }
};

// DELETE /api/foods/:id
exports.deleteFood = async (req, res) => {
  try {
    const food = await findFoodById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    await food.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Xóa món ăn thành công",
    });
  } catch (error) {
    console.error("Lỗi xóa món ăn:", error.message);

    return res.status(500).json({
      success: false,
      message: "Không thể xóa món ăn",
    });
  }
};
