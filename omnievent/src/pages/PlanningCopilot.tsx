import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Sparkles,
  DollarSign,
  Check,
  Plus,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  Trash2,
  Edit3,
  X,
  Layers,
  Building2,
} from 'lucide-react';
import { palette, typography, trackStyles } from '../lib/theme';
import { AnimatedPage } from '../components/animated/AnimatedPage';
import { budgetData } from '../lib/demo-data';
import { useEventState } from '../context/EventStateContext';
import type { Session, Track } from '../lib/types';

interface Task {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  assignee: string;
}

const initialTasks: Task[] = [
  { id: 't1', title: 'Confirm keynote speaker availability (Dr. Debal C. Kar & VC)', category: 'Content', priority: 'high', status: 'completed', dueDate: 'Nov 08', assignee: 'KRC Directorate' },
  { id: 't2', title: 'Finalize GUKC Library floor layout and emergency egress corridors', category: 'Logistics', priority: 'high', status: 'completed', dueDate: 'Nov 08', assignee: 'Estate Facilities' },
  { id: 't3', title: 'Send faculty & research scholar briefing packets', category: 'Content', priority: 'high', status: 'in_progress', dueDate: 'Today', assignee: 'SCSE Research Desk' },
  { id: 't4', title: 'Configure dual 4K laser projection in GUKC Central Auditorium', category: 'Logistics', priority: 'medium', status: 'in_progress', dueDate: 'Today', assignee: 'Campus IT AV Cell' },
  { id: 't5', title: 'Calibrate WebOPAC digital kiosks & RFID turnstile gates', category: 'Operations', priority: 'medium', status: 'pending', dueDate: 'Tomorrow', assignee: 'Automation Core' },
  { id: 't6', title: 'Audit High-Tea & buffet covers with catering committee', category: 'Logistics', priority: 'low', status: 'pending', dueDate: 'Tomorrow', assignee: 'Hospitality Cell' },
  { id: 't7', title: 'Distribute live schedule & badges to student marshals', category: 'Operations', priority: 'high', status: 'pending', dueDate: 'Today', assignee: 'Student Volunteers' },
  { id: 't8', title: 'Run HPC model cluster latency tests in AI & Data Science Block', category: 'Operations', priority: 'high', status: 'pending', dueDate: 'Tomorrow', assignee: 'Network Cell' },
  { id: 't9', title: 'Prepare IEEE Xplore digital feedback survey schema', category: 'Marketing', priority: 'low', status: 'pending', dueDate: 'Next week', assignee: 'Academic Research' },
];

const categories = ['All', 'Content', 'Logistics', 'Operations', 'Marketing'];

export default function PlanningCopilot() {
  const {
    eventMeta,
    updateEventMeta,
    sessions,
    addSession,
    updateSession,
    deleteSession,
    rooms,
    speakers,
    roomConflicts,
    speakerConflicts,
    capacityWarnings,
  } = useEventState();

  const [activeTab, setActiveTab] = useState<'schedule' | 'tasks' | 'budget'>('schedule');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeCategory, setActiveCategory] = useState('All');

  // Modals state
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  // Event Meta Form state
  const [metaForm, setMetaForm] = useState({
    name: eventMeta.name,
    subtitle: eventMeta.subtitle,
    venue: eventMeta.venue,
    city: eventMeta.city,
    maxCapacity: eventMeta.maxCapacity,
    primaryOrganizer: eventMeta.primaryOrganizer,
  });

  // Session Form state
  const [sessionForm, setSessionForm] = useState(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return {
      title: '',
      description: '',
      track: 'keynote' as Track,
      roomId: rooms[0]?.id || 'r1',
      speakerId: speakers[0]?.id || 's1',
      startTime: `${todayStr}T10:00:00`,
      endTime: `${todayStr}T11:00:00`,
      maxAttendees: 200,
    };
  });

  const toggleTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
        : t
    ));
  }, []);

  const handleSaveEventMeta = (e: React.FormEvent) => {
    e.preventDefault();
    updateEventMeta({
      name: metaForm.name,
      subtitle: metaForm.subtitle,
      venue: metaForm.venue,
      city: metaForm.city,
      maxCapacity: Number(metaForm.maxCapacity),
      primaryOrganizer: metaForm.primaryOrganizer,
    });
    setIsEditEventModalOpen(false);
  };

  const handleCreateOrUpdateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedSpeaker = speakers.find(s => s.id === sessionForm.speakerId);
    if (editingSession) {
      updateSession(editingSession.id, {
        title: sessionForm.title,
        description: sessionForm.description,
        track: sessionForm.track,
        roomId: sessionForm.roomId,
        speakers: selectedSpeaker ? [selectedSpeaker] : [],
        speakerId: sessionForm.speakerId,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        maxAttendees: Number(sessionForm.maxAttendees),
      });
      setEditingSession(null);
    } else {
      addSession({
        title: sessionForm.title,
        description: sessionForm.description,
        track: sessionForm.track,
        roomId: sessionForm.roomId,
        status: 'scheduled',
        speakers: selectedSpeaker ? [selectedSpeaker] : [],
        speakerId: sessionForm.speakerId,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        attendeeCount: 0,
        maxAttendees: Number(sessionForm.maxAttendees),
      });
    }
    setIsAddSessionModalOpen(false);
  };

  const openEditSessionModal = (s: Session) => {
    setEditingSession(s);
    setSessionForm({
      title: s.title,
      description: s.description || '',
      track: s.track,
      roomId: s.roomId,
      speakerId: s.speakers?.[0]?.id || s.speakerId || speakers[0]?.id || '',
      startTime: s.startTime,
      endTime: s.endTime,
      maxAttendees: s.maxAttendees || 100,
    });
    setIsAddSessionModalOpen(true);
  };

  const filteredTasks = activeCategory === 'All'
    ? tasks
    : tasks.filter(t => t.category === activeCategory);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  // Budget calculations
  const totalPlannedBudget = budgetData.reduce((sum, b) => sum + b.planned, 0);
  const totalActualBudget = budgetData.reduce((sum, b) => sum + b.actual, 0);
  const budgetVariance = totalActualBudget - totalPlannedBudget;

  const totalConflicts = roomConflicts.length + speakerConflicts.length + capacityWarnings.length;

  return (
    <AnimatedPage>
      <div style={{ maxWidth: 1360, margin: '0 auto', fontFamily: typography.fontBody, paddingBottom: 60 }}>
        {/* Editorial Top Bar with Event Metadata & Quick Edit */}
        <div style={{
          background: palette.bgSecondary,
          borderRadius: 12,
          border: `1px solid ${palette.border}`,
          padding: '24px 28px',
          boxShadow: palette.shadowSoft,
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
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
                EVENT PLANNER & ARCHITECTURAL WORKSPACE
              </div>
              <h1 style={{
                fontFamily: typography.fontHeading,
                fontSize: 30,
                fontWeight: 700,
                color: palette.textMain,
                letterSpacing: '-0.03em',
                margin: 0,
              }}>
                {eventMeta.name}
              </h1>
              <p style={{ fontSize: 13, color: palette.textMuted, margin: '6px 0 0' }}>
                {eventMeta.subtitle} • {eventMeta.venue}, {eventMeta.city}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                onClick={() => {
                  setMetaForm({
                    name: eventMeta.name,
                    subtitle: eventMeta.subtitle,
                    venue: eventMeta.venue,
                    city: eventMeta.city,
                    maxCapacity: eventMeta.maxCapacity,
                    primaryOrganizer: eventMeta.primaryOrganizer,
                  });
                  setIsEditEventModalOpen(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  borderRadius: 6,
                  border: `1px solid ${palette.borderDark}`,
                  background: palette.bgMain,
                  color: palette.textMain,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <Edit3 size={14} />
                Edit Event Info
              </button>

              <button
                onClick={() => {
                  const nowStr = new Date().toISOString().split('T')[0];
                  setEditingSession(null);
                  setSessionForm({
                    title: '',
                    description: '',
                    track: 'keynote',
                    roomId: rooms[0]?.id || 'r1',
                    speakerId: speakers[0]?.id || 's1',
                    startTime: `${nowStr}T10:00:00`,
                    endTime: `${nowStr}T11:00:00`,
                    maxAttendees: 200,
                  });
                  setIsAddSessionModalOpen(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  borderRadius: 6,
                  border: 'none',
                  background: palette.primary,
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(230, 107, 69, 0.25)',
                }}
              >
                <Plus size={15} />
                Schedule New Session
              </button>
            </div>
          </div>

          {/* Quick Meta Badges */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 20,
            marginTop: 18,
            paddingTop: 16,
            borderTop: `1px solid ${palette.border}`,
            fontFamily: typography.fontMono,
            fontSize: 11,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: palette.textMuted }}>
              <Building2 size={13} color={palette.secondary} />
              <span>VENUE: <strong style={{ color: palette.textMain }}>{eventMeta.venue}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: palette.textMuted }}>
              <Users size={13} color={palette.primary} />
              <span>MAX CAPACITY: <strong style={{ color: palette.textMain }}>{eventMeta.maxCapacity.toLocaleString()} attendees</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: palette.textMuted }}>
              <Layers size={13} color={palette.successText} />
              <span>ACTIVE SESSIONS: <strong style={{ color: palette.textMain }}>{sessions.length}</strong> ({progressPct}% tasks ready)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: palette.textMuted }}>
              <span>LEAD: <strong style={{ color: palette.textMain }}>{eventMeta.primaryOrganizer}</strong></span>
            </div>
          </div>
        </div>

        {/* Real-time Conflict Alert Banners */}
        {totalConflicts > 0 && (
          <div style={{
            background: '#FDEAE9',
            border: '1px solid #F7C6C4',
            borderRadius: 10,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: palette.danger, fontWeight: 700, fontSize: 13 }}>
              <AlertTriangle size={16} />
              <span>CONSTRAINT ENGINE: {totalConflicts} Active Schedule Conflicts Detected</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {roomConflicts.map((c, idx) => (
                <div key={`rc-${idx}`} style={{
                  background: '#FFFFFF',
                  borderRadius: 6,
                  border: '1px solid #F7C6C4',
                  padding: '6px 12px',
                  fontSize: 11,
                  fontFamily: typography.fontMono,
                  color: palette.danger,
                }}>
                  <strong>ROOM OVERLAP ({c.roomName}):</strong> "{c.sessionA.title.slice(0, 22)}..." clashes with "{c.sessionB.title.slice(0, 22)}..."
                </div>
              ))}
              {speakerConflicts.map((c, idx) => (
                <div key={`sc-${idx}`} style={{
                  background: '#FFFFFF',
                  borderRadius: 6,
                  border: '1px solid #F7C6C4',
                  padding: '6px 12px',
                  fontSize: 11,
                  fontFamily: typography.fontMono,
                  color: palette.danger,
                }}>
                  <strong>SPEAKER DOUBLE-BOOKING ({c.speakerName}):</strong> Assigned to 2 concurrent sessions
                </div>
              ))}
              {capacityWarnings.map((w, idx) => (
                <div key={`cw-${idx}`} style={{
                  background: '#FFFFFF',
                  borderRadius: 6,
                  border: '1px solid #EBCB73',
                  padding: '6px 12px',
                  fontSize: 11,
                  fontFamily: typography.fontMono,
                  color: '#9E6D00',
                }}>
                  <strong>CAPACITY OVERFLOW:</strong> "{w.session.title.slice(0, 20)}..." in {w.room.name} exceeds capacity by {w.excess} seats
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Switcher Tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          borderBottom: `1px solid ${palette.border}`,
          paddingBottom: 10,
        }}>
          {[
            { id: 'schedule', label: `Event Schedule (${sessions.length} Sessions)`, icon: Calendar },
            { id: 'tasks', label: `Execution Tasks (${completedCount}/${totalCount})`, icon: Check },
            { id: 'budget', label: 'Budget & Resource Ledger', icon: DollarSign },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: isActive ? palette.primary : 'transparent',
                  color: isActive ? '#FFFFFF' : palette.textMuted,
                  fontFamily: typography.fontBody,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: SESSIONS SCHEDULE MATRIX */}
        {activeTab === 'schedule' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
              {sessions.map(s => {
                const room = rooms.find(r => r.id === s.roomId);
                const speakerNames = s.speakers?.map(sp => sp.name).join(', ') || 'Unassigned Speaker';
                const trackCfg = trackStyles[s.track] || { bg: palette.bgMain, text: palette.textMain, border: palette.border, label: s.track };
                const startTimeFormatted = s.startTime.includes('T')
                  ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : s.startTime;
                const endTimeFormatted = s.endTime.includes('T')
                  ? new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : s.endTime;

                return (
                  <div
                    key={s.id}
                    style={{
                      background: palette.bgSecondary,
                      borderRadius: 10,
                      border: `1px solid ${palette.border}`,
                      padding: '18px 20px',
                      boxShadow: palette.shadowSoft,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                      position: 'relative',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                        <span style={{
                          fontSize: 10,
                          fontFamily: typography.fontMono,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: 4,
                          background: trackCfg.bg,
                          color: trackCfg.text,
                          border: `1px solid ${trackCfg.border}`,
                        }}>
                          {trackCfg.label}
                        </span>

                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => openEditSessionModal(s)}
                            title="Edit Session"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: palette.textMuted,
                              cursor: 'pointer',
                              padding: 4,
                            }}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => deleteSession(s.id)}
                            title="Delete Session"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: palette.danger,
                              cursor: 'pointer',
                              padding: 4,
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <h3 style={{
                        fontFamily: typography.fontHeading,
                        fontSize: 16,
                        fontWeight: 700,
                        color: palette.textMain,
                        margin: '0 0 6px',
                        lineHeight: 1.3,
                      }}>
                        {s.title}
                      </h3>
                      {s.description && (
                        <p style={{ fontSize: 12, color: palette.textMuted, margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {s.description}
                        </p>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      paddingTop: 12,
                      borderTop: `1px solid ${palette.border}`,
                      fontFamily: typography.fontMono,
                      fontSize: 11,
                      color: palette.textMuted,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={12} color={palette.secondary} />
                        <span>{startTimeFormatted} – {endTimeFormatted}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={12} color={palette.primary} />
                        <span>{room?.name || 'Unassigned Hall'} (Floor {room?.floor || 1})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Users size={12} />
                          <span>SPEAKER: <strong style={{ color: palette.textMain }}>{speakerNames}</strong></span>
                        </div>
                        <span style={{ color: palette.textMain, fontWeight: 700 }}>
                          {s.attendeeCount || 0}/{s.maxAttendees || 100} CAP
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: DAG EXECUTION TASKS */}
        {activeTab === 'tasks' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontFamily: typography.fontBody,
                      fontWeight: activeCategory === cat ? 600 : 500,
                      cursor: 'pointer',
                      background: activeCategory === cat ? palette.bgParchment : palette.bgSecondary,
                      border: `1px solid ${activeCategory === cat ? palette.borderDark : palette.border}`,
                      color: activeCategory === cat ? palette.textMain : palette.textMuted,
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredTasks.map((task) => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '14px 18px',
                        borderRadius: 8,
                        background: isCompleted ? palette.bgMain : palette.bgSecondary,
                        border: `1px solid ${isCompleted ? palette.border : palette.borderDark}`,
                        cursor: 'pointer',
                        opacity: isCompleted ? 0.65 : 1,
                      }}
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        border: `1.5px solid ${isCompleted ? palette.successText : palette.textMuted}`,
                        background: isCompleted ? palette.successText : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        flexShrink: 0,
                      }}>
                        {isCompleted && <Check size={13} strokeWidth={2.5} />}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: palette.textMain,
                          textDecoration: isCompleted ? 'line-through' : 'none',
                        }}>
                          {task.title}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontFamily: typography.fontMono,
                          fontSize: 10,
                          color: palette.textMuted,
                          marginTop: 3,
                        }}>
                          <span>{task.category.toUpperCase()}</span>
                          <span>•</span>
                          <span>ASSIGNEE: {task.assignee}</span>
                        </div>
                      </div>

                      <span style={{
                        fontFamily: typography.fontMono,
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: task.priority === 'high' ? '#FDEAE9' : '#FDF6E2',
                        color: task.priority === 'high' ? palette.danger : palette.warningText,
                        border: `1px solid ${task.priority === 'high' ? '#F7C6C4' : palette.warning}`,
                        textTransform: 'uppercase',
                      }}>
                        {task.dueDate}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Roadmap Overview */}
            <div style={{
              background: palette.bgSecondary,
              borderRadius: 12,
              border: `1px solid ${palette.border}`,
              padding: 24,
              boxShadow: palette.shadowSoft,
            }}>
              <h3 style={{ fontFamily: typography.fontHeading, fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>
                Roadmap Completion Status
              </h3>
              <p style={{ fontSize: 13, color: palette.textMuted, lineHeight: 1.5 }}>
                Current critical path velocity indicates 100% readiness for keynote opening. All security, audio-visual calibrations and emergency egress approvals have passed.
              </p>
              <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: '#F1F5E4', border: '1px solid #D6DFB5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Sparkles size={14} color={palette.successText} />
                  <span style={{ fontFamily: typography.fontMono, fontSize: 10, fontWeight: 700, color: palette.successText }}>
                    INTELLIGENT DAG RESOLVER
                  </span>
                </div>
                <p style={{ fontSize: 12, color: palette.textMain, margin: 0 }}>
                  No blocking cyclic dependencies found in task assignments. All critical A/V assets reserved.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BUDGET VARIANCE */}
        {activeTab === 'budget' && (
          <div style={{
            background: palette.bgSecondary,
            borderRadius: 12,
            border: `1px solid ${palette.border}`,
            padding: 24,
            boxShadow: palette.shadowSoft,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: typography.fontHeading, fontSize: 18, fontWeight: 700, margin: 0 }}>
                  Budget & Expense Allocation Ledger
                </h3>
                <p style={{ fontSize: 13, color: palette.textMuted, margin: '4px 0 0' }}>
                  Real-time cost variances tracked against planned operational envelopes.
                </p>
              </div>
              <div style={{ fontFamily: typography.fontMono, fontSize: 12 }}>
                <span style={{ color: palette.textMuted }}>TOTAL BURN: </span>
                <strong style={{ color: budgetVariance > 0 ? palette.danger : palette.successText }}>
                  ${totalActualBudget.toLocaleString()} / ${totalPlannedBudget.toLocaleString()}
                </strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {budgetData.map((item) => {
                const diff = item.actual - item.planned;
                const isOver = diff > 0;
                return (
                  <div
                    key={item.category}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 8,
                      background: palette.bgMain,
                      border: `1px solid ${palette.border}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: palette.textMain }}>{item.category}</span>
                      <span style={{ fontFamily: typography.fontMono, fontSize: 12, fontWeight: 700, color: isOver ? palette.danger : palette.successText }}>
                        ${item.actual.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>
                      <span>PLANNED: ${item.planned.toLocaleString()}</span>
                      <span>{isOver ? `+$${diff.toLocaleString()} OVER` : `-$${Math.abs(diff).toLocaleString()} SAVED`}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal: Edit Event Metadata */}
        <AnimatePresence>
          {isEditEventModalOpen && (
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
                  <h2 style={{ fontFamily: typography.fontHeading, fontSize: 20, fontWeight: 700, margin: 0 }}>
                    Edit Event Information
                  </h2>
                  <button onClick={() => setIsEditEventModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: palette.textMuted }}>
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveEventMeta} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: palette.textMain }}>Event Name</label>
                    <input
                      type="text"
                      value={metaForm.name}
                      onChange={e => setMetaForm({ ...metaForm, name: e.target.value })}
                      required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: palette.textMain }}>Subtitle / Theme</label>
                    <input
                      type="text"
                      value={metaForm.subtitle}
                      onChange={e => setMetaForm({ ...metaForm, subtitle: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: palette.textMain }}>Venue Name</label>
                      <input
                        type="text"
                        value={metaForm.venue}
                        onChange={e => setMetaForm({ ...metaForm, venue: e.target.value })}
                        required
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: palette.textMain }}>City, Country</label>
                      <input
                        type="text"
                        value={metaForm.city}
                        onChange={e => setMetaForm({ ...metaForm, city: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: palette.textMain }}>Max Capacity</label>
                      <input
                        type="number"
                        value={metaForm.maxCapacity}
                        onChange={e => setMetaForm({ ...metaForm, maxCapacity: Number(e.target.value) })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontMono, boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: palette.textMain }}>Primary Lead</label>
                      <input
                        type="text"
                        value={metaForm.primaryOrganizer}
                        onChange={e => setMetaForm({ ...metaForm, primaryOrganizer: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={() => setIsEditEventModalOpen(false)}
                      style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: 'transparent', cursor: 'pointer', fontSize: 13 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: palette.primary, color: '#FFFFFF', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Create or Edit Session */}
        <AnimatePresence>
          {isAddSessionModalOpen && (
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
                  maxWidth: 580,
                  boxShadow: palette.shadowElevated,
                  maxHeight: '90vh',
                  overflowY: 'auto',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ fontFamily: typography.fontHeading, fontSize: 20, fontWeight: 700, margin: 0 }}>
                    {editingSession ? 'Edit Session' : 'Create New Session'}
                  </h2>
                  <button onClick={() => setIsAddSessionModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: palette.textMuted }}>
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateOrUpdateSession} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Session Title</label>
                    <input
                      type="text"
                      value={sessionForm.title}
                      onChange={e => setSessionForm({ ...sessionForm, title: e.target.value })}
                      required
                      placeholder="e.g. Keynote: Autonomous Infrastructure"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Description</label>
                    <textarea
                      value={sessionForm.description}
                      onChange={e => setSessionForm({ ...sessionForm, description: e.target.value })}
                      rows={2}
                      placeholder="Brief overview of the session scope and key topics..."
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Track</label>
                      <select
                        value={sessionForm.track}
                        onChange={e => setSessionForm({ ...sessionForm, track: e.target.value as Track })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                      >
                        <option value="keynote">Keynote</option>
                        <option value="workshop">Workshop</option>
                        <option value="panel">Panel</option>
                        <option value="breakout">Breakout</option>
                        <option value="networking">Networking</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Room / Venue Area</label>
                      <select
                        value={sessionForm.roomId}
                        onChange={e => setSessionForm({ ...sessionForm, roomId: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                      >
                        {rooms.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name} (Cap: {r.capacity}, Floor {r.floor})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Assigned Speaker</label>
                      <select
                        value={sessionForm.speakerId}
                        onChange={e => setSessionForm({ ...sessionForm, speakerId: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                      >
                        {speakers.map(sp => (
                          <option key={sp.id} value={sp.id}>
                            {sp.name} — {sp.title} ({sp.company})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Target Capacity</label>
                      <input
                        type="number"
                        value={sessionForm.maxAttendees}
                        onChange={e => setSessionForm({ ...sessionForm, maxAttendees: Number(e.target.value) })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontMono, boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Start Time</label>
                      <input
                        type="datetime-local"
                        value={sessionForm.startTime.slice(0, 16)}
                        onChange={e => setSessionForm({ ...sessionForm, startTime: `${e.target.value}:00` })}
                        required
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 12, fontFamily: typography.fontMono, boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>End Time</label>
                      <input
                        type="datetime-local"
                        value={sessionForm.endTime.slice(0, 16)}
                        onChange={e => setSessionForm({ ...sessionForm, endTime: `${e.target.value}:00` })}
                        required
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 12, fontFamily: typography.fontMono, boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                    <button
                      type="button"
                      onClick={() => setIsAddSessionModalOpen(false)}
                      style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: 'transparent', cursor: 'pointer', fontSize: 13 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: palette.primary, color: '#FFFFFF', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                    >
                      {editingSession ? 'Update Session' : 'Create Session'}
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
