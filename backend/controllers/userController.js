const { pool } = require('../config/db');
const { success, fail } = require('../utils/response');
const { uploadProfilePicture } = require('../config/s3');
const { isEmpty } = require('../utils/validators');

const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, profile_image, role, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0) return fail(res, 'User not found', 404);
    
    return success(res, 'Profile loaded successfully', { user: rows[0] });
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to load profile', 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const errors = {};
    
    if (isEmpty(name)) errors.name = 'Name is required';
    else if (String(name).trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (isEmpty(phone)) errors.phone = 'Phone number is required';
    
    if (Object.keys(errors).length > 0) return fail(res, 'Validation failed', 400, errors);

    await pool.query(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name.trim(), phone.trim(), req.user.id]
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, phone, profile_image, role, status FROM users WHERE id = ?',
      [req.user.id]
    );
    
    return success(res, 'Profile updated successfully', { user: rows[0] });
  } catch (error) {
    console.error(error);
    return fail(res, 'Profile update failed', 500);
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) return fail(res, 'No file uploaded', 400);

    const imageUrl = await uploadProfilePicture(req.file, req.user.id);

    await pool.query(
      'UPDATE users SET profile_image = ? WHERE id = ?',
      [imageUrl, req.user.id]
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, phone, profile_image, role, status FROM users WHERE id = ?',
      [req.user.id]
    );

    return success(res, 'Profile image uploaded successfully', { user: rows[0] });
  } catch (error) {
    console.error(error);
    return fail(res, 'Profile image upload failed', 500);
  }
};

module.exports = { getProfile, updateProfile, uploadProfileImage };
