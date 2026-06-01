# 📋 Kế Hoạch Tiếp Tục — UTEShop API Testing

> **Lưu ý:** Tài liệu này tóm tắt toàn bộ công việc đã làm và các bước cần thực hiện khi bạn quay lại.

---

## ✅ Những gì đã hoàn thành

### Bugs đã fix (trong code)
| Bug | File | Trạng thái |
|---|---|---|
| BUG-FP01 — `reset-password` sai field name | `authController.js` | ✅ Fixed |
| BUG-C01 — Không check stock khi add to cart | `cartService.js` | ✅ Fixed |
| BUG-O01 — Checkout bypass Mongoose Schema | `orderService.js` | ✅ Fixed |
| TC-R04 — `sendOTP` không trả 422 khi email đã tồn tại | `authController.js` | ✅ Fixed |
| TC-L02 — admin@example.com thiếu role admin | `seed.js` | ✅ Fixed |
| TC-O01 — Checkout không trả 201 | `orderController.js` | ✅ Fixed |
| TC-O06 — Thiếu route `GET /api/orders/:orderId` | `orderRoutes.js` + `orderController.js` + `orderService.js` | ✅ Fixed |
| TC-C03 — Không validate số lượng âm | `cartController.js` | ✅ Fixed |
| DB — Thiếu tài khoản test | `seed.js` | ✅ Fixed |

### Tài khoản test có trong DB
| Email | Password | Role | Status |
|---|---|---|---|
| `user@example.com` | `User@123` | customer | active |
| `admin@example.com` | `Admin@123` | **admin** | active |
| `testuser@example.com` | `User@123` | customer | active |
| `inactive@example.com` | `User@123` | customer | inactive |
| `locked@example.com` | `User@123` | customer | locked |

---

## 🚀 Bước đầu tiên khi quay lại: Khởi động server

Mở **2 terminal** và chạy:

```bash
# Terminal 1 — Backend (port 5000)
cd d:\caccongnghephanmememoi\Cuong\DuyCuong\MSTE_Baitapcanhan
npm run dev

# Terminal 2 — Frontend (port 5173)
cd d:\caccongnghephanmememoi\Cuong\DuyCuong\MSTE_Baitapcanhan\frontend
npm run dev
```

---

## 🧪 Thứ tự chạy test Postman

### Bước 1 — Auth Register Tests
Chạy collection **1.1 Auth Register Tests**
- TC-R01 → TC-R05 (dùng `pm.sendRequest()` thay `axios` cho TC-R05)
- ⚠️ Sau khi TC-R01 pass → lưu `accessToken` vào env

### Bước 2 — Login & JWT Tests
Chạy collection **1.2 Login & JWT Tests**
- TC-L01 trước tiên → lưu `accessToken` + `refreshToken` vào env
- Sau khi TC-L01 pass mới chạy TC-L08

### Bước 3 — Forgot/Reset Password Tests
Chạy collection **1.3 Forgot/Reset Password Tests**
- TC-FP01 trước → nhận OTP qua email → set `{{resetOTP}}` vào env
- Rồi mới chạy TC-FP04 (dùng `{{resetOTP}}`)

### Bước 4 — Cart API Tests
Chạy collection **1.4 Cart API Tests**
- TC-C01 trước → set `{{cartItemId}}` vào env từ response
- Thứ tự: C01 → C04 → C05 → C06 → C07 → C08

### Bước 5 — Order API Tests
Chạy collection **1.5 Order API Tests**
- Đảm bảo giỏ hàng không trống trước khi chạy TC-O01
- TC-O01 (checkout) → lưu `{{orderId}}` vào env
- Rồi chạy TC-O06 (GET /api/orders/{{orderId}}) và TC-O08 (cancel)

---

## ⚠️ Lỗi còn lại cần xử lý phía Postman (không phải code)

| Vấn đề | TC ảnh hưởng | Cách xử lý |
|---|---|---|
| **TC-R05**: `require('axios')` không hoạt động trong Postman Sandbox | TC-R05 | Thay bằng `pm.sendRequest()` trong pre-request script |
| **Cart assertions mismatch**: Postman test script expect cấu trúc response cũ | TC-C01, C06, C07, C08 | Cập nhật assertions trong Postman để khớp response format mới |
| **Rate limit 429**: Nếu bị rate limit khi chạy test | FP01, FP02 | Nhờ AI reset backend server (kill + restart `npm run dev`) |

---

## 📁 Các file quan trọng đã sửa

- [`authController.js`](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/controllers/authController.js) — sendOTP, resetPassword
- [`cartController.js`](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/controllers/cartController.js) — validation số lượng
- [`cartService.js`](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/services/cartService.js) — stock check
- [`orderController.js`](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/controllers/orderController.js) — getOrderById, checkout 201
- [`orderRoutes.js`](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/routes/orderRoutes.js) — thêm GET /:orderId
- [`orderService.js`](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/src/services/orderService.js) — Mongoose Schema, getOrderById
- [`seed.js`](file:///d:/caccongnghephanmememoi/Cuong/DuyCuong/MSTE_Baitapcanhan/scripts/seed.js) — tài khoản test đầy đủ

---

*Cập nhật lần cuối: 2026-05-31 14:03*
