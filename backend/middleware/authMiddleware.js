const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { fail } = require('../utils/response');

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return fail(res, 'Access denied. Token missing', 401);
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');

    const [rows] = await pool.query(
      'SELECT id, name, email, phone, profile_image, role, status FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) return fail(res, 'Invalid token user', 401);
    if (rows[0].status !== 'active') return fail(res, 'Account is not active', 403);

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') return fail(res, 'JWT token expired. Please login again', 401);
    return fail(res, 'Invalid JWT token', 401);
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return fail(res, 'You are not allowed to access this resource', 403);
  }
  next();
};

module.exports = { protect, requireRole };
