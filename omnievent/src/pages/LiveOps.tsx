import { useState, type FC } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Activity,
  CheckCircle2,
  AlertCircle,
  MonitorPlay,
  Clock,
  MapPin,
  UserPlus,
} from 'lucide-react';
import { AnimatedPage } from '../components/animated/AnimatedPage';
import { activities } from '../lib/demo-data';
import type { Activity as ActivityType } from '../lib/types';
import { palette, typography } from '../lib/theme';
import { useEventState } from '../context/EventStateContext';

const PulsingDot: FC<{ color: string; size?: number }> = ({ color, size = 8 }) => (
  <div style={{ position: 'relative', width: size, height: size }}>
    <motion.div
      animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: color,
      }}
    />
    <div style={{
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      background: color,
    }} />
  </div>
);

function getActivityIcon(type: ActivityType['type']) {
  switch (type) {
    case 'check-in': return <CheckCircle2 size={14} style={{ color: palette.successText }} />;
    case 'session-start': return <MonitorPlay size={14} style={{ color: palette.primary }} />;
    case 'session-end': return <Clock size={14} style={{ color: palette.textMuted }} />;
    case 'incident': return <AlertCircle size={14} style={{ color: palette.danger }} />;
    case 'alert': return <AlertTriangle size={14} style={{ color: palette.warningText }} />;
    case 'room-change': return <MapPin size={14} style={{ color: palette.secondary }} />;
    case 'registration': return <UserPlus size={14} style={{ color: palette.successText }} />;
    default: return <Activity size={14} style={{ color: palette.textMuted }} />;
  }
}

function formatTime(ts?: string): string {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function LiveOps() {
  const { rooms } = useEventState();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  return (
    <AnimatedPage>
      <div style={{ maxWidth: 1320, margin: '0 auto', fontFamily: typography.fontBody }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 24,
          borderBottom: `1px solid ${palette.border}`,
          paddingBottom: 20,
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 9px',
              borderRadius: 4,
              background: palette.bgParchment,
              border: `1px solid ${palette.borderDark}`,
              fontFamily: typography.fontMono,
              fontSize: 11,
              fontWeight: 700,
              color: palette.secondary,
              marginBottom: 8,
              letterSpacing: '0.04em',
            }}>
              <Activity size={13} />
              REAL-TIME VENUE TELEMETRY
            </div>
            <h1 style={{
              fontFamily: typography.fontHeading,
              fontSize: 28,
              fontWeight: 700,
              color: palette.textMain,
              letterSpacing: '-0.03em',
              margin: 0,
            }}>
              Live Operations Deck
            </h1>
            <p style={{ fontSize: 13, color: palette.textMuted, margin: '4px 0 0' }}>
              Turnstile throughput, ambient temperature signals, and incident stream.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PulsingDot color={palette.successText} size={8} />
            <span style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>
              STREAM ACTIVE: 60 FPS
            </span>
          </div>
        </div>

        {/* 2-Column Split */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 24 }}>
          {/* Room Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {rooms.map((room) => {
              const pct = Math.round((room.currentOccupancy / room.capacity) * 100);
              const isSelected = selectedRoomId === room.id;

              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  style={{
                    background: isSelected ? '#FFFFFF' : palette.bgSecondary,
                    padding: 18,
                    borderRadius: 10,
                    border: `1.5px solid ${isSelected ? palette.primary : palette.border}`,
                    boxShadow: isSelected ? palette.shadowElevated : palette.shadowSoft,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: typography.fontHeading, fontSize: 14, fontWeight: 700 }}>
                      {room.name}
                    </span>
                    <span style={{
                      fontFamily: typography.fontMono,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: room.status === 'occupied' ? '#FDF5F2' : '#F1F5E4',
                      color: room.status === 'occupied' ? palette.primary : palette.successText,
                    }}>
                      {room.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontFamily: typography.fontMono, fontSize: 20, fontWeight: 700, color: palette.textMain, marginBottom: 8 }}>
                    {room.currentOccupancy} <span style={{ fontSize: 13, color: palette.textMuted, fontWeight: 400 }}>/ {room.capacity} ({pct}%)</span>
                  </div>

                  <div style={{ height: 4, background: '#E6E1D5', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(pct, 100)}%`,
                      height: '100%',
                      background: pct > 85 ? palette.primary : palette.secondary,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Activity Timeline */}
          <div style={{
            background: palette.bgSecondary,
            borderRadius: 12,
            border: `1px solid ${palette.border}`,
            padding: 24,
            boxShadow: palette.shadowSoft,
          }}>
            <h3 style={{ fontFamily: typography.fontHeading, fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>
              Live Telemetry Stream
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 520, overflowY: 'auto' }}>
              {activities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: 10,
                    borderRadius: 6,
                    background: palette.bgMain,
                    border: `1px solid ${palette.border}`,
                  }}
                >
                  <div style={{ marginTop: 2 }}>{getActivityIcon(act.type)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: palette.textMain, fontWeight: 500 }}>
                      {act.message}
                    </div>
                    <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted, marginTop: 2 }}>
                      {formatTime(act.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
