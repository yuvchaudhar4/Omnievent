import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Radio,
  ArrowRight,
  Boxes,
  MessageSquareShare,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { palette, typography } from '../lib/theme';
import { useEventState } from '../context/EventStateContext';
import { MagneticButton } from './animated/LivingData';

export default function ButterflyEffectOverlay() {
  const {
    butterfly,
    advanceButterflyStep,
    resetDisruption,
    resolveDisruption,
    triggerDisruption,
  } = useEventState();

  const [expanded, setExpanded] = useState(true);

  if (!butterfly.active) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 900,
      }}>
        <MagneticButton
          variant="primary"
          onClick={() => triggerDisruption('inc1')}
          title="Simulate Event Disruption & Butterfly Ripple"
          style={{
            background: palette.bgSecondary,
            color: palette.primary,
            border: `1.5px solid ${palette.primary}`,
            boxShadow: '0 8px 24px rgba(230, 107, 69, 0.2)',
            padding: '10px 18px',
          }}
        >
          <Zap size={15} color={palette.primary} />
          <span style={{ fontFamily: typography.fontMono, fontSize: 11, fontWeight: 700 }}>
            SIMULATE BUTTERFLY CASCADE
          </span>
        </MagneticButton>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Disruption Detected', icon: ShieldAlert, active: butterfly.rippleStep >= 1, desc: 'Network & A/V fluctuation in Central Auditorium' },
    { num: 2, label: 'Connected Sessions', icon: Radio, active: butterfly.rippleStep >= 2, desc: 'Downstream research tracks notified' },
    { num: 3, label: 'Crowd Rerouting', icon: ArrowRight, active: butterfly.rippleStep >= 3, desc: '645 delegates guided to Kalam Reading Hall' },
    { num: 4, label: 'Resource Shift', icon: Boxes, active: butterfly.rippleStep >= 4, desc: 'Volunteers & backup equipment dispatched' },
    { num: 5, label: 'Dispatch Broadcast', icon: MessageSquareShare, active: butterfly.rippleStep >= 5, desc: 'Targeted notification sent to delegates' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 900,
      maxWidth: 480,
      width: 'calc(100vw - 48px)',
      fontFamily: typography.fontBody,
    }}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        style={{
          background: palette.bgSecondary,
          borderRadius: 14,
          border: `1.5px solid ${palette.primary}`,
          boxShadow: '0 12px 36px rgba(230, 107, 69, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header Bar */}
        <div style={{
          padding: '14px 18px',
          background: '#FDF5F2',
          borderBottom: `1px solid ${palette.borderDark}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: palette.primary,
              display: 'inline-block',
              boxShadow: '0 0 0 3px rgba(230, 107, 69, 0.25)',
            }} />
            <div>
              <div style={{ fontFamily: typography.fontHeading, fontSize: 14, fontWeight: 700, color: palette.textMain }}>
                BUTTERFLY CASCADE ACTIVE
              </div>
              <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.primary, fontWeight: 600 }}>
                CP-SAT RIPPLE REACTION ENGINE
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'none',
                border: 'none',
                color: palette.textMuted,
                fontSize: 11,
                fontFamily: typography.fontMono,
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              {expanded ? 'MINIMIZE' : 'EXPAND'}
            </button>
            <button
              onClick={resetDisruption}
              title="Reset Simulation"
              style={{
                background: 'none',
                border: 'none',
                color: palette.textMuted,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 4,
              }}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Expandable Cascade Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ padding: 18 }}
            >
              {/* Ripple Canvas Mini-SVG Map */}
              <div style={{
                position: 'relative',
                height: 120,
                background: palette.bgMain,
                borderRadius: 8,
                border: `1px solid ${palette.border}`,
                overflow: 'hidden',
                marginBottom: 16,
              }}>
                <svg width="100%" height="100%" viewBox="0 0 400 120">
                  {/* Background grid */}
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#E9E4DA" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="200" y1="0" x2="200" y2="120" stroke="#E9E4DA" strokeWidth="1" strokeDasharray="4 4" />

                  {/* Room 1 (Affected): Grand Hall A */}
                  <rect x="50" y="30" width="100" height="60" rx="6" fill="#FDF5F2" stroke={palette.primary} strokeWidth="2" />
                  <text x="100" y="55" textAnchor="middle" fill={palette.primary} fontSize="10" fontFamily={typography.fontMono} fontWeight="700">
                    HALL A (OFFLINE)
                  </text>
                  <text x="100" y="72" textAnchor="middle" fill={palette.textMuted} fontSize="9" fontFamily={typography.fontMono}>
                    480 Attendees
                  </text>

                  {/* Expanding Ripple Rings from Hall A */}
                  <motion.circle
                    cx="100"
                    cy="60"
                    r="20"
                    fill="none"
                    stroke={palette.primary}
                    strokeWidth="1.5"
                    animate={{ r: [20, 90], opacity: [0.8, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <motion.circle
                    cx="100"
                    cy="60"
                    r="20"
                    fill="none"
                    stroke={palette.primary}
                    strokeWidth="1"
                    animate={{ r: [20, 90], opacity: [0.8, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
                  />

                  {/* Room 2 (Target Recovery): Grand Hall B */}
                  <rect x="250" y="30" width="100" height="60" rx="6" fill="#EEF3FC" stroke={palette.secondary} strokeWidth="2" />
                  <text x="300" y="55" textAnchor="middle" fill={palette.secondary} fontSize="10" fontFamily={typography.fontMono} fontWeight="700">
                    HALL B (READY)
                  </text>
                  <text x="300" y="72" textAnchor="middle" fill={palette.successText} fontSize="9" fontFamily={typography.fontMono}>
                    Standby Calibrated
                  </text>

                  {/* Dynamic Reroute Polyline */}
                  <path
                    d="M 150 60 C 180 30, 220 30, 250 60"
                    fill="none"
                    stroke={palette.primary}
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />

                  {/* Moving crowd particles */}
                  <motion.circle
                    r="3.5"
                    fill={palette.primary}
                    animate={{
                      cx: [150, 200, 250],
                      cy: [60, 38, 60],
                    }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.circle
                    r="3.5"
                    fill={palette.secondary}
                    animate={{
                      cx: [150, 200, 250],
                      cy: [60, 38, 60],
                    }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  />
                </svg>
              </div>

              {/* 5-Step Cascade Progress Horizon */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {steps.map((st) => (
                  <div
                    key={st.num}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: st.active ? palette.bgMain : '#FAF8F4',
                      border: `1px solid ${st.active ? palette.primary : palette.border}`,
                      opacity: st.active ? 1 : 0.45,
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: st.active ? palette.primary : palette.borderDark,
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: typography.fontMono,
                    }}>
                      {st.num}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: palette.textMain }}>
                        {st.label}
                      </div>
                      <div style={{ fontSize: 11, color: palette.textMuted }}>
                        {st.desc}
                      </div>
                    </div>

                    {st.active && (
                      <span style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.primary, fontWeight: 700 }}>
                        PROPAGATED
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Toast Message Live Banner */}
              {butterfly.toastMessage && (
                <div style={{
                  padding: '10px 14px',
                  background: '#FDF5F2',
                  border: '1px solid #F4C4B5',
                  borderRadius: 6,
                  fontSize: 12,
                  color: palette.primary,
                  fontFamily: typography.fontMono,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <Sparkles size={14} />
                  <span>{butterfly.toastMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                {butterfly.rippleStep < 5 ? (
                  <MagneticButton
                    variant="primary"
                    onClick={advanceButterflyStep}
                    style={{ flex: 1 }}
                  >
                    <span>Advance Ripple (Step {butterfly.rippleStep + 1}/5)</span>
                    <ArrowRight size={14} />
                  </MagneticButton>
                ) : (
                  <MagneticButton
                    variant="primary"
                    onClick={() => resolveDisruption('plan-1')}
                    style={{ flex: 1, background: palette.secondary }}
                  >
                    <span>Commit Recovery Plan</span>
                    <Sparkles size={14} />
                  </MagneticButton>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

