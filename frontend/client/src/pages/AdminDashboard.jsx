import { useEffect, useState } from 'react';
import api from '../api';

export default function AdminDashboard() {
  const [s, setS] = useState({ users: 0, stores: 0, ratings: 0 });
  useEffect(() => { api.get('/admin/stats').then((r) => setS(r.data)); }, []);
  return (
    <div className="page">
      <h2>Admin Dashboard</h2>
      <div className="stats">
        <div className="stat"><h3>{s.users}</h3>Total Users</div>
        <div className="stat"><h3>{s.stores}</h3>Total Stores</div>
        <div className="stat"><h3>{s.ratings}</h3>Total Ratings</div>
      </div>
    </div>
  );
}