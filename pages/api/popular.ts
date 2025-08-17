import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../lib/supabaseServer';
export default async function handler(_req:NextApiRequest, res:NextApiResponse){
  const { data } = await supabaseServer.from('search_logs').select('query,count').order('count',{ ascending:false }).limit(10);
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.json(data || []);
}
