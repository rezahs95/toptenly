import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../lib/supabaseServer';
import { openai } from '../../lib/openai';
function slugify(s:string){ return s.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g,'-').replace(/(^-|-$)/g,''); }
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).end();
  const { query } = req.body as { query: string };
  if(!query) return res.status(400).json({ error:'no query' });
  try { await supabaseServer.rpc('increment_search', { p_query: query }); } catch {}
  const slug = slugify(query);
  const { data: lists } = await supabaseServer.from('lists').select('*').eq('slug', slug).limit(1);
  if(lists && lists.length>0){
    const list = lists[0];
    const { data: items } = await supabaseServer.from('list_items').select('id,title,description').eq('list_id', list.id);
    const { data: scores } = await supabaseServer.rpc('aggregate_scores', { p_list_id: list.id });
    const scoreMap: Record<string, number> = {}; (scores||[]).forEach((r:any)=> scoreMap[r.item_id] = r.total);
    const itemsWithScore = (items||[]).map((it:any)=> ({ ...it, score: scoreMap[it.id] || 0 }));
    return res.json({ list:{ ...list, items: itemsWithScore, source: 'db' } });
  }
  const prompt = `Create a ranked Top 10 list for: ${query}. Return strictly a JSON array of objects: [{\"title\":\"...\",\"description\":\"...\"}, ...] with exactly 10 items.`;
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages:[{role:'user', content:prompt}],
    max_tokens: 800,
    temperature: 0.7
  });
  const text = completion.choices[0].message.content || '[]';
  let parsed:any = null;
  try { parsed = JSON.parse(text); } catch { parsed = null; }
  if(!parsed) parsed = fallbackParse(text);
  const { data: newList } = await supabaseServer.from('lists').insert([{ title: query, slug, source:'ai' }]).select('*').single();
  const itemsToInsert = (parsed||[]).slice(0,10).map((it:any)=> ({ list_id: newList.id, title: it.title, description: it.description || null }));
  await supabaseServer.from('list_items').insert(itemsToInsert);
  const { data: inserted } = await supabaseServer.from('list_items').select('*').eq('list_id', newList.id);
  const itemsWithScore = (inserted||[]).map((it:any)=> ({ ...it, score:0 }));
  return res.json({ list: { ...newList, items: itemsWithScore, source:'ai' } });
}
function fallbackParse(text:string){
  const lines = text.split('\n').filter(Boolean);
  const items:any[] = [];
  for(const line of lines){
    const m = line.match(/\d+\.\s*(.*?)(?:\s*-\s*(.*))?$/);
    if(m) items.push({ title: m[1].trim(), description: m[2]?.trim() });
    if(items.length>=10) break;
  }
  while(items.length<10) items.push({ title:`Item ${items.length+1}`, description: ''});
  return items;
}
