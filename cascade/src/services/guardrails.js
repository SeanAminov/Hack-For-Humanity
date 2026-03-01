/**
 * Responsible AI Guardrails for Emergency Analysis.
 * Validates AI content for safety, bias, and factual grounding.
 */

const SENSITIVE_TOPICS = [
  'suicide', 'self-harm', 'terrorism', 'extremism', 'hate speech',
];

const BIAS_PATTERNS = [
  { pattern: /(?:all|every|typical) (?:asian|black|white|hispanic|latino|arab)/i, category: 'race' },
  { pattern: /(?:immigrants|refugees) (?:always|never|are all|cause)/i, category: 'immigration' },
  { pattern: /(?:poor people|rich people|homeless) (?:always|never|are all)/i, category: 'socioeconomic' },
];

const GROUNDING_INDICATORS = [
  /\d+%/, /\d+ miles?/i, /\d+ minutes?/i, /\d+ hours?/i,
  /protocol/i, /standard/i, /according to/i, /FEMA/i,
  /response time/i, /capacity/i, /evacuation/i,
];

export function runGuardrailCheck(data) {
  const allText = [
    data.situation_assessment || '',
    ...(data.immediate_actions || []),
    ...(data.safety_warnings || []),
    data.additional_info || '',
  ].join(' ');

  // Safety
  const safetyFlags = [];
  const lower = allText.toLowerCase();
  for (const topic of SENSITIVE_TOPICS) {
    if (lower.includes(topic)) safetyFlags.push({ topic, message: `Reference to: ${topic}` });
  }

  // Bias
  const biasDetections = [];
  for (const { pattern, category } of BIAS_PATTERNS) {
    const match = allText.match(pattern);
    if (match) biasDetections.push({ category, matched: match[0] });
  }

  // Grounding
  let hits = 0;
  const evidence = [];
  for (const indicator of GROUNDING_INDICATORS) {
    const matches = allText.match(new RegExp(indicator, 'gi'));
    if (matches) { hits += matches.length; evidence.push(matches[0]); }
  }
  const words = allText.split(/\s+/).length;
  const groundingScore = Math.min(100, Math.round((hits / Math.max(words, 1)) * 5000));

  return {
    overall: safetyFlags.length === 0 && biasDetections.length === 0 ? 'pass' : 'flagged',
    safety: { safe: safetyFlags.length === 0, flags: safetyFlags },
    bias: { detected: biasDetections.length > 0, detections: biasDetections },
    grounding: {
      score: groundingScore,
      level: groundingScore >= 60 ? 'strong' : groundingScore >= 30 ? 'moderate' : 'weak',
      evidence: evidence.slice(0, 5),
    },
    timestamp: new Date().toISOString(),
    model: import.meta.env.VITE_MODEL_NAME || 'unknown',
  };
}
