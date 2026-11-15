import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { EventStateProvider } from './context/EventStateContext';
import { palette, typography } from './lib/theme';
import './App.css';

// ── Lazy-Loaded Architectural Workspaces (Reduces Initial Bundle & Loading Time) ──
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PlanningCopilot = lazy(() => import('./pages/PlanningCopilot'));
const Schedule = lazy(() => import('./pages/Schedule'));
const RescueEngine = lazy(() => import('./pages/RescueEngine'));
const DigitalTwin = lazy(() => import('./pages/DigitalTwin'));
const AttendeeNavigator = lazy(() => import('./pages/AttendeeNavigator'));
const ResourceAllocation = lazy(() => import('./pages/ResourceAllocation'));
const Communications = lazy(() => import('./pages/Communications'));
const LiveOps = lazy(() => import('./pages/LiveOps'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));

function RouteLoadingFallback() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: palette.bgMain,
      color: palette.textMain,
      fontFamily: typography.fontBody,
      gap: 16,
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: palette.primary,
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: typography.fontHeading,
        fontWeight: 800,
        fontSize: 18,
        boxShadow: '0 4px 14px rgba(230, 107, 69, 0.3)',
      }}>
        PL
      </div>
      <div style={{
        fontFamily: typography.fontMono,
        fontSize: 11,
        color: palette.textMuted,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        INITIALIZING ARCHITECTURAL WORKSPACE...
      </div>
    </div>
  );
}

function App() {
  return (
    <EventStateProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/planning" element={<PlanningCopilot />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/rescue" element={<RescueEngine />} />
              <Route path="/digital-twin" element={<DigitalTwin />} />
              <Route path="/navigator" element={<AttendeeNavigator />} />
              <Route path="/resources" element={<ResourceAllocation />} />
              <Route path="/communications" element={<Communications />} />
              <Route path="/live-ops" element={<LiveOps />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </EventStateProvider>
  );
}

export default App;
