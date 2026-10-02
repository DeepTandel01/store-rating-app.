import { useState } from 'react';
import api from '../api';
import { validate } from '../validation';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState({ text: '', ok: false });

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form, ['newPassword']);
    if (errs.newPassword) return setMsg({ text: errs.newPassword, ok: false });
    try {
      const { data } = await api.put('/auth/password', form);
      setMsg({ text: data.message, ok: true });
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) { setMsg({ text: err.response?.data?.message || 'Failed', ok: false }); }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>Update Password</h2>
      {msg.text && <p className={msg.ok ? 'success' : 'error'}>{msg.text}</p>}
      <input type="password" placeholder="Current password" value={form.currentPassword}
             onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
      <input type="password" placeholder="New password" value={form.newPassword}
             onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
      <button>Update</button>
    </form>
  );
}