const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  role: {
    type: DataTypes.ENUM('admin', 'supervisor', 'company', 'employer', 'worker', 'police'),
    allowNull: false,
    defaultValue: 'worker'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    validate: { isEmail: true }
  },
  google_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  },
  google_email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  national_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  profile_photo: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  registration_document_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  passport_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  province: { type: DataTypes.STRING(100), allowNull: true },
  district: { type: DataTypes.STRING(100), allowNull: true },
  sector: { type: DataTypes.STRING(100), allowNull: true },
  cell: { type: DataTypes.STRING(100), allowNull: true },
  village: { type: DataTypes.STRING(100), allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'suspended', 'inactive'),
    allowNull: false,
    defaultValue: 'pending'
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_login_ip: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  otp_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  phone_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  otp_resend_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  otp_blocked_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  mfa_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  mfa_method: {
    type: DataTypes.STRING(50),
    defaultValue: 'authenticator'
  },
  mfa_secret: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  preferred_language: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: null
  },
  ussd_pin: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    afterCreate: async (user) => {
      try {
        const { ensureUserRoleProfile } = require('../services/roleIsolationService');
        await ensureUserRoleProfile(user);
      } catch (err) {
        console.error('Failed to auto-create role profile in afterCreate hook:', err);
      }
    }
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
