"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const TRANSACTION_TYPES = [
  { value: "BUY" as const, label: "매수", color: "text-green-500" },
  { value: "SELL" as const, label: "매도", color: "text-red-500" },
  { value: "DIVIDEND" as const, label: "배당", color: "text-blue-500" },
];

const ASSET_TYPES = [
  { value: "stock_us", label: "미국주식/ETF" },
  { value: "stock_kr", label: "한국주식/ETF" },
  { value: "cash", label: "현금" },
  { value: "crypto", label: "크립토" },
];

interface TxForm {
  type: "BUY" | "SELL" | "DIVIDEND";
  accountId: string;
  asset: string;
  assetType: string;
  quantity: string;
  price: string;
  currency: string;
  date: string;
  memo: string;
}

const emptyForm: TxForm = {
  type: "BUY",
  accountId: "",
  asset: "",
  assetType: "stock_kr",
  quantity: "",
  price: "",
  currency: "KRW",
  date: new Date().toISOString().split("T")[0],
  memo: "",
};

export default function TransactionsPage() {
  const [form, setForm] = useState<TxForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const transactions = useQuery(api.assetTransactions.list);
  const accounts = useQuery(api.accounts.list);
  const currencies = useQuery(api.settings.getCurrencies) || ["KRW", "USD"];
  const createTx = useMutation(api.assetTransactions.create);

  const accountMap = new Map((accounts || []).map((a) => [a._id, a]));

  const updateField = (field: keyof TxForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.accountId || !form.asset || !form.quantity || !form.price) return;
    setSaving(true);
    const qty = Number(form.quantity);
    const price = Number(form.price);
    await createTx({
      type: form.type,
      accountId: form.accountId as Id<"accounts">,
      asset: form.asset,
      assetType: form.assetType,
      quantity: qty,
      price: price,
      totalAmount: qty * price,
      currency: form.currency,
      date: form.date,
      memo: form.memo || undefined,
    });
    setForm(emptyForm);
    setShowForm(false);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">거래 기록</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "취소" : "+ 거래 추가"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">새 거래 등록</CardTitle>
          </CardHeader>
          <CardContent>
            {!accounts || accounts.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                먼저 계좌 관리 페이지에서 계좌를 등록해주세요.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>거래유형</Label>
                    <select
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      value={form.type}
                      onChange={(e) => updateField("type", e.target.value)}
                    >
                      {TRANSACTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Label>계좌</Label>
                    <select
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      value={form.accountId}
                      onChange={(e) => updateField("accountId", e.target.value)}
                    >
                      <option value="">선택</option>
                      {accounts.map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.broker} · {a.name} ({a.accountNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>자산명</Label>
                    <Input
                      placeholder="TSLA"
                      value={form.asset}
                      onChange={(e) => updateField("asset", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>자산유형</Label>
                    <select
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      value={form.assetType}
                      onChange={(e) => updateField("assetType", e.target.value)}
                    >
                      {ASSET_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>수량</Label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={form.quantity}
                      onChange={(e) => updateField("quantity", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>단가</Label>
                    <Input
                      type="number"
                      placeholder="50000"
                      value={form.price}
                      onChange={(e) => updateField("price", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>통화</Label>
                    <select
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      value={form.currency}
                      onChange={(e) => updateField("currency", e.target.value)}
                    >
                      {currencies.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>날짜</Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => updateField("date", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>메모 (선택)</Label>
                    <Input
                      placeholder="메모"
                      value={form.memo}
                      onChange={(e) => updateField("memo", e.target.value)}
                    />
                  </div>
                </div>
                {form.quantity && form.price && (
                  <p className="text-sm text-muted-foreground mt-2">
                    총 금액:{" "}
                    {(
                      Number(form.quantity) * Number(form.price)
                    ).toLocaleString()}{" "}
                    {form.currency}
                  </p>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="mt-4"
                >
                  {saving ? "저장 중..." : "저장"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">거래 내역</CardTitle>
          <CardDescription>
            {transactions?.length || 0}건의 거래 기록
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              아직 거래 기록이 없습니다
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-left">
                    <th className="pb-2">날짜</th>
                    <th className="pb-2">유형</th>
                    <th className="pb-2">자산</th>
                    <th className="pb-2">계좌</th>
                    <th className="pb-2 text-right">수량</th>
                    <th className="pb-2 text-right">단가</th>
                    <th className="pb-2 text-right">총액</th>
                    <th className="pb-2">메모</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const typeInfo = TRANSACTION_TYPES.find(
                      (t) => t.value === tx.type,
                    );
                    const account = accountMap.get(tx.accountId);
                    return (
                      <tr key={tx._id} className="border-b border-border/50">
                        <td className="py-2 text-muted-foreground">
                          {tx.date}
                        </td>
                        <td className="py-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${typeInfo?.color}`}
                          >
                            {typeInfo?.label || tx.type}
                          </Badge>
                        </td>
                        <td className="py-2 font-medium">{tx.asset}</td>
                        <td className="py-2 text-muted-foreground text-xs">
                          {account
                            ? `${account.broker} · ${account.name}`
                            : "알 수 없음"}
                        </td>
                        <td className="py-2 text-right font-mono">
                          {tx.quantity.toLocaleString()}
                        </td>
                        <td className="py-2 text-right font-mono">
                          {tx.price.toLocaleString()} {tx.currency}
                        </td>
                        <td className="py-2 text-right font-mono">
                          {tx.totalAmount.toLocaleString()} {tx.currency}
                        </td>
                        <td className="py-2 text-muted-foreground">
                          {tx.memo || "-"}
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
