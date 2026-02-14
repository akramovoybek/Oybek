const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  problem_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  contest_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  code: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  language: {
    type: DataTypes.STRING(20),
    defaultValue: 'python',
  },
  verdict: {
    type: DataTypes.ENUM(
      'PENDING',
      'ACCEPTED',
      'WRONG_ANSWER',
      'RUNTIME_ERROR',
      'TIME_LIMIT_EXCEEDED',
      'MEMORY_LIMIT_EXCEEDED',
      'COMPILATION_ERROR'
    ),
    defaultValue: 'PENDING',
  },
  execution_time: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Execution time in seconds',
  },
  memory_used: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Memory used in MB',
  },
  failed_testcase: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Index of first failed testcase (1-based)',
  },
  total_testcases: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  passed_testcases: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'submissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Submission;
