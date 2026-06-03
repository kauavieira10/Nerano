/* server.js — proxy Node nativo (sem Express) para Render */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const {
  GOOGLE_SHEETS_API_KEY,
  GOOGLE_SHEETS_ID,
  GOOGLE_SHEETS_NAME = '',
  GOOGLE_SHEETS_RANGE = 'A1:Z200'
} = process.env;

const TTL = 5 * 60 * 1000;          // cache de 5 minutos
let cache = { data: null, ts: 0 };

const MIME = {
  '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript',
  '.png':'image/png', '.svg':'image/svg+xml', '.json':'application/json', '.ico':'image/x-icon'
};

async function getSheet() {
  if (cache.data && Date.now() - cache.ts < TTL) return cache.data;
  if (!GOOGLE_SHEETS_API_KEY || !GOOGLE_SHEETS_ID)
    throw new Error('Variáveis GOOGLE_SHEETS_API_KEY / GOOGLE_SHEETS_ID não configuradas');
  const range = encodeURIComponent(`${GOOGLE_SHEETS_NAME}!${GOOGLE_SHEETS_RANGE}`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${range}?key=${GOOGLE_SHEETS_API_KEY}`;
  const r = await fetch(url);
  if (!r.ok) { const t = await r.text(); throw new Error(`Google Sheets ${r.status}: ${t.slice(0,200)}`); }
  const json = await r.json();
  cache = { data: json, ts: Date.now() };
  console.log(`[Sheets] ✓ ${ (json.values||[]).length } linhas carregadas`);
  return json;
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');

  if (u.pathname === '/api/sheets') {
    try {
      const data = await getSheet();
      res.writeHead(200, { 'Content-Type':'application/json', 'Cache-Control':'public, max-age=300', 'Access-Control-Allow-Origin':'*' });
      res.end(JSON.stringify(data));
    } catch (e) {
      console.error('[Sheets] erro:', e.message);
      res.writeHead(502, { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // stub do endpoint de criativos Meta (ativar quando houver token)
  if (u.pathname === '/api/meta-creatives') {
    res.writeHead(200, { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*' });
    res.end(JSON.stringify({ data: [], note: 'Meta Ads ainda não configurado' }));
    return;
  }

  // arquivos estáticos
  let fp = path.join(__dirname, u.pathname === '/' ? 'index.html' : decodeURIComponent(u.pathname));
  if (!fp.startsWith(__dirname)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(fp, (err, buf) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    res.end(buf);
  });
});

server.listen(PORT, () => console.log(`▶ Dashboard rodando em http://localhost:${PORT}`));
