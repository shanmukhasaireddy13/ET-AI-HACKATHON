import crypto from "crypto";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../config/db.js";
import config from "../config/index.js";

const oauthStates = new Map();

export async function listIntegrations(req, res) {
  try {
    const { data: rows, error } = await supabase.from("integrations").select("*");
    if (error) throw error;

    const connected = {};
    for (const r of (rows || [])) {
      let extra = {};
      try { extra = typeof r.extra === "string" ? JSON.parse(r.extra) : (r.extra || {}); } catch {}
      connected[r.service] = {
        ...r,
        display_name: extra.display_name || r.email || "",
        avatar_url: extra.avatar_url || "",
        cloud_id: extra.cloud_id || "",
        site_name: extra.site_name || "",
      };
    }

    const services = [
      {
        service: "jira", name: "Jira Cloud",
        description: "Create tickets, track bugs, and manage tasks.",
        icon: "🎫", connected: !!connected.jira, details: connected.jira || {},
        oauth_available: !!config.jira.clientId,
      },
      { service: "slack", name: "Slack", description: "Send notifications and alerts.", icon: "💬", connected: false, details: {}, coming_soon: true },
      { service: "google_calendar", name: "Google Calendar", description: "Schedule follow-up meetings.", icon: "📅", connected: false, details: {}, coming_soon: true },
    ];

    res.json({ success: true, request_id: req.requestId, data: services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch integrations" });
  }
}

export async function initiateJiraOAuth(req, res) {
  try {
    if (!config.jira.clientId) {
      return res.status(400).json({ error: "Jira OAuth not configured" });
    }

    const state = crypto.randomBytes(32).toString("hex");
    oauthStates.set(state, Date.now());

    const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${config.jira.clientId}&scope=read%3Ajira-work%20write%3Ajira-work%20read%3Ajira-user%20offline_access&redirect_uri=${encodeURIComponent(config.jira.callbackUrl)}&state=${state}&response_type=code&prompt=consent`;

    res.json({ success: true, request_id: req.requestId, data: { authorization_url: authUrl, state } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to initiate OAuth" });
  }
}

export async function jiraOAuthCallback(req, res) {
  try {
    const { code, state } = req.query;

    if (!oauthStates.has(state)) {
      return res.redirect(`${config.frontendUrl}/dashboard/integrations?error=invalid_state`);
    }
    oauthStates.delete(state);

    const tokenRes = await axios.post("https://auth.atlassian.com/oauth/token", {
      grant_type: "authorization_code",
      client_id: config.jira.clientId,
      client_secret: config.jira.clientSecret,
      code,
      redirect_uri: config.jira.callbackUrl,
    });

    const { access_token, refresh_token } = tokenRes.data;

    let cloud_id = "", site_name = "", site_url = "";
    try {
      const r = await axios.get("https://api.atlassian.com/oauth/token/accessible-resources", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (r.data.length > 0) { cloud_id = r.data[0].id; site_name = r.data[0].name; site_url = r.data[0].url; }
    } catch {}

    let display_name = "", email = "", avatar_url = "", account_id = "";
    if (cloud_id) {
      try {
        const m = await axios.get(`https://api.atlassian.com/ex/jira/${cloud_id}/rest/api/3/myself`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        display_name = m.data.displayName || ""; email = m.data.emailAddress || "";
        avatar_url = (m.data.avatarUrls || {})["48x48"] || ""; account_id = m.data.accountId || "";
      } catch {}
    }

    const extra = JSON.stringify({ access_token, refresh_token, cloud_id, site_name, display_name, avatar_url, account_id });

    await supabase.from("integrations").upsert({
      id: `int-${uuidv4().slice(0, 8)}`, service: "jira", base_url: site_url, email,
      api_token: access_token, project_key: config.jira.projectKey, extra, status: "connected",
      connected_at: new Date().toISOString(),
    }, { onConflict: "service" });

    res.redirect(`${config.frontendUrl}/dashboard/integrations?connected=jira&user=${encodeURIComponent(display_name)}`);
  } catch (err) {
    console.error("OAuth callback error:", err.message);
    res.redirect(`${config.frontendUrl}/dashboard/integrations?error=callback_failed`);
  }
}

export async function disconnectJira(req, res) {
  try {
    await supabase.from("integrations").delete().eq("service", "jira");
    res.json({ success: true, request_id: req.requestId, data: { status: "disconnected" } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to disconnect" });
  }
}
