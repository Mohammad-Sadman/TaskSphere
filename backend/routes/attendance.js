const express = require('express');
const Student = require('../models/Student');
const AttendanceLog = require('../models/AttendanceLog');
const { protectTeacher } = require('../middleware/teacherAuth');
const { getOwnedSection } = require('../utils/teacherOwnership');

const router = express.Router();

router.use(protectTeacher);

// GET /api/teacher/attendance?sectionId=...&date=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const { sectionId, date } = req.query;
    if (!sectionId) return res.status(400).json({ message: 'sectionId is required' });

    const owned = await getOwnedSection(sectionId, req.teacher._id);
    if (!owned) return res.status(404).json({ message: 'Section not found' });

    const students = await Student.find({ section: sectionId }).sort({ rollNo: 1 });

    let existing = [];
    if (date) {
      existing = await AttendanceLog.find({ section: sectionId, date });
    }

    res.json({ students, existing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/teacher/attendance - bulk mark attendance for a date
// body: { sectionId, date, statuses: { [studentId]: 'Present' | 'Absent' | 'Late' } }
router.post('/', async (req, res) => {
  try {
    const { sectionId, date, statuses } = req.body;
    if (!sectionId || !date || !statuses) {
      return res.status(400).json({ message: 'sectionId, date, and statuses are required' });
    }

    const owned = await getOwnedSection(sectionId, req.teacher._id);
    if (!owned) return res.status(404).json({ message: 'Section not found' });

    const ops = Object.entries(statuses).map(([studentId, status]) => ({
      updateOne: {
        filter: { student: studentId, section: sectionId, date },
        update: { $set: { status } },
        upsert: true,
      },
    }));

    if (ops.length) {
      await AttendanceLog.bulkWrite(ops);
    }

    res.json({ message: 'Attendance saved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/teacher/attendance/export?sectionId=... - CSV download
router.get('/export', async (req, res) => {
  try {
    const { sectionId } = req.query;
    const owned = await getOwnedSection(sectionId, req.teacher._id);
    if (!owned) return res.status(404).json({ message: 'Section not found' });

    const students = await Student.find({ section: sectionId }).sort({ rollNo: 1 });
    const logs = await AttendanceLog.find({ section: sectionId }).sort({ date: 1 });

    const dates = [...new Set(logs.map((l) => l.date))].sort();
    const byStudentDate = {};
    logs.forEach((l) => {
      byStudentDate[`${l.student}_${l.date}`] = l.status;
    });

    const escapeCsv = (val) => `"${String(val).replace(/"/g, '""')}"`;

    const header = ['Roll No', 'Name', ...dates].map(escapeCsv).join(',');
    const rows = students.map((s) => {
      const cells = [s.rollNo, s.name, ...dates.map((d) => byStudentDate[`${s._id}_${d}`] || '')];
      return cells.map(escapeCsv).join(',');
    });

    const csv = [header, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_${sectionId}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
