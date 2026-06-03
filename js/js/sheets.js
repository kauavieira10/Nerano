/* js/sheets.js — cliente do proxy de Google Sheets + parser tolerante
   Lida com: bloco de resumo no topo, cabeçalhos com quebra de linha,
   nomes no singular/plural e formato monetário pt-BR. */

const CANDIDATES = {
  data:          ['data','date'],
  verbaGoogle:   ['verba google','investimento google','invest google','gasto google','custo google','valor google','google verba'],
  leadsGoogle:   ['lead google','leads google','google leads','google lead','resultados google','conversoes google'],
  verbaFacebook: ['verba fb','verba facebook','verba meta','investimento facebook','investimento meta','invest facebook','gasto facebook','custo facebook','valor facebook','facebook verba'],
  leadsFacebook: ['lead plataforma fb','lead plataforma facebook','leads fb','lead fb','leads facebook','lead facebook','leads meta','facebook leads']
};

/* acha a linha de cabeçalho da tabela diária (pula o bloco de resumo) */
function findHeaderRow(values){
  for(let i=0;i<values.length;i++){
    const cells=(values[i]||[]).map(normHeader);
    if(cells.includes('data') && cells.some(c=>c.includes('verba')||c.includes('lead'))) return i;
  }
  return 0;
}

function detectColumns(headers){
  const idx={};
  for(const field in CANDIDATES){
    const ov = CONFIG.COLUMNS[field];
    if(typeof ov === 'number'){ idx[field]=ov; continue; }
    if(typeof ov === 'string' && ov !== 'auto'){
      const i = headers.indexOf(normHeader(ov));
      if(i>=0){ idx[field]=i; continue; }
    }
    let found=-1;
    for(const cand of CANDIDATES[field]){ const i=headers.indexOf(cand); if(i>=0){ found=i; break; } }
    if(found<0) found = headers.findIndex(h => CANDIDATES[field].some(c => h.includes(c)));
    idx[field]=found;
  }
  return idx;
}

function parseSheet(json){
  const values = (json && json.values) || [];
  if(values.length < 2) throw new Error('planilha sem linhas de dados');
  const hr = findHeaderRow(values);
  const headers = values[hr].map(normHeader);
  const idx = detectColumns(headers);
  console.log('[Sheets] cabeçalho na linha', hr, '· colunas:', idx);
  if(idx.data < 0) throw new Error('coluna de data não encontrada — ajuste CONFIG.COLUMNS em js/config.js');

  const rows=[];
  for(let i=hr+1;i<values.length;i++){
    const r = values[i]; if(!r) continue;
    const dt = parseDate(r[idx.data]); if(!dt) continue;   // ignora TOTAL e linhas vazias
    rows.push({
      dt, key: dkey(dt), data: fmtDM(dt), dia: WEEK[dt.getDay()],
      verbaGoogle:   idx.verbaGoogle   >=0 ? num(r[idx.verbaGoogle])   : 0,
      leadsGoogle:   idx.leadsGoogle   >=0 ? num(r[idx.leadsGoogle])   : 0,
      verbaFacebook: idx.verbaFacebook >=0 ? num(r[idx.verbaFacebook]) : 0,
      leadsFacebook: idx.leadsFacebook >=0 ? num(r[idx.leadsFacebook]) : 0
    });
  }
  rows.sort((a,b)=>a.key-b.key);
  return rows;
}

const SheetsAPI = {
  async load(){
    try{
      const res = await fetch(CONFIG.apiBase + '/api/sheets');
      if(!res.ok) throw new Error('HTTP '+res.status);
      const json = await res.json();
      if(json.error) throw new Error(json.error);
      const rows = parseSheet(json);
      if(!rows.length) throw new Error('nenhuma linha válida');
      console.log('[Sheets] ✓ '+rows.length+' linhas carregadas');
      return { rows, source: 'live' };
    }catch(e){
      console.warn('[Sheets] usando snapshot local —', e.message);
      return { rows: DEMO_DATASET, source: 'demo' };
    }
  }
};
