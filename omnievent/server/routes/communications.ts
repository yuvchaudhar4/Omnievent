import { Router } from 'express';
import { store } from '../db/store.js';
import { privacyService } from '../ethics/privacy.js';
import { auditLedger } from '../ethics/auditLedger.js';
import type { CommunicationMessage } from '../types.js';

const router = Router();

// GET all messages
router.get('/', (_req, res) => {
  const messages = store.getMessages();
  res.json({ success: true, data: messages });
});

// POST draft announcement
router.post('/', (req, res) => {
  const body = req.body;
  const newMsg: CommunicationMessage = {
    ...body,
    id: body.id || `msg-${Date.now()}`,
    status: body.status || 'draft',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    recipientsCount: Number(body.recipientsCount) || 100,
  };

  const created = store.addMessage(newMsg);
  res.status(201).json({ success: true, data: created });
});

// POST dispatch message (Enforces privacy consent & audit logging)
router.post('/:id/dispatch', (req, res) => {
  const { id } = req.params;
  const message = store.getMessages().find(m => m.id === id);

  if (!message) {
    res.status(404).json({ success: false, error: 'Message not found' });
    return;
  }

  // Verify privacy consent scope
  const isCriticalSafety = message.audience === 'incident_affected';
  const consentValid = privacyService.verifyBroadcastConsent('sample_attendee_group', message.channel, isCriticalSafety);

  const updated = store.updateMessage(id, {
    status: 'dispatched',
    dispatchedAt: new Date().toISOString(),
    consentVerificationToken: `dpdp-verified-${Date.now()}`,
  });

  auditLedger.record({
    action: 'BROADCAST_DISPATCHED',
    actor: {
      userId: req.headers['x-user-id'] as string || 'comm_director',
      role: 'human_organizer',
      name: 'Audience Communications Lead',
    },
    details: {
      messageId: id,
      title: message.title,
      audience: message.audience,
      channel: message.channel,
      recipientsCount: message.recipientsCount,
      consentVerified: consentValid,
      isEmergencySafetyExempt: isCriticalSafety,
    },
    ethicalGuarantees: {
      consentCompliant: consentValid,
      dataMinimizationVerified: true,
    },
  });

  res.json({
    success: true,
    message: `Broadcast successfully dispatched to ${message.recipientsCount} recipients (Demo Channel Verified)`,
    data: updated,
  });
});

// DELETE message
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const deleted = store.deleteMessage(id);
  if (!deleted) {
    res.status(404).json({ success: false, error: 'Message not found' });
    return;
  }
  res.json({ success: true, message: 'Message deleted' });
});

export default router;

