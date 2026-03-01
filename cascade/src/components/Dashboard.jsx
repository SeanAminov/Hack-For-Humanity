/**
 * Dashboard — Main emergency analysis view.
 * Full-screen map with floating panels for AI analysis, resources, and actions.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MapView from './MapView';
import GuardrailBadge from './GuardrailBadge';

const THREAT_COLORS = {
  critical: 'bg-red-600 text-white',
  severe: 'bg-orange-500 text-white',
  moderate: 'bg-amber-500 text-black',
  low: 'bg-emerald-500 text-white',
};

const TAB_OPTIONS = ['actions', 'resources', 'routes', 'contacts'];

export default function Dashboard({ emergency, analysis, onUpdate, onReset, error }) {
  const [activeTab, setActiveTab] = useState('actions');
  const [updateText, setUpdateText] = useState('');
  const [showUpdate, setShowUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);

  const incidents = useMemo(() => {
    if (!analysis?.map_markers) return [];
    return analysis.map_markers
      .filter(m => m.type === 'danger')
      .map(m => ({
        pos: [m.lat, m.lng],
        radius: m.radius || 400,
        color: '#ef4444',
        opacity: 0.2,
        label: m.label,
        spreading: true,
      }));
  }, [analysis]);

  const resources = useMemo(() => {
    if (!analysis?.map_markers) return [];
    return analysis.map_markers
      .filter(m => m.type === 'resource' || m.type === 'safe')
      .map(m => ({
        pos: [m.lat, m.lng],
        radius: m.radius || 150,
        label: m.label,
      }));
  }, [analysis]);

  const handleSendUpdate = async () => {
    if (!updateText.trim() || updating) return;
    setUpdating(true);
    await onUpdate(updateText.trim());
    setUpdateText('');
    setShowUpdate(false);
    setUpdating(false);
  };

  const threatLevel = analysis?.threat_level || 'moderate';

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Full-screen map */}
      <div className="absolute inset-0">
        <MapView incidents={incidents} resources={resources} round={0} />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onReset} className="text-white/50 hover:text-white/90 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <span className="text-xs font-bold tracking-wider text-white/70">CASCADE</span>
          <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${THREAT_COLORS[threatLevel]}`}>
            {threatLevel}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {analysis?.guardrailReport && <GuardrailBadge report={analysis.guardrailReport} />}
          <button
            onClick={() => setShowUpdate(!showUpdate)}
            className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 text-[11px] text-white/70 hover:text-white border border-white/10 cursor-pointer transition-colors"
          >
            Update Situation
          </button>
        </div>
      </div>

      {/* Situation update input */}
      <AnimatePresence>
        {showUpdate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-4 right-4 z-[1000] bg-black/80 backdrop-blur-md rounded-xl border border-white/10 p-4"
          >
            <p className="text-[11px] text-white/50 mb-2">What's changed? Add new information.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendUpdate()}
                placeholder="e.g. Fire is spreading east, road now blocked on 10th St..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 transition-colors"
                autoFocus
              />
              <button
                onClick={handleSendUpdate}
                disabled={!updateText.trim() || updating}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors disabled:opacity-50"
              >
                {updating ? '...' : 'Send'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right panel — Analysis */}
      <div className="absolute top-14 right-4 bottom-4 z-[1000] w-[400px] flex flex-col gap-3 overflow-hidden">
        {/* Assessment */}
        {analysis?.situation_assessment && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/70 backdrop-blur-md rounded-xl border border-white/10 p-4 shrink-0"
          >
            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Situation Assessment</p>
            <p className="text-[13px] text-white/80 leading-relaxed">{analysis.situation_assessment}</p>
          </motion.div>
        )}

        {/* Tab nav */}
        <div className="flex gap-1 bg-black/50 backdrop-blur-sm rounded-lg p-1 shrink-0">
          {TAB_OPTIONS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer capitalize ${
                activeTab === tab ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Actions tab */}
            {activeTab === 'actions' && (
              <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {/* Immediate Actions */}
                <div className="bg-black/70 backdrop-blur-md rounded-xl border border-white/10 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-3 font-medium">Do This Now</p>
                  <div className="space-y-2">
                    {(analysis?.immediate_actions || []).map((action, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <p className="text-[13px] text-white/70 leading-relaxed">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety Warnings */}
                {analysis?.safety_warnings?.length > 0 && (
                  <div className="bg-black/70 backdrop-blur-md rounded-xl border border-red-500/20 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-red-400 mb-3 font-medium">⚠ Warnings</p>
                    <div className="space-y-2">
                      {analysis.safety_warnings.map((warning, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="text-red-400 text-xs mt-0.5">•</span>
                          <p className="text-[13px] text-red-300/80 leading-relaxed">{warning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                {analysis?.additional_info && (
                  <div className="bg-black/70 backdrop-blur-md rounded-xl border border-white/10 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Additional Information</p>
                    <p className="text-[13px] text-white/60 leading-relaxed">{analysis.additional_info}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Resources tab */}
            {activeTab === 'resources' && (
              <motion.div key="resources" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                <div className="bg-black/70 backdrop-blur-md rounded-xl border border-white/10 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-blue-400 mb-3 font-medium">Nearby Resources</p>
                  <div className="space-y-3">
                    {(analysis?.nearby_resources || []).map((r, i) => (
                      <div key={i} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-white/80">{r.name}</p>
                          <span className="text-[10px] text-white/40">{r.distance}</span>
                        </div>
                        <p className="text-xs text-white/40">{r.address}</p>
                        {r.note && <p className="text-xs text-blue-400/60 mt-1">{r.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Routes tab */}
            {activeTab === 'routes' && (
              <motion.div key="routes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-black/70 backdrop-blur-md rounded-xl border border-white/10 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-amber-400 mb-3 font-medium">Evacuation Routes</p>
                  <div className="space-y-3">
                    {(analysis?.evacuation_routes || []).map((route, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <p className="text-[13px] text-white/70 leading-relaxed">{route}</p>
                      </div>
                    ))}
                    {(!analysis?.evacuation_routes || analysis.evacuation_routes.length === 0) && (
                      <p className="text-xs text-white/40">No specific evacuation routes provided.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Contacts tab */}
            {activeTab === 'contacts' && (
              <motion.div key="contacts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-black/70 backdrop-blur-md rounded-xl border border-white/10 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3 font-medium">Emergency Contacts</p>
                  <div className="space-y-2">
                    {(analysis?.emergency_contacts || []).map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <span className="text-sm text-white/70">{c.name}</span>
                        <a
                          href={`tel:${c.number}`}
                          className="text-sm font-mono font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {c.number}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom-left: emergency type badge */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
          <p className="text-[10px] text-white/40 uppercase tracking-wider">{emergency?.type?.replace('_', ' ')}</p>
          <p className="text-[11px] text-white/60">{emergency?.location}</p>
        </div>
      </div>

      {error && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg px-4 py-2">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
