export async function fetchUSStockPrices(
  symbols: string[],
): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};
  const res = await fetch(`/api/prices/us-stocks?symbols=${symbols.join(",")}`);
  if (!res.ok) return {};
  const data = await res.json();
  return data.prices || {};
}

export async function fetchCryptoPrices(
  symbols: string[],
): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};
  const res = await fetch(`/api/prices/crypto?symbols=${symbols.join(",")}`);
  if (!res.ok) return {};
  const data = await res.json();
  return data.prices || {};
}

export async function fetchAllPrices(
  holdings: {
    asset: string;
    assetType: string;
  }[],
): Promise<Record<string, number>> {
  const usStocks = holdings
    .filter((h) => h.assetType === "stock_us")
    .map((h) => h.asset);
  const cryptos = holdings
    .filter((h) => h.assetType === "crypto")
    .map((h) => h.asset);

  const [stockPrices, cryptoPrices] = await Promise.all([
    fetchUSStockPrices([...new Set(usStocks)]),
    fetchCryptoPrices([...new Set(cryptos)]),
  ]);

  return { ...stockPrices, ...cryptoPrices };
}
