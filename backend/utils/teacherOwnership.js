const Section = require('../models/Section');
const Course = require('../models/Course');

// Verifies a section belongs (via its course) to the given teacher.
// Returns { section, course } or null.
const getOwnedSection = async (sectionId, teacherId) => {
  const section = await Section.findById(sectionId);
  if (!section) return null;
  const course = await Course.findOne({ _id: section.course, teacher: teacherId });
  if (!course) return null;
  return { section, course };
};

module.exports = { getOwnedSection };