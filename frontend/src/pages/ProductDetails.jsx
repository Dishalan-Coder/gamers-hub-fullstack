import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../services/validators';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data.data.product);
      } catch (error) {
        toast.error(getApiError(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const addToCart = async () => {
    if (!user || user.role !== 'user') return toast.error('Please login as customer');
    if (quantity <= 0 || quantity > product.stock) return toast.error('Enter valid quantity');
    try {
      await API.post('/cart', { product_id: product.id, quantity });
      toast.success('Added to cart');
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  const addToWishlist = async () => {
    if (!user || user.role !== 'user') return toast.error('Please login as customer');
    try {
      await API.post('/wishlist', { product_id: product.id });
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  if (loading) return <p className="loading">Loading product...</p>;
  if (!product) return <p className="empty">Product not found.</p>;

  return (
    <section className="details-grid">
      <div className="details-img-card"><img src={product.image_url} alt={product.name} /></div>
      <div className="details-info">
        <span className="eyebrow">{product.category}</span>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <h2>LKR {Number(product.price).toLocaleString()}</h2>
        <p className={product.stock > 0 ? 'stock good' : 'stock bad'}>{product.stock} item(s) available</p>
        <label>Quantity</label>
        <input className="qty-input" type="number" min="1" max={product.stock} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        <div className="details-actions">
          <button className="btn" onClick={addToCart} disabled={product.stock <= 0}><FaShoppingCart /> Add to Cart</button>
          <button className="btn ghost" onClick={addToWishlist}><FaHeart /> Wishlist</button>
          <Link className="btn ghost" to="/products">Back</Link>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
