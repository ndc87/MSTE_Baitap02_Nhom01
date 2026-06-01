# 🗺️ LỘ TRÌNH KIỂM THỬ (TESTING ROADMAP) — UTEShop E-Commerce

> Phân tích dựa trên source code thực tế của dự án. Mỗi nhận xét **Bug/Rủi ro** đều chỉ rõ file và dòng code tương ứng.

---

## 📌 TỔNG QUAN KIẾN TRÚC DỰ ÁN

| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| Backend | Express.js + MongoDB (Mongoose) | Không có Redis — Cart lưu DB |
| Frontend | React + Vite + Redux Toolkit | Tailwind CSS |
| Auth | JWT (Access 15m / Refresh 7d) | httpOnly cookie cho refreshToken |
| State | Redux `authSlice.js` | Cart không có Redux slice riêng |
| OTP | MongoDB TTL Index | Tự xóa sau khi hết hạn |

---

## 🔴 GIAI ĐOẠN 1: TEST API & BACKEND (Postman / Thunder Client)

### 1.1 — Đăng ký & OTP

**File xử lý:**
- Route: [`authRoutes.js` L32-46](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/routes/authRoutes.js#L32-L46)
- Logic: [`authService.js` L155-196](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/services/authService.js#L155-L196) (sendRegistrationOTP), [`authService.js` L202-271](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/services/authService.js#L202-L271) (registerUser)
- OTP Model: [`OTP.js` L12](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/models/OTP.js#L12) — TTL Index

| # | Test Case | Phương thức | Endpoint | Body | Kết quả Mong đợi |
|---|---|---|---|---|---|
| TC-R01 | Gửi OTP hợp lệ | POST | `/api/auth/register/send-otp` | `{"email":"test@gmail.com"}` | 200 + "OTP has been sent" |
| TC-R02 | Gửi OTP thiếu email | POST | `/api/auth/register/send-otp` | `{}` | 422 Validation Error |
| TC-R03 | Gửi OTP email sai format | POST | `/api/auth/register/send-otp` | `{"email":"notanemail"}` | 422 "Invalid email format" |
| TC-R04 | Gửi OTP cho email **đã đăng ký active** | POST | `/api/auth/register/send-otp` | `{"email":"existing@gmail.com"}` | 422 "Email is already registered" |
| TC-R05 | **Rate Limit OTP**: Gửi > 5 lần trong 15 phút | POST (x6) | `/api/auth/register/send-otp` | Same email | Lần 6: **429 "Too many OTP requests"** |
| TC-R06 | Đăng ký với OTP đúng | POST | `/api/auth/register` | `{full_name, email, password, otp_code}` | 201 + token + user |
| TC-R07 | Đăng ký với OTP **sai** | POST | `/api/auth/register` | OTP sai 6 chữ số | 422 "Invalid OTP code" |
| TC-R08 | Đăng ký với OTP **đã hết hạn** (>5 phút) | POST | `/api/auth/register` | OTP đúng nhưng hết hạn | 422 "OTP code has expired" |
| TC-R09 | Đăng ký với OTP **đã dùng** | POST | `/api/auth/register` | OTP đúng, dùng lần 2 | 422 "Invalid OTP code or already verified" |
| TC-R10 | Đăng ký thiếu password đủ mạnh | POST | `/api/auth/register` | password = "12345678" | 422 "Password must include uppercase..." |
| TC-R11 | **Rate Limit Register**: Gửi > 5 lần trong 15 phút | POST (x6) | `/api/auth/register` | Any body | Lần 6: **429** |

> **✅ ĐÃ FIX TỐI ƯU HÓA DB:**
> Do Model có cấu hình TTL Index (`expireAfterSeconds: 0`), MongoDB tự động xóa OTP khi hết hạn. Khối check `expired_at` đã được gỡ bỏ vì dư thừa. Các lỗi sai mã, hết hạn, hoặc đã dùng đều quy về chung một mã lỗi thống nhất `422 "Invalid OTP code, expired or already verified"`. Điều này giúp tiết kiệm tối đa dung lượng DB cho ứng dụng.

---

### 1.2 — Đăng nhập & JWT

**File xử lý:**
- [`authRoutes.js` L49](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/routes/authRoutes.js#L49)
- [`authService.js` L82-150](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/services/authService.js#L82-L150)
- Rate Limiter: [`rateLimiter.js`](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/middleware/rateLimiter.js)

| # | Test Case | Phương thức | Kết quả Mong đợi |
|---|---|---|---|
| TC-L01 | Đăng nhập hợp lệ (user thường) | POST `/api/auth/login` | 200 + token + `redirectUrl: "/user/profile"` |
| TC-L02 | Đăng nhập hợp lệ (admin) | POST `/api/auth/login` | 200 + `redirectUrl: "/admin/profile"` |
| TC-L03 | Đăng nhập sai mật khẩu | POST `/api/auth/login` | 401 "Invalid email or password" |
| TC-L04 | **Sai password 5 lần liên tiếp** | POST x5 | Lần 5: Account locked 15 phút |
| TC-L05 | Đăng nhập khi account bị lock | POST `/api/auth/login` | 401 "Account temporarily locked... Try again in X minutes" |
| TC-L06 | **Rate Limit**: >10 request/15 phút từ cùng IP | POST (x11) | Lần 11: **429** từ `loginLimiter` |
| TC-L07 | **Kiểm tra JWT Token expire** | GET `/api/cart` với Access Token cũ (>15 phút) | 401 "Not authorized, token failed" |
| TC-L08 | **Refresh Token**: Gọi `/api/auth/refresh-token` | POST | 200 + new access token |
| TC-L09 | Refresh Token không có cookie | POST `/api/auth/refresh-token` | 401 "Not authenticated" |
| TC-L10 | Đăng nhập tài khoản inactive | POST `/api/auth/login` | 401 "Account is disabled" |

> **⚠️ BUG PHÁT HIỆN — TC-L06 vs TC-L04 (Double Layer):**
> Có 2 tầng bảo vệ brute-force: `loginLimiter` (IP-based, 10 req/15m) và logic `failed_login_attempts` trong DB (5 lần sai → lock user). Chúng **độc lập nhau**. Nếu dùng nhiều IP khác nhau, IP rate limit qua nhưng DB lock vẫn hoạt động → **OK**. Nhưng nếu 1 IP gửi 10 request (rate limit block), reset window, gửi tiếp → DB chưa lock. **Cần test kịch bản này**.

---

### 1.3 — Quên/Reset Mật khẩu

**File xử lý:**
- [`authController.js` L109-141](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/controllers/authController.js#L109-L141) (forgotPassword)
- [`authController.js` L147-187](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/controllers/authController.js#L147-L187) (resetPassword)

| # | Test Case | Kết quả Mong đợi |
|---|---|---|
| TC-FP01 | Gửi OTP reset password — email tồn tại | 200 "OTP has been sent to your email" |
| TC-FP02 | Gửi OTP reset — email không tồn tại | 422 "Email does not exist" |
| TC-FP03 | **Rate Limit**: >3 lần trong 30 phút | Lần 4: 429 "Too many password reset requests" |
| TC-FP04 | Reset password với OTP đúng, password mạnh | 200 "Password has been updated" |
| TC-FP05 | Reset password với OTP **sai** | 422 "Invalid or expired OTP code" |
| TC-FP06 | Reset password với OTP **hết hạn** (>10 phút) | 422 "Invalid or expired OTP code" |
| TC-FP07 | Reset password mới quá yếu (`abc12345`) | 422 "Password must be at least 8 characters, including numbers..." |

> **⚠️ BUG PHÁT HIỆN — TC-FP07:**
> Validator trong `authController.js` L160 và validator trong `authValidator.js` L67 dùng **2 regex KHÁC NHAU**:
> - Controller: `/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/`
> - Validator: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/`
>
> Validator chạy **trước** controller. Nếu password pass validator nhưng fail controller regex (hoặc ngược lại), response sẽ không nhất quán. **Cần thống nhất 1 regex duy nhất.**

---

### 1.4 — Cart API

**File xử lý:** [`cartController.js`](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/controllers/cartController.js), [`cartService.js`](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/services/cartService.js)

| # | Test Case | Endpoint | Kết quả Mong đợi |
|---|---|---|---|
| TC-C01 | Thêm sản phẩm vào giỏ (không có token) | POST `/api/cart/add` | 401 "Not authorized, no token" |
| TC-C02 | Thêm sản phẩm hợp lệ vào giỏ | POST `/api/cart/add` + Bearer token | 200 + cart items |
| TC-C03 | Thêm sản phẩm **không tồn tại** (`productId` fake) | POST `/api/cart/add` | 400 "Product not found" |
| TC-C04 | Thêm sản phẩm đã có trong giỏ (quantity += n) | POST `/api/cart/add` (same productId) | 200 + quantity tăng |
| TC-C05 | Cập nhật quantity = 0 (auto-remove) | PUT `/api/cart/items/:itemId` `{"quantity":0}` | 200 + item bị xóa khỏi giỏ |
| TC-C06 | Cập nhật quantity âm | PUT `/api/cart/items/:itemId` `{"quantity":-1}` | 200 + item bị xóa (<=0 logic) |
| TC-C07 | Xóa 1 item | DELETE `/api/cart/items/:itemId` | 200 + giỏ còn lại |
| TC-C08 | Lấy giỏ hàng rỗng | GET `/api/cart` | 200 + `data: []` |

> **⚠️ BUG PHÁT HIỆN — Không kiểm tra tồn kho khi thêm vào giỏ:**
> Tại [`cartService.js` L153-176](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/services/cartService.js#L153-L176), `addToCart()` chỉ check `product exists` nhưng **không check `stock_quantity`**. User có thể thêm 9999 sản phẩm dù tồn kho = 0. Cần thêm:
> ```js
> if (product.stock_quantity !== undefined && safeQuantity > product.stock_quantity) {
>   throw new Error('Số lượng vượt quá tồn kho');
> }
> ```

---

### 1.5 — Order API

**File xử lý:** [`orderController.js`](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/controllers/orderController.js), [`orderService.js`](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/services/orderService.js)

| # | Test Case | Endpoint | Kết quả Mong đợi |
|---|---|---|---|
| TC-O01 | Checkout COD với giỏ hàng hợp lệ | POST `/api/orders/checkout` | 200 + order object |
| TC-O02 | Checkout với **giỏ hàng rỗng** | POST `/api/orders/checkout` | 400 "Cart is empty" |
| TC-O03 | Xem lịch sử đơn hàng | GET `/api/orders/history` | 200 + orders array + pagination |
| TC-O04 | Xem lịch sử lọc theo status | GET `/api/orders/history?status=pending` | 200 + chỉ orders status pending |
| TC-O05 | Hủy đơn hàng `pending` < 30 phút | PUT `/api/orders/:id/cancel` | 200 + status = `canceled` |
| TC-O06 | Hủy đơn hàng **sau 30 phút** | PUT `/api/orders/:id/cancel` | 200 + status = `cancel_requested` |
| TC-O07 | Hủy đơn đang `shipping` | PUT `/api/orders/:id/cancel` | 400 "Cannot cancel order in this status" |
| TC-O08 | Hủy đơn của người khác (userId khác) | PUT `/api/orders/:id/cancel` | 400 "Order not found" |

> **⚠️ BUG NGHIÊM TRỌNG — TC-O01 LUÔN FAIL (Order Model Mismatch):**
> Model [`Order.js` L5-7](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/models/Order.js#L5-L7) yêu cầu:
> ```js
> payment_order_id: { required: true }
> customer_id: { required: true }
> shop_id: { required: true }
> subtotal_amount: { required: true }
> total_final: { required: true }
> ```
> Nhưng [`orderService.js` L34-59](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/services/orderService.js#L34-L59) tạo order bằng **raw MongoDB** `collection.insertOne()` (bypass Mongoose), với các fields tên **khác**: `customer` thay vì `customer_id`, thiếu `payment_order_id`, thiếu `shop_id`, thiếu `subtotal_amount`. Dùng raw collection nên không có Mongoose validation nhưng **Order Schema sẽ không nhận ra documents này khi query bằng Mongoose** về sau.

---

## 🟡 GIAI ĐOẠN 2: TEST GIAO DIỆN & TÍNH NĂNG FRONTEND

### 2.1 — Swiper Hình ảnh (ProductDetail)

**File xử lý:** [`ProductDetail.jsx` L98-116](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/frontend/src/pages/ProductDetail.jsx#L98-L116)

| # | Test Case | Bước thực hiện | Kết quả Mong đợi |
|---|---|---|---|
| TC-SW01 | Swiper khởi tạo đúng | Mở trang chi tiết sản phẩm có ≥2 ảnh | Thấy arrows + pagination dots |
| TC-SW02 | Swipe sang phải/trái | Click arrow hoặc swipe | Ảnh chuyển đúng chiều |
| TC-SW03 | **Sản phẩm không có ảnh** | Mở trang SP không có media | Swiper rỗng, không crash |
| TC-SW04 | Click pagination dots | Click dot thứ 3 | Chuyển đến ảnh thứ 3 |

> **⚠️ BUG PHÁT HIỆN — TC-SW03 có thể gây lỗi:**
> Tại [`ProductDetail.jsx` L31](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/frontend/src/pages/ProductDetail.jsx#L31):
> ```js
> setSelectedImage(response.data.data.media[0].mediaUrl);
> ```
> Nếu API trả về `media[0]` là object có key `media_url` (snake_case) nhưng frontend đọc `.mediaUrl` (camelCase do `toCamelCase()`), **phải kiểm tra xem toCamelCase có convert đúng không**. Thực tế tại L106: `src={m.mediaUrl}` — nếu key là `mediaUrl` thì OK, nhưng nếu bị trả về là `mediaUrl: undefined` thì ảnh bị broken.

---

### 2.2 — Tăng/Giảm Số lượng & Tồn kho

**File xử lý:** [`ProductDetail.jsx` L52-55](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/frontend/src/pages/ProductDetail.jsx#L52-L55)

```js
const handleQuantityChange = (type) => {
  if (type === 'inc' && quantity < stock) setQuantity(q => q + 1);
  if (type === 'dec' && quantity > 1) setQuantity(q => q - 1);
};
```

| # | Test Case | Kết quả Mong đợi |
|---|---|---|
| TC-QTY01 | Nhấn "+" khi quantity < stock | quantity tăng 1 |
| TC-QTY02 | Nhấn "+" khi quantity **= stock** | Nút không phản hồi (bị block) |
| TC-QTY03 | Nhấn "-" khi quantity = 1 | Nút không phản hồi (không về 0) |
| TC-QTY04 | Nhấn "+" khi **stock = 0** | Button "Add to Cart" bị disabled (`disabled={stock <= 0}`) |
| TC-QTY05 | **Add to Cart** khi quantity > 1 | API nhận đúng quantity, giỏ cập nhật đúng |

> **✅ Logic tồn kho frontend OK** — code tại L53 đã giới hạn đúng.
>
> **⚠️ Nhưng backend KHÔNG validate** — xem Bug TC-C07 phần Cart API. Frontend block nhưng nếu gọi API trực tiếp qua Postman thì vẫn add được.

---

### 2.3 — Tìm kiếm & Lọc (Search Page)

**File xử lý:** [`Search.jsx`](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/frontend/src/pages/Search.jsx), [`publicController.js` L285-419](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/controllers/publicController.js#L285-L419)

| # | Test Case | Thao tác | Kết quả Mong đợi |
|---|---|---|---|
| TC-S01 | Tìm kiếm từ khóa | Nhập "áo" vào search box | Danh sách sản phẩm liên quan |
| TC-S02 | Lọc theo Category | Click vào category cha | Products trong category đó |
| TC-S03 | Lọc theo Sub-Category | Click vào sub-category | Products trong sub-category |
| TC-S04 | Lọc giá min/max | Nhập min=100000, max=500000, Apply | Chỉ hiện SP trong tầm giá |
| TC-S05 | Lọc giá **min > max** | min=500000, max=100000 | Cần trả về 0 kết quả (không crash) |
| TC-S06 | Kết hợp nhiều filter | Category + Price + Rating | Kết quả thỏa tất cả điều kiện |
| TC-S07 | Sort: Giá tăng dần | Chọn "Price: Low to High" | Sản phẩm rẻ nhất lên đầu |
| TC-S08 | Phân trang | Chuyển sang Page 2 | Tải 12 sản phẩm tiếp theo, URL có `?page=2` |
| TC-S09 | Clear All Filters | Nhấn "Clear All" | Về trạng thái ban đầu, fetch lại all products |
| TC-S10 | Không tìm thấy sản phẩm | q="xyzkhongtongtai" | Hiển thị "Không tìm thấy sản phẩm" |

> **⚠️ BUG PHÁT HIỆN — TC-S01 có thể FAIL nếu chưa tạo Text Index:**
> Tại [`publicController.js` L306](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/controllers/publicController.js#L306):
> ```js
> if (q) { query.$text = { $search: q }; }
> ```
> `$text search` yêu cầu MongoDB phải có **text index** trên collection `products`. Nếu chưa tạo, query sẽ throw `MongoServerError: text index required`. **Kiểm tra bằng MongoDB Compass** xem `products` collection có index text chưa.

---

### 2.4 — Redux State & Add to Cart

**File xử lý:** [`authSlice.js`](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/frontend/src/redux/authSlice.js), [`ProductDetail.jsx` L57-76](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/frontend/src/pages/ProductDetail.jsx#L57-L76)

| # | Test Case | Thao tác | Kết quả Mong đợi |
|---|---|---|---|
| TC-RX01 | Kiểm tra Redux user state sau login | Login → Redux DevTools | `state.auth.user` có data |
| TC-RX02 | Reload trang sau login | F5 sau khi login | User vẫn còn trong state (đọc từ localStorage) |
| TC-RX03 | **Add to Cart không có Redux slice riêng** | Nhấn "Add to Cart" | Dispatch `window.dispatchEvent(new Event('cartUpdated'))` — Header phải lắng nghe event này |
| TC-RX04 | Cart count trong Header cập nhật | Thêm SP vào giỏ | Badge số lượng trên icon giỏ tăng lên |
| TC-RX05 | Logout xóa state | Nhấn logout | `state.auth.user = null`, xóa localStorage, redirect /login |

> **⚠️ BUG PHÁT HIỆN — Cart không có Redux Slice:**
> Dự án **không có** `cartSlice.js` trong `redux/`. Cart state được quản lý bằng cơ chế `window.dispatchEvent(new Event('cartUpdated'))` tại [`ProductDetail.jsx` L70](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/frontend/src/pages/ProductDetail.jsx#L70) và [`Search.jsx` L131](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/frontend/src/pages/Search.jsx#L131). **Đây không phải Redux Hook** như yêu cầu dự án. Nếu giám khảo kiểm tra Redux DevTools cho Cart sẽ không thấy gì.

---

### 2.5 — Phân trang (Pagination)

Search page dùng **phân trang theo page number** (không phải lazy loading/infinite scroll).

| # | Test Case | Kết quả Mong đợi |
|---|---|---|
| TC-PG01 | Trang 1 → Trang 2 | Fetch 12 sản phẩm tiếp, URL `?page=2` |
| TC-PG02 | Nhấn Previous ở trang 1 | Nút bị disabled, không có action |
| TC-PG03 | Nhấn Next ở trang cuối | Nút bị disabled |
| TC-PG04 | **Tổng sản phẩm < 12** | Không hiển thị pagination controls |

---

## 🟢 GIAI ĐOẠN 3: TEST LUỒNG E2E (End-to-End)

### Luồng hoàn chỉnh: Từ Đăng ký → Đặt hàng → Xem lịch sử

```
[Bước 1] Mở trình duyệt → truy cập "/" → bị redirect "/login" ✅
[Bước 2] Nhấn "Chưa có tài khoản" → vào /register
[Bước 3] Điền form → nhấn "Gửi OTP" → xem mail
[Bước 4] Nhập OTP vào /verify-otp
[Bước 5] Submit → auto-login → redirect "/" (Home)
[Bước 6] Duyệt sản phẩm trên Home
[Bước 7] Click sản phẩm → /product/:slug
[Bước 8] Chọn số lượng → "Add to Cart" 
[Bước 9] Vào /cart → kiểm tra sản phẩm đã có
[Bước 10] Vào /checkout → Submit COD
[Bước 11] Vào /orders → kiểm tra đơn hàng mới
[Bước 12] Nhấn "Cancel Order"
```

| # | Bước E2E | Điều kiện kiểm tra | Status Code |
|---|---|---|---|
| E2E-01 | Truy cập `/` khi chưa login | Redirect về `/login` | App.jsx L43 ✅ |
| E2E-02 | Đăng ký + OTP + Auto-login | Redux state có user, token trong localStorage | authSlice L196-205 ✅ |
| E2E-03 | Trang Home yêu cầu đăng nhập | Chỉ hiện khi `user` có trong Redux | App.jsx L43 ✅ |
| E2E-04 | Add to Cart → Backend lưu vào DB | GET `/api/cart` → thấy item | cartService ✅ |
| E2E-05 | Checkout COD | POST `/api/orders/checkout` → 200 | Có bug — xem Giai đoạn 1 |
| E2E-06 | Giỏ bị xóa sau checkout | GET `/api/cart` → `[]` | orderService L65 ✅ |
| E2E-07 | Đơn hàng xuất hiện trong /orders | GET `/api/orders/history` | orderService ✅ |

> **⚠️ BUG NGHIÊM TRỌNG — E2E-04 đến E2E-07:**
> Trang Orders.jsx sử dụng `sessionStorage.getItem('token')` tại [**L14 và L35**](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/frontend/src/pages/Orders.jsx#L14), nhưng toàn bộ hệ thống (authSlice, ProductDetail, Search) lưu token vào `localStorage` với key `'accessToken'`. **Orders page sẽ KHÔNG BAO GIỜ có token**, luôn redirect về `/login` dù đã đăng nhập.

---

## 🔵 GIAI ĐOẠN 4: TEST EDGE CASES — LOGIC NGHIỆP VỤ

### 4.1 — Logic Hủy Đơn 30 Phút

**File xử lý:** [`orderService.js` L115-147](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/services/orderService.js#L115-L147)

```js
const timeDiff = (new Date() - createdAt) / (1000 * 60); // phút
if (timeDiff > 30) {
  newStatus = 'cancel_requested';
} else {
  newStatus = 'canceled';
}
```

**Phương pháp test can thiệp thời gian:**

#### Cách 1: Sửa trực tiếp DB (Nhanh nhất)
```js
// Dùng MongoDB Compass hoặc mongosh
db.orders.updateOne(
  { order_code: "ORD123456" },
  { $set: { createdAt: new Date(Date.now() - 31 * 60 * 1000) } }
)
// Sau đó gọi PUT /api/orders/:id/cancel
// Expected: status = "cancel_requested"
```

#### Cách 2: Mock thời gian trong Jest
```js
// Trong test file:
jest.useFakeTimers();
jest.setSystemTime(new Date(order.createdAt).getTime() + 31 * 60 * 1000);
await cancelOrder(userId, orderId);
// Expect status = 'cancel_requested'
jest.useRealTimers();
```

#### Cách 3: Thêm env variable `CANCEL_THRESHOLD_MINUTES`
Thay hardcode `30` bằng `process.env.CANCEL_THRESHOLD_MINUTES || 30`, set `.env` về `1` để test nhanh.

| # | Test Case | Cách can thiệp | Kết quả Mong đợi |
|---|---|---|---|
| TC-CL01 | Hủy đơn **trong** 30 phút | Đặt hàng và hủy ngay | `status = "canceled"` |
| TC-CL02 | Hủy đơn **đúng** 30 phút | DB: set createdAt = now - 30m | **Boundary test** — `timeDiff = 30`, condition là `> 30` → `status = "canceled"` (biên = OK) |
| TC-CL03 | Hủy đơn **31 phút** sau đặt | DB: set createdAt = now - 31m | `status = "cancel_requested"` |
| TC-CL04 | Frontend hiển thị đúng nút | Order status `preparing` hoặc `>30m` | Nút đổi thành "Gửi yêu cầu hủy" |

> **⚠️ BUG PHÁT HIỆN — TC-CL04 Frontend KHÔNG đúng spec:**
> Tại [`Orders.jsx` L87-91](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/frontend/src/pages/Orders.jsx#L87-L91):
> ```jsx
> {(order.status === 'pending' || order.status === 'confirmed') && (
>   <button>Cancel Order</button>
> )}
> ```
> Theo yêu cầu, khi đơn sang **"Đang chuẩn bị hàng" (preparing)**, nút phải chuyển thành **"Gửi yêu cầu hủy đơn cho shop"**. Hiện tại code **không hiển thị nút gì** khi status = `preparing`. Cần sửa thành:
> ```jsx
> {order.status === 'preparing' && (
>   <button>Gửi yêu cầu hủy đơn cho shop</button>
> )}
> ```

---

### 4.2 — Logic Tự động "Đã xác nhận" sau 30 phút

> **❌ THIẾU HOÀN TOÀN — Không tìm thấy code implement:**
> Yêu cầu: Sau 30 phút đặt hàng (status = pending), tự động chuyển sang `confirmed`.
> 
> Quét toàn bộ `/src/services/` và `/src/controllers/` — **KHÔNG có cron job, scheduler, hay setTimeout** nào implement logic này. Cần implement bằng:

**Cách triển khai đề xuất:**
```js
// src/jobs/orderAutoConfirm.js
const cron = require('node-cron');
const mongoose = require('mongoose');

// Chạy mỗi 5 phút
cron.schedule('*/5 * * * *', async () => {
  const collection = mongoose.connection.db.collection('orders');
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  await collection.updateMany(
    { 
      status: 'pending', 
      createdAt: { $lte: thirtyMinAgo } 
    },
    { 
      $set: { status: 'confirmed', updatedAt: new Date() },
      $push: { 
        history: { 
          _id: new mongoose.Types.ObjectId(),
          status: 'confirmed', 
          note: 'Tự động xác nhận sau 30 phút',
          created_at: new Date() 
        } 
      }
    }
  );
});
```

**Phương pháp test khi đã implement:**
```
1. Đặt đơn hàng → status = "pending"
2. Sửa DB: createdAt = now - 31 phút
3. Đợi cron chạy (hoặc trigger thủ công)
4. GET /api/orders/history → status phải = "confirmed"
```

---

## 🚨 BẢNG TỔNG HỢP BUG & RỦI RO

| Mức độ | # | Vị trí | Vấn đề | Ảnh hưởng |
|---|---|---|---|---|
| 🔴 **CRITICAL** | BUG-01 | `Orders.jsx` L14, L35 | Dùng `sessionStorage.getItem('token')` trong khi toàn hệ thống dùng `localStorage.getItem('accessToken')` | Trang Orders **LUÔN redirect login**, không hoạt động |
| 🔴 **CRITICAL** | BUG-02 | Feature thiếu | Không có cron job tự động confirm đơn sau 30 phút | Yêu cầu nghiệp vụ không được fulfill |
| 🔴 **CRITICAL** | BUG-03 | `Orders.jsx` L87 | Không hiển thị nút "Gửi yêu cầu hủy" khi status = `preparing` | Logic UI hủy đơn không đúng spec |
| 🟠 **HIGH** | BUG-04 | `orderService.js` L34-59 | Order được tạo bằng raw MongoDB, fields không khớp Order Schema (customer vs customer_id, thiếu shop_id, payment_order_id) | Sẽ fail khi query bằng Mongoose Order model |
| 🟠 **HIGH** | BUG-05 | `cartService.js` L159-160 | Không validate stock khi addToCart | User có thể đặt quá tồn kho |
| 🟡 **MEDIUM** | BUG-06 | `authController.js` L160, `authValidator.js` L67 | 2 regex password khác nhau cho reset password | Hành vi validation không nhất quán |
| 🟡 **MEDIUM** | BUG-07 | `ProductDetail.jsx` L31, 106 | `media[0].mediaUrl` có thể undefined nếu camelCase conversion fail | Ảnh sản phẩm bị broken |
| 🟡 **MEDIUM** | BUG-08 | `publicController.js` L306 | `$text search` cần MongoDB Text Index | Search keyword luôn throw error nếu chưa tạo index |
| 🟢 **LOW** | BUG-09 | `authService.js` L208-213 | registerUser không filter `expired_at` trong query | Code đúng nhưng khó đọc, dễ gây nhầm lẫn khi maintain |
| 🟢 **LOW** | BUG-10 | Toàn frontend | Không có `cartSlice.js` trong Redux | Cart state dùng DOM events thay vì Redux Hook theo yêu cầu |

---

## ✅ CHECKLIST TEST NHANH (Dành cho buổi demo)

```
AUTH:
[ ] Gửi OTP → nhận mail
[ ] Nhập OTP đúng → đăng ký thành công → auto login
[ ] Đăng nhập user → redirect /user/profile
[ ] Đăng nhập admin → redirect /admin/profile
[ ] Quên mật khẩu → OTP mail → reset thành công
[ ] Rate limit: Gửi OTP 6 lần → bị block lần 6

PRODUCT:
[ ] Trang chủ hiện banner, flash deals, new arrivals, best sellers
[ ] Trang chi tiết: Swiper ảnh, tồn kho, sold, breadcrumb
[ ] Tăng giảm số lượng: không vượt quá stock
[ ] Tìm kiếm: kết quả hiện đúng

CART & ORDER:
[ ] Add to Cart → giỏ cập nhật (kiểm tra Header badge)
[ ] Xem /cart → sản phẩm đúng
[ ] Checkout → đơn hàng tạo thành công
[ ] /orders → thấy đơn hàng (sau khi fix BUG-01!)
[ ] Hủy đơn < 30 phút → status = canceled
[ ] Hủy đơn > 30 phút → status = cancel_requested
```

---

*Tài liệu được tạo bằng phân tích source code thực tế — Phiên bản 1.0 — 30/05/2026*
