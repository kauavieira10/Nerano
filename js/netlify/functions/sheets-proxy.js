/* netlify/functions/sheets-proxy.js */
exports.handler = async () => {
  const {
    GOOGLE_SHEETS_API_KEY, GOOGLE_SHEETS_ID,
    GOOGLE_SHEETS_NAME = '', GOOGLE_SHEETS_RANGE = 'A1:Z200'
  } = process.env;
  try {
    if (!GOOGLE_SHEETS_API_KEY || !GOOGLE_SHEETS_ID)
      throw new Error('Variáveis de ambiente não configuradas');
    const range = encodeURIComponent(`${GOOGLE_SHEETS_NAME}!${GOOGLE_SHEETS_RANGE}`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${range}?key=${GOOGLE_SHEETS_API_KEY}`;
    const r = await fetch(url);
    const json = await r.json();
    return {
      statusCode: r.ok ? 200 : 502,
      headers: { 'Content-Type':'application/json', 'Cache-Control':'public, max-age=300', 'Access-Control-Allow-Origin':'*' },
      body: JSON.stringify(json)
    };
  } catch (e) {
    return { statusCode: 502, headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ error: e.message }) };
  }
};
