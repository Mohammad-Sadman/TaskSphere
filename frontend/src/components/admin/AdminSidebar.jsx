import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const linkClass = ({ isActive }) =>
  `block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`;

export default function AdminSidebar() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!admin) return null;

  return (
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col bg-slate-900 text-white">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700 font-bold">A</div>
        <span className="text-xl font-bold">Admin Panel</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <NavLink to="/admin/dashboard" className={linkClass}>Overview</NavLink>
        <NavLink to="/admin/users" className={linkClass}>Student Accounts</NavLink>
        <NavLink to="/admin/teachers" className={linkClass}>Teachers</NavLink>
        <NavLink to="/admin/courses" className={linkClass}>Courses &amp; Sections</NavLink>
      </nav>

      <div className="border-t border-slate-800 px-4 py-4">
        <p className="mb-2 truncate text-sm text-slate-400">{admin.name}</p>
        <button
          onClick={handleLogout}
          className="w-full rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-slate-700 hover:text-red-200"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
