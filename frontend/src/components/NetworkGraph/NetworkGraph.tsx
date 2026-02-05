import { useCallback } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Paper } from '@mui/material';
import type { NetworkGraphData } from '../../types/results';

interface NetworkGraphProps {
  data: NetworkGraphData;
  onNodeClick: (nodeId: string, nodeType: string) => void;
}

export default function NetworkGraph({ data, onNodeClick }: NetworkGraphProps) {
  // 디버깅: 데이터 확인
  console.log('NetworkGraph data:', data);

  // 노드를 타입별로 그룹화
  const subjectNodes = data.nodes.filter((n) => n.type === 'subject');
  const relationNodes = data.nodes.filter((n) => n.type === 'relation');
  const expressionNodes = data.nodes.filter((n) => n.type === 'expression');

  console.log('Grouped nodes:', { subjectNodes, relationNodes, expressionNodes });

  // 타입별 열 위치 (x좌표)
  const columnX: Record<string, number> = { subject: 150, relation: 500, expression: 850 };
  const startY = 100;
  const nodeSpacing = 150;

  // reactflow 노드 형식으로 변환 (순차적 배치)
  const initialNodes: Node[] = data.nodes.map((node) => {
    let yPosition = startY;
    let xPosition = columnX[node.type] || 400; // 기본값 400

    if (node.type === 'subject') {
      const index = subjectNodes.findIndex((n) => n.id === node.id);
      yPosition = startY + index * nodeSpacing;
    } else if (node.type === 'relation') {
      const index = relationNodes.findIndex((n) => n.id === node.id);
      yPosition = startY + index * nodeSpacing;
    } else if (node.type === 'expression') {
      const index = expressionNodes.findIndex((n) => n.id === node.id);
      yPosition = startY + index * nodeSpacing;
    }

    console.log(`Node ${node.id}: x=${xPosition}, y=${yPosition}`);

    return {
      id: node.id,
      type: 'default',
      position: { x: xPosition, y: yPosition },
      data: {
        label: node.groupName,
      },
      style: {
        background: node.color,
        color: 'white',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '16px 24px',
        fontSize: '14px',
        fontWeight: 600,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        minWidth: '120px',
        textAlign: 'center',
      },
    };
  });

  console.log('Initial nodes:', initialNodes);

  // reactflow 엣지 형식으로 변환 (덜 눈에 띄게)
  const initialEdges: Edge[] = data.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: 'right',
    targetHandle: 'left',
    type: 'straight',
    animated: false,
    style: { stroke: '#4b5563', strokeWidth: 1, opacity: 0.3 },
    markerEnd: {
      type: MarkerType.Arrow,
      color: '#4b5563',
      width: 15,
      height: 15,
    },
  }));

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // 동적 높이 계산 (가장 많은 노드를 가진 타입 기준)
  const maxNodesInColumn = Math.max(subjectNodes.length, relationNodes.length, expressionNodes.length);
  const graphHeight = Math.max(400, startY * 2 + maxNodesInColumn * nodeSpacing);

  console.log('Graph height:', graphHeight, 'maxNodesInColumn:', maxNodesInColumn);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const graphNode = data.nodes.find((n) => n.id === node.id);
      if (graphNode) {
        onNodeClick(node.id, graphNode.type);
      }
    },
    [data.nodes, onNodeClick]
  );

  return (
    <Box
      sx={{
        width: '100%',
        height: `${graphHeight}px`,
        bgcolor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        fitView
        fitViewOptions={{ padding: 0.3, minZoom: 0.5, maxZoom: 1.5 }}
        minZoom={0.5}
        maxZoom={2}
        attributionPosition="bottom-right"
      >
        <Background color="#374151" gap={16} />
        <MiniMap
          nodeColor={(node) => {
            const graphNode = data.nodes.find((n) => n.id === node.id);
            return graphNode?.color || '#6b7280';
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
          style={{ backgroundColor: '#1f2937' }}
        />
      </ReactFlow>
    </Box>
  );
}
