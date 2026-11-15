import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { palette, typography } from '../lib/theme';
import { useEventState } from '../context/EventStateContext';
import { LivingCounter, MagneticButton } from './animated/LivingData';
import {
  Award,
  Download,
  X,
} from 'lucide-react';

export default function EventCompletionModal() {
  const { isCompletionModalOpen, closeCompletionModal, eventMetrics } = useEventState();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Custom Riviera Editorial Canvas Confetti
  useEffect(() => {
    if (!isCompletionModalOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [palette.primary, palette.secondary, palette.warning, palette.successText, '#FFFFFF'];
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      vRot: number;
      shape: 'rect' | 'circle';
    }[] = [];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 300,
        y: canvas.height * 0.35 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 12 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
      });
    }

    let animId: number;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.32; // Gravity
        p.vx *= 0.98; // Air resistance
        p.rotation += p.vRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isCompletionModalOpen]);

  if (!isCompletionModalOpen) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(37, 45, 53, 0.45)',
        backdropFilter: 'blur(6px)',
        padding: 24,
        fontFamily: typography.fontBody,
      }}>
        {/* Canvas Confetti */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 9991,
          }}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            zIndex: 9992,
            background: palette.bgSecondary,
            borderRadius: 16,
            border: `1.5px solid ${palette.primary}`,
            boxShadow: '0 24px 64px rgba(37, 45, 53, 0.25)',
            width: '100%',
            maxWidth: 720,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 28px',
            background: '#FDF5F2',
            borderBottom: `1px solid ${palette.borderDark}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: palette.primary,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Award size={20} />
              </div>
              <div>
                <h2 style={{ fontFamily: typography.fontHeading, fontSize: 18, fontWeight: 700, margin: 0, color: palette.textMain }}>
                  Summit Successfully Concluded
                </h2>
                <div style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.primary, fontWeight: 600 }}>
                  GALGOTIAS UNIVERSITY KNOWLEDGE CENTRE (GUKC) • ARCHIVE
                </div>
              </div>
            </div>

            <button
              onClick={closeCompletionModal}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: palette.textMuted,
                padding: 4,
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ padding: '28px 32px' }}>
            {/* Timeline Completion Sweep */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: typography.fontMono, marginBottom: 8 }}>
                <span style={{ color: palette.textMuted }}>EVENT EXECUTION LIFECYCLE</span>
                <span style={{ color: palette.primary, fontWeight: 700 }}>100% COMPLETE • ALL OBJECTIVES MET</span>
              </div>
              <div style={{ height: 8, background: '#E6E1D5', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: '85%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ height: '100%', background: palette.primary }}
                />
              </div>
            </div>

            {/* Living KPI Counters Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 14,
              marginBottom: 28,
            }}>
              <div style={{ padding: 14, borderRadius: 8, background: palette.bgMain, border: `1px solid ${palette.border}` }}>
                <div style={{ fontSize: 10, fontFamily: typography.fontMono, color: palette.textMuted }}>CHECKED-IN</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: palette.textMain, marginTop: 4 }}>
                  <LivingCounter value={eventMetrics.checkedIn} duration={1200} />
                </div>
                <div style={{ fontSize: 10, color: palette.successText, marginTop: 2 }}>98.4% Turnout</div>
              </div>

              <div style={{ padding: 14, borderRadius: 8, background: palette.bgMain, border: `1px solid ${palette.border}` }}>
                <div style={{ fontSize: 10, fontFamily: typography.fontMono, color: palette.textMuted }}>SESSIONS</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: palette.secondary, marginTop: 4 }}>
                  <LivingCounter value={42} suffix="/42" duration={1200} />
                </div>
                <div style={{ fontSize: 10, color: palette.secondary, marginTop: 2 }}>100% Delivered</div>
              </div>

              <div style={{ padding: 14, borderRadius: 8, background: palette.bgMain, border: `1px solid ${palette.border}` }}>
                <div style={{ fontSize: 10, fontFamily: typography.fontMono, color: palette.textMuted }}>RESCUE SPEED</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: palette.primary, marginTop: 4 }}>
                  <LivingCounter value={4.2} decimals={1} suffix="s" duration={1200} />
                </div>
                <div style={{ fontSize: 10, color: palette.primary, marginTop: 2 }}>Zero Hall Crashes</div>
              </div>

              <div style={{ padding: 14, borderRadius: 8, background: palette.bgMain, border: `1px solid ${palette.border}` }}>
                <div style={{ fontSize: 10, fontFamily: typography.fontMono, color: palette.textMuted }}>SATISFACTION</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: palette.successText, marginTop: 4 }}>
                  <LivingCounter value={4.9} decimals={1} suffix="/5" duration={1200} />
                </div>
                <div style={{ fontSize: 10, color: palette.successText, marginTop: 2 }}>+1,140 Responses</div>
              </div>
            </div>

            {/* Animated Report Assembly Deck */}
            <div style={{
              position: 'relative',
              height: 120,
              background: palette.bgMain,
              borderRadius: 10,
              border: `1px solid ${palette.border}`,
              padding: 16,
              marginBottom: 24,
              overflow: 'hidden',
            }}>
              {/* Sheet 1 (Background) */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 0.6 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 20,
                  right: 20,
                  height: 90,
                  background: '#FFFFFF',
                  borderRadius: 6,
                  border: `1px solid ${palette.border}`,
                  transform: 'rotate(-1.5deg)',
                }}
              />

              {/* Sheet 2 (Midground) */}
              <motion.div
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 4, opacity: 0.8 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 20,
                  right: 20,
                  height: 90,
                  background: '#FFFFFF',
                  borderRadius: 6,
                  border: `1px solid ${palette.border}`,
                  transform: 'rotate(1deg)',
                }}
              />

              {/* Sheet 3 (Foreground with Stamp) */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 8, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 20,
                  right: 20,
                  height: 90,
                  background: '#FFFFFF',
                  borderRadius: 6,
                  border: `1.5px solid ${palette.borderDark}`,
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: palette.shadowSoft,
                }}
              >
                <div>
                  <div style={{ fontFamily: typography.fontHeading, fontSize: 13, fontWeight: 700, color: palette.textMain }}>
                    Official Post-Mortem & Performance Ledger
                  </div>
                  <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted, marginTop: 2 }}>
                    DOC-ID: GUKC-2026-FINAL • AUDITED VIA CP-SAT & EVENT BRAIN
                  </div>
                </div>

                {/* Swiss Wax Stamp */}
                <motion.div
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 400, damping: 20 }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    background: '#FDF5F2',
                    border: `1.5px solid ${palette.primary}`,
                    color: palette.primary,
                    fontFamily: typography.fontMono,
                    fontSize: 10,
                    fontWeight: 800,
                    transform: 'rotate(-4deg)',
                  }}
                >
                  ✓ VERIFIED ARCHIVE
                </motion.div>
              </motion.div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end' }}>
              <button
                onClick={closeCompletionModal}
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  background: palette.bgMain,
                  border: `1px solid ${palette.border}`,
                  color: palette.textMain,
                  fontFamily: typography.fontBody,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close View
              </button>

              <MagneticButton
                variant="primary"
                onClick={() => {
                  alert('Generating Official Event PDF Performance Ledger...');
                }}
              >
                <Download size={14} />
                <span>Export Executive Report (.PDF)</span>
              </MagneticButton>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
