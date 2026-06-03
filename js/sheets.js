/* js/sheets.js — cliente do proxy de Google Sheets + parser tolerante */
const CANDIDATES = {
  data:          ['data','date'],
  verbaGoogle:   ['verba google','investimento google','invest google','gasto google','custo google','valor google','google verba','google'],
  leadsGoogle:   ['leads google','google leads','resultados google','conversoes google','leads g'],
  verbaFacebook: ['verba facebook','verba fb','verba meta','investimento facebook','investimento meta','invest facebook','gasto facebook','custo facebook','valor facebook','facebook verba','meta verba','facebook','meta'],
  leadsFacebook: ['leads facebook','leads fb','leads meta','facebook leads','resultados facebook','conversoes facebook','leads f']
};

function detectColumns(headers){
  const idx={};
  for(const field in CANDIDATES){
    const ov = CONFIG.COLUMNS[field];
    if(typeof ov === 'number'){ idx[field]=ov; continue; }
    if(typeof ov === 'string' && ov !== 'auto'){
      const i = headers.indexOf(normHeader(ov));
      if(i>=0){ idx[field]=i; continue; }
    }
    let found = -1;
    for(const cand of CANDIDATES[field]){ const i = headers.indexOf(cand); if(i>=0){ found=i; break; } }
    if(found<0){ // fuzzy: cabeçalho contém o candidato
      found = headers.findIndex(h => CANDIDATES[field].some(c => h.includes(c)));
    }
    idx[field]=found;
  }
  return idx;
}

function parseSheet(json){
  const values = (json && json.values) || [];
  if(values.length < 2) throw new Error('planilha sem linhas de dados');
  const headers = values[0].map(normHeader);
  const idx = detectColumns(headers);
  console.log('[Sheets] colunas detectadas:', idx, '| cabeçalhos:', headers);
  if(idx.data < 0) throw new Error('coluna de data não encontrada — ajuste CONFIG.COLUMNS em js/config.js');

  const rows=[];
  for(let i=1;i<values.length;i++){
    const r = values[i]; if(!r) continue;
    const dt = parseDate(r[idx.data]); if(!dt) continue;
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
      console.warn('[Sheets] usando dataset demo —', e.message);
      return { rows: DEMO_DATASET, source: 'demo' };
    }
  }
};
