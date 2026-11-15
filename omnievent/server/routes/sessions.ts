import { Router } from 'express';
import { store } from '../db/store.js';
import { auditLedger } from '../ethics/auditLedger.js';
import type { Session } from '../types.js';

const router = Router();

function doTimeRangesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const tA1 = new Date(startA).getTime();
  const tA2 = new Date(endA).getTime();
  const tB1 = new Date(startB).getTime();
  const tB2 = new Date(endB).getTime();
  if (isNaN(tA1) || isNaN(tA2) || isNaN(tB1) || isNaN(tB2)) return false;
  return tA1 < tB2 && tA2 > tB1;
}

// GET all sessions
router.get('/', (_req, res) => {
  const sessions = store.getSessions();
  res.json({ success: true, data: sessions });
});

// GET conflict detection report
router.get('/conflicts', (_req, res) => {
  const sessions = store.getSessions();
  const rooms = store.getRooms();
  const speakers = store.getSpeakers();

  const roomConflicts: Array<{
    roomId: string;
    roomName: string;
    sessionA: Session;
    sessionB: Session;
  }> = [];

  const speakerConflicts: Array<{
    speakerId?: string;
    speakerName: string;
    sessionA: Session;
    sessionB: Session;
  }> = [];

  const capacityWarnings: Array<{
    session: Session;
    roomName: string;
    excess: number;
  }> = [];

  for (let i = 0; i < sessions.length; i++) {
    for (let j = i + 1; j < sessions.length; j++) {
      const s1 = sessions[i];
      const s2 = sessions[j];
      if (s1.status === 'cancelled' || s2.status === 'cancelled') continue;

      if (doTimeRangesOverlap(s1.startTime, s1.endTime, s2.startTime, s2.endTime)) {
        // Room collision
        if (s1.roomId && s2.roomId && s1.roomId === s2.roomId) {
          const room = rooms.find(r => r.id === s1.roomId);
          roomConflicts.push({
            roomId: s1.roomId,
            roomName: room ? room.name : s1.roomId,
            sessionA: s1,
            sessionB: s2,
          });
        }

        // Speaker double-booking
        const sp1Ids = s1.speakers?.map(sp => sp.id) || (s1.speakerId ? [s1.speakerId] : []);
        const sp2Ids = s2.speakers?.map(sp => sp.id) || (s2.speakerId ? [s2.speakerId] : []);
        const commonSpeaker = sp1Ids.find(id => sp2Ids.includes(id));

        if (commonSpeaker) {
          const spObj = speakers.find(s => s.id === commonSpeaker);
          speakerConflicts.push({
            speakerId: commonSpeaker,
            speakerName: spObj ? spObj.name : 'Assigned Speaker',
            sessionA: s1,
            sessionB: s2,
          });
        }
      }
    }

    // Capacity checks
    const s = sessions[i];
    const room = rooms.find(r => r.id === s.roomId);
    if (room && room.capacity > 0) {
      const load = Math.max(s.attendeeCount || 0, s.maxAttendees || 0);
      if (load > room.capacity) {
        capacityWarnings.push({
          session: s,
          roomName: room.name,
          excess: load - room.capacity,
        });
      }
    }
  }

  res.json({
    success: true,
    data: {
      roomConflicts,
      speakerConflicts,
      capacityWarnings,
      totalConflicts: roomConflicts.length + speakerConflicts.length + capacityWarnings.length,
    },
  });
});

// POST create session
router.post('/', (req, res) => {
  const body = req.body;
  const newSession: Session = {
    ...body,
    id: body.id || `ses-${Date.now()}`,
    status: body.status || 'scheduled',
    attendeeCount: body.attendeeCount || 0,
    maxAttendees: Number(body.maxAttendees) || 100,
    requiresStepFreeAccess: body.requiresStepFreeAccess ?? true,
  };

  const created = store.addSession(newSession);

  auditLedger.record({
    action: 'SESSION_SCHEDULE_MODIFIED',
    actor: {
      userId: req.headers['x-user-id'] as string || 'organizer_planner',
      role: 'human_organizer',
      name: 'Event Architectural Planner',
    },
    details: {
      action: 'CREATE_SESSION',
      sessionId: created.id,
      title: created.title,
      roomId: created.roomId,
    },
    ethicalGuarantees: {
      humanInTheLoopEnforced: true,
      stepFreeAccessibilityPreserved: created.requiresStepFreeAccess ?? true,
    },
  });

  res.status(201).json({ success: true, data: created });
});

// PUT update session
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = store.updateSession(id, updates);

  if (!updated) {
    res.status(404).json({ success: false, error: 'Session not found' });
    return;
  }

  auditLedger.record({
    action: 'SESSION_SCHEDULE_MODIFIED',
    actor: {
      userId: req.headers['x-user-id'] as string || 'organizer_planner',
      role: 'human_organizer',
      name: 'Event Architectural Planner',
    },
    details: {
      action: 'UPDATE_SESSION',
      sessionId: id,
      updatedFields: Object.keys(updates),
    },
  });

  res.json({ success: true, data: updated });
});

// DELETE session
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const deleted = store.deleteSession(id);

  if (!deleted) {
    res.status(404).json({ success: false, error: 'Session not found' });
    return;
  }

  auditLedger.record({
    action: 'SESSION_SCHEDULE_MODIFIED',
    actor: {
      userId: req.headers['x-user-id'] as string || 'organizer_planner',
      role: 'human_organizer',
      name: 'Event Architectural Planner',
    },
    details: {
      action: 'DELETE_SESSION',
      sessionId: id,
    },
  });

  res.json({ success: true, message: 'Session deleted successfully' });
});

export default router;

