#!/usr/bin/env node
/**
 * arch-guard — 아키텍처 규칙을 빌드 실패로 승격시킨다.
 *
 * 왜 prebuild인가: Next 16의 `next build`는 ESLint를 실행하지 않는다(실측 — lint exit 1,
 * build exit 0). 그래서 ESLint 규칙만으로는 위반이 배포를 막지 못한다. pnpm이 `prebuild`를
 * 자동 실행하고 비-0 종료 시 `next build`가 시작조차 하지 않으므로, 여기가 이 스택에서
 * 아키텍처를 물리적으로 강제할 수 있는 자리다.
 *
 * 파서는 이미 설치된 typescript를 쓴다(신규 의존성 0). 정규식이 아닌 이유:
 * 주석 속 'use client' 언급과 실제 지시어를 구분해야 하고(실측: grep은 26개, 실제 지시어는 22개),
 * `import type`을 런타임 영향 없음으로 정확히 제외해야 한다.
 *
 * 규칙: R1 계층 방향 · R2 서버→클라이언트 값 · R3 route group · R9 프로바이더 useSearchParams
 */
import ts from 'typescript';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

/**
 * R1 예외 — 현재 0건.
 * lib 안의 `.tsx`는 셋이다 — JsonLd.tsx · chat/markdown.tsx · i18n/provider.tsx.
 * 셋 다 components/hooks를 import하지 않으므로 예외가 필요 없다(전부 R1 판정을 그냥 통과한다).
 * 여기에 항목이 늘어나면 규칙이 형해화되는 신호다 — 추가 전에 정말 필요한지 따진다.
 */
const UI_IN_LIB = new Set([]);

const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');

// ── 파일 수집 ────────────────────────────────────────────────────────────────
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    // tsconfig에 allowJs가 켜져 있어 Next는 .jsx/.js 라우트도 정상 처리한다.
    // .tsx만 수집하면 `app/orphan/page.jsx` 같은 위반이 그대로 통과한다(실제 탈출 사례).
    else if (/\.(?:m|c)?[jt]sx?$/.test(name)) out.push(full);
  }
  return out;
}

// ── 파싱 ─────────────────────────────────────────────────────────────────────
/** @type {Map<string, {sf: ts.SourceFile, isClient: boolean}>} */
const parsed = new Map();

function parse(file) {
  const hit = parsed.get(file);
  if (hit) return hit;
  const sf = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    /\.[jt]sx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  // 첫 "실행 구문"이 'use client' 문자열이어야 지시어다 — 주석 언급과 구분된다.
  const first = sf.statements[0];
  const isClient =
    !!first &&
    ts.isExpressionStatement(first) &&
    ts.isStringLiteral(first.expression) &&
    first.expression.text === 'use client';
  const entry = { sf, isClient };
  parsed.set(file, entry);
  return entry;
}

const pos = (sf, node) => {
  const { line, character } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
  return `${line + 1}:${character + 1}`;
};

// ── 모듈 해석 ────────────────────────────────────────────────────────────────
function resolve(spec, fromFile) {
  let base;
  if (spec.startsWith('@/')) base = path.join(SRC, spec.slice(2));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(fromFile), spec);
  else return null; // node_modules — 관심 밖
  for (const cand of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
    path.join(base, 'index.js'),
    path.join(base, 'index.jsx'),
  ]) {
    try {
      if (statSync(cand).isFile()) return cand;
    } catch {
      /* 다음 후보 */
    }
  }
  return null;
}

// ── export 원산지 추적 (배럴 세탁 경로 폐쇄) ─────────────────────────────────
/**
 * 모듈 M이 이름 N을 어디서 가져왔는지 되짚는다.
 * `export { useT } from './useT'` 같은 재수출을 따라가지 않으면
 * 서버가 배럴 경유로 클라이언트 값을 가져와도 탐지되지 않는다.
 */
function originOf(file, name, seen = new Set()) {
  if (!file || seen.has(file)) return null;
  seen.add(file);
  const { sf, isClient } = parse(file);

  const starTargets = [];
  for (const st of sf.statements) {
    if (!ts.isExportDeclaration(st)) continue;
    const target = st.moduleSpecifier
      ? resolve(st.moduleSpecifier.text, file)
      : null;

    if (st.exportClause && ts.isNamedExports(st.exportClause)) {
      for (const el of st.exportClause.elements) {
        if (el.name.text !== name) continue;
        if (st.isTypeOnly || el.isTypeOnly) return { typeOnly: true };
        const source = el.propertyName?.text ?? name;
        if (!target) return { file, isClient }; // `export { local }` — 여기가 원산지
        return originOf(target, source, seen) ?? { file: target, isClient: parse(target).isClient };
      }
    } else if (!st.exportClause && target) {
      starTargets.push(st.isTypeOnly ? null : target); // export * from
    }
  }

  // 이 모듈이 직접 선언·수출하는가
  if (declaresExport(sf, name)) return { file, isClient };

  for (const t of starTargets) {
    if (!t) continue;
    const found = originOf(t, name, seen);
    if (found) return found;
  }
  return null;
}

function declaresExport(sf, name) {
  const exported = (n) =>
    !!n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
  for (const st of sf.statements) {
    if (ts.isVariableStatement(st) && exported(st)) {
      for (const d of st.declarationList.declarations)
        if (ts.isIdentifier(d.name) && d.name.text === name) return true;
    } else if (
      (ts.isFunctionDeclaration(st) ||
        ts.isClassDeclaration(st) ||
        ts.isInterfaceDeclaration(st) ||
        ts.isTypeAliasDeclaration(st) ||
        ts.isEnumDeclaration(st)) &&
      exported(st) &&
      st.name?.text === name
    ) {
      return true;
    } else if (ts.isExportDeclaration(st) && !st.moduleSpecifier && st.exportClause && ts.isNamedExports(st.exportClause)) {
      if (st.exportClause.elements.some((el) => el.name.text === name)) return true;
    }
  }
  return false;
}

/**
 * 서버가 클라이언트 *컴포넌트*를 import하는 것은 정상. *값*을 가져오는 것이 버그다.
 *
 * PascalCase만으로 판정하면 `DEFAULT_LOCALE`·`TABS`·`API_URL` 같은 대문자 상수가
 * 컴포넌트로 오분류돼 그대로 통과한다. 실무에서 서버가 클라이언트 모듈에서 잘못 끌어올 값은
 * 훅보다 이런 상수일 가능성이 높고, 실제로 이 구멍이 검증 단계에서 탈출했다.
 * 그래서 SCREAMING_SNAKE(대문자·숫자·밑줄만)는 명시적으로 컴포넌트에서 제외한다.
 */
const isComponentName = (n) => /^[A-Z]/.test(n) && !/^[A-Z0-9_]+$/.test(n);

// ── 규칙 ─────────────────────────────────────────────────────────────────────
const violations = [];
const push = (v) => violations.push(v);

function layerOf(r) {
  if (r.startsWith('src/helpers/')) return 'helpers';
  if (r.startsWith('src/types/')) return 'types';
  if (r.startsWith('src/lib/')) return 'lib';
  if (r.startsWith('src/components/')) return 'components';
  if (r.startsWith('src/hooks/')) return 'hooks';
  if (r.startsWith('src/app/')) return 'app';
  return 'other';
}

function checkFile(file) {
  const r = rel(file);
  const { sf, isClient } = parse(file);
  const layer = layerOf(r);

  // ── R3: page/layout은 (ko)/(en) 안에만 ────────────────────────────────────
  const baseName = path.basename(r);
  if (layer === 'app' && /^(?:page|layout)\.(?:m|c)?[jt]sx?$/.test(baseName)) {
    if (!/^src\/app\/\((ko|en)\)\//.test(r)) {
      push({
        loc: `${r}:1:1`,
        rule: 'route/must-live-in-locale-group',
        cause:
          `route group 밖의 ${baseName} 입니다. 빌드는 통과하지만 루트 레이아웃이 적용되지 않아\n` +
          `        <html lang>·전역 CSS·폰트·프로바이더가 빠진 반쪽 페이지가 조용히 정적 생성됩니다.`,
        fix: `src/app/(ko)/... 또는 src/app/(en)/en/... 아래로 옮기세요. 한쪽에만 두면 hreflang이 짝을 잃습니다.`,
      });
    }
  }

  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier)) continue;
    const spec = st.moduleSpecifier.text;
    const target = resolve(spec, file);
    if (!target) continue;
    const targetRel = rel(target);
    const clause = st.importClause;
    if (!clause) continue;
    if (clause.isTypeOnly) continue; // import type — 런타임 영향 없음

    // ── R1: 데이터·타입·로직 계층이 UI를 import ───────────────────────────
    const targetLayer = layerOf(targetRel);
    const isSourceLower =
      layer === 'helpers' || layer === 'types' || (layer === 'lib' && !UI_IN_LIB.has(r));
    if (isSourceLower && (targetLayer === 'components' || targetLayer === 'hooks')) {
      push({
        loc: `${r}:${pos(sf, st)}`,
        rule: 'layer/no-ui-in-data',
        cause:
          `${layer} 계층이 ${targetLayer} 계층('${spec}')을 import했습니다.\n` +
          `        데이터·로직은 언어중립·재사용 가능해야 하는데 UI를 끌어오면 그 성질이 깨지고,\n` +
          `        화면·JSON-LD·llms.txt·챗 프롬프트 네 출력이 어긋나기 시작합니다.`,
        fix: `값을 UI에서 인자로 넘기세요. 의존 방향은 app/components → lib → helpers → types 한 방향입니다.`,
      });
      continue;
    }

    // ── R2: 서버 모듈이 클라이언트 모듈의 비컴포넌트 값을 import ──────────
    if (isClient) continue; // 클라이언트끼리는 자유
    const named = [];
    if (clause.name) named.push({ imported: 'default', local: clause.name.text, node: clause.name });
    if (clause.namedBindings) {
      if (ts.isNamedImports(clause.namedBindings)) {
        for (const el of clause.namedBindings.elements) {
          if (el.isTypeOnly) continue;
          named.push({
            imported: el.propertyName?.text ?? el.name.text,
            local: el.name.text,
            node: el,
          });
        }
      } else {
        // import * as ns — 네임스페이스 전체. 클라이언트 모듈이면 값 접근 가능성이 열린다.
        if (parse(target).isClient) {
          push({
            loc: `${r}:${pos(sf, st)}`,
            rule: 'boundary/no-client-value-on-server',
            cause: `서버 모듈이 'use client' 모듈('${spec}')을 네임스페이스로 통째 import했습니다.`,
            fix: `필요한 컴포넌트만 named import 하세요.`,
          });
        }
        continue;
      }
    }

    for (const n of named) {
      if (isComponentName(n.imported) || n.imported === 'default') continue;
      const origin = originOf(target, n.imported);
      if (!origin || origin.typeOnly || !origin.isClient) continue;
      const via =
        origin.file && rel(origin.file) !== targetRel
          ? ` (배럴 '${spec}' 경유 → ${rel(origin.file)})`
          : '';
      push({
        loc: `${r}:${pos(sf, n.node)}`,
        rule: 'boundary/no-client-value-on-server',
        cause:
          `서버 모듈이 'use client' 모듈의 값 '${n.imported}'를 import했습니다${via}.\n` +
          `        런타임에 클라이언트 참조 프록시로 치환되어 값이 조용히 사라지고 예외도 나지 않습니다.\n` +
          `        TypeScript는 끝까지 원래 타입으로 믿기 때문에 typecheck도 통과합니다.`,
        fix: `공용 값은 지시어 없는 모듈(예: src/lib/i18n/constants.ts)로 옮겨 양쪽이 함께 import하세요.`,
      });
    }
  }

  // ── R9: 앱 상단 프로바이더의 useSearchParams ──────────────────────────────
  if (r.startsWith('src/components/providers/')) {
    // 같은 파일에서 import와 호출 지점을 각각 세면 한 결함이 두 번 보고된다. 첫 지점만 낸다.
    let reported = false;
    const visit = (node) => {
      if (!reported && ts.isIdentifier(node) && node.text === 'useSearchParams') {
        reported = true;
        push({
          loc: `${r}:${pos(sf, node)}`,
          rule: 'react/no-search-params-in-provider',
          cause:
            `전 페이지를 감싸는 프로바이더에서 useSearchParams()를 사용했습니다.\n` +
            `        Suspense 경계가 폴백으로 떨어지며 정적 페이지의 HTML 본문이 통째로 비어버립니다\n` +
            `        (BAILOUT_TO_CLIENT_SIDE_RENDERING).`,
          fix:
            `쿼리스트링은 마운트 후 window.location에서 읽고 popstate를 구독하세요.\n` +
            `        기존 구현: src/components/providers/TabContext.tsx`,
        });
        return;
      }
      ts.forEachChild(node, visit);
    };
    ts.forEachChild(sf, visit);
  }
}

// ── 실행 ─────────────────────────────────────────────────────────────────────
const files = walk(SRC);
if (files.length === 0) {
  // 0개 스캔 후 성공 종료가 최대 실패 모드다 — 조용한 무증상 통과를 막는다.
  console.error('✖ arch-guard: 스캔한 파일이 0개입니다. 실행 위치나 src/ 경로를 확인하세요.');
  process.exit(1);
}
files.forEach(checkFile);

if (violations.length === 0) {
  console.log(`✔ arch-guard: 위반 없음 (${files.length} files)`);
  process.exit(0);
}

console.error(`\n✖ arch-guard — 아키텍처 규칙 위반 ${violations.length}건 (${files.length} files 검사)\n`);
for (const v of violations) {
  console.error(`${v.loc}  [${v.rule}]`);
  console.error(`  원인  ${v.cause}`);
  console.error(`  수정  ${v.fix}\n`);
}
process.exit(1);
