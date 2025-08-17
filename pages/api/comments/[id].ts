import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../lib/supabaseServer';
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { id } = req.query as { id:string };
  if(req.method === 'DELETE'){
    const authHeader = req.headers.authorization as string | undefined;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'not_authenticated' });
    const token = authHeader.split(' ')[1];
    const { data: userData } = await supabaseServer.auth.getUser(token as any);
    const user = userData?.user;
    if(!user) return res.status(401).json({ error: 'invalid_token' });
    const { data: rows } = await supabaseServer.from('comments').select('user_id').eq('id', id).limit(1);
    const owner = rows?.[0]?.user_id;
    if(owner !== user.id) return res.status(403).json({ error: 'forbidden' });
    const { error } = await supabaseServer.from('comments').delete().eq('id', id);
    if(error) return res.status(500).json({ error: 'db_error' });
    return res.json({ ok:true });
  }
  return res.status(405).end();
}
