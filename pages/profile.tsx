import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
export default function Profile(){
  const [session, setSession] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  useEffect(()=>{
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener.subscription.unsubscribe();
  }, []);
  useEffect(()=>{
    async function load(){
      if(!session?.access_token) return;
      const r = await fetch('/api/user/profile', { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (r.ok) setData(await r.json());
    }
    load();
  }, [session?.access_token]);
  if(!session) return <div className="card p-6"><h1 className="text-xl font-bold mb-2">پروفایل</h1><p>برای دیدن پروفایل ابتدا وارد شوید.</p></div>;
  if(!data) return <div className="card p-6">در حال بارگذاری...</div>;
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold mb-1">سلام، {session.user?.email}</h1>
        <div className="text-sm opacity-70">تعداد رأی‌ها: {data.votes_count} — تعداد لیست‌های ساخته‌شده: {data.lists_count}</div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-2">رأی‌های اخیر</h2>
          <ul className="space-y-2">
            {data.recent_votes.map((v:any)=>(
              <li key={v.id} className="flex justify-between">
                <span>{v.item_title}</span>
                <span className="opacity-70">وزن {v.weight}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-2">لیست‌های من</h2>
          <ul className="space-y-2">
            {data.my_lists.map((l:any)=>(
              <li key={l.id}><a href={`/?q=${encodeURIComponent(l.title)}`}>{l.title}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
