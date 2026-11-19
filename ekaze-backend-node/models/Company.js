const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
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
  company_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  registration_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  tin_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  contact_person: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  logo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  document_path: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  verification_status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
    defaultValue: 'pending'
  },
  approved_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  wallet_balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  // ── Billing: free trial / subscription (set by admin when creating the company) ──
  billing_plan: {
    type: DataTypes.STRING(20), // 'free_trial' | 'subscription' | null (legacy registration-fee flow)
    allowNull: true
  },
  trial_ends_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  subscription_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  subscription_cycle: {
    type: DataTypes.STRING(20), // 'monthly' | 'annual' | 'custom'
    allowNull: true
  },
  subscription_period_days: {
    type: DataTypes.INTEGER, // used when cycle = 'custom' (agreed period)
    allowNull: true
  },
  subscription_paid_until: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'companies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Company;
