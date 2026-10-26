import { localStore } from './localEngine';

/**
 * Universal Resilient API Client.
 * Tries server first; automatically fails over to the in-browser
 * zero-config localEngine on Vercel or when backend is offline.
 */
export const api = {
  async get(url) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Backend offline or running purely on static Vercel
    }

    // Client-side fallback matching endpoints
    if (url.includes('/api/status')) {
      return localStore.getStatus();
    }
    if (url.includes('/api/stats')) {
      return localStore.getStats();
    }
    if (url.includes('/api/incidents')) {
      return localStore.incidents;
    }
    if (url.includes('/api/resources')) {
      return localStore.resources;
    }
    if (url.includes('/api/allocation')) {
      const algo = url.includes('GREEDY') ? 'GREEDY' : 'HUNGARIAN';
      return localStore.getAllocation(algo);
    }
    if (url.includes('/api/whatif')) {
      const match = url.match(/scenario_type=([^&]+)/);
      const scenario = match ? match[1] : 'ROAD_BLOCKAGE';
      return localStore.getWhatIf(scenario);
    }
    if (url.includes('/api/audit-logs')) {
      return localStore.auditLogs;
    }

    return null;
  },

  async post(url, body) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Backend offline or running purely on static Vercel
    }

    // Client-side fallback for POST endpoints
    if (url.includes('/api/incidents/ai-extract')) {
      return localStore.nlpExtract(body.report_text, body.vision_preset);
    }
    if (url.includes('/api/incidents')) {
      const inc = {
        ...body,
        id: body.id || `INC-${Math.floor(Math.random() * 900) + 705}`,
        status: "PENDING_DISPATCH",
        created_at: new Date().toISOString(),
        assigned_resources: []
      };
      localStore.incidents.unshift(inc);
      return inc;
    }
    if (url.includes('/api/dispatch/approve')) {
      return localStore.approveDispatch(body.incident_id, body.resource_id, body.officer_id, body.decision_notes);
    }
    if (url.includes('/api/dispatch/override')) {
      return localStore.overrideDispatch(body.incident_id, body.selected_resource_id, body.original_recommended_id, body.officer_id, body.override_reason);
    }
    if (url.includes('/api/reset-demo')) {
      localStore.reset();
      return { status: "SUCCESS", message: "Demo reset to pristine state." };
    }

    return { status: "SUCCESS" };
  }
};
