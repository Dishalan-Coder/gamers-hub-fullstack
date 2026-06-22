const { pool } = require('../config/db');
const { success, fail } = require('../utils/response');

const getDashboardStats = async (req, res) => {
  try {
    const [[users]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'user'");
    const [[products]] = await pool.query("SELECT COUNT(*) AS count FROM products WHERE status = 'active'");
    const [[requests]] = await pool.query('SELECT COUNT(*) AS count FROM product_requests');
    const [[pending]] = await pool.query("SELECT COUNT(*) AS count FROM product_requests WHERE status = 'pending'");
    const [[accepted]] = await pool.query("SELECT COUNT(*) AS count FROM product_requests WHERE status = 'accepted'");
    const [[rejected]] = await pool.query("SELECT COUNT(*) AS count FROM product_requests WHERE status = 'rejected'");
    const [[banned]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE status = 'banned'");
    return success(res, 'Dashboard statistics loaded', {
      users: users.count,
      products: products.count,
      requests: requests.count,
      pending: pending.count,
      accepted: accepted.count,
      rejected: rejected.count,
      banned: banned.count,
    });
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to load dashboard statistics', 500);
  }
};

const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, phone, role, status, created_at FROM users ORDER BY created_at DESC');
    return success(res, 'Users loaded', { users });
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to load users', 500);
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'banned'].includes(status)) return fail(res, 'Status must be active or banned', 400);
    const [result] = await pool.query("UPDATE users SET status = ? WHERE id = ? AND role = 'user'", [status, req.params.id]);
    if (result.affectedRows === 0) return fail(res, 'User not found', 404);
    return success(res, `User ${status} successfully`);
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to update user status', 500);
  }
};

module.exports = { getDashboardStats, getUsers, updateUserStatus };
