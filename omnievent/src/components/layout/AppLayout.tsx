import { useState, useEffect, useMemo, useCallback } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu, Radio, ArrowUpRight, Award } from 'lucide-react';
import Sidebar from './Sidebar';
import NotificationPanel from './NotificationPanel';
import CinematicIntro from '../CinematicIntro';
import ButterflyEffectOverlay from '../ButterflyEffectOverlay';
import EventCompletionModal from '../EventCompletionModal';
import { palette, typography } from '../../lib/theme';
import { useEventState } from '../../context/EventStateContext';

const ROUTE_INFO: Record<string, { title: string; subtitle: string; code: string }> = {
  '/dashboard': { title: 'Command Centre', subtitle: 'Live event operations telemetry & health', code: 'CMD-01' },
  '/planning': { title: 'Event Planner', subtitle: 'Architectural schedule, DAG tasks & budget', code: 'PLN-02' },
  '/schedule': { title: 'Timeline & Grid', subtitle: 'Multi-track spatial schedule matrix', code: 'SCH-03' },
  '/rescue': { title: 'Rescue Engine', subtitle: 'Constraint-driven crisis recovery solver', code: 'RSC-04' },
  '/digital-twin': { title: 'Digital Twin', subtitle: 'Spatial venue simulation & crowd flow', code: 'TWN-05' },
  '/navigator': { title: 'Attendee Navigator', subtitle: 'Personalized routes, wayfinding & agendas', code: 'NAV-06' },
  '/resources': { title: 'Resource Allocation', subtitle: 'Predictive catering, staff & equipment', code: 'RSC-07' },
  '/communications': { title: 'Communications', subtitle: 'Segmented multilingual dispatch', code: 'COM-08' },
  '/analytics': { title: 'Analytics & Report', subtitle: 'Executive post-event performance ledger', code: 'ANL-09' },
  '/settings': { title: 'Settings', subtitle: 'System preferences & solver parameters', code: 'SET-10' },
};

function getRouteMeta(pathname: string) {
  if (ROUTE_INFO[pathname]) return ROUTE_INFO[pathname];
  for (const [route, info] of Object.entries(ROUTE_INFO)) {
    if (pathname.startsWith(route)) return info;
  }
  return { title: 'PULSE', subtitle: 'Event Operating System', code: 'SYS-00' };
}

export default function AppLayout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount] = useState(2);

  const {
    status,
    isIntroPlaying,
    closeIntro,
    openCompletionModal,
    eventMetrics,
  } = useEventState();

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
    };
    window.addEventListener('resize', handler);
    handler();
    return () => window.removeEventListener('resize', handler);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const routeMeta = useMemo(() => getRouteMeta(location.pathname), [location.pathname]);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: palette.bgMain,
      color: palette.textMain,
      fontFamily: typography.fontBody,
      overflow: 'hidden',
    }}>
      {/* Cinematic Blueprint Intro Overlay */}
      <CinematicIntro isOpen={isIntroPlaying} onComplete={closeIntro} />

      {/* Sidebar Rail */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        isMobile={isMobile}
      />

      {/* Main Viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Editorial Top Bar */}
        <header style={{
          height: 68,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          padding: isMobile ? '0 16px' : '0 28px',
          gap: 16,
          borderBottom: `1px solid ${palette.border}`,
          background: palette.bgSecondary,
          boxShadow: palette.shadowSoft,
        }}>
          {isMobile && (
            <button
              onClick={toggleSidebar}
              style={{
                background: 'none',
                border: 'none',
                color: palette.textMain,
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Menu size={22} />
            </button>
          )}

          {/* Page Title & Module Code with Mask Reveal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              fontFamily: typography.fontMono,
              fontSize: 10,
              fontWeight: 700,
              padding: '3px 7px',
              borderRadius: 4,
              background: palette.bgMain,
              color: palette.secondary,
              border: `1px solid ${palette.border}`,
              letterSpacing: '0.06em',
            }}>
              {routeMeta.code}
            </span>
            <div>
              <h1 style={{
                fontFamily: typography.fontHeading,
                fontSize: 17,
                fontWeight: 700,
                color: palette.textMain,
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}>
                {routeMeta.title}
              </h1>
              {!isMobile && (
                <div style={{
                  fontSize: 11,
                  color: palette.textMuted,
                  marginTop: 1,
                }}>
                  {routeMeta.subtitle}
                </div>
              )}
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Live Venue Status Pill (Editorial Swiss Stamp) */}
          {!isMobile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 20,
              background: status === 'disrupted' ? '#FDF5F2' : palette.bgMain,
              border: `1px solid ${status === 'disrupted' ? palette.primary : palette.border}`,
              fontFamily: typography.fontMono,
              fontSize: 11,
              color: status === 'disrupted' ? palette.primary : palette.textMuted,
              transition: 'all 0.2s ease',
            }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: status === 'disrupted' ? palette.primary : status === 'frozen' ? palette.warning : '#2E7D32',
                display: 'inline-block',
                boxShadow: `0 0 0 2px ${status === 'disrupted' ? 'rgba(230, 107, 69, 0.25)' : '#C8E6C9'}`,
              }} />
              <span>
                {status === 'disrupted'
                  ? 'DISRUPTION DETECTED • CP-SAT RESOLVING'
                  : status === 'frozen'
                  ? 'EVENT FROZEN • INSPECTION MODE'
                  : `LIVE • GUKC GREATER NOIDA • ${eventMetrics.checkedIn.toLocaleString()} ATTENDEES`}
              </span>
            </div>
          )}

          {/* Complete Event Quick Pill */}
          <button
            onClick={openCompletionModal}
            title="Celebrate Event Completion"
            style={{
              display: isMobile ? 'none' : 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              background: '#F1F5E4',
              border: `1px solid #D6DFB5`,
              color: palette.successText,
              fontSize: 11,
              fontFamily: typography.fontMono,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Award size={13} />
            <span>FINALIZE EVENT</span>
          </button>

          {/* Quick Search */}
          <div style={{
            display: isMobile ? 'none' : 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 12px',
            borderRadius: 6,
            background: palette.bgMain,
            border: `1px solid ${palette.border}`,
            width: 180,
          }}>
            <Search size={14} color={palette.textMuted} />
            <input
              type="text"
              placeholder="Search session..."
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: palette.textMain,
                fontSize: 12,
                width: '100%',
                fontFamily: typography.fontBody,
              }}
            />
          </div>

          {/* Landing / Live Preview Quick Link */}
          <Link
            to="/"
            title="View Landing Showcase"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 12px',
              borderRadius: 6,
              background: 'transparent',
              border: `1px solid ${palette.border}`,
              color: palette.textMuted,
              fontSize: 12,
              fontFamily: typography.fontBody,
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = palette.primary;
              e.currentTarget.style.borderColor = palette.primary;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = palette.textMuted;
              e.currentTarget.style.borderColor = palette.border;
            }}
          >
            <Radio size={13} color={palette.primary} />
            <span>Showcase</span>
            <ArrowUpRight size={13} />
          </Link>

          {/* Notification Button */}
          <button
            onClick={() => setNotifOpen(true)}
            style={{
              position: 'relative',
              background: palette.bgMain,
              border: `1px solid ${palette.border}`,
              color: palette.textMain,
              cursor: 'pointer',
              padding: '8px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = palette.bgParchment}
            onMouseLeave={e => e.currentTarget.style.background = palette.bgMain}
          >
            <Bell size={17} />
            {notifCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: palette.primary,
                color: '#fff',
                fontSize: 9,
                fontWeight: 700,
                fontFamily: typography.fontMono,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {notifCount}
              </span>
            )}
          </button>

          {/* Organizer Avatar Stamp */}
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 6,
            background: palette.bgParchment,
            border: `1px solid ${palette.borderDark}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            fontFamily: typography.fontHeading,
            fontWeight: 700,
            fontSize: 13,
            color: palette.textMain,
          }}>
            PL
          </div>
        </header>

        {/* Page Content Body with Morphing Route Transition */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
          background: palette.bgMain,
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                padding: isMobile ? '20px 16px' : '32px 36px',
                minHeight: '100%',
                maxWidth: 1400,
                margin: '0 auto',
              }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Butterfly Effect System Cascade Overlay */}
      <ButterflyEffectOverlay />

      {/* Event Completion Celebration Modal */}
      <EventCompletionModal />

      {/* Notifications Drawer */}
      <NotificationPanel
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
    </div>
  );
}
