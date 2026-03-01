<p align="center">
  <img src="public/cascade-logo.svg" alt="Cascade Logo" width="120" />
</p>

<h1 align="center">Cascade</h1>

<p align="center"><strong>See the future before you decide.</strong></p>

---

## What is Cascade?

Cascade is a **narrative life-decision strategy game** that lets you explore the long-term consequences of your choices before you make them. Enter your real-life situation, and Cascade generates a personalized scenario where every decision you make ripples forward through time -- revealing butterfly effects, hidden trade-offs, and unexpected outcomes.

It is not a simulator. It is not a quiz. It is a story that **you** drive, shaped by who you are and what you care about.

## How It Works

1. **Profile** -- Tell Cascade about yourself: age, location, situation, goals, and risk tolerance.
2. **Scenario** -- The AI generates a personalized life crossroads based on your profile.
3. **5 Rounds** -- Each round presents a pivotal moment. Pick a path (A, B, or C) and watch the consequences unfold in real time with streaming narrative.
4. **Summary** -- After 5 rounds, get a full debrief: your decision pattern, butterfly effects, personality insights, and an overall life trajectory score.

## Features

- **Personalized AI Scenarios** -- Every playthrough is unique, tailored to your profile and goals
- **Butterfly Effect Engine** -- Small choices cascade into major life changes across rounds
- **Responsible AI Guardrails** -- Real-time content safety, bias detection, and factual grounding
- **Decision Tree Visualization** -- Interactive React Flow graph showing your branching path
- **Streaming Narrative** -- Watch your story unfold token by token with live AI generation
- **Local History** -- All past playthroughs saved in your browser for replay and comparison
- **AI Transparency** -- Clear disclosure of AI involvement and data handling at every step

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Animation | Framer Motion |
| Visualization | React Flow |
| AI Inference | AMD Instinct MI300X + vLLM |
| Model | Llama 3.1 70B Instruct |

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/cascade.git
cd cascade

# Install dependencies
npm install

# Add your environment variables
cp .env.example .env
# Edit .env with your vLLM endpoint and API key

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_VLLM_API_URL` | URL of the vLLM inference endpoint |
| `VITE_VLLM_API_KEY` | API key for the vLLM server |

## Responsible AI

Cascade takes responsible AI seriously:

- **Content Safety** -- Every AI response is checked for harmful, inappropriate, or dangerous content before being shown to the user
- **Bias Detection** -- Scenarios and outcomes are monitored for demographic, cultural, and socioeconomic bias
- **Factual Grounding** -- Financial figures, career statistics, and life outcomes are grounded in realistic ranges
- **Transparency** -- Users are clearly informed that content is AI-generated and that no real financial or life advice is being given
- **Data Privacy** -- Profile data is sent to the AI model for generation but is not stored beyond the active session

## Built For

**Hack For Humanity 2026** -- Building technology that empowers people to make better decisions about their lives.
