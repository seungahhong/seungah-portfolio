import { careerProjectValues } from '@/helpers';
import Image from 'next/image';

export default function Home() {
  // 홈페이지 메인 컴포넌트 - 프로젝트 목록 표시
  return (
    <section className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-gray-900 dark:text-white">
        Projects
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {careerProjectValues.map((project) => (
          <a
            key={project.title}
            href={`/projects/${project.href}`}
            className="group bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden hover:scale-[1.03] transition-transform border border-gray-100 dark:border-neutral-700"
          >
            <div className="aspect-[4/3] w-full overflow-hidden">
              <Image
                src={project.image.src}
                alt={project.image.alt}
                width={400}
                height={400}
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
