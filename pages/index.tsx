import { useState, useEffect } from "react";
import useSWR from "swr";
import VoteButtons from "../components/VoteButtons";
import ShareButtons from "../components/ShareButtons";
import FavoriteButton from "../components/FavoriteButton";
import Comments from "../components/Comments";
import { supabase } from "../lib/supabaseClient";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Home() {
  const [q, setQ] = useState("");
  const { data: popular } = useSWR("/api/popular", fetcher, {
    revalidateOnFocus: false,
  });
  const { data: trending } = useSWR("/api/trending", fetcher, {
    revalidateOnFocus: false,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const session = supabase.auth.session();
    setUser(session?.user ?? null);

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener?.unsubscribe();
  }, []);

  async function onSearch(e?: any) {
    if (e) e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    history.replaceState(null, "", `/?q=${encodeURIComponent(q)}`);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-slate-800 dark:to-slate-900 font-vazirmatn">
      {/* Header */}
      <header className="w-full flex justify-between items-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-blue-800 dark:text-blue-400">
          TopTenly
        </h1>
        {user && (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            خروج
          </button>
        )}
      </header>

      {/* Search Section */}
      <div className="w-full max-w-4xl">
        <form
          onSubmit={onSearch}
          className="flex flex-col md:flex-row gap-2 mb-4"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="مثلا: بهترین رستوران نیویورک"
            className="flex-1 p-4 rounded shadow-md border focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button className="btn btn-primary p-4 mt-2 md:mt-0">
            {loading ? "در حال جستجو..." : "جستجو"}
          </button>
        </form>
        <div className="text-sm opacity-70 mb-6">
          مثال‌ها: بهترین گوشی گیمینگ، بدترین شهر اسپانیا برای سفر، بهترین سریال
          ۲۰۲۴
        </div>
      </div>

      {/* Popular & Trending */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-6">
        <div className="card p-6 rounded-xl shadow hover:shadow-lg transition bg-white dark:bg-slate-900">
          <h2 className="text-xl font-semibold mb-2">بیشترین جستجوها</h2>
          <ol className="space-y-1">
            {(popular || []).map((p: any) => (
              <li key={p.query} className="flex justify-between">
                <span>{p.query}</span>
                <span className="opacity-60">{p.count}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="card p-6 rounded-xl shadow hover:shadow-lg transition bg-white dark:bg-slate-900">
          <h2 className="text-xl font-semibold mb-2">ترندترین تاپ ۱۰ ها</h2>
          <ol className="space-y-1">
            {(trending || []).map((t: any) => (
              <li key={t.id} className="flex justify-between">
                <a
                  href={`/?q=${encodeURIComponent(t.title)}`}
                  className="text-blue-600 dark:text-blue-400"
                >
                  {t.title}
                </a>
                <span className="opacity-60">{t.vote_sum}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Search Result */}
      <div className="w-full max-w-4xl">
        {result && <ResultView data={result} />}
      </div>
    </div>
  );
}

function ResultView({ data }: any) {
  return (
    <div className="card p-4 rounded-xl shadow hover:shadow-lg transition bg-white/70 dark:bg-slate-900/40">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">{data.list.title}</h2>
          <p className="text-sm opacity-70">منبع: {data.list.source}</p>
        </div>
        <div className="flex gap-2 mt-2">
          <FavoriteButton listId={data.list.id} />
          <ShareButtons title={`تاپ ۱۰: ${data.list.title}`} />
        </div>
      </div>
      <ol className="mt-4 space-y-3">
        {data.list.items.map((it: any, idx: number) => (
          <li
            key={it.id}
            className="p-3 border rounded-xl bg-white/70 dark:bg-slate-900/40"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">
                  #{idx + 1} — {it.title}
                </div>
                {it.description && (
                  <div className="text-sm opacity-80">{it.description}</div>
                )}
              </div>
              <div className="text-right text-sm">
                <div>امتیاز: {it.score ?? 0}</div>
                <a
                  className="text-blue-600 dark:text-blue-400"
                  href={`/item/${it.id}`}
                >
                  صفحهٔ آیتم
                </a>
              </div>
            </div>
            <div className="mt-2">
              <VoteButtons listId={data.list.id} itemId={it.id} />
            </div>
          </li>
        ))}
      </ol>
      <Comments listId={data.list.id} />
    </div>
  );
}
