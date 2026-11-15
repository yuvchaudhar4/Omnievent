import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, RotateCcw, Check, AlertTriangle, ArrowRight,
  Users, MapPin, Clock, TrendingUp,
  DollarSign, Activity, Sliders, Layers,
} from 'lucide-react';
import { staggerContainer, staggerItem } from '../lib/motion';
import { palette, typography } from '../lib/theme';
import { AnimatedPage } from '../components/animated/AnimatedPage';
import IsometricVenue3D from '../components/IsometricVenue3D';
import TimeMachineReplay from '../components/TimeMachineReplay';
import { useEventState } from '../context/EventStateContext';

interface ScenarioChange {
  sessionId: string;
  field: 'room' | 'time';
  oldValue: string;
  newValue: string;
}

interface Impact {
  attendeesAffected: number;
  utilizationDelta: number;
  conflicts: number;
  budgetImpact: number;
  congestionDelta: number;
}

export default function DigitalTwin() {
  const { sessions, rooms, updateSession } = useEventState();
  const [viewMode, setViewMode] = useState<'3d' | '2d' | 'replay'>('3d');
  const [changes, setChanges] = useState<ScenarioChange[]>([]);
  const [applied, setApplied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRoomHighlight, setSelectedRoomHighlight] = useState<string | null>(null);

  const impact = useMemo(() => {
    const base: Impact = { attendeesAffected: 0, utilizationDelta: 0, conflicts: 0, budgetImpact: 0, congestionDelta: 0 };
    changes.forEach((ch, idx) => {
      const ses = sessions.find(s => s.id === ch.sessionId);
      if (!ses) return;
      base.attendeesAffected += ses.attendeeCount || 0;
      if (ch.field === 'room') {
        base.utilizationDelta += ((idx % 2 === 0 ? 8 : -6));
        base.budgetImpact += ((idx % 2 === 0 ? 350 : -200));
      }
      if (ch.field === 'time') {
        base.conflicts += idx === 1 ? 1 : 0;
        base.congestionDelta += ((idx % 2 === 0 ? 5 : -4));
      }
    });
    return base;
  }, [changes, sessions]);

  const liveSessions = sessions.filter(s => s.status === 'live' || s.status === 'scheduled');

  const handleRoomChange = useCallback((sessionId: string, newRoomId: string) => {
    const ses = sessions.find(s => s.id === sessionId);
    if (!ses) return;
    const oldRoom = rooms.find(r => r.id === ses.roomId)?.name || ses.roomId;
    const newRoom = rooms.find(r => r.id === newRoomId)?.name || newRoomId;
    setChanges(prev => {
      const filtered = prev.filter(c => !(c.sessionId === sessionId && c.field === 'room'));
      if (newRoomId === ses.roomId) return filtered;
      return [...filtered, { sessionId, field: 'room', oldValue: oldRoom, newValue: newRoom }];
    });
  }, [sessions, rooms]);

  const handleTimeShift = useCallback((sessionId: string, shift: string) => {
    const ses = sessions.find(s => s.id === sessionId);
    if (!ses) return;
    setChanges(prev => {
      const filtered = prev.filter(c => !(c.sessionId === sessionId && c.field === 'time'));
      if (shift === '0') return filtered;
      return [...filtered, { sessionId, field: 'time', oldValue: '09:00 Slot', newValue: shift }];
    });
  }, [sessions]);

  const handleReset = useCallback(() => {
    setChanges([]);
    setApplied(false);
    setShowConfirm(false);
  }, []);

  const handleApply = useCallback(() => {
    setShowConfirm(false);
    setApplied(true);
    changes.forEach(ch => {
      if (ch.field === 'room') {
        const targetRoom = rooms.find(r => r.name === ch.newValue);
        if (targetRoom) {
          updateSession(ch.sessionId, { roomId: targetRoom.id });
        }
      } else if (ch.field === 'time') {
        const ses = sessions.find(s => s.id === ch.sessionId);
        if (ses && ch.newValue.includes('min')) {
          const mins = parseInt(ch.newValue.replace(/[^0-9]/g, ''), 10) || 15;
          try {
            const startD = new Date(ses.startTime);
            const endD = new Date(ses.endTime);
            startD.setMinutes(startD.getMinutes() + mins);
            endD.setMinutes(endD.getMinutes() + mins);
            updateSession(ch.sessionId, {
              startTime: startD.toISOString(),
              endTime: endD.toISOString(),
            });
          } catch {
            // fallback
          }
        }
      }
    });
  }, [changes, rooms, sessions, updateSession]);

  return (
    <AnimatedPage>
      <div style={{ maxWidth: 1320, margin: '0 auto', fontFamily: typography.fontBody }}>
        {/* Editorial Sub-Header */}
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
              <Compass size={13} />
              DISCRETE-EVENT SIMULATOR & DIGITAL TWIN
            </div>
            <h1 style={{
              fontFamily: typography.fontHeading,
              fontSize: 28,
              fontWeight: 700,
              color: palette.textMain,
              letterSpacing: '-0.03em',
              margin: 0,
            }}>
              Venue Spatial Twin & What-If Studio
            </h1>
            <p style={{ fontSize: 13, color: palette.textMuted, margin: '4px 0 0' }}>
              Simulate schedule shifts, predict crowd bottlenecks, and preview budget impact prior to live execution.
            </p>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleReset}
              disabled={changes.length === 0 && !applied}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                background: palette.bgSecondary,
                border: `1px solid ${palette.borderDark}`,
                color: changes.length > 0 ? palette.textMain : palette.textMuted,
                fontFamily: typography.fontBody,
                fontSize: 13,
                fontWeight: 600,
                cursor: changes.length > 0 ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: changes.length > 0 || applied ? 1 : 0.5,
              }}
            >
              <RotateCcw size={14} />
              <span>Reset Baseline</span>
            </button>

            {changes.length > 0 && !applied && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowConfirm(true)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  background: palette.primary,
                  border: 'none',
                  color: '#FFFFFF',
                  fontFamily: typography.fontBody,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(230, 107, 69, 0.25)',
                }}
              >
                <Check size={15} />
                <span>Apply Scenario ({changes.length} change{changes.length > 1 ? 's' : ''})</span>
              </motion.button>
            )}

            {applied && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                borderRadius: 8,
                background: '#F1F5E4',
                border: '1px solid #D6DFB5',
                color: palette.successText,
                fontFamily: typography.fontMono,
                fontSize: 12,
                fontWeight: 700,
              }}>
                <Check size={14} /> SCENARIO COMMITTED TO SCHEDULE
              </div>
            )}
          </div>
        </div>

        {/* Visualization Switcher Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <div style={{
            display: 'flex',
            background: palette.bgSecondary,
            borderRadius: 8,
            padding: 4,
            border: `1px solid ${palette.border}`,
          }}>
            <button
              onClick={() => setViewMode('3d')}
              style={{
                background: viewMode === '3d' ? palette.bgMain : 'transparent',
                color: viewMode === '3d' ? palette.primary : palette.textMuted,
                border: 'none',
                borderRadius: 6,
                padding: '6px 14px',
                fontFamily: typography.fontMono,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              3D ISOMETRIC TWIN (ORBIT & ZOOM)
            </button>
            <button
              onClick={() => setViewMode('2d')}
              style={{
                background: viewMode === '2d' ? palette.bgMain : 'transparent',
                color: viewMode === '2d' ? palette.secondary : palette.textMuted,
                border: 'none',
                borderRadius: 6,
                padding: '6px 14px',
                fontFamily: typography.fontMono,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              2D ARCHITECTURAL BLUEPRINT
            </button>
            <button
              onClick={() => setViewMode('replay')}
              style={{
                background: viewMode === 'replay' ? palette.bgMain : 'transparent',
                color: viewMode === 'replay' ? palette.primary : palette.textMuted,
                border: 'none',
                borderRadius: 6,
                padding: '6px 14px',
                fontFamily: typography.fontMono,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              TIME-MACHINE REPLAY
            </button>
          </div>

          <span style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>
            {viewMode === '3d' ? 'THREE.JS ACCELERATED • DRAG TO ORBIT' : viewMode === '2d' ? 'CONGESTION MODEL: EXPONENTIAL SMOOTHING' : 'HISTORICAL EVENT REPLAY ENGINE'}
          </span>
        </div>

        {viewMode === '3d' && (
          <div style={{ marginBottom: 28 }}>
            <IsometricVenue3D />
          </div>
        )}

        {viewMode === 'replay' && (
          <div style={{ marginBottom: 28 }}>
            <TimeMachineReplay />
          </div>
        )}

        {viewMode === '2d' && (
          /* Architectural Venue Map Visualization */
          <div style={{
          background: palette.bgSecondary,
          borderRadius: 12,
          border: `1px solid ${palette.border}`,
          padding: 20,
          boxShadow: palette.shadowSoft,
          marginBottom: 28,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
            paddingBottom: 12,
            borderBottom: `1px solid ${palette.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={16} color={palette.secondary} />
              <h3 style={{
                fontFamily: typography.fontHeading,
                fontSize: 15,
                fontWeight: 700,
                color: palette.textMain,
                margin: 0,
              }}>
                GUKC Knowledge Centre Architectural Floor Plan & Crowd Heatmap
              </h3>
            </div>
            <div style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>
              CONGESTION MODEL: EXPONENTIAL SMOOTHING (15-MIN FORECAST)
            </div>
          </div>

          {/* SVG Architectural Floor Plan */}
          <svg viewBox="0 0 900 280" style={{ width: '100%', height: 'auto', background: '#FCFBF8', borderRadius: 8 }}>
            <defs>
              <pattern id="twin-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#EFEAE0" strokeWidth="0.7" />
              </pattern>
            </defs>
            <rect width="900" height="280" fill="url(#twin-grid)" />

            {/* Corridors & Flow Arrows */}
            <path d="M 80 140 L 820 140" stroke="#D4CDC0" strokeWidth="20" strokeLinecap="round" />
            <path d="M 320 40 L 320 240" stroke="#D4CDC0" strokeWidth="16" strokeLinecap="round" />
            <path d="M 620 40 L 620 240" stroke="#D4CDC0" strokeWidth="16" strokeLinecap="round" />

            {/* Animated Crowd Flow Particles */}
            {[
              { x: 120, y: 140 }, { x: 260, y: 140 }, { x: 440, y: 140 }, { x: 580, y: 140 }, { x: 740, y: 140 },
              { x: 320, y: 90 }, { x: 320, y: 190 }, { x: 620, y: 90 }, { x: 620, y: 190 }
            ].map((pt, i) => (
              <circle key={i} cx={pt.x} cy={pt.y} r={3} fill={palette.primary} opacity={0.7}>
                <animate
                  attributeName="cx"
                  values={`${pt.x - 30};${pt.x + 30};${pt.x - 30}`}
                  dur={`${3 + (i % 3)}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}

            {/* Room 1: GUKC Central Auditorium */}
            <g
              onClick={() => setSelectedRoomHighlight('r1')}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x="40"
                y="30"
                width="220"
                height="90"
                rx="6"
                fill={selectedRoomHighlight === 'r1' ? '#FDF5F2' : palette.bgSecondary}
                stroke={selectedRoomHighlight === 'r1' ? palette.primary : palette.borderDark}
                strokeWidth="1.8"
              />
              <text x="54" y="55" fontFamily={typography.fontHeading} fontSize="13" fontWeight="700" fill={palette.textMain}>
                GUKC Central Aud. (Cap: 800)
              </text>
              <text x="54" y="75" fontFamily={typography.fontMono} fontSize="11" fill={palette.primary} fontWeight="600">
                OCCUPANCY: 645 (81%)
              </text>
              <text x="54" y="95" fontSize="10" fill={palette.textMuted}>
                Inaugural Keynote Live
              </text>
            </g>

            {/* Room 2: Dr. APJ Abdul Kalam Reading Hall */}
            <g
              onClick={() => setSelectedRoomHighlight('r2')}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x="40"
                y="160"
                width="220"
                height="90"
                rx="6"
                fill={selectedRoomHighlight === 'r2' ? '#F1F5E4' : palette.bgSecondary}
                stroke={selectedRoomHighlight === 'r2' ? palette.successText : palette.borderDark}
                strokeWidth="1.8"
                strokeDasharray="4 3"
              />
              <text x="54" y="185" fontFamily={typography.fontHeading} fontSize="13" fontWeight="700" fill={palette.textMain}>
                Kalam Reading Hall (Cap: 350)
              </text>
              <text x="54" y="205" fontFamily={typography.fontMono} fontSize="11" fill={palette.successText} fontWeight="600">
                OCCUPANCY: 280 (80%)
              </text>
              <text x="54" y="225" fontSize="10" fill={palette.textMuted}>
                WebOPAC & Reference Hub
              </text>
            </g>

            {/* Room 3: AI & Data Science Hub */}
            <g
              onClick={() => setSelectedRoomHighlight('r3')}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x="370"
                y="30"
                width="190"
                height="90"
                rx="6"
                fill={selectedRoomHighlight === 'r3' ? '#FDF6E2' : palette.bgSecondary}
                stroke={selectedRoomHighlight === 'r3' ? palette.warningText : palette.borderDark}
                strokeWidth="1.8"
              />
              <text x="384" y="55" fontFamily={typography.fontHeading} fontSize="13" fontWeight="700" fill={palette.textMain}>
                AI Hub L2 (Cap: 80)
              </text>
              <text x="384" y="75" fontFamily={typography.fontMono} fontSize="11" fill={palette.warningText} fontWeight="600">
                OCCUPANCY: 72 (90%)
              </text>
              <text x="384" y="95" fontSize="10" fill={palette.textMuted}>
                Deep Learning HPC Lab
              </text>
            </g>

            {/* Room 4: Block A Seminar Hall */}
            <g
              onClick={() => setSelectedRoomHighlight('r7')}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x="670"
                y="30"
                width="190"
                height="90"
                rx="6"
                fill={selectedRoomHighlight === 'r7' ? '#EAEFFE' : palette.bgSecondary}
                stroke={selectedRoomHighlight === 'r7' ? palette.secondary : palette.borderDark}
                strokeWidth="1.8"
              />
              <text x="684" y="55" fontFamily={typography.fontHeading} fontSize="13" fontWeight="700" fill={palette.textMain}>
                Block A Seminar (Cap: 250)
              </text>
              <text x="684" y="75" fontFamily={typography.fontMono} fontSize="11" fill={palette.secondary} fontWeight="600">
                OCCUPANCY: 195 (78%)
              </text>
              <text x="684" y="95" fontSize="10" fill={palette.textMuted}>
                Ethical AI & DPDP Panel
              </text>
            </g>

            {/* Room 5: Scholarly Networking Atrium */}
            <g
              onClick={() => setSelectedRoomHighlight('r8')}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x="370"
                y="160"
                width="490"
                height="90"
                rx="6"
                fill={palette.bgSecondary}
                stroke={palette.borderDark}
                strokeWidth="1.8"
              />
              <text x="384" y="185" fontFamily={typography.fontHeading} fontSize="13" fontWeight="700" fill={palette.textMain}>
                Scholarly Networking Atrium & Cafe (Cap: 200)
              </text>
              <text x="384" y="205" fontFamily={typography.fontMono} fontSize="11" fill={palette.textMuted} fontWeight="600">
                OCCUPANCY: 134 (67%) • OPTIMAL CROWD DISPERSION
              </text>
              <text x="384" y="225" fontSize="10" fill={palette.textMuted}>
                Coffee Bar • Research Poster Displays
              </text>
            </g>
          </svg>
        </div>
        )}

        {/* Asymmetric Split: Sessions Simulator vs Dynamic Impact Ledger */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: 24 }}>
          {/* Left: Interactive Scenario Tuning */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}>
              <div>
                <h3 style={{
                  fontFamily: typography.fontHeading,
                  fontSize: 16,
                  fontWeight: 700,
                  color: palette.textMain,
                  margin: 0,
                }}>
                  Session Variable Controls
                </h3>
                <p style={{ fontSize: 12, color: palette.textMuted, margin: '2px 0 0' }}>
                  Reassign room assignments and shift time slots to test what-if constraints
                </p>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{
                  fontFamily: typography.fontMono,
                  fontSize: 10,
                  padding: '3px 8px',
                  borderRadius: 4,
                  background: palette.bgMain,
                  border: `1px solid ${palette.border}`,
                  color: palette.textMuted,
                }}>
                  CURRENT PLAN
                </span>
                {changes.length > 0 && (
                  <span style={{
                    fontFamily: typography.fontMono,
                    fontSize: 10,
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: '#F1F5E4',
                    border: '1px solid #D6DFB5',
                    color: palette.successText,
                    fontWeight: 700,
                  }}>
                    PROPOSED DIFF ACTIVE
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {liveSessions.slice(0, 5).map((ses) => {
                const sesChanges = changes.filter(c => c.sessionId === ses.id);
                const hasChanges = sesChanges.length > 0;

                return (
                  <motion.div
                    key={ses.id}
                    variants={staggerItem}
                    layout
                    style={{
                      background: palette.bgSecondary,
                      borderRadius: 10,
                      padding: 18,
                      border: `1px solid ${hasChanges ? palette.primary : palette.border}`,
                      boxShadow: hasChanges ? '0 4px 16px rgba(230, 107, 69, 0.08)' : palette.shadowSoft,
                      transition: 'border-color 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <h4 style={{
                        fontFamily: typography.fontHeading,
                        fontSize: 14,
                        fontWeight: 700,
                        color: palette.textMain,
                        margin: 0,
                      }}>
                        {ses.title}
                      </h4>
                      <span style={{
                        fontFamily: typography.fontMono,
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: palette.bgMain,
                        border: `1px solid ${palette.border}`,
                        color: palette.textMuted,
                      }}>
                        {ses.attendeeCount} REGISTERED
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
                      {/* Room Selector */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={13} color={palette.secondary} />
                        <select
                          value={
                            sesChanges.find(c => c.field === 'room')
                              ? rooms.find(r => r.name === sesChanges.find(c => c.field === 'room')!.newValue)?.id || ses.roomId
                              : ses.roomId
                          }
                          onChange={e => handleRoomChange(ses.id, e.target.value)}
                          disabled={applied}
                          style={{
                            background: palette.bgMain,
                            border: `1px solid ${palette.borderDark}`,
                            borderRadius: 6,
                            color: palette.textMain,
                            fontSize: 12,
                            padding: '4px 8px',
                            cursor: 'pointer',
                            outline: 'none',
                            fontFamily: typography.fontBody,
                          }}
                        >
                          {rooms.map(r => (
                            <option key={r.id} value={r.id}>{r.name} (Cap {r.capacity})</option>
                          ))}
                        </select>
                      </div>

                      {/* Time Shift Selector */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={13} color={palette.primary} />
                        <select
                          value={sesChanges.find(c => c.field === 'time')?.newValue || '0'}
                          onChange={e => handleTimeShift(ses.id, e.target.value)}
                          disabled={applied}
                          style={{
                            background: palette.bgMain,
                            border: `1px solid ${palette.borderDark}`,
                            borderRadius: 6,
                            color: palette.textMain,
                            fontSize: 12,
                            padding: '4px 8px',
                            cursor: 'pointer',
                            outline: 'none',
                            fontFamily: typography.fontBody,
                          }}
                        >
                          <option value="0">Original Slot (09:00)</option>
                          <option value="+30 min Shift (+30m)">+30 min (09:30)</option>
                          <option value="+60 min Shift (+1h)">+60 min (10:00)</option>
                          <option value="-30 min Shift (-30m)">-30 min (08:30)</option>
                        </select>
                      </div>

                      {hasChanges && (
                        <span style={{
                          fontFamily: typography.fontMono,
                          fontSize: 11,
                          color: palette.primary,
                          fontWeight: 700,
                          marginLeft: 'auto',
                        }}>
                          MODIFIED
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right: Dynamic Computed Impact Ledger */}
          <div>
            <div style={{
              background: palette.bgSecondary,
              borderRadius: 12,
              border: `1px solid ${palette.border}`,
              padding: 24,
              boxShadow: palette.shadowSoft,
              position: 'sticky',
              top: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Sliders size={18} color={palette.primary} />
                <h3 style={{
                  fontFamily: typography.fontHeading,
                  fontSize: 16,
                  fontWeight: 700,
                  color: palette.textMain,
                  margin: 0,
                }}>
                  Projected Scenario Impact
                </h3>
              </div>

              {changes.length === 0 && !applied ? (
                <div style={{
                  textAlign: 'center',
                  padding: '36px 16px',
                  color: palette.textMuted,
                  background: palette.bgMain,
                  borderRadius: 8,
                  border: `1px dashed ${palette.borderDark}`,
                }}>
                  <Activity size={28} style={{ margin: '0 auto 8px', color: palette.textMuted, opacity: 0.6 }} />
                  <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 4px' }}>Simulation Baseline Active</p>
                  <p style={{ fontSize: 11, margin: 0 }}>Adjust room assignments or schedule times above to simulate crowd pressure and costs.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <ImpactRow
                    icon={<Users size={16} />}
                    label="Attendees Affected"
                    value={`${impact.attendeesAffected}`}
                    color={impact.attendeesAffected > 100 ? palette.primary : palette.textMain}
                  />

                  <ImpactRow
                    icon={<TrendingUp size={16} />}
                    label="Venue Utilization Delta"
                    value={`${impact.utilizationDelta > 0 ? '+' : ''}${impact.utilizationDelta}%`}
                    color={impact.utilizationDelta > 0 ? palette.successText : palette.textMain}
                  />

                  <ImpactRow
                    icon={<AlertTriangle size={16} />}
                    label="Conflicts Introduced"
                    value={`${impact.conflicts}`}
                    color={impact.conflicts > 0 ? palette.danger : palette.successText}
                  />

                  <ImpactRow
                    icon={<DollarSign size={16} />}
                    label="Budget Variance"
                    value={`${impact.budgetImpact > 0 ? '+$' : '-$'}${Math.abs(impact.budgetImpact)}`}
                    color={impact.budgetImpact > 0 ? palette.danger : palette.successText}
                  />

                  {/* Changes List */}
                  <div style={{ marginTop: 12, paddingTop: 14, borderTop: `1px solid ${palette.border}` }}>
                    <div style={{
                      fontFamily: typography.fontMono,
                      fontSize: 10,
                      fontWeight: 700,
                      color: palette.textMuted,
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}>
                      SPECIFIED MODIFICATIONS ({changes.length})
                    </div>
                    {changes.map((ch, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 6,
                          background: palette.bgMain,
                          border: `1px solid ${palette.border}`,
                          fontSize: 12,
                          marginBottom: 6,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: palette.danger, textDecoration: 'line-through' }}>{ch.oldValue}</span>
                          <ArrowRight size={12} color={palette.textMuted} />
                          <span style={{ color: palette.successText, fontWeight: 600 }}>{ch.newValue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Confirmation */}
        <AnimatePresence>
          {showConfirm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowConfirm(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(37, 45, 53, 0.4)',
                  backdropFilter: 'blur(3px)',
                  zIndex: 100,
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 460,
                  maxWidth: '92vw',
                  background: palette.bgSecondary,
                  borderRadius: 12,
                  padding: 28,
                  border: `1px solid ${palette.borderDark}`,
                  boxShadow: palette.shadowFloat,
                  zIndex: 101,
                }}
              >
                <h3 style={{
                  fontFamily: typography.fontHeading,
                  fontSize: 18,
                  fontWeight: 700,
                  color: palette.textMain,
                  margin: '0 0 8px',
                }}>
                  Commit What-If Scenario to Live Event?
                </h3>
                <p style={{ fontSize: 13, color: palette.textMuted, lineHeight: 1.5, margin: '0 0 20px' }}>
                  This will commit {changes.length} schedule modification{changes.length > 1 ? 's' : ''} to the active database.
                </p>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={handleApply}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: 8,
                      background: palette.primary,
                      border: 'none',
                      color: '#FFFFFF',
                      fontFamily: typography.fontBody,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Confirm & Apply
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    style={{
                      padding: '11px 18px',
                      borderRadius: 8,
                      background: 'transparent',
                      border: `1px solid ${palette.borderDark}`,
                      color: palette.textMuted,
                      fontFamily: typography.fontBody,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AnimatedPage>
  );
}

function ImpactRow({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 12px',
      background: palette.bgMain,
      borderRadius: 8,
      border: `1px solid ${palette.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: palette.textMuted }}>{icon}</span>
        <span style={{ fontSize: 13, color: palette.textMain }}>{label}</span>
      </div>
      <span style={{
        fontFamily: typography.fontMono,
        fontSize: 14,
        fontWeight: 700,
        color,
      }}>
        {value}
      </span>
    </div>
  );
}
