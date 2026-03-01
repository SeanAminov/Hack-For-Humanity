import { useState, useCallback } from 'react';
import { generateRound, generateSummary, getStartingMetrics, getCurrentMetrics } from '../services/ai';
import { saveGame } from '../utils/history';

const TOTAL_ROUNDS = 5;

const PHASES = {
  PROFILE: 'profile',
  DECISION: 'decision',
  LOADING: 'loading',
  PLAYING: 'playing',
  CONSEQUENCE: 'consequence',
  SUMMARY_LOADING: 'summary_loading',
  SUMMARY: 'summary',
};

export default function useGameState() {
  const [phase, setPhase] = useState(PHASES.PROFILE);
  const [profile, setProfile] = useState(null);
  const [decision, setDecision] = useState('');
  const [currentRound, setCurrentRound] = useState(1);
  const [history, setHistory] = useState([]);
  const [currentRoundData, setCurrentRoundData] = useState(null);
  const [chosenOption, setChosenOption] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState(null);

  const metrics = profile ? getCurrentMetrics(history, profile) : null;

  const submitProfile = useCallback((profileData) => {
    setProfile(profileData);
    setPhase(PHASES.DECISION);
  }, []);

  const submitDecision = useCallback(async (dec) => {
    setDecision(dec);
    setPhase(PHASES.LOADING);
    setError(null);
    try {
      const roundData = await generateRound(profile, dec, [], 1);
      setCurrentRoundData(roundData);
      setCurrentRound(1);
      setPhase(PHASES.PLAYING);
    } catch (err) {
      setError(err.message);
      setPhase(PHASES.DECISION);
    }
  }, [profile]);

  const makeChoice = useCallback(async (optionId) => {
    const chosen = currentRoundData.options.find((o) => o.id === optionId);
    setChosenOption(chosen);
    setPhase(PHASES.CONSEQUENCE);
  }, [currentRoundData]);

  const advanceRound = useCallback(async () => {
    const newHistory = [
      ...history,
      {
        round: currentRound,
        narration: currentRoundData.narration,
        dilemma: currentRoundData.dilemma,
        callbacks: currentRoundData.callbacks || [],
        options: currentRoundData.options,
        chosenId: chosenOption.id,
      },
    ];
    setHistory(newHistory);
    setChosenOption(null);

    const nextRound = currentRound + 1;

    if (nextRound > TOTAL_ROUNDS) {
      // Game over -- generate summary
      setPhase(PHASES.SUMMARY_LOADING);
      try {
        const summary = await generateSummary(profile, decision, newHistory);
        setSummaryData(summary);

        // Save completed game to localStorage
        const finalMetrics = getCurrentMetrics(newHistory, profile);
        saveGame({
          profile,
          decision,
          history: newHistory,
          summaryData: summary,
          metrics: finalMetrics,
        });

        setPhase(PHASES.SUMMARY);
      } catch (err) {
        setError(err.message);
        setPhase(PHASES.SUMMARY);
      }
    } else {
      // Next round
      setPhase(PHASES.LOADING);
      setError(null);
      try {
        const roundData = await generateRound(profile, decision, newHistory, nextRound);
        setCurrentRoundData(roundData);
        setCurrentRound(nextRound);
        setPhase(PHASES.PLAYING);
      } catch (err) {
        setError(err.message);
        setPhase(PHASES.PLAYING);
      }
    }
  }, [history, currentRound, currentRoundData, chosenOption, profile, decision]);

  const restart = useCallback(() => {
    setPhase(PHASES.PROFILE);
    setProfile(null);
    setDecision('');
    setCurrentRound(1);
    setHistory([]);
    setCurrentRoundData(null);
    setChosenOption(null);
    setSummaryData(null);
    setError(null);
  }, []);

  return {
    phase,
    profile,
    decision,
    currentRound,
    totalRounds: TOTAL_ROUNDS,
    history,
    currentRoundData,
    chosenOption,
    metrics,
    summaryData,
    error,
    submitProfile,
    submitDecision,
    makeChoice,
    advanceRound,
    restart,
    PHASES,
  };
}
