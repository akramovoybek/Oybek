const express = require('express');
const { Contest, Problem, Registration, User, Submission, ContestProblem } = require('../models');
const authenticate = require('../middleware/auth');

const router = express.Router();

// GET /api/contests - list all contests
router.get('/', async (req, res, next) => {
  try {
    const contests = await Contest.findAll({
      attributes: ['id', 'title', 'description', 'start_time', 'end_time'],
      order: [['start_time', 'DESC']],
    });

    const now = new Date();
    const result = contests.map((c) => {
      const cj = c.toJSON();
      if (now < new Date(cj.start_time)) cj.status = 'UPCOMING';
      else if (now > new Date(cj.end_time)) cj.status = 'ENDED';
      else cj.status = 'RUNNING';
      return cj;
    });

    res.json({ contests: result });
  } catch (err) {
    next(err);
  }
});

// GET /api/contests/:id - get contest detail
router.get('/:id', async (req, res, next) => {
  try {
    const contest = await Contest.findByPk(req.params.id, {
      include: [
        {
          model: Problem,
          as: 'problems',
          attributes: ['id', 'title', 'difficulty', 'time_limit', 'memory_limit'],
          through: { attributes: ['order_index'] },
        },
      ],
    });

    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    const participantCount = await Registration.count({
      where: { contest_id: contest.id },
    });

    const now = new Date();
    let status = 'UPCOMING';
    if (now >= new Date(contest.start_time) && now <= new Date(contest.end_time)) {
      status = 'RUNNING';
    } else if (now > new Date(contest.end_time)) {
      status = 'ENDED';
    }

    res.json({
      contest: {
        ...contest.toJSON(),
        status,
        participant_count: participantCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/contests/:id/register - register for a contest
router.post('/:id/register', authenticate, async (req, res, next) => {
  try {
    const contest = await Contest.findByPk(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    const now = new Date();
    if (now > new Date(contest.end_time)) {
      return res.status(400).json({ error: 'Contest has already ended' });
    }

    const existing = await Registration.findOne({
      where: { contest_id: contest.id, user_id: req.user.id },
    });
    if (existing) {
      return res.status(409).json({ error: 'Already registered' });
    }

    await Registration.create({
      contest_id: contest.id,
      user_id: req.user.id,
    });

    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/contests/:id/standings - contest standings
router.get('/:id/standings', async (req, res, next) => {
  try {
    const contest = await Contest.findByPk(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    const registrations = await Registration.findAll({
      where: { contest_id: contest.id },
    });

    const contestProblems = await ContestProblem.findAll({
      where: { contest_id: contest.id },
      order: [['order_index', 'ASC']],
    });

    const standings = await Promise.all(
      registrations.map(async (reg) => {
        const user = await User.findByPk(reg.user_id, {
          attributes: ['id', 'username', 'rating'],
        });

        const problemResults = await Promise.all(
          contestProblems.map(async (cp) => {
            const bestSubmission = await Submission.findOne({
              where: {
                user_id: reg.user_id,
                problem_id: cp.problem_id,
                contest_id: contest.id,
                verdict: 'ACCEPTED',
              },
              order: [['created_at', 'ASC']],
            });

            return {
              problem_id: cp.problem_id,
              solved: !!bestSubmission,
              solved_at: bestSubmission ? bestSubmission.created_at : null,
            };
          })
        );

        const solvedCount = problemResults.filter((r) => r.solved).length;

        return {
          user: user.toJSON(),
          solved_count: solvedCount,
          problems: problemResults,
        };
      })
    );

    standings.sort((a, b) => b.solved_count - a.solved_count);

    res.json({ standings });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
