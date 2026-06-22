const { pool } = require('../config/db');
const { success, fail } = require('../utils/response');
const { validateProduct } = require('../utils/validators');

const getProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '8', 10), 1), 50);
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search.trim()}%` : null;
    const category = req.query.category || null;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;

    const conditions = ['status = ?'];
    const values = ['active'];

    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ? OR category LIKE ?)');
      values.push(search, search, search);
    }
    if (category && category !== 'All') {
      conditions.push('category = ?');
      values.push(category);
    }
    if (!Number.isNaN(minPrice) && minPrice !== null) {
      conditions.push('price >= ?');
      values.push(minPrice);
    }
    if (!Number.isNaN(maxPrice) && maxPrice !== null) {
      conditions.push('price <= ?');
      values.push(maxPrice);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM products ${where}`, values);
    const [rows] = await pool.query(
      `SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    return success(res, 'Products loaded', {
      products: rows,
      pagination: { total: countRows[0].total, page, limit, pages: Math.ceil(countRows[0].total / limit) },
    });
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to load products', 500);
  }
};

const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT category FROM products WHERE status = ? ORDER BY category', ['active']);
    return success(res, 'Categories loaded', { categories: rows.map((r) => r.category) });
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to load categories', 500);
  }
};

const getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return fail(res, 'Product not found', 404);
    return success(res, 'Product loaded', { product: rows[0] });
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to load product', 500);
  }
};

const createProduct = async (req, res) => {
  try {
    const errors = validateProduct(req.body);
    if (Object.keys(errors).length > 0) return fail(res, 'Validation failed', 400, errors);

    const { name, category, price, stock, image_url, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO products (name, category, price, stock, image_url, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name.trim(), category.trim(), Number(price), Number(stock), image_url.trim(), description.trim(), 'active']
    );
    return success(res, 'Product created successfully', { id: result.insertId }, 201);
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to create product', 500);
  }
};

const updateProduct = async (req, res) => {
  try {
    const errors = validateProduct(req.body);
    if (Object.keys(errors).length > 0) return fail(res, 'Validation failed', 400, errors);

    const { name, category, price, stock, image_url, description, status } = req.body;
    const [result] = await pool.query(
      'UPDATE products SET name = ?, category = ?, price = ?, stock = ?, image_url = ?, description = ?, status = ? WHERE id = ?',
      [name.trim(), category.trim(), Number(price), Number(stock), image_url.trim(), description.trim(), status || 'active', req.params.id]
    );
    if (result.affectedRows === 0) return fail(res, 'Product not found', 404);
    return success(res, 'Product updated successfully');
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to update product', 500);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE products SET status = ? WHERE id = ?', ['inactive', req.params.id]);
    if (result.affectedRows === 0) return fail(res, 'Product not found', 404);
    return success(res, 'Product removed successfully');
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to remove product', 500);
  }
};

module.exports = {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
