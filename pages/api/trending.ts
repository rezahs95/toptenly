import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../lib/supabaseServer';
export default async function handler(_req:NextApiRequest, res:NextApiResponse){
  const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString();
  const { data } = await supabaseServer.rpc('trending_lists', { p_since: sevenDaysAgo }).catch(()=>({ data: null }));
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.json(data || []);
}
