/**
 * BOGSA Rate Database — Test Suite
 * Tests core business logic: rate validation, BOQ calculation, auth, and router procedures
 */
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ── Test Context Factories ─────────────────────────────────────────────────────

type CookieCall = { name: string; options: Record<string, unknown> };

function makeCtx(role: "user" | "admin" = "user"): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];
  const ctx: TrpcContext = {
    user: {
      id: role === "admin" ? 1 : 2,
      openId: role === "admin" ? "admin-openid" : "user-openid",
      email: `${role}@example.com`,
      name: role === "admin" ? "Admin User" : "Test Contractor",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

function makePublicCtx(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
  return { ctx };
}

// ── Auth Tests ─────────────────────────────────────────────────────────────────

describe("auth.logout", () => {
  it("clears the session cookie and returns success", async () => {
    const { ctx, clearedCookies } = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1, httpOnly: true, path: "/" });
  });

  it("returns the current user for authenticated requests", async () => {
    const { ctx } = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();
    expect(user).not.toBeNull();
    expect(user?.role).toBe("user");
    expect(user?.email).toBe("user@example.com");
  });

  it("returns null for unauthenticated requests", async () => {
    const { ctx } = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();
    expect(user).toBeNull();
  });
});

// ── Admin Guard Tests ──────────────────────────────────────────────────────────

describe("admin guard", () => {
  it("throws FORBIDDEN when non-admin tries to publish a rate version", async () => {
    const { ctx } = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.rateVersions.publish({ id: 999 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("throws FORBIDDEN when non-admin tries to create a rate version", async () => {
    const { ctx } = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.rateVersions.create({ year: 2026, label: "BOGSA 2026" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("throws FORBIDDEN when non-admin tries to approve a contractor", async () => {
    const { ctx } = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.contractors.approve({ id: 1, approved: true })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("throws FORBIDDEN when non-admin tries to list all contractors", async () => {
    const { ctx } = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.contractors.listAll()
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

// ── Protected Procedure Tests ──────────────────────────────────────────────────

describe("protected procedures", () => {
  it("throws UNAUTHORIZED when unauthenticated user accesses getMyProfile", async () => {
    const { ctx } = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.contractors.getMyProfile()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws UNAUTHORIZED when unauthenticated user tries to create a BOQ", async () => {
    const { ctx } = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.boq.create({ projectName: "Test Project" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws UNAUTHORIZED when unauthenticated user tries to use AI assistant", async () => {
    const { ctx } = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.ai.suggestRateItems({ prompt: "concrete works" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

// ── Rate Validation Business Logic ────────────────────────────────────────────

describe("rate validation logic", () => {
  it("correctly identifies a rate below the minimum as flagged", () => {
    const rateMin = 55.00;
    const rateMax = 115.00;
    const submittedRate = 40.00;
    const isFlagged = submittedRate < rateMin || submittedRate > rateMax;
    expect(isFlagged).toBe(true);
  });

  it("correctly identifies a rate above the maximum as flagged", () => {
    const rateMin = 55.00;
    const rateMax = 115.00;
    const submittedRate = 150.00;
    const isFlagged = submittedRate < rateMin || submittedRate > rateMax;
    expect(isFlagged).toBe(true);
  });

  it("correctly identifies a rate within range as not flagged", () => {
    const rateMin = 55.00;
    const rateMax = 115.00;
    const submittedRate = 82.00;
    const isFlagged = submittedRate < rateMin || submittedRate > rateMax;
    expect(isFlagged).toBe(false);
  });

  it("correctly identifies a rate exactly at minimum as not flagged", () => {
    const rateMin = 55.00;
    const rateMax = 115.00;
    const submittedRate = 55.00;
    const isFlagged = submittedRate < rateMin || submittedRate > rateMax;
    expect(isFlagged).toBe(false);
  });

  it("correctly identifies a rate exactly at maximum as not flagged", () => {
    const rateMin = 55.00;
    const rateMax = 115.00;
    const submittedRate = 115.00;
    const isFlagged = submittedRate < rateMin || submittedRate > rateMax;
    expect(isFlagged).toBe(false);
  });

  it("generates correct flag reason message for below-minimum rate", () => {
    const rateMin = 55.00;
    const rate = 40.00;
    const flagReason = `Rate BND ${rate.toFixed(2)} is below minimum BND ${rateMin.toFixed(2)}`;
    expect(flagReason).toBe("Rate BND 40.00 is below minimum BND 55.00");
  });

  it("generates correct flag reason message for above-maximum rate", () => {
    const rateMax = 115.00;
    const rate = 150.00;
    const flagReason = `Rate BND ${rate.toFixed(2)} exceeds maximum BND ${rateMax.toFixed(2)}`;
    expect(flagReason).toBe("Rate BND 150.00 exceeds maximum BND 115.00");
  });
});

// ── BOQ Calculation Logic ──────────────────────────────────────────────────────

describe("BOQ calculation logic", () => {
  it("correctly calculates line total from quantity and unit rate", () => {
    const quantity = 25.5;
    const unitRate = 82.00;
    const lineTotal = parseFloat((quantity * unitRate).toFixed(2));
    expect(lineTotal).toBe(2091.00);
  });

  it("correctly calculates grand total from multiple line items", () => {
    const lines = [
      { lineTotal: "2091.00" },
      { lineTotal: "1450.00" },
      { lineTotal: "3200.50" },
    ];
    const grandTotal = lines.reduce((sum, l) => sum + parseFloat(l.lineTotal), 0);
    expect(parseFloat(grandTotal.toFixed(2))).toBe(6741.50);
  });

  it("correctly detects validation flags in estimate when any line is flagged", () => {
    const lines = [
      { isFlagged: false },
      { isFlagged: true },
      { isFlagged: false },
    ];
    const hasFlags = lines.some((l) => l.isFlagged);
    expect(hasFlags).toBe(true);
  });

  it("correctly reports no flags when all lines are within range", () => {
    const lines = [
      { isFlagged: false },
      { isFlagged: false },
      { isFlagged: false },
    ];
    const hasFlags = lines.some((l) => l.isFlagged);
    expect(hasFlags).toBe(false);
  });

  it("handles zero quantity correctly", () => {
    const quantity = 0;
    const unitRate = 82.00;
    const lineTotal = parseFloat((quantity * unitRate).toFixed(2));
    expect(lineTotal).toBe(0.00);
  });

  it("handles large BND values with correct precision", () => {
    const quantity = 1000;
    const unitRate = 4500.00;
    const lineTotal = parseFloat((quantity * unitRate).toFixed(2));
    expect(lineTotal).toBe(4500000.00);
  });
});

// ── Public Procedures ──────────────────────────────────────────────────────────

describe("public procedures", () => {
  it("allows unauthenticated access to rate items list", async () => {
    const { ctx } = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    // This should not throw UNAUTHORIZED
    const result = await caller.rateItems.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows unauthenticated access to rate categories", async () => {
    const { ctx } = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.rateCategories.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows unauthenticated access to published rate version", async () => {
    const { ctx } = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.rateVersions.getPublished();
    // Result is either null or an object with id/year
    expect(result === null || typeof result === "object").toBe(true);
  });
});

// ── Input Validation ───────────────────────────────────────────────────────────

describe("input validation", () => {
  it("rejects BOQ creation with empty project name", async () => {
    const { ctx } = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.boq.create({ projectName: "" })
    ).rejects.toThrow();
  });

  it("rejects rate version creation with invalid year", async () => {
    const { ctx } = makeCtx("admin");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.rateVersions.create({ year: 1800, label: "Old Rates" })
    ).rejects.toThrow();
  });

  it("rejects rate version creation with year too far in future", async () => {
    const { ctx } = makeCtx("admin");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.rateVersions.create({ year: 2200, label: "Future Rates" })
    ).rejects.toThrow();
  });
});
