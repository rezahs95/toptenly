import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

type C = { id:string; content:string; user_email?:string; created_at:string; children?:C[] };

export default function Comments({ listId, itemId }: { listId?: string; itemId?: string; }){
  const [session, setSession] = useState<any>(null);
  const [comments, setComments] = useState<C[]>([]);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(()=>{
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function load(){
    const q = new URLSearchParams();
    if(listId) q.set('listId', listId);
    if(itemId) q.set('itemId', itemId);
    const headers:any = {};
    if(session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
    const r = await fetch(`/api/comments?${q.toString()}`, { headers });
    const j = await r.json();
    setComments(j || []);
  }
  useEffect(()=>{ load(); }, [listId, itemId, session?.access_token]);

  async function submit(parent_id?: string){
    if(!session?.access_token){ alert('برای ارسال نظر ابتدا وارد شوید.'); return; }
    const content = parent_id ? prompt('پاسخ شما:') : text;
    if(!content || !content.trim()) return;
    setPosting(true);
    const body:any = { content, parentId: parent_id };
    if(listId) body.listId = listId;
    if(itemId) body.itemId = itemId;
    const r = await fetch('/api/comments', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${session.access_token}` }, body: JSON.stringify(body) });
    setPosting(false);
    if(r.ok){ setText(''); load(); }
    else { const j = await r.json().catch(()=>({})); alert(j?.error || 'خطا در ارسال نظر'); }
  }

  async function remove(id:string){
    if(!session?.access_token) return;
    if(!confirm('آیا از حذف نظر مطمئنید؟')) return;
    const r = await fetch(`/api/comments/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${session.access_token}` } });
    if(r.ok) load(); else alert('حذف ناموفق');
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">نظرات</h3>
      <div className="space-y-3">
        {comments.map(c => <CommentNode key={c.id} c={c} onReply={()=>submit(c.id)} onDelete={()=>remove(c.id)} />)}
      </div>
      <div className="mt-4 flex gap-2">
        <input className="flex-1" placeholder="نظر خود را بنویسید..." value={text} onChange={(e)=>setText(e.target.value)} />
        <button className="btn btn-primary" disabled={posting || !text.trim()} onClick={()=>submit()}>ارسال</button>
      </div>
    </div>
  );
}

function CommentNode({ c, onReply, onDelete }: { c:C; onReply:()=>void; onDelete:()=>void; }){
  const dt = new Date(c.created_at).toLocaleString('fa-IR');
  return (
    <div className="p-3 border rounded-xl bg-white/70 dark:bg-slate-900/40">
      <div className="flex justify-between items-start">
        <div className="font-medium">{c.user_email || 'کاربر'}</div>
        <div className="text-xs opacity-60">{dt}</div>
      </div>
      <div className="mt-2">{c.content}</div>
      <div className="mt-2 flex gap-2 text-sm">
        <button className="btn" onClick={onReply}>پاسخ</button>
        <button className="btn" onClick={onDelete}>حذف</button>
      </div>
      {c.children && c.children.length>0 && (
        <div className="mt-3 space-y-2 pr-4 border-r">
          {c.children.map(ch => <CommentNode key={ch.id} c={ch} onReply={onReply} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}
