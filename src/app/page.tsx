import Image from 'next/image';

const projects = [
  {
    title: '포트폴리오 웹사이트',
    description: 'Next.js, Tailwind CSS로 만든 개발자 포트폴리오.',
    image:
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    link: '/projects/portfolio',
  },
  {
    title: '사진 갤러리',
    description: '반응형 이미지 그리드와 라이트박스 UI.',
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    link: '/projects/gallery',
  },
  {
    title: '블로그 플랫폼',
    description: 'MDX 기반의 기술 블로그 플랫폼.',
    image:
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    link: '/projects/blog',
  },
];

export default function Home() {
  // 홈페이지 메인 컴포넌트 - 프로젝트 목록 표시
  return (
    <section className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-gray-900 dark:text-white">
        Projects
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <a
            key={project.title}
            href={project.link}
            className="group bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden hover:scale-[1.03] transition-transform border border-gray-100 dark:border-neutral-700"
          >
            <div className="aspect-[4/3] w-full overflow-hidden">
              <Image
                width={300}
                height={300}
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                {project.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {project.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
