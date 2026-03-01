import { motion } from 'framer-motion';

const PHASE_MESSAGES = {
  1: 'Dispatching first responders...',
  2: 'Situation escalating...',
  3: 'Cascade effects emerging...',
  4: 'Critical decisions ahead...',
  5: 'Final phase unfolding...',
  final: 'Compiling after-action report...',
};

const SUB_MESSAGES = {
  1: 'Analyzing initial reports',
  2: 'Tracking resource deployment',
  3: 'Previous decisions are cascading',
  4: 'Pressure is mounting',
  5: 'The aftermath approaches',
  final: 'Evaluating your response',
};

export default function LoadingScreen({ round }) {
  const message = PHASE_MESSAGES[round] || 'Processing...';
  const subMessage = SUB_MESSAGES[round] || '';

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center gap-2.5 mb-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-blue-500"
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
          ))}
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ink text-sm font-medium">
          {message}
        </motion.p>
        {subMessage && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-ink-3 text-xs mt-2">
            {subMessage}
          </motion.p>
        )}
        {round !== 'final' && (
          <p className="text-ink-3 text-[11px] mt-6">Phase {round} of 5</p>
        )}
      </div>
    </div>
  );
}
