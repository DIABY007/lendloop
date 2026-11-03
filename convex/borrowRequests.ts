import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin, requireUser } from "./lib/auth";

/**
 * Creates a borrow request for a tool for a given date range.
 * The borrower identity is strictly enforced server-side via ctx.auth.
 */
export const createBorrowRequest = mutation({
  args: {
    toolId: v.id("tools"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const tool = await ctx.db.get(args.toolId);
    if (!tool) {
      throw new Error("Tool not found.");
    }

    if (!tool.isAvailable) {
      throw new Error("This tool is currently not available for borrowing.");
    }

    if (tool.ownerId === user._id) {
      throw new Error("You cannot borrow your own tool.");
    }

    if (new Date(args.startDate) > new Date(args.endDate)) {
      throw new Error("End date must be after or equal to start date.");
    }

    const lender = await ctx.db.get(tool.ownerId);
    if (!lender) {
      throw new Error("Tool owner not found.");
    }

    const requestId = await ctx.db.insert("borrowRequests", {
      toolId: args.toolId,
      borrowerId: user._id,
      lenderId: tool.ownerId,
      status: "pending",
      startDate: args.startDate,
      endDate: args.endDate,
      requestedAt: Date.now(),
    });

    // Schedule asynchronous n8n webhook notification
    await ctx.scheduler.runAfter(0, internal.notifyN8n.dispatchRequestEvent, {
      requestId,
      eventType: "request_created",
      status: "pending",
      toolName: tool.name,
      borrowerName: user.name,
      borrowerEmail: user.email,
      lenderName: lender.name,
      lenderEmail: lender.email,
      startDate: args.startDate,
      endDate: args.endDate,
    });

    return requestId;
  },
});

/**
 * Approves a pending borrow request.
 * Strictly enforced: Only the tool owner (lender) can approve.
 */
export const approveRequest = mutation({
  args: {
    requestId: v.id("borrowRequests"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Borrow request not found.");
    }

    if (request.lenderId !== user._id) {
      throw new Error("Forbidden: Only the tool owner can approve this request.");
    }

    if (request.status !== "pending") {
      throw new Error(`Cannot approve a request with status "${request.status}".`);
    }

    const now = Date.now();
    await ctx.db.patch(args.requestId, {
      status: "approved",
      respondedAt: now,
    });

    // Mark tool as unavailable
    await ctx.db.patch(request.toolId, {
      isAvailable: false,
    });

    const [tool, borrower] = await Promise.all([
      ctx.db.get(request.toolId),
      ctx.db.get(request.borrowerId),
    ]);

    if (tool && borrower) {
      await ctx.scheduler.runAfter(0, internal.notifyN8n.dispatchRequestEvent, {
        requestId: args.requestId,
        eventType: "request_approved",
        status: "approved",
        toolName: tool.name,
        borrowerName: borrower.name,
        borrowerEmail: borrower.email,
        lenderName: user.name,
        lenderEmail: user.email,
        startDate: request.startDate,
        endDate: request.endDate,
      });
    }

    return { success: true };
  },
});

/**
 * Declines a pending borrow request.
 * Strictly enforced: Only the tool owner (lender) can decline.
 */
export const declineRequest = mutation({
  args: {
    requestId: v.id("borrowRequests"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Borrow request not found.");
    }

    if (request.lenderId !== user._id) {
      throw new Error("Forbidden: Only the tool owner can decline this request.");
    }

    if (request.status !== "pending") {
      throw new Error(`Cannot decline a request with status "${request.status}".`);
    }

    await ctx.db.patch(args.requestId, {
      status: "declined",
      respondedAt: Date.now(),
    });

    const [tool, borrower] = await Promise.all([
      ctx.db.get(request.toolId),
      ctx.db.get(request.borrowerId),
    ]);

    if (tool && borrower) {
      await ctx.scheduler.runAfter(0, internal.notifyN8n.dispatchRequestEvent, {
        requestId: args.requestId,
        eventType: "request_declined",
        status: "declined",
        toolName: tool.name,
        borrowerName: borrower.name,
        borrowerEmail: borrower.email,
        lenderName: user.name,
        lenderEmail: user.email,
        startDate: request.startDate,
        endDate: request.endDate,
      });
    }

    return { success: true };
  },
});

/**
 * Marks an active or overdue loan as returned.
 * Strictly enforced: Only the lender can confirm the return of their tool.
 */
export const markReturned = mutation({
  args: {
    requestId: v.id("borrowRequests"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Borrow request not found.");
    }

    if (request.lenderId !== user._id) {
      throw new Error("Forbidden: Only the tool owner can confirm return.");
    }

    if (request.status !== "approved" && request.status !== "overdue") {
      throw new Error(`Cannot mark as returned a loan with status "${request.status}".`);
    }

    await ctx.db.patch(args.requestId, {
      status: "returned",
      returnedAt: Date.now(),
    });

    // Make the tool available again
    await ctx.db.patch(request.toolId, {
      isAvailable: true,
    });

    const [tool, borrower] = await Promise.all([
      ctx.db.get(request.toolId),
      ctx.db.get(request.borrowerId),
    ]);

    if (tool && borrower) {
      await ctx.scheduler.runAfter(0, internal.notifyN8n.dispatchRequestEvent, {
        requestId: args.requestId,
        eventType: "loan_returned",
        status: "returned",
        toolName: tool.name,
        borrowerName: borrower.name,
        borrowerEmail: borrower.email,
        lenderName: user.name,
        lenderEmail: user.email,
        startDate: request.startDate,
        endDate: request.endDate,
      });
    }

    return { success: true };
  },
});

/**
 * Lists requests submitted by the current user (My Requests view).
 */
export const listMyRequests = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const requests = await ctx.db
      .query("borrowRequests")
      .withIndex("by_borrowerId", (q) => q.eq("borrowerId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      requests.map(async (req) => {
        const [tool, lender, logs] = await Promise.all([
          ctx.db.get(req.toolId),
          ctx.db.get(req.lenderId),
          ctx.db
            .query("automationLogs")
            .withIndex("by_borrowRequestId", (q) => q.eq("borrowRequestId", req._id))
            .order("desc")
            .take(3),
        ]);

        return {
          ...req,
          toolName: tool?.name || "Deleted tool",
          toolCategory: tool?.category || "other",
          lenderName: lender?.name || "Neighbor",
          lenderEmail: lender?.email || "",
          automationLogs: logs,
        };
      })
    );
  },
});

/**
 * Lists incoming requests on the current user's tools (Incoming Requests view).
 */
export const listIncomingRequests = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const requests = await ctx.db
      .query("borrowRequests")
      .withIndex("by_lenderId", (q) => q.eq("lenderId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      requests.map(async (req) => {
        const [tool, borrower, logs] = await Promise.all([
          ctx.db.get(req.toolId),
          ctx.db.get(req.borrowerId),
          ctx.db
            .query("automationLogs")
            .withIndex("by_borrowRequestId", (q) => q.eq("borrowRequestId", req._id))
            .order("desc")
            .take(3),
        ]);

        return {
          ...req,
          toolName: tool?.name || "Deleted tool",
          toolCategory: tool?.category || "other",
          borrowerName: borrower?.name || "Neighbor",
          borrowerEmail: borrower?.email || "",
          borrowerImageUrl: borrower?.imageUrl,
          automationLogs: logs,
        };
      })
    );
  },
});

/**
 * Admin view: Lists all loans in the platform.
 * Enforces requireAdmin.
 */
export const listAllLoans = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const loans = await ctx.db.query("borrowRequests").order("desc").collect();

    return await Promise.all(
      loans.map(async (loan) => {
        const [tool, borrower, lender] = await Promise.all([
          ctx.db.get(loan.toolId),
          ctx.db.get(loan.borrowerId),
          ctx.db.get(loan.lenderId),
        ]);

        return {
          ...loan,
          toolName: tool?.name || "Deleted tool",
          borrowerName: borrower?.name || "Neighbor",
          borrowerEmail: borrower?.email,
          lenderName: lender?.name || "Neighbor",
          lenderEmail: lender?.email,
        };
      })
    );
  },
});

/**
 * Internal query: Fetches overdue loans for n8n automated reminder workflow.
 * An approved loan is overdue if its endDate is in the past.
 */
export const getOverdueLoans = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const todayIso = now.toISOString().split("T")[0]; // YYYY-MM-DD

    const approvedLoans = await ctx.db
      .query("borrowRequests")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();

    const overdue = approvedLoans.filter((loan) => {
      return loan.endDate < todayIso;
    });

    return await Promise.all(
      overdue.map(async (loan) => {
        const [tool, borrower, lender] = await Promise.all([
          ctx.db.get(loan.toolId),
          ctx.db.get(loan.borrowerId),
          ctx.db.get(loan.lenderId),
        ]);

        const endDateObj = new Date(loan.endDate);
        const daysPastDue = Math.max(
          1,
          Math.floor((now.getTime() - endDateObj.getTime()) / (1000 * 60 * 60 * 24))
        );

        return {
          requestId: loan._id,
          toolName: tool?.name || "Equipment",
          borrowerName: borrower?.name || "Neighbor",
          borrowerEmail: borrower?.email || "",
          lenderName: lender?.name || "Neighbor",
          startDate: loan.startDate,
          endDate: loan.endDate,
          daysPastDue,
        };
      })
    );
  },
});
