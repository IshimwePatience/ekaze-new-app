const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Police = sequelize.define('Police', {
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
  station_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  rank: {
    type: DataTypes.STRING(100),
    defaultValue: 'Officer'
  },
  jurisdiction_district: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'police',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Police;
