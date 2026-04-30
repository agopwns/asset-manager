import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 환율/시세/통화 캐시
  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  // 계좌 정보
  accounts: defineTable({
    broker: v.string(), // "삼성증권", "토스뱅크"
    name: v.string(), // "ISA", "일반 위탁", "CMA"
    accountNumber: v.string(), // "1234-5678-9012"
    accountType: v.string(), // "general", "isa", "irp", "pension", "cma", "crypto"
    currency: v.string(), // "KRW", "USD"
    memo: v.optional(v.string()),
  }).index("by_broker", ["broker"]),

  // 초기 자산 스냅샷 (계좌별 최초 1회 임포트)
  snapshots: defineTable({
    accountId: v.id("accounts"),
    asset: v.string(), // "TSLA", "삼성전자"
    assetType: v.string(), // "stock_us", "stock_kr", "cash", "crypto"
    quantity: v.number(),
    totalCost: v.number(),
    currentValue: v.number(),
    currency: v.string(),
    date: v.string(), // "2026-04-06"
  })
    .index("by_account", ["accountId"])
    .index("by_asset", ["asset"])
    .index("by_date", ["date"]),

  // 거래 로그 (스냅샷 이후 실제 매매)
  assetTransactions: defineTable({
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
  })
    .index("by_account", ["accountId"])
    .index("by_asset", ["asset"])
    .index("by_date", ["date"]),
});
