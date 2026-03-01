import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CascadeTree from './CascadeTree';
import MetricsDashboard from './MetricsDashboard';
import { getStartingMetrics } from '../services/ai';
import { saveGame } from '../utils/history';

const SCORE_GRADIENTS = {
  S: 'from-emerald-400 to-teal-500',
  A: 'from-blue-400 to-indigo-500',
  B: 'from-amber-400 to-orange-500',
  C: 'from-orange-400 to-red-400',
  D: 'from-red-400 to-rose-500',
};

const PHILOSOPHY_BADGES = {
  bold: { bg: 'bg-red-100', text: 'text-red-700', icon: '\u26A1' },
  strategic: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '\u265F' },
  safe: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '\uD83D\uDEE1' },
};

export default function Summary({ summaryData, history, metrics, profile, decision, onRestart }) {
  const startMetrics = profile ? getStartingMetrics(profile) : null;
  const score = summaryData?.score || 'B';
  const grad = SCORE_GRADIENTS[score] || SCORE_GRADIENTS.B;
  const [saved, setSaved] = useState(false);

  // Auto-save the game on mount
  useEffect(() => {
    if (!saved && summaryData && history && profile) {
      saveGame({ profile, decision, history, summaryData, metrics });
      setSaved(true);
    }
  }, [summaryData, history, profile, decision, metrics, saved]);

  // Confetti-like particles for good scores
  const showConfetti = score === 'S' || score === 'A';

  return (
    <div className="min-h-screen">
      {/* Confetti particles for top scores */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                background: ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f59e0b', '#10b981'][i % 6],
              }}
              animate={{
                y: [0, window.innerHeight + 20],
                x: [0, (Math.random() - 0.5) * 200],
                rotate: [0, Math.random() * 720],
                opacity: [1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="glass border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider gradient-text">CASCADE</span>
          <span className="text-xs text-gray-400">Journey Complete</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Foresight Score</p>
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl text-4xl font-bold mb-3 bg-gradient-to-br ${grad} text-white shadow-lg`}
          >
            {score}
          </div>
          {summaryData?.score_reason && (
            <p className="text-sm text-gray-500 max-w-md mx-auto">{summaryData.score_reason}</p>
          )}
          {summaryData?.tagline && (
            <p className="text-base text-gray-800 font-medium mt-4 italic">"{summaryData.tagline}"</p>
          )}
        </motion.div>

        {/* Narrative summary */}
        {summaryData?.narrative && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">Your Story</h3>
            <div className="glass-strong rounded-xl p-6">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {summaryData.narrative}
              </p>
            </div>
          </motion.div>
        )}

        {/* Pivotal moment */}
        {summaryData?.pivotal_moment && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-violet-50 border border-violet-200 rounded-xl p-4"
          >
            <p className="text-[10px] uppercase tracking-wider text-violet-600 mb-1 font-medium">Pivotal Moment</p>
            <p className="text-sm text-violet-700">{summaryData.pivotal_moment}</p>
          </motion.div>
        )}

        {/* Metrics comparison */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">Life Metrics -- Before & After</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">Starting</p>
              <MetricsDashboard metrics={startMetrics} />
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">Final</p>
              <MetricsDashboard metrics={metrics} previousMetrics={startMetrics} />
            </div>
          </div>
        </motion.div>

        {/* Choices timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">Your Choices</h3>
          <div className="space-y-2">
            {history.map((round, i) => {
              const chosen = round.options.find((o) => o.id === round.chosenId);
              const badge = PHILOSOPHY_BADGES[chosen?.philosophy] || PHILOSOPHY_BADGES.strategic;
              return (
                <div key={i} className="flex items-start gap-3 glass rounded-lg p-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0">
                    <span className="text-xs text-white font-medium">{i + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 mb-0.5">{round.dilemma}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-gray-800 font-medium">{chosen?.title}</p>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${badge.bg} ${badge.text}`}>
                        {badge.icon} {chosen?.philosophy}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Decision tree */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">Decision Tree</h3>
          <div className="glass rounded-xl overflow-hidden" style={{ height: 400 }}>
            <CascadeTree history={history} currentRound={history.length} decision={decision} />
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-3 pt-4 pb-8"
        >
          <button
            onClick={onRestart}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            Play Again
          </button>
        </motion.div>
      </div>
    </div>
  );
}
