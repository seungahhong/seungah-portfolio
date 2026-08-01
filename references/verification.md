# 검증 절차

**이 저장소에는 테스트가 없다.** 그리고 이 프로젝트는 lint·typecheck·build를 모두 통과하면서도
배포본이 깨지는 사고를 두 번 겪었다(정적 페이지 빈 HTML, 서버 로케일 무시). 따라서
**빌드 산출물을 실제로 긁어보는 단계까지 해야 검증이 끝난다.**

## 1. 정적 검사

```bash
pnpm lint        # eslint src  (next lint는 Next 16에서 제거됨)
pnpm typecheck   # tsc --noEmit
pnpm build
```

`pnpm typecheck`가 `.next/types/validator.ts`에서 "Cannot find module" 오류를 내면 라우트 파일을
옮긴 뒤 재빌드하지 않은 것이다. `rm -rf .next && pnpm build` 후 다시 확인한다.

빌드 출력의 라우트 표에서 **`/`와 `/en`이 `○`(Static)인지** 확인한다. `ƒ`(Dynamic)로 바뀌었다면
어딘가에서 요청 단위 API를 읽기 시작한 것이다.

## 2. 런타임 확인 (필수)

```bash
pnpm build && PORT=3939 pnpm start &
```

### 본문이 비어 있지 않은지
가장 중요한 검사다. 정적 페이지가 CSR로 떨어지면 HTML에 본문이 없다.

```bash
curl -s localhost:3939/career/wadiz | grep -c 'BAILOUT_TO_CLIENT_SIDE_RENDERING'   # 0이어야 함
curl -s localhost:3939/career/wadiz | grep -c '<h1'                                 # 1 이상
```

### 두 로케일이 실제로 다른 언어인지
```bash
curl -s localhost:3939/    | grep -o '<html lang="[^"]*"'   # ko
curl -s localhost:3939/en  | grep -o '<html lang="[^"]*"'   # en
curl -s localhost:3939/en  | grep -o '<h1[^>]*>[^<]*</h1>'  # 영문이어야 함
```

### i18n 키 누락 / 자리표시자 누수
화면에 `career.companies.x.y`나 `{years}`가 그대로 보이면 안 된다.

```bash
curl -s localhost:3939/en | python3 -c "
import sys,re
s=re.sub(r'<script.*?</script>','',sys.stdin.read(),flags=re.S)
t=re.sub(r'<[^>]+>',' ',s)
print('keys :', sorted(set(re.findall(r'\b(?:career\.companies|projects\.items|study\.groups|faq\.items)\.[\w.-]+', t)))[:5] or 'ok')
print('holes:', sorted(set(re.findall(r'\{(years|companies|count|links|since|articles|documents|title)\}', t))) or 'ok')"
```

### 깨진 앵커
```bash
curl -s localhost:3939/ | python3 -c "
import sys,re
s=sys.stdin.read()
ids=set(re.findall(r'id=\"([^\"]+)\"',s)); anc=set(re.findall(r'href=\"#([^\"]+)\"',s))
print(sorted(a for a in anc if a not in ids) or 'ok')"
```

### 기타
```bash
curl -s localhost:3939/sitemap.xml | grep -c '<url>'      # 라우트 수와 일치
curl -s localhost:3939/llms.txt | head -20
curl -s -o /dev/null -w '%{http_code}\n' localhost:3939/career/nope   # 404
```

## 3. ko/en JSON 파리티

키 구조와 배열 길이가 완전히 같아야 한다.

```bash
python3 -c "
import json
def shape(n,p=''):
    if isinstance(n,dict): return [x for k in n for x in shape(n[k],f'{p}.{k}')]
    if isinstance(n,list): return [f'{p}[]={len(n)}']
    return [p]
ko=json.load(open('src/lib/i18n/ko.json')); en=json.load(open('src/lib/i18n/en.json'))
a,b=shape(ko),shape(en)
print('ko-only:', sorted(set(a)-set(b))[:10])
print('en-only:', sorted(set(b)-set(a))[:10])
print('parity :', a==b)"
```

## 4. 외부 링크

경력 근거 링크나 블로그 slug를 건드렸다면 실제로 열어본다.

```bash
curl -sL -o /dev/null -w '%{http_code}\n' https://seungahhong.github.io/en/posts/<slug>/
```

과거에 와디즈 뉴스 링크 3건이 한 칸씩 밀려 항목과 다른 페이지를 가리킨 적이 있다.
상태 코드만이 아니라 **제목이 항목과 맞는지**까지 확인한다.

## 마무리

작업이 끝나면 서버를 정리한다.

```bash
lsof -ti:3939 | xargs -r kill -9
```
