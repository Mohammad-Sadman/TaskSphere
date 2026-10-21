import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  sectionAPI,
  studentAPI,
  attendanceAPI,
  syllabusAPI,
  marksAPI,
} from '../../services/teacherApi';
import { TEACHER_TOKEN_KEY } from '../../services/teacherApi';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const TABS = ['Overview', 'Students', 'Attendance', 'Syllabus', 'Marks'];

export default function SectionDetail() {
  const { id } = useParams();
  const [tab, setTab] = useState('Overview');
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await sectionAPI.getSection(id);
    setOverview(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !overview) return <div className="p-10 text-center text-gray-500">Loading…</div>;

  const { section, course, students, attendanceStats, syllabus, syllabusPercentage } = overview;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1 text-sm text-purple-600">
            <Link to="/teacher/courses" className="hover:underline">
              My Courses
            </Link>{' '}
            / {course.courseCode}
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            {course.courseTitle} — {section.sectionName}
          </h1>
          <p className="mt-1 text-gray-600">
            {course.courseCode} • {course.credits} Credits {section.roomNumber && `• Room ${section.roomNumber}`}
          </p>
        </div>
        <Link
          to={`/teacher/sections/${id}/edit`}
          className="rounded-lg bg-white px-4 py-2 font-medium text-purple-700 shadow-md transition hover:bg-purple-50"
        >
          Edit Section
        </Link>
      </div>

      <div className="mb-6 flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-semibold transition ${
              tab === t
                ? 'border-b-2 border-purple-600 text-purple-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <OverviewTab section={section} students={students} syllabusPercentage={syllabusPercentage} attendanceStats={attendanceStats} />
      )}
      {tab === 'Students' && <StudentsTab sectionId={id} students={students} onChange={load} />}
      {tab === 'Attendance' && <AttendanceTab sectionId={id} students={students} />}
      {tab === 'Syllabus' && <SyllabusTab sectionId={id} syllabus={syllabus} onChange={load} />}
      {tab === 'Marks' && <MarksTab sectionId={id} students={students} />}
    </div>
  );
}

function OverviewTab({ section, students, syllabusPercentage, attendanceStats }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="rounded-xl bg-white p-6 shadow-md md:col-span-1">
        <h3 className="mb-3 font-semibold text-gray-800">Weekly Schedule</h3>
        {section.schedule.length === 0 ? (
          <p className="text-sm text-gray-500">No class times set.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {section.schedule.map((s, i) => (
              <li key={i} className="flex justify-between rounded bg-gray-50 px-3 py-2">
                <span className="font-medium text-gray-700">{s.dayOfWeek}</span>
                <span className="text-gray-500">
                  {s.startTime} - {s.endTime}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="rounded-xl bg-white p-6 shadow-md md:col-span-1">
        <h3 className="mb-3 font-semibold text-gray-800">Syllabus Progress</h3>
        <div className="mb-2 h-3 w-full rounded-full bg-gray-200">
          <div className="h-3 rounded-full bg-purple-600" style={{ width: `${syllabusPercentage}%` }} />
        </div>
        <p className="text-sm text-gray-600">{syllabusPercentage}% complete</p>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-md md:col-span-1">
        <h3 className="mb-3 font-semibold text-gray-800">Class Size</h3>
        <div className="text-4xl font-bold text-purple-700">{students.length}</div>
        <p className="text-sm text-gray-600">students enrolled</p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-md md:col-span-3">
        <h3 className="mb-3 font-semibold text-gray-800">Students &amp; Attendance</h3>
        {students.length === 0 ? (
          <p className="text-sm text-gray-500">No students yet — add them in the Students tab.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2">Roll No</th>
                <th className="py-2">Name</th>
                <th className="py-2">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-b last:border-0">
                  <td className="py-2">{s.rollNo}</td>
                  <td className="py-2">
                    <Link to={`/teacher/students/${s._id}`} className="text-purple-600 hover:underline">
                      {s.name}
                    </Link>
                  </td>
                  <td className="py-2">{attendanceStats[s._id]?.percentage ?? 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StudentsTab({ sectionId, students, onChange }) {
  const [form, setForm] = useState({ rollNo: '', name: '', email: '' });
  const [csv, setCsv] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const addStudent = async (e) => {
    e.preventDefault();
    await studentAPI.addStudent({ sectionId, ...form });
    setForm({ rollNo: '', name: '', email: '' });
    onChange();
  };

  const doImport = async (e) => {
    e.preventDefault();
    await studentAPI.importStudents({ sectionId, csvData: csv });
    setCsv('');
    setShowImport(false);
    onChange();
  };

  const remove = async () => {
    await studentAPI.deleteStudent(toDelete);
    setToDelete(null);
    onChange();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Add Student</h3>
          <button onClick={() => setShowImport(!showImport)} className="text-sm text-purple-600 hover:underline">
            {showImport ? 'Add single student instead' : 'Bulk import via CSV'}
          </button>
        </div>

        {!showImport ? (
          <form onSubmit={addStudent} className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Roll No</label>
              <input
                required
                value={form.rollNo}
                onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                className="rounded-lg border border-gray-300 p-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-lg border border-gray-300 p-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Email (optional)</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-lg border border-gray-300 p-2 text-sm"
              />
            </div>
            <button type="submit" className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">
              Add
            </button>
          </form>
        ) : (
          <form onSubmit={doImport}>
            <p className="mb-2 text-sm text-gray-600">
              Format: <code className="rounded bg-gray-100 px-2 py-1">RollNo, Name, Email</code> — one per line
            </p>
            <textarea
              rows={5}
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 font-mono text-sm"
              placeholder={'101, John Doe, john@example.com\n102, Jane Smith'}
            />
            <button type="submit" className="mt-3 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">
              Import
            </button>
          </form>
        )}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-md">
        <h3 className="mb-4 font-semibold text-gray-800">Roster ({students.length})</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2">Roll No</th>
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-b last:border-0">
                <td className="py-2">{s.rollNo}</td>
                <td className="py-2">
                  <Link to={`/teacher/students/${s._id}`} className="text-purple-600 hover:underline">
                    {s.name}
                  </Link>
                </td>
                <td className="py-2 text-gray-500">{s.email || '—'}</td>
                <td className="py-2 text-right">
                  <button onClick={() => setToDelete(s._id)} className="text-red-500 hover:text-red-700">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Remove student?"
        message="This removes the student along with their attendance and marks records."
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

function AttendanceTab({ sectionId, students }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState({});
  const [saved, setSaved] = useState(false);

  const loadForDate = async (d) => {
    const { data } = await attendanceAPI.get(sectionId, d);
    const initial = {};
    students.forEach((s) => {
      const existing = data.existing.find((l) => l.student === s._id);
      initial[s._id] = existing ? existing.status : 'Present';
    });
    setStatuses(initial);
  };

  useEffect(() => {
    loadForDate(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const save = async () => {
    await attendanceAPI.save({ sectionId, date, statuses });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportCsv = () => {
    const token = localStorage.getItem(TEACHER_TOKEN_KEY);
    window.open(attendanceAPI.exportUrl(sectionId, token), '_blank');
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-gray-300 p-2 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300">
            Export CSV
          </button>
          <button onClick={save} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">
            {saved ? 'Saved ✓' : 'Save Attendance'}
          </button>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="py-2">Roll No</th>
            <th className="py-2">Name</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id} className="border-b last:border-0">
              <td className="py-2">{s.rollNo}</td>
              <td className="py-2">{s.name}</td>
              <td className="py-2">
                <div className="flex gap-2">
                  {['Present', 'Absent', 'Late'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setStatuses((prev) => ({ ...prev, [s._id]: opt }))}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        statuses[s._id] === opt
                          ? opt === 'Present'
                            ? 'bg-green-600 text-white'
                            : opt === 'Absent'
                            ? 'bg-red-600 text-white'
                            : 'bg-yellow-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SyllabusTab({ sectionId, syllabus, onChange }) {
  const [topic, setTopic] = useState('');

  const add = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    await syllabusAPI.addTopic({ sectionId, topicName: topic });
    setTopic('');
    onChange();
  };

  const toggle = async (id) => {
    await syllabusAPI.toggleTopic(id);
    onChange();
  };

  const remove = async (id) => {
    await syllabusAPI.deleteTopic(id);
    onChange();
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <form onSubmit={add} className="mb-6 flex gap-3">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Chapter 3 — Recursion"
          className="flex-1 rounded-lg border border-gray-300 p-3 text-sm"
        />
        <button type="submit" className="rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700">
          Add Topic
        </button>
      </form>

      {syllabus.length === 0 ? (
        <p className="text-sm text-gray-500">No topics added yet.</p>
      ) : (
        <ul className="space-y-2">
          {syllabus.map((t) => (
            <li key={t._id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <label className="flex flex-1 cursor-pointer items-center gap-3">
                <input type="checkbox" checked={t.isCompleted} onChange={() => toggle(t._id)} className="h-4 w-4 accent-purple-600" />
                <span className={t.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}>{t.topicName}</span>
              </label>
              <button onClick={() => remove(t._id)} className="text-red-500 hover:text-red-700">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MarksTab({ sectionId, students }) {
  const [exams, setExams] = useState([]);
  const [marks, setMarks] = useState([]);
  const [examName, setExamName] = useState('');
  const [totalScore, setTotalScore] = useState('');
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await marksAPI.get(sectionId);
    setExams(data.exams);
    setMarks(data.marks);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getScore = (studentId, exam) => marks.find((m) => m.student === studentId && m.examName === exam)?.scoreObtained ?? '';

  const saveExam = async (e) => {
    e.preventDefault();
    if (!examName.trim() || !totalScore) return;
    await marksAPI.save({ sectionId, examName, totalScore, scores });
    setExamName('');
    setTotalScore('');
    setScores({});
    load();
  };

  const deleteExam = async (exam) => {
    await marksAPI.deleteExam(sectionId, exam);
    load();
  };

  const exportCsv = () => {
    const token = localStorage.getItem(TEACHER_TOKEN_KEY);
    window.open(`/api/teacher/marks/export/csv?sectionId=${sectionId}&_t=${encodeURIComponent(token || '')}`, '_blank');
  };

  if (loading) return <div className="text-gray-500">Loading marks…</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h3 className="mb-4 font-semibold text-gray-800">Add / Update Exam Scores</h3>
        <form onSubmit={saveExam}>
          <div className="mb-4 flex gap-3">
            <input
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="Exam name (e.g., Midterm)"
              className="flex-1 rounded-lg border border-gray-300 p-2 text-sm"
            />
            <input
              type="number"
              value={totalScore}
              onChange={(e) => setTotalScore(e.target.value)}
              placeholder="Total marks"
              className="w-40 rounded-lg border border-gray-300 p-2 text-sm"
            />
          </div>
          <table className="mb-4 w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2">Roll No</th>
                <th className="py-2">Name</th>
                <th className="py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-b last:border-0">
                  <td className="py-2">{s.rollNo}</td>
                  <td className="py-2">{s.name}</td>
                  <td className="py-2">
                    <input
                      type="number"
                      value={scores[s._id] ?? ''}
                      onChange={(e) => setScores((prev) => ({ ...prev, [s._id]: e.target.value }))}
                      className="w-24 rounded border border-gray-300 p-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="submit" className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700">
            Save Scores
          </button>
        </form>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Gradebook</h3>
          <button onClick={exportCsv} className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300">
            Export CSV
          </button>
        </div>
        {exams.length === 0 ? (
          <p className="text-sm text-gray-500">No exams recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2">Roll No</th>
                <th className="py-2">Name</th>
                {exams.map((ex) => (
                  <th key={ex.examName} className="py-2">
                    <div className="flex items-center gap-1">
                      {ex.examName} / {ex.totalScore}
                      <button onClick={() => deleteExam(ex.examName)} className="text-red-400 hover:text-red-600" title="Delete exam">
                        ✕
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-b last:border-0">
                  <td className="py-2">{s.rollNo}</td>
                  <td className="py-2">{s.name}</td>
                  {exams.map((ex) => (
                    <td key={ex.examName} className="py-2">
                      {getScore(s._id, ex.examName) === '' ? '—' : getScore(s._id, ex.examName)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
