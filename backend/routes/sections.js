const express = require('express');
const Section = require('../models/Section');
const Course = require('../models/Course');
const Student = require('../models/Student');
const AttendanceLog = require('../models/AttendanceLog');
const Syllabus = require('../models/Syllabus');
const { protectTeacher } = require('../middleware/teacherAuth');

const router = express.Router();

router.use(protectTeacher);

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Helper: verify the section belongs to a course owned by this teacher
const getOwnedSection = async (sectionId, teacherId) => {
  const section = await Section.findById(sectionId);
  if (!section) return null;
  const course = await Course.findOne({ _id: section.course, teacher: teacherId });
  if (!course) return null;
  return { section, course };
};

// GET /api/teacher/sections/:id - full overview (schedule, students+attendance%, syllabus%)
router.get('/:id', async (req, res) => {
  try {
    const owned = await getOwnedSection(req.params.id, req.teacher._id);
    if (!owned) return res.status(404).json({ message: 'Section not found' });
    const { section, course } = owned;

    const students = await Student.find({ section: section._id }).sort({ rollNo: 1 });

    const attendanceStats = {};
    for (const student of students) {
      const logs = await AttendanceLog.find({ student: student._id, section: section._id });
      const total = logs.length;
      const present = logs.filter((l) => l.status === 'Present').length;
      attendanceStats[student._id] = {
        total,
        present,
        percentage: total > 0 ? Math.round((present / total) * 1000) / 10 : 0,
      };
    }

    const syllabus = await Syllabus.find({ section: section._id }).sort({ createdAt: 1 });
    const completedTopics = syllabus.filter((t) => t.isCompleted).length;
    const syllabusPercentage =
      syllabus.length > 0 ? Math.round((completedTopics / syllabus.length) * 1000) / 10 : 0;

    const scheduleSorted = [...section.schedule].sort(
      (a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek)
    );

    res.json({
      section: { ...section.toObject(), schedule: scheduleSorted },
      course,
      students,
      attendanceStats,
      syllabus,
      syllabusPercentage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/teacher/sections/:id - update name/room/schedule
router.put('/:id', async (req, res) => {
  try {
    const owned = await getOwnedSection(req.params.id, req.teacher._id);
    if (!owned) return res.status(404).json({ message: 'Section not found' });

    const { sectionName, roomNumber, schedule } = req.body;
    const section = owned.section;

    if (sectionName !== undefined) section.sectionName = sectionName.trim();
    if (roomNumber !== undefined) section.roomNumber = roomNumber.trim();
    if (Array.isArray(schedule)) {
      section.schedule = schedule.filter((s) => s.dayOfWeek && s.startTime && s.endTime);
    }

    await section.save();
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/teacher/sections/:id - cascades to students/attendance/marks/syllabus
router.delete('/:id', async (req, res) => {
  try {
    const owned = await getOwnedSection(req.params.id, req.teacher._id);
    if (!owned) return res.status(404).json({ message: 'Section not found' });

    const Mark = require('../models/Mark');
    const students = await Student.find({ section: owned.section._id });
    const studentIds = students.map((s) => s._id);

    await Promise.all([
      AttendanceLog.deleteMany({ section: owned.section._id }),
      Syllabus.deleteMany({ section: owned.section._id }),
      Mark.deleteMany({ section: owned.section._id }),
      Student.deleteMany({ _id: { $in: studentIds } }),
      owned.section.deleteOne(),
    ]);

    res.json({ message: 'Section and all related data removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;