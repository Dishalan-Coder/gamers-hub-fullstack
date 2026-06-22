import { NavLink } from 'react-router-dom';

const AdminTabs = () => (
  <div className="admin-tabs">
    <NavLink to="/admin">Dashboard</NavLink>
    <NavLink to="/admin/products">Products</NavLink>
    <NavLink to="/admin/requests">Requests</NavLink>
    <NavLink to="/admin/users">Users</NavLink>
  </div>
);

export default AdminTabs;
