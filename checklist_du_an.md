# CHECKLIST PHÁT TRIỂN DỰ ÁN

## PHẦN 1: AUTHENTICATION & USER PROFILE

### 1. Đăng ký (Register)
- [ ] **Hoàn thành chức năng Đăng ký tài khoản**
  - **📍 Backend (API):**
    - `src/routes/auth.routes.js`: Định nghĩa route `POST /api/register`, sử dụng middleware `rateLimit` (giới hạn số lần request) và `validateRequest` (kiểm tra dữ liệu đầu vào).
    - `src/controllers/auth.controller.js`: Nhận dữ liệu, dùng `bcrypt` để hash mật khẩu, tạo user mới với trạng thái "chưa kích hoạt". Gửi mã OTP kích hoạt qua email (sử dụng thư viện `Nodemailer`).
    - `src/models/user.model.js`: Khởi tạo Schema lưu trữ `email`, `password`, `is_active`, `otp`.
  - **🖥️ Frontend (UI):**
    - `src/pages/Register.jsx`: Xây dựng form giao diện bằng TailwindCSS, xử lý validation phía client (React Hook Form hoặc formik/yup). Gọi request thông qua Redux Thunk hoặc Axios để gửi dữ liệu.
  - **💡 Lý thuyết & Công nghệ áp dụng:**
    - **Password Hashing:** Băm mật khẩu (Bcrypt) kết hợp Salt để chống lại kỹ thuật tấn công Rainbow Table Attacks.
    - **Middleware:** Chặn request bằng Rate Limiting để phòng chống tấn công Brute-force/DDoS.
    - **Two-Factor Authentication (2FA) / Verification:** Cơ chế gửi mã OTP xác minh danh tính người dùng thực.

### 2. Đăng nhập (Login & Phân quyền)
- [ ] **Hoàn thành chức năng Đăng nhập và Điều hướng phân quyền**
  - **📍 Backend (API):**
    - `src/routes/auth.routes.js`: Định nghĩa route `POST /api/login`, dùng middleware `rateLimit`.
    - `src/controllers/auth.controller.js`: Lấy `req.body`, so sánh hash `bcrypt`, sinh mã `JWT` (Access Token & Refresh Token). Xử lý phân quyền (Role) trả về redirect URL tương ứng (`/user/profile` hoặc `/admin/profile`).
  - **🖥️ Frontend (UI):**
    - `src/pages/Login.jsx`: Giao diện TailwindCSS, gửi request bằng `Axios`, lưu trữ token an toàn, sau đó cập nhật thông tin user vào Redux state (`authSlice`) và điều hướng bằng `react-router-dom`.
  - **💡 Lý thuyết & Công nghệ áp dụng:**
    - **JWT & Stateless:** Cơ chế xác thực sử dụng JSON Web Token gồm 3 phần (Header, Payload, Signature), không lưu session ở phía backend.
    - **Authorization (RBAC):** Cấp quyền truy cập hệ thống dựa trên vai trò (Role-Based Access Control - admin/user).
    - **Axios Interceptors:** Tự động đính kèm `Authorization: Bearer <token>` vào header của tất cả các request tiếp theo.

### 3. Quên mật khẩu (Forgot Password)
- [ ] **Hoàn thành chức năng Quên mật khẩu**
  - **📍 Backend (API):**
    - `src/routes/auth.routes.js`: Tạo các route `POST /api/forgot-password` và `POST /api/reset-password`.
    - `src/controllers/auth.controller.js`: Kiểm tra email có tồn tại không, sinh mã OTP/Token phục hồi có thời hạn (Expiration), lưu vào Database hoặc Redis, và gửi qua email.
  - **🖥️ Frontend (UI):**
    - `src/pages/ForgotPassword.jsx`: Form nhập email yêu cầu OTP và form xác thực OTP kèm nhập mật khẩu mới. Quản lý trạng thái đa bước bằng React Hooks (`useState`).
  - **💡 Lý thuyết & Công nghệ áp dụng:**
    - **Security & Token Expiration:** Quản lý thời gian sống (Time-To-Live - TTL) của OTP/Token nhằm ngăn chặn Replay Attacks.
    - **Event Loop / Asynchronous:** Xử lý gửi email bất đồng bộ, không làm block luồng thực thi chính của Node.js.

### 4. Chỉnh sửa thông tin (Edit Profile)
- [ ] **Hoàn thành chức năng Chỉnh sửa thông tin cá nhân**
  - **📍 Backend (API):**
    - `src/routes/user.routes.js`: Định nghĩa route `PUT /api/user/profile`, áp dụng middleware bảo vệ `verifyJWT`.
    - `src/controllers/user.controller.js`: Nhận dữ liệu cập nhật, loại bỏ các trường cấm sửa đổi (như password, role) trước khi cập nhật vào Database.
  - **🖥️ Frontend (UI):**
    - `src/pages/Profile.jsx`: Lấy dữ liệu user từ Redux để đổ vào form. Dùng Axios PUT để cập nhật, xử lý loading/success state, và dispatch action cập nhật lại Redux state sau khi thành công.
  - **💡 Lý thuyết & Công nghệ áp dụng:**
    - **Redux Single Source of Truth:** Đảm bảo dữ liệu profile của người dùng đồng nhất ở mọi nơi trong ứng dụng (Header, Sidebar, Profile Page).
    - **RESTful API Design:** Sử dụng HTTP method `PUT` (hoặc `PATCH`) cho hành động cập nhật tài nguyên.

## PHẦN 2: UI OPTIMIZATION & PRODUCT PAGES

### 5. Trang chủ (Homepage)
- [ ] **Hoàn thành Trang chủ (Yêu cầu đăng nhập, Hiển thị danh sách sản phẩm)**
  - **📍 Backend (API):**
    - `src/routes/product.routes.js`: Định nghĩa các GET routes cho sản phẩm Mới nhất, Khuyến mãi, Bán chạy.
    - `src/controllers/product.controller.js`: Xử lý query Database (sắp xếp theo `created_at`, `discount`, `sales`), limit số lượng.
  - **🖥️ Frontend (UI):**
    - `src/pages/Home.jsx`: Sử dụng `useEffect` để fetch API lần đầu tải trang.
    - `src/routes/ProtectedRoute.jsx`: Component bọc (Wrapper) chặn truy cập nếu Redux state báo chưa đăng nhập, tự động đẩy về `/login`.
  - **💡 Lý thuyết & Công nghệ áp dụng:**
    - **Higher-Order Component (HOC) / Protected Routes:** Kỹ thuật bảo vệ Route phía Frontend, điều hướng người dùng chưa xác thực.
    - **MVC (Model-View-Controller):** Mô hình phân tách kiến trúc, tách bạch logic truy xuất dữ liệu, xử lý điều hướng và hiển thị giao diện.

### 6. Chi tiết sản phẩm (Product Detail)
- [ ] **Hoàn thành Trang Chi tiết sản phẩm**
  - **📍 Backend (API):**
    - `src/controllers/product.controller.js`: Xử lý logic route `GET /api/products/:id`. `populate` thêm danh mục. Truy xuất thêm một mảng các sản phẩm tương tự cùng danh mục.
  - **🖥️ Frontend (UI):**
    - `src/pages/ProductDetail.jsx`: Layout TailwindCSS chia grid. Sử dụng thư viện `Swiper` xây dựng Image Carousel. Tích hợp Category Breadcrumb.
    - Xây dựng component tăng giảm số lượng (+/-) xử lý bằng `useState`. Render số lượng tồn kho (Stock) và đã bán.
  - **💡 Lý thuyết & Công nghệ áp dụng:**
    - **Component-Based Architecture:** Chia nhỏ UI thành các mảnh độc lập dễ bảo trì (SwiperSlider, Breadcrumb, QuantityControl).
    - **State Management (React Hooks):** Quản lý trạng thái cục bộ của form số lượng trước khi dispatch gửi lên Giỏ hàng.

### 7. Tìm kiếm & Lọc (Search & Filter)
- [ ] **Hoàn thành Tìm kiếm và Lọc Đa điều kiện**
  - **📍 Backend (API):**
    - `src/controllers/product.controller.js`: Phân tích `req.query` (như `?search=...&priceMin=...&category=...`), linh hoạt xây dựng các điều kiện filter truy vấn Database (sử dụng `$regex`, `$gte`, `$lte` nếu dùng MongoDB).
  - **🖥️ Frontend (UI):**
    - `src/components/FilterSidebar.jsx`: Quản lý các filter selection.
    - Sử dụng `react-router-dom` (`useSearchParams`) để đồng bộ state của Filter lên URL giúp User có thể chia sẻ (Share) link. Gửi Axios gọi API mỗi khi filter thay đổi.
  - **💡 Lý thuyết & Công nghệ áp dụng:**
    - **Debouncing:** Kỹ thuật trì hoãn thời gian gọi API khi người dùng đang gõ phím liên tục trong ô Search, giúp giảm tải request dư thừa.
    - **Query Optimization & Indexing:** Lập chỉ mục (Index) trên các cột thường xuyên tìm kiếm ở Database để tối ưu tốc độ đọc.

### 8. Danh sách sản phẩm (Product List)
- [ ] **Hoàn thành Lazy Loading hoặc Phân trang**
  - **📍 Backend (API):**
    - `src/controllers/product.controller.js`: Nhận tham số `page` và `limit` từ query. Sử dụng logic Offset (`skip()`) và `limit()` trong truy vấn DB, trả về data kèm Metadata (`totalItems`, `totalPages`).
  - **🖥️ Frontend (UI):**
    - `src/pages/ProductList.jsx`: Áp dụng Lazy Loading/Infinite Scroll. Nối (append) thêm dữ liệu vào state hiện tại mỗi khi cuộn đến cuối trang, thay vì thay thế hoàn toàn list.
  - **💡 Lý thuyết & Công nghệ áp dụng:**
    - **Offset-based / Cursor-based Pagination:** Các phương pháp tiêu chuẩn để chia nhỏ và tải dữ liệu khổng lồ từ Database.
    - **Intersection Observer API:** Quan sát phần tử DOM cuối cùng để kích hoạt hàm fetch tiếp dữ liệu (Infinite Scroll) mà không gây giật lag luồng xử lý chính.

### 9. Top 10 Bán chạy/Xem nhiều
- [ ] **Hoàn thành Hiển thị Top 10 có cuộn ngang**
  - **📍 Backend (API):**
    - `src/controllers/product.controller.js`: Thực hiện truy vấn Top 10 Order by `sold_quantity` giảm dần.
  - **🖥️ Frontend (UI):**
    - `src/components/TopProducts.jsx`: Áp dụng kỹ thuật Horizontal Pagination. Thiết lập CSS Tailwind: `overflow-x-auto flex gap-4 snap-x snap-mandatory` để cuộn ngang mượt mà.
  - **💡 Lý thuyết & Công nghệ áp dụng:**
    - **Redis Caching (Khuyến nghị):** Cấu hình cache kết quả Top 10 trên Redis Server để tăng tốc độ phản hồi (Cache Hit) vì dữ liệu này thường được xem nhiều nhưng ít thay đổi tức thì.
    - **CSS Grid/Flexbox & Scroll Snapping:** Ứng dụng CSS hiện đại để thiết kế UI/UX Mobile-friendly.

## PHẦN 3: CART, PAYMENT & ORDERS

### 10. Giỏ hàng (Cart)
- [ ] **Hoàn thành chức năng Quản lý Giỏ hàng**
  - **📍 Backend (API):**
    - `src/routes/cart.routes.js`: Các API CRUD (`POST /add`, `PUT /update`, `DELETE /remove`).
    - `src/controllers/cart.controller.js`: Xử lý lưu trữ. Khuyến khích dùng Redis lưu dưới dạng key-value (key là UserID) kết hợp với lưu đồng bộ vào Database (Cart Model) để bền vững hóa dữ liệu.
  - **🖥️ Frontend (UI):**
    - `src/components/Cart.jsx`: Quản lý giỏ hàng toàn cục thông qua Redux (`cartSlice`). Khi có thay đổi (+/-), cập nhật Redux ngay lập tức và gọi API ngầm để đồng bộ (Sync).
  - **💡 Lý thuyết & Công nghệ áp dụng:**
    - **In-Memory Database (Redis):** Cấu trúc dữ liệu trên RAM, cho tốc độ đọc ghi cực nhanh, thích hợp với đặc thù thay đổi liên tục của Giỏ hàng.
    - **Redux Thunk / Saga:** Quản lý Side Effects, xử lý các luồng gọi API bất đồng bộ kết hợp quản lý State.

### 11. Thanh toán (Payment - COD)
- [ ] **Hoàn thành quy trình Thanh toán COD**
  - **📍 Backend (API):**
    - `src/routes/order.routes.js`: Định nghĩa route `POST /api/orders`.
    - `src/controllers/order.controller.js`: Nhận dữ liệu giỏ hàng, **TÍNH TOÁN LẠI** tổng tiền trên server dựa vào DB để đảm bảo bảo mật. Khởi tạo Order status = "New", type = "COD". Cập nhật trừ đi số lượng Inventory (tồn kho).
  - **🖥️ Frontend (UI):**
    - `src/pages/Checkout.jsx`: Giao diện điền thông tin, chốt phương thức COD. Tính tổng hóa đơn + phí ship. Khi submit, gọi API và gửi action reset lại giỏ hàng trong Redux.
  - **💡 Lý thuyết & Công nghệ áp dụng:**
    - **ACID Properties (Database Transaction):** Dùng Transaction khi thanh toán. Các thao tác (Trừ tồn kho, Tạo đơn hàng, Xóa giỏ hàng) phải diễn ra và thành công đồng thời (Atomicity), nếu 1 bước lỗi thì Rollback toàn bộ.
    - **Zero Trust Security:** Nguyên tắc không bao giờ tin tưởng dữ liệu giá (price, total) từ phía Frontend (Client-side) gửi lên.

### 12. Theo dõi đơn hàng (Order Tracking)
- [ ] **Hoàn thành Giao diện theo dõi 6 trạng thái Đơn hàng**
  - **📍 Backend (API):**
    - `src/controllers/order.controller.js`: Query lấy danh sách đơn hàng thuộc về User đang request, trả về dữ liệu có chứa trường `status` lưu 1 trong 6 giá trị (New, Confirmed, Preparing, Shipping, Delivered, Cancelled).
  - **🖥️ Frontend (UI):**
    - `src/pages/OrderHistory.jsx`: Render danh sách đơn hàng. Xây dựng component `OrderStepper` hiển thị quá trình 6 bước dưới dạng timeline trục ngang hoặc dọc, highlight màu sắc theo `status`.
  - **💡 Lý thuyết & Công nghệ áp dụng:**
    - **State Machine (Máy trạng thái hữu hạn):** Thiết kế logic kiểm soát sự chuyển đổi trạng thái của đơn hàng phải tuân thủ trình tự hợp lệ (VD: Đang Shipping thì không thể lùi về Confirmed).
    - **Data Normalization:** Chuẩn hóa dữ liệu trạng thái về dạng hằng số (Constants/Enums) giữa Backend và Frontend để tránh lỗi typo.

### 13. Logic hủy đơn hàng (Cancellation Logic)
- [ ] **Hoàn thành Logic Hủy đơn & Yêu cầu Hủy**
  - **📍 Backend (API):**
    - `src/controllers/order.controller.js`: API `POST /api/orders/:id/cancel`. Kiểm tra timestamp `created_at`:
      - Nếu < 30 phút và hợp lệ -> Cập nhật sang "Cancelled" và cộng lại tồn kho.
      - Nếu trạng thái là "Preparing" -> Cập nhật thành "Cancel Requested" (Yêu cầu gửi lên admin).
  - **🖥️ Frontend (UI):**
    - `src/components/OrderActions.jsx`: Dùng hàm tính toán chênh lệch thời gian hiện tại và `created_at`. Dựa vào logic để render nút "Hủy đơn" hoặc "Gửi yêu cầu hủy đến shop".
  - **💡 Lý thuyết & Công nghệ áp dụng:**
    - **Business Logic / Domain Driven Design:** Cô lập các quy tắc nghiệp vụ phức tạp (Luật 30 phút, luật hoàn trả kho) và đặt xử lý tập trung, bảo mật tại Backend.
    - **Optimistic UI Updates:** Cập nhật ngay lập tức giao diện nút "Đã hủy" ở phía người dùng, tạo cảm giác hệ thống phản hồi mượt mà trước khi nhận response từ server.

### 14. Tự động xác nhận (Auto-confirm)
- [ ] **Hoàn thành Tự động cập nhật Trạng thái sau 30 phút**
  - **📍 Backend (API):**
    - Xử lý nền (Background Job): Lên lịch tìm các đơn hàng có `status="New"` và thời gian tạo > 30 phút, tự động chạy hàm update sang `status="Confirmed"`.
  - **🖥️ Frontend (UI):**
    - Không cần xử lý logic sâu, chỉ phản ánh trạng thái mới nhất khi gọi lại danh sách API, hoặc cấu hình WebSocket để lắng nghe thay đổi trạng thái theo thời gian thực (Real-time).
  - **💡 Lý thuyết & Công nghệ áp dụng:**
    - **Cron Jobs & Task Scheduling:** Kỹ thuật thiết lập các tiến trình chạy ngầm lặp lại theo chu kỳ để quét Database.
    - **Message Broker / Delayed Queue (RabbitMQ / BullMQ trên Redis):** Thay vì quét toàn bộ DB định kỳ (Polling), khi tạo đơn, hệ thống đẩy một Job vào hàng đợi với thời gian delay đúng 30 phút. Giải pháp này giúp tối ưu hiệu năng hệ thống ở quy mô lớn.
