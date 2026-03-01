import { motion } from 'framer-motion';

const METRIC_CONFIG = {
  lives_saved: { label: 'Lives Saved', icon: '❤️', gradient: 'from-rose-400 to-red-500' },
  response_time: { label: 'Response Time', icon: '⏱️', gradient: 'from-blue-400 to-cyan-500' },
  resources: { label: 'Resources', icon: '📦', gradient: 'from-amber-400 to-orange-400' },
  public_trust: { label: 'Public Trust', icon: '🤝', gradient: 'from-emerald-400 to-teal-500' },
  coordination: { label: 'Coordination', icon: '📡', gradient: 'from-indigo-400 to-blue-500' },
};

function getStatusLabel(value) {
  if (value >= 80) return 'Excellent';
  if (value >= 60) return 'Good';
  if (value >= 40) return 'Adequate';
  if (value >= 20) return 'Poor';
  return 'Critical';
}

function getStatusColor(value) {
  if (value >= 80) return 'text-emerald-400';
  if (value >= 60) return 'text-blue-400';
  if (value >= 40) return 'text-white/50';
  if (value >= 20) return 'text-amber-400';
  return 'text-red-400';
}

export default function MetricsDashboard({ metrics, previousMetrics }) {
  if (!metrics) return null;

  return (
    <div className="space-y-2.5">
      <h3 className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Response Metrics</h3>
      {Object.entries(METRIC_CONFIG).map(([key, config]) => {
        const value = metrics[key] || 0;
        const prev = previousMetrics?.[key];
        const delta = prev != null ? value - prev : null;

        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{config.icon}</span>
                <span className="text-xs text-white/60">{config.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white/90">{value}</span>
                {delta != null && delta !== 0 && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    delta > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                  }`}>
                    {delta > 0 ? '+' : ''}{delta}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
