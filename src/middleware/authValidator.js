const { body } = require('express-validator');

const registrationRules = () => {
  return [
    body('full_name')
      .notEmpty().withMessage('Full name is required')
      .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('Password must include uppercase, lowercase, numbers, and special characters'),
    
    body('otp_code')
      .notEmpty().withMessage('OTP code is required')
      .isLength({ min: 6, max: 6 }).withMessage('OTP code must be exactly 6 digits')
      .isNumeric().withMessage('OTP code must be numeric')
  ];
};

const sendOTPRules = () => {
  return [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
  ];
};

const loginRules = () => {
  return [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password is incorrect')
  ];
};

const forgotPasswordRules = () => {
  return [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
  ];
};

const resetPasswordRules = () => {
  return [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    
    body('otp_code')
      .notEmpty().withMessage('OTP code is required')
      .isLength({ min: 6, max: 6 }).withMessage('OTP code must be exactly 6 digits'),
    
    body('new_password')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('Password must include uppercase, lowercase, numbers, and special characters')
  ];
};

const checkoutRules = () => {
  return [
    body('addressId')
      .notEmpty().withMessage('Address ID is required'),
    
    body('paymentMethod')
      .notEmpty().withMessage('Payment method is required')
      .isIn(['cod']).withMessage('Invalid payment method')
  ];
};

const profileUpdateRules = () => {
  return [
    body('fullName')
      .optional({ checkFalsy: true })
      .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    
    body('phone')
      .optional({ checkFalsy: true })
      .matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/)
      .withMessage('Invalid Vietnamese phone number format'),
    
    body('dob')
      .optional({ checkFalsy: true })
      .isISO8601().withMessage('Invalid date format'),
    
    body('gender')
      .optional({ checkFalsy: true })
      .isIn(['male', 'female', 'other']).withMessage('Invalid gender')
  ];
};

module.exports = {
  registrationRules,
  sendOTPRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  checkoutRules,
  profileUpdateRules
};
