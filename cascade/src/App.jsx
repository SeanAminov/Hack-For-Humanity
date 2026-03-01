import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useGameState from './hooks/useGameState';
import ProfileSetup from './components/ProfileSetup';
import DecisionInput from './components/DecisionInput';
import GameBoard from './components/GameBoard';
import Summary from './components/Summary';
import LoadingScreen from './components/LoadingScreen';
import HistoryDrawer from './components/HistoryDrawer';

const pageTransition = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -16, scale: 0.98 },
  transition: { type: 'spring', stiffness: 260, damping: 26 },
};

export default function App() {
  const game = useGameState();
  const { phase, PHASES } = game;
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30 animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
            animationDelay: '0s',
            animationDuration: '6s',
          }}
        />
        <div
          className="absolute top-1/3 -right-24 w-80 h-80 rounded-full opacity-25 animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
            animationDelay: '2s',
            animationDuration: '7s',
          }}
        />
        <div
          className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-20 animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)',
            animationDelay: '4s',
            animationDuration: '8s',
          }}
        />
      </div>

      {/* Past Games button (fixed top-right, glass style) */}
      <button
        onClick={() => setShowHistory(true)}
        className="fixed top-4 right-4 z-40 glass rounded-full px-4 py-2 flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-indigo-600 hover:shadow-lg transition-all cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Past Games
      </button>

      {/* History Drawer overlay */}
      <AnimatePresence>
        {showHistory && (
          <HistoryDrawer onClose={() => setShowHistory(false)} />
        )}
      </AnimatePresence>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {phase === PHASES.PROFILE && (
          <motion.div key="profile" {...pageTransition}>
            <ProfileSetup
              onSubmit={game.submitProfile}
              onShowHistory={() => setShowHistory(true)}
            />
          </motion.div>
        )}

        {phase === PHASES.DECISION && (
          <motion.div key="decision" {...pageTransition}>
            <DecisionInput
              profile={game.profile}
              onSubmit={game.submitDecision}
              error={game.error}
            />
          </motion.div>
        )}

        {phase === PHASES.LOADING && (
          <motion.div key="loading" {...pageTransition}>
            <LoadingScreen round={game.currentRound} />
          </motion.div>
        )}

        {(phase === PHASES.PLAYING || phase === PHASES.CONSEQUENCE) && (
          <motion.div key="game" {...pageTransition}>
            <GameBoard
              currentRound={game.currentRound}
              totalRounds={game.totalRounds}
              roundData={game.currentRoundData}
              metrics={game.metrics}
              history={game.history}
              onChoice={game.makeChoice}
              chosenOption={game.chosenOption}
              onAdvance={game.advanceRound}
              phase={phase}
              error={game.error}
              decision={game.decision}
            />
          </motion.div>
        )}

        {phase === PHASES.SUMMARY_LOADING && (
          <motion.div key="summary-loading" {...pageTransition}>
            <LoadingScreen round="final" />
          </motion.div>
        )}

        {phase === PHASES.SUMMARY && (
          <motion.div key="summary" {...pageTransition}>
            <Summary
              summaryData={game.summaryData}
              history={game.history}
              metrics={game.metrics}
              profile={game.profile}
              decision={game.decision}
              onRestart={game.restart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
