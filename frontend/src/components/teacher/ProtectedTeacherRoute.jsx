import { Navigate } from 'react-router-dom';
import { useTeacherAuth } from '../../context/TeacherAuthContext';

export default function ProtectedTeacherRoute({ children }) {
  const { teacher, loading } = useTeacherAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  if (!teacher) {
    return <Navigate to="/teacher/login" replace />;
  }

  return children;
}
