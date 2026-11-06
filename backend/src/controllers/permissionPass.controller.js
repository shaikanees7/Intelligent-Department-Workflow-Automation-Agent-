const PassGeneratorService = require('../services/passGenerator.service');
const ApiResponse = require('../utils/apiResponse');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');

/**
 * Helper to optionally extract user from Authorization header if present
 */
const getOptionalUser = (req) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch (e) {
      return null;
    }
  }
  return null;
};

/**
 * Get authenticated student's permissions and generated passes
 */
const getMyPermissions = async (req, res, next) => {
  try {
    const studentUserId = req.user.userId;
    const result = await PassGeneratorService.getStudentPermissions(studentUserId);
    return ApiResponse.success(res, 'Student permissions and passes retrieved successfully.', result);
  } catch (err) {
    next(err);
  }
};

/**
 * Get specific pass details for viewing or printing
 */
const getPassDetails = async (req, res, next) => {
  try {
    const { passReferenceOrId } = req.params;
    const pass = await PassGeneratorService.getPassDetails(passReferenceOrId, req.user);
    if (!pass) {
      return ApiResponse.error(res, 'Digital permission pass not found.', null, 404);
    }
    return ApiResponse.success(res, 'Pass details retrieved successfully.', pass);
  } catch (err) {
    if (err.message.includes('Unauthorized access')) {
      return ApiResponse.error(res, err.message, null, 403);
    }
    next(err);
  }
};

/**
 * Real-time Pass Verification (QR scanner or direct URL hit)
 * POST /api/permission-passes/verify
 * GET /api/permission-passes/verify
 */
const verifyPass = async (req, res, next) => {
  try {
    const passReference = req.body.pass_reference || req.query.ref || req.params.ref;
    const token = req.body.token || req.query.token;

    // Check if the scanner is an authenticated staff member
    let scannedByUser = req.user;
    if (!scannedByUser) {
      scannedByUser = getOptionalUser(req);
    }

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const result = await PassGeneratorService.verifyPass({
      passReference,
      token,
      scannedByUser,
      ipAddress
    });

    const statusCode = result.status === 'APPROVED AND VALID' ? 200 : 200; // Return 200 with clear status structure
    return ApiResponse.success(res, result.message, result, statusCode);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin Pass Management: List passes with filters and pagination
 */
const listAdminPasses = async (req, res, next) => {
  try {
    const { search, department_id, category, status, page, limit } = req.query;
    const result = await PassGeneratorService.listAdminPasses({
      search,
      departmentId: department_id,
      category,
      status,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15
    });
    return ApiResponse.success(res, 'Admin passes retrieved successfully.', result);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin Pass Revocation
 */
const revokePass = async (req, res, next) => {
  try {
    const { passId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return ApiResponse.error(res, 'A valid revocation reason is mandatory.', null, 400);
    }

    const result = await PassGeneratorService.revokePass({
      passId,
      adminUserId: req.user.userId,
      reason
    });

    return ApiResponse.success(res, 'Digital permission pass has been successfully revoked.', result);
  } catch (err) {
    if (err.message.includes('mandatory') || err.message.includes('not found') || err.message.includes('already revoked')) {
      return ApiResponse.error(res, err.message, null, 400);
    }
    next(err);
  }
};

/**
 * Scan Analytics
 */
const getScanAnalytics = async (req, res, next) => {
  try {
    const analytics = await PassGeneratorService.getScanAnalytics();
    return ApiResponse.success(res, 'Scan analytics retrieved successfully.', analytics);
  } catch (err) {
    next(err);
  }
};

/**
 * Pass Scan History
 */
const getPassScanHistory = async (req, res, next) => {
  try {
    const { passId } = req.params;
    const history = await PassGeneratorService.getPassScanHistory(passId);
    return ApiResponse.success(res, 'Pass scan history retrieved successfully.', history);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyPermissions,
  getPassDetails,
  verifyPass,
  listAdminPasses,
  revokePass,
  getScanAnalytics,
  getPassScanHistory
};
