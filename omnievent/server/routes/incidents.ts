import { Router } from 'express';
import { store } from '../db/store.js';
import { constraintSolver } from '../solver/cpsat.js';
import { humanInTheLoopGuard } from '../ethics/humanInTheLoop.js';
import { auditLedger } from '../ethics/auditLedger.js';
import type { Incident, CommunicationMessage } from '../types.js';

const router = Router();

// GET incidents
router.get('/', (_req, res) => {
  const incidents = store.getIncidents();
  res.json({ success: true, data: incidents });
});

// POST report new incident
router.post('/', (req, res) => {
  const body = req.body;
  const newIncident: Incident = {
    ...body,
    id: body.id || `inc-${Date.now()}`,
    status: 'open',
    reportedAt: new Date().toISOString(),
  };

  const created = store.addIncident(newIncident);

  auditLedger.record({
    action: 'INCIDENT_ESCALATED',
    actor: {
      userId: req.headers['x-user-id'] as string || 'marshal_field',
      role: 'safety_marshal',
      name: body.assignee || 'Venue Field Marshal',
    },
    details: {
      incidentId: created.id,
      title: created.title,
      severity: created.severity,
      roomId: created.roomId,
    },
  });

  res.status(201).json({ success: true, data: created });
});

// POST generate recovery options using CP-SAT solver
router.post('/:id/solve', (req, res) => {
  const incident = store.getIncidentById(req.params.id);
  if (!incident) {
    res.status(404).json({ success: false, error: 'Incident not found' });
    return;
  }

  const allSessions = store.getSessions();
  const allRooms = store.getRooms();

  // Find affected session
  const affectedSession = allSessions.find(s => s.roomId === incident.roomId) || allSessions[0];

  const recoveryOptions = constraintSolver.solve(incident, affectedSession, allRooms, allSessions);

  // Update incident status to options_ready
  store.updateIncident(incident.id, { status: 'options_ready' });

  res.json({
    success: true,
    data: {
      incident,
      affectedSession,
      recoveryOptions,
    },
  });
});

// POST commit and approve a recovery option (Enforces Human-in-the-Loop)
router.post('/:id/approve', (req, res) => {
  const incident = store.getIncidentById(req.params.id);
  if (!incident) {
    res.status(404).json({ success: false, error: 'Incident not found' });
    return;
  }

  const { planId, newRoomId, newTime, humanSignature } = req.body;

  // 1. Enforce Human-in-the-Loop Guard
  const approvalValidation = humanInTheLoopGuard.validateApproval(
    humanSignature,
    `COMMIT_RECOVERY_PLAN_${planId || 'DEFAULT'}`
  );

  if (!approvalValidation.authorized) {
    res.status(403).json({
      success: false,
      error: approvalValidation.reason,
      complianceNote: 'PULSE requires human-in-the-loop authorization to execute spatial or timeline schedule adjustments.',
    });
    return;
  }

  // 2. Identify affected session and target room
  const allSessions = store.getSessions();
  const affectedSession = allSessions.find(s => s.roomId === incident.roomId) || allSessions[0];
  const targetRoom = store.getRoomById(newRoomId || 'r2');

  if (affectedSession && targetRoom) {
    // Reassign session to new room
    store.updateSession(affectedSession.id, {
      roomId: targetRoom.id,
      status: 'live',
      ...(newTime ? { startTime: newTime.split('–')[0]?.trim() || affectedSession.startTime } : {}),
    });

    // Update rooms status
    if (incident.roomId) {
      store.updateRoom(incident.roomId, { status: 'maintenance', currentOccupancy: 0 });
    }
    store.updateRoom(targetRoom.id, { status: 'occupied', currentOccupancy: affectedSession.attendeeCount });

    // Mark incident resolved
    store.updateIncident(incident.id, {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
    });

    // 3. Auto-draft announcement in Communications Studio
    const autoMsg: CommunicationMessage = {
      id: `msg-autodraft-${Date.now()}`,
      audience: 'incident_affected',
      targetSessionTitle: affectedSession.title,
      targetRoomName: targetRoom.name,
      title: `Notice: "${affectedSession.title}" Relocated to ${targetRoom.name}`,
      content: `Due to maintenance in ${incident.roomId ? store.getRoomById(incident.roomId)?.name : 'original hall'}, session is relocated to ${targetRoom.name} (Floor ${targetRoom.floor}). Wayfinding maps have updated automatically.`,
      channel: 'push',
      status: 'approved',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recipientsCount: affectedSession.attendeeCount,
      isAutoDraft: true,
      dispatchedAt: new Date().toISOString(),
    };
    store.addMessage(autoMsg);

    // 4. Log committed recovery to cryptographic audit ledger
    auditLedger.record({
      action: 'HUMAN_APPROVAL_COMMITTED',
      actor: {
        userId: approvalValidation.verifiedSignature!.organizerId,
        role: 'human_organizer',
        name: approvalValidation.verifiedSignature!.organizerName,
      },
      details: {
        incidentId: incident.id,
        planId,
        affectedSessionId: affectedSession.id,
        newRoomId: targetRoom.id,
        newRoomName: targetRoom.name,
        autoDispatchedMessageId: autoMsg.id,
        rationale: approvalValidation.verifiedSignature!.rationale,
      },
      ethicalGuarantees: {
        humanInTheLoopEnforced: true,
        stepFreeAccessibilityPreserved: targetRoom.stepFreeAccessible,
      },
    });

    res.json({
      success: true,
      message: `Recovery plan committed successfully by ${approvalValidation.verifiedSignature!.organizerName}`,
      data: {
        incident: store.getIncidentById(incident.id),
        updatedSession: store.getSessionById(affectedSession.id),
        targetRoom,
        autoNotification: autoMsg,
      },
    });
  } else {
    res.status(400).json({ success: false, error: 'Could not resolve target room or affected session' });
  }
});

export default router;

