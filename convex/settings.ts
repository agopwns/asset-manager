import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const DEFAULT_CURRENCIES = ["KRW", "USD", "CAD", "EUR", "JPY"];

// --- 환율 ---

export const getExchangeRates = query({
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "exchangeRates"))
      .first();
    if (!setting) return null;
    return JSON.parse(setting.value) as {
      base: string;
      rates: Record<string, number>;
      updatedAt: string;
    };
  },
});

export const setExchangeRates = mutation({
  args: {
    base: v.string(),
    rates: v.any(),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const value = JSON.stringify({
      base: args.base,
      rates: args.rates,
      updatedAt: args.updatedAt,
    });
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "exchangeRates"))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert("settings", { key: "exchangeRates", value });
    }
  },
});

// --- 시세 캐시 ---

export const getPriceCache = query({
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "priceCache"))
      .first();
    if (!setting) return null;
    return JSON.parse(setting.value) as {
      prices: Record<string, number>;
      updatedAt: string;
    };
  },
});

export const setPriceCache = mutation({
  args: {
    prices: v.any(),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const value = JSON.stringify({
      prices: args.prices,
      updatedAt: args.updatedAt,
    });
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "priceCache"))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert("settings", { key: "priceCache", value });
    }
  },
});

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
