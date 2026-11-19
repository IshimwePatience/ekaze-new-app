const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HelpFeedback = sequelize.define('HelpFeedback', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  ticket_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'guest'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'feedback' // feedback, bug, feature, help, support
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'General Feedback'
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  page_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  screenshot: {
    type: DataTypes.TEXT, // Store base64 data URL or URL path
    allowNull: true
  },
  browser_info: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'pending' // pending, in_progress, resolved, closed
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'help_feedbacks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = HelpFeedback;
