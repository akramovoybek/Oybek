require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/database');
const {
  User, Topic, Problem, Testcase, Contest, ContestProblem, Registration,
} = require('../src/models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');
    await sequelize.sync({ force: true });
    console.log('Database synced (force).');

    // --- Users ---
    const adminHash = await bcrypt.hash('admin123', 12);
    const userHash = await bcrypt.hash('user123', 12);

    const admin = await User.create({
      username: 'admin',
      email: 'admin@contest.local',
      password_hash: adminHash,
      role: 'ADMIN',
      rating: 0,
    });

    const user1 = await User.create({
      username: 'alice',
      email: 'alice@contest.local',
      password_hash: userHash,
      role: 'USER',
      rating: 1200,
    });

    const user2 = await User.create({
      username: 'bob',
      email: 'bob@contest.local',
      password_hash: userHash,
      role: 'USER',
      rating: 1350,
    });

    console.log('Users created: admin, alice, bob');

    // --- Topics ---
    const topicMath = await Topic.create({ name: 'Math', description: 'Mathematical problems' });
    const topicStrings = await Topic.create({ name: 'Strings', description: 'String manipulation' });
    const topicArrays = await Topic.create({ name: 'Arrays', description: 'Array-based problems' });
    const topicDP = await Topic.create({ name: 'Dynamic Programming', description: 'DP problems' });

    console.log('Topics created.');

    // --- Problems ---
    const p1 = await Problem.create({
      title: 'Two Sum',
      description:
        'Given two integers a and b, output their sum.',
      input_description: 'Two space-separated integers a and b (-10^9 <= a, b <= 10^9).',
      output_description: 'A single integer — the sum of a and b.',
      difficulty: 'EASY',
      topic_id: topicMath.id,
      time_limit: 2,
      memory_limit: 256,
      created_by: admin.id,
    });

    const p2 = await Problem.create({
      title: 'Reverse String',
      description:
        'Given a string s, output the reverse of s.',
      input_description: 'A single string s (1 <= |s| <= 10^5) consisting of lowercase English letters.',
      output_description: 'The reverse of s.',
      difficulty: 'EASY',
      topic_id: topicStrings.id,
      time_limit: 2,
      memory_limit: 256,
      created_by: admin.id,
    });

    const p3 = await Problem.create({
      title: 'Maximum Element',
      description:
        'Given an array of n integers, find the maximum element.',
      input_description:
        'First line: integer n (1 <= n <= 10^5).\nSecond line: n space-separated integers.',
      output_description: 'A single integer — the maximum element.',
      difficulty: 'EASY',
      topic_id: topicArrays.id,
      time_limit: 2,
      memory_limit: 256,
      created_by: admin.id,
    });

    const p4 = await Problem.create({
      title: 'Fibonacci Number',
      description:
        'Given an integer n, output the n-th Fibonacci number.\nF(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2).',
      input_description: 'A single integer n (0 <= n <= 45).',
      output_description: 'The n-th Fibonacci number.',
      difficulty: 'MEDIUM',
      topic_id: topicDP.id,
      time_limit: 2,
      memory_limit: 256,
      created_by: admin.id,
    });

    const p5 = await Problem.create({
      title: 'Palindrome Check',
      description:
        'Given a string s, determine if it is a palindrome. Output "YES" if it is, "NO" otherwise.',
      input_description: 'A single string s (1 <= |s| <= 10^5) consisting of lowercase English letters.',
      output_description: '"YES" or "NO".',
      difficulty: 'EASY',
      topic_id: topicStrings.id,
      time_limit: 2,
      memory_limit: 256,
      created_by: admin.id,
    });

    console.log('Problems created.');

    // --- Testcases ---
    // Two Sum
    await Testcase.bulkCreate([
      { problem_id: p1.id, input: '2 3', expected_output: '5', type: 'STATIC', is_sample: true },
      { problem_id: p1.id, input: '-1 1', expected_output: '0', type: 'STATIC', is_sample: true },
      { problem_id: p1.id, input: '1000000000 999999999', expected_output: '1999999999', type: 'STATIC', is_sample: false },
      { problem_id: p1.id, input: '-500 -300', expected_output: '-800', type: 'STATIC', is_sample: false },
      { problem_id: p1.id, input: '0 0', expected_output: '0', type: 'STATIC', is_sample: false },
    ]);

    // Reverse String
    await Testcase.bulkCreate([
      { problem_id: p2.id, input: 'hello', expected_output: 'olleh', type: 'STATIC', is_sample: true },
      { problem_id: p2.id, input: 'abcdef', expected_output: 'fedcba', type: 'STATIC', is_sample: true },
      { problem_id: p2.id, input: 'a', expected_output: 'a', type: 'STATIC', is_sample: false },
      { problem_id: p2.id, input: 'racecar', expected_output: 'racecar', type: 'STATIC', is_sample: false },
    ]);

    // Maximum Element
    await Testcase.bulkCreate([
      { problem_id: p3.id, input: '5\n1 3 5 2 4', expected_output: '5', type: 'STATIC', is_sample: true },
      { problem_id: p3.id, input: '3\n-1 -2 -3', expected_output: '-1', type: 'STATIC', is_sample: true },
      { problem_id: p3.id, input: '1\n42', expected_output: '42', type: 'STATIC', is_sample: false },
      { problem_id: p3.id, input: '4\n10 10 10 10', expected_output: '10', type: 'STATIC', is_sample: false },
    ]);

    // Fibonacci Number
    await Testcase.bulkCreate([
      { problem_id: p4.id, input: '0', expected_output: '0', type: 'STATIC', is_sample: true },
      { problem_id: p4.id, input: '1', expected_output: '1', type: 'STATIC', is_sample: true },
      { problem_id: p4.id, input: '10', expected_output: '55', type: 'STATIC', is_sample: true },
      { problem_id: p4.id, input: '20', expected_output: '6765', type: 'STATIC', is_sample: false },
      { problem_id: p4.id, input: '45', expected_output: '1134903170', type: 'STATIC', is_sample: false },
    ]);

    // Palindrome Check
    await Testcase.bulkCreate([
      { problem_id: p5.id, input: 'racecar', expected_output: 'YES', type: 'STATIC', is_sample: true },
      { problem_id: p5.id, input: 'hello', expected_output: 'NO', type: 'STATIC', is_sample: true },
      { problem_id: p5.id, input: 'a', expected_output: 'YES', type: 'STATIC', is_sample: false },
      { problem_id: p5.id, input: 'abba', expected_output: 'YES', type: 'STATIC', is_sample: false },
      { problem_id: p5.id, input: 'abc', expected_output: 'NO', type: 'STATIC', is_sample: false },
    ]);

    console.log('Testcases created.');

    // --- Contest ---
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

    const contest = await Contest.create({
      title: 'Weekly Contest #1',
      description: 'The first weekly programming contest. Solve as many problems as you can!',
      start_time: startTime,
      end_time: endTime,
      created_by: admin.id,
    });

    await ContestProblem.bulkCreate([
      { contest_id: contest.id, problem_id: p1.id, order_index: 0 },
      { contest_id: contest.id, problem_id: p2.id, order_index: 1 },
      { contest_id: contest.id, problem_id: p3.id, order_index: 2 },
    ]);

    // Register users for the contest
    await Registration.bulkCreate([
      { contest_id: contest.id, user_id: user1.id },
      { contest_id: contest.id, user_id: user2.id },
    ]);

    console.log('Contest created with 3 problems, 2 registered users.');

    console.log('\n=== Seed complete! ===');
    console.log('Admin login:  admin / admin123');
    console.log('User logins:  alice / user123,  bob / user123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
