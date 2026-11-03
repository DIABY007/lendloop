import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { requireAdmin, requireIdentity, requireUser } from "./lib/auth";

/**
 * Ensures the currently authenticated Clerk user exists in Convex.
 * If the user does not exist yet, creates them with default role "user".
 * If they do exist, updates their profile info if changed.
 */
export const ensureUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    const name =
      identity.name ||
      identity.givenName ||
      identity.nickname ||
      args.name ||
      "Neighbor";
    const email =
      identity.email ||
      args.email ||
      "no-email@lendloop.local";
    const imageUrl =
      identity.pictureUrl ||
      args.imageUrl;

    if (!existingUser) {
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        name,
        email,
        imageUrl,
        role: "user",
        isTrustedLender: false,
      });
      return await ctx.db.get(userId);
    }

    // Update profile if changed
    if (
      existingUser.name !== name ||
      existingUser.email !== email ||
      existingUser.imageUrl !== imageUrl
    ) {
      await ctx.db.patch(existingUser._id, {
        name,
        email,
        imageUrl,
      });
      return await ctx.db.get(existingUser._id);
    }

    return existingUser;
  },
});

export const backfillUsers = internalMutation({
  args: {
    users: v.array(
      v.object({
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        imageUrl: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const u of args.users) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", u.clerkId))
        .first();
      if (user) {
        await ctx.db.patch(user._id, {
          name: u.name,
          email: u.email,
          imageUrl: u.imageUrl || user.imageUrl,
        });
      }
    }
  },
});

/**
 * Returns the currently authenticated user's record from Convex, or null if logged out.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

/**
 * Admin mutation: updates another user's role.
 * Strictly requires admin privileges server-side.
 */
export const setRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const target = await ctx.db.get(args.userId);
    if (!target) {
      throw new Error("User not found.");
    }

    await ctx.db.patch(args.userId, { role: args.role });
    return { success: true, userId: target._id, newRole: args.role };
  },
});

/**
 * Admin: List all registered users.
 * Enforces requireAdmin server-side.
 */
export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("users").collect();
  },
});

/**
 * Admin: Award "Trusted Lender" status to a user.
 * Enforces requireAdmin server-side.
 */
export const markTrustedLender = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const target = await ctx.db.get(args.userId);
    if (!target) {
      throw new Error("Target user not found.");
    }

    await ctx.db.patch(args.userId, { isTrustedLender: true });
    return { success: true };
  },
});

/**
 * Admin: Remove "Trusted Lender" status from a user.
 * Enforces requireAdmin server-side.
 */
export const removeTrustedLender = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const target = await ctx.db.get(args.userId);
    if (!target) {
      throw new Error("Target user not found.");
    }

    await ctx.db.patch(args.userId, { isTrustedLender: false });
    return { success: true };
  },
});

/**
 * Internal mutation called by the Clerk webhook to sync user data.
 */
export const syncUserFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,
      role: "user",
      isTrustedLender: false,
    });
  },
});

/**
 * Internal mutation called by the Clerk webhook when a user is deleted.
 */
export const deleteUserFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
