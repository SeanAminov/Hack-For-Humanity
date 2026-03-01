import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const PHILOSOPHY_ICONS = {
  bold: '\u26A1',
  strategic: '\u265F',
  safe: '\uD83D\uDEE1',
};

function CustomNode({ data }) {
  const isRoot = data.type === 'root';
  const isChosen = data.type === 'chosen';
  const isUnchosen = data.type === 'unchosen';

  return (
    <div
      className={`rounded-lg border px-3 py-2 min-w-[120px] max-w-[160px] transition-all ${
        isRoot
          ? 'bg-white border-indigo-300 text-gray-800 shadow-md'
          : isChosen
            ? 'glass border-indigo-400/60 text-gray-800 shadow-sm'
            : 'bg-gray-50 border-gray-200 text-gray-400'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-300 !border-none !w-1.5 !h-1.5" />

      {/* Callback badge */}
      {data.hasCallback && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-[8px] text-white">&#8617;</span>
        </div>
      )}

      {/* Round label */}
      {!isRoot && (
        <p className={`text-[9px] uppercase tracking-wider mb-0.5 ${isChosen ? 'text-indigo-500' : 'text-gray-400'}`}>
          {data.philosophy && PHILOSOPHY_ICONS[data.philosophy]} R{data.round}
        </p>
      )}

      {/* Title */}
      <p className={`text-[11px] font-medium leading-tight ${isRoot ? 'text-gray-800' : isChosen ? 'text-gray-700' : 'line-through opacity-60 text-gray-400'}`}>
        {data.label}
      </p>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-300 !border-none !w-1.5 !h-1.5" />
    </div>
  );
}

export default memo(CustomNode);
