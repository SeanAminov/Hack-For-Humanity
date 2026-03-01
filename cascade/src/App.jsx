import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useGameState from './hooks/useGameState';
import ProfileSetup from './components/ProfileSetup';
import DecisionInput from './components/DecisionInput';
import GameBoard from './components/GameBoard';
import Summary from './components/Summary';
import LoadingScreen from './components/LoadingScreen';
import HistoryDrawer from './components/HistoryDrawer';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { type: 'spring', stiffness: 300, damping: 30 },
};

export default function App() {
  const game = useGameState();
  const { phase, PHASES } = game;
  const [showHistory, setShowHistory] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('cascade-theme') || 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('cascade-theme', next);
  };

  return (
    <div className="min-h-screen relative">
      <AnimatePresence>
        {showHistory && <HistoryDrawer onClose={() => setShowHistory(false)} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {phase === PHASES.PROFILE && (
          <motion.div key="profile" {...pageTransition}>
            <ProfileSetup onSubmit={game.submitProfile} onShowHistory={() => setShowHistory(true)} />
          </motion.div>
        )}
        {phase === PHASES.DECISION && (
          <motion.div key="decision" {...pageTransition}>
            <DecisionInput profile={game.profile} onSubmit={game.submitDecision} error={game.error} />
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
              theme={theme}
              onToggleTheme={toggleTheme}
              onShowHistory={() => setShowHistory(true)}
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
