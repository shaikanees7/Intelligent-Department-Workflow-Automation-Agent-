const ApiResponse = require('../utils/apiResponse');

const validateRequestSubmission = (req, res, next) => {
  // Default request_type if not supplied so the AI routing engine dynamically handles categorization
  req.body.request_type = req.body.request_type || 'OD';
  const { reason, start_date, end_date } = req.body;
  if (!reason || !start_date || !end_date) {
    return ApiResponse.error(res, 'Missing required fields: reason, start_date, end_date', null, 400);
  }
  if (new Date(start_date) > new Date(end_date)) {
    return ApiResponse.error(res, 'Start date cannot be after end date.', null, 400);
  }
  next();
};

module.exports = { validateRequestSubmission };
