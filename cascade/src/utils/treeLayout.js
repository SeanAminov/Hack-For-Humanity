/**
 * Converts game history into React Flow nodes and edges.
 */

export function buildTreeData(history, currentRound, decision) {
  const nodes = [];
  const edges = [];

  nodes.push({
    id: 'root',
    type: 'cascadeNode',
    position: { x: 0, y: 0 },
    data: {
      label: decision?.slice(0, 40) + (decision?.length > 40 ? '...' : ''),
      round: 0,
      type: 'root',
      chosen: true,
    },
  });

  let yOffset = 110;
  const X_SPACING = 220;

  for (let i = 0; i < history.length; i++) {
    const round = history[i];
    const parentId = i === 0 ? 'root' : `chosen-${i - 1}`;
    const numOptions = round.options.length;
    const startX = -((numOptions - 1) * X_SPACING) / 2;

    for (let j = 0; j < round.options.length; j++) {
      const option = round.options[j];
      const isChosen = option.id === round.chosenId;
      const nodeId = isChosen ? `chosen-${i}` : `unchosen-${i}-${j}`;

      nodes.push({
        id: nodeId,
        type: 'cascadeNode',
        position: { x: startX + j * X_SPACING, y: yOffset },
        data: {
          label: option.title,
          round: i + 1,
          type: isChosen ? 'chosen' : 'unchosen',
          chosen: isChosen,
          philosophy: option.philosophy,
          risk: option.risk,
          hasCallback: (round.callbacks || []).some((cb) => cb.from_round === i + 1),
          description: isChosen ? option.immediate_consequence : option.description,
        },
      });

      edges.push({
        id: `edge-${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: 'smoothstep',
        style: {
          stroke: isChosen ? 'var(--color-accent)' : 'var(--color-rule-2)',
          strokeWidth: isChosen ? 2 : 1,
          strokeDasharray: isChosen ? undefined : '5 5',
        },
        animated: isChosen,
      });
    }
    yOffset += 130;
  }

  return { nodes, edges };
}
