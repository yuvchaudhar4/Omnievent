import fs from 'node:fs';
import path from 'node:path';
import type {
  EventMeta,
  Session,
  Room,
  Speaker,
  Incident,
  ResourceItem,
  CommunicationMessage,
} from '../types.js';

interface PulseDatabaseSchema {
  eventMeta: EventMeta;
  sessions: Session[];
  rooms: Room[];
  speakers: Speaker[];
  incidents: Incident[];
  resources: ResourceItem[];
  messages: CommunicationMessage[];
  personalAgendas: Record<string, string[]>; // attendeeHash -> sessionIds
}

const defaultDatabase: PulseDatabaseSchema = {
  eventMeta: {
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
  },
  rooms: [
    { id: 'r1', name: 'GUKC Central Auditorium (Block C)', capacity: 800, currentOccupancy: 645, status: 'occupied', floor: 1, stepFreeAccessible: true, equipment: ['dual-4k-laser-projector', 'jbl-line-array', 'shure-wireless-mics', 'livestream-encoder', 'ada-hearing-loop'] },
    { id: 'r2', name: 'Dr. APJ Abdul Kalam Central Reading Hall', capacity: 350, currentOccupancy: 280, status: 'occupied', floor: 1, stepFreeAccessible: true, equipment: ['rfid-kiosks', 'webopac-terminals', 'high-speed-wifi-6', 'digital-signage'] },
    { id: 'r3', name: 'AI & Data Science Block Hub (Level 2)', capacity: 80, currentOccupancy: 72, status: 'occupied', floor: 2, stepFreeAccessible: true, equipment: ['nvidia-dgx-workstations', 'interactive-touch-displays', 'dual-camera-telepresence'] },
    { id: 'r4', name: 'Smart Collaborative Discussion Room 1', capacity: 50, currentOccupancy: 42, status: 'occupied', floor: 2, stepFreeAccessible: true, equipment: ['4k-touch-whiteboard', 'conference-audio-puck'] },
    { id: 'r5', name: 'Smart Collaborative Discussion Room 2', capacity: 50, currentOccupancy: 0, status: 'available', floor: 2, stepFreeAccessible: true, equipment: ['4k-touch-whiteboard', 'conference-audio-puck'] },
    { id: 'r6', name: 'E-Resource & IEEE Digital Library Centre', capacity: 120, currentOccupancy: 98, status: 'occupied', floor: 2, stepFreeAccessible: true, equipment: ['desktop-terminals', 'ieee-scopus-gateways', 'laser-printers'] },
    { id: 'r7', name: 'Block A Multimedia Seminar Hall', capacity: 250, currentOccupancy: 195, status: 'occupied', floor: 1, stepFreeAccessible: true, equipment: ['stage-mic-array', 'confidence-monitors', '4k-laser-projector'] },
    { id: 'r8', name: 'Scholarly Networking Atrium & Cafe', capacity: 200, currentOccupancy: 134, status: 'occupied', floor: 1, stepFreeAccessible: true, equipment: ['digital-signage', 'espresso-bar', 'high-speed-wifi-6'] },
    { id: 'r9', name: 'Faculty Research & Executive Lounge', capacity: 45, currentOccupancy: 18, status: 'occupied', floor: 3, stepFreeAccessible: true, equipment: ['executive-display', 'conference-telepresence'] },
    { id: 'r10', name: 'Doctoral Research & Rare Book Carrels', capacity: 35, currentOccupancy: 0, status: 'reserved', floor: 3, stepFreeAccessible: true, equipment: ['silent-study-cubicles', 'microfilm-scanner'] },
  ],
  speakers: [
    { id: 's1', name: 'Dr. Debal C. Kar', title: 'University Librarian & Head Knowledge Resource Centre', company: 'Galgotias University' },
    { id: 's2', name: 'Dr. Harish Kumar G. R.', title: 'Dean, School of Computing Science and Engineering (SCSE)', company: 'Galgotias University' },
    { id: 's3', name: 'Dr. Manish Raj', title: 'Dean, School of Artificial Intelligence', company: 'Galgotias University' },
    { id: 's4', name: 'Dr. Vineeta Khemchandani', title: 'Dean, School of Computer Applications & Technology', company: 'Galgotias University' },
    { id: 's5', name: 'Prof. (Dr.) Nitin Kumar Gaur', title: 'Vice-Chancellor', company: 'Galgotias University' },
    { id: 's6', name: 'Dr. Neha Gupta', title: 'Professor & Lead Researcher, Generative AI Lab', company: 'Galgotias University' },
    { id: 's7', name: 'Dr. Anupam Kumar Sharma', title: 'Director of Research & Innovation', company: 'Galgotias University' },
    { id: 's8', name: 'Prof. Rajeshwari S.', title: 'Head, Cyber Security & DPDP Compliance Cell', company: 'Galgotias University' },
  ],
  sessions: [
    {
      id: 'ses1',
      title: 'Inaugural Keynote: AI-Driven Knowledge Systems & Modern Academic Libraries',
      description: 'An architectural perspective on ambient spatial AI, semantic vector search, and digital knowledge graphs transforming university libraries.',
      track: 'keynote',
      status: 'live',
      roomId: 'r1',
      startTime: `${new Date().toISOString().split('T')[0]}T09:00:00`,
      endTime: `${new Date().toISOString().split('T')[0]}T10:00:00`,
      speakers: [
        { id: 's1', name: 'Dr. Debal C. Kar', title: 'University Librarian & Head Knowledge Resource Centre', company: 'Galgotias University' },
        { id: 's5', name: 'Prof. (Dr.) Nitin Kumar Gaur', title: 'Vice-Chancellor', company: 'Galgotias University' },
      ],
      speakerId: 's1',
      attendeeCount: 645,
      maxAttendees: 800,
      rating: 4.9,
      requiresStepFreeAccess: true,
    },
    {
      id: 'ses2',
      title: 'Deep Learning & LLM Fine-Tuning on Campus HPC Clusters',
      description: 'Distributed model training, GPU memory bandwidth optimization, and data preprocessing inside the AI & Data Science Block.',
      track: 'workshop',
      status: 'live',
      roomId: 'r3',
      startTime: `${new Date().toISOString().split('T')[0]}T09:30:00`,
      endTime: `${new Date().toISOString().split('T')[0]}T11:00:00`,
      speakers: [{ id: 's2', name: 'Dr. Harish Kumar G. R.', title: 'Dean, School of Computing Science and Engineering (SCSE)', company: 'Galgotias University' }],
      speakerId: 's2',
      attendeeCount: 72,
      maxAttendees: 80,
      rating: 4.8,
      requiresStepFreeAccess: true,
    },
    {
      id: 'ses3',
      title: 'Transforming Academic Publishing with Open Access & IEEE Xplore',
      description: 'Strategies for indexing high-impact research papers, navigating open access, and utilizing GUKC institutional repositories.',
      track: 'workshop',
      status: 'live',
      roomId: 'r4',
      startTime: `${new Date().toISOString().split('T')[0]}T09:30:00`,
      endTime: `${new Date().toISOString().split('T')[0]}T11:00:00`,
      speakers: [{ id: 's7', name: 'Dr. Anupam Kumar Sharma', title: 'Director of Research & Innovation', company: 'Galgotias University' }],
      speakerId: 's7',
      attendeeCount: 42,
      maxAttendees: 50,
      rating: 4.6,
      requiresStepFreeAccess: true,
    },
    {
      id: 'ses4',
      title: 'Panel: Ethical AI Governance & DPDP Act 2023 in Indian Academia',
      description: 'Academic leaders and compliance officers address student data privacy, algorithm accountability, and DPDP Act 2023 mandates.',
      track: 'panel',
      status: 'live',
      roomId: 'r7',
      startTime: `${new Date().toISOString().split('T')[0]}T09:00:00`,
      endTime: `${new Date().toISOString().split('T')[0]}T10:30:00`,
      speakers: [
        { id: 's3', name: 'Dr. Manish Raj', title: 'Dean, School of Artificial Intelligence', company: 'Galgotias University' },
        { id: 's4', name: 'Dr. Vineeta Khemchandani', title: 'Dean, School of Computer Applications & Technology', company: 'Galgotias University' },
        { id: 's8', name: 'Prof. Rajeshwari S.', title: 'Head, Cyber Security & DPDP Compliance Cell', company: 'Galgotias University' },
      ],
      speakerId: 's3',
      attendeeCount: 195,
      maxAttendees: 250,
      rating: 4.7,
      requiresStepFreeAccess: true,
    },
    {
      id: 'ses5',
      title: 'Scholars Morning Networking & Digital Poster Showcase',
      description: 'Peer networking, research poster presentations, and scholarly book fair with morning refreshment service.',
      track: 'networking',
      status: 'live',
      roomId: 'r8',
      startTime: `${new Date().toISOString().split('T')[0]}T08:30:00`,
      endTime: `${new Date().toISOString().split('T')[0]}T09:30:00`,
      speakers: [],
      attendeeCount: 134,
      maxAttendees: 200,
      rating: 4.5,
      requiresStepFreeAccess: true,
    },
    {
      id: 'ses6',
      title: 'Hands-on Workshop: Vector Databases & Semantic WebOPAC Search',
      description: 'Building vector index embeddings over 130,000+ university library volumes using open-source models.',
      track: 'breakout',
      status: 'live',
      roomId: 'r6',
      startTime: `${new Date().toISOString().split('T')[0]}T09:00:00`,
      endTime: `${new Date().toISOString().split('T')[0]}T10:30:00`,
      speakers: [{ id: 's6', name: 'Dr. Neha Gupta', title: 'Professor & Lead Researcher, Generative AI Lab', company: 'Galgotias University' }],
      speakerId: 's6',
      attendeeCount: 98,
      maxAttendees: 120,
      rating: 4.8,
      requiresStepFreeAccess: true,
    },
    {
      id: 'ses7',
      title: 'Valedictory Address & Research Awards Convocation',
      description: 'Recognizing outstanding research scholars, faculty citations, and presidential closing remarks.',
      track: 'keynote',
      status: 'scheduled',
      roomId: 'r1',
      startTime: `${new Date().toISOString().split('T')[0]}T16:00:00`,
      endTime: `${new Date().toISOString().split('T')[0]}T17:00:00`,
      speakers: [{ id: 's5', name: 'Prof. (Dr.) Nitin Kumar Gaur', title: 'Vice-Chancellor', company: 'Galgotias University' }],
      speakerId: 's5',
      attendeeCount: 0,
      maxAttendees: 800,
      rating: 4.9,
      requiresStepFreeAccess: true,
    },
    {
      id: 'ses8',
      title: 'Cyber Security Safeguards for Institutional Repositories',
      description: 'Mitigating automated credential stuffing, safeguarding digital dissertations, and ransomware resilience.',
      track: 'workshop',
      status: 'scheduled',
      roomId: 'r5',
      startTime: `${new Date().toISOString().split('T')[0]}T11:30:00`,
      endTime: `${new Date().toISOString().split('T')[0]}T13:00:00`,
      speakers: [{ id: 's8', name: 'Prof. Rajeshwari S.', title: 'Head, Cyber Security & DPDP Compliance Cell', company: 'Galgotias University' }],
      speakerId: 's8',
      attendeeCount: 0,
      maxAttendees: 50,
      rating: 4.6,
      requiresStepFreeAccess: true,
    },
    {
      id: 'ses9',
      title: 'Industry-Academia Panel on Computing Innovations',
      description: 'Strengthening R&D partnerships between Galgotias tech labs and Noida/Greater Noida tech corporations.',
      track: 'panel',
      status: 'scheduled',
      roomId: 'r7',
      startTime: `${new Date().toISOString().split('T')[0]}T11:00:00`,
      endTime: `${new Date().toISOString().split('T')[0]}T12:30:00`,
      speakers: [
        { id: 's2', name: 'Dr. Harish Kumar G. R.', title: 'Dean, School of Computing Science and Engineering (SCSE)', company: 'Galgotias University' },
        { id: 's4', name: 'Dr. Vineeta Khemchandani', title: 'Dean, School of Computer Applications & Technology', company: 'Galgotias University' },
      ],
      speakerId: 's2',
      attendeeCount: 0,
      maxAttendees: 250,
      rating: 4.7,
      requiresStepFreeAccess: true,
    },
    {
      id: 'ses10',
      title: 'High-Tea & Collaborative Academic Exchange',
      description: 'Networking roundtables and collaborative research discourse in the Central Library Atrium.',
      track: 'networking',
      status: 'scheduled',
      roomId: 'r8',
      startTime: `${new Date().toISOString().split('T')[0]}T12:30:00`,
      endTime: `${new Date().toISOString().split('T')[0]}T14:00:00`,
      speakers: [],
      attendeeCount: 0,
      maxAttendees: 200,
      rating: 4.4,
      requiresStepFreeAccess: true,
    },
  ],
  incidents: [
    {
      id: 'inc1',
      title: 'High-Density Wi-Fi Bandwidth Saturation at AI Hub',
      description: 'Concurrent LLM fine-tuning downloads causing packet drops and latency spikes in AI & Data Science Block Hub.',
      severity: 'high',
      status: 'open',
      roomId: 'r3',
      type: 'equipment_failure',
      reportedAt: `${new Date().toISOString().split('T')[0]}T09:15:00`,
      assignee: 'Er. Vikram Sharma (Campus IT Network Cell)',
    },
    {
      id: 'inc2',
      title: 'Main RFID Anti-theft Turnstile Gate 2 Sensor Desync',
      description: 'Optical barcode and RFID desync at Ground Floor Dr. APJ Abdul Kalam Central Reading Hall entrance.',
      severity: 'medium',
      status: 'investigating',
      roomId: 'r2',
      type: 'equipment_failure',
      reportedAt: `${new Date().toISOString().split('T')[0]}T09:20:00`,
      assignee: 'GUKC Technical Automation Team',
    },
    {
      id: 'inc3',
      title: 'HVAC Climate Drift in Smart Discussion Room 1',
      description: 'Zone sensor reading 26.8°C above comfort threshold in Smart Collaborative Discussion Room 1.',
      severity: 'medium',
      status: 'open',
      roomId: 'r4',
      type: 'room_unavailable',
      reportedAt: `${new Date().toISOString().split('T')[0]}T09:30:00`,
      assignee: 'Estate & Facilities Directorate',
    },
  ],
  resources: [
    { id: 'res-1', name: 'Student Volunteer Marshals (SCSE & AI Society)', category: 'volunteer', allocated: 18, forecastNeeded: 14, location: 'GUKC Main Portico & Foyer', status: 'surplus', costPerUnit: 15 },
    { id: 'res-2', name: 'OPAC Helpdesk Assistants & Microphone Runners', category: 'volunteer', allocated: 6, forecastNeeded: 10, location: 'Level 2 Corridor & Discussion Wings', status: 'shortage', costPerUnit: 15, assignedRoomId: 'r3' },
    { id: 'res-3', name: 'Scholarly Conclave High-Tea & Espresso Service', category: 'catering', allocated: 650, forecastNeeded: 750, location: 'Scholarly Networking Atrium', status: 'shortage', costPerUnit: 3, assignedRoomId: 'r8' },
    { id: 'res-4', name: 'Conference Luncheon Covers (Faculty & Delegates)', category: 'catering', allocated: 1400, forecastNeeded: 1300, location: 'Central Dining Pavilion', status: 'surplus', costPerUnit: 8 },
    { id: 'res-5', name: 'NVIDIA A100 GPU High-Performance Compute Blades', category: 'equipment', allocated: 8, forecastNeeded: 6, location: 'AI & Data Science Block Hub', status: 'optimal', costPerUnit: 250, assignedRoomId: 'r3' },
    { id: 'res-6', name: 'Dual 4K Laser Projector Rig & Shure Stage Mics', category: 'equipment', allocated: 12, forecastNeeded: 10, location: 'Central Auditorium AV Control Booth', status: 'optimal', costPerUnit: 120, assignedRoomId: 'r1' },
  ],
  messages: [
    {
      id: 'msg-1',
      audience: 'all',
      title: 'Welcome to Galgotias University AI & Knowledge Conclave 2026',
      content: 'Registration and RFID digital badging are active at GUKC Central Portico. Access WebOPAC and IEEE e-resources via campus Wi-Fi.',
      channel: 'push',
      status: 'dispatched',
      timestamp: '08:30 AM',
      recipientsCount: 1850,
      dispatchedAt: `${new Date().toISOString().split('T')[0]}T08:30:00`,
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
      dispatchedAt: `${new Date().toISOString().split('T')[0]}T08:45:00`,
    },
  ],
  personalAgendas: {
    default_user: ['ses1', 'ses2', 'ses4'],
  },
};

class StoreRepository {
  private dbPath: string;
  private data: PulseDatabaseSchema;

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'server', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = path.join(dataDir, 'pulse-db.json');

    if (fs.existsSync(this.dbPath)) {
      try {
        const fileContent = fs.readFileSync(this.dbPath, 'utf-8');
        this.data = JSON.parse(fileContent);
      } catch (err) {
        console.warn('[PULSE Store] Corrupted database file, restoring defaults:', err);
        this.data = JSON.parse(JSON.stringify(defaultDatabase));
        this.persist();
      }
    } else {
      this.data = JSON.parse(JSON.stringify(defaultDatabase));
      this.persist();
    }
  }

  private persist() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[PULSE Store] Failed to persist data to disk:', err);
    }
  }

  public getEventMeta(): EventMeta {
    return this.data.eventMeta;
  }

  public updateEventMeta(updates: Partial<EventMeta>): EventMeta {
    this.data.eventMeta = { ...this.data.eventMeta, ...updates };
    this.persist();
    return this.data.eventMeta;
  }

  public getSessions(): Session[] {
    return this.data.sessions;
  }

  public getSessionById(id: string): Session | undefined {
    return this.data.sessions.find(s => s.id === id);
  }

  public addSession(session: Session): Session {
    this.data.sessions.unshift(session);
    this.persist();
    return session;
  }

  public updateSession(id: string, updates: Partial<Session>): Session | null {
    const idx = this.data.sessions.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.sessions[idx] = { ...this.data.sessions[idx], ...updates };
    this.persist();
    return this.data.sessions[idx];
  }

  public deleteSession(id: string): boolean {
    const initialLen = this.data.sessions.length;
    this.data.sessions = this.data.sessions.filter(s => s.id !== id);
    if (this.data.sessions.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  public getRooms(): Room[] {
    return this.data.rooms;
  }

  public getRoomById(id: string): Room | undefined {
    return this.data.rooms.find(r => r.id === id);
  }

  public updateRoom(id: string, updates: Partial<Room>): Room | null {
    const idx = this.data.rooms.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.rooms[idx] = { ...this.data.rooms[idx], ...updates };
    this.persist();
    return this.data.rooms[idx];
  }

  public getSpeakers(): Speaker[] {
    return this.data.speakers;
  }

  public getIncidents(): Incident[] {
    return this.data.incidents;
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.data.incidents.find(i => i.id === id);
  }

  public addIncident(incident: Incident): Incident {
    this.data.incidents.unshift(incident);
    this.persist();
    return incident;
  }

  public updateIncident(id: string, updates: Partial<Incident>): Incident | null {
    const idx = this.data.incidents.findIndex(i => i.id === id);
    if (idx === -1) return null;
    this.data.incidents[idx] = { ...this.data.incidents[idx], ...updates };
    this.persist();
    return this.data.incidents[idx];
  }

  public getResources(): ResourceItem[] {
    return this.data.resources;
  }

  public addResource(resource: ResourceItem): ResourceItem {
    this.data.resources.unshift(resource);
    this.persist();
    return resource;
  }

  public updateResource(id: string, updates: Partial<ResourceItem>): ResourceItem | null {
    const idx = this.data.resources.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.resources[idx] = { ...this.data.resources[idx], ...updates };
    this.persist();
    return this.data.resources[idx];
  }

  public rebalanceResources(): ResourceItem[] {
    this.data.resources = this.data.resources.map(r => ({
      ...r,
      allocated: r.forecastNeeded,
      status: 'optimal',
    }));
    this.persist();
    return this.data.resources;
  }

  public getMessages(): CommunicationMessage[] {
    return this.data.messages;
  }

  public addMessage(message: CommunicationMessage): CommunicationMessage {
    this.data.messages.unshift(message);
    this.persist();
    return message;
  }

  public updateMessage(id: string, updates: Partial<CommunicationMessage>): CommunicationMessage | null {
    const idx = this.data.messages.findIndex(m => m.id === id);
    if (idx === -1) return null;
    this.data.messages[idx] = { ...this.data.messages[idx], ...updates };
    this.persist();
    return this.data.messages[idx];
  }

  public deleteMessage(id: string): boolean {
    const initialLen = this.data.messages.length;
    this.data.messages = this.data.messages.filter(m => m.id !== id);
    if (this.data.messages.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  public getPersonalAgenda(userId = 'default_user'): string[] {
    return this.data.personalAgendas[userId] || [];
  }

  public togglePersonalAgenda(sessionId: string, userId = 'default_user'): string[] {
    const current = this.data.personalAgendas[userId] || [];
    const exists = current.includes(sessionId);
    const updated = exists ? current.filter(id => id !== sessionId) : [...current, sessionId];
    this.data.personalAgendas[userId] = updated;
    this.persist();
    return updated;
  }
}

export const store = new StoreRepository();

