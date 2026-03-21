export type CardType = 'career' | 'profile' | null;

const CAREER_KEYWORDS = [
  '경력', '와디즈', 'wadiz', '한글과컴퓨터', 'hancom', '한컴',
  '오스템', 'osstem', '블루버드', 'bluebird', 'career', '회사',
  'company', '직장', '이직', '업무', '펀딩', '스토어',
];

const PROFILE_KEYWORDS = [
  '소개', '프로필', 'profile', 'about', '누구', 'who',
  '이메일', 'email', '깃허브', 'github', '스킬', 'skill',
  '기술', 'tech', '블로그', 'blog', '연락',
];

export function detectCardType(userMessage: string): CardType {
  const lower = userMessage.toLowerCase();
  if (CAREER_KEYWORDS.some(k => lower.includes(k))) return 'career';
  if (PROFILE_KEYWORDS.some(k => lower.includes(k))) return 'profile';
  return null;
}
