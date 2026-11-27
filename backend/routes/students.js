const express = require('express');
const Student = require('../models/Student');
const AttendanceLog = require('../models/AttendanceLog');
const Mark = require('../models/Mark');
const { protectTeacher } = require('../middleware/teacherAuth');
const { getOwnedSection } = require('../utils/teacherOwnership');

const router = express.Router();

router.use(protectTeacher);

const parseStudentLines = (raw) => {
  if (!raw) return [];
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(',').map((p) => p.trim()))
    .filter((parts) => parts.length >= 2)
    .map((parts) => ({ rollNo: parts[0], name: parts[1], email: parts[2] || '' }));
};

// GET /api/teacher/students?sectionId=...
router.get('/', async (req, res) => {
  try {
    const { sectionId } = req.query;
    if (!sectionId) return res.status(400).json({ message: 'sectionId is required' });

    const owned = await getOwnedSection(sectionId, req.teacher._id);
    if (!owned) return res.status(404).json({ message: 'Section not found' });

    const students = await Student.find({ section: sectionId }).sort({ rollNo: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/teacher/students - add single student
router.post('/', async (req, res) => {
  try {
    const { sectionId, rollNo, name, email } = req.body;
    const owned = await getOwnedSection(sectionId, req.teacher._id);
    if (!owned) return res.status(404).json({ message: 'Section not found' });

    if (!rollNo || !name) {
      return res.status(400).json({ message: 'Roll number and name are required' });
    }

    const student = await Student.create({
      section: sectionId,
      rollNo: rollNo.trim(),
      name: name.trim(),
      email: (email || '').trim(),
    });
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/teacher/students/import - bulk CSV-style paste
router.post('/import', async (req, res) => {
  try {
    const { sectionId, csvData } = req.body;
    const owned = await getOwnedSection(sectionId, req.teacher._id);
    if (!owned) return res.status(404).json({ message: 'Section not found' });

    const parsed = parseStudentLines(csvData).map((s) => ({ ...s, section: sectionId }));
    if (!parsed.length) {
      return res.status(400).json({ message: 'No valid student rows found' });
    }
    const created = await Student.insertMany(parsed);
    res.status(201).json({ count: created.length, students: created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/teacher/students/:id/profile - roster student detail (attendance % + marks)
router.get('/:id/profile', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const owned = await getOwnedSection(student.section, req.teacher._id);
    if (!owned) return res.status(404).json({ message: 'Student not found' });

    const logs = await AttendanceLog.find({ student: student._id }).sort({ date: -1 });
    const total = logs.length;
    const present = logs.filter((l) => l.status === 'Present').length;

    const marks = await Mark.find({ student: student._id }).sort({ examName: 1 });

    res.json({
      student,
      section: owned.section,
      course: owned.course,
      attendance: {
        logs,
        total,
        present,
        percentage: total > 0 ? Math.round((present / total) * 1000) / 10 : 0,
      },
      marks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/teacher/students/:id
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const owned = await getOwnedSection(student.section, req.teacher._id);
    if (!owned) return res.status(404).json({ message: 'Student not found' });

    const { rollNo, name, email } = req.body;
    if (rollNo !== undefined) student.rollNo = rollNo.trim();
    if (name !== undefined) student.name = name.trim();
    if (email !== undefined) student.email = email.trim();

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/teacher/students/:id
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const owned = await getOwnedSection(student.section, req.teacher._id);
    if (!owned) return res.status(404).json({ message: 'Student not found' });

    await Promise.all([
      AttendanceLog.deleteMany({ student: student._id }),
      Mark.deleteMany({ student: student._id }),
      student.deleteOne(),
    ]);

    res.json({ message: 'Student removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
