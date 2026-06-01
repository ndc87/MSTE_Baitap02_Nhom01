const response = require('../utils/response');

/**
 * Middleware to authorize specific roles.
 * Usage: router.get('/path', verifyToken, authorize('admin', 'manager'), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return response.error(res, {
        statusCode: 403,
        message: 'Access denied. You do not have permission to perform this action.'
      });
    }
    next();
  };
};

module.exports = authorize;
