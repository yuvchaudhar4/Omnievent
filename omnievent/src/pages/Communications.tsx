import { useState, useMemo } from 'react';
import {
  MessageSquareShare,
  Send,
  Users,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { AnimatedPage } from '../components/animated/AnimatedPage';
import { palette, typography } from '../lib/theme';
import { useEventState, type CommunicationMessage } from '../context/EventStateContext';

const TEMPLATES = [
  {
    name: 'Session Relocation',
    audience: 'session' as CommunicationMessage['audience'],
    title: 'Relocation Notice: Session Moved to Alternative Wing',
    content: 'IMPORTANT NOTICE: Due to scheduled network maintenance, your session has been reassigned to Block A Multimedia Seminar Hall. Your in-app navigator and personal agenda have updated automatically.',
  },
  {
    name: 'Schedule Delay',
    audience: 'all' as CommunicationMessage['audience'],
    title: 'Advisory: Keynote Starting +15 Minutes Later',
    content: 'Please note that the morning session in GUKC Central Auditorium will commence at 09:15 AM. High-tea refreshments remain available at the Scholarly Networking Atrium.',
  },
  {
    name: 'Doors Open Announcement',
    audience: 'all' as CommunicationMessage['audience'],
    title: 'Doors Now Open for AI & Data Science Conclave',
    content: 'Doors are open in Dr. APJ Abdul Kalam Central Reading Hall. Priority seating available for registered scholars and faculty in Rows A–D.',
  },
  {
    name: 'Speaker Green Room Briefing',
    audience: 'speakers' as CommunicationMessage['audience'],
    title: 'Faculty & Speaker Executive Lounge Active',
    content: 'All keynote speakers and session chairs are requested to conduct A/V clicker and microphone sound checks in Level 3 Executive Suite prior to session start.',
  },
];

export default function Communications() {
  const {
    messages,
    addMessage,
    approveAndDispatchMessage,
    deleteMessage,
    sessions,
  } = useEventState();

  const [activeMessageId, setActiveMessageId] = useState<string>(messages[0]?.id || '');
  const [filterAudience, setFilterAudience] = useState<string>('all');
  const [isDraftingNew, setIsDraftingNew] = useState(false);

  // New Draft Form state
  const [draftForm, setDraftForm] = useState({
    audience: 'all' as CommunicationMessage['audience'],
    sessionId: sessions[0]?.id || '',
    title: '',
    content: '',
    channel: 'push' as CommunicationMessage['channel'],
  });

  const selectedMessage = useMemo(() => {
    return messages.find(m => m.id === activeMessageId) || messages[0] || null;
  }, [messages, activeMessageId]);

  const filteredMessages = useMemo(() => {
    if (filterAudience === 'all') return messages;
    return messages.filter(m => m.audience === filterAudience);
  }, [messages, filterAudience]);

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setDraftForm(prev => ({
      ...prev,
      audience: tpl.audience,
      title: tpl.title,
      content: tpl.content,
    }));
  };

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSession = sessions.find(s => s.id === draftForm.sessionId);
    const recipients = draftForm.audience === 'all'
      ? 1250
      : draftForm.audience === 'speakers'
      ? 14
      : draftForm.audience === 'organizers'
      ? 35
      : targetSession?.attendeeCount || 423;

    addMessage({
      audience: draftForm.audience,
      title: draftForm.title,
      content: draftForm.content,
      channel: draftForm.channel,
      status: 'draft',
      recipientsCount: recipients,
      targetSessionTitle: targetSession?.title,
    });

    setIsDraftingNew(false);
    setDraftForm({
      audience: 'all',
      sessionId: sessions[0]?.id || '',
      title: '',
      content: '',
      channel: 'push',
    });
  };

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
              <MessageSquareShare size={13} />
              COMMUNICATIONS & TARGETED AUDIENCE DISPATCH
            </div>
            <h1 style={{
              fontFamily: typography.fontHeading,
              fontSize: 28,
              fontWeight: 700,
              color: palette.textMain,
              letterSpacing: '-0.03em',
              margin: 0,
            }}>
              Audience Dispatch Studio
            </h1>
            <p style={{ fontSize: 13, color: palette.textMuted, margin: '4px 0 0' }}>
              Segmented notifications, incident auto-drafts, and multi-channel broadcast gateway.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              padding: '4px 10px',
              borderRadius: 4,
              background: '#F1F5E4',
              color: palette.successText,
              fontFamily: typography.fontMono,
              fontSize: 11,
              fontWeight: 700,
            }}>
              SIMULATED DEMO GATEWAY ACTIVE
            </span>

            <button
              onClick={() => setIsDraftingNew(!isDraftingNew)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                borderRadius: 6,
                background: palette.primary,
                color: '#FFFFFF',
                border: 'none',
                fontFamily: typography.fontBody,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(230, 107, 69, 0.25)',
              }}
            >
              <Plus size={15} />
              {isDraftingNew ? 'Close Composer' : 'Draft Announcement'}
            </button>
          </div>
        </div>

        {/* New Draft Composer Accordion */}
        {isDraftingNew && (
          <div style={{
            background: palette.bgSecondary,
            borderRadius: 12,
            border: `1.5px solid ${palette.primary}`,
            padding: 24,
            marginBottom: 24,
            boxShadow: palette.shadowSoft,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} color={palette.primary} />
                <h3 style={{ fontFamily: typography.fontHeading, fontSize: 18, fontWeight: 700, margin: 0 }}>
                  Compose Segmented Announcement
                </h3>
              </div>

              {/* Template Quick Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>TEMPLATES:</span>
                {TEMPLATES.map(tpl => (
                  <button
                    key={tpl.name}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: `1px solid ${palette.borderDark}`,
                      background: palette.bgMain,
                      fontSize: 11,
                      fontFamily: typography.fontMono,
                      color: palette.textMain,
                      cursor: 'pointer',
                    }}
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateDraft} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Target Audience</label>
                  <select
                    value={draftForm.audience}
                    onChange={e => setDraftForm({ ...draftForm, audience: e.target.value as CommunicationMessage['audience'] })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                  >
                    <option value="all">All Attendees (1,250)</option>
                    <option value="session">Specific Session Attendees</option>
                    <option value="speakers">All Speakers & Panelists (14)</option>
                    <option value="organizers">Staff & Volunteer Marshals (35)</option>
                    <option value="incident_affected">Disruption Affected Cohort</option>
                  </select>
                </div>

                {draftForm.audience === 'session' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Session Scope</label>
                    <select
                      value={draftForm.sessionId}
                      onChange={e => setDraftForm({ ...draftForm, sessionId: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                    >
                      {sessions.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.title} ({s.attendeeCount || 0} attendees)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Delivery Channel</label>
                  <select
                    value={draftForm.channel}
                    onChange={e => setDraftForm({ ...draftForm, channel: e.target.value as CommunicationMessage['channel'] })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                  >
                    <option value="push">Mobile Push Notification</option>
                    <option value="whatsapp">WhatsApp Business API</option>
                    <option value="sms">Telecom SMS Shortcode</option>
                    <option value="email">Emergency Email Broadcast</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Headline / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Update: Room Relocation"
                  value={draftForm.title}
                  onChange={e => setDraftForm({ ...draftForm, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: palette.textMain }}>Message Body</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Type clear instructions for attendees, including room numbers and time shifts..."
                  value={draftForm.content}
                  onChange={e => setDraftForm({ ...draftForm, content: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: palette.bgMain, fontSize: 13, fontFamily: typography.fontBody, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsDraftingNew(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${palette.borderDark}`, background: 'transparent', cursor: 'pointer', fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: 6, border: 'none', background: palette.primary, color: '#FFFFFF', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                >
                  Save to Dispatch Queue
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2-Column Dispatch Workspace */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)', gap: 24 }}>
          {/* Left Column: Messages Queue & History */}
          <div>
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[
                { id: 'all', label: `All Dispatches (${messages.length})` },
                { id: 'session', label: 'Session Specific' },
                { id: 'speakers', label: 'Speakers' },
                { id: 'incident_affected', label: 'Rescue Auto-Drafts' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterAudience(f.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontFamily: typography.fontMono,
                    fontWeight: filterAudience === f.id ? 700 : 500,
                    cursor: 'pointer',
                    background: filterAudience === f.id ? palette.bgParchment : palette.bgSecondary,
                    border: `1px solid ${filterAudience === f.id ? palette.borderDark : palette.border}`,
                    color: filterAudience === f.id ? palette.textMain : palette.textMuted,
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Messages List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredMessages.map(msg => {
                const isSelected = selectedMessage?.id === msg.id;
                const isDraft = msg.status === 'draft';

                return (
                  <div
                    key={msg.id}
                    onClick={() => setActiveMessageId(msg.id)}
                    style={{
                      background: palette.bgSecondary,
                      borderRadius: 10,
                      padding: '16px 20px',
                      border: `1.5px solid ${isSelected ? palette.primary : palette.border}`,
                      boxShadow: isSelected ? palette.shadowElevated : palette.shadowSoft,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontFamily: typography.fontMono,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 4,
                          background: isDraft ? '#FDF6E2' : '#F1F5E4',
                          color: isDraft ? palette.warningText : palette.successText,
                          border: `1px solid ${isDraft ? palette.warning : '#D6DFB5'}`,
                          textTransform: 'uppercase',
                        }}>
                          {msg.status}
                        </span>

                        {msg.isAutoDraft && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 10,
                            fontFamily: typography.fontMono,
                            color: palette.primary,
                            background: '#FDF5F2',
                            padding: '2px 6px',
                            borderRadius: 4,
                            border: '1px solid #F4C4B5',
                          }}>
                            <ShieldCheck size={11} />
                            RESCUE AUTODRAFT
                          </span>
                        )}

                        <span style={{ fontFamily: typography.fontMono, fontSize: 11, color: palette.textMuted }}>
                          {msg.timestamp}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMessage(msg.id);
                          }}
                          title="Delete message"
                          style={{ background: 'transparent', border: 'none', color: palette.textMuted, cursor: 'pointer', padding: 4 }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h4 style={{
                      fontFamily: typography.fontHeading,
                      fontSize: 15,
                      fontWeight: 700,
                      color: palette.textMain,
                      margin: '0 0 6px',
                    }}>
                      {msg.title}
                    </h4>

                    <p style={{
                      fontSize: 12,
                      color: palette.textMuted,
                      lineHeight: 1.45,
                      margin: '0 0 12px',
                    }}>
                      {msg.content}
                    </p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 10,
                      borderTop: `1px solid ${palette.border}`,
                      fontSize: 11,
                      fontFamily: typography.fontMono,
                      color: palette.textMuted,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={12} color={palette.secondary} />
                        <span>REACH: <strong style={{ color: palette.textMain }}>{msg.recipientsCount} recipients</strong></span>
                        <span>• CHANNEL: {msg.channel.toUpperCase()}</span>
                      </div>

                      {isDraft && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            approveAndDispatchMessage(msg.id);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            background: palette.primary,
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '4px 10px',
                            borderRadius: 4,
                            fontFamily: typography.fontBody,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Send size={11} />
                          Approve & Broadcast
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Realistic Device Preview */}
          <div>
            <div style={{
              background: palette.bgSecondary,
              borderRadius: 12,
              border: `1px solid ${palette.border}`,
              padding: 24,
              boxShadow: palette.shadowSoft,
              position: 'sticky',
              top: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontFamily: typography.fontHeading, fontSize: 16, fontWeight: 700, margin: 0 }}>
                    Attendee Lock Screen Simulator
                  </h3>
                  <div style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>
                    SIMULATED END-USER PERSPECTIVE
                  </div>
                </div>
                <span style={{
                  fontFamily: typography.fontMono,
                  fontSize: 10,
                  color: palette.secondary,
                  background: palette.bgParchment,
                  padding: '3px 8px',
                  borderRadius: 4,
                  border: `1px solid ${palette.borderDark}`,
                }}>
                  DEMO CHANNEL
                </span>
              </div>

              {/* Smartphone Frame */}
              <div style={{
                maxWidth: 320,
                margin: '0 auto',
                background: '#FFFFFF',
                borderRadius: 28,
                border: '8px solid #252D35',
                padding: '24px 16px',
                boxShadow: palette.shadowFloat,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  paddingBottom: 12,
                  borderBottom: '1px solid #E9E4DA',
                  marginBottom: 16,
                }}>
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: palette.primary,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    P
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: palette.textMain }}>PULSE Event Concierge</div>
                    <div style={{ fontSize: 9, color: palette.textMuted }}>Official Verified Broadcast Line</div>
                  </div>
                </div>

                {/* Simulated Incoming Message Bubble */}
                {selectedMessage ? (
                  <div style={{
                    padding: 14,
                    borderRadius: 12,
                    background: '#F7F4EC',
                    border: '1px solid #E9E4DA',
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: palette.textMain,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: palette.primary, marginBottom: 4, textTransform: 'uppercase' }}>
                      {selectedMessage.title}
                    </div>
                    {selectedMessage.content}
                    <div style={{
                      fontSize: 9,
                      color: palette.textMuted,
                      textAlign: 'right',
                      marginTop: 8,
                      fontFamily: typography.fontMono,
                    }}>
                      {selectedMessage.timestamp} • {selectedMessage.status === 'dispatched' ? 'DELIVERED (SIMULATED)' : 'QUEUED DRAFT'}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 20, color: palette.textMuted, fontSize: 12 }}>
                    No message selected
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
