import { Link } from 'react-router-dom';

const NotFound = () => (
  <section className="auth-card">
    <h1>404</h1>
    <p>Page not found.</p>
    <Link className="btn" to="/">Back Home</Link>
  </section>
);

export default NotFound;
