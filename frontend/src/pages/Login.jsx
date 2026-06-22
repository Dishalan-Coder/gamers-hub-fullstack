import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getApiError, getApiErrors, validateLogin } from '../services/validators';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateLogin(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    try {
      setLoading(true);
      const res = await API.post('/auth/login', form);
      if (res.data.data.user.role !== 'user') {
        toast.error('Use admin login page for admin account');
        return;
      }
      saveAuth(res.data.data);
      toast.success('Login successful');
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
      <h1>Customer Login</h1>
      <p>Demo user: user@gamershub.lk / User@1234</p>
      <form onSubmit={handleSubmit} noValidate>
        <label>Email</label>
        <input name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@gamershub.lk" />
        {errors.email && <small className="error">{errors.email}</small>}

        <label>Password</label>
        <div className="password-field">
          <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter password" />
          <button type="button" onClick={() => setShowPass(!showPass)}>{showPass ? <FaEyeSlash /> : <FaEye />}</button>
        </div>
        {errors.password && <small className="error">{errors.password}</small>}

        <button className="btn full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <p className="auth-link">No account? <Link to="/register">Register</Link> | <Link to="/admin/login">Admin Login</Link></p>
    </section>
  );
};

export default Login;
