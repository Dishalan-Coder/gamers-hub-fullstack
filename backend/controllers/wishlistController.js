const { pool } = require('../config/db');
const { success, fail } = require('../utils/response');

const getWishlist = async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT w.id, w.product_id, p.name, p.price, p.stock, p.image_url, p.category, p.description
       FROM wishlist_items w
       JOIN products p ON p.id = w.product_id
       WHERE w.user_id = ? AND p.status = 'active'
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    return success(res, 'Wishlist loaded', { items });
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to load wishlist', 500);
  }
};

const addToWishlist = async (req, res) => {
  try {
    const productId = Number(req.body.product_id);
    if (!productId) return fail(res, 'Product is required', 400, { product_id: 'Product is required' });

    const [products] = await pool.query('SELECT id FROM products WHERE id = ? AND status = ?', [productId, 'active']);
    if (products.length === 0) return fail(res, 'Product not found', 404);

    const [existing] = await pool.query('SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);
    if (existing.length > 0) return fail(res, 'Product already exists in wishlist', 409);

    await pool.query('INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)', [req.user.id, productId]);
    return success(res, 'Product added to wishlist', null, 201);
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to add to wishlist', 500);
  }
};

const removeWishlistItem = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM wishlist_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.affectedRows === 0) return fail(res, 'Wishlist item not found', 404);
    return success(res, 'Wishlist item removed');
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to remove wishlist item', 500);
  }
};

module.exports = { getWishlist, addToWishlist, removeWishlistItem };
