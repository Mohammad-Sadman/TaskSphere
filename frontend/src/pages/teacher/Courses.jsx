import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../../services/teacherApi';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await courseAPI.getCourses();
    setCourses(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    await courseAPI.deleteCourse(toDelete);
    setToDelete(null);
    load();
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading…</div>;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
          <p className="mt-1 text-gray-600">Manage all your courses and sections</p>
        </div>
        <Link
          to="/teacher/courses/new"
          className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-purple-700 hover:shadow-lg"
        >
          + Add Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-md">
          <h3 className="mb-2 text-xl font-semibold text-gray-700">No courses yet</h3>
          <p className="mb-6 text-gray-500">Start by creating your first course</p>
          <Link
            to="/teacher/courses/new"
            className="inline-block rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
          >
            Create Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course._id} className="overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-lg">
              <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-purple-700 p-4">
                <h2 className="text-xl font-bold text-white">{course.courseCode}</h2>
                <button
                  onClick={() => setToDelete(course._id)}
                  className="text-purple-100 hover:text-white"
                  title="Delete course"
                >
                  ✕
                </button>
              </div>
              <div className="p-5">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">{course.courseTitle}</h3>
                <div className="mb-4 space-y-2 text-sm text-gray-600">
                  <div>Credits: {course.credits}</div>
                  <div>{course.studentCount} Students</div>
                  <div>
                    {course.sectionCount} Section{course.sectionCount !== 1 ? 's' : ''}
                  </div>
                </div>
                {course.sections?.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="mb-2 text-xs font-medium text-gray-500">Sections:</p>
                    <div className="space-y-1">
                      {course.sections.map((s) => (
                        <Link
                          key={s._id}
                          to={`/teacher/sections/${s._id}`}
                          className="block text-sm text-purple-600 hover:text-purple-800 hover:underline"
                        >
                          → {s.sectionName}
                          {s.roomNumber && ` (Room ${s.roomNumber})`}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete course?"
        message="This removes the course, its sections, students, attendance, syllabus, and marks. This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
