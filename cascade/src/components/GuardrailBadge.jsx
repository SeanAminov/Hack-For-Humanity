/**
 * GuardrailBadge -- Shows real-time AI safety status for each round.
 * Displays content safety, bias check, and factual grounding scores.
 * This is a core part of the Responsible AI prize submission.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function StatusDot({ status }) {
  const color = status === 'pass' ? '#10B981' : status === 'flagged' ? '#F59E0B' : '#9CA3AF';
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

export default function GuardrailBadge({ report }) {
  const [expanded, setExpanded] = useState(false);

  if (!report) return null;

  const { safety, bias, grounding, overall, model } = report;

  return (
    <div className="relative">
      {/* Collapsed badge */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 glass rounded-full px-2.5 py-1 text-[10px] text-ink-2 hover:text-ink transition-all cursor-pointer"
      >
        <StatusDot status={overall} />
        <span>AI Safety: {overall === 'pass' ? 'Verified' : 'Flagged'}</span>
        <svg
          className={`w-2.5 h-2.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 w-72 bg-panel border border-rule-2 rounded-xl p-4 shadow-xl z-50"
          >
            <h4 className="text-xs font-semibold text-ink mb-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Responsible AI Report
            </h4>

            <div className="space-y-2.5">
              {/* Content Safety */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <StatusDot status={safety.safe ? 'pass' : 'flagged'} />
                  <span className="text-[11px] text-ink-2">Content Safety</span>
                </div>
                <span className={`text-[10px] font-medium ${safety.safe ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {safety.safe ? 'Clear' : `${safety.flags.length} flag(s)`}
                </span>
              </div>

              {/* Bias Check */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <StatusDot status={bias.biasDetected ? 'flagged' : 'pass'} />
                  <span className="text-[11px] text-ink-2">Bias Detection</span>
                </div>
                <span className={`text-[10px] font-medium ${!bias.biasDetected ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {!bias.biasDetected ? 'No bias' : `${bias.detections.length} detected`}
                </span>
              </div>

              {/* Factual Grounding */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <StatusDot status={grounding.level === 'weak' ? 'flagged' : 'pass'} />
                  <span className="text-[11px] text-ink-2">Factual Grounding</span>
                </div>
                <span className={`text-[10px] font-medium ${
                  grounding.level === 'strong' ? 'text-emerald-400' :
                  grounding.level === 'moderate' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {grounding.score}/100 ({grounding.level})
                </span>
              </div>

              {/* Metrics Validation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <StatusDot status={report.metricsWereClamped ? 'flagged' : 'pass'} />
                  <span className="text-[11px] text-ink-2">Metrics Clamped</span>
                </div>
                <span className={`text-[10px] font-medium ${!report.metricsWereClamped ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {report.metricsWereClamped ? 'Values adjusted' : 'Within bounds'}
                </span>
              </div>
            </div>

            {/* Grounding evidence */}
            {grounding.evidence.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-rule">
                <p className="text-[10px] text-ink-3 mb-1">Data points found:</p>
                <div className="flex flex-wrap gap-1">
                  {grounding.evidence.map((e, i) => (
                    <span key={i} className="text-[9px] bg-panel-2 text-ink-2 px-1.5 py-0.5 rounded">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Safety flags detail */}
            {safety.flags.length > 0 && (
              <div className="mt-2.5 pt-2.5 border-t border-rule">
                <p className="text-[10px] text-amber-400 mb-1">Safety flags:</p>
                {safety.flags.map((f, i) => (
                  <p key={i} className="text-[9px] text-ink-2">&#8226; {f.message}</p>
                ))}
              </div>
            )}

            {/* Model info */}
            <div className="mt-3 pt-2.5 border-t border-rule flex items-center justify-between">
              <span className="text-[9px] text-ink-3">Model: {model}</span>
              <span className="text-[9px] text-ink-3">{report.timestamp?.slice(11, 19)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
