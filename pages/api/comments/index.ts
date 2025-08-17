import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../lib/supabaseServer';
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method === 'GET'){
    const { listId, itemId } = req.query as { listId?: string; itemId?: string; };
    if(!listId && !itemId) return res.status(400).json({ error:'missing_target' });
    const q = supabaseServer.from('comments').select('*').order('created_at', { ascending: true });
    let { data, error } = listId ? await q.eq('list_id', listId) : await q.eq('item_id', itemId!);
    if(error) return res.status(500).json({ error: 'db_error' });
    const userIds = Array.from(new Set((data||[]).map((d:any)=> d.user_id).filter(Boolean)));
    const emails: Record<string,string> = {};
    for(const uid of userIds){
      try {
        const { data: u } = await supabaseServer.auth.admin.getUserById(uid);
        if(u?.user) emails[uid] = (u.user.email || '').split('@')[0];
      } catch {}
    }
    const map: any = {};
    (data||[]).forEach((c:any)=> map[c.id] = { ...c, user_email: emails[c.user_id] });
    const roots: any[] = [];
    (data||[]).forEach((c:any)=>{
      if(c.parent_id){ map[c.parent_id]?.children ? map[c.parent_id].children.push(map[c.id]) : map[c.parent_id].children=[map[c.id]]; }
      else roots.push(map[c.id]);
    });
    return res.json(roots);
  }
  if(req.method === 'POST'){
    const authHeader = req.headers.authorization as string | undefined;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'not_authenticated' });
    const token = authHeader.split(' ')[1];
    const { data: userData } = await supabaseServer.auth.getUser(token as any);
    const user = userData?.user;
    if(!user) return res.status(401).json({ error: 'invalid_token' });
    const { listId, itemId, content, parentId } = req.body as any;
    if(!content || (!listId && !itemId)) return res.status(400).json({ error: 'missing_fields' });
    const { error } = await supabaseServer.from('comments').insert([{ user_id: user.id, list_id: listId || null, item_id: itemId || null, parent_id: parentId || null, content }]);
    if(error) return res.status(500).json({ error: 'db_error' });
    return res.json({ ok:true });
  }
  return res.status(405).end();
}
