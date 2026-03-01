/**
 * GameBoard — Main game screen with Plague-Inc style map layout.
 * Full-screen map with floating panels for narrative, choices, and metrics.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MapView from './MapView';
import NarrativePanel from './NarrativePanel';
import DilemmaCard from './DilemmaCard';
import MetricsDashboard from './MetricsDashboard';
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
  theme,
  onToggleTheme,
  onShowHistory,
}) {
  const isConsequence = phase === 'consequence';
  const [showMetrics, setShowMetrics] = useState(false);

  // Build map incidents from round data + history
  const incidents = useMemo(() => {
    const items = [];
    // Current round events
    if (roundData?.map_events) {
      for (const evt of roundData.map_events) {
        if (evt.type === 'incident') {
          items.push({
            pos: [evt.lat, evt.lng],
            radius: evt.radius || 300,
            color: evt.severity === 'high' ? '#ef4444' : evt.severity === 'medium' ? '#f59e0b' : '#fb923c',
            opacity: 0.2,
            label: evt.label,
            spreading: true,
          });
        }
      }
    }
    // Consequence map updates
    if (isConsequence && chosenOption?.map_updates) {
      for (const upd of chosenOption.map_updates) {
        if (upd.type === 'incident') {
          items.push({
            pos: [upd.lat, upd.lng],
            radius: upd.radius || 250,
            color: '#ef4444',
            opacity: 0.15,
            label: upd.label,
          });
        }
      }
    }
    // Historical incidents (faded)
    for (const h of history) {
      if (h.map_events) {
        for (const evt of h.map_events) {
          if (evt.type === 'incident') {
            items.push({
              pos: [evt.lat, evt.lng],
              radius: (evt.radius || 300) * 0.6,
              color: '#6b7280',
              opacity: 0.08,
              label: `Past: ${evt.label}`,
            });
          }
        }
      }
    }
    return items;
  }, [roundData, chosenOption, isConsequence, history]);

  const resources = useMemo(() => {
    const items = [];
    if (roundData?.map_events) {
      for (const evt of roundData.map_events) {
        if (evt.type === 'resource') {
          items.push({ pos: [evt.lat, evt.lng], radius: evt.radius || 150, label: evt.label });
        }
      }
    }
    if (isConsequence && chosenOption?.map_updates) {
      for (const upd of chosenOption.map_updates) {
        if (upd.type === 'resource') {
          items.push({ pos: [upd.lat, upd.lng], radius: upd.radius || 150, label: upd.label });
        }
      }
    }
    return items;
  }, [roundData, chosenOption, isConsequence]);

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Full-screen map */}
      <div className="absolute inset-0">
        <MapView incidents={incidents} resources={resources} round={currentRound} />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold tracking-wider text-white/80">CASCADE</span>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalRounds }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i < currentRound ? 'w-5 bg-blue-500' : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
            <span className="text-[11px] text-white/40 ml-1">Phase {currentRound}/{totalRounds}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {roundData?.guardrailReport && <GuardrailBadge report={roundData.guardrailReport} />}
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className="glass rounded-lg px-3 py-1.5 text-[11px] text-white/60 hover:text-white/90 cursor-pointer transition-colors"
          >
            {showMetrics ? 'Hide Stats' : 'Stats'}
          </button>
          {onShowHistory && (
            <button
              onClick={onShowHistory}
              className="glass rounded-lg px-3 py-1.5 text-[11px] text-white/60 hover:text-white/90 cursor-pointer transition-colors"
            >
              History
            </button>
          )}
        </div>
      </div>

      {/* Metrics panel — top right, toggleable */}
      <AnimatePresence>
        {showMetrics && metrics && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-14 right-4 z-[1000] w-64 bg-black/70 backdrop-blur-md rounded-xl border border-white/10 p-4"
          >
            <MetricsDashboard metrics={metrics} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content panel — right side */}
      <div className="absolute top-14 right-4 bottom-4 z-[1000] w-[420px] flex flex-col gap-3 overflow-y-auto pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-3">
          {/* Narrative */}
          {roundData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/70 backdrop-blur-md rounded-xl border border-white/10 p-5"
            >
              <NarrativePanel
                narration={roundData.narration}
                dilemma={roundData.dilemma}
                callbacks={roundData.callbacks}
                round={currentRound}
              />
            </motion.div>
          )}

          {/* Consequence reveal */}
          <AnimatePresence>
            {isConsequence && chosenOption && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="bg-black/70 backdrop-blur-md rounded-xl border border-white/10 p-4">
                  <div className="flex items-center gap-2 text-xs text-white/60 mb-3">
                    <span className="text-emerald-400">✓</span>
                    Decision: <span className="font-medium text-white/90">{chosenOption.title}</span>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Immediate Result</p>
                  <p className="text-[13px] text-white/70 leading-relaxed">{chosenOption.immediate_consequence}</p>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ delay: 1.8, duration: 0.6 }}
                  className="bg-red-500/10 backdrop-blur-md rounded-xl border border-red-500/20 p-4"
                >
                  <p className="text-[10px] uppercase tracking-wider text-red-400 mb-1.5">Cascade Effect</p>
                  <p className="text-[13px] text-red-300 leading-relaxed">{chosenOption.hidden_consequence}</p>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.8 }}
                  onClick={onAdvance}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all cursor-pointer"
                >
                  {currentRound < totalRounds ? 'Next Phase →' : 'View After-Action Report →'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Choice cards */}
          {!isConsequence && roundData?.options && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-white/40 px-1">Choose your response</p>
              {roundData.options.map((option, i) => (
                <DilemmaCard key={option.id} option={option} index={i} onChoice={onChoice} disabled={false} />
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Bottom-left info */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
          <p className="text-[10px] text-white/40 uppercase tracking-wider">San Jose / Santa Clara</p>
          <p className="text-[11px] text-white/60">{PHASE_TIMEFRAMES[currentRound - 1] || 'Standby'}</p>
        </div>
      </div>
    </div>
  );
}

const PHASE_TIMEFRAMES = [
  'First 30 minutes',
  '2 hours in',
  '6 hours in',
  '12 hours in',
  '24 hours later',
];
