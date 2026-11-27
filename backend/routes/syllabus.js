const express = require('express');
const Syllabus = require('../models/Syllabus');
const { protectTeacher } = require('../middleware/teacherAuth');
const { getOwnedSection } = require('../utils/teacherOwnership');

const router = express.Router();

router.use(protectTeacher);

// GET /api/teacher/syllabus?sectionId=...
router.get('/', async (req, res) => {
  try {
    const { sectionId } = req.query;
    const owned = await getOwnedSection(sectionId, req.teacher._id);
    if (!owned) return res.status(404).json({ message: 'Section not found' });

    const topics = await Syllabus.find({ section: sectionId }).sort({ createdAt: 1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/teacher/syllabus
router.post('/', async (req, res) => {
  try {
    const { sectionId, topicName } = req.body;
    const owned = await getOwnedSection(sectionId, req.teacher._id);
    if (!owned) return res.status(404).json({ message: 'Section not found' });

    if (!topicName) return res.status(400).json({ message: 'Topic name is required' });

    const topic = await Syllabus.create({ section: sectionId, topicName: topicName.trim() });
    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/teacher/syllabus/:id/toggle
router.put('/:id/toggle', async (req, res) => {
  try {
    const topic = await Syllabus.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const owned = await getOwnedSection(topic.section, req.teacher._id);
    if (!owned) return res.status(404).json({ message: 'Topic not found' });

    topic.isCompleted = !topic.isCompleted;
    await topic.save();
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/teacher/syllabus/:id
router.delete('/:id', async (req, res) => {
  try {
    const topic = await Syllabus.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const owned = await getOwnedSection(topic.section, req.teacher._id);
    if (!owned) return res.status(404).json({ message: 'Topic not found' });

    await topic.deleteOne();
    res.json({ message: 'Topic removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;