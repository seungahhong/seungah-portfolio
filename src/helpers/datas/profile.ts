export interface IProfileData {
  name: { ko: string; en: string };
  role: { ko: string; en: string };
  email: string;
  github: string;
  blog: string;
  portfolio: string;
  notion: string;
  skills: {
    category: string;
    items: string[];
  }[];
}

export const profileData: IProfileData = {
  name: { ko: '홍승아', en: 'Seungah Hong' },
  role: { ko: '프론트엔드 개발자', en: 'Frontend Developer' },
  email: 'gmm117@naver.com',
  github: 'https://github.com/seungahhong',
  blog: 'https://seungahhong.github.io/',
  portfolio: 'https://seungahhong-portfolio.vercel.app/',
  notion: 'https://material-debt-c1c.notion.site/daa60481e37840ea9e1b7e1b12269942',
  skills: [
    {
      category: 'Frontend',
      items: [
        'React', 'TypeScript', 'Next.js', 'Gatsby',
        'Redux', 'Tanstack Query', 'React Hook Form',
        'Tailwind CSS', 'Styled-Components', 'SCSS',
        'HTML5', 'CSS3', 'JavaScript',
      ],
    },
    {
      category: 'Testing',
      items: ['Jest', 'Playwright', 'Storybook', 'MSW'],
    },
    {
      category: 'Tools',
      items: ['Git', 'Jira', 'Confluence', 'Slack'],
    },
  ],
};
