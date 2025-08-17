import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
type Props = { listId: string; itemId: string; };
export default function VoteButtons({ listId, itemId }: Props) {
  const [session, setSession] = useState<any>(null);
  const [usedVotes, setUsedVotes] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session ?? null); });
    async function fetchUserVotes() {
      const token = session?.access_token; if (!token) return;
      const r = await fetch(`/api/user/votes?listId=${listId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const json = await r.json(); setUsedVotes(json.used || []); }
    }
    fetchUserVotes();
    return () => listener.subscription.unsubscribe();
  }, [listId, session?.access_token]);
  async function runRecaptcha(){ const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as any; const g:any = (typeof window!=='undefined') ? (window as any).grecaptcha : null; if(!siteKey || !g || !g.execute) return null; try { return await g.execute(siteKey, { action: 'vote' }); } catch { return null; } }
  async function vote(weight: number) {
    if (!session?.access_token) { alert('برای رأی دادن ابتدا وارد شوید.'); return; }
    if (usedVotes.includes(weight)) { alert(`شما از رأی ${weight} قبلاً استفاده کرده‌اید.`); return; }
    setLoading(true);
    const captchaToken = await runRecaptcha();
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ listId, itemId, weight, captchaToken })
    });
    const json = await res.json().catch(()=>({}));
    setLoading(false);
    if (!res.ok) { alert(json?.error || 'خطا در ثبت رأی'); return; }
    setUsedVotes(v => [...v, weight]);
    window.location.reload();
  }
  return (
    <div className="flex gap-1">
      <button disabled={loading || usedVotes.includes(3)} onClick={()=>vote(3)} className="px-2 py-1 border rounded">{usedVotes.includes(3) ? '۳ ✓' : '۳'}</button>
      <button disabled={loading || usedVotes.includes(2)} onClick={()=>vote(2)} className="px-2 py-1 border rounded">{usedVotes.includes(2) ? '۲ ✓' : '۲'}</button>
      <button disabled={loading || usedVotes.includes(1)} onClick={()=>vote(1)} className="px-2 py-1 border rounded">{usedVotes.includes(1) ? '۱ ✓' : '۱'}</button>
    </div>
  );
}
