# fixtures — 출처 표기

**③ 스키마 유도 — [실측 캡처 아님]**.

실제 Gmail SMTP 응답을 캡처한 것이 아니라, 이 저장소가 소유한 `src/app/api/contact/route.ts`의
응답 계약(상태코드 · `{ ok, error, fallback }` 형태)에서 유도했다.

- 상류(nodemailer/Gmail) 계약 drift는 구조적으로 잡지 못한다.
- **mock 통과는 연동 검증이 아니다.** 실제 발송 확인은 `@e2e-live` 수동 실행뿐이다.
