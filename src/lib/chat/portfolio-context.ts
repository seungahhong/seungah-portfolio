import { careers } from '../../helpers/datas/career';
import { blogStats, experienceYears, profileData } from '../../helpers/datas/profile';
import { personalProjects, presentations } from '../../helpers/datas/projects';
import { studyGroups } from '../../helpers/datas/studies';
import { faqIds, faqParams } from '../../helpers/datas/faq';
import { t, tList, hasTranslation } from '../i18n/t';
import { blogHomeUrl, blogPostUrl } from '../blog';
import { localizedPath, type Locale } from '../i18n/constants';

/**
 * AI 챗 시스템 프롬프트.
 *
 * 화면과 동일한 i18n·데이터를 사용하므로, 챗 답변이 페이지 내용과 어긋나지 않는다.
 * 프롬프트 본문은 사용자의 로케일에 맞춰 구성한다.
 */
export function buildPortfolioSystemPrompt(locale: string = 'ko'): string {
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

  const careerOverviewSection = `
# Career Overview
${careers
  .map(
    (company) =>
      `- **${t(lc, `career.companies.${company.slug}.title`)}** (${company.period}) — ${t(lc, `career.companies.${company.slug}.description`)} · detail page: ${localizedPath(lc, `/career/${company.slug}`)}`
  )
  .join('\n')}
`.trim();

  const careerDetailSections = careers
    .map((company) => {
      const base = `career.companies.${company.slug}`;

      const technical = company.items
        .map((item) => {
          const itemBase = `${base}.items.${item.id}`;
          const points = tList(lc, `${itemBase}.points`)
            .map((point) => `  - ${point}`)
            .join('\n');
          const meta = (item.meta ?? [])
            .map((entry) => `  - ${t(lc, `career.labels.${entry.labelKey}`)}: ${entry.value}`)
            .join('\n');
          const reference = item.blogSlug ? blogPostUrl(lc, item.blogSlug) : item.link;
          const link = reference
            ? `\n  - ${t(lc, 'career.labels.url')}: [${
                hasTranslation(lc, `${itemBase}.linkTitle`) ? t(lc, `${itemBase}.linkTitle`) : reference
              }](${reference})`
            : '';
          return `### ${t(lc, `${itemBase}.title`)} (${item.date})\n  - anchor: ${localizedPath(lc, `/career/${company.slug}`)}#${item.id}\n${points}${meta ? `\n${meta}` : ''}${link}`;
        })
        .join('\n\n');

      const works = (company.works ?? [])
        .map((work) => {
          const workBase = `${base}.works.${work.id}`;
          const points = tList(lc, `${workBase}.points`)
            .map((point) => `  - ${point}`)
            .join('\n');
          return `### ${t(lc, `${workBase}.title`)}${work.period ? ` (${work.period})` : ''}\n  - anchor: ${localizedPath(lc, `/career/${company.slug}`)}#${work.id}\n${points}`;
        })
        .join('\n\n');

      return [
        `## ${t(lc, `${base}.title`)} (${company.period}) — ${localizedPath(lc, `/career/${company.slug}`)}`,
        t(lc, `${base}.summary`),
        `Tech stack: ${company.techStack.join(', ')}`,
        '',
        technical,
        works ? `\n${works}` : '',
      ].join('\n');
    })
    .join('\n\n');

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

  const studySection = `
# Personal Study (tech blog archive)
${studyGroups
  .map((group) => {
    const groupBase = `study.groups.${group.id}`;
    const links = group.links
      .map((link) => `${t(lc, `${groupBase}.links.${link.id}`)}(${blogPostUrl(lc, link.blogSlug)})`)
      .join(', ');
    return `- ${t(lc, `${groupBase}.label`)}: ${links}`;
  })
  .join('\n')}
`.trim();

  const faqSection = `
# FAQ (verified answers — do not contradict these)
${faqIds
  .map((id) => `Q. ${t(lc, `faq.items.${id}.question`)}\nA. ${t(lc, `faq.items.${id}.answer`, params)}`)
  .join('\n\n')}
`.trim();

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
- When a career item has an anchor (e.g. \`/career/wadiz#msw\`), include it so the user can jump straight to that section
- For skills questions, list relevant technologies with context
- Keep responses concise but comprehensive
- If asked about something not in the portfolio data, politely say you only have information from the portfolio
- Do not make up or fabricate information not present in the data

---

${profileSection}

---

${skillsSection}

---

${careerOverviewSection}

---

# Career Details

${careerDetailSections}

---

${personalProjectsSection}

---

${presentationsSection}

---

${studySection}

---

${faqSection}
`;
}
