export interface IPersonalProject {
  key: string;
  image: string;
  url: string;
  techStack: string[];
  deploy: string;
}

export const personalProjects: IPersonalProject[] = [
  {
    key: 'portfolio',
    image: '/works_portfolio_1_logo.webp',
    url: 'https://seungahhong-portfolio.vercel.app/',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Playwright'],
    deploy: 'Vercel',
  },
  {
    key: 'blog',
    image: '/works_blog_1_logo.webp',
    url: 'https://seungahhong.github.io/',
    techStack: ['Gatsby', 'TypeScript', 'Styled-Components', 'Playwright'],
    deploy: 'GitHub Pages',
  },
];

export interface IPresentation {
  key: string;
  image: string;
  date: string;
  url: string;
}

export const presentations: IPresentation[] = [
  {
    key: 'wadizPerf',
    image: '/works_portfolio_2_logo.webp',
    date: '2022.08',
    url: 'https://blog.wadiz.kr/%ed%8e%80%eb%94%a9%ed%95%98%ea%b8%b0-%ec%83%81%ec%84%b8-%ed%8e%98%ec%9d%b4%ec%a7%80-%ec%84%b1%eb%8a%a5-%ea%b0%9c%ec%84%a0%ed%95%98%ea%b8%b0/',
  },
  {
    key: 'patent',
    image: '/works_patent_logo.jpeg',
    date: '2020.01',
    url: 'http://kportal.kipris.or.kr/kportal/search/total_search.do',
  },
];
