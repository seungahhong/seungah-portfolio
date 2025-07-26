import Image from "next/image";

export default function About() {
  return (
    <section className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">About Me</h1>
      {/* 프로필 섹션 */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        {/* 프로필 이미지 */}
        <div className="flex-shrink-0">
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl border-4 border-white dark:border-neutral-700">
            <Image
              src="/profile_logo.webp"
              alt="홍승아 프로필 이미지"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
        {/* 소개 텍스트 */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">홍승아</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            안녕하세요! 프론트엔드 개발자 <b>홍승아</b>입니다.
          </p>
          <div className="text-gray-600 dark:text-gray-400 mb-6">
            <p className="mt-1">변화하는 기술에 대해서 관심을 가지고 끊임없이 배우려고 노력하는 자세를 가졌습니다.</p>
            <p className="mt-1">개발 공유에 대한 중요성을 알고 있기에 현재도 개인 기술블로그, Notion에 기술을 공유하고 있습니다.</p>
            <p className="mt-1">개발 시 걸림돌이 되는 업무에 대해서는 적극적으로 해결하기 위해서 노력하고 있습니다.</p>
          </div>
          {/* 연락처 정보 */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <span>📍 수원, 대한민국</span>
            <span>📧 <a href="mailto:gmm117@naver.com" className="underline hover:text-pink-500">gmm117@naver.com</a></span>
            <span>💼 프론트엔드 개발자</span>
          </div>
          {/* 링크 정보 */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
            <a href="https://github.com/seungahhong" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Github</a>
            <a href="https://seungahhong.github.io/" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-600">Blog</a>
            <a href="https://material-debt-c1c.notion.site/daa60481e37840ea9e1b7e1b12269942" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-600">Notion</a>
          </div>
        </div>
      </div>
      {/* Skills 섹션 */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Skills</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-800/40 dark:to-pink-900/40 text-pink-700 dark:text-pink-200 px-4 py-3 rounded-xl text-center font-medium shadow-sm">
            <div className="text-lg mb-1">⚛️</div>
            Next.js
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800/40 dark:to-blue-900/40 text-blue-700 dark:text-blue-200 px-4 py-3 rounded-xl text-center font-medium shadow-sm">
            <div className="text-lg mb-1">⚡</div>
            React
          </div>
          <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-800/40 dark:to-cyan-900/40 text-cyan-700 dark:text-cyan-200 px-4 py-3 rounded-xl text-center font-medium shadow-sm">
            <div className="text-lg mb-1">🔷</div>
            TypeScript
          </div>
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800/40 dark:to-gray-900/40 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-xl text-center font-medium shadow-sm">
            <div className="text-lg mb-1">🎨</div>
            Tailwind CSS
          </div>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800/40 dark:to-yellow-900/40 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded-xl text-center font-medium shadow-sm">
            <div className="text-lg mb-1">✨</div>
            UI/UX
          </div>
        </div>
      </div>
      {/* Experience 섹션 */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Experience</h2>
        <div className="space-y-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h3 className="font-semibold text-gray-900 dark:text-white">프론트엔드 개발자</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">2022 ~ 현재</p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">다양한 프로젝트에서 Next.js, React를 활용한 웹 개발</p>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h3 className="font-semibold text-gray-900 dark:text-white">OO 스타트업 웹 개발자</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">2020 ~ 2022</p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">스타트업 환경에서의 풀스택 웹 개발 경험</p>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <h3 className="font-semibold text-gray-900 dark:text-white">컴퓨터공학과 졸업</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">2018 ~ 2020</p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">컴퓨터공학 전공으로 소프트웨어 개발 기초 학습</p>
          </div>
        </div>
      </div>
    </section>
  );
} 