/**
 * JSON-LD 구조화 데이터 출력.
 *
 * 데이터는 저장소 내부 정적 데이터에서만 생성되므로 외부 입력이 섞이지 않지만,
 * `<`를 이스케이프해 스크립트 조기 종료로 인한 마크업 깨짐을 방지한다.
 */
export function JsonLd({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
      }}
    />
  );
}
