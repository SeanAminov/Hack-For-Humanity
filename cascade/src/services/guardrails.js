/**
 * Responsible AI Guardrails for Emergency Response Simulator.
 * Validates AI content for safety, bias, accuracy, and proportionality.
 */

const SENSITIVE_TOPICS = [
  'suicide', 'self-harm', 'eating disorder', 'substance abuse',
  'domestic violence', 'sexual assault', 'child abuse',
  'terrorism', 'extremism', 'hate speech',
];

const BIAS_PATTERNS = [
  { pattern: /(?:women|girls) (?:can't|cannot|shouldn't|are bad at)/i, category: 'gender' },
  { pattern: /(?:men|boys) (?:don't|can't|shouldn't) (?:cry|feel|care)/i, category: 'gender' },
  { pattern: /(?:old|elderly) people (?:can't|shouldn't|are unable)/i, category: 'age' },
  { pattern: /(?:all|every|typical) (?:asian|black|white|hispanic|latino|arab)/i, category: 'race' },
  { pattern: /(?:poor people|rich people) (?:always|never|are all)/i, category: 'socioeconomic' },
  { pattern: /(?:immigrants|refugees) (?:always|never|are all|cause)/i, category: 'immigration' },
];

const GROUNDING_INDICATORS = [
  /\d+%/, /\$[\d,]+/, /according to/, /statistics/i, /on average/i,
  /median/i, /response time/i, /data/i, /typically/i, /protocol/i,
  /standard/i, /minutes?/i, /hour/i, /casualties/i, /units?/i,
];

export function checkContentSafety(text) {
  const flags = [];
  const lowerText = (text || '').toLowerCase();
  for (const topic of SENSITIVE_TOPICS) {
    if (lowerText.includes(topic)) {
      flags.push({ type: 'sensitive_topic', topic, severity: 'warning', message: `Reference to: ${topic}` });
    }
  }
  return { safe: flags.filter(f => f.severity === 'blocked').length === 0, flags, checkedAt: new Date().toISOString() };
}

export function checkBias(text) {
  const detections = [];
  for (const { pattern, category } of BIAS_PATTERNS) {
    const match = (text || '').match(pattern);
    if (match) detections.push({ category, matched: match[0], message: `Potential ${category} bias` });
  }
  return { biasDetected: detections.length > 0, detections, checkedAt: new Date().toISOString() };
}

export function checkGrounding(text) {
  let groundingHits = 0;
  const evidence = [];
  for (const indicator of GROUNDING_INDICATORS) {
    const matches = (text || '').match(new RegExp(indicator, 'gi'));
    if (matches) { groundingHits += matches.length; evidence.push(matches[0]); }
  }
  const wordCount = (text || '').split(/\s+/).length;
  const density = wordCount > 0 ? (groundingHits / wordCount) * 100 : 0;
  const score = Math.min(100, Math.round(density * 50));
  return { score, level: score >= 60 ? 'strong' : score >= 30 ? 'moderate' : 'weak', evidence: evidence.slice(0, 5), checkedAt: new Date().toISOString() };
}

export function validateMetrics(metricsChange) {
  const issues = [];
  const MAX_SINGLE_CHANGE = 30;
  if (!metricsChange) return { valid: false, issues: ['No metrics provided'] };
  for (const [key, value] of Object.entries(metricsChange)) {
    if (typeof value !== 'number') issues.push(`${key}: not a number`);
    else if (Math.abs(value) > MAX_SINGLE_CHANGE) issues.push(`${key}: change of ${value} exceeds ±${MAX_SINGLE_CHANGE}`);
  }
  return { valid: issues.length === 0, issues, checkedAt: new Date().toISOString() };
}

export function runFullGuardrailCheck(roundData) {
  const allText = [
    roundData.narration || '', roundData.dilemma || '',
    ...(roundData.options || []).map(o => `${o.title} ${o.description} ${o.immediate_consequence} ${o.hidden_consequence} ${o.gut_feeling}`),
  ].join(' ');

  const safety = checkContentSafety(allText);
  const bias = checkBias(allText);
  const grounding = checkGrounding(allText);
  const metricsValidation = (roundData.options || []).map(o => ({ optionId: o.id, ...validateMetrics(o.metrics_change) }));
  const metricsWereClamped = metricsValidation.some(m => !m.valid);

  return {
    overall: safety.safe && !bias.biasDetected ? 'pass' : 'flagged',
    safety, bias, grounding, metricsValidation, metricsWereClamped,
    timestamp: new Date().toISOString(),
    model: import.meta.env.VITE_MODEL_NAME || 'unknown',
  };
}

export function clampMetrics(options) {
  const MAX = 25;
  return options.map(option => ({
    ...option,
    metrics_change: Object.fromEntries(
      Object.entries(option.metrics_change || {}).map(([key, val]) => [key, Math.max(-MAX, Math.min(MAX, typeof val === 'number' ? val : 0))])
    ),
  }));
}

export function getResponsibleAIPromptRules() {
  return `
RESPONSIBLE AI GUARDRAILS:
1. CONTENT SAFETY: Never generate content promoting violence or discrimination. Show realistic consequences of emergency decisions without gratuitous detail.
2. BIAS AVOIDANCE: Do not make assumptions about affected populations based on demographics. Ensure response options are evaluated on effectiveness, not politics.
3. FACTUAL GROUNDING: Reference real emergency management data — response times, resource capacities, NIMS/ICS protocols, mutual aid standards. Use specific numbers.
4. BALANCED OUTCOMES: Every option must have genuine tradeoffs. No option should be clearly "right" or designed to punish. Real emergencies have no perfect answers.
5. PROPORTIONALITY: Metric changes must be realistic and proportional. No single decision swings any metric by more than 25 points.
6. SENSITIVITY: Handle mass casualty scenarios with appropriate gravity. Never trivialize loss of life or make light of emergency situations.
7. PUBLIC DATA ONLY: All referenced data must be publicly available — emergency response statistics, published protocols, public infrastructure data.`;
}
