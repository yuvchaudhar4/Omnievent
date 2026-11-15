import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, AlertTriangle, CheckCircle, Info, Bell, Trash2,
  CheckCheck, ShieldAlert,
} from 'lucide-react';
import { palette, typography } from '../../lib/theme';

interface Notification {
  id: string;
  icon: 'alert' | 'success' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    icon: 'alert',
    title: 'Speaker Displacement Alert',
    message: 'Dr. Sarah Chen delayed in transit. Rescue Engine generated 3 room reallocation plans.',
    timestamp: '2 min ago',
    read: false,
  },
  {
    id: '2',
    icon: 'warning',
    title: 'Capacity Threshold (88%)',
    message: 'Grand Hall A is approaching fire code capacity limit. Overflow directed to Room B.',
    timestamp: '14 min ago',
    read: false,
  },
  {
    id: '3',
    icon: 'success',
    title: 'Recovery Plan Approved',
    message: 'Session "Real-time Pipelines" shifted to Workshop 2. Attendee agendas synced.',
    timestamp: '35 min ago',
    read: true,
  },
  {
    id: '4',
    icon: 'info',
    title: 'VIP Delegations Arrived',
    message: '18 keynote guests checked in at East Foyer. Escorted to Green Room.',
    timestamp: '1 hr ago',
    read: true,
  },
];

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(37, 45, 53, 0.25)',
              backdropFilter: 'blur(2px)',
              zIndex: 100,
            }}
          />

          {/* Editorial Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 400,
              maxWidth: '92vw',
              background: palette.bgSecondary,
              borderLeft: `1px solid ${palette.border}`,
              boxShadow: palette.shadowFloat,
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              fontFamily: typography.fontBody,
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${palette.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: palette.bgSecondary,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 style={{
                    fontFamily: typography.fontHeading,
                    fontSize: 16,
                    fontWeight: 700,
                    color: palette.textMain,
                    margin: 0,
                  }}>
                    Operational Alerts
                  </h2>
                  {unreadCount > 0 && (
                    <span style={{
                      fontFamily: typography.fontMono,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 10,
                      background: '#FDEAE9',
                      color: palette.danger,
                      border: '1px solid #F7C6C4',
                    }}>
                      {unreadCount} NEW
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: palette.textMuted, margin: '3px 0 0' }}>
                  Real-time system telemetry and incident signals
                </p>
              </div>

              <button
                onClick={onClose}
                style={{
                  background: palette.bgMain,
                  border: `1px solid ${palette.border}`,
                  color: palette.textMuted,
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div style={{
              padding: '10px 24px',
              background: palette.bgMain,
              borderBottom: `1px solid ${palette.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <button
                onClick={markAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: palette.secondary,
                  cursor: 'pointer',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontWeight: 600,
                }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>

              <button
                onClick={clearAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: palette.textMuted,
                  cursor: 'pointer',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Trash2 size={13} /> Clear
              </button>
            </div>

            {/* Notification Items List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              {notifications.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 20px',
                  color: palette.textMuted,
                }}>
                  <ShieldAlert size={32} style={{ margin: '0 auto 10px', color: palette.borderDark }} />
                  <p style={{ fontSize: 13, fontWeight: 500 }}>All operational channels clear</p>
                  <p style={{ fontSize: 11, marginTop: 4 }}>No active disruptions or alerts</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const getIconDetails = () => {
                    switch (n.icon) {
                      case 'alert':
                        return { Icon: AlertTriangle, bg: '#FDEAE9', color: palette.danger, border: '#F7C6C4' };
                      case 'warning':
                        return { Icon: Bell, bg: '#FDF6E2', color: palette.warningText, border: palette.warning };
                      case 'success':
                        return { Icon: CheckCircle, bg: '#F1F5E4', color: palette.successText, border: palette.success };
                      default:
                        return { Icon: Info, bg: '#EAEFFE', color: palette.secondary, border: '#C5D3FA' };
                    }
                  };
                  const iconInfo = getIconDetails();

                  return (
                    <div
                      key={n.id}
                      style={{
                        padding: 14,
                        borderRadius: 8,
                        background: n.read ? palette.bgSecondary : palette.bgMain,
                        border: `1px solid ${n.read ? palette.border : palette.borderDark}`,
                        position: 'relative',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{
                          width: 30,
                          height: 30,
                          borderRadius: 6,
                          background: iconInfo.bg,
                          border: `1px solid ${iconInfo.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          color: iconInfo.color,
                        }}>
                          <iconInfo.Icon size={15} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                            <h4 style={{
                              fontFamily: typography.fontHeading,
                              fontSize: 13,
                              fontWeight: 600,
                              color: palette.textMain,
                              margin: 0,
                            }}>
                              {n.title}
                            </h4>
                            <span style={{
                              fontFamily: typography.fontMono,
                              fontSize: 10,
                              color: palette.textMuted,
                            }}>
                              {n.timestamp}
                            </span>
                          </div>
                          <p style={{
                            fontSize: 12,
                            color: palette.textMuted,
                            lineHeight: 1.45,
                            margin: 0,
                          }}>
                            {n.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Telemetry Footer */}
            <div style={{
              padding: '12px 24px',
              borderTop: `1px solid ${palette.border}`,
              background: palette.bgMain,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: typography.fontMono,
              fontSize: 11,
              color: palette.textMuted,
            }}>
              <span>SYNC: WEBSOCKET SECURE</span>
              <span style={{ color: palette.secondary }}>LATENCY: 18ms</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
