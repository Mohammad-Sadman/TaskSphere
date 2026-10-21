import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../../services/teacherApi';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AddCourse() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    courseCode: '',
    courseTitle: '',
    credits: '',
    sectionName: '',
    roomNumber: '',
    studentsText: '',
  });
  const [schedule, setSchedule] = useState([{ dayOfWeek: '', startTime: '', endTime: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateSlot = (i, field, value) => {
    setSchedule((prev) => prev.map((slot, idx) => (idx === i ? { ...slot, [field]: value } : slot)));
  };

  const addSlot = () => setSchedule((prev) => [...prev, { dayOfWeek: '', startTime: '', endTime: '' }]);
  const removeSlot = (i) => setSchedule((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await courseAPI.createCourse({ ...form, schedule });
      navigate(`/teacher/sections/${data.section._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Add New Course</h1>
        <p className="mt-1 text-gray-600">Create a course, section, and add students</p>
      </div>

      {error && <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-8 shadow-md">
        <div>
          <h2 className="mb-4 border-b pb-2 text-xl font-semibold text-gray-800">Course Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Course Code *</label>
              <input
                required
                value={form.courseCode}
                onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-purple-600"
                placeholder="e.g., CSE-101"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Credits *</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-purple-600"
                placeholder="e.g., 3"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">Course Title *</label>
            <input
              required
              value={form.courseTitle}
              onChange={(e) => setForm({ ...form, courseTitle: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-purple-600"
              placeholder="e.g., Introduction to Programming"
            />
          </div>
        </div>

        <div>
          <h2 className="mb-4 border-b pb-2 text-xl font-semibold text-gray-800">Section Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Section Name *</label>
              <input
                required
                value={form.sectionName}
                onChange={(e) => setForm({ ...form, sectionName: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-purple-600"
                placeholder="e.g., Section A"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Room Number</label>
              <input
                value={form.roomNumber}
                onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-purple-600"
                placeholder="e.g., 304"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 border-b pb-2 text-xl font-semibold text-gray-800">Weekly Schedule</h2>
          <div className="space-y-3">
            {schedule.map((slot, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                <select
                  value={slot.dayOfWeek}
                  onChange={(e) => updateSlot(i, 'dayOfWeek', e.target.value)}
                  className="rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-purple-600"
                  required
                >
                  <option value="">Select Day</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  required
                  value={slot.startTime}
                  onChange={(e) => updateSlot(i, 'startTime', e.target.value)}
                  className="rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-purple-600"
                />
                <input
                  type="time"
                  required
                  value={slot.endTime}
                  onChange={(e) => updateSlot(i, 'endTime', e.target.value)}
                  className="rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-purple-600"
                />
                <button
                  type="button"
                  onClick={() => removeSlot(i)}
                  className="px-2 text-xl font-bold text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addSlot} className="mt-3 font-medium text-purple-600 transition hover:text-purple-800">
            + Add Class Time
          </button>
        </div>

        <div>
          <h2 className="mb-4 border-b pb-2 text-xl font-semibold text-gray-800">Add Students</h2>
          <p className="mb-3 text-sm text-gray-600">
            Enter student details in CSV format: <code className="rounded bg-gray-100 px-2 py-1">RollNo, Name, Email</code>
            <br />
            One student per line. Email is optional.
          </p>
          <textarea
            rows={8}
            value={form.studentsText}
            onChange={(e) => setForm({ ...form, studentsText: e.target.value })}
            placeholder={'101, John Doe, john@example.com\n102, Jane Smith, jane@example.com\n103, Bob Wilson'}
            className="w-full rounded-lg border border-gray-300 p-3 font-mono text-sm focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-purple-700 hover:shadow-lg disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create Course'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/teacher/courses')}
            className="flex-1 rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-800 transition hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
