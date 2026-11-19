import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const getSocketUrl = (): string => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    // Strip /api/v1 from API URL
    return import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '');
  }
  return import.meta.env.MODE === 'production'
    ? 'https://api.ekazepay.rw'
    : 'http://localhost:5000';
};

export const getSocket = (): Socket | null => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  if (!socket) {
    const socketUrl = getSocketUrl();
    socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to real-time notification WebSocket (Socket ID:', socket?.id, ')');
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from notification WebSocket:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('⚠️ WebSocket notification error:', error.message);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
