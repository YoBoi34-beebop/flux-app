import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import {
  addBOQLineItem,
  approveContractor,
  createBOQEstimate,
  createRateCategory,
  createRateItem,
  createRateVersion,
  deleteBOQEstimate,
  deleteRateItem,
  getAllContractors,
  getBOQEstimateById,
  getBOQEstimates,
  getBOQLineItems,
  getContractorProfile,
  getPublishedVersion,
  getRateCategories,
  getRateItems,
  getRateVersions,
  publishRateVersion,
  removeBOQLineItem,
  updateBOQEstimate,
  updateBOQLineItem,
  updateRateItem,
  upsertContractorProfile,
  upsertUser,
} from "./db";

// Admin guard
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Contractors ──────────────────────────────────────────────────────────
  contractors: router({
    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      return getContractorProfile(ctx.user.id);
    }),

    upsertProfile: protectedProcedure
      .input(z.object({
        companyName: z.string().min(1),
        cidbNumber: z.string().optional(),
        ogpcNumber: z.string().optional(),
        cidbGrade: z.string().optional(),
        ogpcCategory: z.string().optional(),
        contactPerson: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await upsertContractorProfile({ userId: ctx.user.id, ...input, companyName: input.companyName });
        return { success: true };
      }),

    listAll: adminProcedure.query(async () => {
      return getAllContractors();
    }),

    approve: adminProcedure
      .input(z.object({ id: z.number(), approved: z.boolean() }))
      .mutation(async ({ input }) => {
        await approveContractor(input.id, input.approved);
        return { success: true };
      }),

    revoke: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await approveContractor(input.id, false);
        return { success: true };
      }),
  }),

  // ── Rate Versions ─────────────────────────────────────────────────────────
  rateVersions: router({
    list: publicProcedure.query(async () => {
      return getRateVersions();
    }),

    getPublished: publicProcedure.query(async () => {
      return getPublishedVersion();
    }),

    create: adminProcedure
      .input(z.object({ year: z.number().min(2000).max(2100), label: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const id = await createRateVersion({ year: input.year, label: input.label, status: "draft" });
        return { id };
      }),

    publish: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await publishRateVersion(input.id);
        return { success: true };
      }),
  }),

  // ── Rate Categories ───────────────────────────────────────────────────────
  rateCategories: router({
    list: publicProcedure
      .input(z.object({ trade: z.enum(["civil", "mechanical", "electrical", "piping"]).optional() }).optional())
      .query(async ({ input }) => {
        return getRateCategories(input?.trade);
      }),

    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        code: z.string().optional(),
        trade: z.enum(["civil", "mechanical", "electrical", "piping"]),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await createRateCategory(input);
        return { id };
      }),
  }),

  // ── Rate Items ────────────────────────────────────────────────────────────
  rateItems: router({
    list: publicProcedure
      .input(z.object({
        versionId: z.number().optional(),
        categoryId: z.number().optional(),
        trade: z.enum(["civil", "mechanical", "electrical", "piping"]).optional(),
        search: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        // If no versionId specified, use published version
        let versionId = input?.versionId;
        if (!versionId) {
          const published = await getPublishedVersion();
          versionId = published?.id;
        }
        return getRateItems({ ...input, versionId });
      }),

    create: adminProcedure
      .input(z.object({
        versionId: z.number(),
        categoryId: z.number().optional(),
        code: z.string().min(1),
        description: z.string().min(1),
        unit: z.string().min(1),
        rateMin: z.string(),
        rateStandard: z.string(),
        rateMax: z.string(),
        remarks: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const min = parseFloat(input.rateMin);
        const std = parseFloat(input.rateStandard);
        const max = parseFloat(input.rateMax);
        if (isNaN(min) || isNaN(std) || isNaN(max)) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid rate values" });
        if (min > std || std > max) throw new TRPCError({ code: "BAD_REQUEST", message: "Rate min ≤ standard ≤ max required" });
        const id = await createRateItem({
          versionId: input.versionId,
          categoryId: input.categoryId,
          code: input.code,
          description: input.description,
          unit: input.unit,
          rateMin: input.rateMin,
          rateStandard: input.rateStandard,
          rateMax: input.rateMax,
          remarks: input.remarks,
          sortOrder: input.sortOrder ?? 0,
        });
        return { id };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        description: z.string().optional(),
        unit: z.string().optional(),
        rateMin: z.string().optional(),
        rateStandard: z.string().optional(),
        rateMax: z.string().optional(),
        remarks: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateRateItem(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteRateItem(input.id);
        return { success: true };
      }),
  }),

  // ── BOQ Estimates ─────────────────────────────────────────────────────────
  boq: router({
    listMine: protectedProcedure.query(async ({ ctx }) => {
      return getBOQEstimates(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const estimate = await getBOQEstimateById(input.id);
        if (!estimate) throw new TRPCError({ code: "NOT_FOUND" });
        if (estimate.userId !== ctx.user.id && ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const lineItems = await getBOQLineItems(input.id);
        return { estimate, lineItems };
      }),

    create: protectedProcedure
      .input(z.object({
        projectName: z.string().min(1),
        projectRef: z.string().optional(),
        projectLocation: z.string().optional(),
        clientName: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const published = await getPublishedVersion();
        const id = await createBOQEstimate({
          userId: ctx.user.id,
          versionId: published?.id,
          projectName: input.projectName,
          projectRef: input.projectRef,
          projectLocation: input.projectLocation,
          clientName: input.clientName,
          description: input.description,
          status: "draft",
          grandTotal: "0.00",
          hasValidationFlags: false,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        projectName: z.string().optional(),
        projectRef: z.string().optional(),
        projectLocation: z.string().optional(),
        clientName: z.string().optional(),
        status: z.enum(["draft", "submitted", "approved"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const estimate = await getBOQEstimateById(input.id);
        if (!estimate) throw new TRPCError({ code: "NOT_FOUND" });
        if (estimate.userId !== ctx.user.id && ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const { id, ...data } = input;
        await updateBOQEstimate(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const estimate = await getBOQEstimateById(input.id);
        if (!estimate) throw new TRPCError({ code: "NOT_FOUND" });
        if (estimate.userId !== ctx.user.id && ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        await deleteBOQEstimate(input.id);
        return { success: true };
      }),

    addLineItem: protectedProcedure
      .input(z.object({
        estimateId: z.number(),
        rateItemId: z.number().optional(),
        itemCode: z.string(),
        description: z.string(),
        unit: z.string(),
        quantity: z.string(),
        unitRate: z.string(),
        rateMin: z.string().optional(),
        rateMax: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const estimate = await getBOQEstimateById(input.estimateId);
        if (!estimate) throw new TRPCError({ code: "NOT_FOUND" });
        if (estimate.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

        const qty = parseFloat(input.quantity);
        const rate = parseFloat(input.unitRate);
        const lineTotal = (qty * rate).toFixed(2);

        // Validate rate range
        const rateMin = input.rateMin ? parseFloat(input.rateMin) : null;
        const rateMax = input.rateMax ? parseFloat(input.rateMax) : null;
        let isFlagged = false;
        let flagReason: string | undefined;
        if (rateMin !== null && rate < rateMin) { isFlagged = true; flagReason = `Rate BND ${rate.toFixed(2)} is below minimum BND ${rateMin.toFixed(2)}`; }
        if (rateMax !== null && rate > rateMax) { isFlagged = true; flagReason = `Rate BND ${rate.toFixed(2)} exceeds maximum BND ${rateMax.toFixed(2)}`; }

        const id = await addBOQLineItem({
          estimateId: input.estimateId,
          rateItemId: input.rateItemId,
          itemCode: input.itemCode,
          description: input.description,
          unit: input.unit,
          quantity: input.quantity,
          unitRate: input.unitRate,
          lineTotal,
          rateMin: input.rateMin,
          rateMax: input.rateMax,
          isFlagged,
          flagReason,
          sortOrder: 0,
        });
        return { id };
      }),

    updateLineItem: protectedProcedure
      .input(z.object({
        id: z.number(),
        estimateId: z.number(),
        quantity: z.string().optional(),
        unitRate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const estimate = await getBOQEstimateById(input.estimateId);
        if (!estimate) throw new TRPCError({ code: "NOT_FOUND" });
        if (estimate.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
        await updateBOQLineItem(input.id, input.estimateId, { quantity: input.quantity, unitRate: input.unitRate });
        return { success: true };
      }),

    removeLineItem: protectedProcedure
      .input(z.object({ id: z.number(), estimateId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const estimate = await getBOQEstimateById(input.estimateId);
        if (!estimate) throw new TRPCError({ code: "NOT_FOUND" });
        if (estimate.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
        await removeBOQLineItem(input.id, input.estimateId);
        return { success: true };
      }),
  }),

  // ── AI Assistant ──────────────────────────────────────────────────────────
  ai: router({
    suggestRateItems: protectedProcedure
      .input(z.object({ scopeDescription: z.string().min(5) }))
      .mutation(async ({ input }) => {
        // Get all rate items from published version
        const published = await getPublishedVersion();
        if (!published) return [];
        const allItems = await getRateItems({ versionId: published.id, limit: 500 });

        // Build a concise list for the LLM
        const itemList = allItems.slice(0, 200).map((item) =>
          `${item.code} | ${item.description} | ${item.unit} | BND ${parseFloat(item.rateStandard as string).toFixed(2)} | trade:${item.category?.trade ?? "unknown"}`
        ).join("\n");

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a Brunei engineering BOQ assistant. Given a work scope description, identify the most relevant BOGSA rate items from the provided list.
Return a JSON array of item codes (max 10) that best match the described work scope.
Only return codes that exist in the provided list.
Format: {"codes": ["CODE1", "CODE2", ...]}`,
            },
            {
              role: "user",
              content: `Work scope: ${input.scopeDescription}\n\nAvailable rate items:\n${itemList}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "rate_suggestions",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  codes: { type: "array", items: { type: "string" } },
                },
                required: ["codes"],
                additionalProperties: false,
              },
            },
          },
        });

          const rawContent = response.choices[0]?.message?.content;
          const content = typeof rawContent === 'string' ? rawContent : null;
        if (!content) return [];
        try {
          const parsed = JSON.parse(content) as { codes: string[] };
          const codes = parsed.codes ?? [];
          return allItems.filter((item) => codes.includes(item.code));
        } catch {
          return [];
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
