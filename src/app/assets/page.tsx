"use client";

import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { fetchAllPrices } from "@/lib/prices";

const ASSET_TYPE_LABELS: Record<string, string> = {
  stock_us: "미국주식/ETF",
  stock_kr: "한국주식/ETF",
  cash: "현금",
  crypto: "크립토",
};

interface Account {
  _id: Id<"accounts">;
  broker: string;
  name: string;
  accountNumber: string;
  accountType: string;
}

interface Holding {
  key: string;
  asset: string;
  assetType: string;
  accountId: string;
  quantity: number;
  totalCost: number;
  currentValue: number;
  currency: string;
}

export default function AssetsPage() {
  const snapshots = useQuery(api.snapshots.list);
  const transactions = useQuery(api.assetTransactions.list);
  const accounts = useQuery(api.accounts.list);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceUpdatedAt, setPriceUpdatedAt] = useState<string | null>(null);

  if (!snapshots || !transactions || !accounts) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  const accountMap = new Map(accounts.map((a) => [a._id, a]));
  const baseHoldings = calculateHoldings(snapshots, transactions);

  const refreshPrices = async () => {
    if (baseHoldings.length === 0) return;
    setPriceLoading(true);
    try {
      const prices = await fetchAllPrices(baseHoldings);
      setLivePrices(prices);
      setPriceUpdatedAt(new Date().toLocaleTimeString("ko-KR"));
    } catch {
      // 실패 시 기존 값 유지
    } finally {
      setPriceLoading(false);
    }
  };

  const holdings = baseHoldings.map((h) => {
    const livePrice = livePrices[h.asset];
    if (livePrice && (h.assetType === "stock_us" || h.assetType === "crypto")) {
      return { ...h, currentValue: livePrice * h.quantity };
    }
    return h;
  });

  // 계좌별 그룹
  const byAccount = holdings.reduce(
    (acc, h) => {
      if (!acc[h.accountId]) acc[h.accountId] = [];
      acc[h.accountId].push(h);
      return acc;
    },
    {} as Record<string, Holding[]>,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">자산 목록</h2>
        <div className="flex items-center gap-2">
          {priceUpdatedAt && (
            <span className="text-xs text-muted-foreground">
              시세 {priceUpdatedAt}
            </span>
          )}
          <Button
            onClick={refreshPrices}
            variant="outline"
            size="sm"
            disabled={priceLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${priceLoading ? "animate-spin" : ""}`}
            />
            시세 갱신
          </Button>
        </div>
      </div>

      {holdings.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            등록된 자산이 없습니다. 임포트 페이지에서 자산을 추가해주세요.
          </CardContent>
        </Card>
      ) : (
        Object.entries(byAccount)
          .sort(
            ([, a], [, b]) =>
              b.reduce((s, h) => s + h.currentValue, 0) -
              a.reduce((s, h) => s + h.currentValue, 0),
          )
          .map(([accountId, assets]) => {
            const account = accountMap.get(accountId as Id<"accounts">);
            const accountTotal = assets.reduce((s, h) => s + h.currentValue, 0);
            return (
              <Card key={accountId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {account
                          ? `${account.broker} · ${account.name}`
                          : "알 수 없음"}
                      </CardTitle>
                      {account && (
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          {account.accountNumber}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">
                      합계: {formatCurrency(accountTotal, assets[0].currency)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-left">
                        <th className="pb-2">자산</th>
                        <th className="pb-2">유형</th>
                        <th className="pb-2 text-right">수량</th>
                        <th className="pb-2 text-right">평단가</th>
                        <th className="pb-2 text-right">투자금</th>
                        <th className="pb-2 text-right">평가금액</th>
                        <th className="pb-2 text-right">수익률</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets
                        .sort((a, b) => b.currentValue - a.currentValue)
                        .map((h) => {
                          const returnPct =
                            h.totalCost > 0
                              ? ((h.currentValue - h.totalCost) / h.totalCost) *
                                100
                              : 0;
                          return (
                            <tr
                              key={h.key}
                              className="border-b border-border/50"
                            >
                              <td className="py-2 font-medium">{h.asset}</td>
                              <td className="py-2">
                                <Badge variant="outline" className="text-xs">
                                  {ASSET_TYPE_LABELS[h.assetType] ||
                                    h.assetType}
                                </Badge>
                              </td>
                              <td className="py-2 text-right font-mono">
                                {h.quantity.toLocaleString()}
                              </td>
                              <td className="py-2 text-right font-mono">
                                {h.quantity > 0
                                  ? formatCurrency(
                                      h.totalCost / h.quantity,
                                      h.currency,
                                    )
                                  : "-"}
                              </td>
                              <td className="py-2 text-right font-mono">
                                {formatCurrency(h.totalCost, h.currency)}
                              </td>
                              <td className="py-2 text-right font-mono">
                                {formatCurrency(h.currentValue, h.currency)}
                              </td>
                              <td
                                className={`py-2 text-right font-mono ${returnPct >= 0 ? "text-green-500" : "text-red-500"}`}
                              >
                                {returnPct >= 0 ? "+" : ""}
                                {returnPct.toFixed(2)}%
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            );
          })
      )}
    </div>
  );
}

function calculateHoldings(
  snapshots: Array<{
    accountId: Id<"accounts">;
    asset: string;
    assetType: string;
    quantity: number;
    totalCost: number;
    currentValue: number;
    currency: string;
  }>,
  transactions: Array<{
    type: "BUY" | "SELL" | "DIVIDEND";
    accountId: Id<"accounts">;
    asset: string;
    assetType: string;
    quantity: number;
    price: number;
    totalAmount: number;
    currency: string;
  }>,
): Holding[] {
  const map = new Map<string, Holding>();

  for (const s of snapshots) {
    const key = `${s.accountId}:${s.asset}`;
    map.set(key, {
      key,
      asset: s.asset,
      assetType: s.assetType,
      accountId: s.accountId,
      quantity: s.quantity,
      totalCost: s.totalCost,
      currentValue: s.currentValue,
      currency: s.currency,
    });
  }

  for (const t of transactions) {
    const key = `${t.accountId}:${t.asset}`;
    const existing = map.get(key) || {
      key,
      asset: t.asset,
      assetType: t.assetType,
      accountId: t.accountId,
      quantity: 0,
      totalCost: 0,
      currentValue: 0,
      currency: t.currency,
    };

    if (t.type === "BUY") {
      existing.quantity += t.quantity;
      existing.totalCost += t.totalAmount;
      existing.currentValue += t.totalAmount;
    } else if (t.type === "SELL") {
      const avgCost =
        existing.quantity > 0 ? existing.totalCost / existing.quantity : 0;
      existing.quantity -= t.quantity;
      existing.totalCost -= avgCost * t.quantity;
      existing.currentValue -= avgCost * t.quantity;
    }

    map.set(key, existing);
  }

  return Array.from(map.values()).filter((h) => h.quantity > 0);
}
