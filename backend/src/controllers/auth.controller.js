const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtConfig = require('../config/jwt.config');
const ApiResponse = require('../utils/apiResponse');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return ApiResponse.error(res, 'Email and password are required', null, 400);
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return ApiResponse.error(res, 'Invalid credentials', null, 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return ApiResponse.error(res, 'Invalid credentials', null, 401);
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role, departmentId: user.department_id },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    return ApiResponse.success(res, 'Login successful', {
      token,
      user: {
        userId: user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        departmentId: user.department_id
      }
    });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    return ApiResponse.success(res, 'Profile retrieved', user);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getProfile };
