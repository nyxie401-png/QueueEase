import { GEMINI_CLINIC_ASSISTANT_SYSTEM_PROMPT } from '../constants/geminiSystemPrompt';
import { checkDangerousInput, SAFE_VALIDATION_FALLBACK, validateAiResponse } from '../utils/aiSafetyUtils';

/**
 * Replace with your secure backend proxy endpoint.
 * Never store AI API keys in the mobile app source.
 */
const CHATBOT_PROXY_URL = process.env.REACT_APP_CHATBOT_API_URL || 'http://localhost:3000/api/chatbot';

export async function sendClinicAssistantMessage(
  userMessage: string,
  history: Array<{ role: string; content: string }>
) {
  const blockedCheck = checkDangerousInput(userMessage);
  if (blockedCheck.blocked) {
    return {
      success: false,
      blocked: true,
      assistantReply: blockedCheck.safeReply,
    };
  }

  const payload = {
    messages: [
      { role: 'system', content: GEMINI_CLINIC_ASSISTANT_SYSTEM_PROMPT },
      ...history.slice(-10), // keep last 10 messages for context
      { role: 'user', content: userMessage },
    ],
    temperature: 0.4,
    max_tokens: 400,
  };

  try {
    const response = await fetch(CHATBOT_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Chatbot proxy failed: ${response.status}`);
    }

    const result = await response.json();
    const assistantText = String(result?.data?.reply || result?.reply || '').trim();

    if (!assistantText) {
      return { success: false, blocked: false, assistantReply: SAFE_VALIDATION_FALLBACK };
    }

    const validation = validateAiResponse(assistantText);
    if (!validation.safe) {
      return { success: false, blocked: false, assistantReply: validation.safeText };
    }

    return { success: true, blocked: false, assistantReply: validation.safeText };
  } catch {
    return {
      success: false,
      blocked: false,
      assistantReply: 'QueueEase AI is temporarily unavailable. Please try again in a moment or contact clinic staff.',
    };
  }
}
