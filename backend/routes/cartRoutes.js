const express = require('express');
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, requireRole('user'));
router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeCartItem);
router.delete('/', clearCart);

module.exports = router;
