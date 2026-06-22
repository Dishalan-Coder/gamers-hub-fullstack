import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaTrash } from 'react-icons/fa';
import API from '../services/api';
import { getApiError } from '../services/validators';

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const res = await API.get('/wishlist');
      setItems(res.data.data.items);
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWishlist(); }, []);

  const addToCart = async (item) => {
    try {
      await API.post('/cart', { product_id: item.product_id, quantity: 1 });
      toast.success('Added to cart');
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  const remove = async (id) => {
    try {
      await API.delete(`/wishlist/${id}`);
      toast.success('Removed from wishlist');
      loadWishlist();
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  if (loading) return <p className="loading">Loading wishlist...</p>;

  return (
    <section>
      <div className="page-head"><div><span className="eyebrow">Customer Area</span><h1>My Wishlist</h1><p>Save your favourite gaming gear for later.</p></div></div>
      {items.length === 0 ? <p className="empty">Your wishlist is empty.</p> : (
        <div className="product-grid">
          {items.map((item) => (
            <article className="product-card" key={item.id}>
              <div className="product-img-wrap"><img src={item.image_url} alt={item.name} className="product-img" /><span className="badge">{item.category}</span></div>
              <div className="product-body"><h3>{item.name}</h3><p>{item.description}</p><strong>LKR {Number(item.price).toLocaleString()}</strong>
                <div className="card-actions"><button className="btn" onClick={() => addToCart(item)}><FaShoppingCart /> Cart</button><button className="btn danger" onClick={() => remove(item.id)}><FaTrash /> Remove</button></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Wishlist;
