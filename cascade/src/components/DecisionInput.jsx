import { motion } from 'framer-motion';

const SCENARIOS = [
  {
    title: 'The Startup Leap',
    emoji: '\uD83D\uDE80',
    description: 'Leave your stable job to build the startup you have been dreaming about.',
    decision: 'Should I quit my job to start my own company? I have a solid idea, some savings, and a burning desire to be my own boss, but the risk of failure terrifies me.',
    gradient: 'from-orange-400 to-red-500',
    hoverGradient: 'from-orange-500 to-red-600',
  },
  {
    title: 'The Big Move',
    emoji: '\u2708\uFE0F',
    description: 'Relocate across the country for a dream opportunity in a new city.',
    decision: 'Should I move across the country for this amazing job opportunity? It pays more and aligns with my career goals, but I would leave behind my friends, family, and everything familiar.',
    gradient: 'from-blue-400 to-cyan-500',
    hoverGradient: 'from-blue-500 to-cyan-600',
  },
  {
    title: 'Career Pivot',
    emoji: '\uD83D\uDD04',
    description: 'Go back to school and reinvent yourself in a completely new field.',
    decision: 'Should I go back to school for a career change? I am unhappy in my current field and passionate about something new, but it means years of study and lost income.',
    gradient: 'from-emerald-400 to-teal-500',
    hoverGradient: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Safe vs. Bold',
    emoji: '\u2696\uFE0F',
    description: 'Choose between a safe corporate job and a risky but exciting startup offer.',
    decision: 'Should I take the safe corporate job with great benefits, or the risky startup offer that could either make me rich or leave me jobless in a year?',
    gradient: 'from-purple-400 to-pink-500',
    hoverGradient: 'from-purple-500 to-pink-600',
  },
  {
    title: 'All In on an Idea',
    emoji: '\uD83D\uDC8E',
    description: 'Invest your life savings into a business idea you truly believe in.',
    decision: 'Should I invest my entire savings into a business idea I believe in? The market research looks promising, but putting everything on the line feels reckless.',
    gradient: 'from-amber-400 to-yellow-500',
    hoverGradient: 'from-amber-500 to-yellow-600',
  },
  {
    title: 'Follow Your Heart',
    emoji: '\uD83C\uDFA8',
    description: 'Pursue your creative passion instead of the practical, well-paying path.',
    decision: 'Should I pursue my creative passion full-time instead of staying in my well-paying but soul-crushing corporate job? My art makes me happy but may never pay the bills.',
    gradient: 'from-pink-400 to-rose-500',
    hoverGradient: 'from-pink-500 to-rose-600',
  },
];

export default function DecisionInput({ profile, onSubmit, error }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
            Playing as {profile?.name}, {profile?.age}
          </p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Choose your scenario
          </h2>
          <p className="text-gray-500 text-sm">
            Pick a life decision to explore. We will simulate how it plays out.
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600"
          >
            {error}
          </motion.div>
        )}

        {/* Scenario Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SCENARIOS.map((scenario, i) => (
            <motion.button
              key={scenario.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 300, damping: 25 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSubmit(scenario.decision)}
              className="relative glass-strong rounded-xl p-5 text-left cursor-pointer group transition-shadow hover:shadow-xl overflow-hidden"
            >
              {/* Gradient accent bar on hover */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${scenario.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
              />

              <div className="flex items-start gap-3">
                <span className="text-2xl">{scenario.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1 group-hover:text-indigo-700 transition-colors">
                    {scenario.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {scenario.description}
                  </p>
                </div>

                {/* Arrow icon */}
                <svg
                  className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-all group-hover:translate-x-0.5 shrink-0 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
