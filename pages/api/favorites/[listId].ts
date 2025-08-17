import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../lib/supabaseServer';
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { listId } = req.query as { listId:string };
  if(req.method === 'DELETE'){
    const authHeader = req.headers.authorization as string | undefined;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'not_authenticated' });
    const token = authHeader.split(' ')[1];
    const { data: userData } = await supabaseServer.auth.getUser(token as any);
    const user = userData?.user;
    if(!user) return res.status(401).json({ error: 'invalid_token' });
    const { error } = await supabaseServer.from('favorites').delete().eq('user_id', user.id).eq('list_id', listId);
    if(error) return res.status(500).json({ error: 'db_error' });
    return res.json({ ok:true });
  }
  return res.status(405).end();
}
