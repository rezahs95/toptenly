import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../lib/supabaseServer';
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method === 'GET'){
    const { listId } = req.query as { listId?: string };
    const authHeader = req.headers.authorization as string | undefined;
    if(listId){
      let userId: string | null = null;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const { data } = await supabaseServer.auth.getUser(token as any);
        userId = data?.user?.id || null;
      }
      if(!userId){ return res.json({ favorited: false }); }
      const { data: rows } = await supabaseServer.from('favorites').select('id').eq('user_id', userId).eq('list_id', listId);
      return res.json({ favorited: (rows||[]).length>0 });
    }
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.json([]);
    const token = authHeader.split(' ')[1];
    const { data: userData } = await supabaseServer.auth.getUser(token as any);
    const user = userData?.user;
    if(!user) return res.json([]);
    const { data: favs } = await supabaseServer.from('favorites').select('list_id,created_at').eq('user_id', user.id).order('created_at', { ascending:false });
    if(!favs || favs.length===0) return res.json([]);
    const ids = favs.map((f:any)=> f.list_id);
    const { data: lists } = await supabaseServer.from('lists').select('id,title,created_at').in('id', ids);
    const map:Record<string, any> = {}; (lists||[]).forEach(l=> map[l.id]=l);
    const out = favs.map((f:any)=> ({ ...map[f.list_id], created_at: f.created_at }));
    return res.json(out);
  }
  if(req.method === 'POST'){
    const authHeader = req.headers.authorization as string | undefined;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'not_authenticated' });
    const token = authHeader.split(' ')[1];
    const { data: userData } = await supabaseServer.auth.getUser(token as any);
    const user = userData?.user;
    if(!user) return res.status(401).json({ error: 'invalid_token' });
    const { listId } = req.body as any;
    if(!listId) return res.status(400).json({ error: 'missing_listId' });
    const { error } = await supabaseServer.from('favorites').insert([{ user_id: user.id, list_id: listId }]);
    if(error) return res.status(500).json({ error: 'db_error' });
    return res.json({ ok:true });
  }
  return res.status(405).end();
}
