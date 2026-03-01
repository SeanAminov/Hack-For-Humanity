import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function parseCallbacks(text) {
  const parts = [];
  const regex = /\[CALLBACK:round_(\d+)\]/g;
  let match;
  let lastIndex = 0;

  const allMatches = [];
  while ((match = regex.exec(text)) !== null) {
    allMatches.push({ index: match.index, length: match[0].length, round: match[1] });
  }

  if (allMatches.length === 0) return [{ type: 'text', content: text }];

  for (const m of allMatches) {
    if (m.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, m.index) });
    }
    parts.push({ type: 'callback', round: m.round });
    lastIndex = m.index + m.length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts;
}

export default function NarrativePanel({ narration, dilemma, callbacks, round }) {
  const [displayedChars, setDisplayedChars] = useState(0);
  const fullText = narration || '';
  const speed = 8;

  useEffect(() => {
    setDisplayedChars(0);
  }, [narration]);

  useEffect(() => {
    if (displayedChars >= fullText.length) return;
    const timer = setTimeout(() => {
      setDisplayedChars((prev) => Math.min(prev + speed, fullText.length));
    }, 16);
    return () => clearTimeout(timer);
  }, [displayedChars, fullText]);

  const visibleText = fullText.slice(0, displayedChars);
  const isComplete = displayedChars >= fullText.length;
  const parts = parseCallbacks(visibleText);

  return (
    <div className="space-y-4">
      {/* Round indicator */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-widest text-gray-400">
          Round {round} of 5
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Narration */}
      <div
        className="text-sm leading-relaxed text-gray-700 cursor-pointer"
        onClick={() => setDisplayedChars(fullText.length)}
      >
        {parts.map((part, i) =>
          part.type === 'callback' ? (
            <span key={i} className="inline-flex items-center gap-1 text-violet-600 font-medium">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a4 4 0 014 4v1M3 10l4-4M3 10l4 4" />
              </svg>
              <span className="text-xs">Round {part.round}</span>
            </span>
          ) : (
            <span key={i}>{part.content}</span>
          )
        )}
        {!isComplete && (
          <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 animate-pulse" />
        )}
      </div>

      {/* Callbacks */}
      {isComplete && callbacks && callbacks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1.5"
        >
          {callbacks.map((cb, i) => (
            <div
              key={i}
              className="flex items-start gap-2 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2"
            >
              <svg className="w-3.5 h-3.5 text-violet-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a4 4 0 014 4v1M3 10l4-4M3 10l4 4" />
              </svg>
              <p className="text-xs text-violet-600">
                <span className="font-medium text-violet-700">Butterfly Effect</span> -- {cb.description}
              </p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Dilemma */}
      {isComplete && dilemma && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-lg px-4 py-3 mt-4 border-l-4 border-amber-400"
        >
          <p className="text-xs uppercase tracking-wider text-amber-600 mb-1 font-medium">The Dilemma</p>
          <p className="text-sm text-gray-800 leading-relaxed">{dilemma}</p>
        </motion.div>
      )}
    </div>
  );
}
