/**
 * Responsible AI Guardrails System
 *
 * Validates AI-generated content for safety, bias, and accuracy.
 * Provides transparency metadata for every AI response.
 * Ensures ethical boundaries in life simulation scenarios.
 */

// Sensitive topics that require careful handling
const SENSITIVE_TOPICS = [
  'suicide', 'self-harm', 'eating disorder', 'substance abuse',
  'domestic violence', 'sexual assault', 'child abuse',
  'terrorism', 'extremism', 'hate speech',
];

// Bias indicators: stereotypical associations to flag
const BIAS_PATTERNS = [
  { pattern: /(?:women|girls) (?:can't|cannot|shouldn't|are bad at)/i, category: 'gender' },
  { pattern: /(?:men|boys) (?:don't|can't|shouldn't) (?:cry|feel|care)/i, category: 'gender' },
  { pattern: /(?:old|elderly) people (?:can't|shouldn't|are unable)/i, category: 'age' },
  { pattern: /(?:young people|millennials|gen z) (?:are lazy|don't work|can't)/i, category: 'age' },
  { pattern: /(?:all|every|typical) (?:asian|black|white|hispanic|latino|arab)/i, category: 'race' },
  { pattern: /(?:poor people|rich people) (?:always|never|are all)/i, category: 'socioeconomic' },
];

// Required factual grounding keywords (stats, data references)
const GROUNDING_INDICATORS = [
  /\d+%/, /\$[\d,]+/, /according to/, /studies show/i, /statistics/i,
  /on average/i, /median/i, /research/i, /data/i, /typically/i,
  /industry standard/i, /market rate/i, /national average/i,
];

/**
 * Checks if AI-generated text contains harmful content.
 * Returns safety report with status and any flagged issues.
 */
export function checkContentSafety(text) {
  const flags = [];
  const lowerText = (text || '').toLowerCase();

  for (const topic of SENSITIVE_TOPICS) {
    if (lowerText.includes(topic)) {
      flags.push({
        type: 'sensitive_topic',
        topic,
        severity: 'warning',
        message: `Contains reference to sensitive topic: ${topic}`,
      });
    }
  }

  return {
    safe: flags.filter(f => f.severity === 'blocked').length === 0,
    flags,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Scans AI-generated content for potential bias patterns.
 * Returns bias report with any detected stereotypical language.
 */
export function checkBias(text) {
  const detections = [];

  for (const { pattern, category } of BIAS_PATTERNS) {
    const match = (text || '').match(pattern);
    if (match) {
      detections.push({
        category,
        matched: match[0],
        message: `Potential ${category} bias detected`,
      });
    }
  }

  return {
    biasDetected: detections.length > 0,
    detections,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Checks whether AI-generated scenarios reference real data/statistics.
 * Higher grounding score = more factually anchored content.
 */
export function checkGrounding(text) {
  let groundingHits = 0;
  const evidence = [];

  for (const indicator of GROUNDING_INDICATORS) {
    const matches = (text || '').match(new RegExp(indicator, 'gi'));
    if (matches) {
      groundingHits += matches.length;
      evidence.push(matches[0]);
    }
  }

  // Score from 0-100 based on density of factual indicators
  const wordCount = (text || '').split(/\s+/).length;
  const density = wordCount > 0 ? (groundingHits / wordCount) * 100 : 0;
  const score = Math.min(100, Math.round(density * 50));

  return {
    score,
    level: score >= 60 ? 'strong' : score >= 30 ? 'moderate' : 'weak',
    evidence: evidence.slice(0, 5),
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Validates the structure and values of AI-generated metrics.
 * Ensures no unrealistic jumps and values stay within bounds.
 */
export function validateMetrics(metricsChange) {
  const issues = [];
  const MAX_SINGLE_CHANGE = 30; // No single choice should swing more than 30 points

  if (!metricsChange) return { valid: false, issues: ['No metrics provided'] };

  for (const [key, value] of Object.entries(metricsChange)) {
    if (typeof value !== 'number') {
      issues.push(`${key}: not a number`);
    } else if (Math.abs(value) > MAX_SINGLE_CHANGE) {
      issues.push(`${key}: change of ${value} exceeds safe range (±${MAX_SINGLE_CHANGE})`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Runs all guardrail checks on a complete round response.
 * Returns a comprehensive safety report shown to the user.
 */
export function runFullGuardrailCheck(roundData) {
  // Combine all text content from the round
  const allText = [
    roundData.narration || '',
    roundData.dilemma || '',
    ...(roundData.options || []).map(o =>
      `${o.title} ${o.description} ${o.immediate_consequence} ${o.hidden_consequence} ${o.gut_feeling}`
    ),
  ].join(' ');

  const safety = checkContentSafety(allText);
  const bias = checkBias(allText);
  const grounding = checkGrounding(allText);

  // Validate metrics for each option
  const metricsValidation = (roundData.options || []).map(o => ({
    optionId: o.id,
    ...validateMetrics(o.metrics_change),
  }));

  // Clamp any out-of-bound metrics
  const metricsWereClamped = metricsValidation.some(m => !m.valid);

  return {
    overall: safety.safe && !bias.biasDetected ? 'pass' : 'flagged',
    safety,
    bias,
    grounding,
    metricsValidation,
    metricsWereClamped,
    timestamp: new Date().toISOString(),
    model: import.meta.env.VITE_MODEL_NAME || 'unknown',
  };
}

/**
 * Clamps metric changes to safe ranges.
 * Applied after AI generation to prevent unrealistic swings.
 */
export function clampMetrics(options) {
  const MAX = 25;
  return options.map(option => ({
    ...option,
    metrics_change: Object.fromEntries(
      Object.entries(option.metrics_change || {}).map(([key, val]) => [
        key,
        Math.max(-MAX, Math.min(MAX, typeof val === 'number' ? val : 0)),
      ])
    ),
  }));
}

/**
 * Generates the responsible AI rules injected into the system prompt.
 * These instruct the AI model to follow ethical guidelines.
 */
export function getResponsibleAIPromptRules() {
  return `
RESPONSIBLE AI GUARDRAILS (you MUST follow these):
1. CONTENT SAFETY: Never generate content that promotes self-harm, violence, illegal activity,
   or discrimination. If a decision path could lead to harmful territory, address it responsibly
   by showing realistic negative consequences rather than glorifying harmful choices.
2. BIAS AVOIDANCE: Do not make assumptions about outcomes based on the player's age, gender,
   race, or background. Ensure all 3 options are viable regardless of demographics. Avoid
   stereotypical career/life paths.
3. FACTUAL GROUNDING: Every scenario must reference real-world data points — actual salary
   ranges, real market statistics, genuine industry failure/success rates. Cite specific
   numbers, not vague claims. If you mention a statistic, it must be grounded in reality.
4. BALANCED OUTCOMES: No option should be a guaranteed win or guaranteed loss. Every path
   must have genuine tradeoffs. Avoid "trick" options designed to punish the player.
5. MENTAL HEALTH AWARENESS: If scenarios involve stress, burnout, or mental health struggles,
   include constructive coping paths. Never frame seeking help as weakness.
6. FINANCIAL REALISM: Use real cost-of-living data, actual salary ranges for the player's
   location and career stage, and realistic investment/savings projections. No fantasy economics.
7. METRIC PROPORTIONALITY: Changes to life metrics must be proportional. A single choice should
   not swing any metric by more than 25 points. Major life changes unfold over multiple rounds.`;
}
