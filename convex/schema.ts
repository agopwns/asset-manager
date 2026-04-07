import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ===== Snapsheet 기존 테이블 (건드리지 않음) =====
  categories: defineTable({
    name: v.string(),
    order: v.number(),
  }).index("by_order", ["order"]),

  presets: defineTable({
    itemName: v.string(),
    category: v.string(),
    expenseType: v.string(),
    currency: v.string(),
    amount: v.number(),
    exchangeRate: v.number(),
    krwAmount: v.number(),
    paymentMethod: v.string(),
    region: v.string(),
  }),

  recurringTemplates: defineTable({
    itemName: v.string(),
    category: v.string(),
    expenseType: v.string(),
    currency: v.string(),
    amount: v.number(),
    exchangeRate: v.number(),
    krwAmount: v.number(),
    paymentMethod: v.string(),
    region: v.string(),
    dayOfMonth: v.number(),
  }),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  receipts: defineTable({
    date: v.string(),
    region: v.string(),
    isRecurring: v.boolean(),
    itemName: v.string(),
    category: v.string(),
    details: v.string(),
    amount: v.number(),
    currency: v.string(),
    expenseType: v.string(),
    exchangeRate: v.number(),
    krwAmount: v.number(),
    paymentMethod: v.string(),
    imageId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
  }).index("by_date", ["date"]),

  // ===== Asset Manager 테이블 =====

  // 계좌 정보
  accounts: defineTable({
    broker: v.string(), // "삼성증권", "토스뱅크"
    name: v.string(), // "ISA", "일반 위탁", "CMA"
    accountNumber: v.string(), // "1234-5678-9012"
    accountType: v.string(), // "general", "isa", "irp", "pension", "cma", "crypto"
    currency: v.string(), // "KRW", "USD"
    memo: v.optional(v.string()),
  }).index("by_broker", ["broker"]),

  // 초기 자산 스냅샷 (계좌별 최초 1회 임포���)
  snapshots: defineTable({
    accountId: v.id("accounts"), // 계좌 참조
    asset: v.string(), // "TSLA", "삼성전자"
    assetType: v.string(), // "stock_us", "stock_kr", "cash", "crypto"
    quantity: v.number(),
    totalCost: v.number(), // 총 매입금액
    currentValue: v.number(), // ���냅샷 ���점 평가금액
    currency: v.string(),
    date: v.string(), // "2026-04-06"
  })
    .index("by_account", ["accountId"])
    .index("by_asset", ["asset"])
    .index("by_date", ["date"]),

  // 거��� 로그 (스냅샷 이후 실제 매매)
  assetTransactions: defineTable({
    type: v.union(v.literal("BUY"), v.literal("SELL"), v.literal("DIVIDEND")),
    accountId: v.id("accounts"), // 계좌 참조
    asset: v.string(),
    assetType: v.string(),
    quantity: v.number(),
    price: v.number(), // 단가
    totalAmount: v.number(), // quantity × price
    currency: v.string(),
    date: v.string(),
    memo: v.optional(v.string()),
  })
    .index("by_account", ["accountId"])
    .index("by_asset", ["asset"])
    .index("by_date", ["date"]),
});
