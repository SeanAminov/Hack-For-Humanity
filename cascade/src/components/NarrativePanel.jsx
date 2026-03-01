import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function parseCallbacks(text) {
  const parts = [];
  const regex = /\[CALLBACK:phase_(\d+)\]/g;
  let match;
  let lastIndex = 0;
  const allMatches = [];
  while ((match = regex.exec(text)) !== null) {
    allMatches.push({ index: match.index, length: match[0].length, round: match[1] });
  }
  if (allMatches.length === 0) return [{ type: 'text', content: text }];
  for (const m of allMatches) {
    if (m.index > lastIndex) parts.push({ type: 'text', content: text.slice(lastIndex, m.index) });
    parts.push({ type: 'callback', round: m.round });
    lastIndex = m.index + m.length;
  }
  if (lastIndex < text.length) parts.push({ type: 'text', content: text.slice(lastIndex) });
  return parts;
}

export default function NarrativePanel({ narration, dilemma, callbacks, round }) {
  const [displayedChars, setDisplayedChars] = useState(0);
  const fullText = narration || '';
  const speed = 10;

  useEffect(() => { setDisplayedChars(0); }, [narration]);

  useEffect(() => {
    if (displayedChars >= fullText.length) return;
    const timer = setTimeout(() => setDisplayedChars((p) => Math.min(p + speed, fullText.length)), 14);
    return () => clearTimeout(timer);
  }, [displayedChars, fullText]);

  const visibleText = fullText.slice(0, displayedChars);
  const isComplete = displayedChars >= fullText.length;
  const parts = parseCallbacks(visibleText);

  return (
    <div className="space-y-4">
      {/* Phase indicator */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] uppercase tracking-widest text-white/40 whitespace-nowrap">Phase {round}</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Narration */}
      <div
        className="text-[14px] leading-[1.75] text-white/70 cursor-pointer"
        onClick={() => setDisplayedChars(fullText.length)}
      >
        {parts.map((part, i) =>
          part.type === 'callback' ? (
            <span key={i} className="inline-flex items-center gap-1 text-amber-400 font-medium">
              <span className="text-[10px]">⟲ Phase {part.round}</span>
            </span>
          ) : (
            <span key={i}>{part.content}</span>
          )
        )}
        {!isComplete && <span className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 animate-pulse" />}
      </div>

      {/* Callbacks */}
      {isComplete && callbacks && callbacks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
          {callbacks.map((cb, i) => (
            <div key={i} className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/15 rounded-lg px-3 py-2">
              <span className="text-amber-400 text-xs mt-0.5">⟲</span>
              <p className="text-xs text-amber-400/80">
                <span className="font-medium text-amber-300">Cascade Effect</span> — {cb.description}
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
          className="rounded-xl px-4 py-3 bg-red-500/10 border border-red-500/15"
        >
          <p className="text-[10px] uppercase tracking-wider text-red-400 mb-1 font-medium">Critical Decision</p>
          <p className="text-[14px] text-white/90 leading-relaxed">{dilemma}</p>
        </motion.div>
      )}
    </div>
  );
}
