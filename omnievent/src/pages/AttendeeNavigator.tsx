import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Navigation,
  MapPin,
  Footprints,
  Compass,
  Clock,
  Search,
  Bookmark,
  BookmarkCheck,
  User,
} from 'lucide-react';
import { AnimatedPage } from '../components/animated/AnimatedPage';
import { palette, typography, trackStyles } from '../lib/theme';
import { LivingCounter, PerspectiveCard } from '../components/animated/LivingData';
import { useEventState } from '../context/EventStateContext';

interface SimulatedOrigin {
  id: string;
  name: string;
  floor: number;
  coords: { x: number; y: number };
}

const SIMULATED_ORIGINS: SimulatedOrigin[] = [
  { id: 'orig-1', name: 'GUKC Main Portico & Turnstiles (Ground Floor)', floor: 1, coords: { x: 70, y: 95 } },
  { id: 'orig-2', name: 'Central Circulation & WebOPAC Desk (Ground Floor)', floor: 1, coords: { x: 240, y: 95 } },
  { id: 'orig-3', name: 'Scholarly Networking Atrium & Cafe (Ground Floor)', floor: 1, coords: { x: 410, y: 95 } },
  { id: 'orig-4', name: 'Elevator Core Block A (Level 2)', floor: 2, coords: { x: 240, y: 220 } },
];

// Room spatial coordinates in the vector floorplan
const ROOM_COORDS: Record<string, { x: number; y: number; floor: number; name: string }> = {
  r1: { x: 120, y: 95, floor: 1, name: 'GUKC Central Auditorium (Block C)' },
  r2: { x: 240, y: 95, floor: 1, name: 'Dr. APJ Abdul Kalam Central Reading Hall' },
  r3: { x: 110, y: 230, floor: 2, name: 'AI & Data Science Block Hub' },
  r4: { x: 230, y: 230, floor: 2, name: 'Smart Collaborative Discussion Room 1' },
  r5: { x: 350, y: 230, floor: 2, name: 'Smart Collaborative Discussion Room 2' },
  r6: { x: 380, y: 230, floor: 2, name: 'E-Resource & IEEE Digital Library' },
  r7: { x: 180, y: 95, floor: 1, name: 'Block A Multimedia Seminar Hall' },
  r8: { x: 420, y: 95, floor: 1, name: 'Scholarly Networking Atrium' },
  r9: { x: 420, y: 230, floor: 2, name: 'Faculty Research & VIP Lounge' },
  r10: { x: 290, y: 230, floor: 2, name: 'Doctoral Research & Rare Book Carrels' },
};

export default function AttendeeNavigator() {
  const {
    sessions,
    rooms,
    personalAgendaIds,
    toggleAgendaSession,
    isSessionInAgenda,
  } = useEventState();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [agendaFilterOnly, setAgendaFilterOnly] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || 'ses1');
  const [selectedOriginId, setSelectedOriginId] = useState<string>('orig-1');
  const [stepFreeOnly, setStepFreeOnly] = useState(true);

  // Selected Origin & Destination
  const activeOrigin = useMemo(() => {
    return SIMULATED_ORIGINS.find(o => o.id === selectedOriginId) || SIMULATED_ORIGINS[0];
  }, [selectedOriginId]);

  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === selectedSessionId) || sessions[0];
  }, [sessions, selectedSessionId]);

  const targetRoomInfo = useMemo(() => {
    const rId = activeSession?.roomId || 'r1';
    return ROOM_COORDS[rId] || { x: 240, y: 95, floor: 1, name: 'Designated Hall' };
  }, [activeSession]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.speakers?.some(sp => sp.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTrack = selectedTrack === 'All' || s.track === selectedTrack;
      const matchesAgenda = !agendaFilterOnly || isSessionInAgenda(s.id);

      return matchesSearch && matchesTrack && matchesAgenda;
    });
  }, [sessions, searchQuery, selectedTrack, agendaFilterOnly, isSessionInAgenda]);

  // Dynamic route calculation
  const { routePath, distanceMeters, walkingMinutes } = useMemo(() => {
    const start = activeOrigin.coords;
    const dest = targetRoomInfo;
    const isDifferentFloor = activeOrigin.floor !== dest.floor;

    let path = '';
    let dist = Math.abs(start.x - dest.x);

    if (isDifferentFloor) {
      dist += 120; // Vertical floor transition cost
      if (stepFreeOnly) {
        // Goes via Central Elevator at (240, 160)
        path = `M ${start.x} ${start.y} L 240 ${start.y} L 240 160 L 240 ${dest.y} L ${dest.x} ${dest.y}`;
      } else {
        // Direct escalator corridor
        path = `M ${start.x} ${start.y} L 180 ${start.y} L 220 160 L 260 ${dest.y} L ${dest.x} ${dest.y}`;
      }
    } else {
      // Same floor direct hallway route
      path = `M ${start.x} ${start.y} L ${dest.x} ${dest.y}`;
    }

    const calculatedMeters = Math.max(40, Math.round(dist * 0.9));
    const calculatedMinutes = Math.max(1, Math.ceil(calculatedMeters / 65));

    return {
      routePath: path,
      distanceMeters: calculatedMeters,
      walkingMinutes: calculatedMinutes,
    };
  }, [activeOrigin, targetRoomInfo, stepFreeOnly]);

  const tracks = ['All', 'keynote', 'workshop', 'panel', 'breakout', 'networking'];

  return (
    <AnimatedPage>
      <div style={{ maxWidth: 1360, margin: '0 auto', fontFamily: typography.fontBody, paddingBottom: 60 }}>
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
              <Navigation size={13} />
              SPATIAL ATTENDEE NAVIGATOR & PERSONAL AGENDA
            </div>
            <h1 style={{
              fontFamily: typography.fontHeading,
              fontSize: 28,
              fontWeight: 700,
              color: palette.textMain,
              letterSpacing: '-0.03em',
              margin: 0,
            }}>
              Attendee Wayfinding & Agenda
            </h1>
            <p style={{ fontSize: 13, color: palette.textMuted, margin: '4px 0 0' }}>
              Personalized session agenda, indoor positioning simulation, and intelligent route drawing.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Step-Free Toggle */}
            <button
              onClick={() => setStepFreeOnly(!stepFreeOnly)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 6,
                fontSize: 11,
                fontFamily: typography.fontMono,
                fontWeight: 700,
                cursor: 'pointer',
                border: `1px solid ${stepFreeOnly ? palette.secondary : palette.borderDark}`,
                background: stepFreeOnly ? palette.secondary : palette.bgSecondary,
                color: stepFreeOnly ? '#FFFFFF' : palette.textMain,
                transition: 'all 0.15s ease',
              }}
            >
              <span>{stepFreeOnly ? '✓ STEP-FREE (ELEVATOR ROUTE)' : 'STANDARD ROUTE (STAIRS)'}</span>
            </button>

            {/* My Agenda Filter Toggle */}
            <button
              onClick={() => setAgendaFilterOnly(!agendaFilterOnly)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 6,
                fontSize: 11,
                fontFamily: typography.fontMono,
                fontWeight: 700,
                cursor: 'pointer',
                border: `1px solid ${agendaFilterOnly ? palette.primary : palette.borderDark}`,
                background: agendaFilterOnly ? palette.primary : palette.bgSecondary,
                color: agendaFilterOnly ? '#FFFFFF' : palette.textMain,
                transition: 'all 0.15s ease',
              }}
            >
              <Bookmark size={13} />
              <span>MY SAVED AGENDA ({personalAgendaIds.length})</span>
            </button>
          </div>
        </div>

        {/* 2-Column Split: Session Explorer & Personal Agenda vs Interactive Vector Map */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.4fr)', gap: 24 }}>
          {/* Left Column: Search & Filter Sessions */}
          <div>
            {/* Search Input Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: palette.bgSecondary,
              border: `1px solid ${palette.borderDark}`,
              borderRadius: 8,
              padding: '8px 14px',
              marginBottom: 14,
            }}>
              <Search size={16} color={palette.textMuted} />
              <input
                type="text"
                placeholder="Search sessions by topic, speaker, or keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: 13,
                  fontFamily: typography.fontBody,
                  color: palette.textMain,
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: palette.textMuted, fontSize: 12 }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Track Filter Pills */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 14 }}>
              {tracks.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTrack(t)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontFamily: typography.fontMono,
                    fontWeight: selectedTrack === t ? 700 : 500,
                    cursor: 'pointer',
                    background: selectedTrack === t ? palette.bgParchment : palette.bgSecondary,
                    border: `1px solid ${selectedTrack === t ? palette.borderDark : palette.border}`,
                    color: selectedTrack === t ? palette.textMain : palette.textMuted,
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Session Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredSessions.length === 0 ? (
                <div style={{
                  padding: 30,
                  textAlign: 'center',
                  background: palette.bgSecondary,
                  borderRadius: 8,
                  border: `1px dashed ${palette.borderDark}`,
                  color: palette.textMuted,
                  fontSize: 13,
                }}>
                  No sessions match your search criteria. Try a different query or reset filters.
                </div>
              ) : (
                filteredSessions.map((item) => {
                  const isSelected = selectedSessionId === item.id;
                  const isSaved = isSessionInAgenda(item.id);
                  const trackCfg = trackStyles[item.track] || { bg: palette.bgMain, text: palette.textMain, border: palette.border, label: item.track };
                  const room = rooms.find(r => r.id === item.roomId);
                  const speakerNames = item.speakers?.map(sp => sp.name).join(', ') || 'Featured Speaker';
                  const startTimeFormatted = item.startTime.includes('T')
                    ? new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : item.startTime;
                  const endTimeFormatted = item.endTime.includes('T')
                    ? new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : item.endTime;

                  return (
                    <PerspectiveCard
                      key={item.id}
                      onClick={() => setSelectedSessionId(item.id)}
                      style={{
                        cursor: 'pointer',
                        border: `1.5px solid ${isSelected ? palette.primary : palette.border}`,
                        boxShadow: isSelected ? palette.shadowElevated : palette.shadowSoft,
                        background: palette.bgSecondary,
                      }}
                    >
                      <div style={{ padding: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              fontFamily: typography.fontMono,
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: 4,
                              background: trackCfg.bg,
                              color: trackCfg.text,
                              border: `1px solid ${trackCfg.border}`,
                              textTransform: 'uppercase',
                            }}>
                              {trackCfg.label}
                            </span>
                            <span style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>
                              {startTimeFormatted} – {endTimeFormatted}
                            </span>
                          </div>

                          {/* Save to Agenda Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAgendaSession(item.id);
                            }}
                            title={isSaved ? 'Remove from My Agenda' : 'Add to My Agenda'}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              background: isSaved ? '#FDF5F2' : 'transparent',
                              border: `1px solid ${isSaved ? palette.primary : palette.borderDark}`,
                              borderRadius: 4,
                              padding: '4px 8px',
                              color: isSaved ? palette.primary : palette.textMuted,
                              fontFamily: typography.fontMono,
                              fontSize: 10,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {isSaved ? <BookmarkCheck size={12} color={palette.primary} /> : <Bookmark size={12} />}
                            <span>{isSaved ? 'SAVED' : 'SAVE'}</span>
                          </button>
                        </div>

                        <h4 style={{
                          fontFamily: typography.fontHeading,
                          fontSize: 16,
                          fontWeight: 700,
                          color: palette.textMain,
                          margin: '0 0 6px',
                          lineHeight: 1.3,
                        }}>
                          {item.title}
                        </h4>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          fontSize: 12,
                          color: palette.textMuted,
                          marginBottom: 8,
                          flexWrap: 'wrap',
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={13} color={palette.secondary} />
                            <strong style={{ color: palette.textMain }}>{room?.name || 'Grand Hall'}</strong> (Floor {room?.floor || 1})
                          </span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <User size={13} />
                            {speakerNames}
                          </span>
                        </div>

                        {item.description && (
                          <div style={{
                            fontSize: 12,
                            color: palette.textMuted,
                            lineHeight: 1.4,
                            marginTop: 6,
                          }}>
                            {item.description}
                          </div>
                        )}
                      </div>
                    </PerspectiveCard>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Architectural Vector Wayfinding Canvas */}
          <div>
            <div style={{
              background: palette.bgSecondary,
              borderRadius: 14,
              border: `1px solid ${palette.border}`,
              padding: 24,
              boxShadow: palette.shadowSoft,
              position: 'sticky',
              top: 24,
            }}>
              {/* Origin Selection (Clearly Labeled Simulated) */}
              <div style={{
                background: palette.bgParchment,
                border: `1px solid ${palette.borderDark}`,
                borderRadius: 8,
                padding: '12px 14px',
                marginBottom: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: typography.fontMono, fontSize: 10, fontWeight: 700, color: palette.secondary, textTransform: 'uppercase' }}>
                    SELECT STARTING LOCATION (SIMULATED INDOOR GPS)
                  </span>
                  <span style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>
                    INDOOR POSITIONING SIMULATION
                  </span>
                </div>
                <select
                  value={selectedOriginId}
                  onChange={e => setSelectedOriginId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: `1px solid ${palette.borderDark}`,
                    background: palette.bgSecondary,
                    fontFamily: typography.fontBody,
                    fontSize: 13,
                    fontWeight: 600,
                    color: palette.textMain,
                  }}
                >
                  {SIMULATED_ORIGINS.map(orig => (
                    <option key={orig.id} value={orig.id}>
                      {orig.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Wayfinding Metrics Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: `1px solid ${palette.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Compass size={18} color={palette.primary} />
                  <div>
                    <h3 style={{
                      fontFamily: typography.fontHeading,
                      fontSize: 16,
                      fontWeight: 700,
                      color: palette.textMain,
                      margin: 0,
                    }}>
                      Route to {targetRoomInfo.name}
                    </h3>
                    <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>
                      LEVEL {targetRoomInfo.floor} • A* OPTIMAL INDOOR PATH
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: palette.bgMain,
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: `1px solid ${palette.border}`,
                  fontFamily: typography.fontMono,
                  fontSize: 11,
                  fontWeight: 700,
                  color: palette.primary,
                }}>
                  <Clock size={12} />
                  <span>
                    <LivingCounter value={distanceMeters} suffix="m" /> • <LivingCounter value={walkingMinutes} suffix=" min walk" />
                  </span>
                </div>
              </div>

              {/* Architectural Vector Map */}
              <div style={{
                background: '#FCFBF8',
                borderRadius: 10,
                border: `1px solid ${palette.border}`,
                padding: 16,
                marginBottom: 18,
                position: 'relative',
                overflow: 'hidden',
              }}>
                <svg viewBox="0 0 500 320" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                  <defs>
                    <pattern id="nav-grid" width="25" height="25" patternUnits="userSpaceOnUse">
                      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#EFEAE0" strokeWidth="0.7" />
                    </pattern>
                  </defs>
                  <rect width="500" height="320" fill="url(#nav-grid)" />

                  {/* Floor 1 Outline */}
                  <rect x="30" y="30" width="440" height="120" rx="6" fill="#FFFFFF" stroke="#D4CDC0" strokeWidth="1.5" />
                  <text x="45" y="52" fontFamily={typography.fontMono} fontSize="10" fill={palette.textMuted} fontWeight="700">
                    CONCOURSE LEVEL 1 (HALLS & MAIN FOYER)
                  </text>

                  {/* Floor 2 Outline */}
                  <rect x="30" y="170" width="440" height="120" rx="6" fill="#FFFFFF" stroke="#D4CDC0" strokeWidth="1.5" />
                  <text x="45" y="192" fontFamily={typography.fontMono} fontSize="10" fill={palette.textMuted} fontWeight="700">
                    ACADEMY LEVEL 2 (LABS & WORKSHOPS)
                  </text>

                  {/* Rooms layout Floor 1 */}
                  <rect x="60" y="65" width="100" height="60" rx="4" fill="#FAFAF8" stroke="#D4CDC0" strokeWidth="1" />
                  <text x="70" y="85" fontFamily={typography.fontHeading} fontSize="10" fontWeight="700" fill={palette.textMain}>Grand Hall A</text>

                  <rect x="190" y="65" width="100" height="60" rx="4" fill="#FAFAF8" stroke="#D4CDC0" strokeWidth="1" />
                  <text x="200" y="85" fontFamily={typography.fontHeading} fontSize="10" fontWeight="700" fill={palette.textMain}>Grand Hall B</text>

                  <rect x="320" y="65" width="130" height="60" rx="4" fill="#FAFAF8" stroke="#D4CDC0" strokeWidth="1" />
                  <text x="330" y="85" fontFamily={typography.fontHeading} fontSize="10" fontWeight="700" fill={palette.textMain}>Networking Hub</text>

                  {/* Rooms layout Floor 2 */}
                  <rect x="60" y="205" width="100" height="60" rx="4" fill="#FAFAF8" stroke="#D4CDC0" strokeWidth="1" />
                  <text x="70" y="225" fontFamily={typography.fontHeading} fontSize="10" fontWeight="700" fill={palette.textMain}>Workshop 1</text>

                  <rect x="180" y="205" width="100" height="60" rx="4" fill="#FAFAF8" stroke="#D4CDC0" strokeWidth="1" />
                  <text x="190" y="225" fontFamily={typography.fontHeading} fontSize="10" fontWeight="700" fill={palette.textMain}>Workshop 2</text>

                  <rect x="300" y="205" width="150" height="60" rx="4" fill="#FAFAF8" stroke="#D4CDC0" strokeWidth="1" />
                  <text x="310" y="225" fontFamily={typography.fontHeading} fontSize="10" fontWeight="700" fill={palette.textMain}>Tech Labs</text>

                  {/* Central Elevator */}
                  <rect x="220" y="145" width="40" height="30" rx="4" fill={stepFreeOnly ? '#EAEFFE' : '#F7F4EC'} stroke={palette.secondary} strokeWidth="1.2" />
                  <text x="225" y="163" fontFamily={typography.fontMono} fontSize="8" fill={palette.secondary} fontWeight="700">ELEV</text>

                  {/* Animated Route Line */}
                  <motion.path
                    d={routePath}
                    fill="none"
                    stroke={palette.primary}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="6 6"
                    initial={{ pathOffset: 0 }}
                    animate={{ pathOffset: -1 }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
                  />

                  {/* Origin Marker */}
                  <circle cx={activeOrigin.coords.x} cy={activeOrigin.coords.y} r="7" fill={palette.secondary} stroke="#FFFFFF" strokeWidth="2" />
                  <text x={activeOrigin.coords.x + 10} y={activeOrigin.coords.y - 8} fontFamily={typography.fontMono} fontSize="9" fontWeight="700" fill={palette.secondary}>
                    START: {activeOrigin.name.split('(')[0]}
                  </text>

                  {/* Destination Marker */}
                  <motion.circle
                    cx={targetRoomInfo.x}
                    cy={targetRoomInfo.y}
                    r="8"
                    fill={palette.primary}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                  <text x={targetRoomInfo.x + 10} y={targetRoomInfo.y - 8} fontFamily={typography.fontMono} fontSize="9" fontWeight="700" fill={palette.primary}>
                    DEST: {targetRoomInfo.name}
                  </text>
                </svg>
              </div>

              {/* Wayfinding Turn-by-Turn Instruction */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 8,
                background: palette.bgMain,
                border: `1px solid ${palette.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <Footprints size={16} color={palette.secondary} />
                <div style={{ fontSize: 12, color: palette.textMain, lineHeight: 1.4 }}>
                  From <strong>{activeOrigin.name}</strong>, {activeOrigin.floor !== targetRoomInfo.floor ? 'take the central elevator to Level ' + targetRoomInfo.floor + ' and ' : ''}proceed toward <strong>{targetRoomInfo.name}</strong>. Estimated arrival in <strong>{walkingMinutes} minute{walkingMinutes > 1 ? 's' : ''}</strong>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
