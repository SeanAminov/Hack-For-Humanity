/**
 * AI Service — handles all LLM API calls for the Cascade game.
 * Supports OpenAI API and any OpenAI-compatible endpoint (AMD vLLM, etc.)
 * Integrates responsible AI guardrails on every response.
 */

import { runFullGuardrailCheck, clampMetrics, getResponsibleAIPromptRules } from './guardrails';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.openai.com/v1';
const API_KEY = import.meta.env.VITE_API_KEY || '';
const MODEL = import.meta.env.VITE_MODEL_NAME || 'gpt-4.1-mini';

const ROUND_TIMEFRAMES = [
  'Immediate — the first month',
  '6 months later',
  '1 year later',
  '2 years later',
  '5 years later — the long view',
];

/**
 * Builds the system prompt with player profile and responsible AI rules.
 * The guardrail rules are injected directly so the model follows them.
 */
function buildSystemPrompt(profile) {
  const guardrailRules = getResponsibleAIPromptRules();

  return `You are Cascade, an AI narrative engine that simulates realistic life consequences. You create deeply personalized, research-grounded scenarios based on the player's real profile. You write like a novelist — specific, vivid, emotionally resonant.

PLAYER PROFILE:
Name: ${profile.name}
Age: ${profile.age}
Location: ${profile.location}
Current situation: ${profile.situation}
Life goals: ${profile.goals.join(', ')}
Risk tolerance: ${profile.riskTolerance}

NARRATIVE RULES:
1. Every scenario MUST be grounded in real-world statistics and outcomes. Reference actual data when relevant (startup failure rates, salary ranges, market conditions, health statistics, cost of living, industry trends). Be specific with numbers.
2. Write narratively with specific details, names of people they'd meet, emotions, and sensory details. This should read like a chapter in a novel about THIS person's life, not a generic simulation.
3. Generate exactly 3 response options representing genuinely different philosophies:
   - One BOLD move (high risk, high reward, gut-driven)
   - One STRATEGIC play (calculated, moderate, head-driven)
   - One SAFE bet (protective, conservative, security-driven)
4. Each option MUST have real, meaningful tradeoffs. No option is clearly "right." Every path sacrifices something.
5. BUTTERFLY EFFECT: In rounds 3, 4, and 5, you MUST reference and build upon specific choices from earlier rounds. Mark these with [CALLBACK:round_N] in the narration text where N is the round number being referenced. Make the callback feel dramatic and earned.
6. Hidden consequences should feel surprising but logical in hindsight.
7. Metrics changes must be realistic and proportional. No single change should exceed ±25 points.
8. The narrative must feel like THIS person's actual life trajectory, personalized to their age, location, career stage, and goals.
${guardrailRules}

You MUST return ONLY valid JSON. No markdown, no code fences, no explanation outside the JSON.`;
}

/**
 * Builds the user prompt for a specific game round.
 * Includes full history for context continuity and callback instructions.
 */
function buildRoundPrompt(decision, round, metrics, history) {
  const timeframe = ROUND_TIMEFRAMES[round - 1];

  let historyText = 'No previous choices yet.';
  if (history.length > 0) {
    historyText = history.map((h, i) => {
      const chosen = h.options.find(o => o.id === h.chosenId);
      return `Round ${i + 1} (${ROUND_TIMEFRAMES[i]}): Faced "${h.dilemma}" — Chose "${chosen.title}" (${chosen.philosophy}). Immediate result: ${chosen.immediate_consequence}. Hidden consequence: ${chosen.hidden_consequence}`;
    }).join('\n');
  }

  let callbackInstruction = '';
  if (round >= 3) {
    callbackInstruction = `\nCRITICAL — BUTTERFLY EFFECT: You MUST include at least one callback to a specific choice from a previous round. Show how a past decision is now creating unexpected consequences. Mark it with [CALLBACK:round_N] in the narration.`;
  }
  if (round === 5) {
    callbackInstruction = `\nCRITICAL — FINAL ROUND: This is the resolution. Bring closure to the entire journey. You MUST callback to the very first choice from round 1 and show its long-term impact. Also reference at least one other past choice. This should feel like the climax of a story. Mark callbacks with [CALLBACK:round_N].`;
  }

  return `DECISION: "${decision}"
ROUND: ${round}/5 — ${timeframe}
CURRENT METRICS: Financial: ${metrics.financial}/100, Wellbeing: ${metrics.wellbeing}/100, Career: ${metrics.career}/100, Relationships: ${metrics.relationships}/100, Purpose: ${metrics.purpose}/100
FULL HISTORY:
${historyText}
${callbackInstruction}

Generate this round's scenario. The situation MUST flow naturally and causally from previous choices.

Return this exact JSON structure:
{
  "narration": "2-3 vivid paragraphs setting the scene. What has happened since the last choice? How has the world shifted? Include specific details, names, places, emotions. If round >= 3, weave in callbacks naturally.",
  "dilemma": "1-2 sentences that frame the core tension. What forces the player's hand RIGHT NOW?",
  "callbacks": [{"from_round": 1, "description": "brief description of what past choice is resurfacing and why"}],
  "options": [
    {
      "id": 1,
      "title": "3-6 word punchy title",
      "description": "What you'd do and why, in 2-3 vivid sentences.",
      "philosophy": "bold",
      "risk": "high",
      "gut_feeling": "One sentence — what your gut says about this choice.",
      "affected_metrics": ["financial", "career"],
      "metrics_change": {"financial": 0, "wellbeing": 0, "career": 0, "relationships": 0, "purpose": 0},
      "immediate_consequence": "2-3 sentences of what happens RIGHT AFTER choosing this. Vivid and specific.",
      "hidden_consequence": "1-2 sentences — a surprising consequence that wasn't obvious. Seeds future rounds."
    },
    {
      "id": 2,
      "title": "3-6 word title",
      "description": "2-3 sentences.",
      "philosophy": "strategic",
      "risk": "medium",
      "gut_feeling": "One sentence.",
      "affected_metrics": ["career", "relationships"],
      "metrics_change": {"financial": 0, "wellbeing": 0, "career": 0, "relationships": 0, "purpose": 0},
      "immediate_consequence": "2-3 sentences.",
      "hidden_consequence": "1-2 sentences."
    },
    {
      "id": 3,
      "title": "3-6 word title",
      "description": "2-3 sentences.",
      "philosophy": "safe",
      "risk": "low",
      "gut_feeling": "One sentence.",
      "affected_metrics": ["wellbeing", "relationships"],
      "metrics_change": {"financial": 0, "wellbeing": 0, "career": 0, "relationships": 0, "purpose": 0},
      "immediate_consequence": "2-3 sentences.",
      "hidden_consequence": "1-2 sentences."
    }
  ]
}`;
}

/**
 * Builds the prompt for the end-of-game narrative summary.
 */
function buildSummaryPrompt(decision, history, finalMetrics, profile) {
  const journeyText = history.map((h, i) => {
    const chosen = h.options.find(o => o.id === h.chosenId);
    return `Round ${i + 1}: "${h.dilemma}" → Chose "${chosen.title}" (${chosen.philosophy})`;
  }).join('\n');

  return `Write a compelling narrative summary of this player's journey through Cascade.

PLAYER: ${profile.name}, ${profile.age}, from ${profile.location}
ORIGINAL DECISION: "${decision}"
GOALS: ${profile.goals.join(', ')}

JOURNEY:
${journeyText}

FINAL METRICS: Financial: ${finalMetrics.financial}, Wellbeing: ${finalMetrics.wellbeing}, Career: ${finalMetrics.career}, Relationships: ${finalMetrics.relationships}, Purpose: ${finalMetrics.purpose}

Write 3-4 paragraphs that:
1. Summarize the arc of their journey like an epilogue in a novel
2. Highlight the most pivotal choice and its butterfly effects
3. Reflect on what they gained and what they sacrificed
4. End with a thought-provoking line about the nature of decisions

Also calculate a Foresight Score (S/A/B/C/D) based on how well they achieved their stated goals.

Return JSON:
{
  "narrative": "3-4 paragraph story summary",
  "pivotal_moment": "Which round and choice was the turning point",
  "score": "S|A|B|C|D",
  "score_reason": "1-2 sentences explaining the grade",
  "tagline": "A memorable one-line summary of their journey"
}`;
}

/**
 * Extracts JSON from LLM response text.
 * Handles raw JSON, markdown-fenced JSON, and JSON embedded in prose.
 */
function extractJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    // Handle markdown code fences
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      try {
        return JSON.parse(fenceMatch[1].trim());
      } catch { /* fall through */ }
    }
    // Extract JSON object from surrounding text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Could not parse JSON from AI response');
  }
}

/**
 * Makes a request to the LLM API with retry logic.
 */
async function callLLM(systemPrompt, userPrompt, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY && API_KEY !== 'none' ? { 'Authorization': `Bearer ${API_KEY}` } : {}),
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.85,
          max_tokens: 2500,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API error ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const content = data.choices[0].message.content;
      return extractJSON(content);
    } catch (err) {
      if (attempt === retries) throw err;
      // Wait before retrying (exponential backoff)
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}

/**
 * Generates a game round with full guardrail validation.
 * Returns both the round data and the guardrail report.
 */
export async function generateRound(profile, decision, history, round) {
  const systemPrompt = buildSystemPrompt(profile);
  const metrics = getCurrentMetrics(history, profile);
  const userPrompt = buildRoundPrompt(decision, round, metrics, history);

  const rawData = await callLLM(systemPrompt, userPrompt);

  // Run guardrail checks on raw AI output
  const guardrailReport = runFullGuardrailCheck(rawData);

  // Clamp metrics to safe ranges regardless of what the AI returned
  const safeOptions = clampMetrics(rawData.options || []);

  // Ensure callbacks array exists
  const callbacks = rawData.callbacks || [];

  return {
    ...rawData,
    options: safeOptions,
    callbacks,
    guardrailReport,
  };
}

/**
 * Generates the end-of-game narrative summary.
 */
export async function generateSummary(profile, decision, history) {
  const systemPrompt = buildSystemPrompt(profile);
  const metrics = getCurrentMetrics(history, profile);
  const userPrompt = buildSummaryPrompt(decision, history, metrics, profile);
  return callLLM(systemPrompt, userPrompt);
}

/**
 * Computes current metrics by applying all historical choices to starting values.
 */
function getCurrentMetrics(history, profile) {
  const base = getStartingMetrics(profile);
  const metrics = { ...base };

  for (const round of history) {
    const chosen = round.options.find(o => o.id === round.chosenId);
    if (chosen?.metrics_change) {
      for (const key of Object.keys(metrics)) {
        metrics[key] = Math.max(0, Math.min(100, metrics[key] + (chosen.metrics_change[key] || 0)));
      }
    }
  }
  return metrics;
}

/**
 * Returns starting metrics personalized to the player's age.
 */
export function getStartingMetrics(profile) {
  const age = parseInt(profile.age) || 25;
  if (age < 22) {
    return { financial: 25, wellbeing: 65, career: 20, relationships: 60, purpose: 40 };
  } else if (age < 30) {
    return { financial: 40, wellbeing: 55, career: 40, relationships: 55, purpose: 45 };
  } else if (age < 40) {
    return { financial: 55, wellbeing: 50, career: 60, relationships: 50, purpose: 50 };
  } else {
    return { financial: 65, wellbeing: 45, career: 70, relationships: 50, purpose: 55 };
  }
}

export { getCurrentMetrics };
