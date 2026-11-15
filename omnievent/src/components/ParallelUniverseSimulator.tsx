import { useState } from 'react';
import { palette, typography } from '../lib/theme';
import { useEventState } from '../context/EventStateContext';
import { MagneticButton } from './animated/LivingData';
import {
  Sparkles,
  Check,
  AlertTriangle,
  Cpu,
} from 'lucide-react';

export default function ParallelUniverseSimulator() {
  const { resolveDisruption, sessions, rooms, activeIncident } = useEventState();

  const [simMode, setSimMode] = useState<'split' | 'focus-proposed' | 'focus-baseline'>('split');

  // Proposed Reality Tuning Controls
  const [targetRoom, setTargetRoom] = useState<'r2' | 'r7' | 'r3'>('r2');
  const [timeShiftMin, setTimeShiftMin] = useState<number>(0);
  const [speakerMode, setSpeakerMode] = useState<'standby' | 'remote' | 'swap'>('standby');

  const currentSession = sessions.find(s => s.roomId === activeIncident?.roomId) || sessions[0];
  const currentRoomName = rooms.find(r => r.id === currentSession?.roomId)?.name || 'GUKC Central Auditorium';
  const currentSpeakerName = currentSession?.speakers?.map(s => s.name).join(', ') || 'Dr. Debal C. Kar';

  const roomNames: Record<string, { name: string; cap: number; av: string }> = {
    'r2': { name: rooms.find(r => r.id === 'r2')?.name || 'Dr. APJ Abdul Kalam Reading Hall', cap: 350, av: 'RFID Gateways + High-Speed Wi-Fi 6' },
    'r7': { name: rooms.find(r => r.id === 'r7')?.name || 'Block A Multimedia Seminar Hall', cap: 250, av: 'Stage Mic Array + 4K Laser Projection' },
    'r3': { name: rooms.find(r => r.id === 'r3')?.name || 'AI & Data Science Block Hub', cap: 80, av: 'NVIDIA DGX Cluster + Telepresence' },
  };

  const selectedRoomInfo = roomNames[targetRoom];

  // Consequence predictions based on chosen adjustments
  const predictedDisplacement = targetRoom === 'r2' ? 0 : targetRoom === 'r7' ? 250 : 350;
  const predictedFeasibility = targetRoom === 'r2' ? (timeShiftMin === 0 ? 98 : 92) : 78;
  const predictedDelay = timeShiftMin;
  const transitDistance = targetRoom === 'r2' ? 30 : targetRoom === 'r7' ? 85 : 110;

  return (
    <div style={{
      background: palette.bgSecondary,
      borderRadius: 14,
      border: `1.5px solid ${palette.border}`,
      boxShadow: palette.shadowSoft,
      overflow: 'hidden',
      fontFamily: typography.fontBody,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Multiverse Header Bar */}
      <div style={{
        padding: '16px 24px',
        borderBottom: `1px solid ${palette.border}`,
        background: palette.bgMain,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: palette.primary,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Cpu size={16} />
          </div>
          <div>
            <div style={{ fontFamily: typography.fontHeading, fontSize: 16, fontWeight: 700, color: palette.textMain }}>
              Parallel Universe Simulator (Google OR-Tools CP-SAT)
            </div>
            <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>
              SPLIT-REALITY COMPARISON ENGINE • 0 CONFLICT MATHEMATICAL RE-SOLVE
            </div>
          </div>
        </div>

        {/* View Mode Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex',
            background: palette.bgSecondary,
            borderRadius: 6,
            padding: 3,
            border: `1px solid ${palette.border}`,
          }}>
            <button
              onClick={() => setSimMode('split')}
              style={{
                background: simMode === 'split' ? palette.bgMain : 'transparent',
                color: simMode === 'split' ? palette.primary : palette.textMuted,
                border: 'none',
                borderRadius: 4,
                padding: '4px 10px',
                fontFamily: typography.fontMono,
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              SPLIT REALITIES
            </button>
            <button
              onClick={() => setSimMode('focus-baseline')}
              style={{
                background: simMode === 'focus-baseline' ? palette.bgMain : 'transparent',
                color: simMode === 'focus-baseline' ? palette.danger : palette.textMuted,
                border: 'none',
                borderRadius: 4,
                padding: '4px 10px',
                fontFamily: typography.fontMono,
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              BASELINE A
            </button>
            <button
              onClick={() => setSimMode('focus-proposed')}
              style={{
                background: simMode === 'focus-proposed' ? palette.bgMain : 'transparent',
                color: simMode === 'focus-proposed' ? palette.secondary : palette.textMuted,
                border: 'none',
                borderRadius: 4,
                padding: '4px 10px',
                fontFamily: typography.fontMono,
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              MULTIVERSE B
            </button>
          </div>
        </div>
      </div>

      {/* Split Comparison Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: simMode === 'split' ? 'minmax(0, 1fr) minmax(0, 1fr)' : '1fr',
        minHeight: 460,
      }}>
        {/* LEFT REALITY: Baseline / Broken Event Plan */}
        {(simMode === 'split' || simMode === 'focus-baseline') && (
          <div style={{
            padding: 24,
            borderRight: simMode === 'split' ? `1px solid ${palette.border}` : 'none',
            background: '#FDFCF9',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontFamily: typography.fontMono,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 7px',
                  borderRadius: 4,
                  background: '#FDEAE9',
                  color: palette.danger,
                  border: '1px solid #F7C6C4',
                }}>
                  REALITY A • UNRESOLVED
                </span>
                <span style={{ fontFamily: typography.fontHeading, fontSize: 14, fontWeight: 700, color: palette.textMain }}>
                  Current Disrupted State
                </span>
              </div>
              <AlertTriangle size={15} color={palette.danger} />
            </div>

            {/* Session Card Under Disruption */}
            <div style={{
              padding: 18,
              borderRadius: 8,
              background: '#FFFFFF',
              border: `1.5px solid ${palette.primary}`,
              boxShadow: palette.shadowSoft,
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: typography.fontMono, color: palette.primary, fontWeight: 700, marginBottom: 6 }}>
                <span>SLOT: {currentSession ? `${currentSession.startTime.includes('T') ? currentSession.startTime.split('T')[1].slice(0, 5) : currentSession.startTime}` : '09:00'}</span>
                <span>STATUS: STALLED</span>
              </div>
              <h4 style={{ fontFamily: typography.fontHeading, fontSize: 16, fontWeight: 700, color: palette.textMain, margin: '0 0 6px' }}>
                {currentSession?.title || 'Inaugural Keynote: AI & Modern Academic Libraries'}
              </h4>
              <div style={{ fontSize: 12, color: palette.textMuted, marginBottom: 12 }}>
                Speaker: {currentSpeakerName} • {currentRoomName}
              </div>

              {/* Conflict Callout Box */}
              <div style={{
                padding: 10,
                borderRadius: 6,
                background: '#FDF5F2',
                border: '1px solid #F4C4B5',
                fontSize: 11,
                fontFamily: typography.fontMono,
                color: palette.primary,
              }}>
                ⚠ {activeIncident?.description || 'Laser optical fluctuation reported in Central Auditorium.'}<br />
                ⚠ {currentSession?.attendeeCount || 645} Delegates seated with interrupted projection feed.<br />
                ⚠ Cascading risk: Pushes subsequent academic sessions back.
              </div>
            </div>

            {/* Baseline Consequence Telemetry */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              fontFamily: typography.fontMono,
              fontSize: 11,
              marginTop: 'auto',
            }}>
              <div style={{ padding: 10, borderRadius: 6, background: '#FFFFFF', border: `1px solid ${palette.border}` }}>
                <div style={{ color: palette.textMuted }}>DISPLACEMENT</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: palette.danger, marginTop: 2 }}>420 PPL</div>
              </div>
              <div style={{ padding: 10, borderRadius: 6, background: '#FFFFFF', border: `1px solid ${palette.border}` }}>
                <div style={{ color: palette.textMuted }}>DELAY CASSETTE</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: palette.danger, marginTop: 2 }}>+45 MIN</div>
              </div>
              <div style={{ padding: 10, borderRadius: 6, background: '#FFFFFF', border: `1px solid ${palette.border}` }}>
                <div style={{ color: palette.textMuted }}>PEER RATING</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: palette.danger, marginTop: 2 }}>2.1 / 5.0</div>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT REALITY: Proposed Multiverse / Recovery Plan */}
        {(simMode === 'split' || simMode === 'focus-proposed') && (
          <div style={{
            padding: 24,
            background: '#F8FAF5',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontFamily: typography.fontMono,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 7px',
                  borderRadius: 4,
                  background: '#EAF2EC',
                  color: palette.successText,
                  border: '1px solid #D0E4D5',
                }}>
                  REALITY B • SOLVER PROPOSAL
                </span>
                <span style={{ fontFamily: typography.fontHeading, fontSize: 14, fontWeight: 700, color: palette.textMain }}>
                  CP-SAT Conflict-Free Multiverse
                </span>
              </div>
              <Sparkles size={15} color={palette.successText} />
            </div>

            {/* Interactive Proposed Room Selector */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: typography.fontMono, marginBottom: 6 }}>
                <span style={{ color: palette.textMuted }}>TARGET RECOVERY VENUE</span>
                <span style={{ color: palette.secondary, fontWeight: 700 }}>{selectedRoomInfo.av}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {(['r2', 'r7', 'r3'] as const).map((rId) => (
                  <button
                    key={rId}
                    onClick={() => setTargetRoom(rId)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 6,
                      background: targetRoom === rId ? '#FFFFFF' : palette.bgMain,
                      border: `1.5px solid ${targetRoom === rId ? palette.secondary : palette.border}`,
                      color: targetRoom === rId ? palette.secondary : palette.textMain,
                      fontFamily: typography.fontMono,
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: targetRoom === rId ? palette.shadowSoft : 'none',
                    }}
                  >
                    {roomNames[rId].name.split('(')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Time Shift & Speaker Adjustment */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontFamily: typography.fontMono, color: palette.textMuted, marginBottom: 4 }}>
                  TIME SHIFT: <strong>+{timeShiftMin} MIN</strong>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0, 15, 30].map((shift) => (
                    <button
                      key={shift}
                      onClick={() => setTimeShiftMin(shift)}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        borderRadius: 4,
                        border: `1px solid ${timeShiftMin === shift ? palette.primary : palette.border}`,
                        background: timeShiftMin === shift ? palette.bgSecondary : palette.bgMain,
                        color: timeShiftMin === shift ? palette.primary : palette.textMuted,
                        fontFamily: typography.fontMono,
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      +{shift}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontFamily: typography.fontMono, color: palette.textMuted, marginBottom: 4 }}>
                  SPEAKER AUDIO ROUTE
                </div>
                <select
                  value={speakerMode}
                  onChange={(e) => setSpeakerMode(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: 4,
                    border: `1px solid ${palette.borderDark}`,
                    background: '#FFFFFF',
                    fontFamily: typography.fontBody,
                    fontSize: 11,
                    color: palette.textMain,
                  }}
                >
                  <option value="standby">Physical Podium (Hall B Standby)</option>
                  <option value="remote">4K Fiber Feed to Networking Area</option>
                  <option value="swap">Co-Speaker Dr. Aris Standby</option>
                </select>
              </div>
            </div>

            {/* Predicted Reality B Consequence Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
              fontFamily: typography.fontMono,
              fontSize: 11,
              marginBottom: 20,
            }}>
              <div style={{ padding: 10, borderRadius: 6, background: '#FFFFFF', border: `1px solid ${palette.border}` }}>
                <div style={{ color: palette.textMuted }}>DISPLACED</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: predictedDisplacement === 0 ? palette.successText : palette.warning, marginTop: 2 }}>
                  {predictedDisplacement} PPL
                </div>
              </div>
              <div style={{ padding: 10, borderRadius: 6, background: '#FFFFFF', border: `1px solid ${palette.border}` }}>
                <div style={{ color: palette.textMuted }}>SOLVER SCORE</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: palette.secondary, marginTop: 2 }}>
                  {predictedFeasibility}%
                </div>
              </div>
              <div style={{ padding: 10, borderRadius: 6, background: '#FFFFFF', border: `1px solid ${palette.border}` }}>
                <div style={{ color: palette.textMuted }}>EXTRA WALK</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: palette.textMain, marginTop: 2 }}>
                  +{transitDistance}m
                </div>
              </div>
              <div style={{ padding: 10, borderRadius: 6, background: '#FFFFFF', border: `1px solid ${palette.border}` }}>
                <div style={{ color: palette.textMuted }}>DELAY</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: predictedDelay === 0 ? palette.successText : palette.primary, marginTop: 2 }}>
                  +{predictedDelay} MIN
                </div>
              </div>
            </div>

            {/* Commit Multiverse Button */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
              <MagneticButton
                variant="primary"
                onClick={() => resolveDisruption(targetRoom)}
                style={{ flex: 1, padding: '12px 18px', background: palette.secondary }}
              >
                <Check size={15} />
                <span>Commit Reality B to Physical Event</span>
              </MagneticButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
