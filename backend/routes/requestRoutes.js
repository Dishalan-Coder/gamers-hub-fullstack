const express = require('express');
const { createRequestFromCart, getMyRequests, getAllRequests, updateRequestStatus } = require('../controllers/requestController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, requireRole('user'), createRequestFromCart);
router.get('/my', protect, requireRole('user'), getMyRequests);
router.get('/', protect, requireRole('admin'), getAllRequests);
router.put('/:id/status', protect, requireRole('admin'), updateRequestStatus);

module.exports = router;
