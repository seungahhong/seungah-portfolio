import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
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
