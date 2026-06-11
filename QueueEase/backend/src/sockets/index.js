/**
 * QueueEase V2 — Socket.IO Real-time Service
 * Handles WebSocket connections for real-time queue updates.
 */

const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.IO server
 * @param {import('http').Server} server - HTTP server instance
 */
function initializeSocket(server, corsOrigin) {
  io = new Server(server, {
    cors: {
      origin: corsOrigin || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Middleware: Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        // Allow unauthenticated connections for public queue viewing
        socket.user = null;
        return next();
      }

      // Verify JWT
      const jwt = require('jsonwebtoken');
      const config = require('../config');
      
      try {
        const decoded = jwt.verify(token, config.jwt.secret);
        socket.user = { id: decoded.id };
      } catch (err) {
        socket.user = null;
      }
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    
    // Join queue room for real-time updates
    socket.on('join-queue', (queueId) => {
      socket.join(`queue-${queueId}`);
      console.log(`📋 Socket ${socket.id} joined queue-${queueId}`);
    });
    
    // Leave queue room
    socket.on('leave-queue', (queueId) => {
      socket.leave(`queue-${queueId}`);
      console.log(`📋 Socket ${socket.id} left queue-${queueId}`);
    });
    
    // Join user-specific room for personal notifications
    if (socket.user) {
      socket.join(`user-${socket.user.id}`);
    }
    
    // Handle typing indicator for receptionist chat
    socket.on('typing', (data) => {
      socket.to(`queue-${data.queueId}`).emit('user-typing', data);
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Get Socket.IO instance
 */
function getSocketIO() {
  return io;
}

module.exports = { initializeSocket, getSocketIO };
