import { useState } from 'react';
import { motion } from 'framer-motion';

const EMERGENCY_TYPES = [
  { value: 'fire', label: 'Fire', icon: '🔥' },
  { value: 'earthquake', label: 'Earthquake', icon: '🌍' },
  { value: 'flood', label: 'Flood', icon: '🌊' },
  { value: 'chemical', label: 'Chemical Spill', icon: '☣️' },
  { value: 'accident', label: 'Major Accident', icon: '🚗' },
  { value: 'power_outage', label: 'Power Outage', icon: '⚡' },
  { value: 'active_threat', label: 'Active Threat', icon: '🚨' },
  { value: 'medical', label: 'Medical Emergency', icon: '🏥' },
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', desc: 'Minor, contained', color: 'border-emerald-500/40 text-emerald-400' },
  { value: 'moderate', label: 'Moderate', desc: 'Spreading, needs attention', color: 'border-amber-500/40 text-amber-400' },
  { value: 'severe', label: 'Severe', desc: 'Major, widespread impact', color: 'border-orange-500/40 text-orange-400' },
  { value: 'critical', label: 'Critical', desc: 'Life-threatening, immediate action', color: 'border-red-500/40 text-red-400' },
];

export default function EmergencyInput({ onSubmit, error, onBack }) {
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('');

  const canSubmit = type && location.trim() && description.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ type, location, description, severity: severity || 'unknown' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={onBack} className="text-ink-3 hover:text-ink transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div>
            <h2 className="text-lg font-semibold text-ink">What's happening?</h2>
            <p className="text-xs text-ink-3">Describe the emergency. Be as specific as possible.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Emergency Type */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-ink-3 mb-3 block">Emergency Type</label>
            <div className="grid grid-cols-4 gap-2">
              {EMERGENCY_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                    type === t.value
                      ? 'bg-panel-2 border-red-500/40 ring-1 ring-red-500/20'
                      : 'bg-panel border-rule hover:border-rule-2'
                  }`}
                >
                  <span className="text-xl">{t.icon}</span>
                  <span className={`text-[10px] font-medium ${type === t.value ? 'text-ink' : 'text-ink-2'}`}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-ink-3 mb-2 block">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Near SJSU campus, 4th Street and San Fernando"
              className="w-full bg-panel border border-rule rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:border-rule-2 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-ink-3 mb-2 block">What's happening?</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you see — smoke, damage, injuries, blocked roads, anything relevant..."
              rows={4}
              className="w-full bg-panel border border-rule rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:border-rule-2 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Severity */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-ink-3 mb-3 block">Severity (optional)</label>
            <div className="grid grid-cols-4 gap-2">
              {SEVERITY_LEVELS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSeverity(s.value)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer text-center ${
                    severity === s.value ? `bg-panel-2 ${s.color}` : 'bg-panel border-rule text-ink-2 hover:border-rule-2'
                  }`}
                >
                  <p className="text-xs font-semibold">{s.label}</p>
                  <p className="text-[9px] text-ink-3 mt-0.5">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <motion.button
            onClick={handleSubmit}
            disabled={!canSubmit}
            whileHover={canSubmit ? { scale: 1.01 } : {}}
            whileTap={canSubmit ? { scale: 0.99 } : {}}
            className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              canSubmit ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-panel-2 text-ink-3 cursor-not-allowed'
            }`}
          >
            Analyze Emergency
          </motion.button>

          <p className="text-[10px] text-ink-3 text-center leading-relaxed">
            AI analysis uses publicly available emergency data and protocols.
            Always call 911 for real emergencies.
          </p>
        </div>
      </div>
    </div>
  );
}
