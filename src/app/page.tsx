"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Dashboard() {
  const snapshots = useQuery(api.snapshots.list);
  const transactions = useQuery(api.assetTransactions.list);
  const accounts = useQuery(api.accounts.list);

  if (!snapshots || !transactions || !accounts) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  const accountMap = new Map(accounts.map((a) => [a._id, a]));
  const holdings = calculateHoldings(snapshots, transactions, accountMap);
  const totalValueKRW = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCostKRW = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalReturn =
    totalCostKRW > 0
      ? ((totalValueKRW - totalCostKRW) / totalCostKRW) * 100
      : 0;

  const byType = holdings.reduce(
    (acc, h) => {
      const label = ASSET_TYPE_LABELS[h.assetType] || h.assetType;
      acc[label] = (acc[label] || 0) + h.currentValue;
      return acc;
    },
    {} as Record<string, number>,
  );

  const byAccount = holdings.reduce(
    (acc, h) => {
      const label = `${h.broker} · ${h.accountName}`;
      acc[label] = (acc[label] || 0) + h.currentValue;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">대시보드</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>총 자산</CardDescription>
            <CardTitle className="text-2xl">
              {formatKRW(totalValueKRW)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>총 투자금</CardDescription>
            <CardTitle className="text-2xl">
              {formatKRW(totalCostKRW)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>총 수익률</CardDescription>
            <CardTitle
              className={`text-2xl ${totalReturn >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {totalReturn >= 0 ? "+" : ""}
              {totalReturn.toFixed(2)}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">자산유형별</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(byType).length === 0 ? (
              <p className="text-muted-foreground text-sm">
                데이터 임포트 후 표시됩니다
              </p>
            ) : (
              <div className="space-y-2">
                {Object.entries(byType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, value]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span>{type}</span>
                      <span className="font-mono">
                        {formatKRW(value)}
                        <span className="text-muted-foreground ml-2">
                          ({((value / totalValueKRW) * 100).toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">계좌별</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(byAccount).length === 0 ? (
              <p className="text-muted-foreground text-sm">
                데이터 임포트 후 표시됩니다
              </p>
            ) : (
              <div className="space-y-2">
                {Object.entries(byAccount)
                  .sort(([, a], [, b]) => b - a)
                  .map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span>{label}</span>
                      <span className="font-mono">
                        {formatKRW(value)}
                        <span className="text-muted-foreground ml-2">
                          ({((value / totalValueKRW) * 100).toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">보유 자산</CardTitle>
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              임포트 페이지에서 자산을 추가해주세요
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-left">
                    <th className="pb-2">자산</th>
                    <th className="pb-2">유형</th>
                    <th className="pb-2">계좌</th>
                    <th className="pb-2 text-right">수량</th>
                    <th className="pb-2 text-right">평단가</th>
                    <th className="pb-2 text-right">평가금액</th>
                    <th className="pb-2 text-right">수익률</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings
                    .sort((a, b) => b.currentValue - a.currentValue)
                    .map((h) => {
                      const returnPct =
                        h.totalCost > 0
                          ? ((h.currentValue - h.totalCost) / h.totalCost) * 100
                          : 0;
                      return (
                        <tr key={h.key} className="border-b border-border/50">
                          <td className="py-2 font-medium">{h.asset}</td>
                          <td className="py-2 text-muted-foreground">
                            {ASSET_TYPE_LABELS[h.assetType] || h.assetType}
                          </td>
                          <td className="py-2 text-muted-foreground text-xs">
                            {h.broker} · {h.accountName}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  stock_us: "미국주식/ETF",
  stock_kr: "한국주식/ETF",
  cash: "현금",
  crypto: "크립토",
};

interface Holding {
  key: string;
  asset: string;
  assetType: string;
  broker: string;
  accountName: string;
  quantity: number;
  totalCost: number;
  currentValue: number;
  currency: string;
}

interface Account {
  _id: Id<"accounts">;
  broker: string;
  name: string;
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
  accountMap: Map<Id<"accounts">, Account>,
): Holding[] {
  const map = new Map<string, Holding>();

  for (const s of snapshots) {
    const account = accountMap.get(s.accountId);
    const key = `${s.accountId}:${s.asset}`;
    map.set(key, {
      key,
      asset: s.asset,
      assetType: s.assetType,
      broker: account?.broker || "알 수 없음",
      accountName: account?.name || "알 수 없음",
      quantity: s.quantity,
      totalCost: s.totalCost,
      currentValue: s.currentValue,
      currency: s.currency,
    });
  }

  for (const t of transactions) {
    const account = accountMap.get(t.accountId);
    const key = `${t.accountId}:${t.asset}`;
    const existing = map.get(key) || {
      key,
      asset: t.asset,
      assetType: t.assetType,
      broker: account?.broker || "알 수 없음",
      accountName: account?.name || "알 수 없음",
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

function formatKRW(value: number): string {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억원`;
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만원`;
  return `${value.toLocaleString()}원`;
}

function formatCurrency(value: number, currency: string): string {
  if (currency === "KRW") return `${value.toLocaleString()}원`;
  if (currency === "USD") return `$${value.toLocaleString()}`;
  return `${value.toLocaleString()} ${currency}`;
}
