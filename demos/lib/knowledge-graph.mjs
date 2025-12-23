/**
 * Mock Knowledge Graph Data
 * Rich interconnected concepts for demonstrating sphere of influence
 */

const knowledgeGraph = {
  nodes: [
    // Core concepts
    { id: 'systems-thinking', label: 'Systems Thinking', type: 'concept' },
    { id: 'emergence', label: 'Emergence', type: 'concept' },
    { id: 'feedback-loops', label: 'Feedback Loops', type: 'concept' },
    { id: 'complexity', label: 'Complexity', type: 'concept' },

    // Connected ideas
    { id: 'cybernetics', label: 'Cybernetics', type: 'concept' },
    { id: 'ecology', label: 'Ecology', type: 'concept' },
    { id: 'network-effects', label: 'Network Effects', type: 'concept' },
    { id: 'self-organization', label: 'Self-Organization', type: 'concept' },

    // Broader contexts (domains)
    { id: 'philosophy', label: 'Philosophy', type: 'domain' },
    { id: 'biology', label: 'Biology', type: 'domain' },
    { id: 'economics', label: 'Economics', type: 'domain' },

    // Resources/artifacts
    { id: 'thinking-in-systems', label: '"Thinking in Systems"', type: 'resource' },
    { id: 'godel-escher-bach', label: '"Gödel, Escher, Bach"', type: 'resource' },
  ],

  edges: [
    // Systems Thinking contains/relates to
    { from: 'systems-thinking', to: 'emergence', weight: 0.9 },
    { from: 'systems-thinking', to: 'feedback-loops', weight: 0.95 },
    { from: 'systems-thinking', to: 'complexity', weight: 0.85 },
    { from: 'systems-thinking', to: 'cybernetics', weight: 0.7 },

    // Systems Thinking participates in
    { from: 'philosophy', to: 'systems-thinking', weight: 0.6 },
    { from: 'biology', to: 'systems-thinking', weight: 0.5 },
    { from: 'economics', to: 'systems-thinking', weight: 0.4 },

    // Cross-connections (what makes it a graph, not a tree)
    { from: 'emergence', to: 'self-organization', weight: 0.8 },
    { from: 'ecology', to: 'feedback-loops', weight: 0.7 },
    { from: 'network-effects', to: 'emergence', weight: 0.6 },
    { from: 'complexity', to: 'self-organization', weight: 0.75 },

    // Resources connect to concepts
    { from: 'thinking-in-systems', to: 'systems-thinking', weight: 1.0 },
    { from: 'thinking-in-systems', to: 'feedback-loops', weight: 0.9 },
    { from: 'godel-escher-bach', to: 'emergence', weight: 0.8 },
    { from: 'godel-escher-bach', to: 'self-organization', weight: 0.7 },
  ],

  // Demo will cycle through these as focal points
  demoSequence: ['systems-thinking', 'emergence', 'feedback-loops']
};

/**
 * Graph traversal helpers
 */

function getNode(graph, id) {
  return graph.nodes.find(n => n.id === id);
}

// Get nodes that this node points TO (children/contained ideas)
function getChildren(graph, nodeId) {
  return graph.edges
    .filter(e => e.from === nodeId)
    .map(e => ({ node: getNode(graph, e.to), weight: e.weight }))
    .filter(r => r.node);
}

// Get nodes that point TO this node (parents/containers)
function getParents(graph, nodeId) {
  return graph.edges
    .filter(e => e.to === nodeId)
    .map(e => ({ node: getNode(graph, e.from), weight: e.weight }))
    .filter(r => r.node);
}

// Get all directly connected nodes (both directions)
function getConnected(graph, nodeId) {
  const children = getChildren(graph, nodeId);
  const parents = getParents(graph, nodeId);

  // Deduplicate by node id
  const seen = new Set();
  const result = [];

  for (const item of [...children, ...parents]) {
    if (!seen.has(item.node.id)) {
      seen.add(item.node.id);
      result.push(item);
    }
  }

  return result;
}

// Get peers (nodes that share a parent with this node)
function getPeers(graph, nodeId) {
  const parents = getParents(graph, nodeId);
  const peers = new Map();

  for (const parent of parents) {
    const siblings = getChildren(graph, parent.node.id);
    for (const sibling of siblings) {
      if (sibling.node.id !== nodeId && !peers.has(sibling.node.id)) {
        peers.set(sibling.node.id, sibling);
      }
    }
  }

  return Array.from(peers.values());
}

// Assign phase offsets to each node for ambient animation desync
function assignPhaseOffsets(graph) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
  graph.nodes.forEach((node, i) => {
    node.phase = (i * goldenAngle) % (2 * Math.PI);
  });
  return graph;
}

export const graphData = assignPhaseOffsets(knowledgeGraph);
export { getNode, getChildren, getParents, getConnected, getPeers };
