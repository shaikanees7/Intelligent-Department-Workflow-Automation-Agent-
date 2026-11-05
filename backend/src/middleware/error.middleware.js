const logger = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, path: req.path });
  const status = err.status || 500;
  return ApiResponse.error(res, err.message || 'Internal Server Error', null, status);
};

module.exports = { errorHandler };
