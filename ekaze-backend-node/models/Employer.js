const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employer = sequelize.define('Employer', {
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
  employer_type: {
    type: DataTypes.ENUM('individual', 'corporate'),
    defaultValue: 'individual'
  },
  company_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  emergency_contact: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'employers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Employer;
