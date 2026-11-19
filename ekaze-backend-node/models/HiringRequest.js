const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HiringRequest = sequelize.define('HiringRequest', {
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
    allowNull: true
  },
  company_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  offered_salary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  placement_fee: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  fee_paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'cancelled', 'completed'),
    defaultValue: 'pending'
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'hiring_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = HiringRequest;
