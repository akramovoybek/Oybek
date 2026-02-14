const express = require('express');
const { Topic } = require('../models');
const sequelize = require('../config/database');

const router = express.Router();

// GET /api/topics - public list of topics with problem count
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

module.exports = router;
