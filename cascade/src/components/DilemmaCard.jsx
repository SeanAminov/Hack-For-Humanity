import { motion } from 'framer-motion';

const PHILOSOPHY_ICONS = {
  aggressive: '⚡',
  measured: '⚖️',
  conservative: '🛡️',
  bold: '⚡',
  strategic: '⚖️',
  safe: '🛡️',
};

const RISK_COLORS = {
  high: 'border-red-500/30',
  medium: 'border-amber-500/30',
  low: 'border-emerald-500/30',
};

export default function DilemmaCard({ option, index, onChoice, disabled }) {
  const riskBorder = RISK_COLORS[option.risk] || RISK_COLORS.medium;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.12, duration: 0.4 }}
      whileHover={!disabled ? { scale: 1.01, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={() => !disabled && onChoice(option.id)}
      disabled={disabled}
      className={`w-full text-left bg-black/60 backdrop-blur-md rounded-xl p-4 border transition-all cursor-pointer group ${riskBorder} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/70 hover:border-white/20'
      }`}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <span className="text-base">{PHILOSOPHY_ICONS[option.philosophy] || '?'}</span>
        <h3 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
          {option.title}
        </h3>
        <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-medium ml-auto ${
          option.risk === 'high' ? 'bg-red-500/20 text-red-400' :
          option.risk === 'medium' ? 'bg-amber-500/20 text-amber-400' :
          'bg-emerald-500/20 text-emerald-400'
        }`}>
          {option.risk} risk
        </span>
      </div>
      <p className="text-[13px] text-white/60 leading-relaxed mb-2 pl-7">{option.description}</p>
      {option.gut_feeling && (
        <p className="text-xs text-white/40 italic pl-7">"{option.gut_feeling}"</p>
      )}
    </motion.button>
  );
}
