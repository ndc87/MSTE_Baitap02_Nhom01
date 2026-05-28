# 🎯 QUICK REFERENCE - UTEShop API Endpoints

## 📍 Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentication Endpoints

### Register - Send OTP
```bash
POST /auth/register/send-otp
Content-Type: application/json

{
  "email": "test@student.hcmute.edu.vn"
}

Response (200):
{
  "success": true,
  "message": "OTP has been sent to your email"
}
```
**Rate Limited**: 5 requests per 15 minutes

### Register - Create Account
```bash
POST /auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "test@student.hcmute.edu.vn",
  "password": "SecurePass123!@",
  "otp_code": "123456"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "...",
    "full_name": "John Doe",
    "email": "test@student.hcmute.edu.vn",
    "role": "customer"
  }
}
```
**Rate Limited**: 5 attempts per 15 minutes

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "test@student.hcmute.edu.vn",
  "password": "SecurePass123!@"
}

Response (200):
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "full_name": "John Doe",
      "email": "test@student.hcmute.edu.vn",
      "role": "customer"
    },
    "redirectUrl": "/user/profile"
  }
}

Cookie set:
refreshToken=... (httpOnly, Secure, SameSite=Strict, 7 days)
```
**Rate Limited**: 10 attempts per 15 minutes

### Forgot Password - Send OTP
```bash
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "test@student.hcmute.edu.vn"
}

Response (200):
{
  "success": true,
  "message": "OTP has been sent to your email"
}
```
**Rate Limited**: 3 attempts per 30 minutes

### Reset Password
```bash
POST /auth/reset-password
Content-Type: application/json

{
  "email": "test@student.hcmute.edu.vn",
  "otp_code": "123456",
  "new_password": "NewSecurePass123!@"
}

Response (200):
{
  "success": true,
  "message": "Password reset successful"
}
```

### Refresh Token
```bash
POST /auth/refresh-token
Content-Type: application/json

Response (200):
{
  "success": true,
  "data": {
    "token": "new_access_token..."
  }
}
```

---

## 👤 User Endpoints

### Get Profile
```bash
GET /users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

Response (200):
{
  "success": true,
  "data": {
    "id": "...",
    "full_name": "John Doe",
    "email": "test@student.hcmute.edu.vn",
    "phone": "0901234567",
    "avatar_url": "...",
    "role": "customer",
    "status": "active",
    "coin_balance": 100
  }
}
```

### Update Profile
```bash
PUT /users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "fullName": "Jane Doe",
  "phone": "0901234567",
  "dob": "1990-01-01",
  "gender": "female"
}

Response (200):
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### Upload Avatar
```bash
POST /auth/profile/avatar
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- avatar: <image_file>

Response (200):
{
  "success": true,
  "data": {
    "avatar_url": "https://..."
  }
}
```

---

## 👨‍💼 Admin Endpoints (Admin Role Only)

### Get Admin Profile
```bash
GET /admin/profile
Authorization: Bearer <access_token>
Content-Type: application/json

Response (200):
{
  "success": true,
  "data": {
    "id": "...",
    "full_name": "Admin User",
    "email": "admin@uteshop.com",
    "role": "admin"
  }
}
```
**Requires**: `user.role === 'admin'`

### Update Admin Settings
```bash
PUT /admin/settings
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "full_name": "Updated Admin Name",
  "phone": "0901234567"
}

Response (200):
{
  "success": true,
  "message": "Settings updated"
}
```

### Get Dashboard Stats
```bash
GET /admin/dashboard-stats
Authorization: Bearer <access_token>
Content-Type: application/json

Response (200):
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "activeUsers": 145,
    "pendingUsers": 5
  }
}
```

---

## 🛒 Cart Endpoints

### Get Cart
```bash
GET /cart
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": [
    {
      "product_id": "...",
      "quantity": 2,
      "product_name": "Product Name",
      "selling_price": 100000
    }
  ]
}
```

### Add to Cart
```bash
POST /cart/add
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "product_id": "...",
  "quantity": 1
}

Response (200):
{
  "success": true,
  "message": "Item added to cart"
}
```

### Remove from Cart
```bash
DELETE /cart/remove/:product_id
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "message": "Item removed from cart"
}
```

### Clear Cart
```bash
DELETE /cart/clear
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "message": "Cart cleared"
}
```

---

## 📦 Product Endpoints

### Get Products
```bash
GET /public/products?page=1&limit=10&category=electronics&priceMin=0&priceMax=1000000

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Product Name",
      "base_price": 100000,
      "selling_price": 80000,
      "rating": 4.5,
      "sold_count": 50,
      "base_quantity": 100,
      "description": "...",
      "product_images": [...]
    }
  ],
  "pagination": {
    "total": 500,
    "page": 1,
    "limit": 10,
    "totalPages": 50
  }
}
```

### Get Product Detail
```bash
GET /public/products/:id

Response (200):
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Product Name",
    "description": "...",
    "base_price": 100000,
    "selling_price": 80000,
    "rating": 4.5,
    "sold_count": 50,
    "base_quantity": 100,
    "category": "electronics",
    "product_images": [...],
    "related_products": [...]
  }
}
```

### Search Products
```bash
GET /public/products/search?query=laptop&page=1&limit=10

Response (200):
{
  "success": true,
  "data": [...]
}
```

### Get Homepage Data
```bash
GET /public/homepage

Response (200):
{
  "success": true,
  "data": {
    "bestSellers": [...],
    "recentProducts": [...],
    "topViewed": [...]
  }
}
```

---

## 🛍️ Order Endpoints

### Checkout (COD)
```bash
POST /orders/checkout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "addressId": "...",
  "paymentMethod": "cod"
}

Response (201):
{
  "success": true,
  "data": {
    "order_code": "ORD123456",
    "status": "pending",
    "total_final": 500000,
    "items": [...]
  }
}
```
**Rate Limited**: Applied via global limiter (100/15min)

### Get Order History
```bash
GET /orders?page=1&limit=10
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "...",
      "orderCode": "ORD123456",
      "status": "confirmed",
      "totalFinal": 500000,
      "createdAt": "2024-01-15T10:30:00Z",
      "items": [...]
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "totalPages": 1
  }
}
```

### Cancel Order
```bash
POST /orders/cancel/:orderId
Authorization: Bearer <access_token>
Content-Type: application/json

Response (200):
{
  "success": true,
  "data": {
    "order_code": "ORD123456",
    "status": "canceled",  // or "cancel_requested" if >30 min
    "message": "Order canceled" // or "Cancel request submitted"
  }
}
```

**Cancellation Rules**:
- If < 30 minutes from creation: `status = 'canceled'` ✅ (auto-cancel)
- If > 30 minutes from creation: `status = 'cancel_requested'` ⏳ (requires approval)

---

## 📊 Order Status Workflow

```
pending (0 min)
  ↓ [Customer confirms or auto after 5 min]
confirmed (5 min)
  ↓ [Shop prepares items]
preparing (15 min) ← [Can cancel with request if >30 min]
  ↓ [Courier picks up]
shipping (ready)
  ↓ [Delivery in progress]
delivered (final)
  └─ ✅ Order complete

[At any point before shipping]
  └─ canceled ✅ (if <30 min from creation)
  └─ cancel_requested ⏳ (if >30 min, needs approval)
```

---

## 🔴 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid input",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid credentials",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin only.",
  "statusCode": 403
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "statusCode": 429
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "statusCode": 500
}
```

---

## 🔑 Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (@$!%*?&)

**Valid Example**: `SecurePass123!@`

---

## 📱 Authentication Headers

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

Example:
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json"
```

---

## ⏱️ Rate Limit Headers

Response includes:
```
RateLimit-Limit: 10
RateLimit-Remaining: 9
RateLimit-Reset: 1642252800
```

---

## 🛠️ Useful Test Credentials

**Customer User**:
- Email: `customer@student.hcmute.edu.vn`
- Password: `TestPass123!@`

**Admin User** (if exists):
- Email: `admin@uteshop.com`
- Password: `AdminPass123!@`

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| Rate limit exceeded | Wait for the reset time (check RateLimit-Reset header) |
| Invalid token | Re-login and get new token |
| Admin routes returning 403 | Ensure user has `role: 'admin'` in database |
| Cart not persisting | Check MongoDB connection |
| Email not received | Check SMTP config in `.env` |

---

**Last Updated**: Advanced Implementation Session\
**API Version**: v1.0\
**Status**: Production Ready ✅
