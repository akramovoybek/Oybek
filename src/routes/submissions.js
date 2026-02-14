const express = require('express');
const { Submission, Problem, Testcase, Contest, Registration, User } = require('../models');
const { runCode } = require('../services/codeRunner');
const authenticate = require('../middleware/auth');

const router = express.Router();

// POST /api/submissions - submit solution
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { problem_id, contest_id, code } = req.body;

    if (!problem_id || !code) {
      return res.status(400).json({ error: 'problem_id and code are required' });
    }

    const problem = await Problem.findByPk(problem_id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // If contest submission, validate registration and timing
    if (contest_id) {
      const contest = await Contest.findByPk(contest_id);
      if (!contest) {
        return res.status(404).json({ error: 'Contest not found' });
      }

      const now = new Date();
      if (now < new Date(contest.start_time)) {
        return res.status(400).json({ error: 'Contest has not started yet' });
      }
      if (now > new Date(contest.end_time)) {
        return res.status(400).json({ error: 'Contest has ended' });
      }

      const reg = await Registration.findOne({
        where: { contest_id, user_id: req.user.id },
      });
      if (!reg) {
        return res.status(403).json({ error: 'You are not registered for this contest' });
      }
    }

    // Create submission
    const submission = await Submission.create({
      user_id: req.user.id,
      problem_id,
      contest_id: contest_id || null,
      code,
      verdict: 'PENDING',
    });

    // Get all testcases for the problem
    const testcases = await Testcase.findAll({
      where: { problem_id },
      order: [['is_sample', 'DESC'], ['id', 'ASC']],
    });

    if (testcases.length === 0) {
      submission.verdict = 'ACCEPTED';
      submission.total_testcases = 0;
      submission.passed_testcases = 0;
      await submission.save();
      return res.json({ submission });
    }

    // Run against each testcase
    let verdict = 'ACCEPTED';
    let maxTime = 0;
    let maxMemory = 0;
    let passedCount = 0;
    let failedIndex = null;

    for (let i = 0; i < testcases.length; i++) {
      const tc = testcases[i];
      const result = await runCode({
        code,
        input: tc.input,
        timeLimit: problem.time_limit,
        memoryLimit: problem.memory_limit,
      });

      if (result.executionTime > maxTime) maxTime = result.executionTime;
      if (result.memoryUsed > maxMemory) maxMemory = result.memoryUsed;

      if (result.error) {
        if (result.timedOut) {
          verdict = 'TIME_LIMIT_EXCEEDED';
        } else {
          verdict = 'RUNTIME_ERROR';
        }
        failedIndex = i + 1;
        break;
      }

      // Compare output (trim whitespace)
      const actual = result.output.trim();
      const expected = tc.expected_output.trim();

      if (actual !== expected) {
        verdict = 'WRONG_ANSWER';
        failedIndex = i + 1;
        break;
      }

      passedCount++;
    }

    submission.verdict = verdict;
    submission.execution_time = Math.round(maxTime * 1000) / 1000;
    submission.memory_used = Math.round(maxMemory * 100) / 100;
    submission.total_testcases = testcases.length;
    submission.passed_testcases = passedCount;
    submission.failed_testcase = failedIndex;
    await submission.save();

    res.json({ submission });
  } catch (err) {
    next(err);
  }
});

// GET /api/submissions - list user's submissions
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { problem_id, contest_id } = req.query;
    const where = { user_id: req.user.id };
    if (problem_id) where.problem_id = problem_id;
    if (contest_id) where.contest_id = contest_id;

    const submissions = await Submission.findAll({
      where,
      include: [
        { model: Problem, as: 'problem', attributes: ['id', 'title'] },
      ],
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    res.json({ submissions });
  } catch (err) {
    next(err);
  }
});

// GET /api/submissions/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const submission = await Submission.findByPk(req.params.id, {
      include: [
        { model: Problem, as: 'problem', attributes: ['id', 'title'] },
        { model: User, as: 'user', attributes: ['id', 'username'] },
      ],
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Users can only see their own code; admins can see all
    if (submission.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      const result = submission.toJSON();
      delete result.code;
      return res.json({ submission: result });
    }

    res.json({ submission });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
