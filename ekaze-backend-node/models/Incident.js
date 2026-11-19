const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Incident = sequelize.define('Incident', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  incident_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  reporter_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  worker_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  employer_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  employment_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  company_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  assigned_officer_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  incident_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  incident_subtype: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  incident_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  incident_location: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'reported'
  },
  province: { type: DataTypes.STRING(100), allowNull: true },
  district: { type: DataTypes.STRING(100), allowNull: true },
  sector: { type: DataTypes.STRING(100), allowNull: true },
  cell: { type: DataTypes.STRING(100), allowNull: true },
  village: { type: DataTypes.STRING(100), allowNull: true },
  proof_files: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  evidence_files: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  police_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'incidents',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Incident;
