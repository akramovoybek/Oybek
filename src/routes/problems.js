const express = require('express');
const { Problem, Topic, Testcase, Submission } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// GET /api/problems - list all problems (public)
router.get('/', async (req, res, next) => {
  try {
    const { topic_id, difficulty, search } = req.query;
    const where = {};
    if (topic_id) where.topic_id = topic_id;
    if (difficulty) where.difficulty = difficulty;
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    const problems = await Problem.findAll({
      where,
      attributes: ['id', 'title', 'difficulty', 'topic_id', 'time_limit', 'memory_limit'],
      include: [
        { model: Topic, as: 'topic', attributes: ['id', 'name'] },
      ],
      order: [['id', 'ASC']],
    });

    // Add solved count for each problem
    const result = await Promise.all(
      problems.map(async (p) => {
        const solvedCount = await Submission.count({
          where: { problem_id: p.id, verdict: 'ACCEPTED' },
          col: 'user_id',
          distinct: true,
        });
        return { ...p.toJSON(), solved_count: solvedCount };
      })
    );

    res.json({ problems: result });
  } catch (err) {
    next(err);
  }
});

// GET /api/problems/:id - get problem detail with sample testcases
router.get('/:id', async (req, res, next) => {
  try {
    const problem = await Problem.findByPk(req.params.id, {
      include: [
        { model: Topic, as: 'topic', attributes: ['id', 'name'] },
        {
          model: Testcase,
          as: 'testcases',
          where: { is_sample: true },
          required: false,
          attributes: ['id', 'input', 'expected_output'],
        },
      ],
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json({ problem });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
