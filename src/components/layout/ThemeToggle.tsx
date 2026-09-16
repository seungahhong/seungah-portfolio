'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { useT } from '@/lib/i18n/useT';

const subscribeNever = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useT();
  // 하이드레이션 가드. 서버는 resolvedTheme을 알 수 없으므로 첫 렌더에서 아이콘을 그리면
  // 마크업이 어긋난다. `useEffect`로 setState하는 대신 `useSyncExternalStore`를 쓴다 —
  // 서버·하이드레이션 렌더에서는 getServerSnapshot(false)를, 그 이후에는 true를 돌려주므로
  // 같은 효과를 내면서 react-hooks/set-state-in-effect(eslint-plugin-react-hooks 7)를 위반하지 않는다.
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);

  if (!mounted) {
    return (
      <button
        className="w-8 h-8 rounded-full"
        aria-label={t('theme.toggle')}
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors duration-200"
      aria-label={t('theme.toggle')}
    >
      {isDark ? (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" fill="currentColor" />
          <path
            d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path
            d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}
