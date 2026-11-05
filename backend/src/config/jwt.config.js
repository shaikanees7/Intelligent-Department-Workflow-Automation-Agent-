module.exports = {
  secret: process.env.JWT_SECRET || 'workflow_secret_2026',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h'
};
