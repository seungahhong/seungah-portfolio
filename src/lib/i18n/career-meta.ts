import type { ICareerMeta } from '../../types';
import { t } from './t';
import type { Locale } from './constants';

/**
 * 경력 상세 메타의 표시 값.
 *
 * 직무명(`valueKey`)은 `career.roles.{key}`에서 번역을 읽고,
 * 기술명(`value`)은 언어와 무관하므로 데이터 값을 그대로 쓴다.
 * 화면(CareerDetailView)과 AI 챗 프롬프트가 같은 결과를 쓰도록 여기 한 곳에 둔다.
 */
export function careerMetaValue(locale: Locale, meta: ICareerMeta): string {
  return meta.valueKey ? t(locale, `career.roles.${meta.valueKey}`) : (meta.value ?? '');
}
