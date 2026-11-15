import { Router, type Response } from 'express';
import { store } from '../db/store.js';
import { privacyService } from '../ethics/privacy.js';

const router = Router();

const clients: Set<Response> = new Set();

// SSE Stream endpoint
router.get('/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  clients.add(res);

  // Send initial snapshot
  const initialPayload = {
    type: 'SNAPSHOT',
    timestamp: new Date().toISOString(),
    eventMeta: store.getEventMeta(),
    activeSessionsCount: store.getSessions().filter(s => s.status === 'live').length,
    anonymizedAttendeeCount: privacyService.applyDifferentialPrivacyCount(1247),
    systemHealth: 99.8,
  };

  res.write(`data: ${JSON.stringify(initialPayload)}\n\n`);

  req.on('close', () => {
    clients.delete(res);
  });
});

// Periodic heartbeat & simulated telemetry ticker
setInterval(() => {
  if (clients.size === 0) return;

  const sources = ['Digital Twin', 'Command Centre', 'Schedule Matrix', 'Rescue Engine'];
  const targets = ['Event Brain', 'Attendee Navigator', 'Resource Engine'];
  const labels = ['Turnstile Influx Pulse', 'Room Occupancy Polled', 'NFC Gate Delta (14/sec)', 'Audio Telemetry Stable'];

  const s = sources[Math.floor(Math.random() * sources.length)];
  const t = targets[Math.floor(Math.random() * targets.length)];
  const l = labels[Math.floor(Math.random() * labels.length)];

  const tickData = {
    type: 'BRAIN_SIGNAL',
    id: `sig-${Date.now()}`,
    source: s,
    target: t,
    label: l,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    occupancyDelta: privacyService.applyDifferentialPrivacyCount(1240 + Math.floor(Math.random() * 20)),
  };

  const payload = `data: ${JSON.stringify(tickData)}\n\n`;
  for (const client of clients) {
    client.write(payload);
  }
}, 6000);

export default router;

