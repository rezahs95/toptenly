import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../lib/supabaseServer';
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { listId, itemId, weight, captchaToken } = req.body;
  if (!listId || !itemId || !weight) return res.status(400).json({ error: 'missing' });
  if (RECAPTCHA_SECRET) {
    if (!captchaToken) return res.status(400).json({ error: 'captcha_required' });
    const params = new URLSearchParams({ secret: RECAPTCHA_SECRET, response: String(captchaToken) });
    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', { method: 'POST', body: params });
    const verifyJson = await verifyRes.json();
    if (!verifyJson.success || (verifyJson.score !== undefined && verifyJson.score < 0.4)) {
      return res.status(403).json({ error: 'captcha_invalid' });
    }
  }
  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'not_authenticated' });
  const token = authHeader.split(' ')[1];
  const { data: userData, error: userErr } = await supabaseServer.auth.getUser(token as any);
  if (userErr || !userData?.user) return res.status(401).json({ error: 'invalid_token' });
  const userId = userData.user.id;
  const { data: userVotes } = await supabaseServer.from('votes').select('id').eq('user_id', userId).eq('list_id', listId);
  if ((userVotes || []).length >= 3) return res.status(403).json({ error: 'vote_limit_reached' });
  const { data: existingSame } = await supabaseServer.from('votes').select('id').eq('user_id', userId).eq('item_id', itemId).eq('weight', weight).limit(1);
  if (existingSame && existingSame.length > 0) return res.status(400).json({ error: 'duplicate_vote' });
  const { error: insertErr } = await supabaseServer.from('votes').insert([{ user_id: userId, list_id: listId, item_id: itemId, weight }]);
  if (insertErr) return res.status(500).json({ error: 'db_error' });
  return res.json({ ok: true });
}
