import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("snapshots").collect();
  },
});

export const listByAccount = query({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("snapshots")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .collect();
  },
});

export const create = mutation({
  args: {
    accountId: v.id("accounts"),
    asset: v.string(),
    assetType: v.string(),
    quantity: v.number(),
    totalCost: v.number(),
    currentValue: v.number(),
    currency: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("snapshots", args);
  },
});

export const createBatch = mutation({
  args: {
    items: v.array(
      v.object({
        accountId: v.id("accounts"),
        asset: v.string(),
        assetType: v.string(),
        quantity: v.number(),
        totalCost: v.number(),
        currentValue: v.number(),
        currency: v.string(),
        date: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const item of args.items) {
      const id = await ctx.db.insert("snapshots", item);
      ids.push(id);
    }
    return ids;
  },
});

export const update = mutation({
  args: {
    id: v.id("snapshots"),
    accountId: v.optional(v.id("accounts")),
    asset: v.optional(v.string()),
    assetType: v.optional(v.string()),
    quantity: v.optional(v.number()),
    totalCost: v.optional(v.number()),
    currentValue: v.optional(v.number()),
    currency: v.optional(v.string()),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("snapshots") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
