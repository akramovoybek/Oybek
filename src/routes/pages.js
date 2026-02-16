const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');
const {
  User, Problem, Topic, Testcase, Contest, Submission,
  Registration, ContestProblem,
} = require('../models');

const router = express.Router();

// ─── Auth middleware for pages (non-blocking: sets req.user if logged in) ───
async function loadUser(req, res, next) {
  res.locals.user = null;
  const token = req.cookies && req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash'] },
      });
      if (user) {
        res.locals.user = user.toJSON();
        req.user = user;
      }
    } catch {
      // invalid token, clear cookie
      res.clearCookie('token');
    }
  }
  next();
}

// Require auth for page
function requireAuth(req, res, next) {
  if (!res.locals.user) return res.redirect('/login');
  next();
}

// Require admin
function requireAdmin(req, res, next) {
  if (!res.locals.user || res.locals.user.role !== 'ADMIN') return res.redirect('/');
  next();
}

router.use(loadUser);

// ─── Home ───
router.get('/', (req, res) => {
  res.render('pages/home', { title: 'Home' });
});

// ─── Auth Pages ───
router.get('/login', (req, res) => {
  if (res.locals.user) return res.redirect('/problems');
  res.render('pages/login', { title: 'Login', error: null });
});

router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.render('pages/login', { title: 'Login', error: 'Email/username and password are required' });
    }

    const user = await User.findOne({
      where: login.includes('@') ? { email: login } : { username: login },
    });

    if (!user) {
      return res.render('pages/login', { title: 'Login', error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.render('pages/login', { title: 'Login', error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie('token', token, {
      httpOnly: false, // needs to be readable by client JS for API calls
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.redirect('/problems');
  } catch (err) {
    res.render('pages/login', { title: 'Login', error: 'Something went wrong' });
  }
});

router.get('/register', (req, res) => {
  if (res.locals.user) return res.redirect('/problems');
  res.render('pages/register', { title: 'Register', error: null });
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.render('pages/register', { title: 'Register', error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.render('pages/register', { title: 'Register', error: 'Password must be at least 6 characters' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, password_hash, role: 'USER' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie('token', token, {
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.redirect('/problems');
  } catch (err) {
    const msg = err.name === 'SequelizeUniqueConstraintError'
      ? 'Username or email already exists'
      : 'Registration failed';
    res.render('pages/register', { title: 'Register', error: msg });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

// ─── Problems ───
router.get('/problems', async (req, res, next) => {
  try {
    const { topic_id, difficulty, search } = req.query;
    const where = {};
    if (topic_id) where.topic_id = topic_id;
    if (difficulty) where.difficulty = difficulty;
    if (search) where.title = { [Op.like]: `%${search}%` };

    const problems = await Problem.findAll({
      where,
      attributes: ['id', 'title', 'difficulty', 'topic_id', 'time_limit', 'memory_limit'],
      include: [{ model: Topic, as: 'topic', attributes: ['id', 'name'] }],
      order: [['id', 'ASC']],
    });

    const topics = await Topic.findAll({ order: [['name', 'ASC']] });

    res.render('pages/problems', {
      title: 'Problems',
      problems: problems.map(p => p.toJSON()),
      topics: topics.map(t => t.toJSON()),
      search: search || '',
      difficulty: difficulty || '',
      topic_id: topic_id || '',
    });
  } catch (err) {
    next(err);
  }
});

router.get('/problems/:id', async (req, res, next) => {
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
      return res.status(404).render('pages/home', { title: 'Not Found' });
    }

    let submissions = [];
    if (res.locals.user) {
      submissions = await Submission.findAll({
        where: { user_id: res.locals.user.id, problem_id: req.params.id },
        order: [['created_at', 'DESC']],
        limit: 20,
      });
    }

    res.render('pages/problem-detail', {
      title: problem.title,
      problem: problem.toJSON(),
      submissions: submissions.map(s => s.toJSON()),
    });
  } catch (err) {
    next(err);
  }
});

// ─── Contests ───
router.get('/contests', async (req, res, next) => {
  try {
    const contests = await Contest.findAll({
      attributes: ['id', 'title', 'description', 'start_time', 'end_time'],
      order: [['start_time', 'DESC']],
    });

    const now = new Date();
    const result = contests.map(c => {
      const cj = c.toJSON();
      if (now < new Date(cj.start_time)) cj.status = 'UPCOMING';
      else if (now > new Date(cj.end_time)) cj.status = 'ENDED';
      else cj.status = 'RUNNING';
      return cj;
    });

    res.render('pages/contests', { title: 'Contests', contests: result });
  } catch (err) {
    next(err);
  }
});

router.get('/contests/:id', async (req, res, next) => {
  try {
    const contest = await Contest.findByPk(req.params.id, {
      include: [{
        model: Problem,
        as: 'problems',
        attributes: ['id', 'title', 'difficulty', 'time_limit', 'memory_limit'],
        through: { attributes: ['order_index'] },
      }],
    });

    if (!contest) {
      return res.status(404).render('pages/home', { title: 'Not Found' });
    }

    const now = new Date();
    let status = 'UPCOMING';
    if (now >= new Date(contest.start_time) && now <= new Date(contest.end_time)) status = 'RUNNING';
    else if (now > new Date(contest.end_time)) status = 'ENDED';

    const contestJson = { ...contest.toJSON(), status };

    // Check registration
    let isRegistered = false;
    if (res.locals.user) {
      const reg = await Registration.findOne({
        where: { contest_id: contest.id, user_id: res.locals.user.id },
      });
      isRegistered = !!reg;
    }

    // Standings
    const registrations = await Registration.findAll({ where: { contest_id: contest.id } });
    const contestProblems = await ContestProblem.findAll({
      where: { contest_id: contest.id },
      order: [['order_index', 'ASC']],
    });

    const standings = await Promise.all(
      registrations.map(async (reg) => {
        const user = await User.findByPk(reg.user_id, { attributes: ['id', 'username', 'rating'] });
        const solvedCount = await Submission.count({
          where: {
            user_id: reg.user_id,
            contest_id: contest.id,
            verdict: 'ACCEPTED',
          },
          col: 'problem_id',
          distinct: true,
        });
        return { user: user.toJSON(), solved_count: solvedCount };
      })
    );
    standings.sort((a, b) => b.solved_count - a.solved_count);

    res.render('pages/contest-detail', {
      title: contestJson.title,
      contest: contestJson,
      isRegistered,
      standings,
    });
  } catch (err) {
    next(err);
  }
});

// ─── User Profile ───
router.get('/users/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
      attributes: ['id', 'username', 'role', 'rating', 'created_at'],
    });

    if (!user) {
      return res.status(404).render('pages/home', { title: 'Not Found' });
    }

    const solvedProblems = await sequelize.query(
      `SELECT DISTINCT s.problem_id, p.title, p.difficulty
       FROM submissions s
       JOIN problems p ON p.id = s.problem_id
       WHERE s.user_id = :userId AND s.verdict = 'ACCEPTED'
       ORDER BY p.id ASC`,
      { replacements: { userId: user.id }, type: QueryTypes.SELECT }
    );

    const verdictStats = await sequelize.query(
      `SELECT verdict, COUNT(*) as count
       FROM submissions
       WHERE user_id = :userId
       GROUP BY verdict`,
      { replacements: { userId: user.id }, type: QueryTypes.SELECT }
    );

    const recentSubmissions = await Submission.findAll({
      where: { user_id: user.id },
      include: [{ model: Problem, as: 'problem', attributes: ['id', 'title'] }],
      attributes: ['id', 'verdict', 'execution_time', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 10,
    });

    res.render('pages/user-profile', {
      title: user.username,
      profile: user.toJSON(),
      solved_problems: solvedProblems,
      solved_count: solvedProblems.length,
      verdict_stats: verdictStats,
      recent_submissions: recentSubmissions.map(s => s.toJSON()),
    });
  } catch (err) {
    next(err);
  }
});

// ─── Admin Pages ───
router.get('/admin', requireAuth, requireAdmin, (req, res) => {
  res.redirect('/admin/problems');
});

router.get('/admin/problems', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const problems = await Problem.findAll({
      include: [
        { model: Topic, as: 'topic', attributes: ['id', 'name'] },
        { model: Testcase, as: 'testcases' },
      ],
      order: [['id', 'DESC']],
    });
    res.render('admin/problems', { title: 'Admin - Problems', problems: problems.map(p => p.toJSON()) });
  } catch (err) { next(err); }
});

router.get('/admin/problems/new', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const topics = await Topic.findAll({ order: [['name', 'ASC']] });
    res.render('admin/problem-form', { title: 'New Problem', topics: topics.map(t => t.toJSON()), error: null });
  } catch (err) { next(err); }
});

router.post('/admin/problems/new', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { title, description, input_description, output_description, difficulty, topic_id, time_limit, memory_limit } = req.body;
    if (!title || !description) {
      const topics = await Topic.findAll({ order: [['name', 'ASC']] });
      return res.render('admin/problem-form', { title: 'New Problem', topics: topics.map(t => t.toJSON()), error: 'Title and description are required' });
    }
    const problem = await Problem.create({
      title, description, input_description, output_description,
      difficulty: difficulty || 'EASY',
      topic_id: topic_id || null,
      time_limit: time_limit || 2,
      memory_limit: memory_limit || 256,
      created_by: req.user.id,
    });
    res.redirect(`/admin/problems/${problem.id}/edit`);
  } catch (err) { next(err); }
});

router.get('/admin/problems/:id/edit', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const problem = await Problem.findByPk(req.params.id, {
      include: [
        { model: Topic, as: 'topic' },
        { model: Testcase, as: 'testcases' },
      ],
    });
    if (!problem) return res.redirect('/admin/problems');
    const topics = await Topic.findAll({ order: [['name', 'ASC']] });
    res.render('admin/problem-form', {
      title: 'Edit Problem',
      problem: problem.toJSON(),
      topics: topics.map(t => t.toJSON()),
      error: null,
    });
  } catch (err) { next(err); }
});

router.post('/admin/problems/:id/edit', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) return res.redirect('/admin/problems');

    const fields = ['title', 'description', 'input_description', 'output_description', 'difficulty', 'topic_id', 'time_limit', 'memory_limit'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        problem[field] = req.body[field] || (field === 'topic_id' ? null : problem[field]);
      }
    });
    await problem.save();
    res.redirect(`/admin/problems/${problem.id}/edit`);
  } catch (err) { next(err); }
});

// Admin Contests
router.get('/admin/contests', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const contests = await Contest.findAll({
      include: [{ model: Problem, as: 'problems', attributes: ['id', 'title', 'difficulty'] }],
      order: [['start_time', 'DESC']],
    });
    res.render('admin/contests', { title: 'Admin - Contests', contests: contests.map(c => c.toJSON()) });
  } catch (err) { next(err); }
});

router.get('/admin/contests/new', requireAuth, requireAdmin, (req, res) => {
  res.render('admin/contest-form', { title: 'New Contest', error: null });
});

router.post('/admin/contests/new', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { title, description, start_time, end_time } = req.body;
    if (!title || !start_time || !end_time) {
      return res.render('admin/contest-form', { title: 'New Contest', error: 'Title, start time, and end time are required' });
    }
    const contest = await Contest.create({
      title, description, start_time, end_time,
      created_by: req.user.id,
    });
    res.redirect(`/admin/contests/${contest.id}/edit`);
  } catch (err) { next(err); }
});

router.get('/admin/contests/:id/edit', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const contest = await Contest.findByPk(req.params.id, {
      include: [{ model: Problem, as: 'problems' }],
    });
    if (!contest) return res.redirect('/admin/contests');
    const allProblems = await Problem.findAll({ order: [['id', 'DESC']] });
    res.render('admin/contest-form', {
      title: 'Edit Contest',
      contest: contest.toJSON(),
      allProblems: allProblems.map(p => p.toJSON()),
      error: null,
    });
  } catch (err) { next(err); }
});

router.post('/admin/contests/:id/edit', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const contest = await Contest.findByPk(req.params.id);
    if (!contest) return res.redirect('/admin/contests');

    const { title, description, start_time, end_time } = req.body;
    if (title) contest.title = title;
    if (description !== undefined) contest.description = description;
    if (start_time) contest.start_time = start_time;
    if (end_time) contest.end_time = end_time;

    await contest.save();
    res.redirect(`/admin/contests/${contest.id}/edit`);
  } catch (err) { next(err); }
});

// Admin Topics
router.get('/admin/topics', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const topics = await Topic.findAll({
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM problems WHERE problems.topic_id = Topic.id)'), 'problem_count'],
        ],
      },
      order: [['name', 'ASC']],
    });
    res.render('admin/topics', { title: 'Admin - Topics', topics: topics.map(t => t.toJSON()) });
  } catch (err) { next(err); }
});

module.exports = router;
