const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { Notification } = require('../models');

let io = null;

const initSocket = (server) => {
  const allowedOrigins = [
    env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:3000'
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      credentials: true
    }
  });

  // Socket.IO JWT Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: User ${socket.user.id} (Socket ID: ${socket.id})`);

    // Join user to private room for target notifications
    socket.join(`user_${socket.user.id}`);

    if (socket.user.role) {
      socket.join(`role_${socket.user.role}`);
    }

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: User ${socket.user.id}`);
    });
  });

  return io;
};

// Send real-time notification, saved to DB
const sendNotification = async ({ userId, title, message, type = 'info', data = {} }) => {
  try {
    // 1. Save Notification to Database
    const notification = await Notification.create({
      user_id: userId,
      title,
      message,
      type,
      data
    });

    // 2. Emit Real-time Socket Event
    if (io) {
      io.to(`user_${userId}`).emit('notification', {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        data: notification.data,
        createdAt: notification.createdAt
      });
    }

    return notification;
  } catch (error) {
    console.error('❌ Failed to create/emit notification:', error.message);
  }
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = {
  initSocket,
  sendNotification,
  getIO
};
