# Phase 2 구현 계획

## 개요

Phase 2는 자산관리 시스템을 실제 사용 가능한 수준으로 끌어올리는 단계.
4개 영역: 인증 → 환율 변환 → 현재가 API → Vercel 배포 순서로 진행.

> **인증을 먼저 하는 이유**: API 키를 사용하는 환율/시세 기능보다 인증이 먼저 있어야 데이터 보호 가능. 또한 Vercel 배포 전에 인증이 필수.

---

## 1. 인증 (Authentication)

### 방식

- Snapsheet과 동일: **단일 비밀번호 + HTTP-only 쿠키**
- 유저 DB 불필요 (개인용 앱)

### 구현 항목

| 파일                               | 역할                                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/app/api/auth/login/route.ts`  | POST: 비밀번호 검증 → HTTP-only 쿠키 설정                                                        |
| `src/app/api/auth/logout/route.ts` | POST: 쿠키 삭제                                                                                  |
| `src/app/api/auth/check/route.ts`  | GET: 쿠키 유효성 확인                                                                            |
| `src/app/login/page.tsx`           | 로그인 페이지 UI                                                                                 |
| `src/proxy.ts`                     | **Next.js 16**: `middleware` → `proxy`로 변경됨. 전체 라우트 보호 (login, api/auth, \_next 제외) |

### 인증 플로우

1. 비밀번호 입력 → `/api/auth/login` POST
2. `SITE_PASSWORD` 환경변수와 비교
3. 일치 시 `auth-token` HTTP-only 쿠키 설정 (SHA-256 해시값)
4. `proxy.ts`에서 매 요청마다 쿠키 확인 → 없으면 `/login` 리다이렉트
5. 로그아웃 시 쿠키 삭제

### 환경변수

- `SITE_PASSWORD`: 이미 `.env.local`에 존재 (`snapsheet2026`)
- `AUTH_SECRET`: 쿠키 서명용 시크릿 (추가 필요)

---

## 2. 환율 변환 (Exchange Rate)

### API 선택

- **ExchangeRate-API** (무료 플랜: 월 1,500회, 일 1회 갱신 충분)
- 대안: Open Exchange Rates

### 구현 항목

| 파일                                  | 역할                                                                   |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `convex/schema.ts`                    | `settings` 테이블에 `exchangeRates` 키 추가 (기존 key-value 구조 활용) |
| `convex/settings.ts`                  | `getExchangeRates` / `setExchangeRates` 쿼리/뮤테이션 추가             |
| `src/app/api/exchange-rates/route.ts` | GET: 외부 API 호출 → Convex에 저장 (서버사이드 프록시)                 |
| `src/app/page.tsx` (대시보드)         | 총자산을 기준통화(KRW)로 환산 합산                                     |
| `src/app/settings/page.tsx`           | 환율 표시 + 수동 설정 + API 갱신 버튼                                  |
| `src/lib/currency.ts`                 | 환율 변환 유틸리티 함수                                                |

### 데이터 구조 (settings에 저장)

```json
{
  "key": "exchangeRates",
  "value": "{\"base\":\"KRW\",\"rates\":{\"USD\":1380,\"CAD\":1000,\"EUR\":1500,\"JPY\":9.2},\"updatedAt\":\"2026-04-12T...\"}"
}
```

### 대시보드 환산 로직

- 각 holding의 currency 확인
- `currentValue × exchangeRate[currency→KRW]` 로 환산
- 총자산 = 모든 환산된 값의 합

---

## 3. 현재가 API 연동 (Live Price)

### API 선택

| 자산유형                  | API                    | 비고           |
| ------------------------- | ---------------------- | -------------- |
| 미국주식/ETF (`stock_us`) | Yahoo Finance (비공식) | 무료, 안정적   |
| 크립토 (`crypto`)         | CoinGecko API          | 무료 플랜 충분 |

### 구현 항목

| 파일                                    | 역할                                                    |
| --------------------------------------- | ------------------------------------------------------- |
| `src/app/api/prices/us-stocks/route.ts` | GET: Yahoo Finance에서 미국주식 시세 조회               |
| `src/app/api/prices/crypto/route.ts`    | GET: CoinGecko에서 크립토 시세 조회                     |
| `convex/settings.ts`                    | `getPriceCache` / `setPriceCache` — 시세 캐시 저장      |
| `src/app/page.tsx`                      | 대시보드 로드 시 시세 갱신 → currentValue 업데이트 표시 |
| `src/app/assets/page.tsx`               | 자산 목록에서도 실시간 가격 반영                        |
| `src/lib/prices.ts`                     | 시세 조회 클라이언트 유틸리티                           |

### 시세 갱신 플로우

1. 대시보드/자산 페이지 로드
2. 클라이언트에서 `/api/prices/us-stocks?symbols=TSLA,AAPL,...` 호출
3. Route Handler가 Yahoo Finance API 호출 → 결과 반환
4. 클라이언트에서 시세 적용하여 UI 표시 (Convex 데이터는 건드리지 않음 — 실시간 오버레이)
5. 선택적으로 "시세 저장" 버튼 → Convex에 캐시 저장

### 티커 매핑

- snapshots/transactions의 `asset` 필드를 티커로 사용
- 예: "TSLA", "AAPL", "BTC" 등
- 매핑이 안 되는 자산은 수동 가격 유지

---

## 4. Vercel 배포

### 구현 항목

| 작업                 | 내용                                                                          |
| -------------------- | ----------------------------------------------------------------------------- |
| Vercel 프로젝트 연결 | `vercel link` (사용자가 직접 실행)                                            |
| 환경변수 설정        | `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`, `SITE_PASSWORD`, `AUTH_SECRET` |
| 빌드 테스트          | `npm run build` 로 로컬 빌드 확인                                             |
| 배포                 | `vercel deploy` 또는 git push 자동 배포                                       |

> Vercel 배포는 CLI 로그인이 필요하므로 코드 준비만 하고 실제 배포는 사용자에게 안내.

---

## 구현 순서

```
Step 1: 인증 시스템
  ├── proxy.ts (라우트 보호)
  ├── /api/auth/* (로그인/로그아웃/체크)
  └── /login 페이지

Step 2: 환율 변환
  ├── Convex settings 확장
  ├── /api/exchange-rates
  ├── 환율 유틸리티
  ├── 대시보드 환산 적용
  └── 설정 페이지 환율 관리 UI

Step 3: 현재가 API
  ├── /api/prices/* (Yahoo Finance, CoinGecko)
  ├── 시세 유틸리티
  ├── 대시보드 실시간 가격 반영
  └── 자산 페이지 실시간 가격 반영

Step 4: 빌드 확인 + 배포 준비
  ├── npm run build 통과 확인
  └── 배포 가이드 제공
```

---

## 주의사항

- **Convex 공유 배포**: Snapsheet 테이블 절대 건드리지 않음
- **Next.js 16**: `middleware.ts` 대신 `proxy.ts` 사용 (함수명도 `proxy`)
- **API 키 노출 방지**: 외부 API 호출은 반드시 Route Handler(서버사이드)에서
- **한국주식**: 사용하지 않으므로 제외
