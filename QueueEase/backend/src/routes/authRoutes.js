/**
 * QueueEase V2 — Auth Routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validators');

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/firebase', authController.firebaseAuth);
router.get('/me', protect, authController.getMe);
router.put('/me', protect, authController.updateMe);
router.put('/fcm-token', protect, authController.updateFcmToken);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
