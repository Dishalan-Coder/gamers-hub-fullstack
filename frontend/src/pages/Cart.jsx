import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaTrash } from 'react-icons/fa';
import API from '../services/api';
import { getApiError } from '../services/validators';

const Cart = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await API.get('/cart');
      setItems(res.data.data.items);
      setTotal(res.data.data.total);
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCart(); }, []);

  const updateQty = async (item, quantity) => {
    if (quantity <= 0) return toast.error('Quantity must be greater than 0');
    if (quantity > item.stock) return toast.error('Quantity cannot exceed stock');
    try {
      await API.put(`/cart/${item.id}`, { quantity });
      loadCart();
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  const removeItem = async (id) => {
    try {
      await API.delete(`/cart/${id}`);
      toast.success('Removed from cart');
      loadCart();
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  const createRequest = async () => {
    if (items.length === 0) return toast.error('Cart is empty. Add products before requesting');
    try {
      await API.post('/requests', { note });
      toast.success('Request sent to admin');
      setNote('');
      loadCart();
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  if (loading) return <p className="loading">Loading cart...</p>;

  return (
    <section>
      <div className="page-head"><div><span className="eyebrow">Customer Area</span><h1>My Cart</h1><p>Check quantities and send your cart as a product request to admin.</p></div></div>
      {items.length === 0 ? <p className="empty">Your cart is empty.</p> : (
        <div className="cart-layout">
          <div className="table-card">
            <table>
              <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="table-product"><img src={item.image_url} alt={item.name} /><span>{item.name}</span></td>
                    <td>LKR {Number(item.price).toLocaleString()}</td>
                    <td><input className="qty-small" type="number" min="1" max={item.stock} value={item.quantity} onChange={(e) => updateQty(item, Number(e.target.value))} /></td>
                    <td>LKR {Number(item.subtotal).toLocaleString()}</td>
                    <td><button className="btn icon danger" onClick={() => removeItem(item.id)}><FaTrash /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <aside className="summary-card">
            <h2>Request Summary</h2>
            <p>Total: <strong>LKR {Number(total).toLocaleString()}</strong></p>
            <label>Request note</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Example: Please confirm availability before delivery." />
            <button className="btn full" onClick={createRequest}><FaPaperPlane /> Send Request</button>
          </aside>
        </div>
      )}
    </section>
  );
};

export default Cart;
