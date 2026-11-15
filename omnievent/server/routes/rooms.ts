import { Router } from 'express';
import { store } from '../db/store.js';
import { privacyService } from '../ethics/privacy.js';

const router = Router();

// GET all rooms (with optional Differential Privacy)
router.get('/', (req, res) => {
  const applyPrivacy = req.query.dp === 'true' || req.query.privacy === 'high';
  const rawRooms = store.getRooms();

  const rooms = rawRooms.map(r => ({
    ...r,
    currentOccupancy: applyPrivacy
      ? privacyService.applyDifferentialPrivacyCount(r.currentOccupancy)
      : r.currentOccupancy,
  }));

  res.json({
    success: true,
    differentialPrivacyApplied: applyPrivacy,
    data: rooms,
  });
});

// GET single room
router.get('/:id', (req, res) => {
  const room = store.getRoomById(req.params.id);
  if (!room) {
    res.status(404).json({ success: false, error: 'Room not found' });
    return;
  }
  res.json({ success: true, data: room });
});

// PUT update room
router.put('/:id', (req, res) => {
  const updated = store.updateRoom(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, error: 'Room not found' });
    return;
  }
  res.json({ success: true, data: updated });
});

export default router;

