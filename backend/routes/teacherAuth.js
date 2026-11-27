const express = require('express');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const { protectTeacher } = require('../middleware/teacherAuth');
const { verifyFirebaseIdToken } = require('../config/firebaseAdmin');

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id, role: 'teacher' }, process.env.JWT_SECRET, { expiresIn: '30d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const exists = await Teacher.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'A teacher already exists with this email' });
    }

    const teacher = await Teacher.create({ name, email, password, department });

    res.status(201).json({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      token: generateToken(teacher._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const teacher = await Teacher.findOne({ email });
    if (!teacher || !teacher.isActive || !(await teacher.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      token: generateToken(teacher._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', protectTeacher, async (req, res) => {
  res.json(req.teacher);
});

// POST /api/teacher/auth/google
// Body: { idToken } — the Firebase ID token from signInWithPopup() on the client.
// The token is verified server-side (signature, issuer, audience, expiry) before
// we trust the email inside it — the client never gets to just assert an email.
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    const decoded = await verifyFirebaseIdToken(idToken);

    if (!decoded.email || !decoded.email_verified) {
      return res.status(401).json({ message: 'Your Google account email is not verified.' });
    }

    const email = decoded.email.toLowerCase();
    let teacher = await Teacher.findOne({ email });

    if (!teacher) {
      // First time this Google account has signed in as a teacher: provision one.
      // A random password is set since they'll only ever sign in via Google, but
      // the account still works with the normal email/password login as a fallback
      // (they can set a real password later via the change-password flow if desired).
      const randomPassword = require('crypto').randomBytes(24).toString('hex');
      teacher = await Teacher.create({
        name: decoded.name || email.split('@')[0],
        email,
        password: randomPassword,
      });
    }

    if (!teacher.isActive) {
      return res.status(401).json({ message: 'This teacher account has been disabled.' });
    }

    res.json({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      token: generateToken(teacher._id),
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

router.put('/profile', protectTeacher, async (req, res) => {
  try {
    const { name, department } = req.body;
    const teacher = await Teacher.findById(req.teacher._id);

    if (name !== undefined) teacher.name = name;
    if (department !== undefined) teacher.department = department;

    await teacher.save();
    res.json({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/change-password', protectTeacher, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const teacher = await Teacher.findById(req.teacher._id);

    if (!(await teacher.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    teacher.password = newPassword;
    await teacher.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;