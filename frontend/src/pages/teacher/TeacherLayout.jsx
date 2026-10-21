import { Outlet } from 'react-router-dom';
import TeacherNavbar from '../../components/teacher/TeacherNavbar';

export default function TeacherLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherNavbar />
      <Outlet />
    </div>
  );
}
