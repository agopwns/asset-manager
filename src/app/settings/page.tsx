"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export default function SettingsPage() {
  const currencies = useQuery(api.settings.getCurrencies);
  const setCurrencies = useMutation(api.settings.setCurrencies);
  const [newCurrency, setNewCurrency] = useState("");

  const handleAdd = async () => {
    const code = newCurrency.trim().toUpperCase();
    if (!code || code.length < 2 || code.length > 4) return;
    if (currencies?.includes(code)) return;
    await setCurrencies({ currencies: [...(currencies || []), code] });
    setNewCurrency("");
  };

  const handleRemove = async (code: string) => {
    if (!currencies) return;
    // KRW, USD는 삭제 불가
    if (code === "KRW" || code === "USD") return;
    await setCurrencies({
      currencies: currencies.filter((c) => c !== code),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">설정</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">통화 관리</CardTitle>
          <CardDescription>
            임포트, 거래, 계좌에서 선택할 수 있는 통화 목록입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {currencies?.map((code) => {
              const isProtected = code === "KRW" || code === "USD";
              return (
                <Badge
                  key={code}
                  variant="secondary"
                  className="text-sm px-3 py-1 gap-1"
                >
                  {code}
                  {!isProtected && (
                    <button
                      onClick={() => handleRemove(code)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="통화 코드 (예: GBP, CHF, AUD)"
              value={newCurrency}
              onChange={(e) => setNewCurrency(e.target.value)}
              onKeyDown={handleKeyDown}
              className="max-w-xs uppercase"
              maxLength={4}
            />
            <Button onClick={handleAdd} variant="outline">
              추가
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
