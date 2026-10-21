import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { studentAPI } from '../../services/teacherApi';

export default function StudentProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await studentAPI.getProfile(id);
      setData(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading || !data) return <div className="p-10 text-center text-gray-500">Loading…</div>;

  const { student, section, course, attendance, marks } = data;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 text-sm text-purple-600">
        <Link to={`/teacher/sections/${section._id}`} className="hover:underline">
          {course.courseCode} — {section.sectionName}
        </Link>{' '}
        / {student.name}
      </div>

      <div className="mb-6 rounded-xl bg-white p-6 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">{student.name}</h1>
        <p className="mt-1 text-gray-600">
          Roll No: {student.rollNo} {student.email && `• ${student.email}`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-md">
          <h3 className="mb-3 font-semibold text-gray-800">Attendance</h3>
          <div className="mb-3 text-4xl font-bold text-purple-700">{attendance.percentage}%</div>
          <p className="mb-4 text-sm text-gray-600">
            Present {attendance.present} of {attendance.total} classes
          </p>
          {attendance.logs.length > 0 && (
            <div className="max-h-64 space-y-1 overflow-y-auto text-sm">
              {attendance.logs.map((log) => (
                <div key={log._id} className="flex justify-between border-b py-1">
                  <span className="text-gray-600">{log.date}</span>
                  <span
                    className={
                      log.status === 'Present' ? 'text-green-600' : log.status === 'Absent' ? 'text-red-600' : 'text-yellow-600'
                    }
                  >
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <h3 className="mb-3 font-semibold text-gray-800">Marks</h3>
          {marks.length === 0 ? (
            <p className="text-sm text-gray-500">No marks recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {marks.map((m) => (
                <div key={m._id} className="flex justify-between border-b py-2 text-sm">
                  <span className="text-gray-700">{m.examName}</span>
                  <span className="font-medium text-gray-800">
                    {m.scoreObtained} / {m.totalScore}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
