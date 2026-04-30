import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = searchParams.get("base") || "KRW";

  try {
    // ExchangeRate-API 무료 플랜
    const res = await fetch(
      `https://open.er-api.com/v6/latest/${base}`,
      { next: { revalidate: 3600 } }, // 1시간 캐시
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "환율 API 호출 실패" },
        { status: 502 },
      );
    }

    const data = await res.json();

    return NextResponse.json({
      base: data.base_code,
      rates: data.rates,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "환율 정보를 가져올 수 없습니다" },
      { status: 500 },
    );
  }
}
