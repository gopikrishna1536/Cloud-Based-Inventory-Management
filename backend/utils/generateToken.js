const jwt = require('jsonwebtoken');

const generateToken = (id, role, organizationId) => {
  return jwt.sign(
    { id, role, organizationId },
    process.env.JWT_SECRET || 'stockcloud_secure_super_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

module.exports = generateToken;
