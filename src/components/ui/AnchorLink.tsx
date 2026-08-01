interface AnchorLinkProps {
  /** 대상 앵커 — `#msw` 형태 */
  href: string;
  /** 스크린리더용 설명 (예: "MSW 도입 항목 링크") */
  label: string;
}

/**
 * 항목 단위 딥링크.
 * 카드/항목 제목 옆에 붙어 `/career/wadiz#msw` 같은 주소를 바로 복사할 수 있게 한다.
 */
export default function AnchorLink({ href, label }: AnchorLinkProps) {
  return (
    <a
      href={href}
      aria-label={label}
      className="shrink-0 text-[#86868b] opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-[var(--accent)] transition-opacity duration-200"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    </a>
  );
}
