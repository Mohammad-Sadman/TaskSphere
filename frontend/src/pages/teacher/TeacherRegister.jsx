import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTeacherAuth } from '../../context/TeacherAuthContext';

export default function TeacherRegister() {
  const { register } = useTeacherAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', department: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/teacher/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-gray-100 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:flex">
        <div className="hidden w-1/2 flex-col justify-center bg-gradient-to-br from-purple-700 to-purple-900 p-12 text-white md:flex">
          <h1 className="mb-4 text-4xl font-bold">TeachSuite</h1>
          <p className="text-lg leading-relaxed text-purple-100">
            Join and start managing your courses, sections, and students today.
          </p>
        </div>

        <div className="w-full p-8 md:w-1/2 md:p-12">
          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">{error}</div>
          )}

          <h2 className="mb-6 text-3xl font-bold text-gray-800">Create Teacher Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-purple-600"
                placeholder="Dr. Jane Doe"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-purple-600"
                placeholder="you@school.edu"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Department (optional)</label>
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-purple-600"
                placeholder="e.g., Computer Science"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-purple-600"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-purple-600 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/teacher/login" className="font-semibold text-purple-600 hover:underline">
              Login here
            </Link>
          </p>
          <p className="mt-3 text-center text-xs text-gray-400">
            <Link to="/login" className="hover:underline">Student login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
