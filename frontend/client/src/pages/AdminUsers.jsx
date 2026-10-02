import { useEffect, useState } from 'react';
import api from '../api';
import Table from '../components/Table';
import { validate } from '../validation';

const empty = { name: '', email: '', address: '', password: '', role: 'user' };

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');
  const [detail, setDetail] = useState(null);

  const load = () =>
    api.get('/admin/users', { params: { ...filters, ...sort } }).then((r) => setRows(r.data));
  useEffect(() => { load(); }, [filters, sort]); // eslint-disable-line

  const onSort = (key) =>
    setSort((s) => ({ sortBy: key, order: s.sortBy === key && s.order === 'asc' ? 'desc' : 'asc' }));

  const add = async (e) => {
    e.preventDefault();
    const errs = validate(form, ['name', 'email', 'address', 'password']);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await api.post('/admin/users', form);
      setMsg('User added'); setForm(empty); load();
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
  };

  const f = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });
  const s = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="page">
      <h2>Users</h2>

      <form className="row" onSubmit={add}>
        {['name', 'email', 'address', 'password'].map((k) => (
          <div key={k}>
            <input type={k === 'password' ? 'password' : 'text'} placeholder={k} value={form[k]} onChange={s(k)} />
            {errors[k] && <small className="error">{errors[k]}</small>}
          </div>
        ))}
        <select value={form.role} onChange={s('role')}>
          <option value="user">Normal User</option>
          <option value="admin">Admin</option>
          <option value="owner">Store Owner</option>
        </select>
        <button>Add User</button> {msg && <span>{msg}</span>}
      </form>

      <div className="row">
        <input placeholder="Filter name" onChange={f('name')} />
        <input placeholder="Filter email" onChange={f('email')} />
        <input placeholder="Filter address" onChange={f('address')} />
        <select onChange={f('role')}>
          <option value="">All roles</option>
          <option value="user">User</option><option value="admin">Admin</option><option value="owner">Owner</option>
        </select>
      </div>

      <Table
        columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' },
                  { key: 'address', label: 'Address' }, { key: 'role', label: 'Role' }]}
        rows={rows} {...sort} onSort={onSort}
        onRowClick={(r) => api.get(`/admin/users/${r.id}`).then((d) => setDetail(d.data))}
      />

      {detail && (
        <div className="card">
          <h3>User details</h3>
          <p>Name: {detail.name}</p><p>Email: {detail.email}</p>
          <p>Address: {detail.address}</p><p>Role: {detail.role}</p>
          {detail.role === 'owner' && <p>Store Rating: {detail.rating}</p>}
          <button onClick={() => setDetail(null)}>Close</button>
        </div>
      )}
    </div>
  );
}