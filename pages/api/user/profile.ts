import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../lib/supabaseServer';
export default async function handler(req:NextApiRequest, res:NextApiResponse){
  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'not_authenticated' });
  const token = authHeader.split(' ')[1];
  const { data: userData } = await supabaseServer.auth.getUser(token as any);
  if (!userData?.user) return res.status(401).json({ error: 'invalid_token' });
  const userId = userData.user.id;
  const { data: votes } = await supabaseServer.from('votes').select('id, weight, created_at, item_id, list_id').eq('user_id', userId).order('created_at', { ascending: false }).limit(10);
  const itemIds = (votes||[]).map(v=>v.item_id);
  let itemsMap = {};
  if(itemIds.length){
    const { data: items } = await supabaseServer.from('list_items').select('id,title').in('id', itemIds);
    (items||[]).forEach((it:any)=> itemsMap[it.id]=it);
  }
  const { data: myLists } = await supabaseServer.from('lists').select('id,title').order('created_at', { ascending: false }).limit(10);
  res.json({
    votes_count: (votes||[]).length,
    lists_count: (myLists||[]).length,
    recent_votes: (votes||[]).map((v:any)=> ({ id:v.id, weight:v.weight, created_at:v.created_at, item_title: itemsMap[v.item_id]?.title || '...'})),
    my_lists: myLists || []
  });
}
