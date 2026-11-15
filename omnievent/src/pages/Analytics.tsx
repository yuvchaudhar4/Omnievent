import { useState, useMemo, useEffect, type FC } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Users,
  DoorOpen,
  Star,
  AlertTriangle,
  Download,
  Sparkles,
} from 'lucide-react';
import { AnimatedPage } from '../components/animated/AnimatedPage';
import { attendanceData } from '../lib/demo-data';
import { palette, typography } from '../lib/theme';
import { useEventState } from '../context/EventStateContext';

const MetricCounter: FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const end = value;
    const startTime = performance.now();
    const duration = 1000;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(end * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value]);

  return <span>{display.toLocaleString()}{suffix}</span>;
};

export default function Analytics() {
  const { eventMeta, sessions, rooms, eventMetrics } = useEventState();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [downloadReport, setDownloadReport] = useState(false);

  const roomUtilization = useMemo(() => {
    return rooms.map(r => ({
      name: r.name.length > 18 ? r.name.slice(0, 15) + '...' : r.name,
      fullName: r.name,
      utilization: r.capacity > 0 ? Math.min(100, Math.round((r.currentOccupancy / r.capacity) * 100)) : 0,
      occupancy: r.currentOccupancy,
      capacity: r.capacity,
    }));
  }, [rooms]);

  const sessionRatings = useMemo(() => {
    return sessions
      .filter(s => s.rating != null)
      .map(s => ({ name: s.title.length > 30 ? s.title.slice(0, 27) + '...' : s.title, rating: s.rating! }))
      .sort((a, b) => b.rating - a.rating);
  }, [sessions]);

  const eventStats = useMemo(() => ({
    totalAttendees: eventMetrics.totalAttendees,
    checkedInAttendees: eventMetrics.checkedIn,
    activeSessions: sessions.filter(s => s.status === 'live').length,
    totalSessions: sessions.length,
    roomsOccupied: rooms.filter(r => r.status === 'occupied').length,
    totalRooms: rooms.length,
    openIncidents: 1,
    totalIncidents: 3,
  }), [eventMetrics, sessions, rooms]);

  const filteredAttendance = useMemo(() => {
    if (timeRange === 'today') return attendanceData;
    if (timeRange === 'week') return attendanceData.filter((_, i) => i % 2 === 0);
    return attendanceData.filter((_, i) => i % 3 === 0);
  }, [timeRange]);

  const handleDownload = () => {
    setDownloadReport(true);
    try {
      const reportPayload = {
        title: `${eventMeta.name} - Executive Operations Ledger`,
        venue: eventMeta.venue,
        city: eventMeta.city,
        generatedAt: new Date().toISOString(),
        frameworks: ['EU GDPR Art. 5', 'India DPDP Act 2023', 'European Accessibility Act'],
        summary: {
          totalAttendance: eventMetrics.totalAttendees,
          checkedIn: eventMetrics.checkedIn,
          turnoutRate: `${Math.round((eventMetrics.checkedIn / eventMetrics.totalAttendees) * 100)}%`,
          activeSessions: sessions.filter(s => s.status === 'live').length,
          totalSessions: sessions.length,
          systemHealth: `${eventMetrics.systemHealth}%`,
          primaryOrganizer: eventMeta.primaryOrganizer,
        },
        roomUtilization,
        sessionRatings,
        cryptographicLedgerStatus: 'SHA-256 Hash Chain Verified',
      };

      const blob = new Blob([JSON.stringify(reportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pulse-event-ledger-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setDownloadReport(false), 3000);
  };

  return (
    <AnimatedPage>
      <div style={{ maxWidth: 1320, margin: '0 auto', fontFamily: typography.fontBody }}>
        {/* Editorial Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 24,
          borderBottom: `1px solid ${palette.border}`,
          paddingBottom: 20,
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 9px',
              borderRadius: 4,
              background: palette.bgParchment,
              border: `1px solid ${palette.borderDark}`,
              fontFamily: typography.fontMono,
              fontSize: 11,
              fontWeight: 700,
              color: palette.secondary,
              marginBottom: 8,
              letterSpacing: '0.04em',
            }}>
              <TrendingUp size={13} />
              EXECUTIVE POST-EVENT LEDGER & AUDIENCE ANALYTICS
            </div>
            <h1 style={{
              fontFamily: typography.fontHeading,
              fontSize: 28,
              fontWeight: 700,
              color: palette.textMain,
              letterSpacing: '-0.03em',
              margin: 0,
            }}>
              Operational Insights & Intelligence
            </h1>
            <p style={{ fontSize: 13, color: palette.textMuted, margin: '4px 0 0' }}>
              Real-time attendance flow, venue utilization, attendee feedback and budget variance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {/* Range Toggle */}
            <div style={{
              display: 'flex',
              background: palette.bgSecondary,
              borderRadius: 8,
              border: `1px solid ${palette.borderDark}`,
              padding: 2,
            }}>
              {(['today', 'week', 'month'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setTimeRange(tab)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: timeRange === tab ? palette.bgParchment : 'transparent',
                    color: timeRange === tab ? palette.textMain : palette.textMuted,
                    fontSize: 11,
                    fontFamily: typography.fontMono,
                    fontWeight: timeRange === tab ? 700 : 500,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {tab === 'today' ? 'Day 1' : tab === 'week' ? 'Full Summit' : 'All Events'}
                </button>
              ))}
            </div>

            <button
              onClick={handleDownload}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                background: palette.primary,
                border: 'none',
                color: '#FFFFFF',
                fontFamily: typography.fontBody,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(230, 107, 69, 0.25)',
              }}
            >
              <Download size={14} />
              <span>{downloadReport ? 'Generating PDF...' : 'Export Report'}</span>
            </button>
          </div>
        </div>

        {/* 4 Architectural KPI Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}>
          <div style={{ background: palette.bgSecondary, padding: 22, borderRadius: 10, border: `1px solid ${palette.border}`, boxShadow: palette.shadowSoft }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>TOTAL ARRIVALS</span>
              <Users size={16} color={palette.secondary} />
            </div>
            <div style={{ fontFamily: typography.fontMono, fontSize: 32, fontWeight: 700, color: palette.textMain }}>
              <MetricCounter value={eventStats.checkedInAttendees} />
            </div>
            <div style={{ fontSize: 12, color: palette.successText, marginTop: 4 }}>
              Peak arrival rate: 142/hr at 09:15
            </div>
          </div>

          <div style={{ background: palette.bgSecondary, padding: 22, borderRadius: 10, border: `1px solid ${palette.border}`, boxShadow: palette.shadowSoft }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>AVG AUDIENCE SATISFACTION</span>
              <Star size={16} color={palette.warningText} />
            </div>
            <div style={{ fontFamily: typography.fontMono, fontSize: 32, fontWeight: 700, color: palette.warningText }}>
              4.6 <span style={{ fontSize: 16, color: palette.textMuted, fontWeight: 400 }}>/ 5.0</span>
            </div>
            <div style={{ fontSize: 12, color: palette.textMuted, marginTop: 4 }}>
              Based on 482 micro-poll submissions
            </div>
          </div>

          <div style={{ background: palette.bgSecondary, padding: 22, borderRadius: 10, border: `1px solid ${palette.border}`, boxShadow: palette.shadowSoft }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>AVERAGE HALL OCCUPANCY</span>
              <DoorOpen size={16} color={palette.secondary} />
            </div>
            <div style={{ fontFamily: typography.fontMono, fontSize: 32, fontWeight: 700, color: palette.textMain }}>
              73.8%
            </div>
            <div style={{ fontSize: 12, color: palette.textMuted, marginTop: 4 }}>
              Optimal venue distribution
            </div>
          </div>

          <div style={{ background: palette.bgSecondary, padding: 22, borderRadius: 10, border: `1px solid ${palette.border}`, boxShadow: palette.shadowSoft }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>CRISIS RESOLUTION TIME</span>
              <AlertTriangle size={16} color={palette.primary} />
            </div>
            <div style={{ fontFamily: typography.fontMono, fontSize: 32, fontWeight: 700, color: palette.primary }}>
              3.4 sec
            </div>
            <div style={{ fontSize: 12, color: palette.textMuted, marginTop: 4 }}>
              Via CP-SAT constraint engine
            </div>
          </div>
        </div>

        {/* 2-Column Chart Workspace */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 24, marginBottom: 24 }}>
          {/* Chart 1: Attendance Flow Curve */}
          <div style={{
            background: palette.bgSecondary,
            borderRadius: 12,
            border: `1px solid ${palette.border}`,
            padding: 24,
            boxShadow: palette.shadowSoft,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: typography.fontHeading, fontSize: 16, fontWeight: 700, margin: 0 }}>
                  Live Crowd Flow & Capacity Ceiling
                </h3>
                <p style={{ fontSize: 12, color: palette.textMuted, margin: '2px 0 0' }}>
                  Actual headcount curve vs 1,200 venue safety capacity
                </p>
              </div>
              <span style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>
                TIME SERIES (CEST)
              </span>
            </div>

            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="editorialGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={palette.primary} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={palette.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFEAE0" vertical={false} />
                  <XAxis dataKey="time" stroke={palette.textMuted} fontSize={11} fontFamily={typography.fontMono} />
                  <YAxis stroke={palette.textMuted} fontSize={11} fontFamily={typography.fontMono} />
                  <Tooltip
                    contentStyle={{
                      background: palette.bgSecondary,
                      border: `1px solid ${palette.borderDark}`,
                      borderRadius: 8,
                      boxShadow: palette.shadowElevated,
                      fontFamily: typography.fontMono,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="attendees"
                    stroke={palette.primary}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#editorialGrad)"
                    name="In-Venue Attendance"
                  />
                  <Line
                    type="monotone"
                    dataKey="capacity"
                    stroke="#D4CDC0"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                    name="Venue Fire Capacity"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Room Utilization Bar Ledger */}
          <div style={{
            background: palette.bgSecondary,
            borderRadius: 12,
            border: `1px solid ${palette.border}`,
            padding: 24,
            boxShadow: palette.shadowSoft,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: typography.fontHeading, fontSize: 16, fontWeight: 700, margin: 0 }}>
                  Venue Utilization (% Cap)
                </h3>
                <p style={{ fontSize: 12, color: palette.textMuted, margin: '2px 0 0' }}>
                  Door turns vs nominal room capacity
                </p>
              </div>
              <span style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>
                BY VENUE
              </span>
            </div>

            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roomUtilization.slice(0, 6)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFEAE0" vertical={false} />
                  <XAxis dataKey="name" stroke={palette.textMuted} fontSize={10} fontFamily={typography.fontBody} />
                  <YAxis stroke={palette.textMuted} fontSize={11} fontFamily={typography.fontMono} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: palette.bgSecondary,
                      border: `1px solid ${palette.borderDark}`,
                      borderRadius: 8,
                      fontFamily: typography.fontMono,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="utilization" radius={[4, 4, 0, 0]} name="Capacity Util %">
                    {roomUtilization.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.utilization >= 85 ? palette.primary : entry.utilization >= 75 ? palette.warning : palette.secondary}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Split: Session Ratings & Post-Event Executive Takeaways */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24 }}>
          {/* Session Ratings */}
          <div style={{
            background: palette.bgSecondary,
            borderRadius: 12,
            border: `1px solid ${palette.border}`,
            padding: 24,
            boxShadow: palette.shadowSoft,
          }}>
            <h3 style={{ fontFamily: typography.fontHeading, fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>
              Highest Rated Content & Keynotes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sessionRatings.slice(0, 5).map((ses, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: palette.bgMain,
                    border: `1px solid ${palette.border}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: typography.fontMono, fontSize: 11, fontWeight: 700, color: palette.secondary }}>
                      #{i + 1}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: palette.textMain }}>
                      {ses.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: typography.fontMono, fontSize: 12, fontWeight: 700, color: palette.warningText }}>
                    <Star size={13} fill={palette.warning} color={palette.warning} />
                    <span>{ses.rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Executive Report Summary */}
          <div style={{
            background: palette.bgSecondary,
            borderRadius: 12,
            border: `1px solid ${palette.border}`,
            padding: 24,
            boxShadow: palette.shadowSoft,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <Sparkles size={16} color={palette.primary} />
              <h3 style={{ fontFamily: typography.fontHeading, fontSize: 16, fontWeight: 700, margin: 0 }}>
                Executive Post-Event Synthesis
              </h3>
            </div>

            <div style={{ fontSize: 13, color: palette.textMain, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ margin: 0 }}>
                <strong>Key Accomplishment:</strong> The Rescue Engine successfully mitigated 2 critical equipment disruptions in under 4 seconds each, preserving attendee satisfaction without speaker session cancellation.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Crowd Dynamics:</strong> Grand Hall A reached 85% peak occupancy during the morning keynote. Automatic crowd diversion through North Turnstiles prevented foyer congestion.
              </p>
              <div style={{
                padding: 12,
                borderRadius: 8,
                background: '#F1F5E4',
                border: '1px solid #D6DFB5',
                fontSize: 12,
                color: palette.successText,
                fontFamily: typography.fontMono,
              }}>
                RECOMMENDATION: Scale Workshop 1 capacity by 18% for Day 2 based on waitlist demand.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
