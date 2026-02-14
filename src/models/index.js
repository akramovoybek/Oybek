const User = require('./User');
const Topic = require('./Topic');
const Problem = require('./Problem');
const Testcase = require('./Testcase');
const Contest = require('./Contest');
const ContestProblem = require('./ContestProblem');
const Registration = require('./Registration');
const Submission = require('./Submission');

// User -> Problem (created_by)
User.hasMany(Problem, { foreignKey: 'created_by', as: 'createdProblems' });
Problem.belongsTo(User, { foreignKey: 'created_by', as: 'author' });

// Topic -> Problem
Topic.hasMany(Problem, { foreignKey: 'topic_id', as: 'problems' });
Problem.belongsTo(Topic, { foreignKey: 'topic_id', as: 'topic' });

// Problem -> Testcase
Problem.hasMany(Testcase, { foreignKey: 'problem_id', as: 'testcases' });
Testcase.belongsTo(Problem, { foreignKey: 'problem_id', as: 'problem' });

// User -> Contest (created_by)
User.hasMany(Contest, { foreignKey: 'created_by', as: 'createdContests' });
Contest.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Contest <-> Problem (many-to-many)
Contest.belongsToMany(Problem, {
  through: ContestProblem,
  foreignKey: 'contest_id',
  otherKey: 'problem_id',
  as: 'problems',
});
Problem.belongsToMany(Contest, {
  through: ContestProblem,
  foreignKey: 'problem_id',
  otherKey: 'contest_id',
  as: 'contests',
});

// Contest <-> User (registrations, many-to-many)
Contest.belongsToMany(User, {
  through: Registration,
  foreignKey: 'contest_id',
  otherKey: 'user_id',
  as: 'participants',
});
User.belongsToMany(Contest, {
  through: Registration,
  foreignKey: 'user_id',
  otherKey: 'contest_id',
  as: 'registeredContests',
});

// User -> Submission
User.hasMany(Submission, { foreignKey: 'user_id', as: 'submissions' });
Submission.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Problem -> Submission
Problem.hasMany(Submission, { foreignKey: 'problem_id', as: 'submissions' });
Submission.belongsTo(Problem, { foreignKey: 'problem_id', as: 'problem' });

// Contest -> Submission
Contest.hasMany(Submission, { foreignKey: 'contest_id', as: 'submissions' });
Submission.belongsTo(Contest, { foreignKey: 'contest_id', as: 'contest' });

module.exports = {
  User,
  Topic,
  Problem,
  Testcase,
  Contest,
  ContestProblem,
  Registration,
  Submission,
};
