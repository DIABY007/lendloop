import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

export type AuthContext = QueryCtx | MutationCtx;

/**
 * Ensures the caller is authenticated with Clerk.
 * Throws an unauthorized error if no identity is found.
 */
export async function requireIdentity(ctx: AuthContext) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized: Authentication required.");
  }
  return identity;
}

/**
 * Ensures the caller is authenticated and exists in the Convex users table.
 * Returns the Convex User document.
 */
export async function requireUser(ctx: AuthContext): Promise<Doc<"users">> {
  const identity = await requireIdentity(ctx);

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!user) {
    throw new Error("User record not found in database.");
  }

  return user;
}

/**
 * Ensures the caller has the "admin" role.
 * Throws a forbidden error otherwise.
 */
export async function requireAdmin(ctx: AuthContext): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (user.role !== "admin") {
    throw new Error("Forbidden: Administrator privileges required.");
  }
  return user;
}

/**
 * Verifies that the caller is the owner of a document (e.g. a tool).
 * Admins can optionally bypass ownership check if explicitly allowed.
 */
export function requireOwner(
  user: Doc<"users">,
  doc: { ownerId: Doc<"users">["_id"] },
  allowAdmin = false
) {
  if (allowAdmin && user.role === "admin") {
    return true;
  }
  if (doc.ownerId !== user._id) {
    throw new Error("Forbidden: You do not have permission to modify this resource.");
  }
  return true;
}
