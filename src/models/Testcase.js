const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Testcase = sequelize.define('Testcase', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  problem_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  input: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  expected_output: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('STATIC', 'GENERATED'),
    defaultValue: 'STATIC',
  },
  is_sample: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'testcases',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Testcase;
