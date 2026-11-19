const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Worker = sequelize.define('Worker', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: true,
    unique: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true
  },
  company_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  professions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  experience_level: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  languages_spoken: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  work_type_preferences: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  preferred_districts: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  min_salary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  max_salary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  has_insurance: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  insurance_type: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  insurance_provider: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  insurance_number: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  experience_years: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  expected_salary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  availability_status: {
    type: DataTypes.ENUM('available', 'hired', 'unavailable'),
    defaultValue: 'available'
  },
  qr_code_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  },
  business_card_path: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  card_paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  card_paid_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 5.00
  },
  rating_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  extended_profile: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  wallet_balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  savings_balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  }
}, {
  tableName: 'workers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Worker;
