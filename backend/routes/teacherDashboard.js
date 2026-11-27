const express = require('express');
const Course = require('../models/Course');
const Section = require('../models/Section');
const Student = require('../models/Student');
const AttendanceLog = require('../models/AttendanceLog');
const { protectTeacher } = require('../middleware/teacherAuth');

const router = express.Router();

router.use(protectTeacher);

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// GET /api/teacher/dashboard - today's classes + quick stats
router.get('/', async (req, res) => {
  try {
    const teacherId = req.teacher._id;
    const courses = await Course.find({ teacher: teacherId });
    const courseIds = courses.map((c) => c._id);
    const courseById = new Map(courses.map((c) => [String(c._id), c]));

    const sections = await Section.find({ course: { $in: courseIds } });
    const sectionIds = sections.map((s) => s._id);

    const today = dayNames[new Date().getDay()];
    const todaysClasses = [];
    sections.forEach((section) => {
      section.schedule
        .filter((slot) => slot.dayOfWeek === today)
        .forEach((slot) => {
          const course = courseById.get(String(section.course));
          todaysClasses.push({
            sectionId: section._id,
            sectionName: section.sectionName,
            roomNumber: section.roomNumber,
            courseCode: course?.courseCode,
            courseTitle: course?.courseTitle,
            startTime: slot.startTime,
            endTime: slot.endTime,
          });
        });
    });
    todaysClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));

    const totalStudents = await Student.countDocuments({ section: { $in: sectionIds } });
    const distinctDates = await AttendanceLog.distinct('date', { section: { $in: sectionIds } });

    res.json({
      todaysClasses,
      stats: {
        totalStudents,
        totalClassesConducted: distinctDates.length,
        totalCourses: courses.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;