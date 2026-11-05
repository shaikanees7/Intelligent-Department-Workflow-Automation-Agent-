const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');
const ApiResponse = require('../utils/apiResponse');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.error(res, 'Access denied. No authorization token provided.', null, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (err) {
    return ApiResponse.error(res, 'Invalid or expired session token.', null, 401);
  }
};

module.exports = { verifyToken };
