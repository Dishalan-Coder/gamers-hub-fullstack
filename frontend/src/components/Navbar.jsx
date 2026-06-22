import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaGamepad, FaHeart, FaShoppingCart, FaUserShield, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="nav-wrap">
      <Link className="brand" to="/">
        <span className="brand-icon"><FaGamepad /></span>
        Gamers Hub
      </Link>
      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/contact">Contact</NavLink>
        {user?.role === 'user' && <NavLink to="/wishlist"><FaHeart /> Wishlist</NavLink>}
        {user?.role === 'user' && <NavLink to="/cart"><FaShoppingCart /> Cart</NavLink>}
        {user?.role === 'user' && <NavLink to="/requests">My Requests</NavLink>}
        {user?.role === 'user' && <NavLink to="/profile"><FaUser /> Profile</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin"><FaUserShield /> Admin</NavLink>}
        {!user && <NavLink to="/login">Login</NavLink>}
        {!user && <NavLink to="/register" className="nav-cta">Register</NavLink>}
        {user && <span className="nav-user">Hi, {user.name}</span>}
        {user && <button className="btn small ghost" onClick={handleLogout}>Logout</button>}
      </nav>
    </header>
  );
};

export default Navbar;
