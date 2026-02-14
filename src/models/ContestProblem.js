const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContestProblem = sequelize.define('ContestProblem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  contest_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  problem_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'contest_problems',
  timestamps: false,
});

module.exports = ContestProblem;
