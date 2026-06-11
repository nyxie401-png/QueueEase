/**
 * QueueEase V2 — Main Server
 * Express + Socket.IO + MongoDB
 */

const express = require('express');
const csrf = require('csurf');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const config = require('./config');
const connectDB = require('./config/database');
const { initializeSocket } = require('./sockets');
const errorHandler = require('./middleware/errorHandler');
const { sendError } = require('./utils/apiResponse');

let server;

// Routes
const authRoutes = require('./routes/authRoutes');
const queueRoutes = require('./routes/queueRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();

// ─── Middleware ────────────────────────────────────────────

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CSRF protection
app.use(csrf({
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.env === 'production',
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
}));

app.get('/api/csrf-token', (req, res) => {
  res.status(200).json({
    success: true,
    csrfToken: req.csrfToken(),
  });
});

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});
app.use('/api/', limiter);

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// ─── API Routes ───────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'QueueEase API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chatbot', chatbotRoutes);

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return sendError(res, 'Invalid CSRF token', 403);
  }
  return next(err);
});

// Global error handler
app.use(errorHandler);

// ─── Initialize ───────────────────────────────────────────

const PORT = config.port;

const start = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🏥 QueueEase V2 — API Server                        ║
║   🌐 Environment: ${config.env.padEnd(36)}║
║   🚀 Server: http://localhost:${PORT}${' '.repeat(Math.max(0, 22 - String(PORT).length))}║
║   📡 Socket.IO: Ready                                 ║
║   🔌 MongoDB: Connected                                ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
      `);

      initializeSocket(server, config.socketCorsOrigin);
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  } else {
    process.exit(0);
  }
});

start();
