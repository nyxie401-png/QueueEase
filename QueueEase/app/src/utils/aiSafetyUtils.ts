/**
 * QueueEase AI safety utilities.
 * Multi-layer guardrails on user input and AI output.
 */

const BLOCKED_KEYWORDS = [
  'prescribe','prescription','dosage','dose','medicine','medication',
  'pill','tablet','treatment','therapy','antibiotic','insulin','vaccine',
  'injection','surgery','diagnose','diagnosis','scan','mri','x-ray',
  'ct scan','lab report','blood test','urine test','pregnancy','pregnant',
  'breastfeeding','suicide','self-harm','overdose','emergency','urgent care',
  'chest pain','shortness of breath','heart attack','stroke','mental health',
  'crisis','anxiety attack','depression','psychological','therapy session',
  'treatment plan','medical advice','medical emergency','lab result',
  'scan result','MRI result','report interpretation','termination',
];

const RESPONSE_BLOCKERS = [
  'diagnose','diagnosis','prescribe','prescription','dosage','dose',
  'medicine','medication','treatment','treatment plan','recommend',
  'emergency','urgent','lab result','scan result','pregnancy',
  'self-harm','suicide',
];

export const SAFE_BLOCKED_RESPONSE =
  "I'm sorry, but I cannot provide medical or treatment guidance. Please consult a licensed healthcare professional for that request.";

export const SAFE_VALIDATION_FALLBACK =
  "My role is clinic support only, not medical advice. Please speak with a qualified healthcare professional.";

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

export function checkDangerousInput(message: string) {
  const normalized = normalize(message);
  for (const keyword of BLOCKED_KEYWORDS) {
    if (normalized.includes(keyword.toLowerCase())) {
      return { blocked: true, matchedKeyword: keyword, safeReply: SAFE_BLOCKED_RESPONSE };
    }
  }
  return { blocked: false, matchedKeyword: null, safeReply: null };
}

export function validateAiResponse(rawResponse: string) {
  const normalized = normalize(rawResponse);
  for (const keyword of RESPONSE_BLOCKERS) {
    if (normalized.includes(keyword.toLowerCase())) {
      return { safe: false, safeText: SAFE_VALIDATION_FALLBACK, detectedKeyword: keyword };
    }
  }
  return { safe: true, safeText: rawResponse.trim(), detectedKeyword: null };
}
