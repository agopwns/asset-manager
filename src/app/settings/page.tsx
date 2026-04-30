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
import { X, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const currencies = useQuery(api.settings.getCurrencies);
  const setCurrencies = useMutation(api.settings.setCurrencies);
  const exchangeRates = useQuery(api.settings.getExchangeRates);
  const setExchangeRates = useMutation(api.settings.setExchangeRates);
  const [newCurrency, setNewCurrency] = useState("");
  const [rateLoading, setRateLoading] = useState(false);

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

  const handleFetchRates = async () => {
    setRateLoading(true);
    try {
      const res = await fetch("/api/exchange-rates?base=KRW");
      if (!res.ok) throw new Error();
      const data = await res.json();
      await setExchangeRates({
        base: data.base,
        rates: data.rates,
        updatedAt: data.updatedAt,
      });
    } catch {
      alert("환율 정보를 가져오는데 실패했습니다");
    } finally {
      setRateLoading(false);
    }
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">환율 관리</CardTitle>
              <CardDescription>
                외화 자산의 KRW 환산에 사용되는 환율입니다
              </CardDescription>
            </div>
            <Button
              onClick={handleFetchRates}
              variant="outline"
              size="sm"
              disabled={rateLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${rateLoading ? "animate-spin" : ""}`}
              />
              {rateLoading ? "갱신 중..." : "API 갱신"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!exchangeRates ? (
            <p className="text-sm text-muted-foreground">
              환율 데이터가 없습니다. API 갱신 버튼을 눌러주세요.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                기준: {exchangeRates.base} · 갱신:{" "}
                {new Date(exchangeRates.updatedAt).toLocaleString("ko-KR")}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {currencies
                  ?.filter((c) => c !== "KRW")
                  .map((code) => {
                    const rate = exchangeRates.rates[code];
                    const krwPerUnit = rate ? (1 / rate).toFixed(2) : "-";
                    return (
                      <div
                        key={code}
                        className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm"
                      >
                        <span className="font-medium">{code}</span>
                        <span className="font-mono text-muted-foreground">
                          {krwPerUnit !== "-"
                            ? `₩${Number(krwPerUnit).toLocaleString()}`
                            : "-"}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
