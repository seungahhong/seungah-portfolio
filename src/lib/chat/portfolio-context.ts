import { careerProjectDetailType, careerProjectValues } from '../../helpers/datas/career';
import { profileData } from '../../helpers/datas/profile';
import { personalProjects, presentations } from '../../helpers/datas/projects';

export function buildPortfolioSystemPrompt(locale: string = 'ko'): string {
  const isKo = locale === 'ko';

  // Profile section
  const profileSection = `
# Profile
- Name: ${profileData.name.ko} (${profileData.name.en})
- Role: ${profileData.role.ko} / ${profileData.role.en}
- Email: ${profileData.email}
- GitHub: ${profileData.github}
- Blog: ${profileData.blog}
- Portfolio: ${profileData.portfolio}
- Notion: ${profileData.notion}
`.trim();

  // Skills section
  const skillsSection = `
# Skills
${profileData.skills.map(s => `## ${s.category}\n${s.items.join(', ')}`).join('\n\n')}
`.trim();

  // Career overview
  const careerOverviewSection = `
# Career Overview
${careerProjectValues.map(c => `- **${c.title}** (${c.date}): ${c.description}`).join('\n')}
`.trim();

  // Career details
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const careerDetailSections = Object.entries(careerProjectDetailType).map(([_, company]) => {
    const projects = company.items.map(item => {
      const subDesc = item.description['sub-discription'];
      const descArray = Array.isArray(subDesc) ? subDesc : [subDesc];
      const descriptions = descArray.map(d => `  - ${d}`).join('\n');
      const labels = item.description.labels.map(l => {
        const val = l.value;
        if (val.type === 'link') {
          return `  - ${l.name}: [${val.title || val.data}](${val.data})`;
        }
        return `  - ${l.name}: ${val.data}`;
      }).join('\n');
      return `### ${item.title} (${item.date})\n${descriptions}\n${labels}`;
    }).join('\n\n');

    return `## ${company.header}\n${projects}`;
  }).join('\n\n');

  // Personal projects section
  const personalProjectsSection = `
# Personal Projects
${personalProjects.map(p => `- **${p.key}**: ${p.url}\n  - Tech: ${p.techStack.join(', ')}\n  - Deploy: ${p.deploy}`).join('\n')}
`.trim();

  // Presentations section
  const presentationsSection = `
# Presentations & Articles
${presentations.map(p => `- ${p.key} (${p.date}): ${p.url}`).join('\n')}
`.trim();

  const languageInstruction = isKo
    ? '사용자가 한국어로 질문하면 한국어로, 영어로 질문하면 영어로 응답하세요.'
    : 'Respond in the same language as the user\'s question. If the user writes in Korean, respond in Korean. If in English, respond in English.';

  return `You are an AI assistant for Seungah Hong's portfolio website. Your role is to answer questions about her career, projects, skills, and experience based on the provided portfolio data below.

## Instructions
- Answer questions helpfully and in detail based on the portfolio data provided
- ${languageInstruction}
- Format all responses as structured markdown: use headings (##, ###), bullet lists (-, *), bold (**text**), inline code (\`code\`), and code blocks when appropriate
- For career questions, include project names, technologies used, and key achievements
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
`;
}
