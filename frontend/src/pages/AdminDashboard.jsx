import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaBox, FaCheckCircle, FaClock, FaTimesCircle, FaUsers, FaUserSlash } from 'react-icons/fa';
import API from '../services/api';
import AdminTabs from '../components/AdminTabs';
import { getApiError } from '../services/validators';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/admin/stats');
        setStats(res.data.data);
      } catch (error) {
        toast.error(getApiError(error));
      }
    };
    load();
  }, []);

  const cards = stats ? [
    ['Users', stats.users, <FaUsers />],
    ['Products', stats.products, <FaBox />],
    ['Total Requests', stats.requests, <FaClock />],
    ['Pending', stats.pending, <FaClock />],
    ['Accepted', stats.accepted, <FaCheckCircle />],
    ['Rejected', stats.rejected, <FaTimesCircle />],
    ['Banned Users', stats.banned, <FaUserSlash />],
  ] : [];

  return (
    <section>
      <AdminTabs />
      <div className="page-head"><div><span className="eyebrow">Admin Area</span><h1>Dashboard</h1><p>Live counts for users, products, requests, accepted, rejected, and banned.</p></div></div>
      {!stats ? <p className="loading">Loading statistics...</p> : (
        <div className="stat-grid">
          {cards.map(([label, value, icon]) => <div className="stat-card" key={label}>{icon}<span>{label}</span><strong>{value}</strong></div>)}
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;
