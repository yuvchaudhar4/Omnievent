import type { Room, Session } from '../types.js';

export interface AccessibilityAuditResult {
  stepFreeAccessible: boolean;
  elevatorTransitRequired: boolean;
  warnings: string[];
  recommendations: string[];
}

/**
 * AccessibilityValidator
 * Enforces accessibility standards (ADA / European Accessibility Act standards).
 * Ensures that whenever sessions move or crowds are routed, physical step-free
 * access, assistive hearing loop support, and elevator transit pathways are verified.
 */
class AccessibilityValidator {
  public validateRelocation(
    session: Session,
    targetRoom: Room,
    sourceRoom?: Room
  ): AccessibilityAuditResult {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    const isStepFree = targetRoom.stepFreeAccessible;
    const isDifferentFloor = sourceRoom ? sourceRoom.floor !== targetRoom.floor : targetRoom.floor > 1;

    if (!isStepFree) {
      warnings.push(`Target room "${targetRoom.name}" lacks step-free level entrance.`);
    }

    if (isDifferentFloor) {
      recommendations.push(
        `Vertical transit to Floor ${targetRoom.floor} requires active elevator bank authorization and priority boarding signs.`
      );
    }

    if (session.track === 'keynote' || session.attendeeCount > 200) {
      recommendations.push(
        'Verify assistive hearing loop induction amplifiers and real-time live captions screen are calibrated.'
      );
    }

    return {
      stepFreeAccessible: isStepFree,
      elevatorTransitRequired: isDifferentFloor,
      warnings,
      recommendations,
    };
  }
}

export const accessibilityValidator = new AccessibilityValidator();

