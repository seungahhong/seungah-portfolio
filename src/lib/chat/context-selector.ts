/**
 * 시스템 프롬프트의 "상세 본문"을 질문과 관련된 것만 골라 예산 안에 담는다.
 *
 * 왜 필요한가: Groq 무료 티어의 한도는 8,000 TPM이다. 전체 포트폴리오를 그대로 실으면
 * 시스템 프롬프트만으로 ko 9,719 / en 8,208 토큰(o200k_base 실측)이라 첫 요청부터 한도를 넘는다.
 * 그래서 항상 싣는 core(개요·색인·FAQ)와 질문에 따라 싣는 detail을 나눈다.
 *
 * 매칭은 한국어에 어절 경계가 없다는 전제 위에 있다 — 질의를 토큰으로 쪼개 교집합을 보는 대신,
 * 후보가 가진 용어가 질의 문자열에 **포함되는지**를 본다("와디즈에서"는 "와디즈"를 포함한다).
 * 이 방향이라 조사·어미가 붙어도 매칭된다. 대신 질의에만 있는 표현은 잡지 못한다.
 */

/** 상세 본문 후보 하나. `terms`가 하나라도 질의에 걸리면 후보가 된다. */
export interface DetailCandidate {
  /** 진단·테스트용 식별자 (`career:wadiz:msw`) */
  id: string;
  /** 매칭 대상 용어. `toTerms()`로 정규화해서 넣는다 */
  terms: string[];
  /** 프롬프트에 실릴 본문 */
  text: string;
}

/**
 * 매칭에서 걸러낼 한국어 연결어. 어느 항목에나 들어 있어 변별력이 없다.
 * 실제 기술어(`개선`·`구축`·`도입`)는 변별력이 있으므로 남긴다.
 */
const STOPWORDS = new Set([
  '및', '그리고', '위한', '통한', '통해', '대한', '있는', '하는', '되는', '에서', '으로',
  'and', 'the', 'for', 'with', 'via', 'from', 'into',
]);

/**
 * 최고 점수 대비 이 비율에 못 미치는 후보는 버린다.
 *
 * 점수가 0보다 크기만 하면 싣던 때는 "React 상태관리 공부한 글"에 흔한 기술명 하나(`react`)만
 * 걸린 경력 항목들이 따라붙어, 정작 물어본 학습 아카이브와 예산을 나눠 썼다(실측 4.95 대 1.37).
 * 절대 임계값은 질의 길이에 따라 흔들리므로 상대값을 쓴다.
 */
const RELEVANCE_FLOOR = 0.35;

/** 라틴 문자만으로 이뤄진 짧은 용어는 오탐이 많다(`ai`가 `said`에 걸린다) */
const MIN_LATIN_LENGTH = 3;
const MIN_TERM_LENGTH = 2;

/**
 * 문구를 매칭 가능한 용어 배열로 정규화한다.
 * 구(句)는 통째로도, 낱말로도 담는다 — 통째 매칭이 더 강한 신호지만 점수는 같다.
 */
export function toTerms(...phrases: (string | undefined)[]): string[] {
  const out = new Set<string>();

  for (const phrase of phrases) {
    if (!phrase) continue;
    const lower = phrase.toLowerCase();
    const words = lower.split(/[^0-9a-z가-힣.+#]+/).filter(Boolean);

    for (const word of [lower, ...words]) {
      const term = word.replace(/^[.+#]+|[.+#]+$/g, '');
      if (term.length < MIN_TERM_LENGTH) continue;
      if (STOPWORDS.has(term)) continue;
      if (/^[0-9a-z.+#]+$/.test(term) && term.length < MIN_LATIN_LENGTH) continue;
      out.add(term);
    }
  }

  return [...out];
}

/**
 * 용어별 가중치를 IDF로 준다 — 후보 여럿이 공유하는 용어일수록 가볍다.
 *
 * 가중치가 없으면 회사명("와디즈")이나 흔한 기술명("React")처럼 **어느 항목에나 있는 용어**가
 * 그 항목만 가진 용어("msw", "상태관리")와 같은 무게가 된다. 실제로 그래서
 * "React 상태관리 공부한 글 있나요?"에 와디즈 경력 5건이 딸려 왔다.
 * 손으로 정한 가중치 대신 후보 분포에서 계산하므로, 데이터가 늘어도 따로 조정할 것이 없다.
 */
function inverseDocumentFrequency(candidates: DetailCandidate[]): Map<string, number> {
  const frequency = new Map<string, number>();

  for (const candidate of candidates) {
    for (const term of new Set(candidate.terms)) {
      frequency.set(term, (frequency.get(term) ?? 0) + 1);
    }
  }

  const total = candidates.length;
  const idf = new Map<string, number>();
  for (const [term, count] of frequency) {
    idf.set(term, Math.log(1 + total / count));
  }

  return idf;
}

/** 질의에 걸린 용어들의 가중치 합 */
export function scoreCandidate(
  candidate: DetailCandidate,
  query: string,
  idf: Map<string, number>
): number {
  const lower = query.toLowerCase();
  let score = 0;

  for (const term of new Set(candidate.terms)) {
    if (term && lower.includes(term)) score += idf.get(term) ?? 1;
  }

  return score;
}

/**
 * 점수순으로 예산이 허락하는 만큼만 고른다.
 *
 * 예산을 넘는 후보는 **건너뛰고 다음 후보를 본다**(중단하지 않는다) — 큰 항목 하나가
 * 작은 항목 여럿을 통째로 막지 않게 하기 위해서다. 반환 순서는 원래 순서(= 표시 순서)를 지킨다.
 * 아무것도 걸리지 않으면 빈 배열이다. 그때는 core의 개요·색인만으로 답하게 둔다.
 */
export function selectDetails(
  candidates: DetailCandidate[],
  query: string,
  charBudget: number
): DetailCandidate[] {
  const idf = inverseDocumentFrequency(candidates);

  const scored = candidates
    .map((candidate, index) => ({ candidate, index, score: scoreCandidate(candidate, query, idf) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const cutoff = (scored[0]?.score ?? 0) * RELEVANCE_FLOOR;
  const relevant = scored.filter((entry) => entry.score >= cutoff);

  const picked: typeof scored = [];
  let used = 0;

  for (const entry of relevant) {
    const cost = entry.candidate.text.length;
    if (used + cost > charBudget) continue;
    picked.push(entry);
    used += cost;
  }

  return picked.sort((a, b) => a.index - b.index).map((entry) => entry.candidate);
}
