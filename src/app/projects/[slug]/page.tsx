import Image from 'next/image';
import { notFound } from 'next/navigation';
import { careerProjectDetailType } from '../../../helpers';

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const companyData =
    careerProjectDetailType[slug as keyof typeof careerProjectDetailType];
  if (!companyData) return notFound();

  return (
    <section className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-gray-900 dark:text-white">
        {companyData.header}
      </h1>

      <div className="space-y-12">
        {companyData.items.map((project, index) => (
          <div
            key={index}
            className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-neutral-700"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                {project.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {project.date}
              </p>
            </div>

            {project.images && project.images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {project.images.map((image, imgIndex) => (
                  <Image
                    key={imgIndex}
                    width={400}
                    height={300}
                    src={image.src}
                    alt={image.alt}
                    className="rounded-xl w-full shadow-lg object-cover"
                  />
                ))}
              </div>
            )}

            <div className="mb-6">
              {project.description['sub-discription'] && (
                <div className="space-y-4 mb-6">
                  {project.description['sub-discription'].map(
                    (desc, descIndex) => (
                      <p
                        key={descIndex}
                        className="text-gray-700 dark:text-gray-300 leading-relaxed"
                      >
                        {desc}
                      </p>
                    )
                  )}
                </div>
              )}

              {project.description.labels && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.description.labels.map((label, labelIndex) => (
                    <div
                      key={labelIndex}
                      className="border-l-4 border-indigo-500 pl-4"
                    >
                      <dt className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {label.name}
                      </dt>
                      <dd className="text-gray-700 dark:text-gray-300">
                        {label.value.type === 'link' ? (
                          <a
                            href={label.value.data}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            {label.value.title || label.value.data}
                          </a>
                        ) : (
                          <span>{label.value.data}</span>
                        )}
                      </dd>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
