const express = require('express');
const { Contest, ContestProblem, Problem, Registration, User } = require('../../models');

const router = express.Router();

// GET /api/admin/contests
router.get('/', async (req, res, next) => {
  try {
    const contests = await Contest.findAll({
      include: [
        { model: Problem, as: 'problems', attributes: ['id', 'title', 'difficulty'] },
      ],
      order: [['start_time', 'DESC']],
    });
    res.json({ contests });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/contests/:id
router.get('/:id', async (req, res, next) => {
  try {
    const contest = await Contest.findByPk(req.params.id, {
      include: [
        { model: Problem, as: 'problems' },
        { model: User, as: 'participants', attributes: ['id', 'username', 'rating'] },
      ],
    });

    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    res.json({ contest });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/contests
router.post('/', async (req, res, next) => {
  try {
    const { title, description, start_time, end_time } = req.body;

    if (!title || !start_time || !end_time) {
      return res.status(400).json({ error: 'title, start_time, and end_time are required' });
    }

    if (new Date(end_time) <= new Date(start_time)) {
      return res.status(400).json({ error: 'end_time must be after start_time' });
    }

    const contest = await Contest.create({
      title,
      description,
      start_time,
      end_time,
      created_by: req.user.id,
    });

    res.status(201).json({ contest });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/contests/:id
router.put('/:id', async (req, res, next) => {
  try {
    const contest = await Contest.findByPk(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    const { title, description, start_time, end_time } = req.body;
    if (title) contest.title = title;
    if (description !== undefined) contest.description = description;
    if (start_time) contest.start_time = start_time;
    if (end_time) contest.end_time = end_time;

    await contest.save();
    res.json({ contest });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/contests/:id/problems - add problem to contest
router.post('/:id/problems', async (req, res, next) => {
  try {
    const contest = await Contest.findByPk(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    const { problem_id, order_index } = req.body;
    if (!problem_id) {
      return res.status(400).json({ error: 'problem_id is required' });
    }

    const problem = await Problem.findByPk(problem_id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const existing = await ContestProblem.findOne({
      where: { contest_id: contest.id, problem_id },
    });
    if (existing) {
      return res.status(409).json({ error: 'Problem already in contest' });
    }

    const cp = await ContestProblem.create({
      contest_id: contest.id,
      problem_id,
      order_index: order_index || 0,
    });

    res.status(201).json({ contest_problem: cp });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/contests/:id/problems/:problemId
router.delete('/:id/problems/:problemId', async (req, res, next) => {
  try {
    const cp = await ContestProblem.findOne({
      where: { contest_id: req.params.id, problem_id: req.params.problemId },
    });

    if (!cp) {
      return res.status(404).json({ error: 'Problem not in contest' });
    }

    await cp.destroy();
    res.json({ message: 'Problem removed from contest' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/contests/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const contest = await Contest.findByPk(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    await ContestProblem.destroy({ where: { contest_id: contest.id } });
    await Registration.destroy({ where: { contest_id: contest.id } });
    await contest.destroy();
    res.json({ message: 'Contest deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
