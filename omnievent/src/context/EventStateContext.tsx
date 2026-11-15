import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { sessions as initialSessions, rooms as initialRooms, incidents as initialIncidents, speakers as initialSpeakers } from '../lib/demo-data';
import type { Session, Room, Incident, Speaker } from '../lib/types';
import { pulseApi } from '../lib/pulseApiClient';

export type EventStatus = 'planning' | 'live' | 'disrupted' | 'resolving' | 'completed' | 'frozen';

export interface EventMeta {
  id: string;
  name: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  venue: string;
  city: string;
  maxCapacity: number;
  status: 'planning' | 'live' | 'completed';
  primaryOrganizer: string;
}

export interface ResourceItem {
  id: string;
  name: string;
  category: 'volunteer' | 'catering' | 'equipment';
  allocated: number;
  forecastNeeded: number;
  location: string;
  status: 'optimal' | 'shortage' | 'surplus';
  costPerUnit: number;
  assignedRoomId?: string;
  assignedSessionId?: string;
}

export interface CommunicationMessage {
  id: string;
  audience: 'all' | 'speakers' | 'organizers' | 'session' | 'incident_affected';
  targetSessionTitle?: string;
  targetRoomName?: string;
  title: string;
  content: string;
  channel: 'whatsapp' | 'sms' | 'push' | 'email';
  status: 'draft' | 'approved' | 'dispatched';
  timestamp: string;
  recipientsCount: number;
  isAutoDraft?: boolean;
}

export interface BrainSignal {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'telemetry' | 'solve' | 'dispatch' | 'reroute' | 'rebalance';
  timestamp: string;
}

export interface ButterflyRipple {
  active: boolean;
  incidentId: string | null;
  affectedSessionId: string | null;
  affectedRoomId: string | null;
  targetRoomId: string | null;
  rippleStep: number; // 0 to 5
  connectedSessions: string[];
  reroutedAttendees: number;
  toastMessage: string | null;
}

export interface RoomConflict {
  roomId: string;
  roomName: string;
  sessionA: Session;
  sessionB: Session;
}

export interface SpeakerConflict {
  speakerId?: string;
  speakerName: string;
  sessionA: Session;
  sessionB: Session;
}

export interface CapacityWarning {
  session: Session;
  room: Room;
  excess: number;
}

interface EventStateContextType {
  status: EventStatus;
  setStatus: (s: EventStatus) => void;
  eventMeta: EventMeta;
  updateEventMeta: (meta: Partial<EventMeta>) => void;
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  addSession: (s: Omit<Session, 'id'>) => Session;
  updateSession: (id: string, s: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  updateRoom: (id: string, r: Partial<Room>) => void;
  speakers: Speaker[];
  incidents: Incident[];
  activeIncident: Incident | null;
  createIncident: (inc: Omit<Incident, 'id' | 'reportedAt' | 'status'>) => Incident;
  resolveIncidentById: (id: string) => void;
  butterfly: ButterflyRipple;
  triggerDisruption: (incidentId?: string) => void;
  advanceButterflyStep: () => void;
  resetDisruption: () => void;
  resolveDisruption: (planId?: string) => void;
  resolveDisruptionWithPlan: (plan: { id: string; sessionId?: string; newRoomId?: string; newTime?: string; rebalanceSummary?: string }) => void;
  isFrozen: boolean;
  toggleFreeze: () => void;
  simulatedTime: string;
  setSimulatedTime: React.Dispatch<React.SetStateAction<string>>;
  activeBrainSignals: BrainSignal[];
  fireBrainSignal: (signal: Omit<BrainSignal, 'id' | 'timestamp'>) => void;
  isCompletionModalOpen: boolean;
  openCompletionModal: () => void;
  closeCompletionModal: () => void;
  isIntroPlaying: boolean;
  playIntro: () => void;
  closeIntro: () => void;
  eventMetrics: {
    totalAttendees: number;
    checkedIn: number;
    activeSessions: number;
    resolvedIncidents: number;
    systemHealth: number;
  };
  // Dynamic Conflict Detection
  roomConflicts: RoomConflict[];
  speakerConflicts: SpeakerConflict[];
  capacityWarnings: CapacityWarning[];
  // Personal Attendee Agenda
  personalAgendaIds: string[];
  toggleAgendaSession: (sessionId: string) => void;
  isSessionInAgenda: (sessionId: string) => boolean;
  // Communications Queue
  messages: CommunicationMessage[];
  addMessage: (msg: Omit<CommunicationMessage, 'id' | 'timestamp'>) => void;
  approveAndDispatchMessage: (id: string) => void;
  deleteMessage: (id: string) => void;
  // Resource Inventory
  resources: ResourceItem[];
  addResource: (res: Omit<ResourceItem, 'id'>) => void;
  updateResource: (id: string, res: Partial<ResourceItem>) => void;
  rebalanceResources: () => void;
  // Ethical Backend Integration
  backendConnected: boolean;
  verifyCryptographicLedger: () => Promise<unknown>;
}

const defaultEventMeta: EventMeta = {
  id: 'evt-gu-summit-2026',
  name: 'Galgotias University AI & Knowledge Conclave 2026',
  subtitle: 'National Conclave on AI, Scalable Knowledge Graphs & Digital Libraries',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  venue: 'Galgotias University Knowledge Centre (GUKC) & Central Library',
  city: 'Greater Noida, Uttar Pradesh, India',
  maxCapacity: 2200,
  status: 'live',
  primaryOrganizer: 'Dr. Debal C. Kar (University Librarian & Head Knowledge Resource Centre)',
};

const defaultResources: ResourceItem[] = [
  { id: 'res-1', name: 'Student Volunteer Marshals (SCSE & AI Society)', category: 'volunteer', allocated: 18, forecastNeeded: 14, location: 'GUKC Main Portico & Foyer', status: 'surplus', costPerUnit: 15 },
  { id: 'res-2', name: 'OPAC Helpdesk Assistants & Microphone Runners', category: 'volunteer', allocated: 6, forecastNeeded: 10, location: 'Level 2 Corridor & Discussion Wings', status: 'shortage', costPerUnit: 15, assignedRoomId: 'r3' },
  { id: 'res-3', name: 'Scholarly Conclave High-Tea & Espresso Service', category: 'catering', allocated: 650, forecastNeeded: 750, location: 'Scholarly Networking Atrium', status: 'shortage', costPerUnit: 3, assignedRoomId: 'r8' },
  { id: 'res-4', name: 'Conference Luncheon Covers (Faculty & Delegates)', category: 'catering', allocated: 1400, forecastNeeded: 1300, location: 'Central Dining Pavilion', status: 'surplus', costPerUnit: 8 },
  { id: 'res-5', name: 'NVIDIA A100 GPU High-Performance Compute Blades', category: 'equipment', allocated: 8, forecastNeeded: 6, location: 'AI & Data Science Block Hub', status: 'optimal', costPerUnit: 250, assignedRoomId: 'r3' },
  { id: 'res-6', name: 'Dual 4K Laser Projector Rig & Shure Stage Mics', category: 'equipment', allocated: 12, forecastNeeded: 10, location: 'Central Auditorium AV Control Booth', status: 'optimal', costPerUnit: 120, assignedRoomId: 'r1' },
];

const defaultMessages: CommunicationMessage[] = [
  {
    id: 'msg-1',
    audience: 'all',
    title: 'Welcome to Galgotias University AI & Knowledge Conclave 2026',
    content: 'Registration and RFID digital badging are active at GUKC Central Portico. Access WebOPAC and IEEE e-resources via campus Wi-Fi.',
    channel: 'push',
    status: 'dispatched',
    timestamp: '08:30 AM',
    recipientsCount: 1850,
  },
  {
    id: 'msg-2',
    audience: 'session',
    targetSessionTitle: 'Inaugural Keynote: AI-Driven Knowledge Systems & Modern Academic Libraries',
    targetRoomName: 'GUKC Central Auditorium (Block C)',
    title: 'Seating Open for Inaugural Keynote',
    content: 'Doors are open in GUKC Central Auditorium (Block C). Reserved seating for Deans and Faculty in Rows A-C.',
    channel: 'whatsapp',
    status: 'dispatched',
    timestamp: '08:45 AM',
    recipientsCount: 645,
  },
  {
    id: 'msg-3',
    audience: 'speakers',
    title: 'Faculty & Speaker Lounge Briefing Available',
    content: 'The Speaker Briefing Lounge in Level 3 Executive Suite is equipped with wireless presentation clickers and low-latency confidence monitors.',
    channel: 'sms',
    status: 'dispatched',
    timestamp: '08:50 AM',
    recipientsCount: 14,
  },
];

function normalizeToTimestamp(timeStr: string): number {
  if (!timeStr) return 0;
  if (timeStr.includes('T')) {
    const d = new Date(timeStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  }
  // Try format "HH:MM"
  const parts = timeStr.trim().split(':');
  if (parts.length >= 2) {
    const d = new Date();
    d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
    return d.getTime();
  }
  return 0;
}

function doTimesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const tA1 = normalizeToTimestamp(startA);
  const tA2 = normalizeToTimestamp(endA);
  const tB1 = normalizeToTimestamp(startB);
  const tB2 = normalizeToTimestamp(endB);
  if (!tA1 || !tA2 || !tB1 || !tB2) return false;
  return tA1 < tB2 && tA2 > tB1;
}

const EventStateContext = createContext<EventStateContextType | null>(null);

export function EventStateProvider({ children }: { children: ReactNode }) {
  // Check intro status on first mount
  const [isIntroPlaying, setIsIntroPlaying] = useState(() => {
    try {
      const seen = localStorage.getItem('pulse_intro_seen');
      return !seen;
    } catch {
      return false;
    }
  });

  const [status, setStatus] = useState<EventStatus>('live');

  // Event Metadata with legacy cache invalidation
  const [eventMeta, setEventMeta] = useState<EventMeta>(() => {
    try {
      const saved = localStorage.getItem('pulse_event_meta');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id === 'evt-gu-summit-2026') return parsed;
        // Purge legacy Cannes/Riviera cache
        localStorage.removeItem('pulse_event_meta');
        localStorage.removeItem('pulse_sessions');
        localStorage.removeItem('pulse_rooms');
        localStorage.removeItem('pulse_incidents');
      }
      return defaultEventMeta;
    } catch {
      return defaultEventMeta;
    }
  });

  // Sessions
  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      const savedMeta = localStorage.getItem('pulse_event_meta');
      if (savedMeta && !savedMeta.includes('evt-gu-summit-2026')) {
        return initialSessions;
      }
      const saved = localStorage.getItem('pulse_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0]?.title?.includes('Galgotias') || parsed[0]?.title?.includes('Inaugural'))) {
          return parsed;
        }
      }
      return initialSessions;
    } catch {
      return initialSessions;
    }
  });

  // Rooms
  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const savedMeta = localStorage.getItem('pulse_event_meta');
      if (savedMeta && !savedMeta.includes('evt-gu-summit-2026')) {
        return initialRooms;
      }
      const saved = localStorage.getItem('pulse_rooms');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.name?.includes('GUKC')) {
          return parsed;
        }
      }
      return initialRooms;
    } catch {
      return initialRooms;
    }
  });

  // Speakers
  const [speakers] = useState<Speaker[]>(initialSpeakers);

  // Incidents
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    try {
      const savedMeta = localStorage.getItem('pulse_event_meta');
      if (savedMeta && !savedMeta.includes('evt-gu-summit-2026')) {
        return initialIncidents;
      }
      const saved = localStorage.getItem('pulse_incidents');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.title?.includes('Wi-Fi')) {
          return parsed;
        }
      }
      return initialIncidents;
    } catch {
      return initialIncidents;
    }
  });

  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [simulatedTime, setSimulatedTime] = useState('09:45');
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);

  // Personal Agenda Set
  const [personalAgendaIds, setPersonalAgendaIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pulse_personal_agenda');
      return saved ? JSON.parse(saved) : ['ses1', 'ses2', 'ses4'];
    } catch {
      return ['ses1', 'ses2', 'ses4'];
    }
  });

  // Resources
  const [resources, setResources] = useState<ResourceItem[]>(() => {
    try {
      const saved = localStorage.getItem('pulse_resources');
      return saved ? JSON.parse(saved) : defaultResources;
    } catch {
      return defaultResources;
    }
  });

  // Communications Messages Queue
  const [messages, setMessages] = useState<CommunicationMessage[]>(() => {
    try {
      const saved = localStorage.getItem('pulse_messages');
      return saved ? JSON.parse(saved) : defaultMessages;
    } catch {
      return defaultMessages;
    }
  });

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('pulse_event_meta', JSON.stringify(eventMeta));
    } catch (e) {
      console.error(e);
    }
  }, [eventMeta]);

  useEffect(() => {
    try {
      localStorage.setItem('pulse_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.error(e);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem('pulse_rooms', JSON.stringify(rooms));
    } catch (e) {
      console.error(e);
    }
  }, [rooms]);

  useEffect(() => {
    try {
      localStorage.setItem('pulse_incidents', JSON.stringify(incidents));
    } catch (e) {
      console.error(e);
    }
  }, [incidents]);

  useEffect(() => {
    try {
      localStorage.setItem('pulse_personal_agenda', JSON.stringify(personalAgendaIds));
    } catch (e) {
      console.error(e);
    }
  }, [personalAgendaIds]);

  useEffect(() => {
    try {
      localStorage.setItem('pulse_resources', JSON.stringify(resources));
    } catch (e) {
      console.error(e);
    }
  }, [resources]);

  useEffect(() => {
    try {
      localStorage.setItem('pulse_messages', JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    }
  }, [messages]);

  // Brain signals stream
  const [activeBrainSignals, setActiveBrainSignals] = useState<BrainSignal[]>([]);

  // Ethical Backend Connection & SSE Telemetry Stream
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    let unsubscribeSSE: (() => void) | undefined;
    pulseApi.getHealth().then((h: { status?: string }) => {
      if (h?.status === 'HEALTHY') {
        setBackendConnected(true);

        // Synchronize state with ethical backend
        Promise.all([
          pulseApi.getEventMeta().catch(() => null),
          pulseApi.getSessions().catch(() => null),
          pulseApi.getRooms().catch(() => null),
          pulseApi.getIncidents().catch(() => null),
          pulseApi.getResources().catch(() => null),
          pulseApi.getMessages().catch(() => null),
        ]).then(([metaRes, sessRes, roomsRes, incRes, resRes, msgRes]) => {
          if (metaRes?.data) setEventMeta(metaRes.data);
          if (sessRes?.data && Array.isArray(sessRes.data)) setSessions(sessRes.data);
          if (roomsRes?.data && Array.isArray(roomsRes.data)) setRooms(roomsRes.data);
          if (incRes?.data && Array.isArray(incRes.data)) setIncidents(incRes.data);
          if (resRes?.data && Array.isArray(resRes.data)) setResources(resRes.data);
          if (msgRes?.data && Array.isArray(msgRes.data)) setMessages(msgRes.data);
        }).catch(err => console.warn('[Backend Initial Sync Error]', err));

        // Subscribe to live Server-Sent Events stream from backend
        unsubscribeSSE = pulseApi.subscribeTelemetry((telemetry: unknown) => {
          const t = telemetry as { type?: string; id?: string; source?: string; target?: string; label?: string; timestamp?: string };
          if (t && t.type === 'BRAIN_SIGNAL') {
            setActiveBrainSignals(prev => [
              {
                id: t.id || `sig-${Date.now()}`,
                source: t.source || 'Digital Twin',
                target: t.target || 'Event Brain',
                label: t.label || 'Live Telemetry',
                type: 'telemetry',
                timestamp: t.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              },
              ...prev.slice(0, 14),
            ]);
          }
        });
      }
    }).catch(() => setBackendConnected(false));

    return () => {
      if (unsubscribeSSE) unsubscribeSSE();
    };
  }, []);

  // Butterfly effect state
  const [butterfly, setButterfly] = useState<ButterflyRipple>({
    active: false,
    incidentId: null,
    affectedSessionId: null,
    affectedRoomId: null,
    targetRoomId: null,
    rippleStep: 0,
    connectedSessions: [],
    reroutedAttendees: 0,
    toastMessage: null,
  });

  const fireBrainSignal = useCallback((sig: Omit<BrainSignal, 'id' | 'timestamp'>) => {
    const newSignal: BrainSignal = {
      ...sig,
      id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setActiveBrainSignals(prev => [newSignal, ...prev.slice(0, 14)]);
  }, []);

  // Update Event Metadata
  const updateEventMeta = useCallback((meta: Partial<EventMeta>) => {
    setEventMeta(prev => ({ ...prev, ...meta }));
    pulseApi.updateEventMeta(meta).catch(err => console.warn('[Backend Sync Warning]', err));
    fireBrainSignal({
      source: 'Event Planner',
      target: 'Command Centre',
      label: 'Event Metadata Updated',
      type: 'telemetry',
    });
  }, [fireBrainSignal]);

  // Session CRUD
  const addSession = useCallback((newSessData: Omit<Session, 'id'>): Session => {
    const id = `ses-${Date.now()}`;
    const newSession: Session = {
      ...newSessData,
      id,
    };
    setSessions(prev => [newSession, ...prev]);
    pulseApi.createSession(newSession).catch(err => console.warn('[Backend Sync Warning]', err));
    fireBrainSignal({
      source: 'Event Planner',
      target: 'Schedule Matrix',
      label: `Session Created: "${newSession.title}"`,
      type: 'rebalance',
    });
    return newSession;
  }, [fireBrainSignal]);

  const updateSession = useCallback((id: string, updates: Partial<Session>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    pulseApi.updateSession(id, updates).catch(err => console.warn('[Backend Sync Warning]', err));
    fireBrainSignal({
      source: 'Event Planner',
      target: 'Digital Twin',
      label: `Session Updated (ID ${id})`,
      type: 'rebalance',
    });
  }, [fireBrainSignal]);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setPersonalAgendaIds(prev => prev.filter(aid => aid !== id));
    pulseApi.deleteSession(id).catch(err => console.warn('[Backend Sync Warning]', err));
    fireBrainSignal({
      source: 'Event Planner',
      target: 'Schedule Matrix',
      label: `Session Deleted (ID ${id})`,
      type: 'reroute',
    });
  }, [fireBrainSignal]);

  // Room update
  const updateRoom = useCallback((id: string, updates: Partial<Room>) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  // Conflict Detection Memos
  const roomConflicts = useMemo<RoomConflict[]>(() => {
    const conflicts: RoomConflict[] = [];
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        const s1 = sessions[i];
        const s2 = sessions[j];
        if (s1.roomId && s2.roomId && s1.roomId === s2.roomId) {
          if (s1.status !== 'cancelled' && s2.status !== 'cancelled') {
            if (doTimesOverlap(s1.startTime, s1.endTime, s2.startTime, s2.endTime)) {
              const room = rooms.find(r => r.id === s1.roomId);
              conflicts.push({
                roomId: s1.roomId,
                roomName: room ? room.name : s1.roomId,
                sessionA: s1,
                sessionB: s2,
              });
            }
          }
        }
      }
    }
    return conflicts;
  }, [sessions, rooms]);

  const speakerConflicts = useMemo<SpeakerConflict[]>(() => {
    const conflicts: SpeakerConflict[] = [];
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        const s1 = sessions[i];
        const s2 = sessions[j];
        if (s1.status === 'cancelled' || s2.status === 'cancelled') continue;
        if (!doTimesOverlap(s1.startTime, s1.endTime, s2.startTime, s2.endTime)) continue;

        // Check if either speakerId matches or if speakers array shares an ID
        const speakers1 = s1.speakers?.map(sp => sp.id) || (s1.speakerId ? [s1.speakerId] : []);
        const speakers2 = s2.speakers?.map(sp => sp.id) || (s2.speakerId ? [s2.speakerId] : []);
        const commonSpeaker = speakers1.find(spId => speakers2.includes(spId));

        if (commonSpeaker) {
          const spObj = speakers.find(s => s.id === commonSpeaker);
          conflicts.push({
            speakerId: commonSpeaker,
            speakerName: spObj ? spObj.name : 'Assigned Speaker',
            sessionA: s1,
            sessionB: s2,
          });
        }
      }
    }
    return conflicts;
  }, [sessions, speakers]);

  const capacityWarnings = useMemo<CapacityWarning[]>(() => {
    const warnings: CapacityWarning[] = [];
    sessions.forEach(s => {
      if (s.status === 'cancelled') return;
      const room = rooms.find(r => r.id === s.roomId);
      if (room && room.capacity > 0) {
        const load = Math.max(s.attendeeCount || 0, s.maxAttendees || 0);
        if (load > room.capacity) {
          warnings.push({
            session: s,
            room,
            excess: load - room.capacity,
          });
        }
      }
    });
    return warnings;
  }, [sessions, rooms]);

  // Personal Agenda
  const toggleAgendaSession = useCallback((sessionId: string) => {
    setPersonalAgendaIds(prev => {
      const exists = prev.includes(sessionId);
      const next = exists ? prev.filter(id => id !== sessionId) : [...prev, sessionId];
      return next;
    });
  }, []);

  const isSessionInAgenda = useCallback((sessionId: string) => {
    return personalAgendaIds.includes(sessionId);
  }, [personalAgendaIds]);

  // Disruption Handlers
  const triggerDisruption = useCallback((incidentId = 'inc1') => {
    const inc = incidents.find(i => i.id === incidentId) || incidents[0];
    setActiveIncidentId(inc?.id || 'inc1');
    setStatus('disrupted');

    // Affected session & room
    const affectedSession = sessions.find(s => s.roomId === 'r1' || s.id === 'ses1') || sessions[0];
    const connected = sessions.slice(1, 3).map(s => s.id);

    setButterfly({
      active: true,
      incidentId: inc?.id || 'inc1',
      affectedSessionId: affectedSession.id,
      affectedRoomId: 'r1', // Grand Hall A
      targetRoomId: 'r2',   // Grand Hall B
      rippleStep: 1,
      connectedSessions: connected,
      reroutedAttendees: affectedSession.attendeeCount || 423,
      toastMessage: 'Hardware/AV alert detected in Grand Hall A. Initializing cascade analysis...',
    });

    fireBrainSignal({
      source: 'Rescue Engine',
      target: 'Digital Twin',
      label: 'Cascade Ripple Initiated',
      type: 'solve',
    });

    // Mark affected room status
    setRooms(prev => prev.map(r => r.id === 'r1' ? { ...r, status: 'maintenance' } : r));
    setSessions(prev => prev.map(s => s.id === affectedSession.id ? { ...s, status: 'disrupted' } : s));
  }, [incidents, sessions, fireBrainSignal]);

  const advanceButterflyStep = useCallback(() => {
    setButterfly(prev => {
      if (!prev.active) return prev;
      const nextStep = prev.rippleStep + 1;
      let toast = prev.toastMessage;

      if (nextStep === 2) {
        toast = 'CP-SAT Solver isolated dependent tracks: 2 sessions pushed back.';
        fireBrainSignal({ source: 'Rescue Engine', target: 'Schedule Matrix', label: 'Timeline Constraint Recalculated', type: 'reroute' });
      } else if (nextStep === 3) {
        toast = 'Spatial Twin recalculated crowd flow: rerouting 423 attendees to Concourse West.';
        fireBrainSignal({ source: 'Digital Twin', target: 'Attendee Navigator', label: 'Wayfinding Path Re-indexed', type: 'reroute' });
      } else if (nextStep === 4) {
        toast = 'Resource Engine rebalanced: dispatched 4 marshals & standby 4K laser projector.';
        fireBrainSignal({ source: 'Resource Engine', target: 'Rescue Engine', label: 'Asset Standby Confirmed', type: 'rebalance' });
      } else if (nextStep === 5) {
        toast = 'Multilingual Dispatch pushed SMS & push notifications to all 423 attendees (100% delivered).';
        fireBrainSignal({ source: 'Communications', target: 'All Attendees', label: 'Multilingual Reroute Broadcast', type: 'dispatch' });
      }

      return {
        ...prev,
        rippleStep: Math.min(nextStep, 5),
        toastMessage: toast,
      };
    });
  }, [fireBrainSignal]);

  const resetDisruption = useCallback(() => {
    setButterfly({
      active: false,
      incidentId: null,
      affectedSessionId: null,
      affectedRoomId: null,
      targetRoomId: null,
      rippleStep: 0,
      connectedSessions: [],
      reroutedAttendees: 0,
      toastMessage: null,
    });
    setStatus('live');
    setActiveIncidentId(null);
    setRooms(initialRooms);
    setSessions(initialSessions);
  }, []);

  // Standard or Planned resolution
  const resolveDisruption = useCallback((targetRoomId = 'r2') => {
    setStatus('resolving');
    fireBrainSignal({
      source: 'Rescue Engine',
      target: 'Command Centre',
      label: 'Recovery Plan Approved & Committed',
      type: 'solve',
    });

    const targetRoomObj = rooms.find(r => r.id === targetRoomId || r.name.toLowerCase().includes(targetRoomId.toLowerCase())) || rooms[1] || rooms[0];
    const actualTargetRoomId = targetRoomObj?.id || 'r2';
    const targetRoomName = targetRoomObj?.name || 'Dr. APJ Abdul Kalam Central Reading Hall';

    if (activeIncidentId) {
      pulseApi.approveRecoveryPlan(activeIncidentId, 'plan-a', actualTargetRoomId).catch(() => {});
    }

    setTimeout(() => {
      setStatus('live');
      setButterfly(prev => ({
        ...prev,
        active: false,
        toastMessage: `All systems nominal. Relocation to ${targetRoomName} committed.`,
      }));
      setRooms(prev => prev.map(r => {
        if (r.id === 'r1') return { ...r, status: 'available', currentOccupancy: 0 };
        if (r.id === actualTargetRoomId) return { ...r, status: 'occupied', currentOccupancy: 645 };
        return r;
      }));
      setSessions(prev => prev.map(s => {
        if (s.id === 'ses1') return { ...s, roomId: actualTargetRoomId, status: 'live' };
        return s;
      }));
    }, 1000);
  }, [rooms, activeIncidentId, fireBrainSignal]);

  const resolveDisruptionWithPlan = useCallback((plan: { id: string; sessionId?: string; newRoomId?: string; newTime?: string; rebalanceSummary?: string }) => {
    setStatus('resolving');
    fireBrainSignal({
      source: 'Rescue Engine',
      target: 'Schedule & Digital Twin',
      label: `Executed Plan: ${plan.id}`,
      type: 'solve',
    });

    const targetSessionId = plan.sessionId || 'ses1';
    const targetRoomId = plan.newRoomId || 'r2';
    const targetRoomObj = rooms.find(r => r.id === targetRoomId) || rooms[1];
    const targetRoomName = targetRoomObj?.name || 'Alternative Venue Wing';
    const activeIncId = activeIncidentId || 'inc1';

    // Commit to ethical backend
    pulseApi.approveRecoveryPlan(
      activeIncId,
      plan.id,
      targetRoomId,
      plan.newTime,
      {
        organizerId: 'org_debal',
        organizerName: 'Dr. Debal C. Kar (University Librarian & Head KRC)',
        role: 'human_organizer',
        rationale: plan.rebalanceSummary || 'Approved reallocation preserving ADA accessibility and room capacity.',
      }
    ).catch(err => console.warn('[Backend Solver Commit Warning]', err));

    setTimeout(() => {
      setStatus('live');

      // Update session
      setSessions(prev => prev.map(s => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            roomId: targetRoomId,
            status: 'live',
            ...(plan.newTime ? { startTime: plan.newTime.split('–')[0]?.trim() || s.startTime } : {}),
          };
        }
        return s;
      }));

      // Update room statuses
      setRooms(prev => prev.map(r => {
        if (r.id === targetRoomId) return { ...r, status: 'occupied', currentOccupancy: 645 };
        if (r.id === 'r1') return { ...r, status: 'available', currentOccupancy: 0 };
        return r;
      }));

      // Auto-draft communication announcement
      const autoMsg: CommunicationMessage = {
        id: `msg-${Date.now()}`,
        audience: 'incident_affected',
        targetSessionTitle: sessions.find(s => s.id === targetSessionId)?.title || 'Inaugural Keynote',
        targetRoomName: targetRoomName,
        title: 'Relocation Notice: Session Moved to Alternative Wing',
        content: `IMPORTANT: Due to scheduled technician maintenance, your session has been reassigned to ${targetRoomName}. Your in-app navigator and personal agenda have updated automatically.`,
        channel: 'whatsapp',
        status: 'approved',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recipientsCount: 645,
        isAutoDraft: true,
      };
      setMessages(prev => [autoMsg, ...prev]);

      // Rebalance resources
      setResources(prev => prev.map(res => {
        if (res.category === 'equipment') {
          return { ...res, location: targetRoomName, status: 'optimal' };
        }
        return res;
      }));

      // Dismiss butterfly overlay
      setButterfly(prev => ({
        ...prev,
        active: false,
        toastMessage: `Plan committed successfully: Session moved to ${targetRoomName}.`,
      }));
    }, 1000);
  }, [sessions, rooms, activeIncidentId, fireBrainSignal]);

  // Create Incident
  const createIncident = useCallback((incData: Omit<Incident, 'id' | 'reportedAt' | 'status'>): Incident => {
    const newInc: Incident = {
      ...incData,
      id: `inc-${Date.now()}`,
      reportedAt: new Date().toISOString(),
      status: 'open',
    };
    setIncidents(prev => [newInc, ...prev]);
    pulseApi.reportIncident(newInc).catch(err => console.warn('[Backend Sync Warning]', err));
    fireBrainSignal({
      source: 'Crisis Monitor',
      target: 'Rescue Engine',
      label: `Incident Logged: ${newInc.title}`,
      type: 'solve',
    });
    return newInc;
  }, [fireBrainSignal]);

  const resolveIncidentById = useCallback((id: string) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'resolved', resolvedAt: new Date().toISOString() } : inc));
  }, []);

  // Communications management
  const addMessage = useCallback((msgData: Omit<CommunicationMessage, 'id' | 'timestamp'>) => {
    const newMsg: CommunicationMessage = {
      ...msgData,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [newMsg, ...prev]);
    pulseApi.createDraftMessage(newMsg).catch(err => console.warn('[Backend Sync Warning]', err));
    fireBrainSignal({
      source: 'Communications',
      target: 'Audience Channels',
      label: `Draft Created: ${newMsg.title}`,
      type: 'dispatch',
    });
  }, [fireBrainSignal]);

  const approveAndDispatchMessage = useCallback((id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'dispatched' } : m));
    pulseApi.dispatchMessage(id).catch(err => console.warn('[Backend Sync Warning]', err));
    fireBrainSignal({
      source: 'Communications',
      target: 'SMS & WhatsApp Gateway',
      label: 'Broadcast Dispatched (Demo Channel)',
      type: 'dispatch',
    });
  }, [fireBrainSignal]);

  const deleteMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  // Resource Management
  const addResource = useCallback((resData: Omit<ResourceItem, 'id'>) => {
    const newRes: ResourceItem = {
      ...resData,
      id: `res-${Date.now()}`,
    };
    setResources(prev => [newRes, ...prev]);
    pulseApi.addResource(newRes).catch(err => console.warn('[Backend Sync Warning]', err));
    fireBrainSignal({
      source: 'Resource Engine',
      target: 'Command Centre',
      label: `Resource Added: ${newRes.name}`,
      type: 'rebalance',
    });
  }, [fireBrainSignal]);

  const updateResource = useCallback((id: string, updates: Partial<ResourceItem>) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const rebalanceResources = useCallback(() => {
    setResources(prev => prev.map(r => ({
      ...r,
      allocated: r.forecastNeeded,
      status: 'optimal',
    })));
    pulseApi.rebalanceResources().catch(err => console.warn('[Backend Sync Warning]', err));
    fireBrainSignal({
      source: 'Resource Engine',
      target: 'Event Brain',
      label: 'Inventory Gradient Rebalanced to Optimal',
      type: 'rebalance',
    });
  }, [fireBrainSignal]);

  const toggleFreeze = useCallback(() => {
    setIsFrozen(prev => {
      const next = !prev;
      setStatus(next ? 'frozen' : 'live');
      fireBrainSignal({
        source: 'Event Brain',
        target: 'Digital Twin',
        label: next ? 'Event Spatial Vectors Frozen' : 'Event Physics Resumed',
        type: 'telemetry',
      });
      return next;
    });
  }, [fireBrainSignal]);

  const openCompletionModal = useCallback(() => setIsCompletionModalOpen(true), []);
  const closeCompletionModal = useCallback(() => setIsCompletionModalOpen(false), []);
  const playIntro = useCallback(() => setIsIntroPlaying(true), []);
  const closeIntro = useCallback(() => {
    setIsIntroPlaying(false);
    try {
      localStorage.setItem('pulse_intro_seen', 'true');
    } catch (e) {
      console.error(e);
    }
  }, []);

  const activeIncident = incidents.find(i => i.id === activeIncidentId) || null;

  const eventMetrics = useMemo(() => {
    const totalAttendees = eventMeta.maxCapacity;
    const checkedIn = Math.min(1247, totalAttendees);
    const activeSessionsCount = sessions.filter(s => s.status === 'live' || s.status === 'active').length;
    const resolvedIncidentsCount = incidents.filter(i => i.status === 'resolved').length;
    const systemHealth = status === 'disrupted' ? 84 : status === 'resolving' ? 92 : 99.8;

    return {
      totalAttendees,
      checkedIn,
      activeSessions: activeSessionsCount,
      resolvedIncidents: resolvedIncidentsCount,
      systemHealth,
    };
  }, [eventMeta, sessions, incidents, status]);

  // Periodic heartbeat signals
  useEffect(() => {
    if (isFrozen) return;
    const interval = setInterval(() => {
      const sources = ['Digital Twin', 'Command Centre', 'Schedule Matrix', 'Rescue Engine'];
      const targets = ['Event Brain', 'Attendee Navigator', 'Resource Engine'];
      const labels = ['Turnstile Delta Sync', 'Room Occupancy Polled', 'NFC Gate Influx (12/sec)', 'Audio Telemetry Stable'];
      const s = sources[Math.floor(Math.random() * sources.length)];
      const t = targets[Math.floor(Math.random() * targets.length)];
      const l = labels[Math.floor(Math.random() * labels.length)];
      fireBrainSignal({ source: s, target: t, label: l, type: 'telemetry' });
    }, 9000);
    return () => clearInterval(interval);
  }, [isFrozen, fireBrainSignal]);

  return (
    <EventStateContext.Provider
      value={{
        status,
        setStatus,
        eventMeta,
        updateEventMeta,
        sessions,
        setSessions,
        addSession,
        updateSession,
        deleteSession,
        rooms,
        setRooms,
        updateRoom,
        speakers,
        incidents,
        activeIncident,
        createIncident,
        resolveIncidentById,
        butterfly,
        triggerDisruption,
        advanceButterflyStep,
        resetDisruption,
        resolveDisruption,
        resolveDisruptionWithPlan,
        isFrozen,
        toggleFreeze,
        simulatedTime,
        setSimulatedTime,
        activeBrainSignals,
        fireBrainSignal,
        isCompletionModalOpen,
        openCompletionModal,
        closeCompletionModal,
        isIntroPlaying,
        playIntro,
        closeIntro,
        eventMetrics,
        roomConflicts,
        speakerConflicts,
        capacityWarnings,
        personalAgendaIds,
        toggleAgendaSession,
        isSessionInAgenda,
        messages,
        addMessage,
        approveAndDispatchMessage,
        deleteMessage,
        resources,
        addResource,
        updateResource,
        rebalanceResources,
        backendConnected,
        verifyCryptographicLedger: () => pulseApi.verifyAuditLedger(),
      }}
    >
      {children}
    </EventStateContext.Provider>
  );
}

export function useEventState() {
  const ctx = useContext(EventStateContext);
  if (!ctx) throw new Error('useEventState must be used within an EventStateProvider');
  return ctx;
}
