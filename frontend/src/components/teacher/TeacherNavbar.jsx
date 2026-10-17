import { Link, useNavigate } from 'react-router-dom';
import { useTeacherAuth } from '../../context/TeacherAuthContext';

export default function TeacherNavbar() {
  const { teacher, logout } = useTeacherAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/teacher/login');
  };

  if (!teacher) return null;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/teacher/dashboard" className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-700 text-white font-bold">
            T
          </div>
          <span className="text-2xl font-bold text-purple-700">TeachSuite</span>
        </Link>

        <nav className="flex items-center space-x-6 text-sm font-medium text-gray-700">
          <Link to="/teacher/dashboard" className="hover:text-purple-600 transition">
            Dashboard
          </Link>
          <Link to="/teacher/courses" className="hover:text-purple-600 transition">
            Courses
          </Link>
          <Link to="/teacher/profile" className="hover:text-purple-600 transition">
            Profile
          </Link>
          <span className="text-gray-300">|</span>
          <span className="font-semibold text-gray-800">{teacher.name}</span>
          <button onClick={handleLogout} className="text-red-500 hover:text-red-700 hover:underline transition">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
