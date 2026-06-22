const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { success, fail } = require('../utils/response');
const { validateRegister, validateLogin, phoneRegex, isEmpty, validatePassword } = require('../utils/validators');

const createToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET || 'dev_secret', {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  profile_image: user.profile_image,
  role: user.role,
  status: user.status,
});

const register = async (req, res) => {
  try {
    const errors = validateRegister(req.body);
    if (Object.keys(errors).length > 0) return fail(res, 'Validation failed', 400, errors);

    const { name, email, phone, password } = req.body;
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) return fail(res, 'Email already registered', 409, { email: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), phone.trim(), hashedPassword, 'user', 'active']
    );

    const user = { id: result.insertId, name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), role: 'user', status: 'active', profile_image: null };
    return success(res, 'Registration successful', { user: publicUser(user), token: createToken(user.id, user.role) }, 201);
  } catch (error) {
    console.error(error);
    return fail(res, 'Registration failed', 500);
  }
};

const login = async (req, res) => {
  try {
    const errors = validateLogin(req.body);
    if (Object.keys(errors).length > 0) return fail(res, 'Validation failed', 400, errors);

    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (rows.length === 0) return fail(res, 'Invalid login credentials', 401, { email: 'Invalid email or password' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return fail(res, 'Invalid login credentials', 401, { password: 'Invalid email or password' });
    if (user.status !== 'active') return fail(res, 'Your account is not active', 403);

    return success(res, 'Login successful', { user: publicUser(user), token: createToken(user.id, user.role) });
  } catch (error) {
    console.error(error);
    return fail(res, 'Login failed', 500);
  }
};

const adminLogin = async (req, res) => {
  try {
    const errors = validateLogin(req.body);
    if (Object.keys(errors).length > 0) return fail(res, 'Validation failed', 400, errors);

    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND role = ?', [email.trim().toLowerCase(), 'admin']);
    if (rows.length === 0) return fail(res, 'Invalid admin credentials', 401);

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return fail(res, 'Invalid admin credentials', 401);

    return success(res, 'Admin login successful', { user: publicUser(admin), token: createToken(admin.id, admin.role) });
  } catch (error) {
    console.error(error);
    return fail(res, 'Admin login failed', 500);
  }
};

const me = async (req, res) => success(res, 'User profile loaded', { user: publicUser(req.user) });

const updateProfile = async (req, res) => {
  try {
    const { name, phone, profile_image } = req.body;
    const errors = {};
    if (isEmpty(name)) errors.name = 'Name is required';
    else if (String(name).trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (isEmpty(phone)) errors.phone = 'Phone number is required';
    else if (!phoneRegex.test(String(phone).trim())) errors.phone = 'Phone number must be like 0771234567';
    if (Object.keys(errors).length > 0) return fail(res, 'Validation failed', 400, errors);

    await pool.query('UPDATE users SET name = ?, phone = ?, profile_image = ? WHERE id = ?', [
      name.trim(),
      phone.trim(),
      profile_image || req.user.profile_image || null,
      req.user.id,
    ]);

    const [rows] = await pool.query('SELECT id, name, email, phone, profile_image, role, status FROM users WHERE id = ?', [req.user.id]);
    return success(res, 'Profile updated successfully', { user: rows[0] });
  } catch (error) {
    console.error(error);
    return fail(res, 'Profile update failed', 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const errors = {};
    if (isEmpty(currentPassword)) errors.currentPassword = 'Current password is required';
    const passError = validatePassword(newPassword, 'New password');
    if (passError) errors.newPassword = passError;
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (Object.keys(errors).length > 0) return fail(res, 'Validation failed', 400, errors);

    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) return fail(res, 'Current password is incorrect', 400, { currentPassword: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    return success(res, 'Password changed successfully');
  } catch (error) {
    console.error(error);
    return fail(res, 'Password change failed', 500);
  }
};

module.exports = { register, login, adminLogin, me, updateProfile, changePassword };
