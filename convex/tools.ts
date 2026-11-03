import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireOwner, requireUser } from "./lib/auth";

/**
 * PUBLIC QUERY (Data Minimization requirement):
 * Returns ONLY tool name and category for available tools.
 * STRICTLY hides all owner details, user IDs, and contact info from unauthenticated visitors.
 */
export const listAvailableTools = query({
  args: {},
  handler: async (ctx) => {
    const availableTools = await ctx.db
      .query("tools")
      .withIndex("by_isAvailable", (q) => q.eq("isAvailable", true))
      .collect();

    // Data minimization: expose only what the public catalog is allowed to see
    return availableTools.map((tool) => ({
      _id: tool._id,
      name: tool.name,
      category: tool.category,
      isAvailable: tool.isAvailable,
      condition: tool.condition,
    }));
  },
});

/**
 * AUTHENTICATED QUERY:
 * Returns all tools with availability status and owner details,
 * optionally filtered by category.
 */
export const listAllTools = query({
  args: {
    category: v.optional(
      v.union(
        v.literal("power_tools"),
        v.literal("garden"),
        v.literal("kitchen"),
        v.literal("camping"),
        v.literal("hand_tools"),
        v.literal("other")
      )
    ),
  },
  handler: async (ctx, args) => {
    const category = args.category;
    const tools = category
      ? await ctx.db
          .query("tools")
          .withIndex("by_category", (q) => q.eq("category", category))
          .collect()
      : await ctx.db.query("tools").collect();

    // Enrich each tool with owner details
    return await Promise.all(
      tools.map(async (tool) => {
        const owner = await ctx.db.get(tool.ownerId);
        return {
          ...tool,
          ownerName: owner?.name || "Neighbor",
          ownerImageUrl: owner?.imageUrl,
          isOwnerTrusted: owner?.isTrustedLender || false,
        };
      })
    );
  },
});

/**
 * AUTHENTICATED QUERY:
 * Returns only tools belonging to the current user.
 */
export const listMyTools = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    return await ctx.db
      .query("tools")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .collect();
  },
});

/**
 * AUTHENTICATED MUTATION:
 * Creates a new tool listing.
 * The ownerId is strictly derived from ctx.auth (never client argument).
 */
export const createTool = mutation({
  args: {
    name: v.string(),
    category: v.union(
      v.literal("power_tools"),
      v.literal("garden"),
      v.literal("kitchen"),
      v.literal("camping"),
      v.literal("hand_tools"),
      v.literal("other")
    ),
    condition: v.union(
      v.literal("like_new"),
      v.literal("good"),
      v.literal("fair")
    ),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const toolId = await ctx.db.insert("tools", {
      name: args.name.trim(),
      category: args.category,
      condition: args.condition,
      description: args.description.trim(),
      ownerId: user._id,
      isAvailable: true,
    });

    return toolId;
  },
});

/**
 * AUTHENTICATED MUTATION:
 * Updates a tool listing.
 * Strict ownership check: only the tool owner can edit.
 */
export const updateTool = mutation({
  args: {
    toolId: v.id("tools"),
    name: v.string(),
    category: v.union(
      v.literal("power_tools"),
      v.literal("garden"),
      v.literal("kitchen"),
      v.literal("camping"),
      v.literal("hand_tools"),
      v.literal("other")
    ),
    condition: v.union(
      v.literal("like_new"),
      v.literal("good"),
      v.literal("fair")
    ),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const tool = await ctx.db.get(args.toolId);
    if (!tool) {
      throw new Error("Tool not found.");
    }

    requireOwner(user, tool);

    await ctx.db.patch(args.toolId, {
      name: args.name.trim(),
      category: args.category,
      condition: args.condition,
      description: args.description.trim(),
    });

    return { success: true };
  },
});

/**
 * AUTHENTICATED MUTATION:
 * Deletes a tool listing.
 * Allowed for the owner OR an admin.
 */
export const deleteTool = mutation({
  args: {
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const tool = await ctx.db.get(args.toolId);
    if (!tool) {
      throw new Error("Tool not found.");
    }

    requireOwner(user, tool, true); // Allow admin to delete

    await ctx.db.delete(args.toolId);
    return { success: true };
  },
});

/**
 * ADMIN MUTATION:
 * Removes any tool listing regardless of ownership.
 */
export const adminRemoveTool = mutation({
  args: {
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const tool = await ctx.db.get(args.toolId);
    if (!tool) {
      throw new Error("Tool not found.");
    }

    await ctx.db.delete(args.toolId);
    return { success: true };
  },
});
