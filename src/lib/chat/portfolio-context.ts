import { careers } from '../../helpers/datas/career';
import { blogStats, experienceYears, profileData } from '../../helpers/datas/profile';
import { personalProjects, presentations } from '../../helpers/datas/projects';
import { studyGroups } from '../../helpers/datas/studies';
import { faqIds, faqParams } from '../../helpers/datas/faq';
import { t, tList, hasTranslation } from '../i18n/t';
import { careerMetaValue } from '../i18n/career-meta';
import { blogHomeUrl, blogPostUrl } from '../blog';
import { localizedPath, type Locale } from '../i18n/constants';
import { selectDetails, toTerms, type DetailCandidate } from './context-selector';

/**
 * AI 챗 시스템 프롬프트.
 *
 * 화면과 동일한 i18n·데이터를 사용하므로, 챗 답변이 페이지 내용과 어긋나지 않는다.
 *
 * 프롬프트는 두 층이다.
 * - **core**: 항상 싣는다. 프로필·스킬·경력 색인·프로젝트·FAQ — "무엇이 있는지"를 빠짐없이 담되 얕게 담는다.
 * - **detail**: 질문에 걸린 것만 싣는다. 경력 항목의 불릿과 학습 아카이브 링크 — 깊지만 크다.
 *
 * 이렇게 나눈 이유는 Groq 무료 티어의 8,000 TPM이다. 전부 실으면 시스템 프롬프트만으로
 * ko 9,719 / en 8,208 토큰(o200k_base 실측)이라 한도를 넘는다. 선택 규칙은 `./context-selector.ts`.
 */

/**
 * 질문에 따라 추가로 싣는 상세 본문의 예산(토큰).
 * core(≈3,000) + detail(1,800) + 히스토리 + 응답(1,024)이 8,000 TPM 아래에 들어오도록 잡았다.
 */
const DETAIL_TOKEN_BUDGET = 1800;

/**
 * 토큰을 셀 수 없으므로(런타임에 토크나이저가 없다) 글자 수로 환산해 예산을 지킨다.
 * 실측(o200k_base)은 ko 2.29 / en 3.80 chars per token이고, 여기서는 그보다 **작게** 잡는다 —
 * 작게 잡아야 환산 오차가 예산 초과가 아니라 미달 쪽으로 난다.
 */
const CHARS_PER_TOKEN: Record<Locale, number> = { ko: 2.0, en: 3.4 };

/** 경력 항목 하나의 상세 본문 — 불릿·메타·근거 링크까지 */
function renderCareerItem(
  lc: Locale,
  company: (typeof careers)[number],
  item: (typeof careers)[number]['items'][number]
): string {
  const itemBase = `career.companies.${company.slug}.items.${item.id}` as const;

  const points = tList(lc, `${itemBase}.points`)
    .map((point) => `  - ${point}`)
    .join('\n');

  const meta = (item.meta ?? [])
    .map((entry) => `  - ${t(lc, `career.labels.${entry.labelKey}`)}: ${careerMetaValue(lc, entry)}`)
    .join('\n');

  const reference = item.blogSlug ? blogPostUrl(lc, item.blogSlug) : item.link;
  const link = reference
    ? `\n  - ${t(lc, 'career.labels.url')}: [${
        hasTranslation(lc, `${itemBase}.linkTitle`) ? t(lc, `${itemBase}.linkTitle`) : reference
      }](${reference})`
    : '';

  const heading = `### ${t(lc, `career.companies.${company.slug}.title`)} — ${t(lc, `${itemBase}.title`)} (${item.date})`;
  const anchor = `  - anchor: ${localizedPath(lc, `/career/${company.slug}`)}#${item.id}`;

  return `${heading}\n${anchor}\n${points}${meta ? `\n${meta}` : ''}${link}`;
}

/** 담당 업무 하나의 상세 본문 */
function renderCareerWork(
  lc: Locale,
  company: (typeof careers)[number],
  work: NonNullable<(typeof careers)[number]['works']>[number]
): string {
  const workBase = `career.companies.${company.slug}.works.${work.id}` as const;

  const points = tList(lc, `${workBase}.points`)
    .map((point) => `  - ${point}`)
    .join('\n');

  const heading = `### ${t(lc, `career.companies.${company.slug}.title`)} — ${t(lc, `${workBase}.title`)}${work.period ? ` (${work.period})` : ''}`;
  const anchor = `  - anchor: ${localizedPath(lc, `/career/${company.slug}`)}#${work.id}`;

  return `${heading}\n${anchor}\n${points}`;
}

/** 학습 아카이브 한 주제군의 링크 목록 */
function renderStudyGroup(lc: Locale, group: (typeof studyGroups)[number]): string {
  const groupBase = `study.groups.${group.id}` as const;
  const links = group.links
    .map((link) => `${t(lc, `${groupBase}.links.${link.id}`)}(${blogPostUrl(lc, link.blogSlug)})`)
    .join(', ');
  return `- ${t(lc, `${groupBase}.label`)}: ${links}`;
}

/**
 * 상세 본문 후보 전체. 렌더링은 문자열 조립뿐이라 미리 다 만들어도 싸다 —
 * 비싼 것은 만드는 비용이 아니라 Groq에 보내는 토큰이다.
 *
 * 매칭 용어는 **양쪽 로케일의 회사명·항목 제목**을 함께 담는다. 영어 페이지에서 "wadiz"로 묻든
 * 한국어로 "와디즈"로 묻든 같은 항목이 걸려야 하기 때문이다.
 */
function buildDetailCandidates(lc: Locale): DetailCandidate[] {
  const candidates: DetailCandidate[] = [];

  for (const company of careers) {
    const companyTerms = toTerms(
      company.slug,
      company.legalName,
      t('ko', `career.companies.${company.slug}.title`),
      t('en', `career.companies.${company.slug}.title`)
    );

    for (const item of company.items) {
      const itemBase = `career.companies.${company.slug}.items.${item.id}` as const;
      candidates.push({
        id: `career:${company.slug}:${item.id}`,
        terms: [
          ...companyTerms,
          ...toTerms(
            item.id,
            t('ko', `${itemBase}.title`),
            t('en', `${itemBase}.title`),
            ...(item.meta ?? []).map((entry) => careerMetaValue(lc, entry))
          ),
        ],
        text: renderCareerItem(lc, company, item),
      });
    }

    for (const work of company.works ?? []) {
      const workBase = `career.companies.${company.slug}.works.${work.id}` as const;
      candidates.push({
        id: `career:${company.slug}:${work.id}`,
        terms: [
          ...companyTerms,
          ...toTerms(work.id, t('ko', `${workBase}.title`), t('en', `${workBase}.title`)),
        ],
        text: renderCareerWork(lc, company, work),
      });
    }
  }

  for (const group of studyGroups) {
    const groupBase = `study.groups.${group.id}` as const;
    candidates.push({
      id: `study:${group.id}`,
      terms: toTerms(
        group.id,
        t('ko', `${groupBase}.label`),
        t('en', `${groupBase}.label`),
        ...group.links.flatMap((link) => [
          t('ko', `${groupBase}.links.${link.id}`),
          t('en', `${groupBase}.links.${link.id}`),
        ])
      ),
      text: renderStudyGroup(lc, group),
    });
  }

  return candidates;
}

export function buildPortfolioSystemPrompt(locale: string = 'ko', query: string = ''): string {
  const isKo = locale === 'ko';
  const lc: Locale = isKo ? 'ko' : 'en';
  const params = faqParams();

  const profileSection = `
# Profile
- Name: ${t('ko', 'profile.name')} (${t('en', 'profile.name')})
- Role: ${t('ko', 'profile.role')} / ${t('en', 'profile.role')}
- Headline: ${t(lc, 'profile.headline')}
- Experience: ${experienceYears} years across ${careers.length} companies
- Location: ${t(lc, 'profile.location')}
- Email: ${profileData.email}
- GitHub: ${profileData.github}
- Blog: ${blogHomeUrl(lc)} (${blogStats.articles} Korean articles / ${blogStats.documents} bilingual documents since ${blogStats.since})
- Portfolio: ${profileData.portfolio}
- Notion: ${profileData.notion}
`.trim();

  const skillsSection = `
# Skills
${profileData.skillGroupKeys
  .map(
    (key) =>
      `## ${t(lc, `about.skillGroups.${key}.label`)}\n${tList(lc, `about.skillGroups.${key}.items`).join(', ')}`
  )
  .join('\n\n')}
`.trim();

  // 경력 색인 — 회사마다 "무엇이 있는지"를 항목 제목·앵커까지 담되 불릿은 담지 않는다.
  // 불릿은 질문에 걸렸을 때만 아래 Details로 실린다.
  const careerIndexSection = `
# Career (index)
${careers
  .map((company) => {
    const base = `career.companies.${company.slug}` as const;
    const entries = [
      ...company.items.map((item) => `${t(lc, `${base}.items.${item.id}.title`)}(#${item.id})`),
      ...(company.works ?? []).map((work) => `${t(lc, `${base}.works.${work.id}.title`)}(#${work.id})`),
    ].join(' · ');

    return [
      `## ${t(lc, `${base}.title`)} (${company.period}) — ${localizedPath(lc, `/career/${company.slug}`)}`,
      t(lc, `${base}.description`),
      t(lc, `${base}.summary`),
      `Tech stack: ${company.techStack.join(', ')}`,
      `Entries: ${entries}`,
    ].join('\n');
  })
  .join('\n\n')}
`.trim();

  const personalProjectsSection = `
# Personal Projects
${personalProjects
  .map(
    (project) =>
      `- **${t(lc, `projects.items.${project.key}.title`)}** (${project.period}): ${project.localizedUrl === 'blog' ? blogHomeUrl(lc) : project.url}\n  - ${t(lc, `projects.items.${project.key}.description`)}\n  - Tech: ${project.techStack.join(', ')}\n  - Deploy: ${project.deploy}`
  )
  .join('\n')}
`.trim();

  const presentationsSection = `
# Presentations & Articles
${presentations
  .map((presentation) => {
    const sub = (presentation.links ?? [])
      .map(
        (link) =>
          `  - ${t(lc, `projects.items.${presentation.key}.links.${link.id}`)}: ${blogPostUrl(lc, link.blogSlug)}`
      )
      .join('\n');
    return `- ${t(lc, `projects.items.${presentation.key}.title`)} (${presentation.date}): ${presentation.blogSlug ? blogPostUrl(lc, presentation.blogSlug) : presentation.url}${sub ? `\n${sub}` : ''}`;
  })
  .join('\n')}
`.trim();

  // 학습 아카이브 색인 — 주제군과 글 수만. 개별 링크는 그 주제를 물었을 때만 실린다.
  const studyIndexSection = `
# Personal Study (tech blog archive — index)
${studyGroups
  .map((group) => `- ${t(lc, `study.groups.${group.id}.label`)} (${group.links.length})`)
  .join('\n')}
`.trim();

  const faqSection = `
# FAQ (verified answers — do not contradict these)
${faqIds
  .map((id) => `Q. ${t(lc, `faq.items.${id}.question`)}\nA. ${t(lc, `faq.items.${id}.answer`, params)}`)
  .join('\n\n')}
`.trim();

  const selected = selectDetails(
    buildDetailCandidates(lc),
    query,
    Math.floor(DETAIL_TOKEN_BUDGET * CHARS_PER_TOKEN[lc])
  );

  const detailSection = selected.length
    ? `\n\n---\n\n# Details (loaded for this question)\n\n${selected.map((entry) => entry.text).join('\n\n')}`
    : '';

  const languageInstruction = isKo
    ? '사용자가 한국어로 질문하면 한국어로, 영어로 질문하면 영어로 응답하세요.'
    : "Respond in the same language as the user's question. If the user writes in Korean, respond in Korean. If in English, respond in English.";

  return `You are an AI assistant for Seungah Hong's portfolio website. Your role is to answer questions about her career, projects, skills, and experience based on the provided portfolio data below.

## Instructions
- Answer questions helpfully and in detail based on the portfolio data provided
- ${languageInstruction}
- Format all responses as structured markdown: use headings (##, ###), bullet lists (-, *), bold (**text**), inline code (\`code\`), and code blocks when appropriate
- Lead with the answer, then supporting detail (answer-first)
- For career questions, include project names, technologies used, and key achievements
- When a career entry has an anchor (e.g. \`/career/wadiz#msw\`), include it so the user can jump straight to that section
- For skills questions, list relevant technologies with context
- Keep responses concise but comprehensive
- The Career index lists every entry by title and anchor. Detailed bullet points are only loaded for entries related to the current question — if the user asks about an entry whose details are not loaded, answer from the index and invite them to ask about that entry by name
- If asked about something not in the portfolio data, politely say you only have information from the portfolio
- Do not make up or fabricate information not present in the data

---

${profileSection}

---

${skillsSection}

---

${careerIndexSection}

---

${personalProjectsSection}

---

${presentationsSection}

---

${studyIndexSection}

---

${faqSection}${detailSection}
`;
}
