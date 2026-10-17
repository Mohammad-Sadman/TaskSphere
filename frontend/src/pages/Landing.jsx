import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="text-center">
        <span className="inline-block rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
          IIUC CSE-3532 Project
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
          Student Task Manager
          <span className="block text-primary-600">System</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          A centralized platform for university students to create, manage, prioritize, and track
          academic tasks — from a single dashboard accessible on any device.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/register" className="btn-primary px-8 py-3 text-base">
            Get Started Free
          </Link>
          <Link to="/login" className="btn-secondary px-8 py-3 text-base">
            Sign In
          </Link>
        </div>
      </div>

      {/* Role portal selector (new) — lets Student / Teacher / Admin find their own login area */}
      <div className="mx-auto mt-16 max-w-4xl">
        <p className="mb-4 text-center text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Continue as
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            to="/login"
            className="card flex flex-col items-center gap-2 text-center transition hover:border-primary-400 hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              🎓
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">Student</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Manage your own tasks</span>
          </Link>

          <Link
            to="/teacher/login"
            className="card flex flex-col items-center gap-2 text-center transition hover:border-purple-400 hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-100 text-purple-700">
              🧑‍🏫
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">Teacher</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Courses, attendance & marks</span>
          </Link>

          <Link
            to="/admin/login"
            className="card flex flex-col items-center gap-2 text-center transition hover:border-slate-400 hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              🛡️
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">Admin</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Full system control</span>
          </Link>
        </div>
      </div>

      <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: 'Task Management', desc: 'Create, edit, delete tasks with deadlines and priority levels.' },
          { title: 'Smart Dashboard', desc: 'Visual summary of total, completed, pending, and overdue tasks.' },
          { title: 'Search & Filter', desc: 'Live search by title, filter by status, sort by deadline.' },
          { title: 'Progress Tracking', desc: 'Toggle tasks between Pending, In Progress, and Completed.' },
          { title: 'Analytics Charts', desc: 'Chart.js visualizations for status and priority distribution.' },
          { title: 'Dark / Light Mode', desc: 'Comfortable theme for studying day or night.' },
        ].map((feature) => (
          <div key={feature.title} className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
          </div>
        ))}
      </div>

      <p className="mt-16 text-center text-sm text-gray-500 dark:text-gray-500">
        Minhaj Hasan Rohan · Mohammad Sadman Tahiat · Ahsan Miran
      </p>
    </div>
  );
}