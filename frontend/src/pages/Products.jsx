import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ProductCard from '../components/ProductCard';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../services/validators';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [filters, setFilters] = useState({ search: '', category: 'All', minPrice: '', maxPrice: '' });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 8, ...filters };
      const res = await API.get('/products', { params });
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await API.get('/products/categories');
      setCategories(res.data.data.categories);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadProducts(1); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filters.category]);

  const handleCart = async (product) => {
    if (!user) return toast.error('Please login before adding to cart');
    if (user.role !== 'user') return toast.error('Admin cannot use customer cart');
    try {
      await API.post('/cart', { product_id: product.id, quantity: 1 });
      toast.success('Added to cart');
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  const handleWishlist = async (product) => {
    if (!user) return toast.error('Please login before adding to wishlist');
    if (user.role !== 'user') return toast.error('Admin cannot use customer wishlist');
    try {
      await API.post('/wishlist', { product_id: product.id });
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  const submitSearch = (e) => {
    e.preventDefault();
    loadProducts(1);
  };

  return (
    <section>
      <div className="page-head">
        <div>
          <span className="eyebrow">Shop</span>
          <h1>Gaming Accessories</h1>
          <p>Search, filter, view details, add to wishlist/cart, and request from admin.</p>
        </div>
      </div>

      <form className="filter-bar" onSubmit={submitSearch}>
        <input placeholder="Search products..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option>All</option>
          {categories.map((cat) => <option key={cat}>{cat}</option>)}
        </select>
        <input type="number" min="0" placeholder="Min price" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
        <input type="number" min="0" placeholder="Max price" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
        <button className="btn">Search</button>
      </form>

      {loading ? <p className="loading">Loading products...</p> : (
        <div className="product-grid">
          {products.map((product) => <ProductCard key={product.id} product={product} onCart={handleCart} onWishlist={handleWishlist} />)}
        </div>
      )}
      {!loading && products.length === 0 && <p className="empty">No products found.</p>}

      <div className="pagination">
        <button className="btn ghost" disabled={pagination.page <= 1} onClick={() => loadProducts(pagination.page - 1)}>Previous</button>
        <span>Page {pagination.page} of {pagination.pages || 1}</span>
        <button className="btn ghost" disabled={pagination.page >= pagination.pages} onClick={() => loadProducts(pagination.page + 1)}>Next</button>
      </div>
    </section>
  );
};

export default Products;
