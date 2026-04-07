import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const DEFAULT_CURRENCIES = ["KRW", "USD", "CAD", "EUR", "JPY"];

export const getCurrencies = query({
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "currencies"))
      .first();
    if (!setting) return DEFAULT_CURRENCIES;
    return JSON.parse(setting.value) as string[];
  },
});

export const setCurrencies = mutation({
  args: { currencies: v.array(v.string()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "currencies"))
      .first();
    const value = JSON.stringify(args.currencies);
    if (existing) {
      await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert("settings", { key: "currencies", value });
    }
  },
});
