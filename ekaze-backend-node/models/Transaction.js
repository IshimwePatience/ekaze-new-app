const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  reference_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('card_payment', 'contact_unlock', 'hiring_fee', 'salary_payment', 'company_fee', 'withdrawal'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  fee: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  payment_method: {
    type: DataTypes.STRING(50),
    defaultValue: 'mtn_momo'
  },
  phone_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'successful', 'failed', 'under_review'),
    defaultValue: 'pending'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Transaction;
