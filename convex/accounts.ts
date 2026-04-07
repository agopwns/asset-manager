import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("accounts").collect();
  },
});

export const create = mutation({
  args: {
    broker: v.string(),
    name: v.string(),
    accountNumber: v.string(),
    accountType: v.string(),
    currency: v.string(),
    memo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("accounts", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("accounts"),
    broker: v.optional(v.string()),
    name: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    accountType: v.optional(v.string()),
    currency: v.optional(v.string()),
    memo: v.optional(v.string()),
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
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
