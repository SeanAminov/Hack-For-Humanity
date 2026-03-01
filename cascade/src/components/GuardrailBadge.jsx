/**
 * GuardrailBadge — Shows AI safety verification status.
 * Responsible AI transparency for every analysis.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Dot({ status }) {
  const color = status === 'pass' ? '#10B981' : status === 'flagged' ? '#F59E0B' : '#9CA3AF';
  return <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />;
}

export default function GuardrailBadge({ report }) {
  const [expanded, setExpanded] = useState(false);
  if (!report) return null;

  const { safety, bias, grounding, overall, model } = report;

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] text-white/60 hover:text-white/90 border border-white/10 transition-all cursor-pointer"
      >
        <Dot status={overall} />
        <span>AI {overall === 'pass' ? 'Verified' : 'Flagged'}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-72 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-xl z-50"
          >
            <h4 className="text-xs font-semibold text-white/90 mb-3">Responsible AI Report</h4>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Dot status={safety?.safe ? 'pass' : 'flagged'} />
                  <span className="text-[11px] text-white/60">Content Safety</span>
                </div>
                <span className={`text-[10px] font-medium ${safety?.safe ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {safety?.safe ? 'Clear' : `${safety?.flags?.length || 0} flag(s)`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Dot status={bias?.detected ? 'flagged' : 'pass'} />
                  <span className="text-[11px] text-white/60">Bias Check</span>
                </div>
                <span className={`text-[10px] font-medium ${!bias?.detected ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {!bias?.detected ? 'No bias' : `${bias.detections?.length} detected`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Dot status={grounding?.level === 'weak' ? 'flagged' : 'pass'} />
                  <span className="text-[11px] text-white/60">Factual Grounding</span>
                </div>
                <span className={`text-[10px] font-medium ${
                  grounding?.level === 'strong' ? 'text-emerald-400' : grounding?.level === 'moderate' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {grounding?.score}/100 ({grounding?.level})
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
              <span className="text-[9px] text-white/30">Model: {model}</span>
              <span className="text-[9px] text-white/30">{report.timestamp?.slice(11, 19)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
