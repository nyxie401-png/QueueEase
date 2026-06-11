/**
 * QueueEase V2 — Gemini AI proxy service
 * This module forwards chat prompts to a Gemini/OpenAI-compatible model
 * using a secure server-side API key.
 */

const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://api.openai.com/v1/chat/completions';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

if (!GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not set. Gemini chat completions will fail until the API key is configured.');
}

const normalizeMessages = (history = []) => {
  return history.map((item) => {
    if (item?.role && item?.content) {
      return {
        role: item.role,
        content: String(item.content),
      };
    }
    return null;
  }).filter(Boolean);
};

const createChatCompletion = async (message, history = []) => {
  const messages = [...normalizeMessages(history), { role: 'user', content: String(message) }];

  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing. Set GEMINI_API_KEY in your environment.');
  }

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GEMINI_API_KEY}`,
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 512,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || `Gemini API responded with status ${response.status}`);
  }

  const choice = payload.choices?.[0];
  const text = choice?.message?.content || choice?.message?.text || choice?.text;
  return String(text || '').trim();
};

module.exports = { createChatCompletion };
