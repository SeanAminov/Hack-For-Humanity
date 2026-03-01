import { useState } from 'react';
import { motion } from 'framer-motion';
import { getHistory, clearHistory } from '../utils/history';

const PHILOSOPHY_COLORS = {
  aggressive: 'bg-red-500/15 text-red-400',
  measured: 'bg-blue-500/15 text-blue-400',
  conservative: 'bg-emerald-500/15 text-emerald-400',
  bold: 'bg-red-500/15 text-red-400',
  strategic: 'bg-blue-500/15 text-blue-400',
  safe: 'bg-emerald-500/15 text-emerald-400',
};

const SCORE_COLORS = {
  S: 'from-emerald-400 to-teal-500',
  A: 'from-blue-400 to-cyan-500',
  B: 'from-amber-400 to-orange-500',
  C: 'from-orange-400 to-red-400',
  D: 'from-red-400 to-rose-500',
};

export default function HistoryDrawer({ onClose }) {
  const [games, setGames] = useState(() => getHistory());
  const [expandedId, setExpandedId] = useState(null);

  const handleClear = () => { clearHistory(); setGames([]); };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch { return 'Unknown date'; }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-md h-full bg-panel border-l border-rule shadow-2xl overflow-y-auto"
      >
        <div className="sticky top-0 z-10 bg-panel border-b border-rule px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Past Simulations</h2>
              <p className="text-xs text-ink-2">{games.length} simulation{games.length !== 1 ? 's' : ''} saved</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-panel-2 transition-colors cursor-pointer">
              <svg className="w-5 h-5 text-ink-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-3">
          {games.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🚨</p>
              <p className="text-sm text-ink-2">No simulations yet.</p>
              <p className="text-xs text-ink-3 mt-1">Complete a simulation to see it here!</p>
            </div>
          )}

          {games.map((game, idx) => {
            const isExpanded = expandedId === game.id;
            const grad = SCORE_COLORS[game.score] || SCORE_COLORS.B;
            return (
              <motion.div key={game.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-panel-2 border border-rule rounded-xl overflow-hidden">
                <button onClick={() => setExpandedId(isExpanded ? null : game.id)} className="w-full text-left p-4 cursor-pointer hover:bg-panel-3 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shrink-0`}>
                      <span className="text-white font-bold text-sm">{game.score}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{game.scenario?.slice(0, 60) || 'Untitled'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-ink-2">{game.profileName}</p>
                        <span className="text-ink-3">|</span>
                        <p className="text-xs text-ink-3">{formatDate(game.date)}</p>
                      </div>
                      {game.tagline && <p className="text-xs text-blue-400 italic mt-1 truncate">"{game.tagline}"</p>}
                    </div>
                  </div>
                </button>

                {isExpanded && game.choices && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-4 pb-4 border-t border-rule">
                    <p className="text-[10px] uppercase tracking-wider text-ink-3 mt-3 mb-2">Decisions</p>
                    <div className="space-y-2">
                      {game.choices.map((choice, ci) => (
                        <div key={ci} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold">{choice.round}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-ink-2">{choice.dilemma}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p className="text-xs font-medium text-ink">{choice.chosenTitle}</p>
                              {choice.philosophy && (
                                <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-medium ${PHILOSOPHY_COLORS[choice.philosophy] || 'bg-panel-3 text-ink-2'}`}>
                                  {choice.philosophy}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {games.length > 0 && (
          <div className="sticky bottom-0 bg-panel border-t border-rule px-6 py-4">
            <button onClick={handleClear} className="w-full py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors cursor-pointer">
              Clear All History
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
