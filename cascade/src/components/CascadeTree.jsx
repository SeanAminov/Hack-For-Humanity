import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import { buildTreeData } from '../utils/treeLayout';

const nodeTypes = { cascadeNode: CustomNode };

function TreeInner({ history, currentRound, decision }) {
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => buildTreeData(history, currentRound, decision),
    [history, currentRound, decision]
  );

  return (
    <ReactFlow
      nodes={layoutNodes}
      edges={layoutEdges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnScroll
      zoomOnScroll
      minZoom={0.3}
      maxZoom={1.5}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="rgba(59,130,246,0.06)" gap={20} size={1} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

export default function CascadeTree(props) {
  return (
    <ReactFlowProvider>
      <div className="w-full h-full min-h-[250px]">
        <TreeInner {...props} />
      </div>
    </ReactFlowProvider>
  );
}
