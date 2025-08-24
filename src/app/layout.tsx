'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 다크모드 토글 상태
  const [dark, setDark] = useState(false);
  useEffect(() => {
    // 초기 상태: localStorage 또는 prefers-color-scheme
    const saved = localStorage.getItem('theme');
    if (
      saved === 'dark' ||
      (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
      setDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDark(false);
    }
  }, []);
  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-neutral-900`}
      >
        <div className="min-h-screen flex">
          {/* Sidebar */}
          <aside className="w-64 bg-gradient-to-b from-pink-500 via-purple-500 to-indigo-500 text-white flex flex-col items-center py-10 px-6 gap-10 shadow-lg">
            <div className="text-3xl font-bold tracking-tight mb-8">
              <Link href="/">
                <span className="font-extrabold">
                  HONG
                  <br />
                  SEUNG-AH
                </span>
              </Link>
            </div>
            <nav className="flex flex-col gap-6 text-lg font-medium">
              <Link href="/about" className="hover:underline">
                About
              </Link>
              <Link href="/projects" className="hover:underline">
                Projects
              </Link>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </nav>
            <div className="mt-auto text-xs opacity-70">{`© ${new Date().getFullYear()} SEUNG-AH`}</div>
          </aside>
          {/* Main Content */}
          <main className="flex-1 min-h-screen px-4 sm:px-12 py-10 relative">
            {/* 다크모드 토글 버튼 */}
            <button
              onClick={toggleDark}
              className="absolute top-4 right-4 z-10 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-full p-2 shadow hover:scale-110 transition"
              aria-label="Toggle dark mode"
            >
              {dark ? (
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" fill="currentColor" />
                  <path
                    d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
