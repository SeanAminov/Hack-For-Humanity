import { useState } from 'react';
import { motion } from 'framer-motion';

const GOAL_OPTIONS = [
  { label: 'Financial Freedom', emoji: '\uD83D\uDCB0' },
  { label: 'Start a Business', emoji: '\uD83D\uDE80' },
  { label: 'Find Purpose', emoji: '\uD83E\uDDED' },
  { label: 'Career Growth', emoji: '\uD83D\uDCC8' },
  { label: 'Work-Life Balance', emoji: '\u2696\uFE0F' },
  { label: 'Make an Impact', emoji: '\uD83C\uDF0D' },
  { label: 'Build Wealth', emoji: '\uD83D\uDC8E' },
  { label: 'Creative Fulfillment', emoji: '\uD83C\uDFA8' },
  { label: 'Strong Relationships', emoji: '\u2764\uFE0F' },
  { label: 'Location Independence', emoji: '\u2708\uFE0F' },
];

const RISK_LABELS = {
  1: 'Very Cautious',
  2: 'Cautious',
  3: 'Balanced',
  4: 'Bold',
  5: 'Very Bold',
};

const RISK_EMOJIS = {
  1: '\uD83D\uDC22',
  2: '\uD83D\uDC3F\uFE0F',
  3: '\u2696\uFE0F',
  4: '\u26A1',
  5: '\uD83D\uDD25',
};

export default function ProfileSetup({ onSubmit, onShowHistory }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [situation, setSituation] = useState('');
  const [goals, setGoals] = useState([]);
  const [riskTolerance, setRiskTolerance] = useState(3);

  const toggleGoal = (goal) => {
    setGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : prev.length < 3
          ? [...prev, goal]
          : prev
    );
  };

  const canSubmit = name && age && location && situation && goals.length >= 1;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      name,
      age,
      location,
      situation,
      goals,
      riskTolerance: RISK_LABELS[riskTolerance],
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <img src="/cascade-logo.svg" alt="Cascade logo" className="w-12 h-12" />
            <h1 className="text-4xl font-bold tracking-tight gradient-text">
              CASCADE
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            See the future before you decide.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-5"
        >
          {/* Name + Age row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex"
                className="w-full glass-strong rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
              />
            </div>
            <div className="w-24">
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="22"
                min="16"
                max="80"
                className="w-full glass-strong rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="San Jose, CA"
              className="w-full glass-strong rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
            />
          </div>

          {/* Situation */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Current Situation</label>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Junior developer at a tech startup, $45K salary, $30K in student loans, living with roommates..."
              rows={3}
              className="w-full glass-strong rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all resize-none"
            />
          </div>

          {/* Goals */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">
              Life Goals <span className="text-gray-400">({goals.length}/3)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((goal) => (
                <button
                  key={goal.label}
                  type="button"
                  onClick={() => toggleGoal(goal.label)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    goals.includes(goal.label)
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                      : 'glass text-gray-600 hover:shadow-md hover:text-indigo-600'
                  }`}
                >
                  {goal.emoji} {goal.label}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Tolerance */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">
              Risk Tolerance: <span className="text-gray-800 font-medium">{RISK_EMOJIS[riskTolerance]} {RISK_LABELS[riskTolerance]}</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>{RISK_EMOJIS[1]} Cautious</span>
              <span>Bold {RISK_EMOJIS[5]}</span>
            </div>
          </div>

          {/* AI Transparency Notice */}
          <div className="glass rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <div>
                <p className="text-[11px] font-medium text-gray-700 mb-0.5">Responsible AI</p>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Cascade uses AI to generate personalized scenarios. Your profile data is sent to the AI model
                  but is not stored beyond this session. All content is checked for safety, bias, and factual
                  accuracy in real-time. No real financial advice is given.
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              canSubmit
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue
          </button>

          {/* View past playthroughs link */}
          {onShowHistory && (
            <div className="text-center">
              <button
                type="button"
                onClick={onShowHistory}
                className="text-xs text-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                View past playthroughs
              </button>
            </div>
          )}
        </motion.form>
      </div>
    </div>
  );
}
