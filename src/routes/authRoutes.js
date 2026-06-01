const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validator');
const { registrationRules, sendOTPRules, loginRules, forgotPasswordRules, resetPasswordRules, profileUpdateRules } = require('../middleware/authValidator');
const { upload } = require('../config/cloudinary');
const { loginLimiter } = require('../middleware/rateLimiter');
const rateLimit = require('express-rate-limit');

const { protect } = require('../middleware/authMiddleware');

// Additional rate limiters
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many registration attempts, please try again later' }
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many OTP requests, please try again later' }
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many password reset requests, please try again later' }
});

// Đăng ký
router.post(
  '/register/send-otp', 
  otpLimiter,
  sendOTPRules(), 
  validate, 
  authController.sendOTP
);

router.post(
  '/register', 
  registerLimiter,
  registrationRules(), 
  validate, 
  authController.register
);

// Login
router.post('/login', loginLimiter, loginRules(), validate, authController.login);

// Quên mật khẩu
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordRules(), validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordRules(), validate, authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// Profile
router.put('/profile', protect, profileUpdateRules(), validate, authController.updateProfile);
router.post('/profile/avatar', protect, upload.single('avatar'), authController.uploadAvatar);

// Social Login
router.post('/google', authController.googleLogin);

// DEV ONLY - Get latest OTP for testing (blocked in production)
router.get('/dev/get-otp', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Not available in production' });
  }
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'email query parameter is required' });
    }
    const OTP = require('../models/OTP');
    const otpRecord = await OTP.findOne(
      { email, otp_type: 'reset_password', is_verified: false },
      null,
      { sort: { createdAt: -1 } }
    );
    if (!otpRecord) {
      return res.status(404).json({ success: false, message: 'No OTP found for this email' });
    }
    return res.json({ success: true, otp: otpRecord.otp_code, expired_at: otpRecord.expired_at });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
