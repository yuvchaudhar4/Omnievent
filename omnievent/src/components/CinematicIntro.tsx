import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { palette, typography } from '../lib/theme';
import { useReducedMotion } from '../lib/motion';
import { Play, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CinematicIntroProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function CinematicIntro({ isOpen, onComplete }: CinematicIntroProps) {
  const { prefersReduced } = useReducedMotion();
  // 10 Choreographed Stages:
  // 0: Clean warm-ivory canvas
  // 1: Small point appears in centre
  // 2: Point expands into architectural crosshairs & linework
  // 3: Outline of large event venue draws itself
  // 4: Walls, floors & glass structures assemble in layers
  // 5: Lighting activates across different rooms
  // 6: Attendee markers begin entering venue
  // 7: Animated paths connect entrances, rooms & stages
  // 8: Typographic product identity reveal
  // 9: Camera fly-through entrance transition into environment
  const [stage, setStage] = useState<number>(1);

  useEffect(() => {
    if (!isOpen) return;
    if (prefersReduced) {
      onComplete();
      return;
    }

    const t1 = setTimeout(() => setStage(2), 600);   // 2: Expand to linework
    const t2 = setTimeout(() => setStage(3), 1500);  // 3: Outline draws
    const t3 = setTimeout(() => setStage(4), 2600);  // 4: Floors & walls assemble
    const t4 = setTimeout(() => setStage(5), 3800);  // 5: Lighting activates
    const t5 = setTimeout(() => setStage(6), 4900);  // 6: Attendees enter
    const t6 = setTimeout(() => setStage(7), 6000);  // 7: Connecting paths
    const t7 = setTimeout(() => setStage(8), 7200);  // 8: Typography reveal
    const t8 = setTimeout(() => {
      setStage(9); // 9: Camera travel through entrance
      setTimeout(onComplete, 900);
    }, 8800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(t8);
    };
  }, [isOpen, prefersReduced, onComplete]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          scale: stage === 9 ? 1.25 : 1,
          filter: stage === 9 ? 'blur(4px)' : 'blur(0px)',
        }}
        exit={{ opacity: 0, scale: 1.35 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: palette.bgMain,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          fontFamily: typography.fontBody,
        }}
      >
        {/* Subtle Architectural Coordinate Grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: stage >= 2 ? 0.45 : 0.1,
          transition: 'opacity 0.6s ease',
          backgroundImage: `
            linear-gradient(to right, ${palette.border} 1px, transparent 1px),
            linear-gradient(to bottom, ${palette.border} 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />

        {/* Top Header Stamp */}
        <div style={{
          position: 'absolute',
          top: 32,
          left: 40,
          right: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: palette.primary,
              display: 'inline-block',
              boxShadow: '0 0 0 3px rgba(230, 107, 69, 0.2)',
            }} />
            <span style={{
              fontFamily: typography.fontMono,
              fontSize: 12,
              fontWeight: 700,
              color: palette.secondary,
              letterSpacing: '0.08em',
            }}>
              PULSE VENUE GENESIS • GALGOTIAS UNIVERSITY KNOWLEDGE CENTRE (GUKC)
            </span>
          </div>

          <button
            onClick={onComplete}
            style={{
              background: palette.bgSecondary,
              border: `1px solid ${palette.borderDark}`,
              borderRadius: 6,
              padding: '6px 14px',
              fontFamily: typography.fontMono,
              fontSize: 11,
              fontWeight: 600,
              color: palette.textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: palette.shadowSoft,
              transition: 'all 0.15s ease',
            }}
          >
            <span>SKIP SEQUENCE</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Centerpiece 3D Isometric Architectural Canvas */}
        <div style={{
          position: 'relative',
          width: 800,
          height: 480,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg
            viewBox="0 0 800 480"
            width="100%"
            height="100%"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <pattern id="intro-grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#D6CFBF" />
              </pattern>
              <linearGradient id="roomGlowHallA" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E66B45" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="roomGlowHallB" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3457A4" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="roomGlowExpo" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#D6DFB5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Stage 1: Centre Origin Point with Breathing Concentric Wave */}
            {stage >= 1 && (
              <g>
                <motion.circle
                  cx="400"
                  cy="240"
                  r="4"
                  fill={palette.primary}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.4, 1] }}
                  transition={{ duration: 0.5 }}
                />
                <motion.circle
                  cx="400"
                  cy="240"
                  r="18"
                  fill="none"
                  stroke={palette.primary}
                  strokeWidth="1.2"
                  initial={{ opacity: 0, r: 4 }}
                  animate={{ opacity: [0.8, 0], r: 36 }}
                  transition={{ duration: 1.4, repeat: stage < 3 ? Infinity : 0, ease: 'easeOut' }}
                />
              </g>
            )}

            {/* Stage 2: Point Expands into Architectural Crosshairs & Linework */}
            {stage >= 2 && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.line
                  x1="400" y1="240" x2="400" y2="80"
                  stroke={palette.secondary} strokeWidth="1" strokeDasharray="3 3"
                  initial={{ y2: 240 }} animate={{ y2: 80 }} transition={{ duration: 0.6 }}
                />
                <motion.line
                  x1="400" y1="240" x2="400" y2="400"
                  stroke={palette.secondary} strokeWidth="1" strokeDasharray="3 3"
                  initial={{ y2: 240 }} animate={{ y2: 400 }} transition={{ duration: 0.6 }}
                />
                <motion.line
                  x1="400" y1="240" x2="160" y2="240"
                  stroke={palette.secondary} strokeWidth="1" strokeDasharray="3 3"
                  initial={{ x2: 400 }} animate={{ x2: 160 }} transition={{ duration: 0.6 }}
                />
                <motion.line
                  x1="400" y1="240" x2="640" y2="240"
                  stroke={palette.secondary} strokeWidth="1" strokeDasharray="3 3"
                  initial={{ x2: 400 }} animate={{ x2: 640 }} transition={{ duration: 0.6 }}
                />
                {/* Coordinate Registration Crosses */}
                <text x="170" y="235" fill={palette.textMuted} fontSize="9" fontFamily={typography.fontMono}>X: -240.00</text>
                <text x="610" y="235" fill={palette.textMuted} fontSize="9" fontFamily={typography.fontMono}>X: +240.00</text>
                <text x="405" y="95" fill={palette.textMuted} fontSize="9" fontFamily={typography.fontMono}>Y: +160.00</text>
              </motion.g>
            )}

            {/* Stage 3: Outline of Large Event Venue Draws Itself */}
            {stage >= 3 && (
              <motion.path
                d="M 160 240 L 400 100 L 640 240 L 400 380 Z"
                fill="url(#intro-grid-dots)"
                stroke={palette.primary}
                strokeWidth="2"
                strokeDasharray="1600"
                initial={{ strokeDashoffset: 1600 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.4, ease: 'easeInOut' }}
              />
            )}

            {/* Stage 4: Venue Walls, Floors & Glass Structures Assemble in Layers */}
            {stage >= 4 && (
              <motion.g
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Level 1 Concourse Base */}
                <polygon
                  points="180,235 400,110 620,235 400,360"
                  fill="#FFFFFF"
                  stroke={palette.border}
                  strokeWidth="1.5"
                />

                {/* Level 2 Upper Auditorium Floor (Offset Elevated Layer) */}
                <polygon
                  points="210,210 400,100 590,210 400,320"
                  fill="#FAF8F4"
                  stroke={palette.borderDark}
                  strokeWidth="1.2"
                  strokeDasharray="4 2"
                  opacity="0.85"
                />

                {/* Glass Facade Struts & Vertical Support Columns */}
                <line x1="180" y1="235" x2="180" y2="255" stroke={palette.textMuted} strokeWidth="2" />
                <line x1="620" y1="235" x2="620" y2="255" stroke={palette.textMuted} strokeWidth="2" />
                <line x1="400" y1="360" x2="400" y2="380" stroke={palette.textMuted} strokeWidth="2" />
                <polygon points="180,255 400,380 620,255 620,235 400,360 180,235" fill="#E8DEC8" opacity="0.45" />

                {/* Architectural Entrances & Portals */}
                <rect x="375" y="365" width="50" height="8" rx="2" fill={palette.primary} />
                <text x="400" y="360" textAnchor="middle" fill={palette.primary} fontSize="8" fontFamily={typography.fontMono} fontWeight="700">
                  PORTAL 01 (MAIN INGRESS)
                </text>
              </motion.g>
            )}

            {/* Stage 5: Lighting Gradually Activates Across Different Rooms */}
            {stage >= 5 && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {/* GUKC Central Auditorium (Primary Keynote Room) */}
                <motion.polygon
                  points="240,205 350,140 430,185 320,250"
                  fill="url(#roomGlowHallA)"
                  stroke={palette.primary}
                  strokeWidth="2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
                <text x="330" y="195" textAnchor="middle" fill={palette.primary} fontSize="11" fontFamily={typography.fontMono} fontWeight="700">
                  GUKC AUDITORIUM [KEYNOTE]
                </text>

                {/* Block A Multimedia Seminar Hall */}
                <motion.polygon
                  points="445,190 535,240 445,290 355,240"
                  fill="url(#roomGlowHallB)"
                  stroke={palette.secondary}
                  strokeWidth="1.8"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
                <text x="445" y="244" textAnchor="middle" fill={palette.secondary} fontSize="10" fontFamily={typography.fontMono} fontWeight="700">
                  BLOCK A SEMINAR HALL
                </text>

                {/* Dr. APJ Abdul Kalam Central Reading Hall */}
                <motion.polygon
                  points="210,255 300,205 370,245 280,295"
                  fill="url(#roomGlowExpo)"
                  stroke={palette.successText}
                  strokeWidth="1.5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                />
                <text x="290" y="254" textAnchor="middle" fill={palette.successText} fontSize="9" fontFamily={typography.fontMono} fontWeight="700">
                  KALAM READING HALL
                </text>
              </motion.g>
            )}

            {/* Stage 6 & 7: Attendee Markers Enter Venue & Animated Connecting Paths Draw */}
            {stage >= 6 && (
              <g>
                {/* Animated Wayfinding Trajectories from Entrance to Stages */}
                {stage >= 7 && (
                  <motion.path
                    d="M 400 365 L 400 300 L 330 230"
                    fill="none"
                    stroke={palette.primary}
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                )}
                {stage >= 7 && (
                  <motion.path
                    d="M 400 300 L 445 270"
                    fill="none"
                    stroke={palette.secondary}
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                )}

                {/* Attendee Markers entering via portal */}
                {[
                  { cx: 400, cy: 360, color: palette.primary, delay: 0 },
                  { cx: 390, cy: 340, color: palette.primary, delay: 0.1 },
                  { cx: 410, cy: 335, color: palette.secondary, delay: 0.2 },
                  { cx: 380, cy: 310, color: palette.primary, delay: 0.3 },
                  { cx: 420, cy: 300, color: palette.secondary, delay: 0.4 },
                  { cx: 340, cy: 220, color: palette.primary, delay: 0.5 },
                  { cx: 320, cy: 200, color: palette.primary, delay: 0.6 },
                  { cx: 440, cy: 235, color: palette.secondary, delay: 0.7 },
                  { cx: 460, cy: 250, color: palette.secondary, delay: 0.8 },
                  { cx: 270, cy: 245, color: palette.successText, delay: 0.9 },
                  { cx: 290, cy: 265, color: palette.successText, delay: 1.0 },
                ].map((pt, idx) => (
                  <motion.circle
                    key={idx}
                    cx={pt.cx}
                    cy={pt.cy}
                    r="3.5"
                    fill={pt.color}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.4, 1], opacity: 1 }}
                    transition={{ duration: 0.4, delay: pt.delay }}
                  />
                ))}

                {/* Destination Pulse Waves at Stages */}
                <motion.circle
                  cx="330"
                  cy="195"
                  r="12"
                  fill="none"
                  stroke={palette.primary}
                  strokeWidth="1.5"
                  animate={{ r: [12, 45], opacity: [0.8, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                />
              </g>
            )}
          </svg>

          {/* Stage 8: Reveal Product Identity Through Elegant Typographic Animation */}
          <AnimatePresence>
            {stage >= 8 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.15 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(247, 244, 236, 0.94)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 16,
                  border: `1px solid ${palette.border}`,
                  padding: 36,
                  textAlign: 'center',
                  boxShadow: palette.shadowElevated,
                }}
              >
                {/* Monogram Badge */}
                <motion.div
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 14,
                    background: palette.primary,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: typography.fontHeading,
                    fontWeight: 800,
                    fontSize: 26,
                    marginBottom: 16,
                    boxShadow: '0 8px 24px rgba(230, 107, 69, 0.35)',
                    letterSpacing: '-0.04em',
                  }}
                >
                  PL
                </motion.div>

                {/* Mask-Revealed Heading */}
                <div style={{ overflow: 'hidden', marginBottom: 6 }}>
                  <motion.h1
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      fontFamily: typography.fontHeading,
                      fontSize: 42,
                      fontWeight: 800,
                      letterSpacing: '-0.04em',
                      color: palette.textMain,
                      margin: 0,
                    }}
                  >
                    PULSE
                  </motion.h1>
                </div>

                <div style={{ overflow: 'hidden', marginBottom: 18 }}>
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      fontFamily: typography.fontMono,
                      fontSize: 12,
                      fontWeight: 700,
                      color: palette.secondary,
                      letterSpacing: '0.14em',
                    }}
                  >
                    ACADEMIC & ENTERPRISE EVENT OPERATING SYSTEM
                  </motion.div>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  style={{
                    fontSize: 14,
                    color: palette.textMuted,
                    maxWidth: 460,
                    lineHeight: 1.6,
                    margin: '0 0 26px',
                  }}
                >
                  Combinatorial CP-SAT constraint solver, spatial 3D digital twin, and living crowd intelligence initialized at Galgotias University Knowledge Centre.
                </motion.p>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onComplete}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '13px 30px',
                    borderRadius: 8,
                    background: palette.primary,
                    color: '#FFFFFF',
                    fontFamily: typography.fontBody,
                    fontSize: 14,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(230, 107, 69, 0.3)',
                  }}
                >
                  <Play size={15} fill="#FFFFFF" />
                  <span>Enter Operating System</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom 10-Stage Architectural Sequence Bar */}
        <div style={{
          position: 'absolute',
          bottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: palette.bgSecondary,
          padding: '8px 20px',
          borderRadius: 30,
          border: `1px solid ${palette.border}`,
          boxShadow: palette.shadowSoft,
          zIndex: 10,
        }}>
          {[
            { label: 'Origin Point', done: stage >= 1 },
            { label: 'Linework', done: stage >= 2 },
            { label: 'Outline', done: stage >= 3 },
            { label: 'Assembly', done: stage >= 4 },
            { label: 'Illumination', done: stage >= 5 },
            { label: 'Attendees', done: stage >= 6 },
            { label: 'Wayfinding', done: stage >= 7 },
            { label: 'Core Ready', done: stage >= 8 },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {s.done ? (
                <CheckCircle2 size={13} color={palette.successText} />
              ) : (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: palette.borderDark }} />
              )}
              <span style={{
                fontFamily: typography.fontMono,
                fontSize: 10,
                color: s.done ? palette.textMain : palette.textMuted,
                fontWeight: s.done ? 600 : 400,
              }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
