const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employment = sequelize.define('Employment', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  employer_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  worker_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  company_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  monthly_salary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'terminated', 'completed'),
    defaultValue: 'active'
  }
}, {
  tableName: 'employments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Employment;
