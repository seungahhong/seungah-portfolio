import { describe, it, expect, vi } from 'vitest';
import dayjs from 'dayjs';
import { careers } from '../career';
import { experienceYears } from '../profile';

/**
 * 구현과 **다른 경로**로 재직 개월을 센다.
 * 구현의 산식((endYear-startYear)*12 + …)을 복사하면 같은 버그를 재현할 뿐이므로,
 * 이미 의존성에 있는 dayjs의 월 diff를 쓴다.
 */
function monthsWorked(): number {
  return careers.reduce((total, company) => {
    const end = company.endDate ? dayjs(company.endDate) : dayjs();
    return total + end.diff(dayjs(company.startDate), 'month');
  }, 0);
}

const firstStart = careers.reduce(
  (earliest, company) => (company.startDate < earliest ? company.startDate : earliest),
  careers[0].startDate
);

describe('experienceYears — 파생값 계약', () => {
  // 값을 하드코딩하지 않는다. 재직 중인 회사가 있어 이 값은 시간에 따라 스스로 바뀐다.
  it('[AC-14.1] 독립 계산한 재직 개월의 내림 연수와 일치한다', () => {
    expect(experienceYears).toBe(Math.floor(monthsWorked() / 12));
  });

  it('[AC-14.2] 공백 기간이 제외된다 — 첫 입사 이후 경과보다 짧다', () => {
    const elapsedMonths = dayjs().diff(dayjs(firstStart), 'month');
    const workedMonths = monthsWorked();
    // 데이터에 실제 공백이 없으면 아래 부등식은 무증상 통과다. 먼저 공백 존재를 단정한다.
    expect(elapsedMonths - workedMonths).toBeGreaterThan(0);
    expect(workedMonths).toBeLessThan(elapsedMonths);
  });

  /**
   * "숫자를 따로 적지 않는다" — FAQ가 자기 값을 갖기 시작하면 본문과 JSON-LD가 어긋난다.
   *
   * 값 비교(`faqParams().years === experienceYears`)만으로는 부족하다 —
   * 하드코딩된 숫자가 우연히 현재 값과 같으면 그대로 통과한다(실측으로 확인된 구멍).
   * 단일 소스를 센티넬로 바꿔치고 FAQ가 따라오는지 본다.
   */
  it('[AC-14.3] FAQ가 같은 단일 소스를 참조한다 (우연한 값 일치가 아니라 실제 참조)', async () => {
    const SENTINEL = 9999;
    vi.resetModules();
    vi.doMock('../profile', async (importOriginal) => ({
      ...(await importOriginal<typeof import('../profile')>()),
      experienceYears: SENTINEL,
    }));
    const { faqParams: patched } = await import('../faq');
    expect(patched().years).toBe(SENTINEL);
    vi.doUnmock('../profile');
    vi.resetModules();
  });

  it('[AC-14.4] 정수이며 현실적인 범위 안에 있다', () => {
    expect(Number.isInteger(experienceYears)).toBe(true);
    expect(experienceYears).toBeGreaterThan(0);
    expect(experienceYears).toBeLessThan(60);
  });
});

describe('career 날짜 데이터 건전성', () => {
  // 역전된 날짜는 음수 개월을 만들어 합계를 조용히 줄인다.
  it('[AC-14.5] 모든 회사의 startDate가 endDate보다 앞선다', () => {
    for (const company of careers) {
      if (!company.endDate) continue;
      expect(company.startDate < company.endDate, company.slug).toBe(true);
    }
  });
});
