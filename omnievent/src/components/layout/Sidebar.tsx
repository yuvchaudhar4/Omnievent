import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Radio,
  ShieldAlert,
  Compass,
  Navigation,
  Boxes,
  MessageSquareShare,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Award,
} from 'lucide-react';
import { palette, typography } from '../../lib/theme';
import { useEventState } from '../../context/EventStateContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Command Centre', icon: LayoutDashboard, tag: 'LIVE' },
  { path: '/planning', label: 'Event Planner', icon: Calendar },
  { path: '/schedule', label: 'Timeline & Grid', icon: Radio },
  { path: '/rescue', label: 'Rescue Engine', icon: ShieldAlert, tag: 'CRITICAL' },
  { path: '/digital-twin', label: 'Digital Twin', icon: Compass },
  { path: '/navigator', label: 'Attendee Navigator', icon: Navigation },
  { path: '/resources', label: 'Resource Allocation', icon: Boxes },
  { path: '/communications', label: 'Communications', icon: MessageSquareShare },
  { path: '/analytics', label: 'Analytics & Report', icon: BarChart2 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

export default function Sidebar({ isCollapsed, onToggle, isMobile }: SidebarProps) {
  const location = useLocation();
  const { playIntro, openCompletionModal, status } = useEventState();
  const expandedWidth = 260;
  const collapsedWidth = 76;

  const sidebarContent = (
    <motion.nav
      animate={{ width: isMobile ? expandedWidth : (isCollapsed ? collapsedWidth : expandedWidth) }}
      transition={{ type: 'spring', stiffness: 350, damping: 32 }}
      style={{
        height: '100vh',
        background: palette.bgSecondary,
        borderRight: `1px solid ${palette.border}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: isMobile ? 'relative' : undefined,
        zIndex: isMobile ? 51 : undefined,
        boxShadow: palette.shadowSoft,
      }}
    >
      {/* Editorial Logo Header */}
      <div style={{
        padding: isCollapsed && !isMobile ? '20px 16px' : '22px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: `1px solid ${palette.border}`,
        minHeight: 70,
        background: palette.bgSecondary,
      }}>
        {/* Architectural Monogram Icon */}
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: palette.primary,
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: typography.fontHeading,
          fontWeight: 800,
          fontSize: 16,
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(230, 107, 69, 0.25)',
          letterSpacing: '-0.04em',
        }}>
          PL
        </div>

        <AnimatePresence>
          {(!isCollapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}
            >
              <div style={{
                fontFamily: typography.fontHeading,
                fontSize: 17,
                fontWeight: 800,
                color: palette.textMain,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}>
                PULSE
              </div>
              <div style={{
                fontFamily: typography.fontMono,
                fontSize: 9,
                color: palette.textMuted,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: 2,
              }}>
                Event Operating System
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isMobile && (
          <button
            onClick={onToggle}
            style={{
              background: 'none',
              border: 'none',
              color: palette.textMuted,
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Items with Liquid Gliding Indicator */}
      <div style={{
        flex: 1,
        padding: '14px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path
            || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => { if (isMobile) onToggle(); }}
              style={{
                textDecoration: 'none',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: isCollapsed && !isMobile ? '10px 0' : '10px 14px',
                justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
                borderRadius: 8,
                color: isActive ? palette.primary : palette.textMain,
                transition: 'color 0.18s ease-out',
                cursor: 'pointer',
              }}
            >
              {/* Liquid Gliding Active Pill */}
              {isActive && (
                <motion.div
                  layoutId="sidebarActivePill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 8,
                    background: palette.bgParchmentLight,
                    border: `1px solid ${palette.borderDark}`,
                    boxShadow: palette.shadowSoft,
                    zIndex: 0,
                  }}
                />
              )}

              <item.icon
                size={18}
                strokeWidth={isActive ? 2.2 : 1.8}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  flexShrink: 0,
                  color: isActive ? palette.primary : palette.textMuted,
                }}
              />

              <AnimatePresence>
                {(!isCollapsed || isMobile) && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flex: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <span style={{
                      fontFamily: typography.fontBody,
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      whiteSpace: 'nowrap',
                      color: isActive ? palette.textMain : palette.textMain,
                    }}>
                      {item.label}
                    </span>

                    {item.tag && (
                      <span style={{
                        fontFamily: typography.fontMono,
                        fontSize: 9,
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: item.tag === 'CRITICAL' ? (status === 'disrupted' ? '#FDEAE9' : palette.bgMain) : '#EAF2EC',
                        color: item.tag === 'CRITICAL' ? palette.danger : palette.successText,
                        border: `1px solid ${item.tag === 'CRITICAL' ? '#F7C6C4' : '#D0E4D5'}`,
                        marginLeft: 6,
                        letterSpacing: '0.04em',
                      }}>
                        {item.tag}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </div>

      {/* Interactive Quick Animation Controls */}
      <div style={{
        padding: '12px',
        borderTop: `1px solid ${palette.border}`,
        background: palette.bgSecondary,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        {(!isCollapsed || isMobile) && (
          <>
            <button
              onClick={playIntro}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 6,
                background: palette.bgMain,
                border: `1px solid ${palette.border}`,
                color: palette.secondary,
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: typography.fontMono,
                fontWeight: 600,
              }}
            >
              <Play size={12} fill={palette.secondary} />
              <span>REPLAY VENUE INTRO</span>
            </button>

            <button
              onClick={openCompletionModal}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 6,
                background: '#FDF5F2',
                border: '1px solid #F4C4B5',
                color: palette.primary,
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: typography.fontMono,
                fontWeight: 600,
              }}
            >
              <Award size={12} />
              <span>EVENT COMPLETION</span>
            </button>
          </>
        )}

        {!isMobile && (
          <button
            onClick={onToggle}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 6,
              background: 'transparent',
              border: `1px solid ${palette.border}`,
              color: palette.textMuted,
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: typography.fontBody,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = palette.bgMain;
              e.currentTarget.style.color = palette.textMain;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = palette.textMuted;
            }}
          >
            {isCollapsed ? <ChevronRight size={16} /> : (
              <>
                <ChevronLeft size={16} />
                <span>Collapse Rail</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.nav>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {!isCollapsed && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(37, 45, 53, 0.4)',
                backdropFilter: 'blur(3px)',
                zIndex: 50,
              }}
            />
            <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 51 }}>
              {sidebarContent}
            </div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return sidebarContent;
}
