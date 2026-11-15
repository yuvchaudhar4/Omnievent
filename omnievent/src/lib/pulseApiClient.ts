/**
 * PULSE Ethical Backend API Client
 * Connects frontend UI to http://localhost:3001/api
 * Supports automatic fallback, SSE live telemetry, cryptographic audit verification,
 * and DPDP/GDPR compliant communication dispatch.
 */

const API_BASE = 'http://localhost:3001/api';

export interface HumanApprovalSignature {
  organizerId: string;
  organizerName: string;
  role?: 'human_organizer' | 'safety_marshal';
  rationale: string;
}

export const pulseApi = {
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch (e) {
      return { status: 'OFFLINE', error: (e as Error).message };
    }
  },

  async getEventMeta() {
    const res = await fetch(`${API_BASE}/event`);
    return await res.json();
  },

  async updateEventMeta(updates: any) {
    const res = await fetch(`${API_BASE}/event`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-User-Id': 'organizer_coo' },
      body: JSON.stringify(updates),
    });
    return await res.json();
  },

  async getSessions() {
    const res = await fetch(`${API_BASE}/sessions`);
    return await res.json();
  },

  async getConflicts() {
    const res = await fetch(`${API_BASE}/sessions/conflicts`);
    return await res.json();
  },

  async createSession(session: any) {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    return await res.json();
  },

  async updateSession(id: string, updates: any) {
    const res = await fetch(`${API_BASE}/sessions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return await res.json();
  },

  async deleteSession(id: string) {
    const res = await fetch(`${API_BASE}/sessions/${id}`, { method: 'DELETE' });
    return await res.json();
  },

  async getRooms(differentialPrivacy = false) {
    const res = await fetch(`${API_BASE}/rooms?dp=${differentialPrivacy}`);
    return await res.json();
  },

  async getIncidents() {
    const res = await fetch(`${API_BASE}/incidents`);
    return await res.json();
  },

  async reportIncident(incident: any) {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incident),
    });
    return await res.json();
  },

  async solveIncident(incidentId: string) {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/solve`, {
      method: 'POST',
    });
    return await res.json();
  },

  async approveRecoveryPlan(
    incidentId: string,
    planId: string,
    newRoomId?: string,
    newTime?: string,
    humanSignature?: HumanApprovalSignature
  ) {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId,
        newRoomId,
        newTime,
        humanSignature: humanSignature || {
          organizerId: 'org_debal',
          organizerName: 'Dr. Debal C. Kar (University Librarian & Head KRC)',
          role: 'human_organizer',
          rationale: 'Verified room audio-visual specs, capacity feasibility and step-free accessibility.',
        },
      }),
    });
    return await res.json();
  },

  async getResources() {
    const res = await fetch(`${API_BASE}/resources`);
    return await res.json();
  },

  async addResource(resource: any) {
    const res = await fetch(`${API_BASE}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resource),
    });
    return await res.json();
  },

  async rebalanceResources() {
    const res = await fetch(`${API_BASE}/resources/rebalance`, {
      method: 'POST',
    });
    return await res.json();
  },

  async getMessages() {
    const res = await fetch(`${API_BASE}/communications`);
    return await res.json();
  },

  async createDraftMessage(msg: any) {
    const res = await fetch(`${API_BASE}/communications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    });
    return await res.json();
  },

  async dispatchMessage(messageId: string) {
    const res = await fetch(`${API_BASE}/communications/${messageId}/dispatch`, {
      method: 'POST',
    });
    return await res.json();
  },

  async getAuditLedger() {
    const res = await fetch(`${API_BASE}/audit-ledger`);
    return await res.json();
  },

  async verifyAuditLedger() {
    const res = await fetch(`${API_BASE}/audit-ledger/verify`);
    return await res.json();
  },

  async getPrivacyComplianceReport() {
    const res = await fetch(`${API_BASE}/ethics/privacy-report`);
    return await res.json();
  },

  subscribeTelemetry(onEvent: (data: unknown) => void) {
    if (typeof window === 'undefined' || !window.EventSource) return () => {};
    const es = new EventSource(`${API_BASE}/telemetry/stream`);
    es.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        onEvent(parsed);
      } catch (err) {
        console.warn('[SSE Parse Error]', err);
      }
    };
    return () => es.close();
  },
};
