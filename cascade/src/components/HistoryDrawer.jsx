import { useState } from 'react';
import { motion } from 'framer-motion';
import { getHistory, clearHistory } from '../utils/history';

const PHILOSOPHY_COLORS = {
  bold: 'bg-red-100 text-red-700',
  strategic: 'bg-blue-100 text-blue-700',
  safe: 'bg-emerald-100 text-emerald-700',
};

const SCORE_GRADIENTS = {
  S: 'from-emerald-400 to-teal-500',
  A: 'from-blue-400 to-indigo-500',
  B: 'from-amber-400 to-orange-500',
  C: 'from-orange-400 to-red-400',
  D: 'from-red-400 to-rose-500',
};

export default function HistoryDrawer({ onClose }) {
  const [games, setGames] = useState(() => getHistory());
  const [expandedId, setExpandedId] = useState(null);

  const handleClear = () => {
    clearHistory();
    setGames([]);
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-md h-full glass-strong shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 glass-strong px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Past Games</h2>
              <p className="text-xs text-gray-500">
                {games.length} playthrough{games.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Games list */}
        <div className="px-6 py-4 space-y-3">
          {games.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🎮</p>
              <p className="text-sm text-gray-500">No games played yet.</p>
              <p className="text-xs text-gray-400 mt-1">Complete a playthrough to see it here!</p>
            </div>
          )}

          {games.map((game, idx) => {
            const isExpanded = expandedId === game.id;
            const grad = SCORE_GRADIENTS[game.score] || SCORE_GRADIENTS.B;

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(game.id)}
                  className="w-full text-left p-4 cursor-pointer hover:bg-white/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Score badge */}
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shrink-0 shadow-sm`}
                    >
                      <span className="text-white font-bold text-sm">{game.score}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {game.scenario?.slice(0, 60) || 'Untitled scenario'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-500">{game.profileName}</p>
                        <span className="text-gray-300">|</span>
                        <p className="text-xs text-gray-400">{formatDate(game.date)}</p>
                      </div>
                      {game.tagline && (
                        <p className="text-xs text-indigo-500 italic mt-1 truncate">
                          "{game.tagline}"
                        </p>
                      )}
                    </div>

                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform shrink-0 mt-1 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded choices timeline */}
                {isExpanded && game.choices && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 border-t border-gray-200/60"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-3 mb-2">
                      Choices Made
                    </p>
                    <div className="space-y-2">
                      {game.choices.map((choice, ci) => (
                        <div key={ci} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold">{choice.round}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-600 leading-relaxed">{choice.dilemma}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p className="text-xs font-medium text-gray-800">{choice.chosenTitle}</p>
                              {choice.philosophy && (
                                <span
                                  className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-medium ${
                                    PHILOSOPHY_COLORS[choice.philosophy] || 'bg-gray-100 text-gray-600'
                                  }`}
                                >
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

        {/* Footer with Clear All */}
        {games.length > 0 && (
          <div className="sticky bottom-0 glass-strong border-t border-gray-200 px-6 py-4">
            <button
              onClick={handleClear}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
            >
              Clear All History
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
