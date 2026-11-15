import type {
  Room,
  Speaker,
  Session,
  Incident,
  Activity,
  BudgetItem,
  AttendanceDataPoint,
  EventStats,
} from './types';

// ── Rooms ──────────────────────────────────────────────────────────────────────

export const rooms: Room[] = [
  { id: 'r1', name: 'GUKC Central Auditorium (Block C)', capacity: 800, currentOccupancy: 645, status: 'occupied', floor: 1, amenities: ['dual-4k-laser-projector', 'jbl-line-array', 'shure-wireless-mics', 'livestream-encoder', 'ada-hearing-loop'] },
  { id: 'r2', name: 'Dr. APJ Abdul Kalam Central Reading Hall', capacity: 350, currentOccupancy: 280, status: 'occupied', floor: 1, amenities: ['rfid-kiosks', 'webopac-terminals', 'high-speed-wifi-6', 'digital-signage'] },
  { id: 'r3', name: 'AI & Data Science Block Hub (Level 2)', capacity: 80, currentOccupancy: 72, status: 'occupied', floor: 2, amenities: ['nvidia-dgx-workstations', 'interactive-touch-displays', 'dual-camera-telepresence'] },
  { id: 'r4', name: 'Smart Collaborative Discussion Room 1', capacity: 50, currentOccupancy: 42, status: 'occupied', floor: 2, amenities: ['4k-touch-whiteboard', 'conference-audio-puck'] },
  { id: 'r5', name: 'Smart Collaborative Discussion Room 2', capacity: 50, currentOccupancy: 0, status: 'reserved', floor: 2, amenities: ['4k-touch-whiteboard', 'conference-audio-puck'] },
  { id: 'r6', name: 'E-Resource & IEEE Digital Library Centre', capacity: 120, currentOccupancy: 98, status: 'occupied', floor: 2, amenities: ['desktop-terminals', 'ieee-scopus-gateways', 'laser-printers'] },
  { id: 'r7', name: 'Block A Multimedia Seminar Hall', capacity: 250, currentOccupancy: 195, status: 'occupied', floor: 1, amenities: ['stage-mic-array', 'confidence-monitors', '4k-laser-projector'] },
  { id: 'r8', name: 'Scholarly Networking Atrium & Cafe', capacity: 200, currentOccupancy: 134, status: 'occupied', floor: 1, amenities: ['digital-signage', 'espresso-bar', 'high-speed-wifi-6'] },
  { id: 'r9', name: 'Faculty Research & Executive Lounge', capacity: 45, currentOccupancy: 18, status: 'occupied', floor: 3, amenities: ['executive-display', 'conference-telepresence'] },
  { id: 'r10', name: 'Doctoral Research & Rare Book Carrels', capacity: 35, currentOccupancy: 0, status: 'maintenance', floor: 3, amenities: ['silent-study-cubicles', 'microfilm-scanner'] },
];

// ── Speakers ───────────────────────────────────────────────────────────────────

export const speakers: Speaker[] = [
  { id: 's1', name: 'Dr. Debal C. Kar', title: 'University Librarian & Head Knowledge Resource Centre', company: 'Galgotias University' },
  { id: 's2', name: 'Dr. Harish Kumar G. R.', title: 'Dean, School of Computing Science and Engineering (SCSE)', company: 'Galgotias University' },
  { id: 's3', name: 'Dr. Manish Raj', title: 'Dean, School of Artificial Intelligence', company: 'Galgotias University' },
  { id: 's4', name: 'Dr. Vineeta Khemchandani', title: 'Dean, School of Computer Applications & Technology', company: 'Galgotias University' },
  { id: 's5', name: 'Prof. (Dr.) Nitin Kumar Gaur', title: 'Vice-Chancellor', company: 'Galgotias University' },
  { id: 's6', name: 'Dr. Neha Gupta', title: 'Professor & Lead Researcher, Generative AI Lab', company: 'Galgotias University' },
  { id: 's7', name: 'Dr. Anupam Kumar Sharma', title: 'Director of Research & Innovation', company: 'Galgotias University' },
  { id: 's8', name: 'Prof. Rajeshwari S.', title: 'Head, Cyber Security & DPDP Compliance Cell', company: 'Galgotias University' },
];

// ── Sessions ───────────────────────────────────────────────────────────────────

const today = new Date();
const dateStr = today.toISOString().split('T')[0];

export const sessions: Session[] = [
  {
    id: 'ses1',
    title: 'Inaugural Keynote: AI-Driven Knowledge Systems & Modern Academic Libraries',
    description: 'An architectural perspective on ambient spatial AI, semantic vector search, and digital knowledge graphs transforming university libraries.',
    track: 'keynote',
    status: 'live',
    roomId: 'r1',
    startTime: `${dateStr}T09:00:00`,
    endTime: `${dateStr}T10:00:00`,
    speakers: [speakers[0], speakers[4]],
    attendeeCount: 645,
    maxAttendees: 800,
    rating: 4.9,
  },
  {
    id: 'ses2',
    title: 'Deep Learning & LLM Fine-Tuning on Campus HPC Clusters',
    description: 'Distributed model training, GPU memory bandwidth optimization, and data preprocessing inside the AI & Data Science Block.',
    track: 'workshop',
    status: 'live',
    roomId: 'r3',
    startTime: `${dateStr}T09:30:00`,
    endTime: `${dateStr}T11:00:00`,
    speakers: [speakers[1]],
    attendeeCount: 72,
    maxAttendees: 80,
    rating: 4.8,
  },
  {
    id: 'ses3',
    title: 'Transforming Academic Publishing with Open Access & IEEE Xplore',
    description: 'Strategies for indexing high-impact research papers, navigating open access, and utilizing GUKC institutional repositories.',
    track: 'workshop',
    status: 'live',
    roomId: 'r4',
    startTime: `${dateStr}T09:30:00`,
    endTime: `${dateStr}T11:00:00`,
    speakers: [speakers[6]],
    attendeeCount: 42,
    maxAttendees: 50,
    rating: 4.6,
  },
  {
    id: 'ses4',
    title: 'Panel: Ethical AI Governance & DPDP Act 2023 in Indian Academia',
    description: 'Academic leaders and compliance officers address student data privacy, algorithm accountability, and DPDP Act 2023 mandates.',
    track: 'panel',
    status: 'live',
    roomId: 'r7',
    startTime: `${dateStr}T09:00:00`,
    endTime: `${dateStr}T10:30:00`,
    speakers: [speakers[2], speakers[3], speakers[7]],
    attendeeCount: 195,
    maxAttendees: 250,
    rating: 4.7,
  },
  {
    id: 'ses5',
    title: 'Scholars Morning Networking & Digital Poster Showcase',
    description: 'Peer networking, research poster presentations, and scholarly book fair with morning refreshment service.',
    track: 'networking',
    status: 'live',
    roomId: 'r8',
    startTime: `${dateStr}T08:30:00`,
    endTime: `${dateStr}T09:30:00`,
    speakers: [],
    attendeeCount: 134,
    maxAttendees: 200,
    rating: 4.5,
  },
  {
    id: 'ses6',
    title: 'Hands-on Workshop: Vector Databases & Semantic WebOPAC Search',
    description: 'Building vector index embeddings over 130,000+ university library volumes using open-source models.',
    track: 'breakout',
    status: 'live',
    roomId: 'r6',
    startTime: `${dateStr}T09:00:00`,
    endTime: `${dateStr}T10:30:00`,
    speakers: [speakers[5]],
    attendeeCount: 98,
    maxAttendees: 120,
    rating: 4.8,
  },
  {
    id: 'ses7',
    title: 'Valedictory Address & Research Awards Convocation',
    description: 'Recognizing outstanding research scholars, faculty citations, and presidential closing remarks.',
    track: 'keynote',
    status: 'scheduled',
    roomId: 'r1',
    startTime: `${dateStr}T16:00:00`,
    endTime: `${dateStr}T17:00:00`,
    speakers: [speakers[4]],
    attendeeCount: 0,
    maxAttendees: 800,
    rating: 4.9,
  },
  {
    id: 'ses8',
    title: 'Cyber Security Safeguards for Institutional Repositories',
    description: 'Mitigating automated credential stuffing, safeguarding digital dissertations, and ransomware resilience.',
    track: 'workshop',
    status: 'scheduled',
    roomId: 'r5',
    startTime: `${dateStr}T11:30:00`,
    endTime: `${dateStr}T13:00:00`,
    speakers: [speakers[7]],
    attendeeCount: 0,
    maxAttendees: 50,
    rating: 4.6,
  },
  {
    id: 'ses9',
    title: 'Industry-Academia Panel on Computing Innovations',
    description: 'Strengthening R&D partnerships between Galgotias tech labs and Noida/Greater Noida tech corporations.',
    track: 'panel',
    status: 'scheduled',
    roomId: 'r7',
    startTime: `${dateStr}T11:00:00`,
    endTime: `${dateStr}T12:30:00`,
    speakers: [speakers[1], speakers[3]],
    attendeeCount: 0,
    maxAttendees: 250,
    rating: 4.7,
  },
  {
    id: 'ses10',
    title: 'High-Tea & Collaborative Academic Exchange',
    description: 'Networking roundtables and collaborative research discourse in the Central Library Atrium.',
    track: 'networking',
    status: 'scheduled',
    roomId: 'r8',
    startTime: `${dateStr}T12:30:00`,
    endTime: `${dateStr}T14:00:00`,
    speakers: [],
    attendeeCount: 0,
    maxAttendees: 200,
    rating: 4.4,
  },
  {
    id: 'ses11',
    title: 'Orientation on WebOPAC, Koha & RFID Self-Checkout',
    description: 'Practical training on automated circulation kiosks, Koha catalog search, and e-book remote access.',
    track: 'breakout',
    status: 'completed',
    roomId: 'r6',
    startTime: `${dateStr}T07:00:00`,
    endTime: `${dateStr}T08:30:00`,
    speakers: [speakers[0]],
    attendeeCount: 110,
    maxAttendees: 120,
    rating: 4.7,
  },
  {
    id: 'ses12',
    title: 'Early Bird Research Scholar Registration Mixer',
    description: 'Welcome coffee and badging for early arriving doctoral scholars and visiting faculties.',
    track: 'networking',
    status: 'completed',
    roomId: 'r8',
    startTime: `${dateStr}T07:00:00`,
    endTime: `${dateStr}T08:00:00`,
    speakers: [],
    attendeeCount: 145,
    maxAttendees: 200,
    rating: 4.5,
  },
];

// ── Incidents ──────────────────────────────────────────────────────────────────

export const incidents: Incident[] = [
  {
    id: 'inc1',
    title: 'High-Density Wi-Fi Bandwidth Saturation at AI Hub',
    description: 'Concurrent LLM fine-tuning downloads causing packet drops and latency spikes in AI & Data Science Block Hub.',
    severity: 'high',
    status: 'investigating',
    roomId: 'r3',
    reportedAt: `${dateStr}T09:15:00`,
    assignee: 'Campus IT Network Cell (SCSE)',
  },
  {
    id: 'inc2',
    title: 'Main RFID Anti-theft Turnstile Gate 2 Sensor Desync',
    description: 'Optical reader and RFID desync at Ground Floor Dr. APJ Abdul Kalam Central Reading Hall entrance.',
    severity: 'medium',
    status: 'open',
    roomId: 'r2',
    reportedAt: `${dateStr}T09:30:00`,
  },
  {
    id: 'inc3',
    title: 'HVAC Climate Drift in Smart Discussion Room 1',
    description: 'Zone temperature sensor reading 26.8°C above comfort threshold in Smart Collaborative Discussion Room 1.',
    severity: 'high',
    status: 'investigating',
    roomId: 'r4',
    reportedAt: `${dateStr}T08:45:00`,
    assignee: 'Estate & Facilities Team',
  },
  {
    id: 'inc4',
    title: 'WebOPAC Digital Kiosk Terminal 4 Offline',
    description: 'Touchscreen catalog terminal at Central Reading Hall portico unresponsive.',
    severity: 'critical',
    status: 'open',
    reportedAt: `${dateStr}T09:05:00`,
  },
  {
    id: 'inc5',
    title: 'Morning Scholar High-Tea Replenishment Delay',
    description: 'Morning refreshments delivery delayed by 15 minutes due to expressway traffic.',
    severity: 'low',
    status: 'resolved',
    reportedAt: `${dateStr}T08:00:00`,
    resolvedAt: `${dateStr}T08:25:00`,
    assignee: 'Catering Lead',
  },
  {
    id: 'inc6',
    title: 'Block A Seminar Hall Mic Array Audio Feedback',
    description: 'Stage microphone sensitivity loop resolved by recalibrating digital sound processor.',
    severity: 'medium',
    status: 'resolved',
    roomId: 'r7',
    reportedAt: `${dateStr}T09:02:00`, resolvedAt: `${dateStr}T09:10:00`, assignee: 'AV Team',
  },
];

// ── Activities ─────────────────────────────────────────────────────────────────

export const activities: Activity[] = [
  { id: 'a1', type: 'session-start', message: 'Opening Keynote has started in Grand Hall A', timestamp: `${dateStr}T09:00:00` },
  { id: 'a2', type: 'incident', message: 'Badge Scanner Offline — Critical incident reported', timestamp: `${dateStr}T09:05:00` },
  { id: 'a3', type: 'check-in', message: '50 attendees checked in via mobile pass', timestamp: `${dateStr}T09:08:00` },
  { id: 'a4', type: 'session-start', message: 'AI in Event Management panel is now live', timestamp: `${dateStr}T09:02:00` },
  { id: 'a5', type: 'incident', message: 'Projector malfunction reported in Grand Hall A', timestamp: `${dateStr}T09:15:00` },
  { id: 'a6', type: 'check-in', message: '120 attendees checked in during last hour', timestamp: `${dateStr}T09:20:00` },
  { id: 'a7', type: 'room-change', message: 'VIP Lounge occupancy increased to 12', timestamp: `${dateStr}T09:22:00` },
  { id: 'a8', type: 'session-start', message: 'Building Scalable Event Platforms workshop started', timestamp: `${dateStr}T09:30:00` },
  { id: 'a9', type: 'session-start', message: 'Design Systems for Live Experiences workshop started', timestamp: `${dateStr}T09:30:00` },
  { id: 'a10', type: 'incident', message: 'HVAC temperature alert in Workshop Room 1', timestamp: `${dateStr}T09:30:00` },
  { id: 'a11', type: 'alert', message: 'Grand Hall A approaching 85% capacity', timestamp: `${dateStr}T09:35:00` },
  { id: 'a12', type: 'check-in', message: '25 VIP attendees have arrived', timestamp: `${dateStr}T09:40:00` },
  { id: 'a13', type: 'registration', message: '15 walk-in registrations processed', timestamp: `${dateStr}T09:42:00` },
  { id: 'a14', type: 'session-end', message: 'Early Bird Registration Mixer completed', timestamp: `${dateStr}T08:00:00` },
  { id: 'a15', type: 'session-end', message: 'Microservices Deep Dive completed', timestamp: `${dateStr}T08:30:00` },
];

// ── Attendance Data ────────────────────────────────────────────────────────────

export const attendanceData: AttendanceDataPoint[] = [
  { time: '07:00', attendees: 45, capacity: 1200 },
  { time: '07:30', attendees: 120, capacity: 1200 },
  { time: '08:00', attendees: 280, capacity: 1200 },
  { time: '08:30', attendees: 450, capacity: 1200 },
  { time: '09:00', attendees: 720, capacity: 1200 },
  { time: '09:30', attendees: 866, capacity: 1200 },
  { time: '10:00', attendees: 940, capacity: 1200 },
  { time: '10:30', attendees: 1020, capacity: 1200 },
  { time: '11:00', attendees: 1050, capacity: 1200 },
  { time: '11:30', attendees: 1080, capacity: 1200 },
  { time: '12:00', attendees: 1100, capacity: 1200 },
  { time: '12:30', attendees: 980, capacity: 1200 },
  { time: '13:00', attendees: 920, capacity: 1200 },
  { time: '13:30', attendees: 950, capacity: 1200 },
  { time: '14:00', attendees: 1000, capacity: 1200 },
  { time: '14:30', attendees: 1060, capacity: 1200 },
  { time: '15:00', attendees: 1020, capacity: 1200 },
  { time: '15:30', attendees: 980, capacity: 1200 },
  { time: '16:00', attendees: 900, capacity: 1200 },
  { time: '16:30', attendees: 750, capacity: 1200 },
  { time: '17:00', attendees: 400, capacity: 1200 },
];

// ── Budget Data ────────────────────────────────────────────────────────────────

export const budgetData: BudgetItem[] = [
  { category: 'Venue', planned: 45000, actual: 43500 },
  { category: 'Catering', planned: 28000, actual: 31200 },
  { category: 'AV/Tech', planned: 22000, actual: 19800 },
  { category: 'Marketing', planned: 15000, actual: 14200 },
  { category: 'Speakers', planned: 35000, actual: 33000 },
  { category: 'Staff', planned: 18000, actual: 18500 },
  { category: 'Logistics', planned: 12000, actual: 11800 },
  { category: 'Misc', planned: 8000, actual: 9200 },
];

// ── Aggregated Stats ───────────────────────────────────────────────────────────

export const eventStats: EventStats = {
  totalAttendees: 1247,
  checkedInAttendees: 866,
  activeSessions: sessions.filter(s => s.status === 'live').length,
  totalSessions: sessions.length,
  roomsOccupied: rooms.filter(r => r.status === 'occupied').length,
  totalRooms: rooms.length,
  openIncidents: incidents.filter(i => i.status !== 'resolved').length,
  totalIncidents: incidents.length,
};

// ── Session ratings for analytics ──────────────────────────────────────────────

export const sessionRatings = sessions
  .filter(s => s.rating != null)
  .map(s => ({ name: s.title.length > 30 ? s.title.slice(0, 27) + '...' : s.title, rating: s.rating! }))
  .sort((a, b) => b.rating - a.rating);

// ── Room utilization for analytics ─────────────────────────────────────────────

export const roomUtilization = rooms.map(r => ({
  name: r.name.length > 18 ? r.name.slice(0, 15) + '...' : r.name,
  fullName: r.name,
  utilization: Math.round((r.currentOccupancy / r.capacity) * 100),
  occupancy: r.currentOccupancy,
  capacity: r.capacity,
}));

// ── Incident trend data ────────────────────────────────────────────────────────

export const incidentTrendData = [
  { time: '07:00', incidents: 0, resolved: 0 },
  { time: '08:00', incidents: 1, resolved: 0 },
  { time: '08:30', incidents: 2, resolved: 1 },
  { time: '09:00', incidents: 4, resolved: 1 },
  { time: '09:15', incidents: 5, resolved: 2 },
  { time: '09:30', incidents: 6, resolved: 2 },
  { time: '10:00', incidents: 6, resolved: 3 },
];

// ── Track color mapping ────────────────────────────────────────────────────────

export const trackColors: Record<string, string> = {
  keynote: '#6366f1',
  workshop: '#22c55e',
  panel: '#f59e0b',
  networking: '#06b6d4',
  breakout: '#ec4899',
};
