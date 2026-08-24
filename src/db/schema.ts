import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const portalConnections = pgTable("portal_connections", {
  portalId: varchar("portal_id", { length: 40 }).primaryKey(),
  connected: boolean("connected").notNull().default(false),
  profileName: varchar("profile_name", { length: 120 }),
  matchCount: integer("match_count").notNull().default(0),
  permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  id: integer("id").primaryKey().default(1),
  enabled: boolean("enabled").notNull().default(true),
  email: boolean("email").notNull().default(true),
  push: boolean("push").notNull().default(true),
  sms: boolean("sms").notNull().default(false),
  webPush: boolean("web_push").notNull().default(true),
  newJobs: boolean("new_jobs").notNull().default(true),
  applicationUpdates: boolean("application_updates").notNull().default(true),
  interviews: boolean("interviews").notNull().default(true),
  deadlines: boolean("deadlines").notNull().default(true),
  weeklyDigest: boolean("weekly_digest").notNull().default(true),
  skillGaps: boolean("skill_gaps").notNull().default(false),
  portalActivity: boolean("portal_activity").notNull().default(true),
  digestDay: varchar("digest_day", { length: 16 }).notNull().default("Monday"),
  digestTime: varchar("digest_time", { length: 16 }).notNull().default("8:00 AM"),
  reminderWindow: varchar("reminder_window", { length: 32 }).notNull().default("24 hours before"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const portalAuditLogs = pgTable("portal_audit_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  portalId: varchar("portal_id", { length: 40 }).notNull(),
  action: varchar("action", { length: 40 }).notNull(),
  detail: text("detail"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
