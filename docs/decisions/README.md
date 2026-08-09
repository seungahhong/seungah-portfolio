# 결정 기록 (ADR)

`references/`가 "지금 어떻게 되어 있는가"라면, 여기는 **"왜 그때 그렇게 정했고 무엇을 포기했는가"**다.
둘을 섞으면 같은 내용이 두 곳에 생기고 곧 어긋난다.

각 문서는 다섯 블록으로 쓴다 — **결정 / 맥락 / 포기한 대안 / 강제하는 가드 / 재검토 트리거**.

여기 적을 가치가 있는 것은 **코드를 읽어서는 알 수 없는 것**뿐이다.
"이렇게 되어 있다"는 코드가 이미 말한다. "이렇게 안 하면 무엇이 조용히 깨지는지",
"어떤 대안을 왜 버렸는지", "언제 이 결정을 다시 열어야 하는지"가 여기 있어야 한다.

| # | 결정 | 강제하는 가드 |
|---|---|---|
| [0001](0001-two-root-layouts.md) | 루트 레이아웃을 둘로 나눈다 | arch-guard R3 |
| [0002](0002-tab-state-from-window-location.md) | 탭 상태를 `useSearchParams`가 아니라 `window.location`에서 읽는다 | arch-guard R9 |
| [0003](0003-portfolio-is-default-tab.md) | 기본 탭은 포트폴리오다 | verify:runtime V1·V2 |
| [0004](0004-in-memory-rate-limit.md) | 레이트리밋을 인스턴스 메모리에 둔다 | verify:runtime V8 |
| [0005](0005-env-gated-degradation.md) | 자격증명이 없으면 죽는 대신 축소한다 | verify:runtime V8·V9 |
| [0006](0006-all-copy-in-i18n-json.md) | 표시 문구는 100% i18n JSON에 둔다 | i18n-guard R6·R7 · 타입 R4·R5 |
| [0007](0007-no-test-framework.md) | 테스트 프레임워크를 도입하지 않는다 | verify 하네스 |

## 열린 결정 (의도 확인 필요)

아래 둘은 코드에서 관측했지만 의도인지 확인되지 않았다. 확정되면 ADR로 옮긴다.

- **`buildLlmsTxt()`가 로케일 인자를 받지 않는다**(`src/lib/seo/llms.ts`). 한 파일에 양 언어를 함께 싣는
  설계로 보이고 `references/seo-geo.md`와도 일치하지만, 기록이 없으면 다음 사람이 "버그"로 보고
  로케일 분리를 시도한다.
- **`/contact`에 영어판이 없다.** CLAUDE.md의 "한국어에 페이지를 추가하면 영어에도 추가"와 어긋나 보이나
  noindex 폼이라 의도일 수 있다. `verify:runtime`은 이것을 실패로 만들지 않도록 `FORM_PAGES` 예외에 두고 있다.
