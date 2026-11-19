const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supervisor = sequelize.define('Supervisor', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true
  },
  badge_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  assigned_district: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  assigned_sector: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  department: {
    type: DataTypes.STRING(100),
    defaultValue: 'Inspection'
  }
}, {
  tableName: 'supervisors',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Supervisor;
