/**
 * QueueEase V2 — Auth Middleware
 * Firebase token verification + JWT fallback with role-based access.
 */

const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const User = require('../models/User');
const config = require('../config');

// Initialize Firebase Admin (lazy)
let firebaseInitialized = false;

function initializeFirebase() {
  if (firebaseInitialized) return;
  try {
    if (config.firebase.projectId && config.firebase.privateKey && config.firebase.clientEmail) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebase.projectId,
          privateKey: config.firebase.privateKey,
          clientEmail: config.firebase.clientEmail,
        }),
      });
      console.log('✅ Firebase Admin initialized');
    } else {
      console.log('⚠️  Firebase Admin not configured — using JWT-only auth');
    }
  } catch (err) {
    console.log('⚠️  Firebase Admin init failed — using JWT-only auth:', err.message);
  }
  firebaseInitialized = true;
}

/**
 * Protect routes — verifies Firebase ID token or JWT
 */
const protect = async (req, res, next) => {
  try {
    initializeFirebase();
    
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided',
      });
    }
    
    let decoded;
    let user;
    
    // Try Firebase ID token first
    try {
      if (firebaseInitialized && admin.apps.length > 0) {
        decoded = await admin.auth().verifyIdToken(token);
        user = await User.findOne({ firebaseUid: decoded.uid }).select('-password');
      }
    } catch (firebaseErr) {
      // Not a Firebase token, try JWT
    }
    
    // Fallback to JWT
    if (!user) {
      try {
        decoded = jwt.verify(token, config.jwt.secret);
        user = await User.findById(decoded.id).select('-password');
      } catch (jwtErr) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated',
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based access control middleware
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }
    
    next();
  };
};

/**
 * Optional auth — attaches user if token is valid, but doesn't block
 */
const optionalAuth = async (req, res, next) => {
  try {
    initializeFirebase();
    
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      let decoded;
      let user;
      
      try {
        if (firebaseInitialized && admin.apps.length > 0) {
          decoded = await admin.auth().verifyIdToken(token);
          user = await User.findOne({ firebaseUid: decoded.uid }).select('-password');
        }
      } catch (e) { /* ignore */ }
      
      if (!user) {
        try {
          decoded = jwt.verify(token, config.jwt.secret);
          user = await User.findById(decoded.id).select('-password');
        } catch (e) { /* ignore */ }
      }
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = { protect, authorize, optionalAuth };
