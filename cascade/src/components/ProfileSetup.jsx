import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_OPTIONS = [
  { value: 'Incident Commander', emoji: '🎖️', desc: 'Lead the overall emergency response' },
  { value: 'Fire Chief', emoji: '🚒', desc: 'Manage fire and rescue operations' },
  { value: 'Police Captain', emoji: '🚔', desc: 'Handle law enforcement and security' },
  { value: 'EMS Coordinator', emoji: '🚑', desc: 'Coordinate medical response and triage' },
  { value: 'Emergency Manager', emoji: '📋', desc: 'Oversee planning and resource allocation' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'Junior', label: 'Junior', desc: '0-3 years experience' },
  { value: 'Intermediate', label: 'Intermediate', desc: '3-8 years experience' },
  { value: 'Senior', label: 'Senior', desc: '8-15 years experience' },
  { value: 'Veteran', label: 'Veteran', desc: '15+ years experience' },
];

const FOCUS_OPTIONS = [
  { label: 'Save Lives First', emoji: '❤️' },
  { label: 'Contain the Situation', emoji: '🛑' },
  { label: 'Protect Infrastructure', emoji: '🏗️' },
  { label: 'Public Communication', emoji: '📡' },
  { label: 'Resource Efficiency', emoji: '📊' },
  { label: 'Inter-Agency Coordination', emoji: '🤝' },
];

const TOTAL_STEPS = 3;

const slideIn = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { type: 'spring', stiffness: 300, damping: 30 },
};

export default function ProfileSetup({ onSubmit, onShowHistory }) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [agency, setAgency] = useState('');
  const [focus, setFocus] = useState('');

  const canAdvance = () => {
    if (step === 0) return role;
    if (step === 1) return experience;
    if (step === 2) return focus;
    return false;
  };

  const advance = () => {
    if (!canAdvance()) return;
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      onSubmit({
        name: role,
        role,
        experience,
        agency: agency || 'San Jose Emergency Services',
        focus,
        goals: [focus],
        age: '35',
        location: 'San Jose, CA',
        situation: `${role} with ${experience} experience`,
        riskTolerance: experience === 'Veteran' ? 'Bold' : experience === 'Senior' ? 'Balanced' : 'Cautious',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2.5 mb-2">
            <img src="/cascade-logo.svg" alt="Cascade" className="w-10 h-10" />
            <h1 className="text-3xl font-bold tracking-tight gradient-text">CASCADE</h1>
          </div>
          <p className="text-ink-3 text-xs tracking-wide">Emergency Response Training Simulator</p>
        </motion.div>

        {/* Progress */}
        <div className="flex justify-center gap-2 mb-10">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <motion.div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-blue-500' : i < step ? 'w-1.5 bg-blue-500/60' : 'w-1.5 bg-rule-2'
              }`}
              layout
            />
          ))}
        </div>

        <div className="min-h-[320px] flex flex-col">
          <AnimatePresence mode="wait">
            {/* Step 0: Role */}
            {step === 0 && (
              <motion.div key="step-0" {...slideIn} className="flex-1">
                <p className="text-lg font-semibold text-ink mb-1">Choose your role</p>
                <p className="text-sm text-ink-2 mb-6">What position are you taking in this emergency?</p>
                <div className="space-y-2.5">
                  {ROLE_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.value}
                      onClick={() => setRole(opt.value)}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left p-4 rounded-xl transition-all cursor-pointer flex items-center gap-4 border ${
                        role === opt.value
                          ? 'bg-panel-2 border-blue-500/50 ring-1 ring-blue-500/30'
                          : 'bg-panel border-rule hover:border-rule-2'
                      }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <div>
                        <p className={`text-sm font-semibold ${role === opt.value ? 'text-blue-400' : 'text-ink'}`}>{opt.value}</p>
                        <p className="text-xs text-ink-2">{opt.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1: Experience */}
            {step === 1 && (
              <motion.div key="step-1" {...slideIn} className="flex-1">
                <p className="text-lg font-semibold text-ink mb-1">Experience level</p>
                <p className="text-sm text-ink-2 mb-6">This affects your starting capabilities and metrics.</p>
                <div className="space-y-2.5">
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.value}
                      onClick={() => setExperience(opt.value)}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left p-4 rounded-xl transition-all cursor-pointer border ${
                        experience === opt.value
                          ? 'bg-panel-2 border-blue-500/50 ring-1 ring-blue-500/30'
                          : 'bg-panel border-rule hover:border-rule-2'
                      }`}
                    >
                      <p className={`text-sm font-semibold ${experience === opt.value ? 'text-blue-400' : 'text-ink'}`}>{opt.label}</p>
                      <p className="text-xs text-ink-2">{opt.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Focus */}
            {step === 2 && (
              <motion.div key="step-2" {...slideIn} className="flex-1">
                <p className="text-lg font-semibold text-ink mb-1">What's your priority?</p>
                <p className="text-sm text-ink-2 mb-6">This shapes how the AI evaluates your decisions.</p>
                <div className="flex flex-wrap gap-2.5">
                  {FOCUS_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.label}
                      onClick={() => setFocus(opt.label)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer border ${
                        focus === opt.label
                          ? 'bg-blue-600 text-white border-transparent'
                          : 'bg-panel border-rule-2 text-ink-2 hover:border-blue-500/30'
                      }`}
                    >
                      {opt.emoji} {opt.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-4">
          {step === TOTAL_STEPS - 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 text-[10px] text-ink-3 leading-relaxed">
              <svg className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span>Powered by AMD MI300X. All scenarios use publicly available emergency data. AI responses checked for safety and accuracy.</span>
            </motion.div>
          )}

          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="px-5 py-3 rounded-xl text-sm font-medium text-ink-2 hover:text-ink hover:bg-panel-2 transition-all cursor-pointer">
                Back
              </button>
            )}
            <motion.button
              onClick={advance}
              disabled={!canAdvance()}
              whileHover={canAdvance() ? { scale: 1.01 } : {}}
              whileTap={canAdvance() ? { scale: 0.99 } : {}}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                canAdvance() ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-panel-2 text-ink-3 cursor-not-allowed'
              }`}
            >
              {step < TOTAL_STEPS - 1 ? 'Continue' : 'Start Simulation'}
            </motion.button>
          </div>

          {step === 0 && onShowHistory && (
            <div className="text-center pt-2">
              <button onClick={onShowHistory} className="text-xs text-ink-3 hover:text-ink transition-colors cursor-pointer">
                View past simulations →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
