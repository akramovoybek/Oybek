const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Problem = sequelize.define('Problem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  input_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  output_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  difficulty: {
    type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD'),
    defaultValue: 'EASY',
  },
  topic_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  time_limit: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
    comment: 'Time limit in seconds',
  },
  memory_limit: {
    type: DataTypes.INTEGER,
    defaultValue: 256,
    comment: 'Memory limit in MB',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'problems',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Problem;
