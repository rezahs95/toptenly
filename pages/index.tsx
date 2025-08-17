import { useState } from 'react';
import useSWR from 'swr';
import VoteButtons from '../components/VoteButtons';
import ShareButtons from '../components/ShareButtons';
import FavoriteButton from '../components/FavoriteButton';
import Comments from '../components/Comments';

const fetcher = (url:string) => fetch(url).then(r=>r.json());

export default function Home(){
  const [q, setQ] = useState('');
  const { data: popular } = useSWR('/api/popular', fetcher, { revalidateOnFocus: false });
  const { data: trending } = useSWR('/api/trending', fetcher, { revalidateOnFocus: false });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function onSearch(e?:any){
    if (e) e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    const res = await fetch('/api/search',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ query: q })});
    const data = await res.json();
    setResult(data);
    setLoading(false);
    history.replaceState(null, '', `/?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-3xl font-bold mb-4">کشف بهترین‌ها و بدترین‌ها — تاپ ۱۰ در هر چیز</h1>
        <form onSubmit={onSearch} className="flex gap-2">
          <input value={q} onChange={(e)=>setQ(e.target.value)} className="flex-1" placeholder="مثلا: بهترین رستوران نیویورک" />
          <button className="btn btn-primary">{loading? 'در حال جستجو...' : 'جستجو'}</button>
        </form>
        <div className="mt-3 text-sm opacity-70">مثال‌ها: بهترین گوشی گیمینگ، بدترین شهر اسپانیا برای سفر، بهترین سریال ۲۰۲۴</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h2 className="text-xl font-semibold mb-2">بیشترین جستجوها</h2>
          <ol className="space-y-1">{(popular||[]).map((p:any)=>(<li key={p.query} className="flex justify-between"><span>{p.query}</span><span className="opacity-60">{p.count}</span></li>))}</ol>
        </div>
        <div className="card p-4">
          <h2 className="text-xl font-semibold mb-2">ترندترین تاپ ۱۰ ها</h2>
          <ol className="space-y-1">{(trending||[]).map((t:any)=>(<li key={t.id} className="flex justify-between"><a href={`/?q=${encodeURIComponent(t.title)}`}>{t.title}</a><span className="opacity-60">{t.vote_sum}</span></li>))}</ol>
        </div>
      </div>

      <div className="">{result && <ResultView data={result} />}</div>
    </div>
  );
}

function ResultView({ data }: any){
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">{data.list.title}</h2>
          <p className="text-sm opacity-70">منبع: {data.list.source}</p>
        </div>
        <div className="flex gap-2 mt-2"><FavoriteButton listId={data.list.id} /><ShareButtons title={`تاپ ۱۰: ${data.list.title}`} /></div>
      </div>
      <ol className="mt-4 space-y-3">
        {data.list.items.map((it:any, idx:number)=>(
          <li key={it.id} className="p-3 border rounded-xl bg-white/70 dark:bg-slate-900/40">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">#{idx+1} — {it.title}</div>
                {it.description && <div className="text-sm opacity-80">{it.description}</div>}
              </div>
              <div className="text-right text-sm">
                <div>امتیاز: {it.score ?? 0}</div>
                <a className="text-blue-600" href={`/item/${it.id}`}>صفحهٔ آیتم</a>
              </div>
            </div>
            <div className="mt-2"><VoteButtons listId={data.list.id} itemId={it.id} /></div>
          </li>
        ))}
      </ol>
      <Comments listId={data.list.id} />
    </div>
  );
}
