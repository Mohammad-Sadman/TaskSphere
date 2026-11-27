const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Section = require('../models/Section');
const Student = require('../models/Student');
const AttendanceLog = require('../models/AttendanceLog');
const Syllabus = require('../models/Syllabus');
const Mark = require('../models/Mark');
const Reminder = require('../models/Reminder');
const { protectAdmin } = require('../middleware/adminAuth');

const router = express.Router();

router.use(protectAdmin);

// ---------- Overview ----------

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalTasks, totalTeachers, totalCourses, totalSections, totalRosterStudents] =
      await Promise.all([
        User.countDocuments(),
        Task.countDocuments(),
        Teacher.countDocuments(),
        Course.countDocuments(),
        Section.countDocuments(),
        Student.countDocuments(),
      ]);
    res.json({
      totalUsers,
      totalTasks,
      totalTeachers,
      totalCourses,
      totalSections,
      totalRosterStudents,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- Student (task-manager) accounts ----------

// GET /api/admin/users?search=
router.get('/users', async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    const withCounts = await Promise.all(
      users.map(async (u) => ({
        ...u.toObject(),
        taskCount: await Task.countDocuments({ user: u._id }),
      }))
    );
    res.json(withCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/users/:id
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const tasks = await Task.find({ user: user._id }).sort({ createdAt: -1 });
    res.json({ user, tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email } = req.body;
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;

    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/users/:id/reset-password
router.put('/users/:id/reset-password', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/users/:id - cascades to their tasks
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Promise.all([Task.deleteMany({ user: user._id }), user.deleteOne()]);
    res.json({ message: 'User and their tasks removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- Tasks ----------

// GET /api/admin/tasks?userId=
router.get('/tasks', async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { user: userId } : {};
    const tasks = await Task.find(filter).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/tasks/:id
router.put('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, description, deadline, priority, status } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (deadline !== undefined) task.deadline = deadline;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/tasks/:id
router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- Teachers ----------

// GET /api/admin/teachers?search=
router.get('/teachers', async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};
    const teachers = await Teacher.find(filter).select('-password').sort({ createdAt: -1 });
    const withCounts = await Promise.all(
      teachers.map(async (t) => ({
        ...t.toObject(),
        courseCount: await Course.countDocuments({ teacher: t._id }),
      }))
    );
    res.json(withCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/teachers - admin creates a teacher account
router.post('/teachers', async (req, res) => {
  try {
    const { name, email, password, department } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const exists = await Teacher.findOne({ email });
    if (exists) return res.status(400).json({ message: 'A teacher already exists with this email' });

    const teacher = await Teacher.create({ name, email, password, department });
    res.status(201).json({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      isActive: teacher.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/teachers/:id - detail with their courses/sections
router.get('/teachers/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select('-password');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const courses = await Course.find({ teacher: teacher._id });
    const courseIds = courses.map((c) => c._id);
    const sections = await Section.find({ course: { $in: courseIds } });
    const sectionIds = sections.map((s) => s._id);
    const rosterCount = await Student.countDocuments({ section: { $in: sectionIds } });

    res.json({ teacher, courses, sections, rosterCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/teachers/:id
router.put('/teachers/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const { name, email, department, isActive } = req.body;
    if (name !== undefined) teacher.name = name;
    if (email !== undefined) teacher.email = email;
    if (department !== undefined) teacher.department = department;
    if (isActive !== undefined) teacher.isActive = isActive;

    await teacher.save();
    res.json({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      isActive: teacher.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/teachers/:id/reset-password
router.put('/teachers/:id/reset-password', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    teacher.password = newPassword;
    await teacher.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/teachers/:id - cascades through courses/sections/roster/attendance/marks/syllabus/reminders
router.delete('/teachers/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const courses = await Course.find({ teacher: teacher._id });
    const courseIds = courses.map((c) => c._id);
    const sections = await Section.find({ course: { $in: courseIds } });
    const sectionIds = sections.map((s) => s._id);
    const students = await Student.find({ section: { $in: sectionIds } });
    const studentIds = students.map((s) => s._id);

    await Promise.all([
      AttendanceLog.deleteMany({ section: { $in: sectionIds } }),
      Syllabus.deleteMany({ section: { $in: sectionIds } }),
      Mark.deleteMany({ section: { $in: sectionIds } }),
      Student.deleteMany({ _id: { $in: studentIds } }),
      Section.deleteMany({ _id: { $in: sectionIds } }),
      Course.deleteMany({ _id: { $in: courseIds } }),
      Reminder.deleteMany({ teacher: teacher._id }),
      teacher.deleteOne(),
    ]);

    res.json({ message: 'Teacher and all related data removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- Courses (across all teachers) ----------

// GET /api/admin/courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find().populate('teacher', 'name email').sort({ createdAt: -1 });
    const withCounts = await Promise.all(
      courses.map(async (c) => ({
        ...c.toObject(),
        sectionCount: await Section.countDocuments({ course: c._id }),
      }))
    );
    res.json(withCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/courses/:id
router.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacher', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const sections = await Section.find({ course: course._id });
    res.json({ course, sections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/courses/:id
router.put('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const { courseCode, courseTitle, credits } = req.body;
    if (courseCode !== undefined) course.courseCode = courseCode;
    if (courseTitle !== undefined) course.courseTitle = courseTitle;
    if (credits !== undefined) course.credits = Number(credits);

    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/courses/:id - cascades to sections/roster/attendance/marks/syllabus
router.delete('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const sections = await Section.find({ course: course._id });
    const sectionIds = sections.map((s) => s._id);
    const students = await Student.find({ section: { $in: sectionIds } });
    const studentIds = students.map((s) => s._id);

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

// ---------- Sections ----------

// GET /api/admin/sections?courseId=
router.get('/sections', async (req, res) => {
  try {
    const { courseId } = req.query;
    const filter = courseId ? { course: courseId } : {};
    const sections = await Section.find(filter).populate({
      path: 'course',
      select: 'courseCode courseTitle teacher',
      populate: { path: 'teacher', select: 'name email' },
    });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/sections/:id
router.get('/sections/:id', async (req, res) => {
  try {
    const section = await Section.findById(req.params.id).populate({
      path: 'course',
      populate: { path: 'teacher', select: 'name email' },
    });
    if (!section) return res.status(404).json({ message: 'Section not found' });
    const students = await Student.find({ section: section._id }).sort({ rollNo: 1 });
    res.json({ section, students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/sections/:id
router.put('/sections/:id', async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });

    const { sectionName, roomNumber, schedule } = req.body;
    if (sectionName !== undefined) section.sectionName = sectionName;
    if (roomNumber !== undefined) section.roomNumber = roomNumber;
    if (Array.isArray(schedule)) section.schedule = schedule;

    await section.save();
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/sections/:id - cascades to roster/attendance/marks/syllabus
router.delete('/sections/:id', async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });

    const students = await Student.find({ section: section._id });
    const studentIds = students.map((s) => s._id);

    await Promise.all([
      AttendanceLog.deleteMany({ section: section._id }),
      Syllabus.deleteMany({ section: section._id }),
      Mark.deleteMany({ section: section._id }),
      Student.deleteMany({ _id: { $in: studentIds } }),
      section.deleteOne(),
    ]);

    res.json({ message: 'Section and all related data removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- Roster students (a teacher's section students) ----------

// GET /api/admin/section-students?sectionId=
router.get('/section-students', async (req, res) => {
  try {
    const { sectionId } = req.query;
    const filter = sectionId ? { section: sectionId } : {};
    const students = await Student.find(filter).sort({ rollNo: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/section-students/:id
router.delete('/section-students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

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
