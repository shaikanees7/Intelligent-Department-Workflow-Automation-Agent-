const ApiResponse = require('../utils/apiResponse');

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Forbidden: Role '${req.user ? req.user.role : 'Guest'}' lacks access permission.`,
        null,
        403
      );
    }
    next();
  };
};

module.exports = { requireRole };
