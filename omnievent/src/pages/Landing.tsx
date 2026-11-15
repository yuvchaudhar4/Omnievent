import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { palette, typography } from '../lib/theme';
import EventUniverse from '../components/EventUniverse';
import { useReducedMotion } from '../lib/motion';

export default function Landing() {
  const { prefersReduced } = useReducedMotion();
  const [heroPointer, setHeroPointer] = useState({ x: 0, y: 0 });

  // Sandbox interactive mini-rescue state
  const [demoState, setDemoState] = useState<'idle' | 'disrupted' | 'solved'>('idle');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHeroPointer({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div style={{
      background: palette.bgMain,
      color: palette.textMain,
      fontFamily: typography.fontBody,
      minHeight: '100vh',
      overflowX: 'hidden',
    }}>
      {/* ── Top Editorial Navigation ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(247, 244, 236, 0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${palette.border}`,
      }}>
        <div style={{
          maxWidth: 1360,
          margin: '0 auto',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 6,
              background: palette.primary,
              color: '#FFFFFF',
              fontFamily: typography.fontHeading,
              fontWeight: 700,
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: '-0.04em',
            }}>
              OE
            </div>
            <div>
              <span style={{
                fontFamily: typography.fontHeading,
                fontSize: 16,
                fontWeight: 700,
                color: palette.textMain,
                letterSpacing: '-0.02em',
              }}>
                OMNIEVENT
              </span>
              <span style={{
                fontFamily: typography.fontMono,
                fontSize: 10,
                color: palette.textMuted,
                marginLeft: 8,
                padding: '2px 5px',
                borderRadius: 4,
                background: palette.bgParchment,
              }}>
                OS v2.4
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a href="#topology" style={{ textDecoration: 'none', fontSize: 13, color: palette.textMain, fontWeight: 500 }}>
              Spatial Graph
            </a>
            <a href="#architecture" style={{ textDecoration: 'none', fontSize: 13, color: palette.textMain, fontWeight: 500 }}>
              4-Stage Lifecycle
            </a>
            <a href="#rescue-engine" style={{ textDecoration: 'none', fontSize: 13, color: palette.textMain, fontWeight: 500 }}>
              Rescue Engine
            </a>
            <Link
              to="/dashboard"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                borderRadius: 8,
                background: palette.primary,
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: typography.fontBody,
                boxShadow: '0 2px 8px rgba(230, 107, 69, 0.25)',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = palette.primaryHover}
              onMouseLeave={e => e.currentTarget.style.background = palette.primary}
            >
              <span>Launch Command Centre</span>
              <ArrowRight size={14} />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Section 1: Cinematic Editorial Hero ── */}
      <section
        onMouseMove={handleMouseMove}
        style={{
          position: 'relative',
          padding: '80px 28px 100px',
          borderBottom: `1px solid ${palette.border}`,
          overflow: 'hidden',
          background: `
            radial-gradient(circle at ${heroPointer.x || 300}px ${heroPointer.y || 200}px, rgba(230, 107, 69, 0.05) 0%, transparent 45%),
            #F7F4EC
          `,
        }}
      >
        <div style={{ maxWidth: 1360, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)', gap: 48, alignItems: 'center' }}>
            {/* Left: Bold Architectural Headlines */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 12px',
                  borderRadius: 20,
                  background: palette.bgSecondary,
                  border: `1px solid ${palette.borderDark}`,
                  fontFamily: typography.fontMono,
                  fontSize: 11,
                  fontWeight: 700,
                  color: palette.secondary,
                  marginBottom: 20,
                  boxShadow: palette.shadowSoft,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: palette.primary }} />
                GUKC EDITION • GALGOTIAS UNIVERSITY KNOWLEDGE CENTRE
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                  fontFamily: typography.fontHeading,
                  fontSize: 'clamp(36px, 5.5vw, 64px)',
                  fontWeight: 700,
                  lineHeight: 1.05,
                  letterSpacing: '-0.04em',
                  color: palette.textMain,
                  margin: '0 0 24px',
                }}
              >
                One shared AI brain to plan, run, rescue, and learn.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{
                  fontSize: 17,
                  lineHeight: 1.6,
                  color: palette.textMuted,
                  margin: '0 0 36px',
                  maxWidth: 580,
                }}
              >
                OmniEvent is an active operating system for live conferences and summits. Powered by mathematical constraint programming (Google OR-Tools CP-SAT) rather than hallucinating conversational chatbots, it detects disruptions and recalculates conflict-free schedules in under 5 seconds.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}
              >
                <Link
                  to="/dashboard"
                  style={{
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 28px',
                    borderRadius: 8,
                    background: palette.primary,
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: typography.fontBody,
                    boxShadow: '0 4px 14px rgba(230, 107, 69, 0.3)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = palette.primaryHover}
                  onMouseLeave={e => e.currentTarget.style.background = palette.primary}
                >
                  <span>Open Command Centre</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/rescue"
                  style={{
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 24px',
                    borderRadius: 8,
                    background: palette.bgSecondary,
                    border: `1px solid ${palette.borderDark}`,
                    color: palette.textMain,
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: typography.fontBody,
                    boxShadow: palette.shadowSoft,
                  }}
                >
                  <ShieldAlert size={16} color={palette.primary} />
                  <span>Interactive Rescue Engine</span>
                </Link>
              </motion.div>
            </div>

            {/* Right: Architectural Isometric Perspective Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                background: palette.bgSecondary,
                borderRadius: 14,
                padding: 28,
                border: `1px solid ${palette.borderDark}`,
                boxShadow: palette.shadowFloat,
                position: 'relative',
              }}
            >
              {/* Card Header Stamp */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 16,
                borderBottom: `1px solid ${palette.border}`,
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: palette.successText }} />
                  <span style={{ fontFamily: typography.fontMono, fontSize: 11, fontWeight: 700, color: palette.textMain }}>
                    GUKC GREATER NOIDA • SYSTEM HEALTH
                  </span>
                </div>
                <span style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.secondary }}>
                  SOLVER: CP-SAT ACTIVE
                </span>
              </div>

              {/* Telemetry Stats Rows */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div style={{ padding: 14, borderRadius: 8, background: palette.bgMain, border: `1px solid ${palette.border}` }}>
                  <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>LIVE ATTENDEES</div>
                  <div style={{ fontFamily: typography.fontMono, fontSize: 24, fontWeight: 700, color: palette.textMain, marginTop: 2 }}>
                    1,247
                  </div>
                  <div style={{ fontSize: 11, color: palette.successText, marginTop: 4 }}>+866 checked-in</div>
                </div>

                <div style={{ padding: 14, borderRadius: 8, background: palette.bgMain, border: `1px solid ${palette.border}` }}>
                  <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>AVG RESCUE TIME</div>
                  <div style={{ fontFamily: typography.fontMono, fontSize: 24, fontWeight: 700, color: palette.primary, marginTop: 2 }}>
                    3.4s
                  </div>
                  <div style={{ fontSize: 11, color: palette.textMuted, marginTop: 4 }}>Capped under 5.0s</div>
                </div>
              </div>

              {/* Visualized Spatial Timeline Bar */}
              <div style={{
                padding: 16,
                borderRadius: 8,
                background: '#FCFBF8',
                border: `1px solid ${palette.border}`,
                marginBottom: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: typography.fontMono, color: palette.textMuted, marginBottom: 8 }}>
                  <span>TRACK 01 (MAIN CONCOURSE)</span>
                  <span style={{ color: palette.primary, fontWeight: 700 }}>LIVE KEYNOTE</span>
                </div>
                <div style={{ display: 'flex', gap: 4, height: 32 }}>
                  <div style={{ flex: 3, background: '#EAEFFE', borderRadius: 4, border: '1px solid #C5D3FA', display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 10, fontFamily: typography.fontMono, color: palette.secondary, fontWeight: 700 }}>
                    KEYNOTE (09:00 - 10:00)
                  </div>
                  <div style={{ flex: 2, background: '#F1F5E4', borderRadius: 4, border: '1px solid #D6DFB5', display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 10, fontFamily: typography.fontMono, color: palette.successText, fontWeight: 700 }}>
                    WORKSHOP 1
                  </div>
                  <div style={{ flex: 2, background: '#FDF6E2', borderRadius: 4, border: '1px solid #EBCB73', display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 10, fontFamily: typography.fontMono, color: palette.warningText, fontWeight: 700 }}>
                    PANEL
                  </div>
                </div>
              </div>

              {/* Bottom Quote Stamp */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 11,
                fontFamily: typography.fontMono,
                color: palette.textMuted,
              }}>
                <CheckCircle2 size={14} color={palette.successText} />
                <span>Zero hallucinations on critical schedules & room capacities</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Spatial Event Topology Showcase ── */}
      <section id="topology" style={{ padding: '80px 28px', borderBottom: `1px solid ${palette.border}` }}>
        <div style={{ maxWidth: 1360, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 40px' }}>
            <span style={{
              fontFamily: typography.fontMono,
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 4,
              background: palette.bgParchment,
              color: palette.secondary,
              letterSpacing: '0.06em',
            }}>
              INTERACTIVE EVENT UNIVERSE
            </span>
            <h2 style={{
              fontFamily: typography.fontHeading,
              fontSize: 32,
              fontWeight: 700,
              color: palette.textMain,
              margin: '12px 0 10px',
              letterSpacing: '-0.03em',
            }}>
              Every session, speaker and room topologically linked.
            </h2>
            <p style={{ fontSize: 14, color: palette.textMuted, lineHeight: 1.5 }}>
              Click any node below to inspect real-time capacity and routing constraints across the Galgotias University Library venue.
            </p>
          </div>

          <EventUniverse />
        </div>
      </section>

      {/* ── Section 3: The 4-Stage Architectural Journey ── */}
      <section id="architecture" style={{ padding: '90px 28px', borderBottom: `1px solid ${palette.border}` }}>
        <div style={{ maxWidth: 1360, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 60px' }}>
            <span style={{
              fontFamily: typography.fontMono,
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 4,
              background: palette.bgParchment,
              color: palette.secondary,
              letterSpacing: '0.06em',
            }}>
              THE CLOSED-LOOP EVENT LIFECYCLE
            </span>
            <h2 style={{
              fontFamily: typography.fontHeading,
              fontSize: 32,
              fontWeight: 700,
              color: palette.textMain,
              margin: '12px 0 10px',
              letterSpacing: '-0.03em',
            }}>
              Plan. Run. Rescue. Learn.
            </h2>
            <p style={{ fontSize: 14, color: palette.textMuted }}>
              Four orchestrated phases sharing a single unified Event Brain data core.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {/* Stage 1: Plan */}
            <div
              style={{
                background: palette.bgSecondary,
                borderRadius: 12,
                padding: 28,
                border: `1px solid ${palette.border}`,
                boxShadow: palette.shadowSoft,
              }}
            >
              <div style={{
                fontFamily: typography.fontMono,
                fontSize: 12,
                fontWeight: 700,
                color: palette.secondary,
                marginBottom: 12,
              }}>
                STAGE 01 — PLAN
              </div>
              <h3 style={{ fontFamily: typography.fontHeading, fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>
                Mathematical Copilot
              </h3>
              <p style={{ fontSize: 13, color: palette.textMuted, lineHeight: 1.55, marginBottom: 20 }}>
                Input event headcount, budget, and dates. Generates schema-validated DAG task dependencies with critical path timelines and budget line items.
              </p>
              <div style={{ padding: 12, background: palette.bgMain, borderRadius: 8, border: `1px solid ${palette.border}`, fontSize: 11, fontFamily: typography.fontMono, color: palette.textMain }}>
                ✓ NetworkX critical path analysis<br />
                ✓ Zero hallucination budget ceiling
              </div>
            </div>

            {/* Stage 2: Run */}
            <div
              style={{
                background: palette.bgSecondary,
                borderRadius: 12,
                padding: 28,
                border: `1px solid ${palette.border}`,
                boxShadow: palette.shadowSoft,
              }}
            >
              <div style={{
                fontFamily: typography.fontMono,
                fontSize: 12,
                fontWeight: 700,
                color: palette.primary,
                marginBottom: 12,
              }}>
                STAGE 02 — RUN
              </div>
              <h3 style={{ fontFamily: typography.fontHeading, fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>
                Spatial Command Operations
              </h3>
              <p style={{ fontSize: 13, color: palette.textMuted, lineHeight: 1.55, marginBottom: 20 }}>
                Live QR turnstile scans and session attendance counts feed SVG floor plans in real time. Predicts hallway congestion 15 minutes ahead.
              </p>
              <div style={{ padding: 12, background: palette.bgMain, borderRadius: 8, border: `1px solid ${palette.border}`, fontSize: 11, fontFamily: typography.fontMono, color: palette.textMain }}>
                ✓ Door turnstile velocity metrics<br />
                ✓ Predictive 15-minute queue model
              </div>
            </div>

            {/* Stage 3: Rescue */}
            <div
              style={{
                background: palette.bgSecondary,
                borderRadius: 12,
                padding: 28,
                border: `1.5px solid ${palette.primary}`,
                boxShadow: palette.shadowElevated,
                position: 'relative',
              }}
            >
              <div style={{
                fontFamily: typography.fontMono,
                fontSize: 12,
                fontWeight: 700,
                color: palette.primary,
                marginBottom: 12,
              }}>
                STAGE 03 — RESCUE (HERO)
              </div>
              <h3 style={{ fontFamily: typography.fontHeading, fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>
                Event Rescue Engine
              </h3>
              <p style={{ fontSize: 13, color: palette.textMuted, lineHeight: 1.55, marginBottom: 20 }}>
                A speaker misses a flight or a room loses power? CP-SAT constraint solvers compute 3 ranked recovery options in under 5 seconds with zero double-bookings.
              </p>
              <div style={{ padding: 12, background: '#FDF5F2', borderRadius: 8, border: '1px solid #F4C4B5', fontSize: 11, fontFamily: typography.fontMono, color: palette.primary }}>
                ✓ Solves & ranks in &lt; 5.0 seconds<br />
                ✓ One-tap cascades to all attendees
              </div>
            </div>

            {/* Stage 4: Learn */}
            <div
              style={{
                background: palette.bgSecondary,
                borderRadius: 12,
                padding: 28,
                border: `1px solid ${palette.border}`,
                boxShadow: palette.shadowSoft,
              }}
            >
              <div style={{
                fontFamily: typography.fontMono,
                fontSize: 12,
                fontWeight: 700,
                color: palette.successText,
                marginBottom: 12,
              }}>
                STAGE 04 — LEARN
              </div>
              <h3 style={{ fontFamily: typography.fontHeading, fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>
                Executive Performance Ledger
              </h3>
              <p style={{ fontSize: 13, color: palette.textMuted, lineHeight: 1.55, marginBottom: 20 }}>
                Aspect-based audience sentiment and attendance probability curves feed back into the planning copilot for the subsequent edition.
              </p>
              <div style={{ padding: 12, background: palette.bgMain, borderRadius: 8, border: `1px solid ${palette.border}`, fontSize: 11, fontFamily: typography.fontMono, color: palette.textMain }}>
                ✓ Closed feedback learning loop<br />
                ✓ Food wastage & carbon estimates
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Interactive Rescue Engine Simulator Sandbox ── */}
      <section id="rescue-engine" style={{ padding: '90px 28px', borderBottom: `1px solid ${palette.border}`, background: palette.bgSecondary }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{
              fontFamily: typography.fontMono,
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 4,
              background: '#FDF5F2',
              color: palette.primary,
              letterSpacing: '0.06em',
            }}>
              LIVE BROWSER SANDBOX
            </span>
            <h2 style={{
              fontFamily: typography.fontHeading,
              fontSize: 32,
              fontWeight: 700,
              color: palette.textMain,
              margin: '12px 0 8px',
              letterSpacing: '-0.03em',
            }}>
              Experience the Rescue Engine in action.
            </h2>
            <p style={{ fontSize: 14, color: palette.textMuted }}>
              Inject a simulated room failure and observe how OmniEvent's solver recalculates conflict-free options.
            </p>
          </div>

          <div style={{
            background: palette.bgMain,
            borderRadius: 12,
            border: `1.5px solid ${palette.borderDark}`,
            padding: 32,
            boxShadow: palette.shadowElevated,
          }}>
            {demoState === 'idle' && (
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: palette.bgParchment,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: palette.primary,
                  marginBottom: 16,
                }}>
                  <AlertTriangle size={24} />
                </div>
                <h3 style={{ fontFamily: typography.fontHeading, fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>
                  Simulate Incident: Grand Hall A Projector Failure
                </h3>
                <p style={{ fontSize: 13, color: palette.textMuted, maxWidth: 440, margin: '0 auto 20px' }}>
                  423 attendees are seated for the opening keynote. Trigger the solver to generate mathematical recovery plans.
                </p>
                <button
                  onClick={() => setDemoState('disrupted')}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 8,
                    background: palette.primary,
                    border: 'none',
                    color: '#FFFFFF',
                    fontFamily: typography.fontBody,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(230, 107, 69, 0.25)',
                  }}
                >
                  Trigger Disruption Injection
                </button>
              </div>
            )}

            {demoState === 'disrupted' && (
              <div style={{ padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontFamily: typography.fontMono,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 4,
                      background: palette.primary,
                      color: '#FFFFFF',
                    }}>
                      CRISIS DETECTED
                    </span>
                    <strong style={{ fontSize: 14 }}>CP-SAT Solver Generated 3 Ranked Plans (Execution: 0.18s)</strong>
                  </div>
                  <span style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>
                    CONSTRAINTS MET: 100%
                  </span>
                </div>

                {/* Proposed Plan Box */}
                <div style={{
                  padding: 20,
                  borderRadius: 8,
                  background: '#FFFFFF',
                  border: `2px solid ${palette.primary}`,
                  marginBottom: 20,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontFamily: typography.fontMono, fontSize: 12, fontWeight: 700, color: palette.secondary }}>
                      RECOMMENDED: PLAN A (ZERO ATTENDEE SHIFT)
                    </span>
                    <span style={{ fontFamily: typography.fontMono, fontSize: 12, fontWeight: 700, color: palette.successText }}>
                      FEASIBILITY: 96%
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: palette.textMain, margin: '0 0 14px' }}>
                    Reassign opening keynote to adjacent <strong>Grand Hall B</strong>. Standby A/V equipment calibrated. Zero time shift required.
                  </p>
                  <div style={{ display: 'flex', gap: 16, fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>
                    <span>AFFECTED: 0 ATTENDEES</span>
                    <span>DISTANCE: 40 METERS</span>
                    <span>AV SPEC: IDENTICAL 4K</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => setDemoState('solved')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 8,
                      background: palette.primary,
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Approve Recovery & Broadcast to 423 Attendees
                  </button>
                  <button
                    onClick={() => setDemoState('idle')}
                    style={{
                      padding: '12px 18px',
                      borderRadius: 8,
                      background: 'transparent',
                      border: `1px solid ${palette.borderDark}`,
                      color: palette.textMuted,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {demoState === 'solved' && (
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#F1F5E4',
                  border: '1px solid #D6DFB5',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: palette.successText,
                  marginBottom: 16,
                }}>
                  <CheckCircle2 size={28} />
                </div>
                <h3 style={{ fontFamily: typography.fontHeading, fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>
                  Schedule Resolved in 3.4 Seconds
                </h3>
                <p style={{ fontSize: 13, color: palette.textMuted, maxWidth: 440, margin: '0 auto 20px' }}>
                  All 423 attendee itineraries updated on mobile with interactive turn-by-turn wayfinding to Grand Hall B.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  <Link
                    to="/rescue"
                    style={{
                      textDecoration: 'none',
                      padding: '11px 20px',
                      borderRadius: 8,
                      background: palette.primary,
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Open Full Production Solver
                  </Link>
                  <button
                    onClick={() => setDemoState('idle')}
                    style={{
                      padding: '11px 18px',
                      borderRadius: 8,
                      background: 'transparent',
                      border: `1px solid ${palette.borderDark}`,
                      color: palette.textMuted,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Test Another Scenario
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Section 5: Editorial Swiss Footer ── */}
      <footer style={{
        padding: '60px 28px',
        background: palette.bgMain,
        borderTop: `1px solid ${palette.border}`,
      }}>
        <div style={{
          maxWidth: 1360,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}>
          <div>
            <div style={{ fontFamily: typography.fontHeading, fontSize: 18, fontWeight: 700, color: palette.textMain }}>
              OMNIEVENT OPERATING SYSTEM
            </div>
            <div style={{ fontSize: 12, color: palette.textMuted, marginTop: 4 }}>
              Knowledge Resource Infrastructure • Galgotias University Library Complex
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: palette.textMain, fontWeight: 600 }}>Command Centre</Link>
            <Link to="/planning" style={{ textDecoration: 'none', color: palette.textMain, fontWeight: 600 }}>Event Planner</Link>
            <Link to="/schedule" style={{ textDecoration: 'none', color: palette.textMain, fontWeight: 600 }}>Schedule Matrix</Link>
            <Link to="/rescue" style={{ textDecoration: 'none', color: palette.textMain, fontWeight: 600 }}>Rescue Engine</Link>
            <Link to="/digital-twin" style={{ textDecoration: 'none', color: palette.textMain, fontWeight: 600 }}>Digital Twin</Link>
            <Link to="/analytics" style={{ textDecoration: 'none', color: palette.textMain, fontWeight: 600 }}>Analytics</Link>
          </div>

          <div style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>
            © 2026 PULSE OS • GALGOTIAS UNIVERSITY KNOWLEDGE CENTRE (GUKC)
          </div>
        </div>
      </footer>
    </div>
  );
}
