# fixtures — 출처 표기

**① 저장소 내부 계약 재사용 — 실측 근거 있음**.

`GET /api/chat`의 응답은 이 저장소가 소유한 `src/app/api/chat/route.ts`가 만든다
(`NextResponse.json({ available: isChatConfigured() })`). 상류 서비스 응답이 아니라 내부 계약이므로
외부 drift 위험이 없다.

실측 근거: `scripts/verify-runtime.mjs`의 V8이 자격증명 없이 띄운 실제 서버에 대해
`{"available":false}`를 단정한다(ADR 0005 축소 계약).

- **mock 통과는 연동 검증이 아니다.** Groq 실제 연동 확인은 `@e2e-live` 수동 실행뿐이다.
