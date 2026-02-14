const express = require('express');
const { Topic, Problem } = require('../../models');
const sequelize = require('../../config/database');

const router = express.Router();

// GET /api/admin/topics - list all topics with problem count
router.get('/', async (req, res, next) => {
  try {
    const topics = await Topic.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM problems WHERE problems.topic_id = Topic.id)'
            ),
            'problem_count',
          ],
        ],
      },
      order: [['name', 'ASC']],
    });

    res.json({ topics });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/topics - create topic
router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const topic = await Topic.create({ name, description });
    res.status(201).json({ topic });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/topics/:id - edit topic
router.put('/:id', async (req, res, next) => {
  try {
    const topic = await Topic.findByPk(req.params.id);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const { name, description } = req.body;
    if (name) topic.name = name;
    if (description !== undefined) topic.description = description;

    await topic.save();
    res.json({ topic });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/topics/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const topic = await Topic.findByPk(req.params.id);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    await topic.destroy();
    res.json({ message: 'Topic deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
