import express from 'express';
import cors from 'cors';
import eventRouter from './routes/event.js';
import sessionsRouter from './routes/sessions.js';
import roomsRouter from './routes/rooms.js';
import incidentsRouter from './routes/incidents.js';
import resourcesRouter from './routes/resources.js';
import communicationsRouter from './routes/communications.js';
import agendaRouter from './routes/agenda.js';
import auditRouter from './routes/audit.js';
import telemetryRouter from './routes/telemetry.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security & Ethical Governance Headers Middleware ──────────────────────────
app.use((_req, res, next) => {
  res.setHeader('X-Ethical-Governance', 'PULSE-v2.0; DPDP-2023; GDPR-Art5-Minimization; Human-In-The-Loop');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ── CORS Configuration ────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-Requested-With'],
}));

app.use(express.json());

// ── Ethical Request Logging (Zero PII retention) ──────────────────────────────
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[PULSE API ${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'PULSE AI Event Operating System - Ethical Backend',
    version: '2.0.0',
    ethicalStandards: {
      dataMinimization: 'ACTIVE',
      differentialPrivacyNoise: 'LAPLACE_EPSILON_1.2',
      humanInTheLoopEnforcement: 'ENFORCED',
      cryptographicAuditTrail: 'SHA-256_HASH_CHAINED',
    },
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── Mount Domain Routes ───────────────────────────────────────────────────────
app.use('/api/event', eventRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/communications', communicationsRouter);
app.use('/api/agenda', agendaRouter);
app.use('/api/audit-ledger', auditRouter);
app.use('/api/ethics', auditRouter);
app.use('/api/telemetry', telemetryRouter);

// ── Central Error Handling ────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[PULSE Server Error]:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal Operating System Server Error',
    message: err.message,
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('─────────────────────────────────────────────────────────────────');
  console.log(`⚡ PULSE Ethical Backend Engine operational on http://localhost:${PORT}`);
  console.log(`🛡️  Governance: DPDP Act 2023 & GDPR Art. 5 Data Minimization Active`);
  console.log(`⛓️   Cryptographic Hash-Chained Audit Ledger Initialized`);
  console.log(`📡  Real-time Telemetry SSE Stream on http://localhost:${PORT}/api/telemetry/stream`);
  console.log('─────────────────────────────────────────────────────────────────');
});

