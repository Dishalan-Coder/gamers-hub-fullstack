import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getApiError, getApiErrors, validateLogin } from '../services/validators';

const AdminLogin = () => {
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
      const res = await API.post('/auth/admin-login', form);
      saveAuth(res.data.data);
      toast.success('Admin login successful');
      navigate('/admin');
    } catch (error) {
      setErrors(getApiErrors(error));
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card admin-auth">
      <h1>Admin Login</h1>
      <p>Demo admin: admin@gamershub.lk / Admin@123</p>
      <form onSubmit={handleSubmit} noValidate>
        <label>Admin Email</label>
        <input name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@gamershub.lk" />
        {errors.email && <small className="error">{errors.email}</small>}

        <label>Password</label>
        <div className="password-field">
          <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter admin password" />
          <button type="button" onClick={() => setShowPass(!showPass)}>{showPass ? <FaEyeSlash /> : <FaEye />}</button>
        </div>
        {errors.password && <small className="error">{errors.password}</small>}

        <button className="btn full" disabled={loading}>{loading ? 'Checking...' : 'Admin Login'}</button>
      </form>
      <p className="auth-link"><Link to="/login">Customer Login</Link></p>
    </section>
  );
};

export default AdminLogin;
