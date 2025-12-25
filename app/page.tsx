"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("https://6bp6wbjr9i.execute-api.ap-south-1.amazonaws.com/prod/health", { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err:any) {
        if (err.name !== "AbortError") setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">datagate.co.in</h1>

        <section className="mb-6">
          <p className="text-gray-600">Home page demo showing a GET API call using fetch.</p>
        </section>

        <section className="mb-6">
          {loading && (
            <div className="flex items-center gap-3 text-gray-500">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <span>Loading data…</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
              <strong className="block">Error</strong>
              <div>{error}</div>
            </div>
          )}

          {!loading && !error && data && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 rounded">
                <pre className="text-sm text-gray-700 overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
              </div>

              <div className="flex gap-3">
                <a
                  href="/"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Refresh
                </a>
                <button
                  onClick={() => {
                    setData(null);
                    setLoading(true);
                    setError(null);
                    // trigger re-fetch by toggling state; simplest is to reload window
                    window.location.reload();
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Force reload
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
