import { motion } from 'framer-motion';

const SCENARIOS = [
  {
    title: 'Earthquake at SJSU',
    emoji: '🌍',
    description: 'A 6.2 magnitude earthquake strikes during class hours near San Jose State University.',
    decision: 'A 6.2 magnitude earthquake has struck the San Jose area during peak class hours at SJSU. Multiple buildings report structural damage, there are reports of people trapped, and fires have broken out from ruptured gas lines near campus. The VTA light rail is halted and major highways are blocked by debris.',
  },
  {
    title: 'Multi-Alarm Fire Near SCU',
    emoji: '🔥',
    description: 'A fast-moving wildfire threatens neighborhoods near Santa Clara University.',
    decision: 'A brush fire near Santa Clara University has rapidly expanded due to strong winds, threatening residential neighborhoods and the university campus. Smoke is reducing visibility on US-101, and evacuation routes are becoming congested. Three fire stations are already engaged.',
  },
  {
    title: 'Chemical Spill on I-280',
    emoji: '☣️',
    description: 'A tanker truck overturns, releasing toxic chemicals near a populated area.',
    decision: 'A chemical tanker has overturned on I-280 near downtown San Jose, releasing an unknown toxic substance. A visible vapor cloud is drifting toward residential areas. Valley Medical Center is 2 miles downwind. Highway is completely blocked and morning commute traffic is at a standstill.',
  },
  {
    title: 'Active Shooter at Convention Center',
    emoji: '🚨',
    description: 'Reports of an active threat at the San Jose Convention Center during a major event.',
    decision: 'Multiple 911 calls report an active shooter situation at the San Jose Convention Center during a tech conference with 3,000+ attendees. SJPD units are responding. There are reports of casualties and a stampede near the exits. The situation is chaotic with conflicting reports.',
  },
  {
    title: 'Mass Casualty Accident',
    emoji: '🚗',
    description: 'A major multi-vehicle pileup on US-101 with dozens of casualties.',
    decision: 'A massive multi-vehicle pileup involving 20+ vehicles has occurred on US-101 near SJC Airport. Early reports indicate at least 15 critically injured, multiple vehicles on fire, and jet fuel leaking from a damaged airport fuel tanker nearby. Both directions of US-101 are completely blocked.',
  },
  {
    title: 'Flood & Power Grid Failure',
    emoji: '⚡',
    description: 'Atmospheric river causes widespread flooding and knocks out the power grid.',
    decision: 'An atmospheric river event has caused severe flooding across San Jose. Coyote Creek has breached its banks near downtown, flooding neighborhoods. The main power substation is underwater, leaving 200,000+ residents without power. Water rescue teams are overwhelmed with calls for help.',
  },
];

export default function DecisionInput({ profile, onSubmit, error }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="text-ink-3 text-xs tracking-wide mb-3">
            {profile?.role} • {profile?.experience}
          </p>
          <h2 className="text-xl font-semibold text-ink mb-2">Select Emergency Scenario</h2>
          <p className="text-ink-2 text-sm">Choose a crisis. We'll simulate 5 phases of cascading consequences.</p>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">
            {error}
          </motion.div>
        )}

        <div className="space-y-3">
          {SCENARIOS.map((scenario, i) => (
            <motion.button
              key={scenario.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSubmit(scenario.decision)}
              className="w-full bg-panel border border-rule rounded-xl p-4 text-left cursor-pointer group transition-all card-glow"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{scenario.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-ink group-hover:text-blue-400 transition-colors">{scenario.title}</h3>
                  <p className="text-xs text-ink-2 mt-0.5">{scenario.description}</p>
                </div>
                <svg className="w-4 h-4 text-ink-3 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
