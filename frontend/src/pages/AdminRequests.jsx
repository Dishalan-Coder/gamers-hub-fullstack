import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes } from 'react-icons/fa';
import API from '../services/api';
import AdminTabs from '../components/AdminTabs';
import { getApiError } from '../services/validators';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState('All');
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [messages, setMessages] = useState({});

  const loadRequests = async (page = 1) => {
    try {
      const res = await API.get('/requests', { params: { page, limit: 10, status } });
      setRequests(res.data.data.requests);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  useEffect(() => { loadRequests(1); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [status]);

  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/requests/${id}/status`, { status: newStatus, admin_message: messages[id] || '' });
      toast.success(`Request ${newStatus}`);
      loadRequests(pagination.page);
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  return (
    <section>
      <AdminTabs />
      <div className="page-head"><div><span className="eyebrow">Admin Area</span><h1>Customer Requests</h1><p>Accept or reject customer product requests. Accepted requests reduce stock automatically.</p></div></div>
      <div className="filter-bar small-filter"><select value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option><option>pending</option><option>accepted</option><option>rejected</option></select></div>
      <div className="request-list">
        {requests.map((request) => (
          <article className="request-card" key={request.id}>
            <div className="request-top"><div><h3>Request #{request.id}</h3><p>{request.customer_name} • {request.customer_email} • {request.customer_phone}</p></div><span className={`status ${request.status}`}>{request.status}</span></div>
            <p>Total: <strong>LKR {Number(request.total_amount).toLocaleString()}</strong></p>
            {request.note && <p>Customer note: {request.note}</p>}
            {request.admin_message && <p>Admin message: {request.admin_message}</p>}
            <div className="request-items">{request.items.map((item) => <div key={item.id}><img src={item.image_url} alt={item.name} /><span>{item.name} × {item.quantity}</span></div>)}</div>
            {request.status === 'pending' && <div className="admin-request-actions"><input placeholder="Admin message to customer" value={messages[request.id] || ''} onChange={(e) => setMessages({ ...messages, [request.id]: e.target.value })} /><button className="btn" onClick={() => updateStatus(request.id, 'accepted')}><FaCheck /> Accept</button><button className="btn danger" onClick={() => updateStatus(request.id, 'rejected')}><FaTimes /> Reject</button></div>}
          </article>
        ))}
      </div>
      {requests.length === 0 && <p className="empty">No requests found.</p>}
      <div className="pagination"><button className="btn ghost" disabled={pagination.page <= 1} onClick={() => loadRequests(pagination.page - 1)}>Previous</button><span>Page {pagination.page} of {pagination.pages || 1}</span><button className="btn ghost" disabled={pagination.page >= pagination.pages} onClick={() => loadRequests(pagination.page + 1)}>Next</button></div>
    </section>
  );
};

export default AdminRequests;
