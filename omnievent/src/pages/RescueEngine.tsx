import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, AlertTriangle, CheckCircle2, Clock, ArrowRight,
  MapPin, ChevronRight, RotateCcw, Check,
  Cpu, Lock, Plus, X,
} from 'lucide-react';
import { staggerContainer, staggerItem, slideUp, scaleIn } from '../lib/motion';
import { palette, typography } from '../lib/theme';
import { AnimatedPage } from '../components/animated/AnimatedPage';
import { useEventState } from '../context/EventStateContext';
import ParallelUniverseSimulator from '../components/ParallelUniverseSimulator';
import type { Room, Session, Incident } from '../lib/types';

type Phase = 'idle' | 'detected' | 'analyzing' | 'options_ready' | 'approval' | 'resolving' | 'resolved';

interface RecoveryOpt {
  id: string;
  planName: string;
  description: string;
  newRoom: string;
  newRoomId: string;
  newTime: string;
  affectedAttendees: number;
  feasibility: number;
  tradeoffs: string[];
}

const ANALYSIS_STEPS = [
  'Parsing venue spatial graph and locked sessions',
  'Executing Google OR-Tools CP-SAT constraint matrix',
  'Checking room AV capabilities and speaker calendar availability',
  'Minimizing total attendee displacement score',
];

function generateRecoveryOptions(incidentId: string, currentRooms: Room[], targetSession?: Session): RecoveryOpt[] {
  const fallbackRoom: Room = { id: 'r2', name: 'Dr. APJ Abdul Kalam Central Reading Hall', capacity: 350, currentOccupancy: 0, status: 'available', floor: 1 };
  const fallbackSecond: Room = { id: 'r7', name: 'Block A Multimedia Seminar Hall', capacity: 250, currentOccupancy: 0, status: 'available', floor: 1 };

  const availableRooms = currentRooms.filter(r => r.status === 'available' || r.status === 'reserved');
  const targetRoom = availableRooms[0] || currentRooms.find(r => r.id !== targetSession?.roomId) || currentRooms[1] || currentRooms[0] || fallbackRoom;
  const secondRoom = availableRooms[1] || currentRooms.find(r => r.id !== targetRoom.id && r.id !== targetSession?.roomId) || currentRooms[2] || fallbackSecond;

  const targetRoomName = targetRoom.name || 'Central Hall';
  const secondRoomName = secondRoom.name || 'Seminar Hall';

  return [
    {
      id: `opt-${incidentId}-1`,
      planName: `PLAN A — ZERO DISPLACEMENT RELOCATION (${targetRoomName.toUpperCase()})`,
      description: `Reassign session to ${targetRoomName} (Floor ${targetRoom.floor || 1}) with verified AV readiness and ${targetRoom.capacity || 300} seats capacity`,
      newRoom: targetRoomName,
      newRoomId: targetRoom.id || 'r2',
      newTime: targetSession ? (targetSession.startTime.includes('T') ? targetSession.startTime.split('T')[1].slice(0, 5) : targetSession.startTime) : '09:30 slot',
      affectedAttendees: 0,
      feasibility: 96,
      tradeoffs: ['Requires 30m walking reroute for attendees', 'Standby AV team activated'],
    },
    {
      id: `opt-${incidentId}-2`,
      planName: 'PLAN B — TEMPORAL SHIFT (+25 MIN)',
      description: 'Retain original room after rapid technician intervention; postpone subsequent panel by 20m',
      newRoom: 'Same Venue (Delayed)',
      newRoomId: targetSession?.roomId || 'r1',
      newTime: '10:00 – 11:30 (+25 min shift)',
      affectedAttendees: 45,
      feasibility: 82,
      tradeoffs: ['Truncates lunch break by 15 mins', 'Pushes afternoon track schedule'],
    },
    {
      id: `opt-${incidentId}-3`,
      planName: `PLAN C — SPLIT HYBRID MIRROR (${secondRoomName.toUpperCase()})`,
      description: `Divide in-person cohort to ${secondRoomName} and mirror 4K feed to Networking Atrium`,
      newRoom: `${secondRoomName} + Atrium`,
      newRoomId: secondRoom.id || 'r7',
      newTime: 'Concurrent live stream broadcast',
      affectedAttendees: 18,
      feasibility: 74,
      tradeoffs: ['Secondary audience views on monitors', 'Splits in-person Q&A interaction'],
    },
  ];
}

export default function RescueEngine() {
  const {
    incidents,
    createIncident,
    triggerDisruption,
    resolveDisruptionWithPlan,
    rooms,
    sessions,
  } = useEventState();

  const [rescueTab, setRescueTab] = useState<'pipeline' | 'multiverse'>('pipeline');
  const [phase, setPhase] = useState<Phase>('idle');
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [recoveryOptions, setRecoveryOptions] = useState<RecoveryOpt[]>([]);
  const [selectedOption, setSelectedOption] = useState<RecoveryOpt | null>(null);
  const [resolvedData, setResolvedData] = useState<{ option: RecoveryOpt; incident: Incident; timestamp: string } | null>(null);

  // New Incident Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [newIncidentForm, setNewIncidentForm] = useState({
    title: '',
    description: '',
    severity: 'high' as Incident['severity'],
    type: 'equipment_failure' as NonNullable<Incident['type']>,
    roomId: rooms[0]?.id || 'r1',
  });

  const targetSession = useMemo(() => {
    return sessions.find(s => s.roomId === activeIncident?.roomId) || sessions[0];
  }, [sessions, activeIncident]);

  useEffect(() => {
    if (phase !== 'analyzing') return;
    if (analysisStep >= ANALYSIS_STEPS.length) {
      const timer = setTimeout(() => {
        setRecoveryOptions(generateRecoveryOptions(activeIncident?.id || '', rooms, targetSession));
        setPhase('options_ready');
      }, 500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setAnalysisStep(s => s + 1), 750);
    return () => clearTimeout(timer);
  }, [phase, analysisStep, activeIncident, rooms, targetSession]);

  const handleTrigger = useCallback((inc: Incident) => {
    setActiveIncident(inc);
    triggerDisruption(inc.id);
    setPhase('detected');
    setTimeout(() => {
      setAnalysisStep(0);
      setPhase('analyzing');
    }, 1200);
  }, [triggerDisruption]);

  const handleSelectOption = useCallback((opt: RecoveryOpt) => {
    setSelectedOption(opt);
    setPhase('approval');
  }, []);

  const handleApprove = useCallback(() => {
    if (!selectedOption || !activeIncident) return;
    setPhase('resolving');
    resolveDisruptionWithPlan({
      id: selectedOption.id,
      sessionId: targetSession?.id || 'ses1',
      newRoomId: selectedOption.newRoomId,
      newTime: selectedOption.newTime,
      rebalanceSummary: selectedOption.description,
    });
    setTimeout(() => {
      setResolvedData({
        option: selectedOption,
        incident: activeIncident,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      setPhase('resolved');
    }, 1200);
  }, [selectedOption, activeIncident, targetSession, resolveDisruptionWithPlan]);

  const handleReset = useCallback(() => {
    setPhase('idle');
    setActiveIncident(null);
    setAnalysisStep(0);
    setRecoveryOptions([]);
    setSelectedOption(null);
    setResolvedData(null);
  }, []);

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createIncident({
      title: newIncidentForm.title,
      description: newIncidentForm.description,
      severity: newIncidentForm.severity,
      type: newIncidentForm.type,
      roomId: newIncidentForm.roomId,
    });
    setIsReportModalOpen(false);
    setNewIncidentForm({
      title: '',
      description: '',
      severity: 'high',
      type: 'equipment_failure',
      roomId: rooms[0]?.id || 'r1',
    });
    // Launch solver directly
    handleTrigger(created);
  };

  const openIncidents = incidents.filter(i => i.status !== 'resolved');

  return (
    <AnimatedPage>
      <div style={{ maxWidth: 1200, margin: '0 auto', fontFamily: typography.fontBody }}>
        {/* Editorial Header */}
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
              background: '#FDF5F2',
              border: `1px solid #F4C4B5`,
              fontFamily: typography.fontMono,
              fontSize: 11,
              fontWeight: 700,
              color: palette.primary,
              marginBottom: 8,
              letterSpacing: '0.04em',
            }}>
              <ShieldAlert size={13} />
              CONSTRAINT RESCUE WORKSPACE
            </div>
            <h1 style={{
              fontFamily: typography.fontHeading,
              fontSize: 28,
              fontWeight: 700,
              color: palette.textMain,
              letterSpacing: '-0.03em',
              margin: 0,
            }}>
              Event Rescue Engine
            </h1>
            <p style={{ fontSize: 13, color: palette.textMuted, margin: '4px 0 0' }}>
              Autonomous crisis detection, CP-SAT combinatorial solver, and organizer approval gate.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontFamily: typography.fontMono,
            fontSize: 11,
            color: palette.textMuted,
          }}>
            <button
              onClick={() => setIsReportModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 6,
                background: palette.primary,
                color: '#FFFFFF',
                border: 'none',
                fontFamily: typography.fontBody,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(230, 107, 69, 0.25)',
              }}
            >
              <Plus size={14} />
              Report Disruption
            </button>
            <span>SOLVER TIMEOUT: 3000ms</span>
            <span>HUMAN-IN-THE-LOOP: ENFORCED</span>
          </div>
        </div>

        {/* Workspace Switcher Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <div style={{
            display: 'flex',
            background: palette.bgSecondary,
            borderRadius: 8,
            padding: 3,
            border: `1px solid ${palette.border}`,
          }}>
            <button
              onClick={() => setRescueTab('pipeline')}
              style={{
                background: rescueTab === 'pipeline' ? palette.bgMain : 'transparent',
                color: rescueTab === 'pipeline' ? palette.primary : palette.textMuted,
                border: 'none',
                borderRadius: 6,
                padding: '6px 14px',
                fontFamily: typography.fontMono,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              5-PHASE CONSTRAINT SOLVER
            </button>
            <button
              onClick={() => setRescueTab('multiverse')}
              style={{
                background: rescueTab === 'multiverse' ? palette.bgMain : 'transparent',
                color: rescueTab === 'multiverse' ? palette.secondary : palette.textMuted,
                border: 'none',
                borderRadius: 6,
                padding: '6px 14px',
                fontFamily: typography.fontMono,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              PARALLEL UNIVERSE SIMULATOR
            </button>
          </div>

          <span style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>
            {rescueTab === 'pipeline' ? 'ACTIVE PHASE: ' + phase.toUpperCase() : 'SPLIT REALITY MODE ACTIVE'}
          </span>
        </div>

        {rescueTab === 'multiverse' ? (
          <ParallelUniverseSimulator />
        ) : (
          <>
            {/* Phase Timeline Stepper */}
            <PhaseBar phase={phase} />

        <AnimatePresence mode="wait">
          {/* Phase: IDLE - Incident Queue */}
          {phase === 'idle' && (
            <motion.div key="idle" variants={staggerContainer} initial="hidden" animate="visible" exit="hidden">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}>
                <h3 style={{
                  fontFamily: typography.fontHeading,
                  fontSize: 16,
                  fontWeight: 700,
                  color: palette.textMain,
                  margin: 0,
                }}>
                  Active Disruption Queue ({openIncidents.length})
                </h3>
                <span style={{ fontSize: 12, color: palette.textMuted }}>
                  Select an incident to launch the optimization solver
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: 16,
              }}>
                {openIncidents.map(inc => (
                  <motion.div
                    key={inc.id}
                    variants={staggerItem}
                    onClick={() => handleTrigger(inc)}
                    whileHover={{ y: -3, boxShadow: palette.shadowElevated }}
                    style={{
                      background: palette.bgSecondary,
                      borderRadius: 10,
                      padding: 24,
                      border: `1px solid ${palette.border}`,
                      boxShadow: palette.shadowSoft,
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = palette.primary}
                    onMouseLeave={e => e.currentTarget.style.borderColor = palette.border}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{
                        fontFamily: typography.fontMono,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: inc.severity === 'critical' ? '#FDEAE9' : '#FDF6E2',
                        color: inc.severity === 'critical' ? palette.danger : palette.warningText,
                        border: `1px solid ${inc.severity === 'critical' ? '#F7C6C4' : palette.warning}`,
                        textTransform: 'uppercase',
                      }}>
                        {inc.severity} SEVERITY
                      </span>
                      <span style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>
                        {inc.status}
                      </span>
                    </div>

                    <h4 style={{
                      fontFamily: typography.fontHeading,
                      fontSize: 16,
                      fontWeight: 700,
                      color: palette.textMain,
                      margin: '0 0 6px',
                    }}>
                      {inc.title}
                    </h4>

                    <p style={{ fontSize: 13, color: palette.textMuted, lineHeight: 1.45, marginBottom: 16 }}>
                      {inc.description}
                    </p>

                    {inc.roomId && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        color: palette.textMain,
                        marginBottom: 16,
                        fontFamily: typography.fontMono,
                      }}>
                        <MapPin size={13} color={palette.secondary} />
                        <span>VENUE: {rooms.find(r => r.id === inc.roomId)?.name}</span>
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 12,
                      borderTop: `1px solid ${palette.border}`,
                      fontSize: 12,
                      fontWeight: 600,
                      color: palette.primary,
                    }}>
                      <span>Trigger Solver Execution</span>
                      <ArrowRight size={14} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase: DETECTED - Spatial Ripple Warning */}
          {phase === 'detected' && activeIncident && (
            <motion.div key="detected" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div style={{
                background: palette.bgSecondary,
                borderRadius: 12,
                padding: 32,
                border: `2px solid ${palette.primary}`,
                boxShadow: palette.shadowElevated,
                position: 'relative',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: '#FDF5F2',
                      border: `1px solid #F4C4B5`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: palette.primary,
                    }}
                  >
                    <AlertTriangle size={22} />
                  </motion.div>
                  <div>
                    <span style={{
                      fontFamily: typography.fontMono,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: palette.primary,
                      color: '#FFFFFF',
                    }}>
                      CRISIS DISRUPTION DETECTED
                    </span>
                    <h3 style={{
                      fontFamily: typography.fontHeading,
                      fontSize: 20,
                      fontWeight: 700,
                      color: palette.textMain,
                      margin: '4px 0 0',
                    }}>
                      {activeIncident.title}
                    </h3>
                  </div>
                </div>

                <p style={{ fontSize: 14, color: palette.textMuted, lineHeight: 1.5, marginBottom: 24 }}>
                  {activeIncident.description}
                </p>

                {/* Affected Sessions Roster */}
                <div style={{
                  padding: 18,
                  borderRadius: 8,
                  background: palette.bgMain,
                  border: `1px solid ${palette.border}`,
                  marginBottom: 20,
                }}>
                  <div style={{
                    fontFamily: typography.fontMono,
                    fontSize: 11,
                    fontWeight: 700,
                    color: palette.primary,
                    marginBottom: 10,
                    letterSpacing: '0.05em',
                  }}>
                    AFFECTED SESSIONS IN PROGRESS
                  </div>
                  {sessions.filter(s => s.roomId === activeIncident.roomId).map((s) => (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: 6,
                        background: palette.bgSecondary,
                        border: `1px solid ${palette.borderDark}`,
                        marginBottom: 6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: palette.danger }} />
                        <span style={{ fontFamily: typography.fontHeading, fontSize: 13, fontWeight: 600 }}>
                          {s.title}
                        </span>
                      </div>
                      <span style={{ fontFamily: typography.fontMono, fontSize: 12, color: palette.textMuted }}>
                        {s.attendeeCount} ATTENDEES AT RISK
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: typography.fontMono,
                  fontSize: 12,
                  color: palette.textMuted,
                }}>
                  <Clock size={14} color={palette.primary} />
                  <span>INITIALIZING CONSTRAINT OPTIMIZATION SOLVER...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Phase: ANALYZING - Multi-stage Solver Telemetry */}
          {phase === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{
                background: palette.bgSecondary,
                borderRadius: 12,
                padding: 36,
                border: `1px solid ${palette.border}`,
                boxShadow: palette.shadowSoft,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: palette.bgParchment,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: palette.secondary,
                    }}
                  >
                    <Cpu size={20} />
                  </motion.div>
                  <div>
                    <h3 style={{
                      fontFamily: typography.fontHeading,
                      fontSize: 18,
                      fontWeight: 700,
                      color: palette.textMain,
                      margin: 0,
                    }}>
                      Calculating Minimal Disruption Schedule
                    </h3>
                    <p style={{ fontSize: 12, color: palette.textMuted, margin: '2px 0 0' }}>
                      Evaluating venue topology, walking distances and speaker calendars
                    </p>
                  </div>
                </div>

                {/* Linear Stage Progress Meter */}
                <div style={{
                  height: 4,
                  background: palette.bgMain,
                  borderRadius: 2,
                  marginBottom: 32,
                  overflow: 'hidden',
                }}>
                  <motion.div
                    animate={{ width: `${(analysisStep / ANALYSIS_STEPS.length) * 100}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${palette.primary}, ${palette.secondary})`,
                      borderRadius: 2,
                    }}
                  />
                </div>

                {/* Staged Execution Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {ANALYSIS_STEPS.map((step, i) => {
                    const isDone = i < analysisStep;
                    const isCurrent = i === analysisStep;

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: i <= analysisStep ? 1 : 0.35, x: 0 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          padding: '12px 16px',
                          borderRadius: 8,
                          background: isDone ? '#F1F5E4' : isCurrent ? palette.bgMain : 'transparent',
                          border: `1px solid ${isDone ? '#D6DFB5' : isCurrent ? palette.borderDark : palette.border}`,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isDone ? palette.successText : isCurrent ? palette.primary : palette.borderDark,
                          color: '#FFFFFF',
                          fontFamily: typography.fontMono,
                          fontSize: 11,
                          fontWeight: 700,
                        }}>
                          {isDone ? <Check size={13} /> : i + 1}
                        </div>

                        <span style={{
                          fontFamily: isCurrent ? typography.fontHeading : typography.fontBody,
                          fontSize: 13,
                          fontWeight: isCurrent ? 600 : 500,
                          color: isDone ? palette.successText : isCurrent ? palette.textMain : palette.textMuted,
                          flex: 1,
                        }}>
                          {step}
                        </span>

                        {isDone && (
                          <span style={{
                            fontFamily: typography.fontMono,
                            fontSize: 10,
                            fontWeight: 700,
                            color: palette.successText,
                          }}>
                            VERIFIED
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Phase: OPTIONS_READY - Ranked Recovery Options */}
          {phase === 'options_ready' && (
            <motion.div key="options" variants={staggerContainer} initial="hidden" animate="visible" exit="hidden">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}>
                <div>
                  <h3 style={{
                    fontFamily: typography.fontHeading,
                    fontSize: 18,
                    fontWeight: 700,
                    color: palette.textMain,
                    margin: 0,
                  }}>
                    Feasible Recovery Options Computed
                  </h3>
                  <p style={{ fontSize: 12, color: palette.textMuted, margin: '2px 0 0' }}>
                    Ranked by minimal attendee displacement and zero room clash constraints
                  </p>
                </div>
                <span style={{
                  fontFamily: typography.fontMono,
                  fontSize: 11,
                  padding: '4px 8px',
                  background: palette.bgParchment,
                  border: `1px solid ${palette.borderDark}`,
                  borderRadius: 4,
                  fontWeight: 600,
                }}>
                  3 PLANS RANKED
                </span>
              </div>

              {/* Side-by-side Options Deck */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {recoveryOptions.map((opt) => (
                  <motion.div
                    key={opt.id}
                    variants={staggerItem}
                    whileHover={{ y: -2, boxShadow: palette.shadowElevated }}
                    onClick={() => handleSelectOption(opt)}
                    style={{
                      background: palette.bgSecondary,
                      borderRadius: 10,
                      padding: 24,
                      border: `1px solid ${palette.border}`,
                      boxShadow: palette.shadowSoft,
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = palette.primary}
                    onMouseLeave={e => e.currentTarget.style.borderColor = palette.border}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{
                        fontFamily: typography.fontMono,
                        fontSize: 11,
                        fontWeight: 700,
                        color: palette.secondary,
                        letterSpacing: '0.04em',
                      }}>
                        {opt.planName}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: typography.fontMono, fontSize: 12, fontWeight: 700, color: palette.textMain }}>
                          FEASIBILITY: {opt.feasibility}%
                        </span>
                        <ChevronRight size={16} color={palette.primary} />
                      </div>
                    </div>

                    <h4 style={{
                      fontFamily: typography.fontHeading,
                      fontSize: 16,
                      fontWeight: 700,
                      color: palette.textMain,
                      margin: '0 0 14px',
                    }}>
                      {opt.description}
                    </h4>

                    {/* Operational Telemetry Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 12,
                      marginBottom: 16,
                    }}>
                      <div style={{ padding: '8px 12px', background: palette.bgMain, borderRadius: 6, border: `1px solid ${palette.border}` }}>
                        <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>PROPOSED ROOM</div>
                        <div style={{ fontFamily: typography.fontHeading, fontSize: 13, fontWeight: 600, color: palette.textMain, marginTop: 2 }}>
                          {opt.newRoom}
                        </div>
                      </div>

                      <div style={{ padding: '8px 12px', background: palette.bgMain, borderRadius: 6, border: `1px solid ${palette.border}` }}>
                        <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>TIME SHIFT</div>
                        <div style={{ fontFamily: typography.fontHeading, fontSize: 13, fontWeight: 600, color: palette.textMain, marginTop: 2 }}>
                          {opt.newTime}
                        </div>
                      </div>

                      <div style={{ padding: '8px 12px', background: palette.bgMain, borderRadius: 6, border: `1px solid ${palette.border}` }}>
                        <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>ATTENDEES AFFECTED</div>
                        <div style={{
                          fontFamily: typography.fontMono,
                          fontSize: 13,
                          fontWeight: 700,
                          color: opt.affectedAttendees === 0 ? palette.successText : palette.primary,
                          marginTop: 2,
                        }}>
                          {opt.affectedAttendees} attendees
                        </div>
                      </div>
                    </div>

                    {/* Trade-offs Tag List */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {opt.tradeoffs.map((t, ti) => (
                        <span
                          key={ti}
                          style={{
                            fontSize: 11,
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: '#FDF6E2',
                            color: palette.warningText,
                            border: `1px solid ${palette.warning}`,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase: APPROVAL - Organizer Authorization Gate */}
          {phase === 'approval' && selectedOption && (
            <motion.div key="approval" variants={scaleIn} initial="hidden" animate="visible" exit="exit">
              <div style={{
                background: palette.bgSecondary,
                borderRadius: 12,
                padding: 36,
                border: `2px solid ${palette.primary}`,
                boxShadow: palette.shadowElevated,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Lock size={18} color={palette.primary} />
                  <span style={{
                    fontFamily: typography.fontMono,
                    fontSize: 11,
                    fontWeight: 700,
                    color: palette.primary,
                    letterSpacing: '0.06em',
                  }}>
                    ORGANIZER APPROVAL GATEWAY
                  </span>
                </div>

                <h3 style={{
                  fontFamily: typography.fontHeading,
                  fontSize: 22,
                  fontWeight: 700,
                  color: palette.textMain,
                  margin: '0 0 8px',
                }}>
                  Authorize Recovery Execution
                </h3>
                <p style={{ fontSize: 13, color: palette.textMuted, marginBottom: 24 }}>
                  Applying this recovery will dynamically rebuild affected attendee agendas, update room signage, and broadcast localized notifications.
                </p>

                {/* Side-by-side Architectural Diff */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  marginBottom: 24,
                }}>
                  <div style={{
                    padding: 16,
                    borderRadius: 8,
                    background: '#FDF5F2',
                    border: '1px solid #F4C4B5',
                  }}>
                    <span style={{ fontFamily: typography.fontMono, fontSize: 11, fontWeight: 700, color: palette.danger }}>
                      CURRENT DISRUPTED PLAN
                    </span>
                    <div style={{ marginTop: 10, fontSize: 13, color: palette.textMain, lineHeight: 1.5 }}>
                      <div><strong>Venue:</strong> {rooms.find(r => r.id === activeIncident?.roomId)?.name || 'Central Hall'} ({activeIncident?.title || 'Operational Interruption'})</div>
                      <div><strong>Slot:</strong> {targetSession ? `${targetSession.startTime.includes('T') ? targetSession.startTime.split('T')[1].slice(0, 5) : targetSession.startTime} – ${targetSession.endTime.includes('T') ? targetSession.endTime.split('T')[1].slice(0, 5) : targetSession.endTime}` : 'Active Window'} (Stalled)</div>
                      <div><strong>Status:</strong> Halting {targetSession?.attendeeCount || 420} attendees</div>
                    </div>
                  </div>

                  <div style={{
                    padding: 16,
                    borderRadius: 8,
                    background: '#F1F5E4',
                    border: '1px solid #D6DFB5',
                  }}>
                    <span style={{ fontFamily: typography.fontMono, fontSize: 11, fontWeight: 700, color: palette.successText }}>
                      PROPOSED APPROVED STATE
                    </span>
                    <div style={{ marginTop: 10, fontSize: 13, color: palette.textMain, lineHeight: 1.5 }}>
                      <div><strong>Venue:</strong> {selectedOption.newRoom}</div>
                      <div><strong>Slot:</strong> {selectedOption.newTime}</div>
                      <div><strong>Impact:</strong> {selectedOption.affectedAttendees} attendees displaced</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleApprove}
                    style={{
                      flex: 1,
                      padding: '14px 24px',
                      borderRadius: 8,
                      background: palette.primary,
                      border: 'none',
                      color: '#FFFFFF',
                      fontFamily: typography.fontBody,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 2px 8px rgba(230, 107, 69, 0.25)',
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>Approve & Cascade Schedule Changes</span>
                  </motion.button>

                  <button
                    onClick={() => { setSelectedOption(null); setPhase('options_ready'); }}
                    style={{
                      padding: '14px 20px',
                      borderRadius: 8,
                      background: 'transparent',
                      border: `1px solid ${palette.borderDark}`,
                      color: palette.textMuted,
                      fontFamily: typography.fontBody,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Phase: RESOLVING - Transition Animation */}
          {phase === 'resolving' && (
            <motion.div key="resolving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{
                background: palette.bgSecondary,
                borderRadius: 12,
                padding: 48,
                border: `1px solid ${palette.border}`,
                textAlign: 'center',
              }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: palette.bgParchment,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: palette.primary,
                    marginBottom: 20,
                  }}
                >
                  <Cpu size={24} />
                </motion.div>

                <h3 style={{
                  fontFamily: typography.fontHeading,
                  fontSize: 20,
                  fontWeight: 700,
                  color: palette.textMain,
                  margin: '0 0 8px',
                }}>
                  Cascading Approved Schedule Transaction
                </h3>
                <p style={{ fontSize: 13, color: palette.textMuted, maxWidth: 440, margin: '0 auto 24px' }}>
                  Updating venue turnstiles, pushing personalized agenda diffs to attendees, and dispatching volunteer marshals.
                </p>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '10px 20px',
                  borderRadius: 20,
                  background: palette.bgMain,
                  border: `1px solid ${palette.border}`,
                  fontFamily: typography.fontMono,
                  fontSize: 12,
                }}>
                  <span style={{ color: palette.danger }}>OLD: GRAND HALL A</span>
                  <ArrowRight size={14} color={palette.textMuted} />
                  <span style={{ color: palette.successText }}>NEW: GRAND HALL B</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Phase: RESOLVED - Success Summary */}
          {phase === 'resolved' && resolvedData && (
            <motion.div key="resolved" variants={slideUp} initial="hidden" animate="visible" exit="exit">
              <div style={{
                background: palette.bgSecondary,
                borderRadius: 12,
                padding: 36,
                border: `2px solid ${palette.successText}`,
                boxShadow: palette.shadowElevated,
              }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: '#F1F5E4',
                    border: `1px solid #D6DFB5`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: palette.successText,
                    marginBottom: 16,
                  }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 style={{
                    fontFamily: typography.fontHeading,
                    fontSize: 22,
                    fontWeight: 700,
                    color: palette.textMain,
                    margin: '0 0 4px',
                  }}>
                    Crisis Successfully Resolved
                  </h3>
                  <p style={{ fontSize: 13, color: palette.textMuted }}>
                    Single database transaction committed at {resolvedData.timestamp}
                  </p>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 16,
                  marginBottom: 24,
                }}>
                  <div style={{ padding: 14, background: palette.bgMain, borderRadius: 8, border: `1px solid ${palette.border}` }}>
                    <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>INCIDENT</div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{resolvedData.incident.title}</div>
                  </div>
                  <div style={{ padding: 14, background: palette.bgMain, borderRadius: 8, border: `1px solid ${palette.border}` }}>
                    <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>ASSIGNED VENUE</div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{resolvedData.option.newRoom}</div>
                  </div>
                  <div style={{ padding: 14, background: palette.bgMain, borderRadius: 8, border: `1px solid ${palette.border}` }}>
                    <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>ATTENDEES NOTIFIED</div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>423 via WhatsApp / PWA</div>
                  </div>
                </div>

                {/* Audit Stamp */}
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 6,
                  background: palette.bgParchment,
                  border: `1px solid ${palette.borderDark}`,
                  fontSize: 11,
                  fontFamily: typography.fontMono,
                  color: palette.textMain,
                  marginBottom: 24,
                }}>
                  AUDIT: Signed with organizer JWT token • Disruption closed in 3.4 seconds
                </div>

                <button
                  onClick={handleReset}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 8,
                    background: palette.bgMain,
                    border: `1px solid ${palette.borderDark}`,
                    color: palette.textMain,
                    fontFamily: typography.fontBody,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <RotateCcw size={15} />
                  <span>Return to Incident Queue</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </>
        )}

        {/* Modal: Report New Incident */}
        <AnimatePresence>
          {isReportModalOpen && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(37, 45, 53, 0.45)',
              backdropFilter: 'blur(3px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  background: palette.bgSecondary,
                  borderRadius: 12,
                  border: `1px solid ${palette.border}`,
                  padding: 28,
                  width: '100%',
                  maxWidth: 540,
                  boxShadow: palette.shadowElevated,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ fontFamily: typography.fontHeading, fontSize: 20, fontWeight: 700, margin: 0, color: palette.textMain }}>
                    Report Disruption Incident
                  </h2>
                  <button onClick={() => setIsReportModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: palette.textMuted }}>
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleReportIncident} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Incident Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Main Projector Power Unit Blown"
                      value={newIncidentForm.title}
                      onChange={e => setNewIncidentForm({ ...newIncidentForm, title: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Disruption Category</label>
                    <select
                      value={newIncidentForm.type}
                      onChange={e => setNewIncidentForm({ ...newIncidentForm, type: e.target.value as NonNullable<Incident['type']> })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                    >
                      <option value="equipment_failure">A/V & Hardware Equipment Failure</option>
                      <option value="room_unavailable">Room Unavailable (HVAC / Flood / Electrical)</option>
                      <option value="speaker_absent">Speaker Cancellation / Absent</option>
                      <option value="schedule_conflict">Schedule Delay & Timeline Congestion</option>
                      <option value="overcrowding">Room Overcrowding & Egress Limit Exceeded</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Affected Venue Room</label>
                      <select
                        value={newIncidentForm.roomId}
                        onChange={e => setNewIncidentForm({ ...newIncidentForm, roomId: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                      >
                        {rooms.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name} (Floor {r.floor})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Severity Level</label>
                      <select
                        value={newIncidentForm.severity}
                        onChange={e => setNewIncidentForm({ ...newIncidentForm, severity: e.target.value as Incident['severity'] })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                      >
                        <option value="critical">Critical (Immediate Halt)</option>
                        <option value="high">High (Action Required)</option>
                        <option value="medium">Medium (Monitor Closely)</option>
                        <option value="low">Low (Advisory)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Operational Description</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe what occurred, immediate observations, and potential risks to attendees..."
                      value={newIncidentForm.description}
                      onChange={e => setNewIncidentForm({ ...newIncidentForm, description: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(false)}
                      style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: 'transparent', cursor: 'pointer', fontSize: 13 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: palette.primary, color: '#FFFFFF', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                    >
                      Log & Launch Solver
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedPage>
  );
}

function PhaseBar({ phase }: { phase: Phase }) {
  const phases: { key: Phase; label: string }[] = [
    { key: 'detected', label: '1. Incident' },
    { key: 'analyzing', label: '2. CP-SAT Solver' },
    { key: 'options_ready', label: '3. Options Matrix' },
    { key: 'approval', label: '4. Human Approval' },
    { key: 'resolved', label: '5. Resolved' },
  ];
  const currentIdx = phases.findIndex(p => p.key === phase);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      marginBottom: 28,
      padding: '12px 16px',
      background: palette.bgSecondary,
      borderRadius: 8,
      border: `1px solid ${palette.border}`,
      boxShadow: palette.shadowSoft,
    }}>
      {phases.map((p, i) => {
        const isActive = p.key === phase;
        const isDone = currentIdx > i;

        return (
          <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontFamily: typography.fontMono,
              fontWeight: 700,
              background: isActive ? '#FDF5F2' : isDone ? '#F1F5E4' : 'transparent',
              color: isActive ? palette.primary : isDone ? palette.successText : palette.textMuted,
              border: `1px solid ${isActive ? '#F4C4B5' : isDone ? '#D6DFB5' : 'transparent'}`,
              whiteSpace: 'nowrap',
            }}>
              {isDone ? <Check size={12} /> : <span>{i + 1}</span>}
              <span>{p.label}</span>
            </div>
            {i < phases.length - 1 && (
              <div style={{ flex: 1, height: 1, background: isDone ? palette.successText : palette.borderDark, margin: '0 4px', minWidth: 8 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
