import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// eslint-config-next 16부터 플랫 설정을 직접 내보낸다(`eslint-config-next/core-web-vitals`,
// `eslint-config-next/typescript`). 15까지 쓰던 `FlatCompat`(@eslint/eslintrc) 경유는
// 더 이상 필요 없고, 그대로 두면 `Converting circular structure to JSON`으로 죽는다(실측).
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // arch-guard R1의 *에디터 미러*다. 강제 계층이 아니다 —
    // Next 16의 `next build`는 ESLint를 실행하지 않으므로(실측: lint exit 1, build exit 0)
    // 이 규칙만으로는 위반이 배포를 막지 못한다. 실제 차단은 prebuild 게이트가 한다.
    // 여기 두는 이유는 저장하는 순간 에디터에 뜨게 해서 피드백을 앞당기기 위해서다.
    files: ["src/helpers/**", "src/types/**", "src/lib/**"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["@/components/*", "@/hooks/*", "**/components/*", "**/hooks/*"],
          message:
            "데이터·로직 계층은 UI를 import할 수 없습니다 (arch-guard R1). 값을 UI에서 인자로 넘기세요.",
        }],
      }],
    },
  },
];

export default eslintConfig;
