import { useState, useEffect } from 'react';
import { palette, typography } from '../lib/theme';
import { useEventState } from '../context/EventStateContext';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  ShieldAlert,
  Users,
  MessageSquareShare,
  Compass,
} from 'lucide-react';
import { LivingCounter } from './animated/LivingData';

interface HistoricalSnapshot {
  timeStr: string;
  minuteOfDay: number;
  label: string;
  category: 'checkin' | 'incident' | 'solve' | 'dispatch' | 'session' | 'completion';
  turnout: number;
  activeDisruptions: number;
  room1State: string;
  room2State: string;
  dispatchesCount: number;
  description: string;
}

const HISTORICAL_TIMELINE: HistoricalSnapshot[] = [
  {
    timeStr: '08:00',
    minuteOfDay: 480,
    label: 'Doors Open & Badge Printing',
    category: 'checkin',
    turnout: 142,
    activeDisruptions: 0,
    room1State: 'Standby / Audio Test',
    room2State: 'Standby',
    dispatchesCount: 0,
    description: 'First wave of attendees arrived via GUKC Main Portico Turnstiles. RFID & NFC badges scanning at 18/min.',
  },
  {
    timeStr: '08:45',
    minuteOfDay: 525,
    label: 'Morning Concourse Influx Peak',
    category: 'checkin',
    turnout: 864,
    activeDisruptions: 0,
    room1State: 'Stage Ready (Keynote)',
    room2State: 'Reserved',
    dispatchesCount: 1,
    description: 'Bistro & Coffee Hub reaches 82% capacity. Pre-keynote seating begins in Grand Hall A.',
  },
  {
    timeStr: '09:28',
    minuteOfDay: 568,
    label: 'CRISIS: A/V Power Surge in Hall A',
    category: 'incident',
    turnout: 1210,
    activeDisruptions: 1,
    room1State: 'A/V System Failure',
    room2State: 'Standby Available',
    dispatchesCount: 1,
    description: 'Mainboard capacitor trip in Grand Hall A. Projection lost. CP-SAT mathematical engine triggered.',
  },
  {
    timeStr: '09:30',
    minuteOfDay: 570,
    label: 'CP-SAT Multiverse Solver Executed',
    category: 'solve',
    turnout: 1235,
    activeDisruptions: 1,
    room1State: 'Under Maintenance',
    room2State: 'Calibrating Twin 4K Laser',
    dispatchesCount: 1,
    description: 'Constraint solver generated 3 conflict-free plans in 4.2 seconds. Plan A selected: swap to adjacent Hall B.',
  },
  {
    timeStr: '09:32',
    minuteOfDay: 572,
    label: 'Cascade Approved: Rerouting 480 Ppl',
    category: 'dispatch',
    turnout: 1247,
    activeDisruptions: 1,
    room1State: 'Evacuating Hall A',
    room2State: 'Ingress Door 4 Open',
    dispatchesCount: 481,
    description: 'Multilingual SMS sent to all 480 attendees. 4 volunteer marshals stationed in Concourse West.',
  },
  {
    timeStr: '10:15',
    minuteOfDay: 615,
    label: 'Hall B Keynote Commenced',
    category: 'session',
    turnout: 1247,
    activeDisruptions: 0,
    room1State: 'Technicians Repairing',
    room2State: 'Live Keynote (480 seated)',
    dispatchesCount: 481,
    description: 'Keynote starts in Hall B with zero acoustic degradation. Schedule timeline back to nominal.',
  },
  {
    timeStr: '12:30',
    minuteOfDay: 750,
    label: 'Midday Networking & Catering Peak',
    category: 'session',
    turnout: 1247,
    activeDisruptions: 0,
    room1State: 'Restored & Available',
    room2State: 'Turnaround Prep',
    dispatchesCount: 481,
    description: 'Exhibition Pavilion networking mixer active. 14 sponsor booths operating at capacity.',
  },
  {
    timeStr: '16:45',
    minuteOfDay: 1005,
    label: 'Closing Plenary & Event Concluded',
    category: 'completion',
    turnout: 1247,
    activeDisruptions: 0,
    room1State: 'Sessions Completed',
    room2State: 'Sessions Completed',
    dispatchesCount: 481,
    description: 'All 42 summit tracks successfully delivered. Executive performance audit verified and sealed.',
  },
];

export default function TimeMachineReplay() {
  const { isFrozen } = useEventState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 5 | 10>(1);
  const [currentMinute, setCurrentMinute] = useState<number>(568); // Starts near disruption for maximum drama

  // Find nearest snapshot to current minute
  const activeSnapshot = HISTORICAL_TIMELINE.reduce((prev, curr) => {
    return Math.abs(curr.minuteOfDay - currentMinute) < Math.abs(prev.minuteOfDay - currentMinute)
      ? curr
      : prev;
  });

  // Playback loop
  useEffect(() => {
    if (!isPlaying || isFrozen) return;
    const interval = setInterval(() => {
      setCurrentMinute((prev) => {
        if (prev >= 1010) {
          setIsPlaying(false);
          return 480;
        }
        return prev + speed;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isPlaying, isFrozen, speed]);

  const formatMinToTime = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <div style={{
      background: palette.bgSecondary,
      borderRadius: 14,
      border: `1px solid ${palette.border}`,
      boxShadow: palette.shadowSoft,
      padding: 24,
      fontFamily: typography.fontBody,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottom: `1px solid ${palette.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: palette.secondary,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Clock size={16} />
          </div>
          <div>
            <div style={{ fontFamily: typography.fontHeading, fontSize: 16, fontWeight: 700, color: palette.textMain }}>
              Time-Machine Event Replay Studio
            </div>
            <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>
              SYNCHRONIZED HISTORICAL TIMELINE SCRUBBER • GALGOTIAS UNIVERSITY KNOWLEDGE CENTRE
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setCurrentMinute(480)}
            title="Rewind to Start"
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              background: palette.bgMain,
              border: `1px solid ${palette.border}`,
              cursor: 'pointer',
              color: palette.textMuted,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RotateCcw size={13} />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              background: palette.primary,
              border: 'none',
              color: '#FFFFFF',
              fontFamily: typography.fontMono,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} fill="#FFFFFF" />}
            <span>{isPlaying ? 'PAUSE REPLAY' : 'PLAY REPLAY'}</span>
          </button>

          <div style={{ display: 'flex', background: palette.bgMain, borderRadius: 6, padding: 2, border: `1px solid ${palette.border}` }}>
            {([1, 5, 10] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeed(spd)}
                style={{
                  background: speed === spd ? palette.bgSecondary : 'transparent',
                  color: speed === spd ? palette.secondary : palette.textMuted,
                  border: 'none',
                  borderRadius: 4,
                  padding: '3px 8px',
                  fontFamily: typography.fontMono,
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {spd}X
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Historical Scrub Track */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: typography.fontMono, fontSize: 18, fontWeight: 700, color: palette.textMain }}>
            {formatMinToTime(currentMinute)}
          </span>
          <span style={{
            fontFamily: typography.fontMono,
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 4,
            background: activeSnapshot.category === 'incident' ? '#FDF5F2' : palette.bgMain,
            color: activeSnapshot.category === 'incident' ? palette.primary : palette.secondary,
            border: `1px solid ${palette.border}`,
          }}>
            {activeSnapshot.label.toUpperCase()}
          </span>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="480"
          max="1010"
          value={currentMinute}
          onChange={(e) => setCurrentMinute(Number(e.target.value))}
          style={{
            width: '100%',
            height: 8,
            accentColor: palette.primary,
            cursor: 'pointer',
            marginBottom: 12,
          }}
        />

        {/* Keyframe Jump Markers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, overflowX: 'auto' }}>
          {HISTORICAL_TIMELINE.map((snap) => {
            const isCurrent = Math.abs(snap.minuteOfDay - currentMinute) < 20;
            return (
              <button
                key={snap.minuteOfDay}
                onClick={() => setCurrentMinute(snap.minuteOfDay)}
                style={{
                  flex: 1,
                  minWidth: 80,
                  padding: '6px 8px',
                  borderRadius: 6,
                  background: isCurrent ? '#FFFFFF' : palette.bgMain,
                  border: `1px solid ${isCurrent ? palette.primary : palette.border}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: isCurrent ? palette.shadowSoft : 'none',
                }}
              >
                <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: isCurrent ? palette.primary : palette.textMuted, fontWeight: 700 }}>
                  {snap.timeStr}
                </div>
                <div style={{ fontSize: 9, color: palette.textMain, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {snap.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Synchronized Replay Telemetry State */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        marginBottom: 20,
      }}>
        <div style={{ padding: 12, borderRadius: 8, background: palette.bgMain, border: `1px solid ${palette.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: typography.fontMono, color: palette.textMuted }}>
            <Users size={12} />
            <span>ATTENDEE CHECK-IN</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: typography.fontMono, color: palette.textMain, marginTop: 4 }}>
            <LivingCounter value={activeSnapshot.turnout} />
          </div>
          <div style={{ fontSize: 10, color: palette.textMuted, marginTop: 2 }}>of 1,250 total capacity</div>
        </div>

        <div style={{ padding: 12, borderRadius: 8, background: palette.bgMain, border: `1px solid ${palette.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: typography.fontMono, color: palette.textMuted }}>
            <ShieldAlert size={12} color={activeSnapshot.activeDisruptions > 0 ? palette.primary : palette.textMuted} />
            <span>DISRUPTIONS</span>
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            fontFamily: typography.fontMono,
            color: activeSnapshot.activeDisruptions > 0 ? palette.primary : palette.successText,
            marginTop: 4,
          }}>
            {activeSnapshot.activeDisruptions} ACTIVE
          </div>
          <div style={{ fontSize: 10, color: palette.textMuted, marginTop: 2 }}>OR-Tools auto-monitored</div>
        </div>

        <div style={{ padding: 12, borderRadius: 8, background: palette.bgMain, border: `1px solid ${palette.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: typography.fontMono, color: palette.textMuted }}>
            <Compass size={12} />
            <span>GRAND HALL A</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, fontFamily: typography.fontMono, color: palette.textMain, marginTop: 4 }}>
            {activeSnapshot.room1State}
          </div>
          <div style={{ fontSize: 10, color: palette.textMuted, marginTop: 2 }}>Cap: 450 • Level 1</div>
        </div>

        <div style={{ padding: 12, borderRadius: 8, background: palette.bgMain, border: `1px solid ${palette.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: typography.fontMono, color: palette.textMuted }}>
            <MessageSquareShare size={12} />
            <span>SMS ALERTS DISPATCHED</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: typography.fontMono, color: palette.secondary, marginTop: 4 }}>
            <LivingCounter value={activeSnapshot.dispatchesCount} />
          </div>
          <div style={{ fontSize: 10, color: palette.textMuted, marginTop: 2 }}>Push & SMS delivery</div>
        </div>
      </div>

      {/* Snapshot Narrative Box */}
      <div style={{
        padding: '14px 18px',
        borderRadius: 8,
        background: '#FFFFFF',
        border: `1px solid ${palette.border}`,
        fontSize: 12,
        lineHeight: 1.55,
        color: palette.textMain,
      }}>
        <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.secondary, fontWeight: 700, marginBottom: 4 }}>
          SYSTEM DECISION AUDIT • TIMESTAMP {activeSnapshot.timeStr}
        </div>
        {activeSnapshot.description}
      </div>
    </div>
  );
}
