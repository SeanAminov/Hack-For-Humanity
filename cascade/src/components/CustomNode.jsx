import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const PHILOSOPHY_ICONS = {
  aggressive: '⚡',
  measured: '⚖️',
  conservative: '🛡️',
  bold: '⚡',
  strategic: '⚖️',
  safe: '🛡️',
};

function CustomNode({ data }) {
  const isRoot = data.type === 'root';
  const isChosen = data.type === 'chosen';

  return (
    <div
      className={`rounded-lg border px-3 py-2 min-w-[120px] max-w-[160px] transition-all ${
        isRoot
          ? 'bg-panel-2 border-blue-500/40 text-ink shadow-glow'
          : isChosen
            ? 'bg-panel border-blue-500/30 text-ink shadow-sm'
            : 'bg-panel-3 border-rule text-ink-3'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-ink-3 !border-none !w-1.5 !h-1.5" />

      {data.hasCallback && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-[8px] text-white">⟲</span>
        </div>
      )}

      {!isRoot && (
        <p className={`text-[9px] uppercase tracking-wider mb-0.5 ${isChosen ? 'text-blue-400' : 'text-ink-3'}`}>
          {data.philosophy && PHILOSOPHY_ICONS[data.philosophy]} P{data.round}
        </p>
      )}

      <p className={`text-[11px] font-medium leading-tight ${isRoot ? 'text-ink' : isChosen ? 'text-ink-2' : 'line-through opacity-60 text-ink-3'}`}>
        {data.label}
      </p>

      <Handle type="source" position={Position.Bottom} className="!bg-ink-3 !border-none !w-1.5 !h-1.5" />
    </div>
  );
}

export default memo(CustomNode);
