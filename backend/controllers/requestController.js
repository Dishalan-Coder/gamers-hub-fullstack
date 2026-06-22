const { pool } = require('../config/db');
const { success, fail } = require('../utils/response');
const { sendMail } = require('../utils/mailer');

const createRequestFromCart = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const note = req.body.note ? String(req.body.note).trim() : '';
    await connection.beginTransaction();

    const [cartItems] = await connection.query(
      `SELECT c.product_id, c.quantity, p.price, p.stock, p.name
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ? AND p.status = 'active'`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return fail(res, 'Your cart is empty. Add products before sending a request', 400);
    }

    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        await connection.rollback();
        return fail(res, `${item.name} has only ${item.stock} item(s) in stock`, 400);
      }
    }

    const total = cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    const [requestResult] = await connection.query(
      'INSERT INTO product_requests (user_id, total_amount, note, status) VALUES (?, ?, ?, ?)',
      [req.user.id, total, note, 'pending']
    );

    for (const item of cartItems) {
      await connection.query(
        'INSERT INTO request_items (request_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [requestResult.insertId, item.product_id, item.quantity, item.price]
      );
    }

    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    await connection.commit();

    return success(res, 'Product request sent to admin successfully', { request_id: requestResult.insertId }, 201);
  } catch (error) {
    await connection.rollback();
    console.error(error);
    return fail(res, 'Failed to create request', 500);
  } finally {
    connection.release();
  }
};

const getMyRequests = async (req, res) => {
  try {
    const [requests] = await pool.query(
      `SELECT id, total_amount, note, status, admin_message, created_at, updated_at
       FROM product_requests WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );

    for (const request of requests) {
      const [items] = await pool.query(
        `SELECT ri.id, ri.product_id, ri.quantity, ri.price, p.name, p.image_url, p.category
         FROM request_items ri
         JOIN products p ON p.id = ri.product_id
         WHERE ri.request_id = ?`,
        [request.id]
      );
      request.items = items;
    }

    return success(res, 'Requests loaded', { requests });
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to load requests', 500);
  }
};

const getAllRequests = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const offset = (page - 1) * limit;
    const status = req.query.status || 'All';

    const values = [];
    let where = '';
    if (status !== 'All') {
      where = 'WHERE pr.status = ?';
      values.push(status);
    }

    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM product_requests pr ${where}`, values);
    const [requests] = await pool.query(
      `SELECT pr.id, pr.total_amount, pr.note, pr.status, pr.admin_message, pr.created_at, pr.updated_at,
              u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
       FROM product_requests pr
       JOIN users u ON u.id = pr.user_id
       ${where}
       ORDER BY pr.created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    for (const request of requests) {
      const [items] = await pool.query(
        `SELECT ri.id, ri.product_id, ri.quantity, ri.price, p.name, p.image_url, p.category
         FROM request_items ri
         JOIN products p ON p.id = ri.product_id
         WHERE ri.request_id = ?`,
        [request.id]
      );
      request.items = items;
    }

    return success(res, 'All requests loaded', {
      requests,
      pagination: { total: countRows[0].total, page, limit, pages: Math.ceil(countRows[0].total / limit) },
    });
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to load requests', 500);
  }
};

const updateRequestStatus = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { status, admin_message } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return fail(res, 'Status must be accepted or rejected', 400, { status: 'Status must be accepted or rejected' });
    }

    await connection.beginTransaction();
    const [requests] = await connection.query(
      `SELECT pr.*, u.email, u.name FROM product_requests pr JOIN users u ON u.id = pr.user_id WHERE pr.id = ?`,
      [req.params.id]
    );
    if (requests.length === 0) {
      await connection.rollback();
      return fail(res, 'Request not found', 404);
    }
    if (requests[0].status !== 'pending') {
      await connection.rollback();
      return fail(res, 'Only pending requests can be updated', 400);
    }

    if (status === 'accepted') {
      const [items] = await connection.query('SELECT product_id, quantity FROM request_items WHERE request_id = ?', [req.params.id]);
      for (const item of items) {
        const [productRows] = await connection.query('SELECT stock, name FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
        if (productRows.length === 0 || productRows[0].stock < item.quantity) {
          await connection.rollback();
          return fail(res, `Not enough stock for ${productRows[0]?.name || 'a product'}`, 400);
        }
        await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
      }
    }

    await connection.query('UPDATE product_requests SET status = ?, admin_message = ? WHERE id = ?', [
      status,
      admin_message || '',
      req.params.id,
    ]);

    await connection.commit();

    sendMail({
      to: requests[0].email,
      subject: `Your Gamers Hub request was ${status}`,
      html: `<p>Hello ${requests[0].name},</p><p>Your product request #${req.params.id} has been <strong>${status}</strong>.</p><p>${admin_message || ''}</p>`,
    }).catch((mailError) => console.error('Request status email failed:', mailError.message));

    return success(res, `Request ${status} successfully`);
  } catch (error) {
    await connection.rollback();
    console.error(error);
    return fail(res, 'Failed to update request status', 500);
  } finally {
    connection.release();
  }
};

module.exports = { createRequestFromCart, getMyRequests, getAllRequests, updateRequestStatus };
