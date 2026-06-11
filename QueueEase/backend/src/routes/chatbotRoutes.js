/**
 * QueueEase V2 — Chatbot routes
 */

const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

router.post('/', protect, chatbotController.chat);

module.exports = router;
