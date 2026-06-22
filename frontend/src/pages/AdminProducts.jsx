import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import API from '../services/api';
import AdminTabs from '../components/AdminTabs';
import { getApiError, getApiErrors, validateProduct } from '../services/validators';

const emptyForm = { name: '', category: '', price: '', stock: '', image_url: '/images/keyboard.svg', description: '', status: 'active' };

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  const loadProducts = async (page = 1) => {
    try {
      const res = await API.get('/products', { params: { page, limit: 10 } });
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const validation = validateProduct(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    try {
      if (editingId) {
        await API.put(`/products/${editingId}`, form);
        toast.success('Product updated');
      } else {
        await API.post('/products', form);
        toast.success('Product created');
      }
      setForm(emptyForm);
      setEditingId(null);
      loadProducts(pagination.page);
    } catch (error) {
      setErrors(getApiErrors(error));
      toast.error(getApiError(error));
    }
  };

  const edit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image_url: product.image_url,
      description: product.description,
      status: product.status,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product removed');
      loadProducts(pagination.page);
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  return (
    <section>
      <AdminTabs />
      <div className="page-head"><div><span className="eyebrow">Admin Area</span><h1>Product Management</h1><p>Create, edit, and remove gaming accessory products.</p></div></div>

      <form className="admin-form" onSubmit={submit} noValidate>
        <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
        <div className="form-grid">
          <div><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{errors.name && <small className="error">{errors.name}</small>}</div>
          <div><label>Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />{errors.category && <small className="error">{errors.category}</small>}</div>
          <div><label>Price</label><input type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />{errors.price && <small className="error">{errors.price}</small>}</div>
          <div><label>Quantity</label><input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />{errors.stock && <small className="error">{errors.stock}</small>}</div>
          <div><label>Image URL</label><input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />{errors.image_url && <small className="error">{errors.image_url}</small>}</div>
          <div><label>Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>active</option><option>inactive</option></select></div>
          <div className="span-2"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />{errors.description && <small className="error">{errors.description}</small>}</div>
        </div>
        <div className="form-actions"><button className="btn"><FaPlus /> {editingId ? 'Update Product' : 'Create Product'}</button>{editingId && <button type="button" className="btn ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}</div>
      </form>

      <div className="table-card">
        <table>
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="table-product"><img src={product.image_url} alt={product.name} /><span>{product.name}</span></td>
                <td>{product.category}</td><td>LKR {Number(product.price).toLocaleString()}</td><td>{product.stock}</td>
                <td><button className="btn icon" onClick={() => edit(product)}><FaEdit /></button><button className="btn icon danger" onClick={() => remove(product.id)}><FaTrash /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination"><button className="btn ghost" disabled={pagination.page <= 1} onClick={() => loadProducts(pagination.page - 1)}>Previous</button><span>Page {pagination.page} of {pagination.pages || 1}</span><button className="btn ghost" disabled={pagination.page >= pagination.pages} onClick={() => loadProducts(pagination.page + 1)}>Next</button></div>
    </section>
  );
};

export default AdminProducts;
