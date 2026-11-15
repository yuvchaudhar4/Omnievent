import { Router } from 'express';
import { auditLedger } from '../ethics/auditLedger.js';
import { privacyService } from '../ethics/privacy.js';

const router = Router();

// GET all audit ledger entries
router.get('/', (_req, res) => {
  const entries = auditLedger.getAll();
  res.json({
    success: true,
    totalEntries: entries.length,
    data: entries,
  });
});

// GET verify cryptographic chain integrity
router.get('/verify', (_req, res) => {
  const result = auditLedger.verifyIntegrity();
  res.json({
    success: true,
    status: result.isValid ? 'CRYPTO_INTEGRITY_VERIFIED' : 'TAMPERING_DETECTED',
    data: result,
  });
});

// GET ethics and DPDP/GDPR compliance report
router.get('/privacy-report', (_req, res) => {
  const report = privacyService.generateComplianceReport();
  res.json({
    success: true,
    data: report,
  });
});

export default router;

