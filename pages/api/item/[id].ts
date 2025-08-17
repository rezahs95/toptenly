import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../lib/supabaseServer';
export default async function handler(req:NextApiRequest, res:NextApiResponse){
  const { id } = req.query as { id: string };
  const { data: items } = await supabaseServer.from('list_items').select('*').eq('id', id).limit(1);
  if(!items || items.length===0) return res.status(404).json({ error:'not found' });
  const item = items[0];
  const { data: list } = await supabaseServer.from('lists').select('title').eq('id', item.list_id).limit(1);
  const { data: scores } = await supabaseServer.rpc('aggregate_scores', { p_list_id: item.list_id });
  const score = (scores||[]).find((s:any)=>s.item_id===item.id)?.total || 0;
  res.json({ id: item.id, title: item.title, description: item.description, score, list_title: list?.[0]?.title || '' });
}
