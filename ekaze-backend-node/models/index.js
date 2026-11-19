const sequelize = require('../config/database');
const User = require('./User');
const Session = require('./Session');
const AuditLog = require('./AuditLog');
const Company = require('./Company');
const Worker = require('./Worker');
const Employer = require('./Employer');
const Admin = require('./Admin');
const Supervisor = require('./Supervisor');
const Police = require('./Police');
const Incident = require('./Incident');
const Transaction = require('./Transaction');
const Notification = require('./Notification');
const HiringRequest = require('./HiringRequest');
const Employment = require('./Employment');

const ChatConversation = require('./ChatConversation');
const ChatMessage = require('./ChatMessage');
const Setting = require('./Setting');
const HelpFeedback = require('./HelpFeedback');

// ==================== ASSOCIATIONS ====================

// User 1:1 Role Profile Table Isolation
User.hasOne(Company, { foreignKey: 'user_id', as: 'company' });
Company.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(Worker, { foreignKey: 'user_id', as: 'worker' });
Worker.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(Employer, { foreignKey: 'user_id', as: 'employer' });
Employer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(Admin, { foreignKey: 'user_id', as: 'adminProfile' });
Admin.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(Supervisor, { foreignKey: 'user_id', as: 'supervisorProfile' });
Supervisor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(Police, { foreignKey: 'user_id', as: 'policeProfile' });
Police.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> Sessions, AuditLogs, Notifications, Transactions, AI Conversations
User.hasMany(Session, { foreignKey: 'user_id', as: 'sessions' });
Session.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(ChatConversation, { foreignKey: 'user_id', as: 'conversations' });
ChatConversation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

ChatConversation.hasMany(ChatMessage, { foreignKey: 'conversation_id', as: 'messages', onDelete: 'CASCADE' });
ChatMessage.belongsTo(ChatConversation, { foreignKey: 'conversation_id', as: 'conversation' });

// Company <-> Worker
Company.hasMany(Worker, { foreignKey: 'company_id', as: 'workers' });
Worker.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// Incidents
User.hasMany(Incident, { foreignKey: 'reporter_id', as: 'reportedIncidents' });
Incident.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });

Worker.hasMany(Incident, { foreignKey: 'worker_id', as: 'incidents' });
Incident.belongsTo(Worker, { foreignKey: 'worker_id', as: 'worker' });

Employer.hasMany(Incident, { foreignKey: 'employer_id', as: 'incidents' });
Incident.belongsTo(Employer, { foreignKey: 'employer_id', as: 'employer' });

Company.hasMany(Incident, { foreignKey: 'company_id', as: 'incidents' });
Incident.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

User.hasMany(Incident, { foreignKey: 'assigned_officer_id', as: 'assignedIncidents' });
Incident.belongsTo(User, { foreignKey: 'assigned_officer_id', as: 'assignedOfficer' });

Employment.hasMany(Incident, { foreignKey: 'employment_id', as: 'incidents' });
Incident.belongsTo(Employment, { foreignKey: 'employment_id', as: 'employment' });

// HiringRequests
Employer.hasMany(HiringRequest, { foreignKey: 'employer_id', as: 'hiringRequests' });
HiringRequest.belongsTo(Employer, { foreignKey: 'employer_id', as: 'employer' });

Worker.hasMany(HiringRequest, { foreignKey: 'worker_id', as: 'hiringRequests' });
HiringRequest.belongsTo(Worker, { foreignKey: 'worker_id', as: 'worker' });

Company.hasMany(HiringRequest, { foreignKey: 'company_id', as: 'hiringRequests' });
HiringRequest.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// Employments
Employer.hasMany(Employment, { foreignKey: 'employer_id', as: 'employments' });
Employment.belongsTo(Employer, { foreignKey: 'employer_id', as: 'employer' });

Worker.hasMany(Employment, { foreignKey: 'worker_id', as: 'employments' });
Employment.belongsTo(Worker, { foreignKey: 'worker_id', as: 'worker' });

Company.hasMany(Employment, { foreignKey: 'company_id', as: 'employments' });
Employment.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// Help & Feedback
User.hasMany(HelpFeedback, { foreignKey: 'user_id', as: 'feedbacks' });
HelpFeedback.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Session,
  AuditLog,
  Company,
  Worker,
  Employer,
  Admin,
  Supervisor,
  Police,
  Incident,
  Transaction,
  Notification,
  HiringRequest,
  Employment,
  ChatConversation,
  ChatMessage,
  Setting,
  HelpFeedback
};
