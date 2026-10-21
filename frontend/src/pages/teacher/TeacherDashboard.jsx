import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teacherDashboardAPI, reminderAPI } from '../../services/teacherApi';
import { useTeacherAuth } from '../../context/TeacherAuthContext';

export default function TeacherDashboard() {
  const { teacher } = useTeacherAuth();
  const [data, setData] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', dueDate: '' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [dashRes, remRes] = await Promise.all([teacherDashboardAPI.get(), reminderAPI.getReminders()]);
    setData(dashRes.data);
    setReminders(remRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addReminder = async (e) => {
    e.preventDefault();
    await reminderAPI.addReminder(form);
    setForm({ title: '', dueDate: '' });
    setShowModal(false);
    load();
  };

  const completeReminder = async (id) => {
    await reminderAPI.complete(id);
    load();
  };

  const deleteReminder = async (id) => {
    await reminderAPI.deleteReminder(id);
    load();
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {teacher?.name}!</h1>
        <p className="mt-1 text-gray-600">
          Today is {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Today's Classes */}
        <div className="lg:col-span-4">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Today&apos;s Classes</h2>
          {data.todaysClasses.length === 0 ? (
            <div className="rounded-xl bg-white p-6 text-center shadow-md">
              <p className="text-gray-500">No classes scheduled for today</p>
              <Link to="/teacher/courses/new" className="mt-3 inline-block text-purple-600 hover:underline">
                Add your first course
              </Link>
            </div>
          ) : (
            data.todaysClasses.map((cls, i) => (
              <Link
                key={i}
                to={`/teacher/sections/${cls.sectionId}`}
                className="mb-4 block rounded-xl border-2 border-transparent bg-white p-5 shadow-md transition hover:border-purple-500 hover:shadow-lg"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="text-lg font-bold text-purple-700">{cls.courseCode}</div>
                  <div className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700">
                    {cls.startTime} - {cls.endTime}
                  </div>
                </div>
                <div className="mb-1 font-medium text-gray-700">{cls.courseTitle}</div>
                <div className="text-sm text-gray-500">
                  {cls.sectionName}
                  {cls.roomNumber && ` • Room ${cls.roomNumber}`}
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-4">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Quick Stats</h2>
          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 p-6 text-white shadow-md">
              <div className="text-4xl font-bold">{data.stats.totalStudents}</div>
              <div className="mt-1 text-purple-100">Total Students</div>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="text-4xl font-bold text-gray-800">{data.stats.totalClassesConducted}</div>
              <div className="mt-1 text-gray-600">Classes Conducted</div>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="text-4xl font-bold text-gray-800">{data.stats.totalCourses}</div>
              <div className="mt-1 text-gray-600">Active Courses</div>
            </div>
          </div>
        </div>

        {/* Reminders */}
        <div className="lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Reminders</h2>
            <button
              onClick={() => setShowModal(true)}
              className="rounded-lg bg-purple-600 px-3 py-1 text-sm text-white transition hover:bg-purple-700"
            >
              + Add
            </button>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-md">
            {reminders.length === 0 ? (
              <p className="py-8 text-center text-gray-500">No active reminders</p>
            ) : (
              <div className="space-y-3">
                {reminders.map((rem) => (
                  <div key={rem._id} className="border-l-4 border-purple-500 py-2 pl-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{rem.title}</div>
                        {rem.dueDate && (
                          <div className="mt-1 text-xs text-gray-500">
                            Due: {new Date(rem.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => completeReminder(rem._id)}
                          className="text-xs text-green-600 hover:text-green-800"
                          title="Mark complete"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => deleteReminder(rem._id)}
                          className="text-xs text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-xl font-bold">Add Reminder</h3>
            <form onSubmit={addReminder}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Task</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2"
                  placeholder="e.g., Grade midterm papers"
                />
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 rounded-lg bg-purple-600 py-2 text-white hover:bg-purple-700">
                  Add Reminder
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg bg-gray-300 py-2 text-gray-800 hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
