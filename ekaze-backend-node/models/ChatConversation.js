const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatConversation = sequelize.define('ChatConversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'New AI Conversation'
  }
}, {
  tableName: 'chat_conversations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ChatConversation;
