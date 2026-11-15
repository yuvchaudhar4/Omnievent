import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { palette, typography } from '../lib/theme';

interface EventUniverseProps {
  disruptedSessionId?: string;
  recoveredSessionId?: string;
  newRoomId?: string;
  onNodeSelect?: (nodeType: string, nodeId: string) => void;
  className?: string;
}

type NodeType = 'event' | 'session' | 'room' | 'speaker' | 'resource';

interface UniverseNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  color: string;
  detail: string;
  track?: string;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  type: 'session-room' | 'session-speaker' | 'session-resource';
}

const NODES: UniverseNode[] = [
  // Central event
  { id: 'event-1', type: 'event', label: 'GUKC Core', x: 400, y: 250, color: palette.secondary, detail: 'Galgotias Knowledge Operating Brain • 1,850 Registered Delegates' },

  // Sessions — inner ring
  { id: 'session-1', type: 'session', label: 'AI Keynote', x: 280, y: 130, color: palette.primary, detail: 'Inaugural Keynote: AI & Modern Libraries • 09:00', track: 'Keynote' },
  { id: 'session-2', type: 'session', label: 'HPC Clusters', x: 530, y: 140, color: palette.secondary, detail: 'Deep Learning on Campus Supercomputing • 09:30', track: 'Workshop' },
  { id: 'session-3', type: 'session', label: 'DPDP Ethics Panel', x: 580, y: 280, color: '#A05C28', detail: 'Ethical AI & DPDP Act Compliance • 11:00', track: 'Panel' },
  { id: 'session-4', type: 'session', label: 'Open Access', x: 510, y: 390, color: '#3A5426', detail: 'IEEE Xplore & Research Repositories • 13:30', track: 'Breakout' },
  { id: 'session-5', type: 'session', label: 'Vector WebOPAC', x: 290, y: 380, color: '#684F00', detail: 'Vector Search over 130k Volumes • 14:00', track: 'Workshop' },
  { id: 'session-6', type: 'session', label: 'Valedictory', x: 220, y: 260, color: palette.primary, detail: 'Convocation & Presidential Closing • 16:30', track: 'Keynote' },

  // Rooms — outer perimeter (Architectural squares)
  { id: 'room-1', type: 'room', label: 'Central Aud.', x: 130, y: 90, color: palette.textMain, detail: 'Capacity: 800 • Block C • Dual 4K Laser' },
  { id: 'room-2', type: 'room', label: 'AI Hub (L2)', x: 670, y: 100, color: palette.textMain, detail: 'Capacity: 80 • Level 2 • DGX Workstations' },
  { id: 'room-3', type: 'room', label: 'Seminar Hall', x: 710, y: 330, color: palette.textMain, detail: 'Capacity: 250 • Block A • Mic Arrays' },
  { id: 'room-4', type: 'room', label: 'Kalam Reading', x: 650, y: 440, color: palette.textMain, detail: 'Capacity: 350 • Level 1 • RFID Kiosks' },
  { id: 'room-5', type: 'room', label: 'E-Resource', x: 100, y: 400, color: palette.textMain, detail: 'Capacity: 120 • Level 2 • IEEE Terminals' },

  // Speakers
  { id: 'speaker-1', type: 'speaker', label: 'Dr. D.C. Kar', x: 160, y: 200, color: palette.secondary, detail: 'University Librarian, GUKC' },
  { id: 'speaker-2', type: 'speaker', label: 'Dr. H. Kumar', x: 620, y: 200, color: palette.primary, detail: 'Dean, Computing Science (SCSE)' },
  { id: 'speaker-3', type: 'speaker', label: 'Dr. M. Raj', x: 420, y: 440, color: '#3A5426', detail: 'Dean, School of AI' },
  { id: 'speaker-4', type: 'speaker', label: 'Prof. N.K. Gaur', x: 150, y: 320, color: palette.secondary, detail: 'Vice-Chancellor, Galgotias University' },

  // Resources
  { id: 'resource-1', type: 'resource', label: 'Laser Rig C', x: 80, y: 250, color: palette.warningText, detail: 'Dual 4K Laser Projection & Line Array' },
  { id: 'resource-2', type: 'resource', label: 'High-Tea Atrium', x: 450, y: 70, color: palette.warningText, detail: 'Scholarly Refreshment Service Hub' },
  { id: 'resource-3', type: 'resource', label: 'IT NetOps', x: 720, y: 220, color: palette.warningText, detail: 'Campus High-Speed Network Cell' },
];

const CONNECTIONS: Connection[] = [
  { id: 'c1', from: 'session-1', to: 'room-1', type: 'session-room' },
  { id: 'c2', from: 'session-2', to: 'room-2', type: 'session-room' },
  { id: 'c3', from: 'session-3', to: 'room-3', type: 'session-room' },
  { id: 'c4', from: 'session-4', to: 'room-4', type: 'session-room' },
  { id: 'c5', from: 'session-5', to: 'room-2', type: 'session-room' },
  { id: 'c6', from: 'session-6', to: 'room-1', type: 'session-room' },

  { id: 'c7', from: 'session-1', to: 'speaker-1', type: 'session-speaker' },
  { id: 'c8', from: 'session-2', to: 'speaker-2', type: 'session-speaker' },
  { id: 'c9', from: 'session-3', to: 'speaker-3', type: 'session-speaker' },
  { id: 'c10', from: 'session-6', to: 'speaker-4', type: 'session-speaker' },

  { id: 'c11', from: 'session-1', to: 'resource-1', type: 'session-resource' },
  { id: 'c12', from: 'session-2', to: 'resource-3', type: 'session-resource' },
  { id: 'c13', from: 'session-3', to: 'resource-2', type: 'session-resource' },
];

const SIGNAL_CONNECTIONS = ['c1', 'c2', 'c7', 'c11', 'c3'];

function getNodeById(id: string): UniverseNode | undefined {
  return NODES.find((n) => n.id === id);
}

function getConnectedNodeIds(nodeId: string): Set<string> {
  const ids = new Set<string>();
  CONNECTIONS.forEach((c) => {
    if (c.from === nodeId) ids.add(c.to);
    if (c.to === nodeId) ids.add(c.from);
  });
  return ids;
}

export default function EventUniverse({
  disruptedSessionId,
  recoveredSessionId,
  newRoomId,
  onNodeSelect,
  className = '',
}: EventUniverseProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const activeFocusId = selectedNodeId || hoveredNodeId;
  const connectedIds = useMemo(() => {
    if (!activeFocusId) return new Set<string>();
    return getConnectedNodeIds(activeFocusId);
  }, [activeFocusId]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return getNodeById(selectedNodeId) || null;
  }, [selectedNodeId]);

  const handleNodeClick = useCallback(
    (node: UniverseNode) => {
      setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
      onNodeSelect?.(node.type, node.id);
    },
    [onNodeSelect]
  );

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        background: palette.bgSecondary,
        borderRadius: 12,
        border: `1px solid ${palette.border}`,
        boxShadow: palette.shadowSoft,
        overflow: 'hidden',
      }}
    >
      {/* Editorial Architectural Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: `1px solid ${palette.border}`,
          background: palette.bgMain,
          fontFamily: typography.fontMono,
          fontSize: 11,
          color: palette.textMuted,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: palette.primary,
              display: 'inline-block',
            }}
          />
          <strong style={{ color: palette.textMain }}>SPATIAL EVENT TOPOLOGY</strong>
          <span>• 17 NODES • 13 CONSTRAINTS</span>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <span>SCALE: 1:250</span>
          <span>SOLVER: CP-SAT HYBRID</span>
        </div>
      </div>

      {/* Main SVG Blueprint Canvas */}
      <svg
        viewBox="0 0 800 500"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          background: '#FCFBF8',
        }}
      >
        {/* Architectural Fine Grid Lines */}
        <defs>
          <pattern id="arch-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#EFEAE0" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="800" height="500" fill="url(#arch-grid)" />

        {/* Central Hub Radii */}
        <circle cx="400" cy="250" r="160" fill="none" stroke="#E9E4DA" strokeWidth="1" strokeDasharray="3 4" />
        <circle cx="400" cy="250" r="230" fill="none" stroke="#E9E4DA" strokeWidth="1" strokeDasharray="2 6" />

        {/* Connection Hairlines */}
        {CONNECTIONS.map((conn, i) => {
          const fromNode = getNodeById(conn.from);
          const toNode = getNodeById(conn.to);
          if (!fromNode || !toNode) return null;

          const isDisruptedConn = disruptedSessionId && (conn.from === disruptedSessionId || conn.to === disruptedSessionId);
          const isHighlighted =
            activeFocusId && (conn.from === activeFocusId || conn.to === activeFocusId);
          const isDimmed = activeFocusId && !isHighlighted;

          const strokeColor = isDisruptedConn
            ? palette.danger
            : isHighlighted
            ? palette.primary
            : '#D4CDC0';

          const strokeWidth = isDisruptedConn ? 2.5 : isHighlighted ? 2 : 1;
          const strokeDasharray = isDisruptedConn ? '4 3' : 'none';

          const pathId = `path-${conn.id}`;
          const d = `M ${fromNode.x} ${fromNode.y} Q ${(fromNode.x + toNode.x) / 2 + (i % 2 === 0 ? 15 : -15)} ${(fromNode.y + toNode.y) / 2} ${toNode.x} ${toNode.y}`;

          return (
            <g key={conn.id} opacity={isDimmed ? 0.2 : 1} style={{ transition: 'opacity 0.2s ease' }}>
              <path id={pathId} d={d} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} />

              {/* Data Signal Pulse Packet */}
              {SIGNAL_CONNECTIONS.includes(conn.id) && !isDisruptedConn && (
                <circle r={3} fill={palette.primary}>
                  <animateMotion dur={`${4 + (i % 3)}s`} repeatCount="indefinite">
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                  <animate attributeName="opacity" values="0;1;1;0" dur={`${4 + (i % 3)}s`} repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}

        {/* Dynamic Recovery Re-route Guide */}
        {recoveredSessionId && newRoomId && (() => {
          const ses = getNodeById(recoveredSessionId);
          const rm = getNodeById(newRoomId);
          if (!ses || !rm) return null;
          return (
            <g>
              <line
                x1={ses.x}
                y1={ses.y}
                x2={rm.x}
                y2={rm.y}
                stroke={palette.successText}
                strokeWidth={2.5}
                strokeDasharray="4 3"
              />
              <circle cx={(ses.x + rm.x) / 2} cy={(ses.y + rm.y) / 2} r={8} fill={palette.success} stroke={palette.successText} strokeWidth={1} />
              <text
                x={(ses.x + rm.x) / 2}
                y={(ses.y + rm.y) / 2 + 3}
                textAnchor="middle"
                fontSize={8}
                fontFamily={typography.fontMono}
                fill={palette.successText}
                fontWeight={700}
              >
                REROUTED
              </text>
            </g>
          );
        })()}

        {/* Render Nodes */}
        {NODES.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;
          const isConnected = connectedIds.has(node.id);
          const isDisrupted = disruptedSessionId === node.id;
          const isDimmed = activeFocusId && !isSelected && !isHovered && !isConnected;

          return (
            <g
              key={node.id}
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              opacity={isDimmed ? 0.25 : 1}
              style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
            >
              {/* Ripple warning for disrupted node */}
              {isDisrupted && (
                <circle cx={node.x} cy={node.y} r={28} fill="none" stroke={palette.danger} strokeWidth={1.5} opacity={0.6}>
                  <animate attributeName="r" values="18;34" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Node Shape based on architectural type */}
              {node.type === 'event' && (
                <g>
                  <circle cx={node.x} cy={node.y} r={26} fill={palette.bgSecondary} stroke={palette.secondary} strokeWidth={2.5} />
                  <circle cx={node.x} cy={node.y} r={18} fill={palette.secondary} opacity={0.15} />
                  <rect x={node.x - 7} y={node.y - 7} width={14} height={14} fill={palette.secondary} rx={3} />
                </g>
              )}

              {node.type === 'session' && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected || isHovered ? 16 : 13}
                  fill={isDisrupted ? '#FDEAE9' : palette.bgSecondary}
                  stroke={isDisrupted ? palette.danger : node.color}
                  strokeWidth={isSelected || isHovered ? 2.5 : 2}
                />
              )}

              {node.type === 'room' && (
                <rect
                  x={node.x - 14}
                  y={node.y - 14}
                  width={28}
                  height={28}
                  rx={5}
                  fill={palette.bgSecondary}
                  stroke={isSelected || isHovered ? palette.primary : palette.borderDark}
                  strokeWidth={2}
                />
              )}

              {node.type === 'speaker' && (
                <polygon
                  points={`${node.x},${node.y - 12} ${node.x + 11},${node.y + 8} ${node.x - 11},${node.y + 8}`}
                  fill={palette.bgParchment}
                  stroke={node.color}
                  strokeWidth={1.8}
                />
              )}

              {node.type === 'resource' && (
                <rect
                  x={node.x - 10}
                  y={node.y - 10}
                  width={20}
                  height={20}
                  rx={3}
                  transform={`rotate(45 ${node.x} ${node.y})`}
                  fill={palette.bgSecondary}
                  stroke={palette.warningText}
                  strokeWidth={1.8}
                />
              )}

              {/* Node Label Text */}
              <text
                x={node.x}
                y={node.y + (node.type === 'event' ? 40 : 26)}
                textAnchor="middle"
                fontFamily={typography.fontHeading}
                fontSize={node.type === 'event' ? 12 : 11}
                fontWeight={node.type === 'event' || isSelected ? 700 : 600}
                fill={palette.textMain}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Selected Node Details Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              maxWidth: 420,
              background: palette.bgSecondary,
              borderRadius: 8,
              padding: 16,
              border: `1px solid ${palette.borderDark}`,
              boxShadow: palette.shadowElevated,
              fontFamily: typography.fontBody,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontFamily: typography.fontMono,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: palette.bgMain,
                    color: palette.secondary,
                    border: `1px solid ${palette.border}`,
                    textTransform: 'uppercase',
                  }}
                >
                  {selectedNode.type}
                </span>
                <h4
                  style={{
                    fontFamily: typography.fontHeading,
                    fontSize: 14,
                    fontWeight: 700,
                    color: palette.textMain,
                    margin: 0,
                  }}
                >
                  {selectedNode.label}
                </h4>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: palette.textMuted,
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                <X size={15} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: palette.textMuted, margin: '0 0 10px', lineHeight: 1.45 }}>
              {selectedNode.detail}
            </p>
            <div
              style={{
                fontFamily: typography.fontMono,
                fontSize: 10,
                color: palette.textMuted,
                display: 'flex',
                gap: 12,
              }}
            >
              <span>CONNECTIONS: {connectedIds.size}</span>
              <span>COORDS: X{selectedNode.x} Y{selectedNode.y}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
