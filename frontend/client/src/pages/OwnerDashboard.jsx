import { useEffect, useState } from 'react';
import api from '../api';
import Table from '../components/Table';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });

  useEffect(() => { api.get('/owner/dashboard', { params: sort }).then((r) => setData(r.data)); }, [sort]);
  const onSort = (key) =>
    setSort((s) => ({ sortBy: key, order: s.sortBy === key && s.order === 'asc' ? 'desc' : 'asc' }));

  if (!data) return <p>Loading...</p>;
  if (!data.store) return <div className="page">No store is assigned to you yet.</div>;

  return (
    <div className="page">
      <h2>{data.store.name}</h2>
      <div className="stat"><h3>{data.averageRating}</h3>Average Rating</div>
      <h3>Users who rated your store</h3>
      <Table
        columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' },
                  { key: 'rating', label: 'Rating' },
                  { key: 'date', label: 'Date', render: (r) => new Date(r.date).toLocaleDateString() }]}
        rows={data.raters} {...sort} onSort={onSort} />
    </div>
  );
}