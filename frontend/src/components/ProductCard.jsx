import { Link } from 'react-router-dom';
import { FaHeart, FaInfoCircle, FaShoppingCart } from 'react-icons/fa';

const ProductCard = ({ product, onCart, onWishlist }) => (
  <article className="product-card">
    <div className="product-img-wrap">
      <img src={product.image_url} alt={product.name} className="product-img" />
      <span className="badge">{product.category}</span>
    </div>
    <div className="product-body">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="product-meta">
        <strong>LKR {Number(product.price).toLocaleString()}</strong>
        <span className={product.stock > 0 ? 'stock good' : 'stock bad'}>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
      </div>
      <div className="card-actions">
        <button className="btn" onClick={() => onCart(product)} disabled={product.stock <= 0}><FaShoppingCart /> Cart</button>
        <button className="btn icon" onClick={() => onWishlist(product)}><FaHeart /></button>
        <Link className="btn ghost" to={`/products/${product.id}`}><FaInfoCircle /> Details</Link>
      </div>
    </div>
  </article>
);

export default ProductCard;
