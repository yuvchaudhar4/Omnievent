import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET personal agenda for attendee
router.get('/', (req, res) => {
  const userId = (req.query.userId as string) || 'default_user';
  const sessionIds = store.getPersonalAgenda(userId);
  const allSessions = store.getSessions();
  const sessions = allSessions.filter(s => sessionIds.includes(s.id));

  res.json({
    success: true,
    data: {
      userId,
      sessionIds,
      sessions,
    },
  });
});

// POST toggle session in personal agenda
router.post('/toggle', (req, res) => {
  const { sessionId, userId = 'default_user' } = req.body;
  if (!sessionId) {
    res.status(400).json({ success: false, error: 'sessionId required' });
    return;
  }

  const updatedIds = store.togglePersonalAgenda(sessionId, userId);
  res.json({
    success: true,
    data: {
      userId,
      sessionIds: updatedIds,
      isBookmarked: updatedIds.includes(sessionId),
    },
  });
});

export default router;

