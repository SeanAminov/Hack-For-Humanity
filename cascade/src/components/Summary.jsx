import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MetricsDashboard from './MetricsDashboard';
import { getStartingMetrics } from '../services/ai';
import { saveGame } from '../utils/history';

const SCORE_COLORS = {
  S: 'from-emerald-400 to-teal-500',
  A: 'from-blue-400 to-cyan-500',
  B: 'from-amber-400 to-orange-500',
  C: 'from-orange-400 to-red-400',
  D: 'from-red-400 to-rose-500',
};

const PHILOSOPHY_BADGES = {
  aggressive: { bg: 'bg-red-500/15', text: 'text-red-400', icon: '⚡' },
  measured: { bg: 'bg-blue-500/15', text: 'text-blue-400', icon: '⚖️' },
  conservative: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', icon: '🛡️' },
  bold: { bg: 'bg-red-500/15', text: 'text-red-400', icon: '⚡' },
  strategic: { bg: 'bg-blue-500/15', text: 'text-blue-400', icon: '⚖️' },
  safe: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', icon: '🛡️' },
};

export default function Summary({ summaryData, history, metrics, profile, decision, onRestart }) {
  const startMetrics = profile ? getStartingMetrics(profile) : null;
  const score = summaryData?.score || 'B';
  const grad = SCORE_COLORS[score] || SCORE_COLORS.B;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved && summaryData && history && profile) {
      saveGame({ profile, decision, history, summaryData, metrics });
      setSaved(true);
    }
  }, [summaryData, history, profile, decision, metrics, saved]);

  return (
    <div className="min-h-screen bg-scene">
      {/* Header */}
      <div className="glass border-b border-rule px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider gradient-text">CASCADE</span>
          <span className="text-xs text-ink-3">After-Action Report</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Score card */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
          <p className="text-xs uppercase tracking-widest text-ink-3 mb-3">Response Grade</p>
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl text-4xl font-bold mb-3 bg-gradient-to-br ${grad} text-white`}>
            {score}
          </div>
          {summaryData?.score_reason && <p className="text-sm text-ink-2 max-w-md mx-auto">{summaryData.score_reason}</p>}
          {summaryData?.tagline && <p className="text-base text-ink font-medium mt-4 italic">"{summaryData.tagline}"</p>}
        </motion.div>

        {/* Narrative */}
        {summaryData?.narrative && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="text-[10px] uppercase tracking-widest text-ink-3 mb-3">After-Action Summary</h3>
            <div className="bg-panel border border-rule rounded-xl p-6">
              <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-line">{summaryData.narrative}</p>
            </div>
          </motion.div>
        )}

        {/* Pivotal moment */}
        {summaryData?.pivotal_moment && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-amber-500/10 border border-amber-500/15 rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-amber-400 mb-1 font-medium">Pivotal Decision</p>
            <p className="text-sm text-amber-300">{summaryData.pivotal_moment}</p>
          </motion.div>
        )}

        {/* Metrics comparison */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="text-[10px] uppercase tracking-widest text-ink-3 mb-3">Metrics — Before & After</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-panel border border-rule rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-ink-3 mb-3">Starting</p>
              <MetricsDashboard metrics={startMetrics} />
            </div>
            <div className="bg-panel border border-rule rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-ink-3 mb-3">Final</p>
              <MetricsDashboard metrics={metrics} previousMetrics={startMetrics} />
            </div>
          </div>
        </motion.div>

        {/* Choices timeline */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 className="text-[10px] uppercase tracking-widest text-ink-3 mb-3">Your Decisions</h3>
          <div className="space-y-2">
            {history.map((round, i) => {
              const chosen = round.options.find((o) => o.id === round.chosenId);
              const badge = PHILOSOPHY_BADGES[chosen?.philosophy] || PHILOSOPHY_BADGES.measured;
              return (
                <div key={i} className="flex items-start gap-3 bg-panel border border-rule rounded-lg p-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <span className="text-xs text-white font-medium">{i + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-ink-2 mb-0.5">{round.dilemma}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-ink font-medium">{chosen?.title}</p>
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

        {/* Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex gap-3 pt-4 pb-8">
          <button
            onClick={onRestart}
            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all cursor-pointer"
          >
            Run Another Simulation
          </button>
        </motion.div>
      </div>
    </div>
  );
}
