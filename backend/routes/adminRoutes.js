const express = require('express');
const { getDashboardStats, getUsers, updateUserStatus } = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, requireRole('admin'));
router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);

module.exports = router;
