import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

/**
 * Records an automation log entry (e.g. from an n8n webhook or reminder run).
 * IDEMPOTENT: Uses idempotencyKey to ensure repeated calls do not create duplicates.
 */
export const recordLog = internalMutation({
  args: {
    borrowRequestId: v.id("borrowRequests"),
    type: v.union(v.literal("notification"), v.literal("reminder")),
    message: v.string(),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    // Idempotency check: see if a log with this key already exists
    const existing = await ctx.db
      .query("automationLogs")
      .withIndex("by_idempotencyKey", (q) => q.eq("idempotencyKey", args.idempotencyKey))
      .first();

    if (existing) {
      console.log(`[idempotency] Log already recorded for key ${args.idempotencyKey}. Skipping duplicate.`);
      return { status: "already_recorded", logId: existing._id };
    }

    const logId = await ctx.db.insert("automationLogs", {
      borrowRequestId: args.borrowRequestId,
      type: args.type,
      message: args.message,
      sentAt: Date.now(),
      idempotencyKey: args.idempotencyKey,
    });

    // If a reminder was sent for an overdue loan, ensure the status is tagged as overdue
    if (args.type === "reminder") {
      const loan = await ctx.db.get(args.borrowRequestId);
      if (loan && loan.status === "approved") {
        await ctx.db.patch(args.borrowRequestId, { status: "overdue" });
      }
    }

    return { status: "recorded", logId };
  },
});

/**
 * Queries the automation logs for a specific borrow request.
 */
export const getLogsForRequest = query({
  args: {
    borrowRequestId: v.id("borrowRequests"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("automationLogs")
      .withIndex("by_borrowRequestId", (q) => q.eq("borrowRequestId", args.borrowRequestId))
      .order("desc")
      .collect();
  },
});
