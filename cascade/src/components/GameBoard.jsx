/**
 * GameBoard -- Main game screen.
 * Displays the narrative, choice cards, life metrics, decision tree,
 * and the AI safety guardrail badge.
 */

import { motion, AnimatePresence } from 'framer-motion';
import NarrativePanel from './NarrativePanel';
import DilemmaCard from './DilemmaCard';
import MetricsDashboard from './MetricsDashboard';
import CascadeTree from './CascadeTree';
import GuardrailBadge from './GuardrailBadge';

export default function GameBoard({
  currentRound,
  totalRounds,
  roundData,
  metrics,
  history,
  onChoice,
  chosenOption,
  onAdvance,
  phase,
  error,
  decision,
}) {
  const isConsequence = phase === 'consequence';

  return (
    <div className="min-h-screen">
      {/* Top navigation bar -- glass style */}
      <div className="glass border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider gradient-text">CASCADE</span>

          <div className="flex items-center gap-4">
            {/* Guardrail safety badge */}
            {roundData?.guardrailReport && (
              <GuardrailBadge report={roundData.guardrailReport} />
            )}

            {/* Round progress pips */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {Array.from({ length: totalRounds }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-1.5 rounded-full transition-colors ${
                      i < currentRound
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">{currentRound}/{totalRounds}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
          {/* Main content area */}
          <div className="space-y-6">
            {/* Story narration with typewriter effect */}
            {roundData && (
              <div className="glass rounded-xl p-5">
                <NarrativePanel
                  narration={roundData.narration}
                  dilemma={roundData.dilemma}
                  callbacks={roundData.callbacks}
                  round={currentRound}
                />
              </div>
            )}

            {/* Consequence reveal after a choice is made */}
            <AnimatePresence>
              {isConsequence && chosenOption && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {/* Show which option was selected */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="text-emerald-500">&#10003;</span>
                    You chose: <span className="font-medium text-gray-800">{chosenOption.title}</span>
                  </div>

                  {/* Immediate outcome */}
                  <div className="glass-strong rounded-lg p-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">What happened</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{chosenOption.immediate_consequence}</p>
                  </div>

                  {/* Delayed hidden consequence */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5 }}
                    className="bg-amber-50 border border-amber-200 rounded-lg p-4"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-amber-600 mb-1">Hidden Consequence</p>
                    <p className="text-sm text-amber-700 leading-relaxed">{chosenOption.hidden_consequence}</p>
                  </motion.div>

                  {/* Advance button -- gradient style */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                    onClick={onAdvance}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    {currentRound < totalRounds ? 'Continue to Next Chapter' : 'See Your Story'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dilemma choice cards */}
            {!isConsequence && roundData?.options && (
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">Choose your path</p>
                {roundData.options.map((option, i) => (
                  <DilemmaCard
                    key={option.id}
                    option={option}
                    index={i}
                    onChoice={onChoice}
                    disabled={false}
                  />
                ))}
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Mobile-only: decision tree below main content */}
            {history.length > 0 && (
              <div className="lg:hidden">
                <CascadeTree history={history} currentRound={currentRound} decision={decision} />
              </div>
            )}
          </div>

          {/* Right sidebar -- metrics dashboard + decision tree */}
          <div className="hidden lg:block space-y-6">
            <div className="glass rounded-xl p-4">
              <MetricsDashboard metrics={metrics} />
            </div>

            {/* Live decision tree visualization */}
            {history.length > 0 && (
              <div className="glass rounded-lg overflow-hidden" style={{ height: 300 }}>
                <CascadeTree history={history} currentRound={currentRound} decision={decision} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
