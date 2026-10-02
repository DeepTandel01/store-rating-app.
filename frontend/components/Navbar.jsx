import { Link, useNavigate } from 'react-router-dom';
import { useAuth, homeFor } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  if (!user) return null;
  return (
    <nav className="nav">
      <strong>StoreRatings</strong>
      <Link to={homeFor(user.role)}>Home</Link>
      {user.role === 'admin' && <>
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/stores">Stores</Link>
      </>}
      <Link to="/password">Change Password</Link>
      <span style={{ marginLeft: 'auto' }}>{user.name} ({user.role})</span>
      <button onClick={() => { logout(); nav('/login'); }}>Logout</button>
    </nav>
  );
}