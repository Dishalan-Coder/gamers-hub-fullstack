import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getApiError, getApiErrors, validateRegister } from '../services/validators';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateRegister(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    try {
      setLoading(true);
      const res = await API.post('/auth/register', form);
      saveAuth(res.data.data);
      toast.success('Registration successful');
      navigate('/products');
    } catch (error) {
      setErrors(getApiErrors(error));
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card">
      <h1>Create Customer Account</h1>
      <p>Register to add gaming gear to cart, wishlist, and send product requests.</p>
      <form onSubmit={handleSubmit} noValidate>
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" />
        {errors.name && <small className="error">{errors.name}</small>}

        <label>Email</label>
        <input name="email" value={form.email} onChange={handleChange} placeholder="example@email.com" />
        {errors.email && <small className="error">{errors.email}</small>}

        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="0771234567" />
        {errors.phone && <small className="error">{errors.phone}</small>}

        <label>Password</label>
        <div className="password-field">
          <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="At least 8 characters" />
          <button type="button" onClick={() => setShowPass(!showPass)}>{showPass ? <FaEyeSlash /> : <FaEye />}</button>
        </div>
        {errors.password && <small className="error">{errors.password}</small>}

        <label>Confirm Password</label>
        <div className="password-field">
          <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm password" />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? <FaEyeSlash /> : <FaEye />}</button>
        </div>
        {errors.confirmPassword && <small className="error">{errors.confirmPassword}</small>}

        <button className="btn full" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
      </form>
      <p className="auth-link">Already have an account? <Link to="/login">Login</Link></p>
    </section>
  );
};

export default Register;
