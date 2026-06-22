import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../services/api';
import AdminTabs from '../components/AdminTabs';
import { getApiError } from '../services/validators';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.data.users);
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/admin/users/${id}/status`, { status });
      toast.success(`User ${status}`);
      loadUsers();
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  return (
    <section>
      <AdminTabs />
      <div className="page-head"><div><span className="eyebrow">Admin Area</span><h1>User Management</h1><p>View users and ban or activate customer accounts.</p></div></div>
      <div className="table-card">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{user.phone}</td><td>{user.role}</td><td><span className={`status ${user.status}`}>{user.status}</span></td><td>{user.role === 'user' && (user.status === 'active' ? <button className="btn danger" onClick={() => updateStatus(user.id, 'banned')}>Ban</button> : <button className="btn" onClick={() => updateStatus(user.id, 'active')}>Activate</button>)}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminUsers;
