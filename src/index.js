require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const requestId = require('./middleware/requestId');
const rateLimit = require('express-rate-limit');

const app = express();

// Rate Limiting
// Chỉ áp dụng cho public routes (không cần auth) để chống bot/spam
// Các route đã xác thực (cart, orders, user) không cần rate limit theo IP
// vì đã được bảo vệ bởi JWT token
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: process.env.NODE_ENV === 'production' ? 200 : 1000, // Thoải mái hơn, đặc biệt khi dev
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Bỏ qua rate limit nếu request đã có JWT (người dùng đã đăng nhập)
    const authHeader = req.headers['authorization'];
    const token = req.cookies?.accessToken || (authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7));
    return !!token;
  },
  message: {
    success: false,
    code: 429,
    message: 'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau 15 phút',
    timestamp: Math.floor(Date.now() / 1000)
  }
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true })); // Cho phép gửi cookie từ frontend
app.use(morgan('dev'));
app.use(requestId);
app.use('/api', publicLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/manage', require('./routes/admin.routes')); // NEW ADMIN FEATURES
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    code: statusCode,
    message: err.message || 'Internal Server Error',
    data: null,
    errors: err.errors || null,
    requestId: req.id,
    timestamp: Math.floor(Date.now() / 1000)
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
