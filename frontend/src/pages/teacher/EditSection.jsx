import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sectionAPI } from '../../services/teacherApi';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function EditSection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ sectionName: '', roomNumber: '' });
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await sectionAPI.getSection(id);
      setForm({ sectionName: data.section.sectionName, roomNumber: data.section.roomNumber });
      setSchedule(data.section.schedule.length ? data.section.schedule : [{ dayOfWeek: '', startTime: '', endTime: '' }]);
      setLoading(false);
    })();
  }, [id]);

  const updateSlot = (i, field, value) =>
    setSchedule((prev) => prev.map((slot, idx) => (idx === i ? { ...slot, [field]: value } : slot)));
  const addSlot = () => setSchedule((prev) => [...prev, { dayOfWeek: '', startTime: '', endTime: '' }]);
  const removeSlot = (i) => setSchedule((prev) => prev.filter((_, idx) => idx !== i));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    await sectionAPI.updateSection(id, { ...form, schedule: schedule.filter((s) => s.dayOfWeek && s.startTime && s.endTime) });
    setSaving(false);
    navigate(`/teacher/sections/${id}`);
  };

  const remove = async () => {
    await sectionAPI.deleteSection(id);
    navigate('/teacher/courses');
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Edit Section</h1>

      <form onSubmit={save} className="space-y-6 rounded-xl bg-white p-8 shadow-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Section Name</label>
            <input
              required
              value={form.sectionName}
              onChange={(e) => setForm({ ...form, sectionName: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Room Number</label>
            <input
              value={form.roomNumber}
              onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-semibold text-gray-800">Weekly Schedule</h2>
          <div className="space-y-3">
            {schedule.map((slot, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                <select
                  value={slot.dayOfWeek}
                  onChange={(e) => updateSlot(i, 'dayOfWeek', e.target.value)}
                  className="rounded-lg border border-gray-300 p-2"
                >
                  <option value="">Select Day</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <input type="time" value={slot.startTime} onChange={(e) => updateSlot(i, 'startTime', e.target.value)} className="rounded-lg border border-gray-300 p-2" />
                <input type="time" value={slot.endTime} onChange={(e) => updateSlot(i, 'endTime', e.target.value)} className="rounded-lg border border-gray-300 p-2" />
                <button type="button" onClick={() => removeSlot(i)} className="px-2 text-xl font-bold text-red-600 hover:text-red-800">
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addSlot} className="mt-3 font-medium text-purple-600 hover:text-purple-800">
            + Add Class Time
          </button>
        </div>

        <div className="flex items-center justify-between border-t pt-6">
          <button type="button" onClick={() => setConfirmDelete(true)} className="font-medium text-red-600 hover:text-red-800">
            Delete Section
          </button>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(`/teacher/sections/${id}`)} className="rounded-lg bg-gray-200 px-6 py-2 font-semibold text-gray-800 hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white hover:bg-purple-700 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this section?"
        message="This removes the section along with its students, attendance, syllabus, and marks. This cannot be undone."
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
