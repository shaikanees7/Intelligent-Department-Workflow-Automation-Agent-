const ApiResponse = require('../utils/apiResponse');

const validateRequestSubmission = (req, res, next) => {
  const { request_type, reason, start_date, end_date } = req.body;
  if (!request_type || !reason || !start_date || !end_date) {
    return ApiResponse.error(res, 'Missing required fields: request_type, reason, start_date, end_date', null, 400);
  }
  if (new Date(start_date) > new Date(end_date)) {
    return ApiResponse.error(res, 'Start date cannot be after end date.', null, 400);
  }
  next();
};

module.exports = { validateRequestSubmission };
