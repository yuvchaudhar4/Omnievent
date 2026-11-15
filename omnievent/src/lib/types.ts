// ── Core OmniEvent Types ───────────────────────────────────────────────────────

export interface Event {
  id: string;
  name: string;
  date: string;
  endDate: string;
  venue: string;
  status: 'planning' | 'live' | 'completed';
  attendeeCount: number;
  sessionCount: number;
  roomCount: number;
}

export type Track = 'keynote' | 'workshop' | 'panel' | 'networking' | 'breakout' | string;
export type SessionStatus = 'scheduled' | 'live' | 'active' | 'completed' | 'disrupted' | 'rescheduled' | 'cancelled';

export interface Session {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  roomId: string;
  speakerId?: string;
  speakers?: Speaker[];
  track: Track;
  status: SessionStatus;
  attendeeCount: number;
  maxAttendees: number;
  capacity?: number;
  rating?: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  floor: number;
  currentOccupancy: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  equipment?: string[];
  amenities?: string[];
}

export interface Speaker {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar?: string;
  bio?: string;
  sessions?: string[];
}

export interface Incident {
  id: string;
  type?: 'room_unavailable' | 'speaker_absent' | 'equipment_failure' | 'overcrowding' | 'schedule_conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedSessionIds?: string[];
  affectedRoomIds?: string[];
  roomId?: string;
  status: 'open' | 'investigating' | 'detected' | 'analyzing' | 'options_ready' | 'approved' | 'resolved';
  detectedAt?: string;
  reportedAt?: string;
  resolvedAt?: string;
  assignee?: string;
}

export interface RecoveryOption {
  id: string;
  incidentId: string;
  description: string;
  newRoomId?: string;
  newRoomName?: string;
  newTime?: string;
  newSpeakerId?: string;
  affectedAttendees: number;
  conflictCount: number;
  feasibilityScore: number;
  tradeoffs: string[];
}

export interface DigitalTwinScenario {
  id: string;
  name: string;
  type: 'what-if';
  changes: SessionChange[];
  impactMetrics: ImpactMetrics;
  status: 'draft' | 'analyzing' | 'ready' | 'applied';
}

export interface SessionChange {
  sessionId: string;
  field: string;
  oldValue: string;
  newValue: string;
}

export interface ImpactMetrics {
  attendeesAffected: number;
  roomUtilizationDelta: number;
  conflictsIntroduced: number;
  budgetImpact: number;
  congestionDelta: number;
}

export interface ActivityItem {
  id: string;
  type: 'check_in' | 'incident' | 'schedule_change' | 'notification' | 'system';
  message: string;
  timestamp: string;
  source: string;
  actionUrl?: string;
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export interface BudgetItem {
  category: string;
  planned: number;
  actual: number;
}

export interface AttendanceDataPoint {
  time: string;
  attendees: number;
  capacity: number;
}

export interface EventStats {
  totalAttendees: number;
  checkedInAttendees: number;
  activeSessions: number;
  totalSessions: number;
  roomsOccupied: number;
  totalRooms: number;
  openIncidents: number;
  totalIncidents: number;
}

export interface AnalyticsData {
  attendance: { date: string; count: number; capacity: number }[];
  roomUtilization: { roomId: string; roomName: string; utilization: number }[];
  sessionRatings: { sessionId: string; title: string; rating: number; responses: number }[];
  budgetBreakdown: { category: string; planned: number; actual: number }[];
  incidentTrends: { date: string; count: number; resolved: number }[];
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  checkedIn: boolean;
}
