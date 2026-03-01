import { motion } from 'framer-motion';

const METRIC_CONFIG = {
  financial: { label: 'Financial', icon: '\uD83D\uDCB0', gradient: 'from-emerald-400 to-teal-500' },
  wellbeing: { label: 'Wellbeing', icon: '\uD83D\uDC9A', gradient: 'from-amber-400 to-orange-400' },
  career: { label: 'Career', icon: '\uD83D\uDE80', gradient: 'from-blue-400 to-indigo-500' },
  relationships: { label: 'Relationships', icon: '\u2764\uFE0F', gradient: 'from-pink-400 to-rose-500' },
  purpose: { label: 'Purpose', icon: '\u2B50', gradient: 'from-violet-400 to-purple-500' },
};

function getStatusLabel(value) {
  if (value >= 80) return 'Thriving';
  if (value >= 60) return 'Strong';
  if (value >= 40) return 'Stable';
  if (value >= 20) return 'Struggling';
  return 'Crisis';
}

function getStatusColor(value) {
  if (value >= 80) return 'text-emerald-600';
  if (value >= 60) return 'text-blue-600';
  if (value >= 40) return 'text-gray-500';
  if (value >= 20) return 'text-amber-600';
  return 'text-red-600';
}

export default function MetricsDashboard({ metrics, previousMetrics }) {
  if (!metrics) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Life Dashboard</h3>

      {Object.entries(METRIC_CONFIG).map(([key, config]) => {
        const value = metrics[key] || 0;
        const prev = previousMetrics?.[key];
        const delta = prev != null ? value - prev : null;

        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{config.icon}</span>
                <span className="text-xs text-gray-600">{config.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-800">{value}</span>
                {delta != null && delta !== 0 && (
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      delta > 0
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {delta > 0 ? '+' : ''}{delta}
                  </span>
                )}
              </div>
            </div>

            {/* Progress bar with gradient */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>

            <p className={`text-[10px] ${getStatusColor(value)}`}>{getStatusLabel(value)}</p>
          </div>
        );
      })}
    </div>
  );
}
