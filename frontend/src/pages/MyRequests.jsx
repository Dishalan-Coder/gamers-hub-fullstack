import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../services/api';
import { getApiError } from '../services/validators';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get('/requests/my');
      setRequests(res.data.data.requests);
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  if (loading) return <p className="loading">Loading requests...</p>;

  return (
    <section>
      <div className="page-head"><div><span className="eyebrow">Customer Area</span><h1>My Product Requests</h1><p>Track whether your requests are pending, accepted, or rejected.</p></div></div>
      {requests.length === 0 ? <p className="empty">No requests yet.</p> : (
        <div className="request-list">
          {requests.map((request) => (
            <article className="request-card" key={request.id}>
              <div className="request-top">
                <h3>Request #{request.id}</h3>
                <span className={`status ${request.status}`}>{request.status}</span>
              </div>
              <p>Total: <strong>LKR {Number(request.total_amount).toLocaleString()}</strong></p>
              {request.note && <p>Note: {request.note}</p>}
              {request.admin_message && <p>Admin message: {request.admin_message}</p>}
              <div className="request-items">
                {request.items.map((item) => (
                  <div key={item.id}><img src={item.image_url} alt={item.name} /><span>{item.name} × {item.quantity}</span></div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default MyRequests;
