import { GEMINI_CLINIC_ASSISTANT_SYSTEM_PROMPT } from '../constants/geminiSystemPrompt';
import { checkDangerousInput, SAFE_VALIDATION_FALLBACK, validateAiResponse } from '../utils/aiSafetyUtils';

/**
 * Replace this with your secure backend proxy endpoint.
 * Never store Gemini API keys in the mobile app source.
 */
const CHATBOT_PROXY_URL = 'https://your-secure-backend.example.com/api/chatbot';

/**
 * Build the Gemini-style message payload for the chatbot.
 */
function buildRequestPayload(userMessage: string, history: Array<{ role: string; content: string }>) {
  return {
    model: 'gemini-1.5-pro',
    messages: [
      { role: 'system', content: GEMINI_CLINIC_ASSISTANT_SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: userMessage },
    ],
    temperature: 0.4,
    max_tokens: 400,
  };
}

/**
 * Send a safe clinic assistant request to the backend proxy.
 * This function applies a pre-call filter and a response validator.
 */
export async function sendClinicAssistantMessage(userMessage: string, history: Array<{ role: string; content: string }>) {
  const blockedCheck = checkDangerousInput(userMessage);
  if (blockedCheck.blocked) {
    return {
      success: false,
      blocked: true,
      assistantReply: blockedCheck.safeReply,
      blockedKeyword: blockedCheck.matchedKeyword,
    };
  }

  const payload = buildRequestPayload(userMessage, history);

  try {
    const response = await fetch(CHATBOT_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chatbot proxy failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    const assistantText = String(result?.data?.reply || result?.reply || '').trim();

    if (!assistantText) {
      return {
        success: false,
        blocked: false,
        assistantReply: SAFE_VALIDATION_FALLBACK,
      };
    }

    const validation = validateAiResponse(assistantText);
    if (!validation.safe) {
      return {
        success: false,
        blocked: false,
        assistantReply: validation.safeText,
        detectedKeyword: validation.detectedKeyword,
      };
    }

    return {
      success: true,
      blocked: false,
      assistantReply: validation.safeText,
    };
  } catch (error) {
    return {
      success: false,
      blocked: false,
      assistantReply:
        'QueueEase AI is temporarily unavailable. Please try again in a moment or consult clinic staff for support.',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
