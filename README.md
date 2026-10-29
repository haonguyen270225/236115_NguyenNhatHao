# 236115_NguyenNhatHao
Bai Thi Thuc Hanh . Môn Điện Toán Đám Mây.

## Docker Deployment

### 1. Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- MongoDB Atlas hoặc MongoDB server đã cấu hình.
- File `backend/.env` chứa các biến môi trường cần thiết để kết nối cơ sở dữ liệu.

### 2. Run Backend with Docker

Backend sử dụng image `haonguyennhat/food-management-backend:1.0`.

Từ thư mục gốc của dự án, chạy:

```powershell
docker pull haonguyennhat/food-management-backend:1.0

docker run -d `
  --name food-management-api `
  -p 5001:5000 `
  --env-file backend/.env `
  haonguyennhat/food-management-backend:1.0
```

Kiểm tra trạng thái container:

```powershell
docker ps
```

Kiểm tra backend:

```powershell
Invoke-RestMethod http://localhost:5001/health
Invoke-RestMethod http://localhost:5001/api/foods
```

API base URL:

```text
http://localhost:5001/api/foods
```

Xem log backend:

```powershell
docker logs food-management-api
```

### 3. Run Frontend with Docker

Frontend sử dụng image `haonguyennhat/food-management-frontend:1.0`.

Tải image:

```powershell
docker pull haonguyennhat/food-management-frontend:1.0
```

Chạy frontend:

```powershell
docker run -d `
  --name food-management-web `
  -p 8080:80 `
  haonguyennhat/food-management-frontend:1.0
```

Mở giao diện tại:

```text
http://localhost:8080
```

Frontend được cấu hình sử dụng backend API tại:

```text
http://localhost:5001/api/foods
```

Đảm bảo backend đang chạy và cổng `5001` có thể truy cập từ trình duyệt. Nếu triển khai trên máy chủ khác, cần cấu hình lại `VITE_API_URL` khi build frontend để trỏ đến địa chỉ backend có thể truy cập được.

### 4. Stop and Remove Containers

Dừng container:

```powershell
docker stop food-management-web food-management-api
```

Xóa container:

```powershell
docker rm food-management-web food-management-api
```

Kiểm tra container:

```powershell
docker ps -a
```

### 5. Docker Hub Images

- Backend: https://hub.docker.com/r/haonguyennhat/food-management-backend
- Frontend: https://hub.docker.com/r/haonguyennhat/food-management-frontend


# Cloud Food Management

Hệ thống quản lý món ăn trên nền tảng điện toán đám mây, được xây dựng bằng React, Node.js, Express và MongoDB Atlas.

## 1. Giới thiệu đề tài

**Cloud Food Management** là ứng dụng web hỗ trợ quản lý thông tin món ăn. Hệ thống gồm giao diện người dùng, REST API và cơ sở dữ liệu MongoDB Atlas, được đóng gói bằng Docker và triển khai trên nền tảng đám mây Render.

### Mục tiêu

- Xây dựng giao diện quản lý món ăn bằng React.
- Xây dựng REST API bằng Node.js và Express.
- Lưu trữ dữ liệu trên MongoDB Atlas.
- Quản lý mã nguồn bằng Git và GitHub.
- Đóng gói ứng dụng bằng Docker.
- Đẩy Docker image lên Docker Hub và triển khai trên Render.

## 2. Công nghệ sử dụng

| Công nghệ | Mục đích |
|---|---|
| React | Xây dựng giao diện người dùng |
| Node.js | Môi trường chạy JavaScript phía máy chủ |
| Express.js | Xây dựng REST API |
| MongoDB Atlas | Cơ sở dữ liệu NoSQL trên đám mây |
| Git | Quản lý phiên bản mã nguồn |
| GitHub | Lưu trữ và quản lý repository |
| Docker | Đóng gói ứng dụng thành container |
| Docker Hub | Lưu trữ và chia sẻ Docker image |
| Render | Triển khai ứng dụng trực tuyến |

## 3. Chức năng chính

- Hiển thị danh sách món ăn.
- Xem thông tin chi tiết món ăn.
- Thêm món ăn mới.
- Cập nhật thông tin món ăn.
- Xóa món ăn.
- Lưu trữ và truy xuất dữ liệu thông qua MongoDB Atlas.

## 4. Cấu trúc dự án

```text
cloud-food-management/
├── client/                 # Frontend React
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── server/                 # Backend Node.js và Express
│   ├── config/              # Cấu hình cơ sở dữ liệu
│   ├── models/              # Mô hình dữ liệu
│   ├── routes/              # Các API endpoint
│   ├── controllers/         # Xử lý nghiệp vụ
│   ├── server.js            # Điểm khởi chạy backend
│   ├── package.json
│   └── Dockerfile
├── .gitignore
├── docker-compose.yml       # Tùy chọn chạy local
└── README.md
```

*Lưu ý: Cấu trúc trên là cấu trúc đề xuất. Điều chỉnh theo các thư mục và tệp thực tế của dự án.*

## 5. Yêu cầu môi trường

Cài đặt các công cụ sau trước khi chạy ứng dụng:

- Node.js và npm.
- Git.
- Docker Desktop (nếu chạy bằng Docker).
- Tài khoản MongoDB Atlas và một MongoDB database.
- Tài khoản GitHub, Docker Hub và Render để triển khai.

## 6. Hướng dẫn cài đặt và chạy chương trình

### Bước 1. Clone repository

```bash
git clone https://github.com/<username>/cloud-food-management.git
cd cloud-food-management
```

Thay `<username>` bằng tên tài khoản GitHub của bạn.

### Bước 2. Cấu hình backend

```bash
cd server
npm install
```

Tạo tệp `.env` trong thư mục `server/`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
```

Thay các giá trị mẫu bằng thông tin kết nối MongoDB Atlas thực tế.

Khởi chạy backend:

```bash
npm start
```

Nếu dự án đã cấu hình `dev` script, có thể chạy bằng:

```bash
npm run dev
```

### Bước 3. Khởi chạy frontend

Mở terminal mới tại thư mục gốc dự án:

```bash
cd client
npm install
npm run dev
```

Mở URL được Vite hiển thị trong terminal, thường là:

```text
http://localhost:5173
```

### Bước 4. Kiểm tra hệ thống

- Kiểm tra frontend hiển thị bình thường.
- Kiểm tra backend khởi động thành công.
- Kiểm tra kết nối MongoDB Atlas.
- Thử thêm, xem, cập nhật và xóa món ăn.
- Kiểm tra frontend gọi đúng URL của backend.

## 7. Đóng gói và triển khai

Quy trình triển khai dự kiến:

1. Tạo Dockerfile cho frontend và backend.
2. Build Docker image.
3. Đăng nhập Docker Hub và push image.
4. Tạo dịch vụ trên Render.
5. Cấu hình biến môi trường và URL kết nối MongoDB Atlas.
6. Truy cập URL triển khai để kiểm tra ứng dụng.

## 8. Bảo mật

- Không commit tệp `.env` lên GitHub.
- Không công khai mật khẩu MongoDB Atlas hoặc thông tin xác thực.
- Sử dụng biến môi trường cho thông tin cấu hình.
- Cấu hình quyền truy cập MongoDB Atlas phù hợp.

## 9. Trạng thái dự án

Dự án được thực hiện trong khuôn khổ học phần Điện toán đám mây, nhằm thực hành xây dựng, đóng gói và triển khai ứng dụng web sử dụng kiến trúc frontend, backend và cơ sở dữ liệu trên nền tảng đám mây.
