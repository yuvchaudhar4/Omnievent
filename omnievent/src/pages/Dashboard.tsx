import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users,
  Radio,
  DoorOpen,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Compass,
  Zap,
} from 'lucide-react';
import { AnimatedPage } from '../components/animated/AnimatedPage';
import EventUniverse from '../components/EventUniverse';
import EventBrain from '../components/EventBrain';
import { activities } from '../lib/demo-data';
import { palette, typography } from '../lib/theme';
import { useEventState } from '../context/EventStateContext';
import {
  LivingCounter,
  PerspectiveCard,
  MaskReveal,
  DynamicHeatmapBadge,
  MagneticButton,
} from '../components/animated/LivingData';

export default function Dashboard() {
  const [activityFilter, setActivityFilter] = useState<'all' | 'incident' | 'check-in'>('all');
  const [centerView, setCenterView] = useState<'brain' | 'universe'>('brain');

  const {
    status,
    butterfly,
    triggerDisruption,
    incidents,
    eventMetrics,
    rooms,
    sessions,
  } = useEventState();

  const avgOccupancy = useMemo(() => {
    const totalCap = rooms.reduce((sum, r) => sum + r.capacity, 0);
    const totalOcc = rooms.reduce((sum, r) => sum + r.currentOccupancy, 0);
    return totalCap > 0 ? Math.round((totalOcc / totalCap) * 100) : 74;
  }, [rooms]);

  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      if (activityFilter === 'incident') return a.type === 'incident';
      if (activityFilter === 'check-in') return a.type === 'check-in';
      return true;
    });
  }, [activityFilter]);

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');

  return (
    <AnimatedPage>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        {/* Editorial Sub-Header & Live Status Banner */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 28,
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
              fontWeight: 600,
              color: palette.textMain,
              marginBottom: 8,
              letterSpacing: '0.04em',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: palette.primary }} />
              GALGOTIAS UNIVERSITY KNOWLEDGE CENTRE (GUKC) • LIVE CONCLAVE
            </div>

            <MaskReveal>
              <h1 style={{
                fontFamily: typography.fontHeading,
                fontSize: 28,
                fontWeight: 700,
                color: palette.textMain,
                letterSpacing: '-0.03em',
                margin: 0,
              }}>
                PULSE Command Centre & Event Brain
              </h1>
            </MaskReveal>

            <p style={{ fontSize: 13, color: palette.textMuted, margin: '4px 0 0' }}>
              Real-time multi-venue telemetry, CP-SAT mathematical solver and living crowd flows.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {butterfly.active ? (
              <Link
                to="/rescue"
                style={{ textDecoration: 'none' }}
              >
                <MagneticButton
                  variant="primary"
                  style={{ background: palette.primary }}
                >
                  <ShieldAlert size={15} />
                  <span>CASCADE ACTIVE • OPEN RESCUE WORKSPACE</span>
                </MagneticButton>
              </Link>
            ) : (
              <MagneticButton
                variant="outline"
                onClick={() => triggerDisruption('inc1')}
              >
                <Zap size={14} color={palette.primary} />
                <span>Trigger Crisis Simulation</span>
              </MagneticButton>
            )}

            <Link
              to="/digital-twin"
              style={{ textDecoration: 'none' }}
            >
              <MagneticButton variant="outline">
                <Compass size={15} color={palette.secondary} />
                <span>3D Digital Twin</span>
              </MagneticButton>
            </Link>
          </div>
        </div>

        {/* Cinematic Animated Timeline Horizon (Choreographed Entrance) */}
        <div style={{
          marginBottom: 28,
          background: palette.bgSecondary,
          borderRadius: 10,
          border: `1px solid ${palette.border}`,
          padding: '14px 20px',
          boxShadow: palette.shadowSoft,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: palette.primary,
                display: 'inline-block',
                boxShadow: '0 0 0 2px rgba(230, 107, 69, 0.25)',
              }} />
              <span style={{ fontFamily: typography.fontMono, fontSize: 11, fontWeight: 700, color: palette.textMain }}>
                GUKC KNOWLEDGE CONCLAVE TIMELINE HORIZON
              </span>
            </div>
            <span style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.primary, fontWeight: 700 }}>
              09:45 CURRENT LIVE WINDOW
            </span>
          </div>

          {/* Progressive Drawing Horizon Line */}
          <div style={{ position: 'relative', height: 4, background: '#EAE5D9', borderRadius: 2, overflow: 'hidden', marginBottom: 14 }}>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(to right, ${palette.secondary}, ${palette.primary})`,
                transformOrigin: 'left',
              }}
            />
          </div>

          {/* Milestone Node Stations */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: typography.fontMono }}>
            {[
              { time: '08:00', label: 'Badge Turnstiles', state: 'done' },
              { time: '09:30', label: 'Keynote (Grand Hall A)', state: 'live' },
              { time: '11:00', label: 'Breakout Sessions', state: 'upcoming' },
              { time: '12:30', label: 'Networking Bistro', state: 'upcoming' },
              { time: '14:00', label: 'Developer Labs', state: 'upcoming' },
              { time: '16:30', label: 'Closing Plenary', state: 'upcoming' },
            ].map((node, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: node.state === 'live' ? 8 : 6,
                  height: node.state === 'live' ? 8 : 6,
                  borderRadius: '50%',
                  background: node.state === 'live' ? palette.primary : node.state === 'done' ? palette.secondary : '#C5BFB2',
                  boxShadow: node.state === 'live' ? '0 0 0 3px rgba(230, 107, 69, 0.3)' : 'none',
                }} />
                <div>
                  <span style={{ color: node.state === 'live' ? palette.primary : palette.textMain, fontWeight: node.state === 'live' ? 700 : 500 }}>
                    {node.time}
                  </span>
                  <span style={{ color: palette.textMuted, marginLeft: 6, fontSize: 10 }}>
                    {node.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Architectural Metric Ledgers with Perspective Tilt & Living Counters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}>
          {/* Card 1: Attendance */}
          <PerspectiveCard>
            <div style={{ padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{
                  fontFamily: typography.fontMono,
                  fontSize: 11,
                  color: palette.textMuted,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  CHECK-IN RATIO
                </span>
                <Users size={16} color={palette.secondary} />
              </div>
              <div style={{
                fontFamily: typography.fontMono,
                fontSize: 32,
                fontWeight: 700,
                color: palette.textMain,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: 6,
              }}>
                <LivingCounter value={eventMetrics.checkedIn} />
                <span style={{ fontSize: 16, color: palette.textMuted, fontWeight: 400 }}> / {eventMetrics.totalAttendees}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: palette.successText }}>
                <span style={{ fontWeight: 600 }}>98.4% Arrived</span>
                <span style={{ color: palette.textMuted }}>• +142 in last hour</span>
              </div>
            </div>
          </PerspectiveCard>

          {/* Card 2: Active Sessions */}
          <PerspectiveCard>
            <div style={{ padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{
                  fontFamily: typography.fontMono,
                  fontSize: 11,
                  color: palette.textMuted,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  LIVE SESSIONS
                </span>
                <Radio size={16} color={palette.primary} />
              </div>
              <div style={{
                fontFamily: typography.fontMono,
                fontSize: 32,
                fontWeight: 700,
                color: palette.textMain,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: 6,
              }}>
                <LivingCounter value={eventMetrics.activeSessions} />
                <span style={{ fontSize: 16, color: palette.textMuted, fontWeight: 400 }}> / {sessions.length} total</span>
              </div>
              <div style={{ fontSize: 12, color: palette.textMuted }}>
                Keynote Hall A, Workshop 1 & 2 live
              </div>
            </div>
          </PerspectiveCard>

          {/* Card 3: Venues & Occupancy */}
          <PerspectiveCard>
            <div style={{ padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{
                  fontFamily: typography.fontMono,
                  fontSize: 11,
                  color: palette.textMuted,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  VENUE OCCUPANCY
                </span>
                <DoorOpen size={16} color={palette.secondary} />
              </div>
              <div style={{
                fontFamily: typography.fontMono,
                fontSize: 32,
                fontWeight: 700,
                color: palette.textMain,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: 6,
              }}>
                <LivingCounter value={avgOccupancy} suffix="%" />
              </div>
              <div style={{ fontSize: 12, color: palette.textMuted }}>
                8 of 10 halls engaged • 2 standby
              </div>
            </div>
          </PerspectiveCard>

          {/* Card 4: Incident Response */}
          <PerspectiveCard style={{ background: status === 'disrupted' ? '#FDF5F2' : undefined, borderColor: status === 'disrupted' ? '#F4C4B5' : undefined }}>
            <div style={{ padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{
                  fontFamily: typography.fontMono,
                  fontSize: 11,
                  color: status === 'disrupted' ? palette.primary : palette.textMuted,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}>
                  DISRUPTION QUEUE
                </span>
                <AlertTriangle size={16} color={status === 'disrupted' ? palette.primary : palette.textMuted} />
              </div>
              <div style={{
                fontFamily: typography.fontMono,
                fontSize: 32,
                fontWeight: 700,
                color: status === 'disrupted' ? palette.primary : palette.textMain,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: 6,
              }}>
                <LivingCounter value={activeIncidents.length} />
                <span style={{ fontSize: 14, color: palette.textMuted, fontWeight: 400 }}> active alerts</span>
              </div>
              <div style={{ fontSize: 12, color: status === 'disrupted' ? palette.primaryHover : palette.textMuted }}>
                Avg solver speed: <strong>4.2s</strong>
              </div>
            </div>
          </PerspectiveCard>
        </div>

        {/* Central Asymmetric Workspace: Event Brain & Universe Toggle */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)',
          gap: 24,
          marginBottom: 32,
        }}>
          {/* Left Column: Event Brain Network / Universe */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{
                  fontFamily: typography.fontHeading,
                  fontSize: 18,
                  fontWeight: 700,
                  color: palette.textMain,
                  margin: 0,
                }}>
                  {centerView === 'brain' ? 'Event Brain Reactive Topology' : 'Live Architectural Event Graph'}
                </h2>
              </div>

              {/* View Switcher */}
              <div style={{
                display: 'flex',
                background: palette.bgSecondary,
                borderRadius: 6,
                padding: 3,
                border: `1px solid ${palette.border}`,
              }}>
                <button
                  onClick={() => setCenterView('brain')}
                  style={{
                    background: centerView === 'brain' ? palette.bgMain : 'transparent',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 10px',
                    fontFamily: typography.fontMono,
                    fontSize: 10,
                    fontWeight: 700,
                    color: centerView === 'brain' ? palette.primary : palette.textMuted,
                    cursor: 'pointer',
                  }}
                >
                  EVENT BRAIN
                </button>
                <button
                  onClick={() => setCenterView('universe')}
                  style={{
                    background: centerView === 'universe' ? palette.bgMain : 'transparent',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 10px',
                    fontFamily: typography.fontMono,
                    fontSize: 10,
                    fontWeight: 700,
                    color: centerView === 'universe' ? palette.secondary : palette.textMuted,
                    cursor: 'pointer',
                  }}
                >
                  VENUE UNIVERSE
                </button>
              </div>
            </div>

            {centerView === 'brain' ? <EventBrain /> : <EventUniverse />}
          </div>

          {/* Right Column: Active Venue Occupancy Ledger */}
          <div style={{
            background: palette.bgSecondary,
            borderRadius: 14,
            border: `1px solid ${palette.border}`,
            boxShadow: palette.shadowSoft,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${palette.border}`,
              background: palette.bgMain,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{
                  fontFamily: typography.fontHeading,
                  fontSize: 15,
                  fontWeight: 700,
                  color: palette.textMain,
                  margin: 0,
                }}>
                  Spatial Venue Utilization
                </h3>
                <p style={{ fontSize: 11, color: palette.textMuted, margin: '2px 0 0' }}>
                  Door turnstile counts vs safe capacities
                </p>
              </div>
              <span style={{
                fontFamily: typography.fontMono,
                fontSize: 10,
                padding: '3px 7px',
                background: palette.bgParchment,
                border: `1px solid ${palette.borderDark}`,
                borderRadius: 4,
                fontWeight: 600,
              }}>
                10 VENUES
              </span>
            </div>

            <div style={{
              flex: 1,
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              overflowY: 'auto',
              maxHeight: 520,
            }}>
              {rooms.slice(0, 7).map((room) => {
                const pct = Math.round((room.currentOccupancy / room.capacity) * 100);
                const isOvercrowded = pct >= 85;
                const isWarning = pct >= 75 && pct < 85;

                const barColor = isOvercrowded
                  ? palette.primary
                  : isWarning
                  ? palette.warning
                  : palette.secondary;

                return (
                  <div key={room.id} style={{
                    padding: 12,
                    borderRadius: 8,
                    background: palette.bgMain,
                    border: `1px solid ${palette.border}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div>
                        <span style={{ fontFamily: typography.fontHeading, fontSize: 13, fontWeight: 600, color: palette.textMain }}>
                          {room.name}
                        </span>
                        <span style={{ fontSize: 11, color: palette.textMuted, marginLeft: 8 }}>
                          Floor {room.floor}
                        </span>
                      </div>
                      <DynamicHeatmapBadge occupancy={room.currentOccupancy} capacity={room.capacity} />
                    </div>

                    {/* Architectural Linear Meter with Spring animation */}
                    <div style={{
                      height: 6,
                      background: '#E6E1D5',
                      borderRadius: 3,
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          background: barColor,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section: Morphing Disruption Warnings & Activity Feed */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)',
          gap: 24,
        }}>
          {/* Active Crisis Signals with Shared-Element Transition (layoutId) */}
          <div style={{
            background: palette.bgSecondary,
            borderRadius: 12,
            border: `1px solid ${palette.border}`,
            padding: 24,
            boxShadow: palette.shadowSoft,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={18} color={palette.primary} />
                <h3 style={{
                  fontFamily: typography.fontHeading,
                  fontSize: 16,
                  fontWeight: 700,
                  color: palette.textMain,
                  margin: 0,
                }}>
                  Active Disruption Alerts
                </h3>
              </div>
              <Link
                to="/rescue"
                style={{
                  textDecoration: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  color: palette.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>Launch Solver</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeIncidents.slice(0, 3).map((inc) => (
                <motion.div
                  key={inc.id}
                  layoutId={`incident-card-${inc.id}`}
                  style={{
                    padding: 14,
                    borderRadius: 8,
                    background: '#FDF5F2',
                    border: '1px solid #F4C4B5',
                    cursor: 'pointer',
                  }}
                >
                  <Link to="/rescue" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{
                        fontFamily: typography.fontMono,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: palette.primary,
                        color: '#FFFFFF',
                        textTransform: 'uppercase',
                      }}>
                        {inc.severity}
                      </span>
                      <span style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>
                        {inc.reportedAt ? new Date(inc.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:15'}
                      </span>
                    </div>
                    <h4 style={{ fontFamily: typography.fontHeading, fontSize: 14, fontWeight: 600, color: palette.textMain, margin: '4px 0 2px' }}>
                      {inc.title}
                    </h4>
                    <p style={{ fontSize: 12, color: palette.textMuted, margin: 0, lineHeight: 1.4 }}>
                      {inc.description}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Operational Audit Feed */}
          <div style={{
            background: palette.bgSecondary,
            borderRadius: 12,
            border: `1px solid ${palette.border}`,
            padding: 24,
            boxShadow: palette.shadowSoft,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={18} color={palette.secondary} />
                <h3 style={{
                  fontFamily: typography.fontHeading,
                  fontSize: 16,
                  fontWeight: 700,
                  color: palette.textMain,
                  margin: 0,
                }}>
                  Operational Audit Feed
                </h3>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: 4 }}>
                {(['all', 'incident', 'check-in'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActivityFilter(tab)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: `1px solid ${activityFilter === tab ? palette.borderDark : 'transparent'}`,
                      background: activityFilter === tab ? palette.bgMain : 'transparent',
                      color: activityFilter === tab ? palette.textMain : palette.textMuted,
                      fontSize: 11,
                      fontFamily: typography.fontMono,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 260, overflowY: 'auto' }}>
              {filteredActivities.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: palette.bgMain,
                    border: `1px solid ${palette.border}`,
                  }}
                >
                  <span style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: item.type === 'incident' ? palette.primary : palette.secondary,
                    marginTop: 6,
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: palette.textMain, fontWeight: 500 }}>
                      {item.message}
                    </div>
                    <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted, marginTop: 2 }}>
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • DISPATCH AGENT
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
