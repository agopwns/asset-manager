export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  updatedAt: string;
}

/**
 * 특정 통화의 금액을 KRW로 환산
 * base가 KRW인 경우: rates에는 1 KRW당 각 통화 값이 들어있음
 * 예: rates.USD = 0.000725 (1 KRW = 0.000725 USD)
 * USD 100을 KRW로: 100 / 0.000725 = 137,931 KRW
 */
export function convertToKRW(
  amount: number,
  currency: string,
  exchangeRates: ExchangeRates | null,
): number {
  if (currency === "KRW") return amount;
  if (!exchangeRates || !exchangeRates.rates) return amount;

  if (exchangeRates.base === "KRW") {
    const rate = exchangeRates.rates[currency];
    if (!rate) return amount;
    return amount / rate;
  }

  // base가 다른 통화인 경우
  const krwRate = exchangeRates.rates["KRW"];
  const currencyRate = exchangeRates.rates[currency];
  if (!krwRate || !currencyRate) return amount;
  return (amount / currencyRate) * krwRate;
}

export function formatKRW(value: number): string {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억원`;
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만원`;
  return `${value.toLocaleString()}원`;
}

export function formatCurrency(value: number, currency: string): string {
  if (currency === "KRW") return `${value.toLocaleString()}원`;
  if (currency === "USD") return `$${value.toLocaleString()}`;
  return `${value.toLocaleString()} ${currency}`;
}
