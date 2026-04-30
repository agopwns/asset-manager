import { NextResponse } from "next/server";

// 일반적인 크립토 심볼 → CoinGecko ID 매핑
const SYMBOL_TO_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  DOT: "polkadot",
  AVAX: "avalanche-2",
  MATIC: "matic-network",
  LINK: "chainlink",
  UNI: "uniswap",
  ATOM: "cosmos",
  LTC: "litecoin",
  NEAR: "near",
  ARB: "arbitrum",
  OP: "optimism",
  APT: "aptos",
  SUI: "sui",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get("symbols");

  if (!symbols) {
    return NextResponse.json(
      { error: "symbols 파라미터가 필요합니다" },
      { status: 400 },
    );
  }

  const symbolList = symbols.split(",").map((s) => s.trim().toUpperCase());
  const ids = symbolList.map((s) => SYMBOL_TO_ID[s]).filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json({ prices: {} });
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`,
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "CoinGecko API 호출 실패" },
        { status: 502 },
      );
    }

    const data = await res.json();
    const prices: Record<string, number> = {};

    for (const symbol of symbolList) {
      const id = SYMBOL_TO_ID[symbol];
      if (id && data[id]?.usd) {
        prices[symbol] = data[id].usd;
      }
    }

    return NextResponse.json({ prices });
  } catch {
    return NextResponse.json(
      { error: "크립토 시세를 가져올 수 없습니다" },
      { status: 500 },
    );
  }
}
