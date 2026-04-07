import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("assetTransactions").order("desc").collect();
  },
});

export const listByAsset = query({
  args: { asset: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assetTransactions")
      .withIndex("by_asset", (q) => q.eq("asset", args.asset))
      .collect();
  },
});

export const listByAccount = query({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assetTransactions")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .collect();
  },
});

export const create = mutation({
  args: {
    type: v.union(v.literal("BUY"), v.literal("SELL"), v.literal("DIVIDEND")),
    accountId: v.id("accounts"),
    asset: v.string(),
    assetType: v.string(),
    quantity: v.number(),
    price: v.number(),
    totalAmount: v.number(),
    currency: v.string(),
    date: v.string(),
    memo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("assetTransactions", args);
  },
});

export const remove = mutation({
  args: { id: v.id("assetTransactions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
