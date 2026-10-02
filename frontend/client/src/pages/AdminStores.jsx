import { useEffect, useState } from 'react';
import api from '../api';
import Table from '../components/Table';
import { validate } from '../validation';

export default function AdminStores() {
  const [rows, setRows] = useState([]);
  const [owners, setOwners] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');

  const load = () => api.get('/admin/stores', { params: { ...filters, ...sort } }).then((r) => setRows(r.data));
  useEffect(() => { load(); }, [filters, sort]); // eslint-disable-line
  useEffect(() => {
    api.get('/admin/users', { params: { role: 'owner' } }).then((r) => setOwners(r.data));
  }, []);

  const onSort = (key) =>
    setSort((s) => ({ sortBy: key, order: s.sortBy === key && s.order === 'asc' ? 'desc' : 'asc' }));

  const add = async (e) => {
    e.preventDefault();
    const errs = validate(form, ['name', 'email', 'address']);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await api.post('/admin/stores', form);
      setMsg('Store added'); setForm({ name: '', email: '', address: '', ownerId: '' }); load();
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
  };

  const s = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const f = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <div className="page">
      <h2>Stores</h2>
      <form className="row" onSubmit={add}>
        {['name', 'email', 'address'].map((k) => (
          <div key={k}>
            <input placeholder={k} value={form[k]} onChange={s(k)} />
            {errors[k] && <small className="error">{errors[k]}</small>}
          </div>
        ))}
        <select value={form.ownerId} onChange={s('ownerId')}>
          <option value="">No owner</option>
          {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <button>Add Store</button> {msg && <span>{msg}</span>}
      </form>

      <div className="row">
        <input placeholder="Filter name" onChange={f('name')} />
        <input placeholder="Filter email" onChange={f('email')} />
        <input placeholder="Filter address" onChange={f('address')} />
      </div>

      <Table
        columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' },
                  { key: 'address', label: 'Address' }, { key: 'rating', label: 'Rating' }]}
        rows={rows} {...sort} onSort={onSort} />
    </div>
  );
}