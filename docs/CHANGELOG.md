# Asset Manager — Changelog

## 2026-04-12 · Phase 2 구현

### 인증 시스템

- `src/proxy.ts` — Next.js 16 proxy 방식으로 전체 라우트 보호 (login, api/auth 제외)
- `src/app/api/auth/login/route.ts` — 비밀번호 검증 후 SHA-256 해시 기반 HTTP-only 쿠키 설정 (30일 유효)
- `src/app/api/auth/logout/route.ts` — 쿠키 삭제
- `src/app/login/page.tsx` — 로그인 페이지 (가로/세로 중앙 정렬, 다크 테마)
- `src/components/app-shell.tsx` — 로그인 페이지에서 사이드바 숨김 처리
- `src/components/sidebar.tsx` — 하단 로그아웃 버튼 추가
- `.env.local` — `AUTH_SECRET` 환경변수 추가

### 환율 변환

- `convex/settings.ts` — `getExchangeRates` / `setExchangeRates` 쿼리/뮤테이션 추가
- `src/app/api/exchange-rates/route.ts` — ExchangeRate-API(open.er-api.com) 프록시, 1시간 캐시
- `src/lib/currency.ts` — `convertToKRW()`, `formatKRW()`, `formatCurrency()` 유틸리티
- `src/app/page.tsx` (대시보드) — 총자산/투자금/수익률, 자산유형별/계좌별 합산에 KRW 환산 적용
- `src/app/settings/page.tsx` — 환율 관리 카드 추가 (현재 환율 표시 + API 갱신 버튼)

### 현재가 API 연동

- `src/app/api/prices/us-stocks/route.ts` — Yahoo Finance v8 spark API (v6 fallback)
- `src/app/api/prices/crypto/route.ts` — CoinGecko simple/price API, 18개 주요 심볼 매핑
- `convex/settings.ts` — `getPriceCache` / `setPriceCache` 추가 (시세 캐시용)
- `src/lib/prices.ts` — `fetchUSStockPrices()`, `fetchCryptoPrices()`, `fetchAllPrices()` 유틸리티
- `src/app/page.tsx` (대시보드) — "시세 갱신" 버튼, 실시간 가격 오버레이
- `src/app/assets/page.tsx` — 동일하게 시세 갱신 기능 적용

### 레이아웃 변경

- `src/app/layout.tsx` — `<Sidebar />` 직접 렌더 → `<AppShell>` 래퍼로 교체

### 빌드

- `npm run build` 통과 확인 (Next.js 16.2.2 Turbopack)

---

## 2026-04-06 · Phase 1 (MVP)

- 프로젝트 세팅 (Next.js 16 + Convex + shadcn/ui + Tailwind 4)
- Convex 스키마 (accounts, snapshots, assetTransactions, settings)
- Snapsheet Convex 배포 공유 구조
- 대시보드 (총자산, 수익률, 자산유형별/계좌별 요약, 보유 자산 테이블)
- 계좌 관리 (보관처 + 계좌명 + 계좌번호 + 유형)
- 자산 스냅샷 임포트 (단건/배치)
- 거래 기록 (매수/매도/배당)
- 설정 — 통화 동적 관리 (KRW/USD 보호)
- Lucide 아이콘 적용
- GitHub 레포 생성
