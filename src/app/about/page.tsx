export default function About() {
  return (
    <section className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">About Me</h1>
      <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
        안녕하세요! 저는 프론트엔드 개발자 <b>홍승아</b>입니다.<br />
        Next.js, React, Tailwind CSS를 활용한 모던 웹 개발을 좋아합니다.<br />
        사용자 경험과 성능, 그리고 아름다운 UI에 관심이 많습니다.
      </p>
      <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">Skills</h2>
      <ul className="flex flex-wrap gap-3 mb-8">
        <li className="bg-pink-100 dark:bg-pink-800/40 text-pink-700 dark:text-pink-200 px-3 py-1 rounded-full text-sm font-medium">Next.js</li>
        <li className="bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">React</li>
        <li className="bg-cyan-100 dark:bg-cyan-800/40 text-cyan-700 dark:text-cyan-200 px-3 py-1 rounded-full text-sm font-medium">TypeScript</li>
        <li className="bg-gray-100 dark:bg-gray-800/40 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium">Tailwind CSS</li>
        <li className="bg-yellow-100 dark:bg-yellow-800/40 text-yellow-700 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-medium">UI/UX</li>
      </ul>
      <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">Experience</h2>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
        <li>2022~현재: 프리랜서 프론트엔드 개발자</li>
        <li>2020~2022: OO 스타트업 웹 개발자</li>
        <li>2018~2020: 컴퓨터공학과 졸업</li>
      </ul>
    </section>
  );
} 