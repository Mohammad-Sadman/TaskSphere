const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

// Separate from middleware/auth.js (student flow) so neither system can be confused
// for the other. Tokens issued here carry role: 'teacher' and are only ever accepted
// by this middleware.
const protectTeacher = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'teacher') {
      return res.status(401).json({ message: 'Not authorized for this route' });
    }
    req.teacher = await Teacher.findById(decoded.id).select('-password');
    if (!req.teacher || !req.teacher.isActive) {
      return res.status(401).json({ message: 'Teacher not found or inactive' });
    }
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

module.exports = { protectTeacher };
