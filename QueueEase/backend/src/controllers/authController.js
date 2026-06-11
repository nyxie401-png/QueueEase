/**
 * QueueEase V2 — Auth Controller
 * Handles registration, login, Firebase auth, and token management.
 */

const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const config = require('../config');

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    isActive: user.isActive,
    isVerified: user.isVerified,
  };
  
  return sendSuccess(res, { token, user: userData }, 'Authentication successful', statusCode);
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, ...extraFields } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'Email already registered', 409);
    }
    
    // Create user with role-specific fields
    const userData = { name, email, phone, password, role };
    
    // Doctor-specific
    if (role === 'doctor') {
      userData.specialization = extraFields.specialization;
      userData.medicalLicenseNo = extraFields.medicalLicenseNo;
    }
    
    // Receptionist-specific
    if (role === 'receptionist') {
      userData.employedClinicId = extraFields.clinicId;
      userData.employeeId = extraFields.employeeId;
    }
    
    // Patient-specific
    if (role === 'patient') {
      userData.bloodType = extraFields.bloodType;
      userData.allergies = extraFields.allergies;
      userData.emergencyContact = extraFields.emergencyContact;
    }
    
    const user = await User.create(userData);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return sendError(res, 'Please provide email and password', 400);
    }
    
    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }
    
    if (!user.isActive) {
      return sendError(res, 'Account has been deactivated', 403);
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Firebase auth — login or register via Firebase ID token
 * @route   POST /api/auth/firebase
 * @access  Public
 */
exports.firebaseAuth = async (req, res, next) => {
  try {
    const { idToken, role = 'patient' } = req.body;
    
    if (!idToken) {
      return sendError(res, 'Firebase ID token is required', 400);
    }
    
    // Verify Firebase token
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      return sendError(res, 'Firebase authentication is not configured', 503);
    }
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, phone_number } = decodedToken;
    
    // Find or create user
    let user = await User.findOne({ firebaseUid: uid });
    
    if (!user && email) {
      user = await User.findOne({ email });
    }
    
    if (!user) {
      // Auto-register
      user = await User.create({
        firebaseUid: uid,
        name: name || 'User',
        email: email || `${uid}@firebase.local`,
        phone: phone_number || '',
        password: uid + Date.now(), // Random password (Firebase handles auth)
        role,
      });
    } else {
      // Update Firebase UID if missing
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        await user.save({ validateBeforeSave: false });
      }
    }
    
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    sendSuccess(res, user, 'Profile retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
exports.updateMe = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'avatar', 'dateOfBirth', 'gender', 'address', 'nic'];
    
    // Role-specific fields
    if (req.user.role === 'patient') {
      allowedFields.push('bloodType', 'allergies', 'emergencyContact', 'medicalHistory');
    }
    
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });
    
    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });
    
    sendSuccess(res, user, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update FCM token for push notifications
 * @route   PUT /api/auth/fcm-token
 * @access  Private
 */
exports.updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return sendError(res, 'FCM token is required', 400);
    }
    
    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    sendSuccess(res, null, 'FCM token updated');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect', 401);
    }
    
    user.password = newPassword;
    await user.save();
    
    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};
