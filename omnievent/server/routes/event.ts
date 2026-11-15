import { Router } from 'express';
import { store } from '../db/store.js';
import { auditLedger } from '../ethics/auditLedger.js';

const router = Router();

router.get('/', (_req, res) => {
  const meta = store.getEventMeta();
  res.json({ success: true, data: meta });
});

router.put('/', (req, res) => {
  const updates = req.body;
  const updated = store.updateEventMeta(updates);

  auditLedger.record({
    action: 'SESSION_SCHEDULE_MODIFIED',
    actor: {
      userId: req.headers['x-user-id'] as string || 'organizer_chief',
      role: 'human_organizer',
      name: updated.primaryOrganizer,
    },
    details: {
      action: 'UPDATE_EVENT_METADATA',
      updatedFields: Object.keys(updates),
    },
    ethicalGuarantees: {
      humanInTheLoopEnforced: true,
    },
  });

  res.json({ success: true, data: updated });
});

export default router;

