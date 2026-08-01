import {
  blogStats,
  careers,
  experienceYears,
  faqIds,
  faqParams,
  personalProjects,
  presentations,
  profileData,
  studyGroups,
} from '@/helpers';
import { t, tList, hasTranslation } from '@/lib/i18n/t';
import { blogHomeUrl, blogPostUrl } from '@/lib/blog';
import { localizedUrl } from './config';

/**
 * `/llms.txt` 본문 생성.
 *
 * AI 검색·에이전트가 HTML 파싱 없이 사이트 전체를 한 번에 읽을 수 있도록,
 * 사실 밀도가 높고 구조가 단순한 평문을 제공한다.
 * 화면과 동일한 데이터·i18n을 사용하므로 내용이 어긋날 수 없다.
 *
 * 한국어를 정본으로, 영어 요약을 함께 실어 양쪽 언어권 질의에 모두 대응한다.
 */
export function buildLlmsTxt(): string {
  const lines: string[] = [];
  const params = faqParams();

  lines.push(`# ${t('ko', 'profile.name')} (${t('en', 'profile.name')}) — ${t('ko', 'profile.role')}`);
  lines.push('');
  lines.push(`> ${t('ko', 'profile.headline')}`);
  lines.push(`> (EN) ${t('en', 'profile.headline')}`);
  lines.push('');
  lines.push(`- Site (Korean): ${localizedUrl('ko', '/')}`);
  lines.push(`- Site (English): ${localizedUrl('en', '/')}`);
  lines.push(`- Email: ${profileData.email}`);
  lines.push(`- GitHub: ${profileData.github}`);
  lines.push(`- Blog: ${blogHomeUrl('ko')} (Korean) / ${blogHomeUrl('en')} (English)`);
  lines.push(`- Notion: ${profileData.notion}`);
  lines.push(`- Location: ${t('en', 'profile.location')}`);
  lines.push(`- Experience: ${experienceYears} years across ${careers.length} companies`);
  lines.push(
    `- Writing: ${blogStats.articles} Korean articles / ${blogStats.documents} bilingual documents since ${blogStats.since}`
  );
  lines.push('');

  lines.push('## Skills');
  for (const groupKey of profileData.skillGroupKeys) {
    const label = t('en', `about.skillGroups.${groupKey}.label`);
    const items = tList('en', `about.skillGroups.${groupKey}.items`);
    lines.push(`- ${label}: ${items.join(', ')}`);
  }
  lines.push('');

  lines.push('## Career');
  for (const company of careers) {
    const base = `career.companies.${company.slug}`;
    const path = `/career/${company.slug}`;

    lines.push('');
    lines.push(
      `### ${t('en', `${base}.title`)} / ${t('ko', `${base}.title`)} (${company.period}) — ${localizedUrl('en', path)} (ko: ${localizedUrl('ko', path)})`
    );
    lines.push(t('en', `${base}.summary`));
    lines.push(`(KO) ${t('ko', `${base}.summary`)}`);
    lines.push(`Tech: ${company.techStack.join(', ')}`);

    for (const item of company.items) {
      const itemBase = `${base}.items.${item.id}`;
      lines.push(`- ${t('en', `${itemBase}.title`)} (${item.date}) — ${localizedUrl('en', path)}#${item.id}`);
      for (const point of tList('en', `${itemBase}.points`)) {
        lines.push(`  - ${point}`);
      }
      const reference = item.blogSlug ? blogPostUrl('en', item.blogSlug) : item.link;
      if (reference) {
        const title = hasTranslation('en', `${itemBase}.linkTitle`)
          ? t('en', `${itemBase}.linkTitle`)
          : 'reference';
        lines.push(`  - ${title}: ${reference}`);
      }
    }

    for (const work of company.works ?? []) {
      const workBase = `${base}.works.${work.id}`;
      lines.push(
        `- ${t('en', `${workBase}.title`)}${work.period ? ` (${work.period})` : ''} — ${localizedUrl('en', path)}#${work.id}`
      );
      for (const point of tList('en', `${workBase}.points`)) {
        lines.push(`  - ${point}`);
      }
    }
  }
  lines.push('');

  lines.push('## Personal Projects');
  for (const project of personalProjects) {
    lines.push(
      `- ${t('en', `projects.items.${project.key}.title`)} (${project.period}): ${
        project.localizedUrl === 'blog' ? blogHomeUrl('en') : project.url
      } — ${project.techStack.join(', ')} / deployed on ${project.deploy}`
    );
    lines.push(`  - ${t('en', `projects.items.${project.key}.description`)}`);
  }
  lines.push('');

  lines.push('## Presentations & Articles');
  for (const presentation of presentations) {
    lines.push(
      `- ${t('en', `projects.items.${presentation.key}.title`)} (${presentation.date}): ${
        presentation.blogSlug ? blogPostUrl('en', presentation.blogSlug) : presentation.url
      }`
    );
    for (const link of presentation.links ?? []) {
      lines.push(`  - ${t('en', `projects.items.${presentation.key}.links.${link.id}`)}: ${blogPostUrl('en', link.blogSlug)}`);
    }
  }
  lines.push('');

  lines.push('## Personal Study');
  for (const group of studyGroups) {
    const groupBase = `study.groups.${group.id}`;
    lines.push(`### ${t('en', `${groupBase}.label`)}`);
    for (const link of group.links) {
      lines.push(`- ${t('en', `${groupBase}.links.${link.id}`)}: ${blogPostUrl('en', link.blogSlug)}`);
    }
  }
  lines.push('');

  lines.push('## FAQ');
  for (const id of faqIds) {
    lines.push('');
    lines.push(`### ${t('ko', `faq.items.${id}.question`)}`);
    lines.push(t('ko', `faq.items.${id}.answer`, params));
    lines.push(`(EN) ${t('en', `faq.items.${id}.question`)}`);
    lines.push(t('en', `faq.items.${id}.answer`, params));
  }
  lines.push('');

  return lines.join('\n');
}
