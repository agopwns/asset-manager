import { NextResponse } from "next/server";

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

  try {
    // Yahoo Finance v8 quote API
    const url = `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${symbolList.join(",")}&range=1d&interval=1d`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!res.ok) {
      // fallback: v6 quote API
      return await fetchV6(symbolList);
    }

    const data = await res.json();
    const prices: Record<string, number> = {};

    for (const symbol of symbolList) {
      const spark = data.spark?.result?.find(
        (r: { symbol: string }) => r.symbol === symbol,
      );
      const close =
        spark?.response?.[0]?.meta?.regularMarketPrice ??
        spark?.response?.[0]?.meta?.previousClose;
      if (close) {
        prices[symbol] = close;
      }
    }

    return NextResponse.json({ prices });
  } catch {
    // fallback
    return await fetchV6(symbolList);
  }
}

async function fetchV6(symbolList: string[]) {
  try {
    const url = `https://query2.finance.yahoo.com/v6/finance/quote?symbols=${symbolList.join(",")}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Yahoo Finance API 호출 실패" },
        { status: 502 },
      );
    }

    const data = await res.json();
    const prices: Record<string, number> = {};

    for (const quote of data.quoteResponse?.result || []) {
      if (quote.regularMarketPrice) {
        prices[quote.symbol] = quote.regularMarketPrice;
      }
    }

    return NextResponse.json({ prices });
  } catch {
    return NextResponse.json(
      { error: "시세 정보를 가져올 수 없습니다" },
      { status: 500 },
    );
  }
}
