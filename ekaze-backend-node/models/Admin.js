const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define('Admin', {
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
  admin_level: {
    type: DataTypes.ENUM('super_admin', 'system_admin', 'moderator'),
    defaultValue: 'super_admin'
  },
  department: {
    type: DataTypes.STRING(100),
    defaultValue: 'System Administration'
  },
  permissions: {
    type: DataTypes.JSONB,
    defaultValue: ['all']
  }
}, {
  tableName: 'admins',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Admin;
