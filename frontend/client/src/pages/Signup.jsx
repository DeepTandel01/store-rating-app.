import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth, homeFor } from '../context/AuthContext';
import { validate } from '../validation';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form, ['name', 'email', 'address', 'password']);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      const { data } = await api.post('/auth/signup', form);
      login(data);
      nav(homeFor(data.user.role));
    } catch (err) { setApiError(err.response?.data?.message || 'Signup failed'); }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>Sign up</h2>
      {apiError && <p className="error">{apiError}</p>}
      {['name', 'email', 'address', 'password'].map((f) => (
        <div key={f}>
          {f === 'address'
            ? <textarea placeholder="Address" value={form.address} onChange={set(f)} />
            : <input type={f === 'password' ? 'password' : 'text'}
                     placeholder={f[0].toUpperCase() + f.slice(1)} value={form[f]} onChange={set(f)} />}
          {errors[f] && <small className="error">{errors[f]}</small>}
        </div>
      ))}
      <button>Create account</button>
      <p>Already registered? <Link to="/login">Login</Link></p>
    </form>
  );
}