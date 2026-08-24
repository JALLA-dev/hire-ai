"use client";

import {
  Activity,
  ArrowLeftRight,
  Bell,
  BellRing,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  LayoutDashboard,
  Link2,
  LoaderCircle,
  LockKeyhole,
  MessageSquareText,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Unplug,
  UserRoundCheck,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export type WorkspaceName = "Overview" | "Job search" | "Resume builder" | "Applications" | "Career tools" | "Insights" | "Portal connections" | "Settings";

type Portal = {
  id: string;
  name: string;
  color: string;
  letter: string;
  description: string;
  capabilities: string[];
  connected: boolean;
  profileName: string | null;
  matchCount: number;
  permissions: string[];
  lastSyncedAt: string | null;
  oauthConfigured: boolean;
};

type Preferences = {
  enabled: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
  webPush: boolean;
  newJobs: boolean;
  applicationUpdates: boolean;
  interviews: boolean;
  deadlines: boolean;
  weeklyDigest: boolean;
  skillGaps: boolean;
  portalActivity: boolean;
  digestDay: string;
  digestTime: string;
  reminderWindow: string;
};

const initialPreferences: Preferences = {
  enabled: true, email: true, push: true, sms: false, webPush: true,
  newJobs: true, applicationUpdates: true, interviews: true, deadlines: true,
  weeklyDigest: true, skillGaps: false, portalActivity: true,
  digestDay: "Monday", digestTime: "8:00 AM", reminderWindow: "24 hours before",
};

function relativeTime(value: string | null) {
  if (!value) return "Never synced";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 30) return "Synced just now";
  if (seconds < 3600) return `Synced ${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `Synced ${Math.floor(seconds / 3600)} hr ago`;
  return `Synced ${Math.floor(seconds / 86400)}d ago`;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`toggle ${checked ? "on" : ""}`} onClick={onChange}><i /></button>;
}

function PageHeader({ kicker, title, description, children }: { kicker: string; title: string; description: string; children?: React.ReactNode }) {
  return (
    <div className="workspace-header">
      <div><p><span />{kicker}</p><h1>{title}</h1><div>{description}</div></div>
      {children}
    </div>
  );
}

export function PortalConnections({ notify }: { notify: (message: string) => void }) {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [permissionPortal, setPermissionPortal] = useState<Portal | null>(null);
  const [connectModalPortal, setConnectModalPortal] = useState<Portal | null>(null);
  const [connectProfileName, setConnectProfileName] = useState("");
  const [connectProfileHandle, setConnectProfileHandle] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/portals", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load connections");
      const data = await response.json();
      setPortals(data.portals);
    } catch { notify("Could not load portal connections"); }
    finally { setLoading(false); }
  }, [notify]);

  useEffect(() => { void load(); }, [load]);

  const connected = portals.filter((portal) => portal.connected);
  const totalMatches = connected.reduce((sum, portal) => sum + portal.matchCount, 0);

  async function action(portal: Portal, actionName: "connect" | "disconnect" | "sync", customProfileName?: string) {
    setBusy(portal.id);
    try {
      const response = await fetch("/api/portals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionName,
          portalId: portal.id,
          profileName: customProfileName,
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      await load();
      notify(actionName === "connect" ? `${portal.name} connected and profile synced` : actionName === "disconnect" ? `${portal.name} access revoked` : `${portal.name} is up to date`);
    } catch { notify(`Could not ${actionName} ${portal.name}`); }
    finally { setBusy(null); }
  }

  function handleConnectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!connectModalPortal) return;
    const nameToUse = connectProfileName.trim() || connectProfileHandle.trim() || `${connectModalPortal.name} Account`;
    action(connectModalPortal, "connect", nameToUse);
    setConnectModalPortal(null);
    setConnectProfileName("");
    setConnectProfileHandle("");
  }

  async function syncAll() {
    if (!connected.length) return notify("Connect a portal before syncing");
    setBusy("all");
    try {
      const response = await fetch("/api/portals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "syncAll" }) });
      if (!response.ok) throw new Error("Sync failed");
      await load();
      notify(`${connected.length} portals synced successfully`);
    } catch { notify("Portal sync could not be completed"); }
    finally { setBusy(null); }
  }

  return (
    <div className="workspace-page">
      <PageHeader kicker="Integrations" title="Connected job portals" description="Bring every opportunity, application, and update into one secure workspace.">
        <button className="workspace-primary" onClick={syncAll} disabled={busy === "all"}><RefreshCw size={15} className={busy === "all" ? "spin" : ""} />Sync all portals</button>
      </PageHeader>

      <div className="portal-summary-grid">
        <div className="summary-tile"><span className="summary-icon violet"><Link2 size={18} /></span><div><b>{connected.length}</b><small>Connected portals</small></div><em>of {portals.length} available</em></div>
        <div className="summary-tile"><span className="summary-icon green"><Target size={18} /></span><div><b>{totalMatches}</b><small>Live job matches</small></div><em>across all sources</em></div>
        <div className="summary-tile"><span className="summary-icon blue"><ArrowLeftRight size={18} /></span><div><b>30 min</b><small>Automatic sync</small></div><em>webhooks when available</em></div>
      </div>

      <div className="integration-layout">
        <section className="portal-panel">
          <div className="portal-panel-head"><div><h2>Your portal network</h2><p>Connect only the services you use. You can revoke access at any time.</p></div><span><span className="pulse-dot" /> Secure sync active</span></div>
          {loading ? <div className="portal-loading"><LoaderCircle className="spin" size={24} />Loading secure connections…</div> : (
            <div className="portal-grid">
              {portals.map((portal) => (
                <article className={`portal-card ${portal.connected ? "connected" : ""}`} key={portal.id}>
                  <div className="portal-card-top">
                    <div className="portal-brand" style={{ background: portal.color }}>{portal.letter}</div>
                    <div className="portal-title"><div><h3>{portal.name}</h3>{portal.connected ? <span className="connected-pill"><i />Connected</span> : <span className="available-pill">Available</span>}</div><p>{portal.description}</p></div>
                    <button className="portal-menu" aria-label={`Manage ${portal.name}`} onClick={() => setPermissionPortal(portal)}><SlidersHorizontal size={16} /></button>
                  </div>
                  <div className="capability-row">{portal.capabilities.map((capability) => <span key={capability}><Check size={11} />{capability}</span>)}</div>
                  {portal.connected ? (
                    <div className="connected-details">
                      <div><UserRoundCheck size={15} /><span><small>Synced profile</small><b>{portal.profileName}</b></span></div>
                      <div><BriefcaseBusiness size={15} /><span><small>New matches</small><b>{portal.matchCount} jobs</b></span></div>
                    </div>
                  ) : <div className="oauth-note"><LockKeyhole size={14} /><span>{portal.oauthConfigured ? "OAuth credentials ready" : "Secure connection preview"}</span></div>}
                  <div className="portal-card-foot">
                    <span><Clock3 size={12} />{relativeTime(portal.lastSyncedAt)}</span>
                    {portal.connected ? (
                      <div>
                        <button className="icon-sync" disabled={busy === portal.id} onClick={() => action(portal, "sync")} aria-label={`Sync ${portal.name}`}><RefreshCw size={14} className={busy === portal.id ? "spin" : ""} /></button>
                        <button className="disconnect-button" onClick={() => action(portal, "disconnect")}>Disconnect</button>
                      </div>
                    ) : (
                      <button className="connect-button" disabled={busy === portal.id} onClick={() => setConnectModalPortal(portal)}>
                        {busy === portal.id ? <LoaderCircle className="spin" size={14} /> : <Link2 size={14} />}Connect securely
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="integration-aside">
          <section className="security-card"><div className="security-shield"><ShieldCheck size={22} /></div><h3>Your data stays yours</h3><p>Hire AI requests the minimum access needed. Credentials remain with each portal, permissions are revocable, and every sync is logged.</p><ul><li><Check size={13} />Scoped portal permissions</li><li><Check size={13} />Encrypted transport</li><li><Check size={13} />Transparent activity log</li></ul><button onClick={() => notify("Security center opened")}>View security center <ChevronRight size={13} /></button></section>
          <section className="sync-flow-card"><span>HOW SYNC WORKS</span><h3>One search. Every source.</h3><div className="sync-flow"><div><Search size={15} /><b>You search</b></div><i /><div><Sparkles size={15} /><b>AI ranks</b></div><i /><div><BellRing size={15} /><b>You&apos;re alerted</b></div></div><p>Results are deduplicated and ranked using your skills, preferences, and resume fit.</p></section>
        </aside>
      </div>

      {connectModalPortal ? (
        <div className="permission-modal-layer">
          <button aria-label="Close form" onClick={() => setConnectModalPortal(null)} />
          <section className="connect-details-modal" style={{ textAlign: "left" }}>
            <div className="permission-icon" style={{ background: connectModalPortal.color, margin: "0 0 12px 0" }}>
              {connectModalPortal.letter}
            </div>
            <h2 style={{ margin: "0 0 4px 0", fontSize: "15px" }}>Connect to {connectModalPortal.name}</h2>
            <p style={{ margin: "0 0 16px 0", color: "#858b97", fontSize: "11px" }}>
              Enter your account details below to securely link your profile and auto-sync jobs.
            </p>
            <form onSubmit={handleConnectSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#444b59", marginBottom: "4px" }}>
                  Profile Name / Display Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Jalla Venkata"
                  value={connectProfileName}
                  onChange={(e) => setConnectProfileName(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #dcdfe6", fontSize: "12px", outline: "none", color: "#222" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#444b59", marginBottom: "4px" }}>
                  Email, Username, or Profile URL
                </label>
                <input
                  type="text"
                  placeholder={`e.g. ${connectModalPortal.id}.com/in/username`}
                  value={connectProfileHandle}
                  onChange={(e) => setConnectProfileHandle(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #dcdfe6", fontSize: "12px", outline: "none", color: "#222" }}
                />
              </div>
              <div className="permission-note" style={{ margin: "4px 0" }}>
                <LockKeyhole size={14} /> Encrypted authentication via secure portal API.
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setConnectModalPortal(null)}
                  style={{ flex: 1, padding: "8px", background: "#f1f2f5", color: "#555", border: "0", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: "8px", background: connectModalPortal.color || "var(--purple)", color: "#fff", border: "0", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                >
                  Connect Portal
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {permissionPortal ? <div className="permission-modal-layer"><button aria-label="Close permissions" onClick={() => setPermissionPortal(null)} /><section><div className="permission-icon" style={{ background: permissionPortal.color }}>{permissionPortal.letter}</div><h2>{permissionPortal.name} permissions</h2><p>{permissionPortal.connected ? "Hire AI currently uses these approved scopes." : "These permissions will be requested when you connect."}</p><ul>{permissionPortal.capabilities.map((item) => <li key={item}><Check size={14} />{item}<span>Allowed</span></li>)}</ul><div className="permission-note"><LockKeyhole size={14} />Hire AI never asks for your portal password.</div><button onClick={() => setPermissionPortal(null)}>Done</button></section></div> : null}
    </div>
  );
}

const channels: { key: keyof Preferences; label: string; detail: string; icon: typeof Bell }[] = [
  { key: "email", label: "Email", detail: "Digests and detailed updates", icon: MessageSquareText },
  { key: "push", label: "In-app push", detail: "Instant updates while active", icon: Bell },
  { key: "sms", label: "SMS", detail: "Urgent reminders only", icon: Zap },
  { key: "webPush", label: "Web push", detail: "Alerts when this tab is closed", icon: BellRing },
];
const eventTypes: { key: keyof Preferences; label: string; detail: string }[] = [
  { key: "newJobs", label: "New job matches", detail: "Roles matching your skills and preferences" },
  { key: "applicationUpdates", label: "Application status updates", detail: "Screening, interview, offer, or rejection changes" },
  { key: "interviews", label: "Interview reminders", detail: "Upcoming interview schedule and preparation" },
  { key: "deadlines", label: "Deadline alerts", detail: "Applications closing soon" },
  { key: "weeklyDigest", label: "Weekly digest", detail: "Your Monday job-search summary" },
  { key: "skillGaps", label: "Skill gap alerts", detail: "New skills trending for your target roles" },
  { key: "portalActivity", label: "Portal activity", detail: "Recruiter views, messages, and saved-job activity" },
];

export function NotificationSettings({ notify }: { notify: (message: string) => void }) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [saving, setSaving] = useState(false);
  useEffect(() => { fetch("/api/portals", { cache: "no-store" }).then((response) => response.json()).then((data) => setPreferences({ ...initialPreferences, ...data.preferences })).catch(() => notify("Using default notification settings")); }, [notify]);
  function flip(key: keyof Preferences) { setPreferences((current) => ({ ...current, [key]: !current[key] })); }
  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/portals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "savePreferences", preferences }) });
      if (!response.ok) throw new Error("Save failed");
      notify("Notification preferences saved");
    } catch { notify("Could not save notification preferences"); }
    finally { setSaving(false); }
  }
  return (
    <div className="workspace-page settings-workspace">
      <PageHeader kicker="Settings" title="Notification preferences" description="Choose what matters, where you hear about it, and how often.">
        <button className="test-button" onClick={() => notify("Test notification sent successfully")}><BellRing size={15} />Send test</button>
        <button className="workspace-primary" disabled={saving} onClick={save}>{saving ? <LoaderCircle className="spin" size={15} /> : <Check size={15} />}Save changes</button>
      </PageHeader>
      <div className="settings-layout">
        <div className="settings-main">
          <section className="settings-card master-setting"><div className="settings-icon violet"><BellRing size={20} /></div><div><h2>Enable notifications</h2><p>Receive relevant career updates across your preferred channels.</p></div><Toggle checked={preferences.enabled} onChange={() => flip("enabled")} label="Enable notifications" /></section>
          <section className={`settings-card settings-section ${!preferences.enabled ? "disabled-section" : ""}`}><div className="settings-title"><div><h2>Delivery channels</h2><p>Select where Pathwise can reach you.</p></div><span>{channels.filter((item) => Boolean(preferences[item.key])).length} active</span></div><div className="channel-grid">{channels.map(({ key, label, detail, icon: Icon }) => <div className="channel-option" key={key}><span className="channel-icon"><Icon size={17} /></span><div><b>{label}</b><small>{detail}</small></div><Toggle checked={Boolean(preferences[key])} onChange={() => flip(key)} label={label} /></div>)}</div></section>
          <section className={`settings-card settings-section ${!preferences.enabled ? "disabled-section" : ""}`}><div className="settings-title"><div><h2>Notification types</h2><p>Fine-tune the updates you want to receive.</p></div></div><div className="event-list">{eventTypes.map(({ key, label, detail }) => <div className="event-option" key={key}><span className={Boolean(preferences[key]) ? "checked" : ""}><Check size={12} /></span><div><b>{label}</b><small>{detail}</small></div><Toggle checked={Boolean(preferences[key])} onChange={() => flip(key)} label={label} /></div>)}</div></section>
        </div>
        <aside className="settings-aside">
          <section className={`settings-card frequency-card ${!preferences.enabled ? "disabled-section" : ""}`}><span className="settings-kicker">FREQUENCY</span><h2>Timing & reminders</h2><label>Weekly digest day<select value={preferences.digestDay} onChange={(event) => setPreferences({ ...preferences, digestDay: event.target.value })}>{["Monday", "Tuesday", "Friday"].map((value) => <option key={value}>{value}</option>)}</select></label><label>Digest time<select value={preferences.digestTime} onChange={(event) => setPreferences({ ...preferences, digestTime: event.target.value })}>{["8:00 AM", "9:00 AM", "6:00 PM"].map((value) => <option key={value}>{value}</option>)}</select></label><label>Interview reminders<select value={preferences.reminderWindow} onChange={(event) => setPreferences({ ...preferences, reminderWindow: event.target.value })}>{["1 hour before", "12 hours before", "24 hours before", "48 hours before"].map((value) => <option key={value}>{value}</option>)}</select></label></section>
          <section className="quiet-card"><div><Clock3 size={17} /><h3>Thoughtful by default</h3></div><p>Non-urgent alerts are grouped to reduce noise. Interview and deadline reminders are always prioritized.</p></section>
        </aside>
      </div>
    </div>
  );
}

const quickItems: { label: WorkspaceName; icon: typeof Bell }[] = [
  { label: "Overview", icon: LayoutDashboard }, { label: "Job search", icon: Search }, { label: "Resume builder", icon: FileText },
  { label: "Applications", icon: BriefcaseBusiness }, { label: "Career tools", icon: WandSparkles },
  { label: "Portal connections", icon: Link2 }, { label: "Settings", icon: Settings },
];

export function QuickRail({ active, onNavigate }: { active: string; onNavigate: (item: WorkspaceName) => void }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    let timer = window.setTimeout(() => setVisible(false), 5000);
    const wake = (event: MouseEvent) => {
      if (event.clientX > window.innerWidth - 90) setVisible(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setVisible(false), 5000);
    };
    const scroll = () => { setVisible(true); window.clearTimeout(timer); timer = window.setTimeout(() => setVisible(false), 5000); };
    window.addEventListener("mousemove", wake);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => { window.clearTimeout(timer); window.removeEventListener("mousemove", wake); window.removeEventListener("scroll", scroll); };
  }, []);
  return <><div className="rail-sensor" onMouseEnter={() => setVisible(true)} /><nav className={`quick-rail ${visible ? "visible" : ""}`} aria-label="Quick navigation">{quickItems.map(({ label, icon: Icon }) => <button key={label} className={active === label ? "active" : ""} onClick={() => onNavigate(label)}><Icon size={16} /><span>{label}</span></button>)}<button onClick={() => onNavigate("Career tools")}><CircleHelp size={16} /><span>Help</span></button></nav></>;
}
