import { useState, useMemo, type FC, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Users,
  MapPin,
  Star,
  CheckCircle2,
  Radio,
  CalendarClock,
  Ban,
  X,
  Calendar,
} from 'lucide-react';
import { AnimatedPage } from '../components/animated/AnimatedPage';
import { palette, typography, trackStyles } from '../lib/theme';
import type { Session, Track, SessionStatus } from '../lib/types';
import { useEventState } from '../context/EventStateContext';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getHourFromISO(iso: string): number {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: ReactNode }> = {
  live: { label: 'Live Now', color: palette.primary, bg: '#FDF5F2', icon: <Radio size={12} /> },
  scheduled: { label: 'Scheduled', color: palette.secondary, bg: '#EAEFFE', icon: <CalendarClock size={12} /> },
  completed: { label: 'Completed', color: palette.textMuted, bg: palette.bgMain, icon: <CheckCircle2 size={12} /> },
  disrupted: { label: 'Disrupted', color: palette.danger, bg: '#FDEAE9', icon: <Ban size={12} /> },
  active: { label: 'Active', color: palette.warningText, bg: '#FDF6E2', icon: <CalendarClock size={12} /> },
  rescheduled: { label: 'Rescheduled', color: palette.warningText, bg: '#FDF6E2', icon: <CalendarClock size={12} /> },
};

const StatusBadge: FC<{ status: SessionStatus }> = ({ status }) => {
  const cfg = statusConfig[status] || { label: status, color: palette.secondary, bg: '#EAEFFE', icon: <CalendarClock size={12} /> };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 10,
        fontFamily: typography.fontMono,
        fontWeight: 700,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}33`,
        padding: '2px 8px',
        borderRadius: 4,
        textTransform: 'uppercase',
      }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

// ── Slide-out Session Inspection Panel ──────────────────────────────────────────

const SessionPanel: FC<{ session: Session; onClose: () => void }> = ({ session, onClose }) => {
  const { rooms } = useEventState();
  const room = rooms.find(r => r.id === session.roomId);
  const trackStyle = trackStyles[session.track] || { bg: palette.bgMain, text: palette.textMain, border: palette.border, label: session.track };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(37, 45, 53, 0.35)',
          backdropFilter: 'blur(2px)',
          zIndex: 100,
        }}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 32 }}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 440,
          maxWidth: '92vw',
          background: palette.bgSecondary,
          borderLeft: `1px solid ${palette.border}`,
          zIndex: 101,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: palette.shadowFloat,
          fontFamily: typography.fontBody,
        }}
      >
        {/* Panel Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: `1px solid ${palette.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <span style={{
                fontSize: 10,
                fontFamily: typography.fontMono,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 4,
                background: trackStyle.bg,
                color: trackStyle.text,
                border: `1px solid ${trackStyle.border}`,
                textTransform: 'uppercase',
              }}>
                {trackStyle.label}
              </span>
              <StatusBadge status={session.status} />
            </div>
            <h2 style={{
              fontFamily: typography.fontHeading,
              fontSize: 18,
              fontWeight: 700,
              color: palette.textMain,
              margin: 0,
              lineHeight: 1.25,
            }}>
              {session.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              background: palette.bgMain,
              border: `1px solid ${palette.border}`,
              color: palette.textMuted,
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Panel Body */}
        <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
          <p style={{ fontSize: 13, color: palette.textMuted, lineHeight: 1.6, marginBottom: 24 }}>
            {session.description}
          </p>

          {/* Key Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 24,
          }}>
            <div style={{ padding: 12, background: palette.bgMain, borderRadius: 8, border: `1px solid ${palette.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: palette.textMuted, fontSize: 11, fontFamily: typography.fontMono }}>
                <Clock size={13} /> TIME SLOT
              </div>
              <div style={{ fontFamily: typography.fontMono, fontSize: 13, fontWeight: 700, marginTop: 4 }}>
                {formatTime(session.startTime)} – {formatTime(session.endTime)}
              </div>
            </div>

            <div style={{ padding: 12, background: palette.bgMain, borderRadius: 8, border: `1px solid ${palette.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: palette.textMuted, fontSize: 11, fontFamily: typography.fontMono }}>
                <MapPin size={13} /> ASSIGNED VENUE
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                {room?.name || 'Main Hall'}
              </div>
            </div>

            <div style={{ padding: 12, background: palette.bgMain, borderRadius: 8, border: `1px solid ${palette.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: palette.textMuted, fontSize: 11, fontFamily: typography.fontMono }}>
                <Users size={13} /> OCCUPANCY
              </div>
              <div style={{ fontFamily: typography.fontMono, fontSize: 13, fontWeight: 700, marginTop: 4 }}>
                {session.attendeeCount} / {session.maxAttendees}
              </div>
            </div>

            {session.rating && (
              <div style={{ padding: 12, background: palette.bgMain, borderRadius: 8, border: `1px solid ${palette.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: palette.textMuted, fontSize: 11, fontFamily: typography.fontMono }}>
                  <Star size={13} color={palette.warningText} /> AUDIENCE RATING
                </div>
                <div style={{ fontFamily: typography.fontMono, fontSize: 13, fontWeight: 700, marginTop: 4, color: palette.warningText }}>
                  {session.rating.toFixed(1)} / 5.0
                </div>
              </div>
            )}
          </div>

          {/* Speakers */}
          {session.speakers && session.speakers.length > 0 && (
            <div>
              <h3 style={{
                fontFamily: typography.fontHeading,
                fontSize: 14,
                fontWeight: 700,
                color: palette.textMain,
                marginBottom: 12,
              }}>
                Key Presenters
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {session.speakers.map(speaker => (
                  <div key={speaker.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: palette.bgMain,
                    borderRadius: 8,
                    padding: '10px 14px',
                    border: `1px solid ${palette.border}`,
                  }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 6,
                      background: palette.bgParchment,
                      color: palette.textMain,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: typography.fontHeading,
                      fontWeight: 700,
                      fontSize: 13,
                    }}>
                      {speaker.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: palette.textMain }}>{speaker.name}</div>
                      <div style={{ fontSize: 11, color: palette.textMuted }}>{speaker.title} • {speaker.company}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

// ── Timeline Geometry ──────────────────────────────────────────────────────────

const TIMELINE_START = 7;
const TIMELINE_END = 18;
const HOUR_WIDTH = 120;
const HOURS = Array.from({ length: TIMELINE_END - TIMELINE_START + 1 }, (_, i) => TIMELINE_START + i);
const ROW_HEIGHT = 74;

export default function Schedule() {
  const { sessions, rooms } = useEventState();
  const [selectedTrack, setSelectedTrack] = useState<Track | 'all'>('all');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [currentHour] = useState(() => 9.75); // 09:45 AM live morning event time

  const timelineRooms = useMemo(() => {
    const usedRoomIds = [...new Set(sessions.map(s => s.roomId))];
    return usedRoomIds.map(id => rooms.find(r => r.id === id)!).filter(Boolean);
  }, [sessions, rooms]);

  const filteredSessions = useMemo(() => {
    if (selectedTrack === 'all') return sessions;
    return sessions.filter(s => s.track === selectedTrack);
  }, [sessions, selectedTrack]);

  const totalWidth = (TIMELINE_END - TIMELINE_START) * HOUR_WIDTH;

  return (
    <AnimatedPage>
      <div style={{ maxWidth: 1360, margin: '0 auto', fontFamily: typography.fontBody }}>
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
              <Calendar size={13} />
              MULTI-TRACK SPATIAL TIMELINE
            </div>
            <h1 style={{
              fontFamily: typography.fontHeading,
              fontSize: 28,
              fontWeight: 700,
              color: palette.textMain,
              letterSpacing: '-0.03em',
              margin: 0,
            }}>
              Master Schedule Matrix
            </h1>
            <p style={{ fontSize: 13, color: palette.textMuted, margin: '4px 0 0' }}>
              Real-time multi-venue timeline coordinates. Click any block to view occupancy and presenter telemetry.
            </p>
          </div>

          <div style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>
            <span>VENUE CLOCK: 09:45 CEST</span>
          </div>
        </div>

        {/* Track Filter Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => setSelectedTrack('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: selectedTrack === 'all' ? 700 : 500,
              cursor: 'pointer',
              background: selectedTrack === 'all' ? palette.textMain : palette.bgSecondary,
              color: selectedTrack === 'all' ? '#FFFFFF' : palette.textMuted,
              border: `1px solid ${selectedTrack === 'all' ? palette.textMain : palette.borderDark}`,
              fontFamily: typography.fontBody,
            }}
          >
            All Tracks ({sessions.length})
          </button>

          {Object.entries(trackStyles).map(([key, style]) => (
            <button
              key={key}
              onClick={() => setSelectedTrack(key as Track)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: selectedTrack === key ? 700 : 500,
                cursor: 'pointer',
                background: selectedTrack === key ? style.bg : palette.bgSecondary,
                color: selectedTrack === key ? style.text : palette.textMuted,
                border: `1px solid ${selectedTrack === key ? style.border : palette.borderDark}`,
                fontFamily: typography.fontBody,
              }}
            >
              {style.label}
            </button>
          ))}
        </div>

        {/* Architectural Timeline Board */}
        <div style={{
          background: palette.bgSecondary,
          borderRadius: 12,
          border: `1px solid ${palette.border}`,
          boxShadow: palette.shadowSoft,
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', overflowX: 'auto', position: 'relative' }}>
            {/* Left Frozen Column: Room Labels */}
            <div style={{
              width: 170,
              flexShrink: 0,
              borderRight: `1px solid ${palette.border}`,
              background: palette.bgMain,
              zIndex: 20,
            }}>
              {/* Header Corner */}
              <div style={{
                height: 44,
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                borderBottom: `1px solid ${palette.border}`,
                fontFamily: typography.fontMono,
                fontSize: 11,
                fontWeight: 700,
                color: palette.textMuted,
              }}>
                ROOM / VENUE
              </div>

              {/* Room Rows */}
              {timelineRooms.map(room => (
                <div
                  key={room.id}
                  style={{
                    height: ROW_HEIGHT,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '0 16px',
                    borderBottom: `1px solid ${palette.border}`,
                  }}
                >
                  <span style={{ fontFamily: typography.fontHeading, fontSize: 13, fontWeight: 700, color: palette.textMain }}>
                    {room.name}
                  </span>
                  <span style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>
                    Cap: {room.capacity} • Fl {room.floor}
                  </span>
                </div>
              ))}
            </div>

            {/* Right Scrollable Canvas: Hours and Session Cards */}
            <div style={{ flex: 1, minWidth: totalWidth, position: 'relative' }}>
              {/* Hours Header Row */}
              <div style={{
                height: 44,
                display: 'flex',
                borderBottom: `1px solid ${palette.border}`,
                background: palette.bgMain,
              }}>
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    style={{
                      width: HOUR_WIDTH,
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 10,
                      fontFamily: typography.fontMono,
                      fontSize: 11,
                      color: palette.textMuted,
                      borderRight: `1px dashed ${palette.border}`,
                    }}
                  >
                    {hour < 10 ? `0${hour}:00` : `${hour}:00`}
                  </div>
                ))}
              </div>

              {/* Current Time Red/Terracotta Line */}
              {currentHour >= TIMELINE_START && currentHour <= TIMELINE_END && (
                <div style={{
                  position: 'absolute',
                  left: (currentHour - TIMELINE_START) * HOUR_WIDTH,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: palette.primary,
                  zIndex: 15,
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 4,
                    left: -24,
                    background: palette.primary,
                    color: '#FFFFFF',
                    fontFamily: typography.fontMono,
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: 3,
                  }}>
                    09:45
                  </div>
                </div>
              )}

              {/* Room Grid Rows */}
              {timelineRooms.map(room => {
                const roomSessions = filteredSessions.filter(s => s.roomId === room.id);

                return (
                  <div
                    key={room.id}
                    style={{
                      height: ROW_HEIGHT,
                      position: 'relative',
                      borderBottom: `1px solid ${palette.border}`,
                      background: '#FFFFFF',
                    }}
                  >
                    {/* Background hour grid dividers */}
                    {HOURS.map(hour => (
                      <div
                        key={hour}
                        style={{
                          position: 'absolute',
                          left: (hour - TIMELINE_START) * HOUR_WIDTH,
                          top: 0,
                          bottom: 0,
                          width: 1,
                          borderRight: `1px dashed #F0EAE1`,
                        }}
                      />
                    ))}

                    {/* Placed Session Blocks */}
                    {roomSessions.map(session => {
                      const startH = getHourFromISO(session.startTime);
                      const endH = getHourFromISO(session.endTime);
                      const left = (startH - TIMELINE_START) * HOUR_WIDTH;
                      const width = Math.max((endH - startH) * HOUR_WIDTH - 8, 80);
                      const trackStyle = trackStyles[session.track] || { bg: palette.bgMain, text: palette.textMain, border: palette.border, label: session.track };

                      return (
                        <div
                          key={session.id}
                          onClick={() => setSelectedSession(session)}
                          style={{
                            position: 'absolute',
                            left,
                            top: 8,
                            width,
                            height: ROW_HEIGHT - 16,
                            borderRadius: 6,
                            background: trackStyle.bg,
                            border: `1.5px solid ${trackStyle.border}`,
                            padding: '6px 10px',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            zIndex: 10,
                            boxShadow: '0 2px 6px rgba(37, 45, 53, 0.04)',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span style={{
                              fontFamily: typography.fontMono,
                              fontSize: 9,
                              fontWeight: 700,
                              color: trackStyle.text,
                            }}>
                              {formatTime(session.startTime)} – {formatTime(session.endTime)}
                            </span>
                            {session.status === 'live' && (
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: palette.primary }} />
                            )}
                          </div>
                          <div style={{
                            fontFamily: typography.fontHeading,
                            fontSize: 12,
                            fontWeight: 700,
                            color: palette.textMain,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {session.title}
                          </div>
                          <div style={{ fontSize: 10, color: palette.textMuted, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                            {session.speakers && session.speakers.length > 0 ? session.speakers[0].name : 'Speaker'} • {session.attendeeCount} att
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Slide-out Session Details */}
        <AnimatePresence>
          {selectedSession && (
            <SessionPanel
              session={selectedSession}
              onClose={() => setSelectedSession(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </AnimatedPage>
  );
}
