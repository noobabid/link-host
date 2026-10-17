// Vercel serverless function: stores your whole Linkvault in one Redis key.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = 'linkvault:data';

async function redis(cmd) {
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd)
  });
  if (!r.ok) throw new Error('Database error ' + r.status);
  return (await r.json()).result;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL_ || !TOKEN) {
    return res.status(500).json({ error: 'Database not connected. In Vercel open Storage, connect an Upstash Redis database to this project, then redeploy.' });
  }
  const need = process.env.ACCESS_CODE;
  if (need && req.headers['x-access-code'] !== need) {
    return res.status(401).json({ error: 'Wrong or missing access code' });
  }
  try {
    if (req.method === 'GET') {
      const raw = await redis(['GET', KEY]);
      if (!raw) return res.json({ empty: true });
      const data = JSON.parse(raw);
      if (String(data.updated) === String(req.query.v)) return res.json({ same: true });
      return res.json({ data });
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || !Array.isArray(body.collections)) return res.status(400).json({ error: 'Bad data' });
      const raw = await redis(['GET', KEY]);
      if (raw) {
        const cur = JSON.parse(raw);
        if ((cur.updated || 0) > (body.updated || 0)) return res.status(409).json({ data: cur });
      }
      await redis(['SET', KEY, JSON.stringify(body)]);
      return res.json({ ok: true });
    }
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).end();
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
};
