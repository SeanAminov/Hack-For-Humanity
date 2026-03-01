/**
 * AI Service — Emergency analysis powered by AMD MI300X + vLLM.
 * Analyzes emergency situations and returns actionable guidance.
 * Uses only publicly available data.
 */

import { runGuardrailCheck } from './guardrails';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.openai.com/v1';
const API_KEY = import.meta.env.VITE_API_KEY || '';
const MODEL = import.meta.env.VITE_MODEL_NAME || 'gpt-4.1-mini';

const SYSTEM_PROMPT = `You are CASCADE, an AI emergency analysis system. You analyze emergency situations and provide actionable, life-saving guidance based on publicly available emergency management protocols, FEMA guidelines, and local infrastructure data.

OPERATIONAL AREA — San Jose / Santa Clara, California:
- Hospitals: Valley Medical Center (37.3135, -121.9218), Regional Medical Center (37.3661, -121.9289), O'Connor Hospital (37.3080, -121.9385), Good Samaritan Hospital (37.2471, -121.9447)
- Fire Stations: Station 1 Downtown (37.3382, -121.8863), Station 7 (37.3500, -121.9100), Station 30 (37.3700, -121.9200)
- Police: SJPD HQ (37.3305, -121.8857)
- Universities: SJSU (37.3352, -121.8811), SCU (37.3496, -121.9400)
- Key infrastructure: SJC Airport (37.3639, -121.9289), VTA Light Rail, Coyote Creek, Guadalupe River
- Highways: I-280, I-880, US-101, SR-87
- Emergency: 911, Red Cross (408-577-5000), County Emergency (408-808-7800)

RULES:
1. Provide SPECIFIC, ACTIONABLE guidance. Not generic advice — reference real locations, real routes, real resources.
2. Use publicly available data: response time standards, hospital capacities, evacuation protocols, FEMA guidelines.
3. Always prioritize life safety above all else.
4. Include specific addresses and distances when referencing resources.
5. Never provide false information. If uncertain, say so clearly.
6. Be direct and concise — this is an emergency.

You MUST return ONLY valid JSON. No markdown, no code fences.`;

function buildAnalysisPrompt(emergency) {
  let updateText = '';
  if (emergency.updates && emergency.updates.length > 0) {
    updateText = '\n\nSITUATION UPDATES:\n' + emergency.updates.map((u, i) =>
      `Update ${i + 1} (${new Date(u.time).toLocaleTimeString()}): ${u.text}`
    ).join('\n');
  }

  return `EMERGENCY TYPE: ${emergency.type}
LOCATION: ${emergency.location}
DESCRIPTION: ${emergency.description}
SEVERITY: ${emergency.severity || 'Unknown'}
${updateText}

Analyze this emergency and provide comprehensive guidance. Return this JSON:
{
  "situation_assessment": "2-3 sentence analysis of the current situation and its severity. Be specific about what's happening and the immediate threat level.",
  "threat_level": "critical|severe|moderate|low",
  "immediate_actions": [
    "Specific action 1 — be very precise",
    "Specific action 2",
    "Specific action 3",
    "Specific action 4"
  ],
  "safety_warnings": [
    "Specific thing to avoid or watch out for",
    "Another warning"
  ],
  "nearby_resources": [
    {"name": "Resource name", "type": "hospital|shelter|fire_station|police|evacuation_point", "address": "Full address", "distance": "X miles", "lat": 37.0, "lng": -121.0, "note": "Any relevant detail like ER capacity or current status"},
    {"name": "Resource 2", "type": "hospital", "address": "Address", "distance": "X miles", "lat": 37.0, "lng": -121.0, "note": "Note"}
  ],
  "evacuation_routes": [
    "Specific route with street names and directions",
    "Alternative route"
  ],
  "emergency_contacts": [
    {"name": "911 Emergency", "number": "911"},
    {"name": "Relevant agency", "number": "Phone number"}
  ],
  "map_markers": [
    {"lat": 37.0, "lng": -121.0, "type": "danger", "label": "Incident area", "radius": 400},
    {"lat": 37.0, "lng": -121.0, "type": "safe", "label": "Evacuation point", "radius": 200},
    {"lat": 37.0, "lng": -121.0, "type": "resource", "label": "Hospital", "radius": 150}
  ],
  "additional_info": "Any other critical information: weather factors, expected duration, secondary risks, etc."
}`;
}

function extractJSON(text) {
  try { return JSON.parse(text); } catch {
    const fenceMatch = text.match(/\`\`\`(?:json)?\s*([\s\S]*?)\`\`\`/);
    if (fenceMatch) { try { return JSON.parse(fenceMatch[1].trim()); } catch { /* fall through */ } }
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('Could not parse AI response');
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
          temperature: 0.4,
          max_tokens: 2500,
        }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
      const data = await res.json();
      return extractJSON(data.choices[0].message.content);
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}

export async function analyzeEmergency(emergency) {
  const userPrompt = buildAnalysisPrompt(emergency);
  const rawData = await callLLM(SYSTEM_PROMPT, userPrompt);
  const guardrailReport = runGuardrailCheck(rawData);
  return { ...rawData, guardrailReport };
}
