import { useState } from 'react';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { teacherAuthAPI } from '../../services/teacherApi';

export default function TeacherProfile() {
  const { teacher, updateProfile } = useTeacherAuth();
  const [form, setForm] = useState({ name: teacher?.name || '', department: teacher?.department || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [error, setError] = useState('');
  const [pwError, setPwError] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      await updateProfile(form);
      setMsg('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg('');
    setPwError('');
    try {
      await teacherAuthAPI.changePassword(pwForm);
      setPwMsg('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">My Profile</h1>

      <div className="mb-6 rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Profile Details</h2>
        {msg && <div className="mb-4 rounded border border-green-400 bg-green-100 px-4 py-2 text-green-700">{msg}</div>}
        {error && <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-2 text-red-700">{error}</div>}
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-gray-300 p-3" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input value={teacher?.email || ''} disabled className="w-full rounded-lg border border-gray-200 bg-gray-100 p-3 text-gray-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Department</label>
            <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full rounded-lg border border-gray-300 p-3" />
          </div>
          <button type="submit" className="rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white hover:bg-purple-700">
            Save Changes
          </button>
        </form>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Change Password</h2>
        {pwMsg && <div className="mb-4 rounded border border-green-400 bg-green-100 px-4 py-2 text-green-700">{pwMsg}</div>}
        {pwError && <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-2 text-red-700">{pwError}</div>}
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              required
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          </div>
          <button type="submit" className="rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white hover:bg-purple-700">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
