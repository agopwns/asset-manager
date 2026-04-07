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

const BROKERS = [
  "신한투자증권",
  "삼성증권",
  "대신크레온",
  "KB증권",
  "토스증권",
  "미래에셋증권",
  "토스뱅크",
  "신한은행",
];

const ACCOUNT_TYPES = [
  { value: "general", label: "일반 위탁" },
  { value: "isa", label: "ISA" },
  { value: "irp", label: "IRP" },
  { value: "pension", label: "연금저축" },
  { value: "cma", label: "CMA" },
  { value: "savings", label: "예적금" },
  { value: "crypto", label: "크립토" },
];

interface AccountForm {
  broker: string;
  name: string;
  accountNumber: string;
  accountType: string;
  currency: string;
  memo: string;
}

const emptyForm: AccountForm = {
  broker: "",
  name: "",
  accountNumber: "",
  accountType: "general",
  currency: "KRW",
  memo: "",
};

export default function AccountsPage() {
  const [form, setForm] = useState<AccountForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const accounts = useQuery(api.accounts.list);
  const currencies = useQuery(api.settings.getCurrencies) || ["KRW", "USD"];
  const createAccount = useMutation(api.accounts.create);
  const removeAccount = useMutation(api.accounts.remove);

  const updateField = (field: keyof AccountForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.broker || !form.name || !form.accountNumber) return;
    setSaving(true);
    await createAccount({
      broker: form.broker,
      name: form.name,
      accountNumber: form.accountNumber,
      accountType: form.accountType,
      currency: form.currency,
      memo: form.memo || undefined,
    });
    setForm(emptyForm);
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: Id<"accounts">) => {
    if (!confirm("이 계좌를 삭제하시겠습니까?")) return;
    await removeAccount({ id });
  };

  // 보관처별 그룹
  const byBroker = (accounts || []).reduce(
    (acc, a) => {
      if (!acc[a.broker]) acc[a.broker] = [];
      acc[a.broker].push(a);
      return acc;
    },
    {} as Record<string, NonNullable<typeof accounts>>,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">계좌 관리</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "취소" : "+ 계좌 추가"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">새 계좌 등록</CardTitle>
            <CardDescription>보관처와 계좌 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>보관처</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.broker}
                  onChange={(e) => updateField("broker", e.target.value)}
                >
                  <option value="">선택</option>
                  {BROKERS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>계좌명</Label>
                <Input
                  placeholder="일반 위탁, ISA, 주거래통장"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>
              <div>
                <Label>계좌번호</Label>
                <Input
                  placeholder="1234-5678-9012"
                  value={form.accountNumber}
                  onChange={(e) => updateField("accountNumber", e.target.value)}
                />
              </div>
              <div>
                <Label>계좌유형</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.accountType}
                  onChange={(e) => updateField("accountType", e.target.value)}
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>주 통화</Label>
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
                <Label>메모 (선택)</Label>
                <Input
                  placeholder="메모"
                  value={form.memo}
                  onChange={(e) => updateField("memo", e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={saving} className="mt-4">
              {saving ? "저장 중..." : "저장"}
            </Button>
          </CardContent>
        </Card>
      )}

      {!accounts || accounts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            등록된 계좌가 없습니다. 먼저 계좌를 추가해주세요.
          </CardContent>
        </Card>
      ) : (
        Object.entries(byBroker).map(([broker, accts]) => (
          <Card key={broker}>
            <CardHeader>
              <CardTitle className="text-lg">{broker}</CardTitle>
              <CardDescription>{accts.length}개 계좌</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accts.map((a) => {
                  const typeLabel =
                    ACCOUNT_TYPES.find((t) => t.value === a.accountType)
                      ?.label || a.accountType;
                  return (
                    <div
                      key={a._id}
                      className="flex items-center justify-between border rounded-md p-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{a.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {typeLabel}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {a.currency}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">
                          {a.accountNumber}
                        </p>
                        {a.memo && (
                          <p className="text-xs text-muted-foreground">
                            {a.memo}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(a._id)}
                      >
                        삭제
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
