import { Link } from 'react-router-dom';
import { FaBolt, FaGamepad, FaShieldAlt, FaTruck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  return (
    <div>
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Gaming Accessories Store</span>
          <h1>Level up your setup with Gamers Hub</h1>
          <p>Browse custom gaming accessories, add items to cart or wishlist, and send product requests for admin approval.</p>
          {user ? <p className="welcome-chip">Welcome back, {user.name}</p> : null}
          <div className="hero-actions">
            <Link className="btn big" to="/products">Shop Products</Link>
            {!user && <Link className="btn big ghost" to="/register">Create Account</Link>}
          </div>
        </div>
        <div className="hero-art">
          <img src="/images/hero-gaming.png" alt="Gaming desk setup" />
        </div>
      </section>

      <section className="features grid-3">
        <div className="feature-card"><FaGamepad /><h3>Unique Gear</h3><p>Keyboard, mouse, headset, controller, streaming tools, and gaming chairs.</p></div>
        <div className="feature-card"><FaShieldAlt /><h3>Secure Login</h3><p>JWT authentication, bcrypt password hashing, and user/admin role protection.</p></div>
        <div className="feature-card"><FaTruck /><h3>Request Workflow</h3><p>User sends cart request. Admin accepts or rejects. User can track status.</p></div>
      </section>

      <section className="flow-section">
        <h2>System Flow</h2>
        <div className="flow-grid">
          <div><FaBolt /><strong>User</strong><span>Register → Login → View products → Cart/Wishlist → Send request → Track status</span></div>
          <div><FaBolt /><strong>Admin</strong><span>Login → Dashboard → Manage products → View requests → Accept/Reject</span></div>
        </div>
      </section>
    </div>
  );
};

export default Home;
