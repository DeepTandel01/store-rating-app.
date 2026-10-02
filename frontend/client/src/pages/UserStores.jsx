import { useEffect, useState } from 'react';
import api from '../api';
import Table from '../components/Table';

export default function UserStores() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });
  const [pick, setPick] = useState({}); // storeId -> selected rating

  const load = () => api.get('/stores', { params: { search, ...sort } }).then((r) => setRows(r.data));
  useEffect(() => { load(); }, [search, sort]); // eslint-disable-line

  const onSort = (key) =>
    setSort((s) => ({ sortBy: key, order: s.sortBy === key && s.order === 'asc' ? 'desc' : 'asc' }));

  const save = async (id) => {
    await api.put(`/stores/${id}/rating`, { rating: pick[id] });
    load();
  };

  const columns = [
    { key: 'name', label: 'Store' },
    { key: 'address', label: 'Address' },
    { key: 'rating', label: 'Overall Rating', render: (r) => r.overall_rating },
    { key: 'my', label: 'My Rating', sortable: false, render: (r) => r.my_rating ?? '—' },
    { key: 'action', label: 'Rate', sortable: false, render: (r) => (
      <span>
        <select value={pick[r.id] ?? r.my_rating ?? ''} onChange={(e) => setPick({ ...pick, [r.id]: +e.target.value })}>
          <option value="" disabled>Select</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <button disabled={!pick[r.id]} onClick={() => save(r.id)}>
          {r.my_rating ? 'Modify' : 'Submit'}
        </button>
      </span>) },
  ];

  return (
    <div className="page">
      <h2>All Stores</h2>
      <input placeholder="Search by name or address" value={search} onChange={(e) => setSearch(e.target.value)} />
      <Table columns={columns} rows={rows} {...sort} onSort={onSort} />
    </div>
  );
}