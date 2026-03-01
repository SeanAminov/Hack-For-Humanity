import { motion } from 'framer-motion';

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="inline-flex items-center gap-3 mb-4">
          <img src="/cascade-logo.svg" alt="" className="w-12 h-12" />
          <h1 className="text-4xl font-bold tracking-tight gradient-text">CASCADE</h1>
        </div>

        <p className="text-ink-2 text-sm leading-relaxed mb-2">
          AI-Powered Emergency Response Analysis
        </p>
        <p className="text-ink-3 text-xs leading-relaxed mb-10">
          Get instant, location-aware emergency guidance powered by AMD MI300X.
          Real protocols. Real resources. Real-time analysis.
        </p>

        <motion.button
          onClick={onStart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full max-w-xs mx-auto py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
        >
          Report Emergency
        </motion.button>

        <div className="mt-12 flex items-center justify-center gap-6 text-[10px] text-ink-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Responsible AI
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Public Data Only
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            AMD MI300X
          </div>
        </div>
      </motion.div>
    </div>
  );
}
