const priorityStyles = {
  Low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  High: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const statusStyles = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  Completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
};

const statusCycle = ['Pending', 'In Progress', 'Completed'];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isOverdue(task) {
  return task.status !== 'Completed' && new Date(task.deadline) < new Date();
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const overdue = isOverdue(task);

  const cycleStatus = () => {
    const idx = statusCycle.indexOf(task.status);
    const next = statusCycle[(idx + 1) % statusCycle.length];
    onStatusChange(task._id, next);
  };

  return (
    <div className={`card transition hover:shadow-md ${overdue ? 'border-red-300 dark:border-red-800' : ''}`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
        <div className="flex shrink-0 gap-1">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[task.priority]}`}>
            {task.priority}
          </span>
          {overdue && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
              Overdue
            </span>
          )}
        </div>
      </div>

      {task.description && (
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={overdue ? 'font-medium text-red-600 dark:text-red-400' : ''}>
          Due: {formatDate(task.deadline)}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={cycleStatus}
          className={`rounded-full px-3 py-1 text-xs font-medium transition hover:opacity-80 ${statusStyles[task.status]}`}
        >
          {task.status}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-primary-600 transition hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
