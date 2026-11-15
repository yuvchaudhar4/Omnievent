// ── PULSE Backend Core & Ethical Types ──────────────────────────────────────────

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

export type Track = 'keynote' | 'workshop' | 'panel' | 'networking' | 'breakout' | string;
export type SessionStatus = 'scheduled' | 'live' | 'active' | 'completed' | 'disrupted' | 'rescheduled' | 'cancelled';

export interface Speaker {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar?: string;
  bio?: string;
}

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
  rating?: number;
  requiresStepFreeAccess?: boolean;
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
  stepFreeAccessible: boolean;
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
  planName: string;
  description: string;
  newRoomId?: string;
  newRoomName?: string;
  newTime?: string;
  affectedAttendees: number;
  feasibilityScore: number;
  tradeoffs: string[];
  accessibilityPreserved: boolean;
  requiresHumanApproval: boolean;
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
  consentVerificationToken?: string;
  dispatchedAt?: string;
}

// ── Ethical Governance & Compliance Types ─────────────────────────────────────

export type AuditActionType =
  | 'SOLVER_PROPOSAL_GENERATED'
  | 'HUMAN_APPROVAL_COMMITTED'
  | 'BROADCAST_DISPATCHED'
  | 'INCIDENT_ESCALATED'
  | 'RESOURCE_REBALANCED'
  | 'PRIVACY_CONSENT_AUDITED'
  | 'SESSION_SCHEDULE_MODIFIED';

export interface AuditLedgerEntry {
  index: number;
  timestamp: string;
  action: AuditActionType;
  actor: {
    userId: string;
    role: 'system_solver' | 'human_organizer' | 'safety_marshal';
    name: string;
  };
  details: Record<string, unknown>;
  ethicalGuarantees: {
    dataMinimizationVerified: boolean;
    stepFreeAccessibilityPreserved: boolean;
    humanInTheLoopEnforced: boolean;
    consentCompliant: boolean;
  };
  previousHash: string;
  hash: string;
}

export interface PrivacyConsentRecord {
  attendeeHash: string; // Pseudonymized via salted SHA-256
  optInBroadcastChannels: ('push' | 'sms' | 'whatsapp')[];
  consentTimestamp: string;
  dpdpScope: 'essential_event_safety_only' | 'full_interactive_agenda';
}

