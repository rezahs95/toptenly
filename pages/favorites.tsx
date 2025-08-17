import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Favorites(){
  const [session, setSession] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  useEffect(()=>{
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(()=>{
    async function load(){
      if(!session?.access_token) return;
      const r = await fetch('/api/favorites', { headers: { Authorization: `Bearer ${session.access_token}` } });
      if(r.ok) setItems(await r.json());
    }
    load();
  }, [session?.access_token]);

  if(!session) return <div className="card p-6">برای مشاهده علاقه‌مندی‌ها ابتدا وارد شوید.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">علاقه‌مندی‌ها</h1>
      {items.length===0 ? <div className="opacity-70">موردی یافت نشد.</div> : null}
      <ul className="space-y-2">
        {items.map((l:any)=>(
          <li key={l.id} className="card p-3 flex justify-between">
            <a href={`/?q=${encodeURIComponent(l.title)}`}>{l.title}</a>
            <span className="opacity-60 text-sm">{new Date(l.created_at).toLocaleDateString('fa-IR')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
