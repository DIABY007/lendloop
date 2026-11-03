import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin")),
    isTrustedLender: v.boolean(),
  })
    .index("by_clerkId", ["clerkId"]),

  tools: defineTable({
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
    ownerId: v.id("users"),
    isAvailable: v.boolean(),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_category", ["category"])
    .index("by_isAvailable", ["isAvailable"]),

  borrowRequests: defineTable({
    toolId: v.id("tools"),
    borrowerId: v.id("users"),
    lenderId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("declined"),
      v.literal("returned"),
      v.literal("overdue")
    ),
    startDate: v.string(),
    endDate: v.string(),
    requestedAt: v.number(),
    respondedAt: v.optional(v.number()),
    returnedAt: v.optional(v.number()),
  })
    .index("by_toolId", ["toolId"])
    .index("by_borrowerId", ["borrowerId"])
    .index("by_lenderId", ["lenderId"])
    .index("by_status", ["status"]),

  automationLogs: defineTable({
    borrowRequestId: v.id("borrowRequests"),
    type: v.union(v.literal("notification"), v.literal("reminder")),
    message: v.string(),
    sentAt: v.number(),
    idempotencyKey: v.string(),
  })
    .index("by_idempotencyKey", ["idempotencyKey"])
    .index("by_borrowRequestId", ["borrowRequestId"]),
});
