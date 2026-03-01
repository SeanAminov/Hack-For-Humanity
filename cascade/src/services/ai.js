/**
 * AI Service — Emergency Response Simulator powered by AMD MI300X + vLLM.
 * Generates realistic emergency scenarios with cascading consequences.
 * Uses only publicly available data (emergency protocols, public safety stats).
 */

import { runFullGuardrailCheck, clampMetrics, getResponsibleAIPromptRules } from './guardrails';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.openai.com/v1';
const API_KEY = import.meta.env.VITE_API_KEY || '';
const MODEL = import.meta.env.VITE_MODEL_NAME || 'gpt-4.1-mini';

const PHASE_TIMEFRAMES = [
  'First 30 minutes — initial response',
  '2 hours in — situation escalating',
  '6 hours in — critical decisions',
  '12 hours in — long-term strategy',
  '24 hours later — aftermath and recovery',
];

// Map locations for AI to reference
const AREA_CONTEXT = `OPERATIONAL AREA — San Jose / Santa Clara, California:
Key locations: San Jose State University (SJSU), Santa Clara University (SCU),
Valley Medical Center, Regional Medical Center, O'Connor Hospital,
San Jose Police Department HQ, Fire Station 1 (downtown), SJC Airport.
Population: ~1 million metro. Major highways: I-280, I-880, US-101, SR-87.
Santa Clara County emergency services, San Jose Fire Department (33 stations),
San Jose Police Department (1,100+ officers). VTA light rail transit system.`;

function buildSystemPrompt(profile) {
  const guardrailRules = getResponsibleAIPromptRules();

  return `You are CASCADE, an AI emergency response training simulator. You generate realistic emergency scenarios with cascading consequences to train decision-makers. All scenarios use publicly available information about emergency protocols, response times, and urban infrastructure.

RESPONDER PROFILE:
Role: ${profile.role}
Experience Level: ${profile.experience}
Agency: ${profile.agency}
Focus Area: ${profile.focus}

${AREA_CONTEXT}

SIMULATION RULES:
1. Generate realistic emergency scenarios grounded in real emergency management protocols (NIMS/ICS). Reference actual response time standards, resource capacities, and public safety data.
2. Write vivid, urgent situation reports with specific locations, casualty estimates, resource counts, and time pressure. This should feel like a real incident command briefing.
3. Generate exactly 3 response options representing different strategies:
   - One AGGRESSIVE response (fast, resource-heavy, high risk)
   - One MEASURED response (balanced, by-the-book, moderate risk)
   - One CONSERVATIVE response (cautious, preserve resources, lower risk)
4. Every option MUST have real tradeoffs. Aggressive responses may overextend resources. Conservative responses may let the situation worsen. No option is clearly "right."
5. CASCADE EFFECT: In phases 3, 4, and 5, you MUST reference specific decisions from earlier phases. Mark with [CALLBACK:phase_N]. Show how earlier choices created unexpected second/third-order effects.
6. Use real public data: average fire response times (4-8 min), ambulance response (8-12 min), hospital bed capacities, evacuation route speeds, mutual aid agreements.
7. Metrics changes must be proportional. No single decision should swing any metric by more than 25 points.
8. Hidden consequences should reflect real emergency management challenges: resource fatigue, communication failures, public panic, media pressure, political fallout.
${guardrailRules}

You MUST return ONLY valid JSON. No markdown, no code fences, no explanation outside the JSON.`;
}

function buildRoundPrompt(scenario, round, metrics, history) {
  const timeframe = PHASE_TIMEFRAMES[round - 1];

  let historyText = 'No previous decisions yet.';
  if (history.length > 0) {
    historyText = history.map((h, i) => {
      const chosen = h.options.find(o => o.id === h.chosenId);
      return `Phase ${i + 1} (${PHASE_TIMEFRAMES[i]}): "${h.dilemma}" — Chose "${chosen.title}" (${chosen.philosophy}). Result: ${chosen.immediate_consequence}. Hidden effect: ${chosen.hidden_consequence}`;
    }).join('\n');
  }

  let callbackInstruction = '';
  if (round >= 3) {
    callbackInstruction = `\nCASCADE EFFECT: You MUST show how a previous decision is now creating unexpected consequences. Mark with [CALLBACK:phase_N].`;
  }
  if (round === 5) {
    callbackInstruction = `\nFINAL PHASE: This is the aftermath. Show the full cascade — how the first decision rippled through everything. Reference phase 1 and at least one other phase. Mark with [CALLBACK:phase_N].`;
  }

  return `SCENARIO: "${scenario}"
PHASE: ${round}/5 — ${timeframe}
METRICS: Lives Saved: ${metrics.lives_saved}/100, Response Time: ${metrics.response_time}/100, Resources: ${metrics.resources}/100, Public Trust: ${metrics.public_trust}/100, Coordination: ${metrics.coordination}/100
HISTORY:
${historyText}
${callbackInstruction}

Generate this phase's situation. It MUST flow causally from previous decisions.

Return this exact JSON:
{
  "narration": "2-3 paragraphs of urgent situation report. What's happening NOW? Include specific locations near SJSU/SCU area, casualty numbers, resource status, time pressure. If phase >= 3, weave in callbacks.",
  "dilemma": "1-2 sentences framing the core decision. What forces your hand RIGHT NOW?",
  "callbacks": [{"from_round": 1, "description": "what past decision is affecting the current situation"}],
  "map_events": [
    {"type": "incident", "lat": 37.335, "lng": -121.881, "radius": 400, "label": "Main incident zone", "severity": "high"},
    {"type": "resource", "lat": 37.338, "lng": -121.886, "radius": 200, "label": "Command post"}
  ],
  "options": [
    {
      "id": 1,
      "title": "3-6 word action title",
      "description": "What this response entails, in 2-3 specific sentences.",
      "philosophy": "aggressive",
      "risk": "high",
      "gut_feeling": "One sentence — the instinct behind this choice.",
      "metrics_change": {"lives_saved": 0, "response_time": 0, "resources": 0, "public_trust": 0, "coordination": 0},
      "immediate_consequence": "2-3 sentences of what happens immediately.",
      "hidden_consequence": "1-2 sentences — an unexpected cascade effect.",
      "map_updates": [{"type": "resource", "lat": 37.335, "lng": -121.881, "radius": 300, "label": "Deployed units"}]
    },
    {
      "id": 2,
      "title": "3-6 word title",
      "description": "2-3 sentences.",
      "philosophy": "measured",
      "risk": "medium",
      "gut_feeling": "One sentence.",
      "metrics_change": {"lives_saved": 0, "response_time": 0, "resources": 0, "public_trust": 0, "coordination": 0},
      "immediate_consequence": "2-3 sentences.",
      "hidden_consequence": "1-2 sentences.",
      "map_updates": []
    },
    {
      "id": 3,
      "title": "3-6 word title",
      "description": "2-3 sentences.",
      "philosophy": "conservative",
      "risk": "low",
      "gut_feeling": "One sentence.",
      "metrics_change": {"lives_saved": 0, "response_time": 0, "resources": 0, "public_trust": 0, "coordination": 0},
      "immediate_consequence": "2-3 sentences.",
      "hidden_consequence": "1-2 sentences.",
      "map_updates": []
    }
  ]
}`;
}

function buildSummaryPrompt(scenario, history, finalMetrics, profile) {
  const journeyText = history.map((h, i) => {
    const chosen = h.options.find(o => o.id === h.chosenId);
    return `Phase ${i + 1}: "${h.dilemma}" → Chose "${chosen.title}" (${chosen.philosophy})`;
  }).join('\n');

  return `Write an after-action report for this emergency response simulation.

RESPONDER: ${profile.role} (${profile.experience}), ${profile.agency}
SCENARIO: "${scenario}"
FOCUS: ${profile.focus}

DECISIONS:
${journeyText}

FINAL METRICS: Lives Saved: ${finalMetrics.lives_saved}, Response Time: ${finalMetrics.response_time}, Resources: ${finalMetrics.resources}, Public Trust: ${finalMetrics.public_trust}, Coordination: ${finalMetrics.coordination}

Write 3-4 paragraphs:
1. Summarize the response arc — what went well, what cascaded badly
2. Identify the most pivotal decision and its butterfly effects
3. What was gained and what was lost
4. End with a lesson about emergency response decision-making

Also calculate a Response Grade (S/A/B/C/D).

Return JSON:
{
  "narrative": "3-4 paragraph after-action report",
  "pivotal_moment": "Which phase and decision was the turning point",
  "score": "S|A|B|C|D",
  "score_reason": "1-2 sentences explaining the grade",
  "tagline": "A memorable one-line summary of this response"
}`;
}

function extractJSON(text) {
  try { return JSON.parse(text); } catch {
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) { try { return JSON.parse(fenceMatch[1].trim()); } catch { /* fall through */ } }
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('Could not parse JSON from AI response');
  }
}

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
          temperature: 0.8,
          max_tokens: 2500,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API error ${res.status}: ${errText}`);
      }
      const data = await res.json();
      return extractJSON(data.choices[0].message.content);
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}

export async function generateRound(profile, decision, history, round) {
  const systemPrompt = buildSystemPrompt(profile);
  const metrics = getCurrentMetrics(history, profile);
  const userPrompt = buildRoundPrompt(decision, round, metrics, history);
  const rawData = await callLLM(systemPrompt, userPrompt);
  const guardrailReport = runFullGuardrailCheck(rawData);
  const safeOptions = clampMetrics(rawData.options || []);
  return {
    ...rawData,
    options: safeOptions,
    callbacks: rawData.callbacks || [],
    map_events: rawData.map_events || [],
    guardrailReport,
  };
}

export async function generateSummary(profile, decision, history) {
  const systemPrompt = buildSystemPrompt(profile);
  const metrics = getCurrentMetrics(history, profile);
  return callLLM(systemPrompt, buildSummaryPrompt(decision, history, metrics, profile));
}

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

export function getStartingMetrics(profile) {
  // All start at balanced 50, adjusted by experience
  const exp = profile?.experience || 'Intermediate';
  if (exp === 'Veteran') {
    return { lives_saved: 60, response_time: 55, resources: 50, public_trust: 60, coordination: 65 };
  } else if (exp === 'Senior') {
    return { lives_saved: 55, response_time: 50, resources: 50, public_trust: 55, coordination: 55 };
  } else {
    return { lives_saved: 50, response_time: 50, resources: 50, public_trust: 50, coordination: 50 };
  }
}

export { getCurrentMetrics };
