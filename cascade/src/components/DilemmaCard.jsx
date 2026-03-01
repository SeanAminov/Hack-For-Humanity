import { motion } from 'framer-motion';

const RISK_COLORS = {
  low: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  high: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
};

const PHILOSOPHY_ICONS = {
  bold: '\u26A1',
  strategic: '\u265F',
  safe: '\uD83D\uDEE1',
};

const PHILOSOPHY_GRADIENTS = {
  bold: 'from-red-400 to-orange-400',
  strategic: 'from-blue-400 to-indigo-400',
  safe: 'from-green-400 to-emerald-400',
};

const METRIC_COLORS = {
  financial: 'bg-emerald-100 text-emerald-700',
  wellbeing: 'bg-amber-100 text-amber-700',
  career: 'bg-blue-100 text-blue-700',
  relationships: 'bg-pink-100 text-pink-700',
  purpose: 'bg-purple-100 text-purple-700',
};

const METRIC_ICONS = {
  financial: '$',
  wellbeing: '\u2665',
  career: '\u2191',
  relationships: '\u263A',
  purpose: '\u2605',
};

export default function DilemmaCard({ option, index, onChoice, disabled }) {
  const risk = RISK_COLORS[option.risk] || RISK_COLORS.medium;
  const gradient = PHILOSOPHY_GRADIENTS[option.philosophy] || 'from-gray-400 to-gray-500';

  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
      whileHover={!disabled ? { scale: 1.015, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      onClick={() => !disabled && onChoice(option.id)}
      disabled={disabled}
      className={`w-full text-left glass-strong rounded-xl p-4 transition-all cursor-pointer group relative overflow-hidden ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
      }`}
    >
      {/* Gradient accent bar on hover */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{PHILOSOPHY_ICONS[option.philosophy] || '?'}</span>
          <h3 className="text-sm font-semibold text-gray-800">{option.title}</h3>
        </div>
        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${risk.bg} ${risk.text} ${risk.border} border`}>
          {option.risk}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed mb-3">
        {option.description}
      </p>

      {/* Gut feeling */}
      {option.gut_feeling && (
        <div className="flex items-start gap-1.5 mb-3">
          <span className="text-xs text-gray-400 shrink-0">&#x1F4AC;</span>
          <p className="text-xs text-gray-400 italic leading-relaxed">
            "{option.gut_feeling}"
          </p>
        </div>
      )}

      {/* Affected metrics */}
      {option.affected_metrics && (
        <div className="flex flex-wrap gap-1.5">
          {option.affected_metrics.map((metric) => (
            <span
              key={metric}
              className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${METRIC_COLORS[metric] || 'bg-gray-100 text-gray-600'}`}
            >
              {METRIC_ICONS[metric] || ''} {metric}
            </span>
          ))}
        </div>
      )}
    </motion.button>
  );
}
