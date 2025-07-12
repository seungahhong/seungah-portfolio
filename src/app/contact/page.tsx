'use client';
import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setResult("메일이 성공적으로 전송되었습니다!");
        setForm({ name: "", email: "", message: "" });
      } else {
        console.error(res)
        setResult("메일 전송에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch {
      setResult("메일 전송 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Contact</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 flex flex-col gap-6 border border-gray-100 dark:border-neutral-700">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">보내는 사람 이름</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            placeholder="이름을 입력하세요"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">보내는 사람 이메일</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="이메일 주소를 입력하세요"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">메시지</label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            value={form.message}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            placeholder="보내고 싶은 메시지를 입력하세요"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold text-lg shadow-md hover:scale-105 transition-transform disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "전송 중..." : "메시지 보내기"}
        </button>
        {result && <div className="mt-4 text-center text-sm text-pink-600 dark:text-pink-300">{result}</div>}
      </form>
    </section>
  );
} 