const express = require('express');
const { User, Submission, Problem } = require('../models');
const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

const router = express.Router();

// GET /api/users/:username - public profile
router.get('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
      attributes: ['id', 'username', 'role', 'rating', 'created_at'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Count solved problems
    const solvedProblems = await sequelize.query(
      `SELECT DISTINCT s.problem_id, p.title, p.difficulty
       FROM submissions s
       JOIN problems p ON p.id = s.problem_id
       WHERE s.user_id = :userId AND s.verdict = 'ACCEPTED'
       ORDER BY p.id ASC`,
      { replacements: { userId: user.id }, type: QueryTypes.SELECT }
    );

    // Count submissions by verdict
    const verdictStats = await sequelize.query(
      `SELECT verdict, COUNT(*) as count
       FROM submissions
       WHERE user_id = :userId
       GROUP BY verdict`,
      { replacements: { userId: user.id }, type: QueryTypes.SELECT }
    );

    // Recent submissions
    const recentSubmissions = await Submission.findAll({
      where: { user_id: user.id },
      include: [
        { model: Problem, as: 'problem', attributes: ['id', 'title'] },
      ],
      attributes: ['id', 'verdict', 'execution_time', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 10,
    });

    res.json({
      user: user.toJSON(),
      solved_problems: solvedProblems,
      solved_count: solvedProblems.length,
      verdict_stats: verdictStats,
      recent_submissions: recentSubmissions,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
