import type { NextApiRequest, NextApiResponse } from 'next';
export default function handler(_req:NextApiRequest, res:NextApiResponse){
  res.writeHead(302, { Location: '/' });
  res.end();
}
