
import { useEffect, useRef, useState } from "react";
import StatusMessage from "./StatusMessage";
import "./App.css";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/foods`;

const EMPTY_FORM = {
  foodId: "",
  name: "",
  category: "",
  cuisine: "",
  ingredients: "",
  price: "",
  quantity: "",
  description: "",
  imageUrl: "",
};

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message ||
        `Yêu cầu thất bại với mã HTTP ${response.status}.`
    );
  }

  return result;
}

function App() {
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingFoodId, setDeletingFoodId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  // Đảm bảo phản hồi của yêu cầu cũ không ghi đè kết quả mới.
  const fetchIdRef = useRef(0);

  async function fetchFoods(keyword = searchTerm) {
    const requestId = ++fetchIdRef.current;

    setLoading(true);
    setError("");

    try {
      const trimmedKeyword = keyword.trim();
      const query = trimmedKeyword
        ? `?search=${encodeURIComponent(trimmedKeyword)}`
        : "";

      const result = await requestJson(`${API_URL}${query}`);

      if (requestId !== fetchIdRef.current) return;

      setFoods(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      if (requestId !== fetchIdRef.current) return;

      setError(err.message || "Không thể tải danh sách món ăn.");
      setFoods([]);
    } finally {
      if (requestId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }

  // Tự động tìm kiếm sau khi người dùng ngừng nhập 300 ms.
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFoods(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  function openAddForm() {
    setEditingFoodId(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setActionError("");
    setNotice("");
    setShowForm(true);
  }

  function openEditForm(food) {
    setEditingFoodId(food.foodId);

    setForm({
      foodId: food.foodId || "",
      name: food.name || "",
      category: food.category || "",
      cuisine: food.cuisine || "",
      ingredients: Array.isArray(food.ingredients)
        ? food.ingredients.join(", ")
        : food.ingredients || "",
      price: String(food.price ?? ""),
      quantity: String(food.quantity ?? ""),
      description: food.description || "",
      imageUrl: food.imageUrl || "",
    });

    setFormError("");
    setActionError("");
    setNotice("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingFoodId(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setFormError("");
    setNotice("");

    if (
      !form.foodId.trim() ||
      !form.name.trim() ||
      !form.category.trim() ||
      !form.cuisine.trim() ||
      form.price === "" ||
      form.quantity === ""
    ) {
      setFormError(
        "Vui lòng nhập mã món, tên món, danh mục, loại ẩm thực, giá bán và số lượng."
      );
      return;
    }

    const price = Number(form.price);
    const quantity = Number(form.quantity);

    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(price)) {
      setFormError("Giá bán phải là số nguyên không âm.");
      return;
    }

    if (
      !Number.isSafeInteger(quantity) ||
      quantity < 0
    ) {
      setFormError("Số lượng phải là số nguyên không âm hợp lệ.");
      return;
    }

    let imageUrl = form.imageUrl.trim();

    if (imageUrl) {
      try {
        const parsedUrl = new URL(imageUrl);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error("URL không hợp lệ.");
        }
      } catch {
        setFormError("URL hình ảnh phải là địa chỉ HTTP hoặc HTTPS hợp lệ.");
        return;
      }
    }

    const payload = {
      foodId: form.foodId.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      cuisine: form.cuisine.trim(),
      ingredients: form.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      price,
      quantity,
      description: form.description.trim(),
      imageUrl,
    };

    const isEditing = Boolean(editingFoodId);
    const url = isEditing
      ? `${API_URL}/${encodeURIComponent(editingFoodId)}`
      : API_URL;

    setSaving(true);

    try {
      await requestJson(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      setShowForm(false);
      setEditingFoodId(null);
      setForm({ ...EMPTY_FORM });
      setSelectedFood(null);
      setFormError("");

      setNotice(
        isEditing
          ? `Cập nhật món "${payload.name}" thành công.`
          : `Thêm món "${payload.name}" thành công.`
      );

      await fetchFoods(searchTerm);
    } catch (err) {
      setFormError(err.message || "Không thể lưu món ăn.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(food) {
    if (deletingFoodId) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa món "${food.name}" (${food.foodId}) không?`
    );

    if (!confirmed) return;

    setDeletingFoodId(food.foodId);
    setActionError("");
    setNotice("");

    try {
      await requestJson(
        `${API_URL}/${encodeURIComponent(food.foodId)}`,
        { method: "DELETE" }
      );

      if (selectedFood?.foodId === food.foodId) {
        setSelectedFood(null);
      }

      setNotice(`Đã xóa món "${food.name}" thành công.`);

      await fetchFoods(searchTerm);
    } catch (err) {
      setActionError(err.message || "Không thể xóa món ăn.");
    } finally {
      setDeletingFoodId(null);
    }
  }

  async function handleViewDetail(foodId) {
    setSelectedFood(null);
    setDetailError("");
    setDetailLoading(true);

    try {
      const result = await requestJson(
        `${API_URL}/${encodeURIComponent(foodId)}`
      );

      if (!result.data) {
        throw new Error("Không tìm thấy dữ liệu chi tiết món ăn.");
      }

      setSelectedFood(result.data);
    } catch (err) {
      setDetailError(err.message || "Không thể tải chi tiết món ăn.");
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    if (detailLoading) return;

    setSelectedFood(null);
    setDetailError("");
  }

  const isEditing = Boolean(editingFoodId);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="container py-4">
          <div className="d-flex align-items-center gap-3">
            <div className="brand-icon">🍜</div>
            <div>
              <h1 className="h3 fw-bold mb-1">Food Management</h1>
              <p className="mb-0 text-secondary">
                Hệ thống quản lý thông tin món ăn
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-4 py-md-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h2 className="h4 fw-bold mb-1">Danh sách món ăn</h2>
            <p className="text-secondary mb-0">
              {searchTerm.trim()
                ? `Kết quả tìm kiếm: ${foods.length} món`
                : `Tổng số món hiển thị: ${foods.length}`}
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={openAddForm}
              disabled={saving}
            >
              + Thêm món ăn
            </button>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => fetchFoods(searchTerm)}
              disabled={loading}
            >
              {loading ? "Đang tải..." : "↻ Làm mới"}
            </button>
          </div>
        </div>

        <div className="search-box mb-4">
          <label htmlFor="food-search" className="form-label fw-semibold">
            Tìm kiếm món ăn
          </label>

          <input
            id="food-search"
            type="search"
            className="form-control"
            placeholder="Nhập mã món, tên, danh mục hoặc loại ẩm thực..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        {notice && (
          <StatusMessage
            type="success"
            message={notice}
            onClose={() => setNotice("")}
          />
        )}

        {actionError && (
          <StatusMessage
            type="error"
            message={actionError}
            onClose={() => setActionError("")}
          />
        )}

        {loading && (
          <StatusMessage
            type="loading"
            message="Đang tải danh sách món ăn..."
          />
        )}

        {!loading && error && (
          <StatusMessage
            type="error"
            message={error}
            onClose={() => setError("")}
          />
        )}

        {!loading && error && (
          <button
            type="button"
            className="btn btn-outline-primary mb-4"
            onClick={() => fetchFoods(searchTerm)}
          >
            Thử tải lại
          </button>
        )}

        {!loading && !error && foods.length === 0 && (
          <div className="empty-state text-center py-5">
            <div className="display-4 mb-3">🍽️</div>
            <h3 className="h5">
              {searchTerm.trim()
                ? "Không tìm thấy món ăn"
                : "Chưa có món ăn"}
            </h3>
            <p className="text-secondary mb-3">
              {searchTerm.trim()
                ? "Thử từ khóa khác hoặc kiểm tra lại nội dung tìm kiếm."
                : "Bạn có thể thêm món ăn mới để bắt đầu quản lý."}
            </p>

            {!searchTerm.trim() && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={openAddForm}
              >
                + Thêm món ăn đầu tiên
              </button>
            )}
          </div>
        )}

        {!loading && !error && foods.length > 0 && (
          <div className="row g-4">
            {foods.map((food) => (
              <div className="col-12 col-md-6 col-lg-4" key={food.foodId}>
                <article className="card food-card h-100">
                  {food.imageUrl ? (
                    <img
                      src={food.imageUrl}
                      className="food-image"
                      alt={food.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="food-image-placeholder">
                      <span>🍲</span>
                      <small>Food Management</small>
                    </div>
                  )}

                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between gap-2 mb-2">
                      <span className="badge text-bg-light">
                        {food.category || "Chưa phân loại"}
                      </span>
                      <small className="text-secondary">{food.foodId}</small>
                    </div>

                    <h3 className="h5 fw-bold">{food.name}</h3>

                    <p className="text-secondary small mb-2">
                      {food.cuisine || "Chưa cập nhật ẩm thực"}
                    </p>

                    <p className="food-description text-secondary">
                      {food.description || "Chưa có mô tả."}
                    </p>

                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-secondary small">Giá bán</span>
                        <strong className="food-price">
                          {formatPrice(food.price)}
                        </strong>
                      </div>

                      <div className="small text-secondary mb-3">
                        Số lượng: {food.quantity ?? 0}
                      </div>

                      <div className="d-grid gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => handleViewDetail(food.foodId)}
                          disabled={detailLoading}
                        >
                          Xem chi tiết
                        </button>

                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-warning flex-fill"
                            onClick={() => openEditForm(food)}
                            disabled={Boolean(deletingFoodId)}
                          >
                            Sửa
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-danger flex-fill"
                            onClick={() => handleDelete(food)}
                            disabled={Boolean(deletingFoodId)}
                          >
                            {deletingFoodId === food.foodId
                              ? "Đang xóa..."
                              : "Xóa"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="app-footer py-4">
        <div className="container text-center text-secondary small">
          Food Management API · React · Bootstrap · MongoDB
        </div>
      </footer>

      {showForm && (
        <div
          className="detail-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              closeForm();
            }
          }}
        >
          <section
            className="detail-dialog form-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-title"
          >
            <div className="detail-header">
              <h2 className="h5 fw-bold mb-0" id="form-title">
                {isEditing ? "Cập nhật món ăn" : "Thêm món ăn mới"}
              </h2>

              <button
                type="button"
                className="btn-close"
                aria-label="Đóng"
                onClick={closeForm}
                disabled={saving}
              />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-4">
                {formError && (
                  <StatusMessage
                    type="error"
                    message={formError}
                    onClose={() => setFormError("")}
                  />
                )}

                {saving && (
                  <StatusMessage
                    type="loading"
                    message={
                      isEditing
                        ? "Đang cập nhật thông tin món ăn..."
                        : "Đang thêm món ăn..."
                    }
                  />
                )}

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="foodId">
                      Mã món ăn *
                    </label>
                    <input
                      id="foodId"
                      name="foodId"
                      className="form-control"
                      value={form.foodId}
                      onChange={handleFormChange}
                      disabled={isEditing || saving}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="name">
                      Tên món ăn *
                    </label>
                    <input
                      id="name"
                      name="name"
                      className="form-control"
                      value={form.name}
                      onChange={handleFormChange}
                      disabled={saving}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="category">
                      Danh mục *
                    </label>
                    <input
                      id="category"
                      name="category"
                      className="form-control"
                      value={form.category}
                      onChange={handleFormChange}
                      disabled={saving}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="cuisine">
                      Loại ẩm thực *
                    </label>
                    <input
                      id="cuisine"
                      name="cuisine"
                      className="form-control"
                      value={form.cuisine}
                      onChange={handleFormChange}
                      disabled={saving}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="price">
                      Giá bán (VNĐ) *
                    </label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="1"
                      className="form-control"
                      value={form.price}
                      onChange={handleFormChange}
                      disabled={saving}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="quantity">
                      Số lượng *
                    </label>
                    <input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      step="1"
                      className="form-control"
                      value={form.quantity}
                      onChange={handleFormChange}
                      disabled={saving}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label" htmlFor="ingredients">
                      Nguyên liệu
                    </label>
                    <input
                      id="ingredients"
                      name="ingredients"
                      className="form-control"
                      placeholder="Ví dụ: Bánh mì, thịt, rau"
                      value={form.ingredients}
                      onChange={handleFormChange}
                      disabled={saving}
                    />
                    <div className="form-text">
                      Phân cách các nguyên liệu bằng dấu phẩy.
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label" htmlFor="description">
                      Mô tả
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className="form-control"
                      rows="3"
                      value={form.description}
                      onChange={handleFormChange}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label" htmlFor="imageUrl">
                      URL hình ảnh (không bắt buộc)
                    </label>
                    <input
                      id="imageUrl"
                      name="imageUrl"
                      type="url"
                      className="form-control"
                      placeholder="https://example.com/food.jpg"
                      value={form.imageUrl}
                      onChange={handleFormChange}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Đang lưu..."
                      : isEditing
                        ? "Lưu cập nhật"
                        : "Thêm món ăn"}
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      )}

      {(selectedFood || detailLoading || detailError) && (
        <div
          className="detail-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !detailLoading
            ) {
              closeDetail();
            }
          }}
        >
          <section
            className="detail-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
          >
            <div className="detail-header">
              <h2 className="h5 fw-bold mb-0" id="detail-title">
                Chi tiết món ăn
              </h2>

              <button
                type="button"
                className="btn-close"
                aria-label="Đóng"
                onClick={closeDetail}
                disabled={detailLoading}
              />
            </div>

            <div className="p-3">
              {detailLoading && (
                <StatusMessage
                  type="loading"
                  message="Đang tải thông tin chi tiết..."
                />
              )}

              {detailError && !detailLoading && (
                <StatusMessage
                  type="error"
                  message={detailError}
                  onClose={() => setDetailError("")}
                />
              )}
            </div>

            {selectedFood && !detailLoading && (
              <div className="detail-content">
                {selectedFood.imageUrl && (
                  <img
                    src={selectedFood.imageUrl}
                    alt={selectedFood.name}
                    className="detail-image"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                )}

                <div className="p-4">
                  <span className="badge text-bg-primary mb-2">
                    {selectedFood.foodId}
                  </span>

                  <h3 className="h4 fw-bold">{selectedFood.name}</h3>

                  <p className="text-secondary">
                    {selectedFood.description || "Chưa có mô tả."}
                  </p>

                  <div className="detail-price mb-4">
                    {formatPrice(selectedFood.price)}
                  </div>

                  <dl className="detail-list">
                    <div>
                      <dt>Danh mục</dt>
                      <dd>{selectedFood.category || "Chưa cập nhật"}</dd>
                    </div>

                    <div>
                      <dt>Ẩm thực</dt>
                      <dd>{selectedFood.cuisine || "Chưa cập nhật"}</dd>
                    </div>

                    <div>
                      <dt>Số lượng</dt>
                      <dd>{selectedFood.quantity ?? 0}</dd>
                    </div>

                    <div>
                      <dt>Nguyên liệu</dt>
                      <dd>
                        {Array.isArray(selectedFood.ingredients)
                          ? selectedFood.ingredients.join(", ") ||
                            "Chưa cập nhật"
                          : selectedFood.ingredients || "Chưa cập nhật"}
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    className="btn btn-primary w-100 mt-3"
                    onClick={closeDetail}
                  >
                    Đóng chi tiết
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
