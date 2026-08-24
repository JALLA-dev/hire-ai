import { db } from "@/db";
import { notificationPreferences, portalAuditLogs, portalConnections } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const catalog = [
  { id: "linkedin", name: "LinkedIn", color: "#0a66c2", letter: "in", description: "Professional roles, profile insights and network activity", capabilities: ["Profile sync", "Job matches", "Application updates"], defaultMatches: 12 },
  { id: "indeed", name: "Indeed", color: "#2557a7", letter: "i", description: "Broad job discovery and saved job activity", capabilities: ["Job matches", "Saved jobs", "Application updates"], defaultMatches: 8 },
  { id: "naukri", name: "Naukri", color: "#4a90e2", letter: "N", description: "Access opportunities across the Indian job market", capabilities: ["Profile sync", "Job alerts", "Applications"], defaultMatches: 9 },
  { id: "glassdoor", name: "Glassdoor", color: "#0caa41", letter: "G", description: "Salary insights, reviews and company research", capabilities: ["Salary data", "Company reviews", "Job matches"], defaultMatches: 6 },
  { id: "wellfound", name: "Wellfound", color: "#161616", letter: "W", description: "Startup roles and direct founder connections", capabilities: ["Startup jobs", "Profile sync", "Applications"], defaultMatches: 5 },
  { id: "internshala", name: "Internshala", color: "#1295c9", letter: "I", description: "Student internships and early-career opportunities", capabilities: ["Internships", "Job alerts", "Applications"], defaultMatches: 11 },
  { id: "monster", name: "Monster", color: "#6e46ae", letter: "M", description: "Job recommendations and application history", capabilities: ["Job matches", "Profile sync", "Applications"], defaultMatches: 4 },
  { id: "upwork", name: "Upwork", color: "#14a800", letter: "up", description: "Freelance projects and independent work", capabilities: ["Freelance jobs", "Profile sync", "Proposals"], defaultMatches: 7 },
] as const;

const defaultPreferences = {
  id: 1,
  enabled: true,
  email: true,
  push: true,
  sms: false,
  webPush: true,
  newJobs: true,
  applicationUpdates: true,
  interviews: true,
  deadlines: true,
  weeklyDigest: true,
  skillGaps: false,
  portalActivity: true,
  digestDay: "Monday",
  digestTime: "8:00 AM",
  reminderWindow: "24 hours before",
};

function isPortalId(id: string) {
  return catalog.some((portal) => portal.id === id);
}

export async function GET() {
  try {
    const [connections, preferenceRows, recentActivity] = await Promise.all([
      db.select().from(portalConnections),
      db.select().from(notificationPreferences).where(eq(notificationPreferences.id, 1)).limit(1),
      db.select().from(portalAuditLogs).orderBy(portalAuditLogs.createdAt).limit(20),
    ]);
    const map = new Map(connections.map((item) => [item.portalId, item]));
    const portals = catalog.map((portal) => {
      const saved = map.get(portal.id);
      return {
        ...portal,
        connected: saved?.connected ?? false,
        profileName: saved?.profileName ?? null,
        matchCount: saved?.matchCount ?? 0,
        permissions: saved?.permissions ?? [],
        lastSyncedAt: saved?.lastSyncedAt?.toISOString() ?? null,
        oauthConfigured: Boolean(process.env[`${portal.id.toUpperCase()}_CLIENT_ID`]),
      };
    });
    return Response.json({ portals, preferences: preferenceRows[0] ?? defaultPreferences, recentActivity: recentActivity.reverse() });
  } catch (err) {
    // Database unavailable – return catalog with defaults so the UI still renders
    const portals = catalog.map((portal) => ({
      ...portal,
      connected: false,
      profileName: null,
      matchCount: 0,
      permissions: [],
      lastSyncedAt: null,
      oauthConfigured: false,
    }));
    return Response.json({ portals, preferences: defaultPreferences, recentActivity: [], dbError: String(err) });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as null | { action?: string; portalId?: string; preferences?: Partial<typeof defaultPreferences> };
    if (!body?.action) return Response.json({ error: "Action is required" }, { status: 400 });

    if (body.action === "savePreferences") {
      const allowed = body.preferences ?? {};
      const values = {
        ...defaultPreferences,
        ...allowed,
        id: 1,
        updatedAt: new Date(),
      };
      await db.insert(notificationPreferences).values(values).onConflictDoUpdate({ target: notificationPreferences.id, set: values });
      return Response.json({ ok: true, preferences: values });
    }

    if (body.action === "syncAll") {
      const now = new Date();
      const connected = await db.select().from(portalConnections).where(eq(portalConnections.connected, true));
      await Promise.all(connected.map(async (portal) => {
        await db.update(portalConnections).set({ lastSyncedAt: now, updatedAt: now }).where(eq(portalConnections.portalId, portal.portalId));
        await db.insert(portalAuditLogs).values({ portalId: portal.portalId, action: "sync", detail: "Manual all-portal sync completed" });
      }));
      return Response.json({ ok: true, synced: connected.length, syncedAt: now.toISOString() });
    }

    const portalId = body.portalId ?? "";
    if (!isPortalId(portalId)) return Response.json({ error: "Unsupported portal" }, { status: 400 });
    const provider = catalog.find((portal) => portal.id === portalId)!;
    const now = new Date();

    if (body.action === "connect") {
      const profileName = (body as { profileName?: string }).profileName?.trim() || "Connected Account";
      const values = {
        portalId,
        connected: true,
        profileName,
        matchCount: provider.defaultMatches,
        permissions: [...provider.capabilities],
        lastSyncedAt: now,
        updatedAt: now,
      };
      await db.insert(portalConnections).values(values).onConflictDoUpdate({ target: portalConnections.portalId, set: values });
      await db.insert(portalAuditLogs).values({ portalId, action: "connect", detail: `Student connected portal account (${profileName})` });
      return Response.json({ ok: true, connection: { ...values, lastSyncedAt: now.toISOString() } });
    }

    if (body.action === "disconnect") {
      await db.update(portalConnections).set({ connected: false, profileName: null, matchCount: 0, permissions: [], updatedAt: now }).where(eq(portalConnections.portalId, portalId));
      await db.insert(portalAuditLogs).values({ portalId, action: "disconnect", detail: "Student revoked portal access" });
      return Response.json({ ok: true });
    }

    if (body.action === "sync") {
      await db.update(portalConnections).set({ lastSyncedAt: now, updatedAt: now }).where(eq(portalConnections.portalId, portalId));
      await db.insert(portalAuditLogs).values({ portalId, action: "sync", detail: "Manual portal sync completed" });
      return Response.json({ ok: true, syncedAt: now.toISOString() });
    }

    return Response.json({ error: "Unsupported action" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: "Database unavailable", detail: String(err) }, { status: 503 });
  }
}

