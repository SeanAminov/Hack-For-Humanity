import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './components/LandingPage';
import EmergencyInput from './components/EmergencyInput';
import Dashboard from './components/Dashboard';
import LoadingScreen from './components/LoadingScreen';
import { analyzeEmergency } from './services/ai';

const PHASES = { LANDING: 'landing', INPUT: 'input', LOADING: 'loading', DASHBOARD: 'dashboard' };

const transition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { type: 'spring', stiffness: 300, damping: 30 },
};

export default function App() {
  const [phase, setPhase] = useState(PHASES.LANDING);
  const [emergency, setEmergency] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [updates, setUpdates] = useState([]);

  const handleStart = () => setPhase(PHASES.INPUT);

  const handleSubmit = async (data) => {
    setEmergency(data);
    setPhase(PHASES.LOADING);
    setError(null);
    try {
      const result = await analyzeEmergency(data);
      setAnalysis(result);
      setPhase(PHASES.DASHBOARD);
    } catch (err) {
      setError(err.message);
      setPhase(PHASES.INPUT);
    }
  };

  const handleUpdate = async (updateText) => {
    const newUpdates = [...updates, { text: updateText, time: new Date().toISOString() }];
    setUpdates(newUpdates);
    try {
      const result = await analyzeEmergency({ ...emergency, updates: newUpdates });
      setAnalysis(result);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = () => {
    setPhase(PHASES.LANDING);
    setEmergency(null);
    setAnalysis(null);
    setError(null);
    setUpdates([]);
  };

  return (
    <div className="min-h-screen relative">
      <AnimatePresence mode="wait">
        {phase === PHASES.LANDING && (
          <motion.div key="landing" {...transition}>
            <LandingPage onStart={handleStart} />
          </motion.div>
        )}
        {phase === PHASES.INPUT && (
          <motion.div key="input" {...transition}>
            <EmergencyInput onSubmit={handleSubmit} error={error} onBack={handleReset} />
          </motion.div>
        )}
        {phase === PHASES.LOADING && (
          <motion.div key="loading" {...transition}>
            <LoadingScreen />
          </motion.div>
        )}
        {phase === PHASES.DASHBOARD && (
          <motion.div key="dashboard" {...transition}>
            <Dashboard
              emergency={emergency}
              analysis={analysis}
              onUpdate={handleUpdate}
              onReset={handleReset}
              error={error}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
