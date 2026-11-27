const express = require('express');
const Course = require('../models/Course');
const Section = require('../models/Section');
const Student = require('../models/Student');
const { protectTeacher } = require('../middleware/teacherAuth');

const router = express.Router();

router.use(protectTeacher);

// Parse "RollNo, Name, Email" textarea lines into student docs
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

// GET /api/teacher/courses - list courses with section + student counts
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.teacher._id }).sort({ createdAt: -1 }).lean();

    const results = await Promise.all(
      courses.map(async (course) => {
        const sections = await Section.find({ course: course._id }).lean();
        const sectionIds = sections.map((s) => s._id);
        const studentCount = await Student.countDocuments({ section: { $in: sectionIds } });
        return {
          ...course,
          sections,
          sectionCount: sections.length,
          studentCount,
        };
      })
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/teacher/courses - create course + initial section + schedule + bulk students
router.post('/', async (req, res) => {
  try {
    const { courseCode, courseTitle, credits, sectionName, roomNumber, schedule, studentsText } = req.body;

    if (!courseCode || !courseTitle || !credits || !sectionName) {
      return res.status(400).json({ message: 'Course code, title, credits, and section name are required' });
    }

    const course = await Course.create({
      teacher: req.teacher._id,
      courseCode: courseCode.trim(),
      courseTitle: courseTitle.trim(),
      credits: Number(credits),
    });

    const section = await Section.create({
      course: course._id,
      sectionName: sectionName.trim(),
      roomNumber: (roomNumber || '').trim(),
      schedule: Array.isArray(schedule)
        ? schedule.filter((s) => s.dayOfWeek && s.startTime && s.endTime)
        : [],
    });

    const studentDocs = parseStudentLines(studentsText).map((s) => ({ ...s, section: section._id }));
    if (studentDocs.length) {
      await Student.insertMany(studentDocs);
    }

    res.status(201).json({ course, section });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/teacher/courses/:id
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.teacher._id });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const sections = await Section.find({ course: course._id });
    res.json({ course, sections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/teacher/courses/:id
router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.teacher._id });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const { courseCode, courseTitle, credits } = req.body;
    if (courseCode !== undefined) course.courseCode = courseCode.trim();
    if (courseTitle !== undefined) course.courseTitle = courseTitle.trim();
    if (credits !== undefined) course.credits = Number(credits);

    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/teacher/courses/:id - cascades to sections/students/attendance/marks/syllabus
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.teacher._id });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const sections = await Section.find({ course: course._id });
    const sectionIds = sections.map((s) => s._id);
    const students = await Student.find({ section: { $in: sectionIds } });
    const studentIds = students.map((s) => s._id);

    const AttendanceLog = require('../models/AttendanceLog');
    const Syllabus = require('../models/Syllabus');
    const Mark = require('../models/Mark');

    await Promise.all([
      AttendanceLog.deleteMany({ section: { $in: sectionIds } }),
      Syllabus.deleteMany({ section: { $in: sectionIds } }),
      Mark.deleteMany({ section: { $in: sectionIds } }),
      Student.deleteMany({ _id: { $in: studentIds } }),
      Section.deleteMany({ _id: { $in: sectionIds } }),
      course.deleteOne(),
    ]);

    res.json({ message: 'Course and all related data removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
