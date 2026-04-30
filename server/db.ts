import { and, desc, eq, ilike, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  BOQEstimate,
  BOQLineItem,
  ContractorProfile,
  InsertBOQEstimate,
  InsertBOQLineItem,
  InsertContractorProfile,
  InsertRateCategory,
  InsertRateItem,
  InsertRateVersion,
  InsertUser,
  RateCategory,
  RateItem,
  RateVersion,
  User,
  boqEstimates,
  boqLineItems,
  contractorProfiles,
  rateCategories,
  rateItems,
  rateVersions,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── Contractor Profiles ──────────────────────────────────────────────────────
export async function getContractorProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(contractorProfiles).where(eq(contractorProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function upsertContractorProfile(data: InsertContractorProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getContractorProfile(data.userId);
  if (existing) {
    await db.update(contractorProfiles).set({ ...data, updatedAt: new Date() }).where(eq(contractorProfiles.userId, data.userId));
    return existing.id;
  } else {
    const result = await db.insert(contractorProfiles).values(data);
    return (result[0] as any).insertId as number;
  }
}

export async function getAllContractors() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: contractorProfiles.id,
      userId: contractorProfiles.userId,
      companyName: contractorProfiles.companyName,
      cidbNumber: contractorProfiles.cidbNumber,
      ogpcNumber: contractorProfiles.ogpcNumber,
      cidbGrade: contractorProfiles.cidbGrade,
      ogpcCategory: contractorProfiles.ogpcCategory,
      contactPerson: contractorProfiles.contactPerson,
      phone: contractorProfiles.phone,
      address: contractorProfiles.address,
      isApproved: contractorProfiles.isApproved,
      createdAt: contractorProfiles.createdAt,
      updatedAt: contractorProfiles.updatedAt,
      user: { id: users.id, name: users.name, email: users.email },
    })
    .from(contractorProfiles)
    .leftJoin(users, eq(contractorProfiles.userId, users.id))
    .orderBy(desc(contractorProfiles.createdAt));
}

export async function approveContractor(id: number, approved: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contractorProfiles).set({ isApproved: approved }).where(eq(contractorProfiles.id, id));
}

// ── Rate Versions ────────────────────────────────────────────────────────────
export async function getRateVersions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rateVersions).orderBy(desc(rateVersions.year));
}

export async function getPublishedVersion() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(rateVersions).where(eq(rateVersions.status, "published")).limit(1);
  return result[0];
}

export async function createRateVersion(data: InsertRateVersion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(rateVersions).values(data);
  return (result[0] as any).insertId as number;
}

export async function publishRateVersion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Archive all currently published versions
  await db.update(rateVersions).set({ status: "archived" }).where(eq(rateVersions.status, "published"));
  // Publish the new one
  await db.update(rateVersions).set({ status: "published", publishedAt: new Date() }).where(eq(rateVersions.id, id));
}

// ── Rate Categories ──────────────────────────────────────────────────────────
export async function getRateCategories(trade?: string) {
  const db = await getDb();
  if (!db) return [];
  if (trade) {
    return db.select().from(rateCategories).where(eq(rateCategories.trade, trade as any)).orderBy(rateCategories.sortOrder, rateCategories.name);
  }
  return db.select().from(rateCategories).orderBy(rateCategories.trade, rateCategories.sortOrder, rateCategories.name);
}

export async function createRateCategory(data: InsertRateCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(rateCategories).values(data);
  return (result[0] as any).insertId as number;
}

// ── Rate Items ───────────────────────────────────────────────────────────────
export async function getRateItems(opts: {
  versionId?: number;
  categoryId?: number;
  trade?: string;
  search?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(rateItems.isActive, true)];
  if (opts.versionId) conditions.push(eq(rateItems.versionId, opts.versionId));
  if (opts.categoryId) conditions.push(eq(rateItems.categoryId, opts.categoryId));
  if (opts.trade) conditions.push(eq(rateCategories.trade, opts.trade as any));
  if (opts.search) {
    conditions.push(
      or(
        like(rateItems.description, `%${opts.search}%`),
        like(rateItems.code, `%${opts.search}%`)
      )
    );
  }

  return db
    .select({
      id: rateItems.id,
      versionId: rateItems.versionId,
      categoryId: rateItems.categoryId,
      code: rateItems.code,
      description: rateItems.description,
      unit: rateItems.unit,
      rateMin: rateItems.rateMin,
      rateStandard: rateItems.rateStandard,
      rateMax: rateItems.rateMax,
      remarks: rateItems.remarks,
      isActive: rateItems.isActive,
      sortOrder: rateItems.sortOrder,
      createdAt: rateItems.createdAt,
      updatedAt: rateItems.updatedAt,
      category: {
        id: rateCategories.id,
        name: rateCategories.name,
        code: rateCategories.code,
        trade: rateCategories.trade,
      },
    })
    .from(rateItems)
    .leftJoin(rateCategories, eq(rateItems.categoryId, rateCategories.id))
    .where(and(...conditions))
    .orderBy(rateItems.sortOrder, rateItems.code)
    .limit(opts.limit ?? 200);
}

export async function createRateItem(data: InsertRateItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(rateItems).values(data);
  return (result[0] as any).insertId as number;
}

export async function updateRateItem(id: number, data: Partial<InsertRateItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(rateItems).set({ ...data, updatedAt: new Date() }).where(eq(rateItems.id, id));
}

export async function deleteRateItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(rateItems).set({ isActive: false }).where(eq(rateItems.id, id));
}

// ── BOQ Estimates ────────────────────────────────────────────────────────────
export async function getBOQEstimates(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(boqEstimates).where(eq(boqEstimates.userId, userId)).orderBy(desc(boqEstimates.createdAt));
}

export async function getBOQEstimateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(boqEstimates).where(eq(boqEstimates.id, id)).limit(1);
  return result[0];
}

export async function createBOQEstimate(data: InsertBOQEstimate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(boqEstimates).values(data);
  return (result[0] as any).insertId as number;
}

export async function updateBOQEstimate(id: number, data: Partial<InsertBOQEstimate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(boqEstimates).set({ ...data, updatedAt: new Date() }).where(eq(boqEstimates.id, id));
}

export async function deleteBOQEstimate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete line items first
  await db.delete(boqLineItems).where(eq(boqLineItems.estimateId, id));
  await db.delete(boqEstimates).where(eq(boqEstimates.id, id));
}

// ── BOQ Line Items ───────────────────────────────────────────────────────────
export async function getBOQLineItems(estimateId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(boqLineItems).where(eq(boqLineItems.estimateId, estimateId)).orderBy(boqLineItems.sortOrder, boqLineItems.createdAt);
}

export async function addBOQLineItem(data: InsertBOQLineItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(boqLineItems).values(data);
  const insertId = (result[0] as any).insertId as number;
  await recalculateEstimate(data.estimateId);
  return insertId;
}

export async function updateBOQLineItem(id: number, estimateId: number, data: { quantity?: string; unitRate?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const line = await db.select().from(boqLineItems).where(eq(boqLineItems.id, id)).limit(1);
  if (!line[0]) throw new Error("Line item not found");

  const qty = data.quantity ? parseFloat(data.quantity) : parseFloat(line[0].quantity as string);
  const rate = data.unitRate ? parseFloat(data.unitRate) : parseFloat(line[0].unitRate as string);
  const lineTotal = (qty * rate).toFixed(2);

  // Validate rate range
  const rateMin = line[0].rateMin ? parseFloat(line[0].rateMin as string) : null;
  const rateMax = line[0].rateMax ? parseFloat(line[0].rateMax as string) : null;
  let isFlagged = false;
  let flagReason: string | null = null;
  if (rateMin !== null && rate < rateMin) { isFlagged = true; flagReason = `Rate BND ${rate.toFixed(2)} is below minimum BND ${rateMin.toFixed(2)}`; }
  if (rateMax !== null && rate > rateMax) { isFlagged = true; flagReason = `Rate BND ${rate.toFixed(2)} exceeds maximum BND ${rateMax.toFixed(2)}`; }

  await db.update(boqLineItems).set({
    quantity: String(qty),
    unitRate: String(rate),
    lineTotal,
    isFlagged,
    flagReason: flagReason,
  }).where(eq(boqLineItems.id, id));

  await recalculateEstimate(estimateId);
}

export async function removeBOQLineItem(id: number, estimateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(boqLineItems).where(eq(boqLineItems.id, id));
  await recalculateEstimate(estimateId);
}

async function recalculateEstimate(estimateId: number) {
  const db = await getDb();
  if (!db) return;
  const lines = await db.select().from(boqLineItems).where(eq(boqLineItems.estimateId, estimateId));
  const grandTotal = lines.reduce((sum, l) => sum + parseFloat(l.lineTotal as string), 0).toFixed(2);
  const hasFlags = lines.some((l) => l.isFlagged);
  await db.update(boqEstimates).set({ grandTotal, hasValidationFlags: hasFlags, updatedAt: new Date() }).where(eq(boqEstimates.id, estimateId));
}
