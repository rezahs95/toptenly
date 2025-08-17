import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function FavoriteButton({ listId }: { listId: string }){
  const [session, setSession] = useState<any>(null);
  const [fav, setFav] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(()=>{
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(()=>{
    async function load(){
      if(!listId) return;
      const headers:any = {};
      if(session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
      const r = await fetch(`/api/favorites?listId=${listId}`, { headers });
      if(r.ok){ const j = await r.json(); setFav(Boolean(j.favorited)); }
    }
    load();
  }, [listId, session?.access_token]);

  async function toggle(){
    if(!session) { alert('برای افزودن به علاقه‌مندی‌ها ابتدا وارد شوید.'); return; }
    setLoading(true);
    const token = session.access_token;
    if(!fav){
      const r = await fetch('/api/favorites', { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({ listId }) });
      if(r.ok) setFav(true);
    } else {
      const r = await fetch(`/api/favorites/${listId}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } });
      if(r.ok) setFav(false);
    }
    setLoading(false);
  }

  return (
    <button onClick={toggle} disabled={loading} className={"btn " + (fav ? "btn-primary" : "")}>
      {fav ? "در علاقه‌مندی‌ها ✓" : "افزودن به علاقه‌مندی‌ها"}
    </button>
  );
}
