# Asset Manager — TODO

## 완료

- [x] 프로젝트 세팅 (Next.js + Convex + shadcn/ui)
- [x] Convex 스키마 (accounts, snapshots, assetTransactions, settings)
- [x] Snapsheet Convex 배포 공유 구조
- [x] Convex DB 분리 (asset-manager 전용 deployment, 2026-04-30)
- [x] 대시보드 (총자산, 수익률, 자산유형별/계좌별 요약)
- [x] 계좌 관리 (보관처 + 계좌명 + 계좌번호 + 유형)
- [x] 자산 스냅샷 임포트 (단건/배치)
- [x] 거래 기록 (매수/매도/배당)
- [x] 설정 — 통화 동적 관리
- [x] Lucide 아이콘 적용
- [x] GitHub 레포 생성

---

## Phase 2 — 핵심 (실제 사용 가능 수준) ✓

### 환율 변환

- [x] 환율 API 연동 (ExchangeRate-API, open.er-api.com)
- [x] settings에 환율 저장 (수동 설정 + API 자동 갱신)
- [x] 대시보드 총자산을 KRW 기준으로 환산 합산
- [x] USD/CAD 등 외화 자산의 원화 평가금액 표시

### 현재가 API 연동

- [x] 미국주식/ETF: Yahoo Finance API
- [x] 크립토: CoinGecko API
- [x] 시세 갱신 버튼 (대시보드 + 자산 목록)
- [x] 수익률 실시간 반영

### 인증

- [x] 비밀번호 + HTTP-only 쿠키 인증
- [x] proxy.ts로 전체 라우트 보호 (Next.js 16)
- [x] 로그인 페이지 + 로그아웃 버튼

### Vercel 배포

- [x] 빌드 확인 (npm run build 통과)
- [ ] Vercel 프로젝트 연결 + 환경변수 설정
- [ ] 커스텀 도메인 (선택)

---

## Phase 3 — 사용성 개선

### 데이터 수정/삭제

- [ ] 스냅샷 인라인 수정 + 삭제 버튼
- [ ] 거래 기록 수정 + 삭제 버튼
- [ ] 계좌 정보 수정 기능

### CSV 임포트

- [ ] 증권사별 엑셀/CSV 파싱 (신한, 삼성, 키움 등)
- [ ] 업로드 → 프리뷰 → 확인 후 저장 플로우
- [ ] 스크린샷 OCR (Claude Vision) — 토스 등 내보내기 없는 앱용

### 차트

- [ ] 자산 배분 파이차트 (Recharts)
- [ ] 월별 총자산 추이 라인차트
- [ ] 계좌별/유형별 비중 변화 차트

### 보관처 동적 관리

- [ ] 통화처럼 설정에서 보관처 추가/삭제
- [ ] 계좌유형도 동적 관리

---

## Phase 4 — 확장

### AI 포트폴리오 분석

- [ ] Claude API 연동
- [ ] 자산 배분 분석 (섹터/지역 편중도)
- [ ] 리밸런싱 추천
- [ ] 월별 리포트 자동 생성

### 자산 추이 기록

- [ ] 월별 자산 스냅샷 자동 저장 (cron or 수동)
- [ ] 자산 성장률 추적
- [ ] 목표 자산 설정 + 달성률

### Snapsheet 통합 대시보드

- [ ] 수입/지출(Snapsheet) + 자산(asset-manager) 크로스 분석
- [ ] "월 저축률 vs 자산 증가" 같은 인사이트
- [ ] 통합 재무 리포트
