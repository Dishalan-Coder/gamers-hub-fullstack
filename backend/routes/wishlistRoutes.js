const express = require('express');
const { getWishlist, addToWishlist, removeWishlistItem } = require('../controllers/wishlistController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, requireRole('user'));
router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:id', removeWishlistItem);

module.exports = router;
