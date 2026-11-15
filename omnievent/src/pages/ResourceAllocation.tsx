import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Boxes,
  CheckCircle2,
  Sparkles,
  Plus,
  X,
  MapPin,
} from 'lucide-react';
import { AnimatedPage } from '../components/animated/AnimatedPage';
import { palette, typography } from '../lib/theme';
import { useEventState, type ResourceItem } from '../context/EventStateContext';

export default function ResourceAllocation() {
  const {
    resources,
    addResource,
    updateResource,
    rebalanceResources,
    rooms,
  } = useEventState();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [rebalancedFeedback, setRebalancedFeedback] = useState(false);

  // Form State
  const [newResourceForm, setNewResourceForm] = useState({
    name: '',
    category: 'equipment' as ResourceItem['category'],
    allocated: 5,
    forecastNeeded: 5,
    location: rooms[0]?.name || 'GUKC Central Auditorium',
    assignedRoomId: rooms[0]?.id || 'r1',
    costPerUnit: 50,
  });

  const handleSmartRebalance = () => {
    rebalanceResources();
    setRebalancedFeedback(true);
    setTimeout(() => setRebalancedFeedback(false), 3500);
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedRoom = rooms.find(r => r.id === newResourceForm.assignedRoomId);
    const diff = newResourceForm.allocated - newResourceForm.forecastNeeded;
    const status: ResourceItem['status'] = diff < 0 ? 'shortage' : diff > 0 ? 'surplus' : 'optimal';

    addResource({
      name: newResourceForm.name,
      category: newResourceForm.category,
      allocated: Number(newResourceForm.allocated),
      forecastNeeded: Number(newResourceForm.forecastNeeded),
      location: assignedRoom ? assignedRoom.name : newResourceForm.location,
      assignedRoomId: newResourceForm.assignedRoomId,
      status,
      costPerUnit: Number(newResourceForm.costPerUnit),
    });

    setIsAddModalOpen(false);
    setNewResourceForm({
      name: '',
      category: 'equipment',
      allocated: 5,
      forecastNeeded: 5,
      location: rooms[0]?.name || 'GUKC Central Auditorium',
      assignedRoomId: rooms[0]?.id || 'r1',
      costPerUnit: 50,
    });
  };

  const handleAdjustAllocated = (id: string, current: number, delta: number) => {
    const updatedAllocated = Math.max(0, current + delta);
    const item = resources.find(r => r.id === id);
    if (!item) return;
    const diff = updatedAllocated - item.forecastNeeded;
    const status: ResourceItem['status'] = diff < 0 ? 'shortage' : diff > 0 ? 'surplus' : 'optimal';
    updateResource(id, { allocated: updatedAllocated, status });
  };

  // Metrics
  const totalAllocatedItems = resources.reduce((sum, r) => sum + r.allocated, 0);
  const totalForecastItems = resources.reduce((sum, r) => sum + r.forecastNeeded, 0);
  const shortageCount = resources.filter(r => r.status === 'shortage').length;
  const surplusCount = resources.filter(r => r.status === 'surplus').length;

  return (
    <AnimatedPage>
      <div style={{ maxWidth: 1360, margin: '0 auto', fontFamily: typography.fontBody, paddingBottom: 60 }}>
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
              <Boxes size={13} />
              FORECAST-DRIVEN RESOURCE ALLOCATION & ESG OPTIMIZER
            </div>
            <h1 style={{
              fontFamily: typography.fontHeading,
              fontSize: 28,
              fontWeight: 700,
              color: palette.textMain,
              letterSpacing: '-0.03em',
              margin: 0,
            }}>
              Resource Distribution & Logistics
            </h1>
            <p style={{ fontSize: 13, color: palette.textMuted, margin: '4px 0 0' }}>
              Dynamic staffing, A/V hardware asset tracking, and demand-synchronized catering balance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                borderRadius: 6,
                background: palette.bgSecondary,
                border: `1px solid ${palette.borderDark}`,
                color: palette.textMain,
                fontFamily: typography.fontBody,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
              Add Resource Asset
            </button>

            {!rebalancedFeedback ? (
              <button
                onClick={handleSmartRebalance}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  borderRadius: 6,
                  background: palette.primary,
                  border: 'none',
                  color: '#FFFFFF',
                  fontFamily: typography.fontBody,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(230, 107, 69, 0.25)',
                }}
              >
                <Sparkles size={15} />
                <span>Execute AI Rebalancing Nudge</span>
              </button>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 6,
                background: '#F1F5E4',
                border: '1px solid #D6DFB5',
                color: palette.successText,
                fontFamily: typography.fontMono,
                fontSize: 12,
                fontWeight: 700,
              }}>
                <CheckCircle2 size={14} /> ALL ASSETS REBALANCED
              </div>
            )}
          </div>
        </div>

        {/* 3 Overview Stat Ledgers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}>
          <div style={{ background: palette.bgSecondary, padding: 22, borderRadius: 10, border: `1px solid ${palette.border}`, boxShadow: palette.shadowSoft }}>
            <div style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted, marginBottom: 8 }}>
              ACTIVE INVENTORY ASSETS
            </div>
            <div style={{ fontFamily: typography.fontMono, fontSize: 30, fontWeight: 700, color: palette.textMain, lineHeight: 1.1 }}>
              {resources.length} Tracked
            </div>
            <div style={{ fontSize: 12, color: palette.textMuted, marginTop: 6 }}>
              {totalAllocatedItems} units deployed ({totalForecastItems} forecast demand)
            </div>
          </div>

          <div style={{ background: palette.bgSecondary, padding: 22, borderRadius: 10, border: `1px solid ${palette.border}`, boxShadow: palette.shadowSoft }}>
            <div style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted, marginBottom: 8 }}>
              ALLOCATION DISCREPANCIES
            </div>
            <div style={{ fontFamily: typography.fontMono, fontSize: 30, fontWeight: 700, color: shortageCount > 0 ? palette.danger : palette.successText, lineHeight: 1.1 }}>
              {shortageCount} Shortages • {surplusCount} Surplus
            </div>
            <div style={{ fontSize: 12, color: palette.textMuted, marginTop: 6 }}>
              {shortageCount === 0 ? 'All zones optimal' : 'Nudge recommended to rebalance'}
            </div>
          </div>

          <div style={{ background: palette.bgSecondary, padding: 22, borderRadius: 10, border: `1px solid ${palette.border}`, boxShadow: palette.shadowSoft }}>
            <div style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted, marginBottom: 8 }}>
              VOLUNTEER RATIO EFFICIENCY
            </div>
            <div style={{ fontFamily: typography.fontMono, fontSize: 30, fontWeight: 700, color: palette.secondary, lineHeight: 1.1 }}>
              1 : 42 Attendees
            </div>
            <div style={{ fontSize: 12, color: palette.textMuted, marginTop: 6 }}>
              Industry benchmark: 1 : 40 (Optimal operating zone)
            </div>
          </div>
        </div>

        {/* Active Resource Matrix */}
        <div style={{
          background: palette.bgSecondary,
          borderRadius: 12,
          border: `1px solid ${palette.border}`,
          boxShadow: palette.shadowSoft,
          padding: 24,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            paddingBottom: 14,
            borderBottom: `1px solid ${palette.border}`,
          }}>
            <div>
              <h3 style={{
                fontFamily: typography.fontHeading,
                fontSize: 16,
                fontWeight: 700,
                color: palette.textMain,
                margin: 0,
              }}>
                Live Allocation Telemetry
              </h3>
              <p style={{ fontSize: 12, color: palette.textMuted, margin: '2px 0 0' }}>
                Adjust station deployment or execute algorithmic rebalancing to match ML demand.
              </p>
            </div>
            <span style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>
              PERSISTENT LEDGER • SYNCHRONIZED
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {resources.map((item) => {
              const diff = item.allocated - item.forecastNeeded;
              const isShortage = diff < 0;
              const isSurplus = diff > 0;

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: 8,
                    background: palette.bgMain,
                    border: `1px solid ${palette.border}`,
                    gap: 16,
                  }}
                >
                  <div style={{ minWidth: 220 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontFamily: typography.fontMono,
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: palette.bgParchment,
                        color: palette.textMain,
                        textTransform: 'uppercase',
                        border: `1px solid ${palette.borderDark}`,
                      }}>
                        {item.category}
                      </span>
                      <h4 style={{
                        fontFamily: typography.fontHeading,
                        fontSize: 14,
                        fontWeight: 700,
                        color: palette.textMain,
                        margin: 0,
                      }}>
                        {item.name}
                      </h4>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: palette.textMuted, marginTop: 4 }}>
                      <MapPin size={12} color={palette.secondary} />
                      <span>{item.location}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                    {/* Manual count adjustments */}
                    <div>
                      <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>DEPLOYED</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => handleAdjustAllocated(item.id, item.allocated, -1)}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 4,
                            border: `1px solid ${palette.borderDark}`,
                            background: palette.bgSecondary,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          -
                        </button>
                        <div style={{ fontFamily: typography.fontMono, fontSize: 15, fontWeight: 700, color: palette.textMain, minWidth: 40, textAlign: 'center' }}>
                          {item.allocated}
                        </div>
                        <button
                          onClick={() => handleAdjustAllocated(item.id, item.allocated, 1)}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 4,
                            border: `1px solid ${palette.borderDark}`,
                            background: palette.bgSecondary,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>FORECAST NEED</div>
                      <div style={{ fontFamily: typography.fontMono, fontSize: 15, fontWeight: 700, color: palette.secondary }}>
                        {item.forecastNeeded} units
                      </div>
                    </div>

                    <div style={{ minWidth: 100 }}>
                      <span style={{
                        fontFamily: typography.fontMono,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 4,
                        background: isShortage ? '#FDEAE9' : isSurplus ? '#FDF6E2' : '#F1F5E4',
                        color: isShortage ? palette.danger : isSurplus ? palette.warningText : palette.successText,
                        border: `1px solid ${isShortage ? '#F7C6C4' : isSurplus ? palette.warning : '#D6DFB5'}`,
                        display: 'inline-block',
                      }}>
                        {isShortage ? `-${Math.abs(diff)} SHORT` : isSurplus ? `+${diff} SURPLUS` : 'BALANCED'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal: Add Resource Asset */}
        <AnimatePresence>
          {isAddModalOpen && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(37, 45, 53, 0.45)',
              backdropFilter: 'blur(3px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  background: palette.bgSecondary,
                  borderRadius: 12,
                  border: `1px solid ${palette.border}`,
                  padding: 28,
                  width: '100%',
                  maxWidth: 500,
                  boxShadow: palette.shadowElevated,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ fontFamily: typography.fontHeading, fontSize: 20, fontWeight: 700, margin: 0 }}>
                    Add Resource Asset
                  </h2>
                  <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: palette.textMuted }}>
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateResource} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Resource Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wireless Handheld Microphones"
                      value={newResourceForm.name}
                      onChange={e => setNewResourceForm({ ...newResourceForm, name: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Category</label>
                      <select
                        value={newResourceForm.category}
                        onChange={e => setNewResourceForm({ ...newResourceForm, category: e.target.value as ResourceItem['category'] })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                      >
                        <option value="equipment">A/V Equipment</option>
                        <option value="volunteer">Staff & Volunteers</option>
                        <option value="catering">Catering & Beverage</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Assigned Room</label>
                      <select
                        value={newResourceForm.assignedRoomId}
                        onChange={e => setNewResourceForm({ ...newResourceForm, assignedRoomId: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                      >
                        {rooms.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Deployed</label>
                      <input
                        type="number"
                        value={newResourceForm.allocated}
                        onChange={e => setNewResourceForm({ ...newResourceForm, allocated: Number(e.target.value) })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontMono, boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Forecast Need</label>
                      <input
                        type="number"
                        value={newResourceForm.forecastNeeded}
                        onChange={e => setNewResourceForm({ ...newResourceForm, forecastNeeded: Number(e.target.value) })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontMono, boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Unit Cost ($)</label>
                      <input
                        type="number"
                        value={newResourceForm.costPerUnit}
                        onChange={e => setNewResourceForm({ ...newResourceForm, costPerUnit: Number(e.target.value) })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontMono, boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: 'transparent', cursor: 'pointer', fontSize: 13 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: palette.primary, color: '#FFFFFF', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                    >
                      Save Resource
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedPage>
  );
}
