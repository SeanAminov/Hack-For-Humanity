import { motion } from 'framer-motion';

const ROUND_MESSAGES = {
  1: 'Simulating the first ripple...',
  2: 'Six months are passing...',
  3: 'The butterfly effect takes hold...',
  4: 'Stakes are rising...',
  5: 'The final chapter unfolds...',
  final: 'Compiling your life story...',
};

const FUN_MESSAGES = {
  1: 'Every journey starts with a single step',
  2: 'Your choices are shaping reality',
  3: 'Consequences are cascading...',
  4: 'The plot thickens',
  5: 'Destiny awaits your final move',
  final: 'Weaving together your narrative',
};

export default function LoadingScreen({ round }) {
  const message = ROUND_MESSAGES[round] || 'Thinking...';
  const funMessage = FUN_MESSAGES[round] || '';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Gradient orbs in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
            animationDuration: '4s',
          }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-36 h-36 rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
            animationDelay: '1s',
            animationDuration: '5s',
          }}
        />
      </div>

      <div className="text-center relative">
        {/* Animated dots with pulsing glow */}
        <div className="flex justify-center gap-2 mb-6 animate-pulse-glow rounded-full px-6 py-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600 text-sm font-medium"
        >
          {message}
        </motion.p>

        {funMessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 text-xs mt-1.5 italic"
          >
            {funMessage}
          </motion.p>
        )}

        {round !== 'final' && (
          <p className="text-gray-400 text-xs mt-3">Round {round} of 5</p>
        )}
      </div>
    </div>
  );
}
