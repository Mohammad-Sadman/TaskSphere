const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { protectAdmin } = require('../middleware/adminAuth');

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Admin accounts are not self-registrable from the UI for security reasons.
// Create the first admin with: node backend/scripts/createAdmin.js
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', protectAdmin, async (req, res) => {
  res.json(req.admin);
});

module.exports = router;
