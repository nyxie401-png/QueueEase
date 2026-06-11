/**
 * QueueEase V2 — Chatbot controller
 */

const { sendSuccess, sendError } = require('../utils/apiResponse');
const { createChatCompletion } = require('../services/geminiService');

exports.chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (typeof message !== 'string' || !message.trim()) {
      return sendError(res, 'A chat message is required.', 400);
    }

    const reply = await createChatCompletion(message.trim(), Array.isArray(history) ? history : []);

    return sendSuccess(res, { reply }, 'AI response received.');
  } catch (error) {
    return next(error);
  }
};
