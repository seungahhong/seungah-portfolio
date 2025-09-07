import Image from 'next/image';
import { notFound } from 'next/navigation';

const projectDetails = {
  portfolio: {
    title: '포트폴리오 웹사이트',
    image:
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    description:
      'Next.js, Tailwind CSS로 만든 개발자 포트폴리오. 반응형, 다크모드, SEO 최적화까지 모두 구현.',
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    link: 'https://your-portfolio.com',
  },
  gallery: {
    title: '사진 갤러리',
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    description:
      '반응형 이미지 그리드와 라이트박스 UI, 이미지 업로드 및 다운로드 지원.',
    tech: ['React', 'Next.js', 'Cloudinary'],
    link: 'https://your-gallery.com',
  },
  blog: {
    title: '블로그 플랫폼',
    image:
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
    description: 'MDX 기반의 기술 블로그 플랫폼. 태그, 검색, 다크모드 지원.',
    tech: ['Next.js', 'MDX', 'Tailwind CSS'],
    link: 'https://your-blog.com',
  },
};

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await projectDetails[slug as keyof typeof projectDetails];
  if (!project) return notFound();
  return (
    <section className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
        {project.title}
      </h1>
      <Image
        width={400}
        height={400}
        src={project.image}
        alt={project.title}
        className="rounded-xl w-full mb-6 shadow-lg"
      />
      <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
        {project.description}
      </p>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          Tech Stack
        </h2>
        <ul className="flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <li
              key={t}
              className="bg-indigo-100 dark:bg-indigo-800/40 text-indigo-700 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-medium"
            >
              {t}
            </li>
          ))}
        </ul>
      </div>
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
      >
        Visit Project ↗
      </a>
    </section>
  );
}
