import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function TaskChart({ stats }) {
  const { darkMode } = useTheme();
  const textColor = darkMode ? '#e5e7eb' : '#374151';
  const gridColor = darkMode ? '#374151' : '#e5e7eb';

  const statusData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [
          stats?.byStatus?.Pending ?? 0,
          stats?.byStatus?.['In Progress'] ?? 0,
          stats?.byStatus?.Completed ?? 0,
        ],
        backgroundColor: ['#eab308', '#3b82f6', '#22c55e'],
        borderWidth: 0,
      },
    ],
  };

  const priorityData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        label: 'Tasks by Priority',
        data: [
          stats?.byPriority?.Low ?? 0,
          stats?.byPriority?.Medium ?? 0,
          stats?.byPriority?.High ?? 0,
        ],
        backgroundColor: ['#94a3b8', '#6366f1', '#ef4444'],
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: textColor },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor, stepSize: 1 }, grid: { color: gridColor }, beginAtZero: true },
    },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card">
        <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Task Status Distribution
        </h3>
        <div className="h-56">
          <Doughnut data={statusData} options={chartOptions} />
        </div>
      </div>
      <div className="card">
        <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Tasks by Priority
        </h3>
        <div className="h-56">
          <Bar data={priorityData} options={barOptions} />
        </div>
      </div>
    </div>
  );
}
