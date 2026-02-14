const express = require('express');
const { Problem, Testcase, Topic } = require('../../models');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const router = express.Router();

// GET /api/admin/problems - list all problems
router.get('/', async (req, res, next) => {
  try {
    const { topic_id, difficulty } = req.query;
    const where = {};
    if (topic_id) where.topic_id = topic_id;
    if (difficulty) where.difficulty = difficulty;

    const problems = await Problem.findAll({
      where,
      include: [
        { model: Topic, as: 'topic', attributes: ['id', 'name'] },
      ],
      order: [['id', 'DESC']],
    });

    res.json({ problems });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/problems/:id
router.get('/:id', async (req, res, next) => {
  try {
    const problem = await Problem.findByPk(req.params.id, {
      include: [
        { model: Topic, as: 'topic' },
        { model: Testcase, as: 'testcases' },
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

// POST /api/admin/problems - create problem
router.post('/', async (req, res, next) => {
  try {
    const {
      title,
      description,
      input_description,
      output_description,
      difficulty,
      topic_id,
      time_limit,
      memory_limit,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'title and description are required' });
    }

    const problem = await Problem.create({
      title,
      description,
      input_description,
      output_description,
      difficulty: difficulty || 'EASY',
      topic_id: topic_id || null,
      time_limit: time_limit || 2,
      memory_limit: memory_limit || 256,
      created_by: req.user.id,
    });

    res.status(201).json({ problem });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/problems/:id - edit problem
router.put('/:id', async (req, res, next) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const fields = [
      'title', 'description', 'input_description', 'output_description',
      'difficulty', 'topic_id', 'time_limit', 'memory_limit',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        problem[field] = req.body[field];
      }
    });

    await problem.save();
    res.json({ problem });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/problems/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    await Testcase.destroy({ where: { problem_id: problem.id } });
    await problem.destroy();
    res.json({ message: 'Problem deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/problems/:id/testcases - add testcase (static: input/output pair)
router.post('/:id/testcases', async (req, res, next) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const { input, expected_output, is_sample } = req.body;

    if (!input || !expected_output) {
      return res.status(400).json({ error: 'input and expected_output are required' });
    }

    const testcase = await Testcase.create({
      problem_id: problem.id,
      input,
      expected_output,
      type: 'STATIC',
      is_sample: is_sample || false,
    });

    res.status(201).json({ testcase });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/problems/:id/testcases/generate - generate output from reference solution
router.post('/:id/testcases/generate', async (req, res, next) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const { input, reference_solution, is_sample } = req.body;

    if (!input || !reference_solution) {
      return res.status(400).json({
        error: 'input and reference_solution (python code) are required',
      });
    }

    // Run reference solution to generate expected output
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-'));
    const solutionFile = path.join(tmpDir, 'solution.py');
    const inputFile = path.join(tmpDir, 'input.txt');

    fs.writeFileSync(solutionFile, reference_solution);
    fs.writeFileSync(inputFile, input);

    let expected_output;
    try {
      expected_output = execSync(
        `python3 "${solutionFile}" < "${inputFile}"`,
        { timeout: (problem.time_limit || 10) * 1000, encoding: 'utf-8' }
      );
    } catch (execErr) {
      return res.status(400).json({
        error: 'Reference solution failed to execute',
        details: execErr.stderr || execErr.message,
      });
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }

    const testcase = await Testcase.create({
      problem_id: problem.id,
      input,
      expected_output: expected_output.trimEnd(),
      type: 'GENERATED',
      is_sample: is_sample || false,
    });

    res.status(201).json({ testcase });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/problems/:id/testcases/:tcId
router.delete('/:id/testcases/:tcId', async (req, res, next) => {
  try {
    const testcase = await Testcase.findOne({
      where: { id: req.params.tcId, problem_id: req.params.id },
    });

    if (!testcase) {
      return res.status(404).json({ error: 'Testcase not found' });
    }

    await testcase.destroy();
    res.json({ message: 'Testcase deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
