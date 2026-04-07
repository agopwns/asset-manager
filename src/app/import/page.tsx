"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
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

const ASSET_TYPES = [
  { value: "stock_us", label: "미국주식/ETF" },
  { value: "stock_kr", label: "한국주식/ETF" },
  { value: "cash", label: "현금" },
  { value: "crypto", label: "크립토" },
];

interface SnapshotForm {
  accountId: string;
  asset: string;
  assetType: string;
  quantity: string;
  totalCost: string;
  currentValue: string;
  currency: string;
  date: string;
}

const emptyForm: SnapshotForm = {
  accountId: "",
  asset: "",
  assetType: "stock_kr",
  quantity: "",
  totalCost: "",
  currentValue: "",
  currency: "KRW",
  date: new Date().toISOString().split("T")[0],
};

export default function ImportPage() {
  const [form, setForm] = useState<SnapshotForm>(emptyForm);
  const [batchItems, setBatchItems] = useState<SnapshotForm[]>([]);
  const [saving, setSaving] = useState(false);

  const createSnapshot = useMutation(api.snapshots.create);
  const createBatch = useMutation(api.snapshots.createBatch);
  const snapshots = useQuery(api.snapshots.list);
  const accounts = useQuery(api.accounts.list);
  const currencies = useQuery(api.settings.getCurrencies) || ["KRW", "USD"];

  const accountMap = new Map((accounts || []).map((a) => [a._id, a]));

  const updateField = (field: keyof SnapshotForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addToBatch = () => {
    if (!form.accountId || !form.asset || !form.quantity) return;
    setBatchItems((prev) => [...prev, form]);
    setForm((prev) => ({
      ...emptyForm,
      accountId: prev.accountId,
      currency: prev.currency,
      date: prev.date,
      assetType: prev.assetType,
    }));
  };

  const removeFromBatch = (index: number) => {
    setBatchItems((prev) => prev.filter((_, i) => i !== index));
  };

  const saveSingle = async () => {
    if (!form.accountId || !form.asset || !form.quantity) return;
    setSaving(true);
    await createSnapshot({
      accountId: form.accountId as Id<"accounts">,
      asset: form.asset,
      assetType: form.assetType,
      quantity: Number(form.quantity),
      totalCost: Number(form.totalCost),
      currentValue: Number(form.currentValue),
      currency: form.currency,
      date: form.date,
    });
    setForm(emptyForm);
    setSaving(false);
  };

  const saveBatch = async () => {
    if (batchItems.length === 0) return;
    setSaving(true);
    await createBatch({
      items: batchItems.map((item) => ({
        accountId: item.accountId as Id<"accounts">,
        asset: item.asset,
        assetType: item.assetType,
        quantity: Number(item.quantity),
        totalCost: Number(item.totalCost),
        currentValue: Number(item.currentValue),
        currency: item.currency,
        date: item.date,
      })),
    });
    setBatchItems([]);
    setSaving(false);
  };

  const getAccountLabel = (id: string) => {
    const a = accountMap.get(id as Id<"accounts">);
    return a ? `${a.broker} · ${a.name}` : id;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">데이터 임포트</h2>
      <p className="text-muted-foreground text-sm">
        계좌별 현재 보유 자산을 스냅샷으로 등록합니다. 초기 1회 임포트용입니다.
      </p>

      {!accounts || accounts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            먼저 계좌 관리 페이지에서 계좌를 등록해주세요.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">자산 스냅샷 입력</CardTitle>
              <CardDescription>
                각 계좌의 잔고를 보고 하나씩 입력하거나 배치로 추가하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    placeholder="TSLA, 삼성전자"
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
                  <Label>수량</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={form.quantity}
                    onChange={(e) => updateField("quantity", e.target.value)}
                  />
                </div>
                <div>
                  <Label>총 매입금액</Label>
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={form.totalCost}
                    onChange={(e) => updateField("totalCost", e.target.value)}
                  />
                </div>
                <div>
                  <Label>현재 평가금액</Label>
                  <Input
                    type="number"
                    placeholder="1300000"
                    value={form.currentValue}
                    onChange={(e) =>
                      updateField("currentValue", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>기준일</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => updateField("date", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={addToBatch} variant="outline">
                  배치에 추가
                </Button>
                <Button onClick={saveSingle} disabled={saving}>
                  {saving ? "저장 중..." : "바로 저장"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {batchItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  배치 대기열 ({batchItems.length}건)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {batchItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm border rounded-md p-2"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getAccountLabel(item.accountId)}
                        </Badge>
                        <span className="font-medium">{item.asset}</span>
                        <span className="text-muted-foreground">
                          {item.quantity}주 | 매입{" "}
                          {Number(item.totalCost).toLocaleString()} | 평가{" "}
                          {Number(item.currentValue).toLocaleString()}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromBatch(i)}
                      >
                        삭제
                      </Button>
                    </div>
                  ))}
                </div>
                <Button onClick={saveBatch} disabled={saving} className="mt-4">
                  {saving ? "저장 중..." : `${batchItems.length}건 일괄 저장`}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">등록된 스냅샷</CardTitle>
          <CardDescription>
            {snapshots?.length || 0}건의 초기 자산 데이터
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!snapshots || snapshots.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              아직 등록된 스냅샷이 없습니다
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-left">
                    <th className="pb-2">계좌</th>
                    <th className="pb-2">자산</th>
                    <th className="pb-2">유형</th>
                    <th className="pb-2 text-right">수량</th>
                    <th className="pb-2 text-right">매입금액</th>
                    <th className="pb-2 text-right">평가금액</th>
                    <th className="pb-2">기준일</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map((s) => {
                    const account = accountMap.get(s.accountId);
                    return (
                      <tr key={s._id} className="border-b border-border/50">
                        <td className="py-2 text-xs">
                          {account
                            ? `${account.broker} · ${account.name}`
                            : "알 수 없음"}
                        </td>
                        <td className="py-2 font-medium">{s.asset}</td>
                        <td className="py-2 text-muted-foreground">
                          {s.assetType}
                        </td>
                        <td className="py-2 text-right font-mono">
                          {s.quantity.toLocaleString()}
                        </td>
                        <td className="py-2 text-right font-mono">
                          {s.totalCost.toLocaleString()} {s.currency}
                        </td>
                        <td className="py-2 text-right font-mono">
                          {s.currentValue.toLocaleString()} {s.currency}
                        </td>
                        <td className="py-2 text-muted-foreground">{s.date}</td>
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
