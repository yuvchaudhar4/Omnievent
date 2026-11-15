import { auditLedger } from './auditLedger.js';

export interface HumanApprovalSignature {
  organizerId: string;
  organizerName: string;
  role: 'human_organizer' | 'safety_marshal';
  actionApproved: string;
  timestamp: string;
  rationale: string;
}

/**
 * HumanInTheLoopGuard
 * Enforces strict ethical control over automated AI decision-making.
 * Prevents autonomous disruption overrides from altering physical venue operations
 * without human oversight, accountability, and explainable justification.
 */
class HumanInTheLoopGuard {
  public validateApproval(
    signature: Partial<HumanApprovalSignature> | undefined,
    actionName: string
  ): { authorized: boolean; reason?: string; verifiedSignature?: HumanApprovalSignature } {
    if (!signature || !signature.organizerId || !signature.organizerName) {
      return {
        authorized: false,
        reason: 'HUMAN_APPROVAL_REQUIRED: Automated CP-SAT solver plans require human organizer authorization prior to execution.',
      };
    }

    if (!signature.rationale || signature.rationale.trim().length < 5) {
      return {
        authorized: false,
        reason: 'RATIONALE_REQUIRED: Human operator must provide an explainability rationale for why this recovery plan was committed.',
      };
    }

    const verifiedSignature: HumanApprovalSignature = {
      organizerId: signature.organizerId,
      organizerName: signature.organizerName,
      role: signature.role || 'human_organizer',
      actionApproved: actionName,
      timestamp: new Date().toISOString(),
      rationale: signature.rationale.trim(),
    };

    // Log to immutable cryptographic audit ledger
    auditLedger.record({
      action: 'HUMAN_APPROVAL_COMMITTED',
      actor: {
        userId: verifiedSignature.organizerId,
        role: verifiedSignature.role,
        name: verifiedSignature.organizerName,
      },
      details: {
        actionApproved: verifiedSignature.actionApproved,
        rationale: verifiedSignature.rationale,
      },
      ethicalGuarantees: {
        humanInTheLoopEnforced: true,
      },
    });

    return { authorized: true, verifiedSignature };
  }
}

export const humanInTheLoopGuard = new HumanInTheLoopGuard();

