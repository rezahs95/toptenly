import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../lib/supabaseServer';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'not_authenticated' });
  const token = authHeader.split(' ')[1];
  const { data: userData } = await supabaseServer.auth.getUser(token as any);
  if (!userData?.user) return res.status(401).json({ error: 'invalid_token' });
  const userId = userData.user.id;
  const listId = req.query.listId as string;
  if (!listId) return res.status(400).json({ error: 'missing_listId' });
  const { data: votes } = await supabaseServer.from('votes').select('weight').eq('user_id', userId).eq('list_id', listId);
  const used = (votes || []).map((v:any) => v.weight);
  res.json({ used });
}
