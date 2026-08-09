#!/usr/bin/env node
/**
 * guard-selftest — 가드레일 자신의 오라클.
 *
 * 가드레일도 코드다. 검증되지 않은 가드레일은 검증되지 않은 코드와 같은 위험을 갖는데,
 * 실패 모드가 "false green"이라 더 조용하다. 실제로 두 개의 구멍이 이 저장소에서 탈출했다 —
 * 대문자 상수(`SCREAMING_SNAKE`)를 컴포넌트로 오분류한 것과, `.jsx` 라우트를 아예 스캔하지 않은 것.
 *
 * 위반 fixture를 임시 디렉터리에 만들고 arch-guard를 그 루트에 대해 돌려,
 * **기대한 rule id 집합과 정확히 일치**하는지 단정한다.
 * 기대보다 적게 잡으면(놓침) 실패하고, 많이 잡아도(오검출) 실패한다.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, cpSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = path.dirname(HERE);

// fixture는 레포 *안*에 만든다. tmpdir에 두면 arch-guard가 import하는 `typescript`를
// 해석하지 못해 스크립트가 조용히 죽고, 모든 케이스가 "위반 0"으로 통과해 버린다
// — 자기 테스트가 false green을 내는 것이야말로 최악이다.
const FIXTURE_PARENT = REPO;

/** 각 케이스: 파일 몇 개를 만들고, arch-guard가 어떤 rule을 몇 건 내야 하는가 */
const CASES = [
  {
    name: 'R1 데이터가 UI import',
    files: {
      'src/components/ui/Thing.tsx': 'export default function Thing() { return null; }\n',
      'src/helpers/datas/x.ts': "import Thing from '@/components/ui/Thing';\nexport const x = Thing;\n",
    },
    expect: { 'layer/no-ui-in-data': 1 },
  },
  {
    name: 'R2 서버가 클라이언트 훅 import',
    files: {
      'src/lib/c.ts': "'use client';\nexport function useThing() { return 1; }\n",
      'src/lib/s.ts': "import { useThing } from '@/lib/c';\nexport const v = useThing;\n",
    },
    expect: { 'boundary/no-client-value-on-server': 1 },
  },
  {
    name: 'R2 서버가 클라이언트 대문자 상수 import (탈출했던 케이스)',
    files: {
      'src/lib/c.ts': "'use client';\nexport const API_URL = 'x';\n",
      'src/lib/s.ts': "import { API_URL } from '@/lib/c';\nexport const v = API_URL;\n",
    },
    expect: { 'boundary/no-client-value-on-server': 1 },
  },
  {
    name: 'R2 배럴 경유',
    files: {
      'src/lib/c.ts': "'use client';\nexport function useThing() { return 1; }\n",
      'src/lib/index.ts': "export { useThing } from './c';\n",
      'src/lib/s.ts': "import { useThing } from '@/lib';\nexport const v = useThing;\n",
    },
    expect: { 'boundary/no-client-value-on-server': 1 },
  },
  {
    name: 'R2 클라이언트 컴포넌트 import는 정상 (오검출 확인)',
    files: {
      'src/lib/c.tsx': "'use client';\nexport function Provider() { return null; }\n",
      'src/lib/s.ts': "import { Provider } from '@/lib/c';\nexport const v = Provider;\n",
    },
    expect: {},
  },
  {
    name: 'R2 import type 은 정상 (오검출 확인)',
    files: {
      'src/lib/c.ts': "'use client';\nexport type Thing = string;\n",
      'src/lib/s.ts': "import type { Thing } from '@/lib/c';\nexport const v: Thing = 'x';\n",
    },
    expect: {},
  },
  {
    name: "R2 주석의 'use client' 언급은 지시어가 아니다 (오검출 확인)",
    files: {
      'src/lib/c.ts': "// 'use client' 모듈에서 쓰면 안 된다\nexport const VALUE = 1;\n",
      'src/lib/s.ts': "import { VALUE } from '@/lib/c';\nexport const v = VALUE;\n",
    },
    expect: {},
  },
  {
    name: 'R3 route group 밖 page.tsx',
    files: { 'src/app/orphan/page.tsx': 'export default function P() { return null; }\n' },
    expect: { 'route/must-live-in-locale-group': 1 },
  },
  {
    name: 'R3 route group 밖 page.jsx (탈출했던 케이스)',
    files: { 'src/app/orphan/page.jsx': 'export default function P() { return null; }\n' },
    expect: { 'route/must-live-in-locale-group': 1 },
  },
  {
    name: 'R3 route group 안은 정상 (오검출 확인)',
    files: { 'src/app/(ko)/x/page.tsx': 'export default function P() { return null; }\n' },
    expect: {},
  },
  {
    name: 'R3 메타 라우트·API는 대상 아님 (오검출 확인)',
    files: {
      'src/app/sitemap.ts': 'export default function s() { return []; }\n',
      'src/app/api/x/route.ts': 'export function GET() { return new Response(); }\n',
    },
    expect: {},
  },
  {
    name: 'R9 프로바이더의 useSearchParams',
    files: {
      'src/components/providers/P.tsx':
        "'use client';\nimport { useSearchParams } from 'next/navigation';\nexport function P() { useSearchParams(); return null; }\n",
    },
    expect: { 'react/no-search-params-in-provider': 1 },
  },
  {
    name: 'R9 프로바이더 밖의 useSearchParams는 대상 아님 (오검출 확인)',
    files: {
      'src/components/ui/C.tsx':
        "'use client';\nimport { useSearchParams } from 'next/navigation';\nexport function C() { useSearchParams(); return null; }\n",
    },
    expect: {},
  },
  {
    name: '무위반 (기준 케이스)',
    files: { 'src/lib/a.ts': "export const a = 1;\n" },
    expect: {},
  },
];

function run(caseDef) {
  const root = mkdtempSync(path.join(FIXTURE_PARENT, '.guard-selftest-'));
  try {
    for (const [rel, body] of Object.entries(caseDef.files)) {
      const full = path.join(root, rel);
      mkdirSync(path.dirname(full), { recursive: true });
      writeFileSync(full, body);
    }
    mkdirSync(path.join(root, 'scripts'), { recursive: true });
    cpSync(path.join(HERE, 'arch-guard.mjs'), path.join(root, 'scripts/arch-guard.mjs'));

    let out = '';
    try {
      out = execFileSync(process.execPath, ['scripts/arch-guard.mjs'], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (e) {
      out = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    }
    // arch-guard가 실행조차 못 했으면(예: 모듈 해석 실패) 위반 0으로 오인하지 않는다.
    if (!/arch-guard/.test(out)) {
      throw new Error(`arch-guard가 실행되지 않았습니다:\n${out}`);
    }

    const got = {};
    for (const m of out.matchAll(/\[([a-z0-9/-]+)\]/g)) got[m[1]] = (got[m[1]] ?? 0) + 1;
    return got;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

let failed = 0;
for (const c of CASES) {
  const got = run(c);
  const same =
    Object.keys({ ...got, ...c.expect }).every((k) => (got[k] ?? 0) === (c.expect[k] ?? 0));
  if (same) {
    console.log(`  ✔ ${c.name}`);
  } else {
    failed += 1;
    console.error(`  ✖ ${c.name}`);
    console.error(`      기대: ${JSON.stringify(c.expect)}`);
    console.error(`      실제: ${JSON.stringify(got)}`);
  }
}

if (failed) {
  console.error(`\n✖ guard-selftest — ${failed}/${CASES.length} 실패. 가드가 놓치거나 잘못 잡고 있습니다.\n`);
  process.exit(1);
}
console.log(`✔ guard-selftest — ${CASES.length}/${CASES.length} 통과 (위반 탐지 + 오검출 확인)`);
