import {
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Contractor Profiles ──────────────────────────────────────────────────────
export const contractorProfiles = mysqlTable("contractor_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  cidbNumber: varchar("cidbNumber", { length: 100 }),
  ogpcNumber: varchar("ogpcNumber", { length: 100 }),
  cidbGrade: varchar("cidbGrade", { length: 20 }),
  ogpcCategory: varchar("ogpcCategory", { length: 50 }),
  contactPerson: varchar("contactPerson", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  isApproved: boolean("isApproved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContractorProfile = typeof contractorProfiles.$inferSelect;
export type InsertContractorProfile = typeof contractorProfiles.$inferInsert;

// ── Rate Versions ────────────────────────────────────────────────────────────
export const rateVersions = mysqlTable("rate_versions", {
  id: int("id").autoincrement().primaryKey(),
  year: int("year").notNull(),
  label: varchar("label", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RateVersion = typeof rateVersions.$inferSelect;
export type InsertRateVersion = typeof rateVersions.$inferInsert;

// ── Rate Categories ──────────────────────────────────────────────────────────
export const rateCategories = mysqlTable("rate_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }),
  trade: mysqlEnum("trade", ["civil", "mechanical", "electrical", "piping"]).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RateCategory = typeof rateCategories.$inferSelect;
export type InsertRateCategory = typeof rateCategories.$inferInsert;

// ── Rate Items ───────────────────────────────────────────────────────────────
export const rateItems = mysqlTable("rate_items", {
  id: int("id").autoincrement().primaryKey(),
  versionId: int("versionId").notNull().references(() => rateVersions.id),
  categoryId: int("categoryId").references(() => rateCategories.id),
  code: varchar("code", { length: 50 }).notNull(),
  description: text("description").notNull(),
  unit: varchar("unit", { length: 30 }).notNull(),
  rateMin: decimal("rateMin", { precision: 12, scale: 2 }).notNull(),
  rateStandard: decimal("rateStandard", { precision: 12, scale: 2 }).notNull(),
  rateMax: decimal("rateMax", { precision: 12, scale: 2 }).notNull(),
  remarks: text("remarks"),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RateItem = typeof rateItems.$inferSelect;
export type InsertRateItem = typeof rateItems.$inferInsert;

// ── BOQ Estimates ────────────────────────────────────────────────────────────
export const boqEstimates = mysqlTable("boq_estimates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  versionId: int("versionId").references(() => rateVersions.id),
  projectName: varchar("projectName", { length: 255 }).notNull(),
  projectRef: varchar("projectRef", { length: 100 }),
  projectLocation: varchar("projectLocation", { length: 255 }),
  clientName: varchar("clientName", { length: 255 }),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "submitted", "approved"]).default("draft").notNull(),
  grandTotal: decimal("grandTotal", { precision: 16, scale: 2 }).default("0.00").notNull(),
  hasValidationFlags: boolean("hasValidationFlags").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BOQEstimate = typeof boqEstimates.$inferSelect;
export type InsertBOQEstimate = typeof boqEstimates.$inferInsert;

// ── BOQ Line Items ───────────────────────────────────────────────────────────
export const boqLineItems = mysqlTable("boq_line_items", {
  id: int("id").autoincrement().primaryKey(),
  estimateId: int("estimateId").notNull().references(() => boqEstimates.id),
  rateItemId: int("rateItemId").references(() => rateItems.id),
  itemCode: varchar("itemCode", { length: 50 }).notNull(),
  description: text("description").notNull(),
  unit: varchar("unit", { length: 30 }).notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 3 }).notNull(),
  unitRate: decimal("unitRate", { precision: 12, scale: 2 }).notNull(),
  lineTotal: decimal("lineTotal", { precision: 16, scale: 2 }).notNull(),
  rateMin: decimal("rateMin", { precision: 12, scale: 2 }),
  rateMax: decimal("rateMax", { precision: 12, scale: 2 }),
  isFlagged: boolean("isFlagged").default(false).notNull(),
  flagReason: varchar("flagReason", { length: 255 }),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BOQLineItem = typeof boqLineItems.$inferSelect;
export type InsertBOQLineItem = typeof boqLineItems.$inferInsert;
