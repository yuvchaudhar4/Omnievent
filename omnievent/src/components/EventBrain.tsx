import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { palette, typography } from '../lib/theme';
import { useEventState } from '../context/EventStateContext';
import {
  Calendar,
  Radio,
  ShieldAlert,
  Compass,
  Boxes,
  MessageSquareShare,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ModuleNode {
  id: string;
  code: string;
  name: string;
  icon: typeof Calendar;
  x: number;
  y: number;
  color: string;
  status: 'nominal' | 'active' | 'warning';
  telemetry: string;
}

export default function EventBrain() {
  const { activeBrainSignals, fireBrainSignal, status, butterfly } = useEventState();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const modules: ModuleNode[] = useMemo(() => [
    {
      id: 'planning',
      code: 'PLN-02',
      name: 'Planning DAG',
      icon: Calendar,
      x: 160,
      y: 90,
      color: palette.secondary,
      status: 'nominal',
      telemetry: 'DAG Critical Path 100% Validated',
    },
    {
      id: 'schedule',
      code: 'SCH-03',
      name: 'Schedule Matrix',
      icon: Radio,
      x: 480,
      y: 90,
      color: palette.primary,
      status: butterfly.active ? 'active' : 'nominal',
      telemetry: '6 Live Tracks • 0 Conflicts',
    },
    {
      id: 'rescue',
      code: 'RSC-04',
      name: 'Rescue Engine',
      icon: ShieldAlert,
      x: 540,
      y: 240,
      color: palette.primary,
      status: status === 'disrupted' ? 'warning' : 'nominal',
      telemetry: 'CP-SAT Solver Ready (<5.0s)',
    },
    {
      id: 'digital-twin',
      code: 'TWN-05',
      name: 'Digital Twin',
      icon: Compass,
      x: 480,
      y: 390,
      color: palette.secondary,
      status: 'nominal',
      telemetry: 'GUKC Library Multi-Floor Spatial Flow 60 FPS',
    },
    {
      id: 'resources',
      code: 'RSC-07',
      name: 'Resource Allocation',
      icon: Boxes,
      x: 160,
      y: 390,
      color: palette.successText,
      status: 'nominal',
      telemetry: 'Volunteers 96% Optimal',
    },
    {
      id: 'communications',
      code: 'COM-08',
      name: 'Multilingual Dispatch',
      icon: MessageSquareShare,
      x: 100,
      y: 240,
      color: palette.warningText,
      status: butterfly.rippleStep >= 5 ? 'active' : 'nominal',
      telemetry: '4 Channels • EN/FR/DE/HI Ready',
    },
  ], [status, butterfly]);

  const centerX = 320;
  const centerY = 240;

  const selectedNode = modules.find(m => m.id === selectedNodeId) || null;

  return (
    <div style={{
      background: palette.bgSecondary,
      borderRadius: 14,
      border: `1px solid ${palette.border}`,
      boxShadow: palette.shadowSoft,
      padding: 24,
      fontFamily: typography.fontBody,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottom: `1px solid ${palette.border}`,
        paddingBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: palette.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
          }}>
            <Sparkles size={16} />
          </div>
          <div>
            <div style={{ fontFamily: typography.fontHeading, fontSize: 16, fontWeight: 700, color: palette.textMain }}>
              Event Brain Topological Core
            </div>
            <div style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>
              CP-SAT SOLVER & SYSTEM SIGNAL BUS • 6 ACTIVE NODES
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => fireBrainSignal({
              source: 'Event Brain',
              target: 'All Modules',
              label: 'Manual Telemetry Sync',
              type: 'telemetry',
            })}
            style={{
              background: palette.bgMain,
              border: `1px solid ${palette.border}`,
              borderRadius: 6,
              padding: '6px 12px',
              fontFamily: typography.fontMono,
              fontSize: 11,
              fontWeight: 600,
              color: palette.secondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Zap size={13} />
            <span>PULSE SIGNAL</span>
          </button>
        </div>
      </div>

      {/* Interactive Topology Graph SVG */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 640,
        margin: '0 auto',
        height: 480,
        background: palette.bgMain,
        borderRadius: 10,
        border: `1px solid ${palette.border}`,
        overflow: 'hidden',
      }}>
        <svg width="100%" height="100%" viewBox="0 0 640 480" style={{ overflow: 'visible' }}>
          {/* Subtle Grid Lines */}
          <line x1="0" y1="240" x2="640" y2="240" stroke="#E9E4DA" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="320" y1="0" x2="320" y2="480" stroke="#E9E4DA" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={centerX} cy={centerY} r="180" fill="none" stroke="#E9E4DA" strokeWidth="1" strokeDasharray="5 5" />

          {/* Connection Lines & Animated Signal Pulses */}
          {modules.map((m, idx) => {
            const isHovered = selectedNodeId === m.id;
            return (
              <g key={m.id}>
                {/* Static Bus Path */}
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={m.x}
                  y2={m.y}
                  stroke={isHovered ? palette.primary : '#D4CDC0'}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  strokeDasharray="4 4"
                />

                {/* Animated Luminous Packet along line */}
                <motion.circle
                  r="4"
                  fill={m.color}
                  animate={{
                    cx: [centerX, m.x, centerX],
                    cy: [centerY, m.y, centerY],
                  }}
                  transition={{
                    duration: 3 + (idx * 0.4),
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </g>
            );
          })}

          {/* Central Event Brain Node */}
          <g transform={`translate(${centerX}, ${centerY})`}>
            {/* Pulsing Concentric Aura */}
            <motion.circle
              r="40"
              fill="rgba(230, 107, 69, 0.08)"
              animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            />
            <circle
              r="34"
              fill={palette.bgSecondary}
              stroke={palette.primary}
              strokeWidth="2.5"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(230, 107, 69, 0.2))' }}
            />
            <circle r="26" fill={palette.primary} />
            <text
              textAnchor="middle"
              dy="4"
              fill="#FFFFFF"
              fontFamily={typography.fontHeading}
              fontSize="11"
              fontWeight="800"
            >
              BRAIN
            </text>
          </g>

          {/* Satellite Modules */}
          {modules.map((m) => {
            const isSelected = selectedNodeId === m.id;
            return (
              <g
                key={m.id}
                transform={`translate(${m.x}, ${m.y})`}
                onClick={() => setSelectedNodeId(isSelected ? null : m.id)}
                style={{ cursor: 'pointer' }}
              >
                <motion.circle
                  r="24"
                  fill={isSelected ? '#FFFFFF' : palette.bgSecondary}
                  stroke={isSelected ? palette.primary : m.color}
                  strokeWidth={isSelected ? 2.5 : 1.8}
                  whileHover={{ scale: 1.12 }}
                  style={{ filter: isSelected ? 'drop-shadow(0 4px 14px rgba(230, 107, 69, 0.3))' : palette.shadowSoft }}
                />

                {/* Module Code Badge */}
                <text
                  textAnchor="middle"
                  dy="-4"
                  fill={palette.textMain}
                  fontFamily={typography.fontMono}
                  fontSize="8"
                  fontWeight="700"
                >
                  {m.code}
                </text>
                <text
                  textAnchor="middle"
                  dy="8"
                  fill={palette.textMuted}
                  fontFamily={typography.fontBody}
                  fontSize="7"
                  fontWeight="600"
                >
                  {m.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Module Detail Flyout */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                right: 12,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: 8,
                border: `1px solid ${palette.borderDark}`,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: palette.shadowElevated,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontFamily: typography.fontMono,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: palette.bgMain,
                  color: selectedNode.color,
                }}>
                  {selectedNode.code}
                </span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: palette.textMain }}>
                    {selectedNode.name}
                  </div>
                  <div style={{ fontSize: 11, color: palette.textMuted }}>
                    {selectedNode.telemetry}
                  </div>
                </div>
              </div>

              <span style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.successText, fontWeight: 700 }}>
                ONLINE • NOMINAL
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live System Signal Bus Stream */}
      <div style={{ marginTop: 18 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          <span style={{ fontFamily: typography.fontMono, fontSize: 11, fontWeight: 700, color: palette.textMuted }}>
            LIVE REACTION SIGNALS ({activeBrainSignals.length})
          </span>
          <span style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.secondary }}>
            LATENCY: 1.2ms
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 110, overflowY: 'auto' }}>
          {activeBrainSignals.slice(0, 4).map((sig) => (
            <motion.div
              key={sig.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: 6,
                background: palette.bgMain,
                border: `1px solid ${palette.border}`,
                fontSize: 11,
                fontFamily: typography.fontMono,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: palette.primary, fontWeight: 700 }}>{sig.source}</span>
                <span style={{ color: palette.textMuted }}>➔</span>
                <span style={{ color: palette.secondary, fontWeight: 700 }}>{sig.target}</span>
                <span style={{ color: palette.textMain, marginLeft: 8 }}>{sig.label}</span>
              </div>
              <span style={{ color: palette.textMuted, fontSize: 10 }}>{sig.timestamp}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
