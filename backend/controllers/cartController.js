const { pool } = require('../config/db');
const { success, fail } = require('../utils/response');

const getCart = async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.stock, p.image_url, p.category,
              (c.quantity * p.price) AS subtotal
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ? AND p.status = 'active'
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    return success(res, 'Cart loaded', { items, total });
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to load cart', 500);
  }
};

const addToCart = async (req, res) => {
  try {
    const productId = Number(req.body.product_id);
    const quantity = Number(req.body.quantity || 1);
    const errors = {};

    if (!productId) errors.product_id = 'Product is required';
    if (!Number.isInteger(quantity) || quantity <= 0) errors.quantity = 'Quantity must be greater than 0';
    if (Object.keys(errors).length > 0) return fail(res, 'Validation failed', 400, errors);

    const [products] = await pool.query('SELECT id, stock FROM products WHERE id = ? AND status = ?', [productId, 'active']);
    if (products.length === 0) return fail(res, 'Product not found', 404);
    if (quantity > products[0].stock) return fail(res, 'Requested quantity is higher than available stock', 400);

    const [existing] = await pool.query('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);
    if (existing.length > 0) {
      const newQuantity = existing[0].quantity + quantity;
      if (newQuantity > products[0].stock) return fail(res, 'Cart quantity cannot exceed product stock', 400);
      await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQuantity, existing[0].id]);
      return success(res, 'Product quantity updated in cart');
    }

    await pool.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [req.user.id, productId, quantity]);
    return success(res, 'Product added to cart', null, 201);
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to add product to cart', 500);
  }
};

const updateCartItem = async (req, res) => {
  try {
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) return fail(res, 'Quantity must be greater than 0', 400, { quantity: 'Quantity must be greater than 0' });

    const [rows] = await pool.query(
      `SELECT c.id, c.product_id, p.stock FROM cart_items c JOIN products p ON p.id = c.product_id WHERE c.id = ? AND c.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return fail(res, 'Cart item not found', 404);
    if (quantity > rows[0].stock) return fail(res, 'Quantity exceeds available stock', 400);

    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, req.params.id]);
    return success(res, 'Cart item updated');
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to update cart', 500);
  }
};

const removeCartItem = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.affectedRows === 0) return fail(res, 'Cart item not found', 404);
    return success(res, 'Cart item removed');
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to remove cart item', 500);
  }
};

const clearCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    return success(res, 'Cart cleared');
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to clear cart', 500);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
