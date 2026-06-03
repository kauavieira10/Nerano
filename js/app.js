/* js/app.js — estado, render, gráficos, criativos, calendário, boot */
let DATA=[];
let LAST=null;
let MONTH_DAYS=30;





/* criativos demo (Meta Ads) */
const CREATIVES=[
  {name:'Vídeo · Tour Apartamento',status:'ACTIVE',type:'video',invest:2620,conv:58,clicks:1340,impr:61200},
  {name:'Stories · Condições Especiais',status:'ACTIVE',type:'image',invest:1530,conv:47,clicks:1100,impr:35600},
  {name:'Carrossel · Plantas Baixas',status:'ACTIVE',type:'image',invest:1840,conv:42,clicks:980,impr:38400},
  {name:'Reels · Área de Lazer',status:'ACTIVE',type:'video',invest:1290,conv:31,clicks:720,impr:29800},
  {name:'Carrossel · Diferenciais',status:'ACTIVE',type:'image',invest:1170,conv:28,clicks:690,impr:27300},
  {name:'Vídeo · Depoimento Morador',status:'PAUSED',type:'video',invest:880,conv:14,clicks:430,impr:19800},
  {name:'Imagem · Fachada Noturna',status:'PAUSED',type:'image',invest:640,conv:9,clicks:310,impr:14200},
  {name:'Imagem · Lançamento',status:'PAUSED',type:'image',invest:520,conv:7,clicks:240,impr:11900}
];
const THUMBS=['linear-gradient(135deg,#1F6FE5,#0F3F93)','linear-gradient(135deg,#EF8A1F,#D5641A)','linear-gradient(135deg,#7C5CFF,#4B2FCB)','linear-gradient(135deg,#1F9D56,#0F6B39)','linear-gradient(135deg,#E5447C,#9B1E52)','linear-gradient(135deg,#15B6C9,#0B6E7C)','linear-gradient(135deg,#5B6B87,#2E3950)','linear-gradient(135deg,#D6A21F,#9E7410)'];

/* ===================== state ===================== */
const state={platform:'all',tab:'overview',from:null,to:null,presetLabel:'30 dias'};
let charts={};

/* ===================== seleção de dados ===================== */
function rowsInRange(){
  const a=dkey(state.from),b=dkey(state.to);
  return DATA.filter(r=>r.key>=a&&r.key<=b);
}
function activeMetaBase(){return state.platform==='google'?META_G:state.platform==='facebook'?META_F:META_ALL;}
function aggregate(rows){
  const useG=state.platform!=='facebook', useF=state.platform!=='google';
  const t={verbaG:0,verbaF:0,leadsG:0,leadsF:0};
  rows.forEach(r=>{if(useG){t.verbaG+=r.verbaGoogle;t.leadsG+=r.leadsGoogle;}if(useF){t.verbaF+=r.verbaFacebook;t.leadsF+=r.leadsFacebook;}});
  t.verba=t.verbaG+t.verbaF; t.leads=t.leadsG+t.leadsF; t.cpl=t.leads?t.verba/t.leads:0;
  return t;
}

/* ===================== KPIs ===================== */
function renderKPIs(t,days){
  const base=activeMetaBase(); const scale=days/MONTH_DAYS;
  const gBudget=base.verba*scale, gLeads=base.leads*scale, gCpl=base.cpl;
  document.getElementById('kpi-budget').textContent=fmtBRL(t.verba);
  document.getElementById('kpi-budget-goal').textContent=fmtBRL(gBudget);
  let bp=pct(t.verba,gBudget);
  document.getElementById('kpi-budget-pct').textContent=bp+'%';
  document.getElementById('kpi-budget-bar').style.width=Math.min(bp,100)+'%';

  document.getElementById('kpi-leads').textContent=fmtNum(t.leads);
  document.getElementById('kpi-leads-goal').textContent=fmtNum(gLeads);
  let lp=pct(t.leads,gLeads);
  const lpEl=document.getElementById('kpi-leads-pct'); lpEl.textContent=lp+'%'; lpEl.className='pct '+(lp>=100?'good':'bad');
  document.getElementById('kpi-leads-bar').style.width=Math.min(lp,100)+'%';

  document.getElementById('kpi-cpl').textContent=fmtBRL2(t.cpl);
  document.getElementById('kpi-cpl-goal').textContent=fmtBRL(gCpl);
  let cp=pct(t.cpl,gCpl);
  const cpEl=document.getElementById('kpi-cpl-pct'); cpEl.textContent=cp+'%'; cpEl.className='pct '+(t.cpl<=gCpl?'good':'bad');
  document.getElementById('kpi-cpl-bar').style.width=Math.min(cp,100)+'%';
}

/* ===================== plataformas ===================== */
function renderPlatformCards(rows,days){
  const scale=days/MONTH_DAYS;
  const gCard=document.getElementById('card-google'), fCard=document.getElementById('card-facebook');
  gCard.classList.toggle('hidden',state.platform==='facebook');
  fCard.classList.toggle('hidden',state.platform==='google');
  const sumG={verba:0,leads:0},sumF={verba:0,leads:0};
  rows.forEach(r=>{sumG.verba+=r.verbaGoogle;sumG.leads+=r.leadsGoogle;sumF.verba+=r.verbaFacebook;sumF.leads+=r.leadsFacebook;});
  fillPlatform('tbl-google',sumG,META_G,scale);
  fillPlatform('tbl-facebook',sumF,META_F,scale);
}
function fillPlatform(id,d,meta,scale){
  const cpl=d.leads?d.verba/d.leads:0;
  const gv=meta.verba*scale, gl=meta.leads*scale;
  const rows=[
    ['Investimento',fmtBRL(gv),fmtBRL(d.verba),pct(d.verba,gv),true],
    ['Leads',fmtNum(gl),fmtNum(d.leads),pct(d.leads,gl),pct(d.leads,gl)>=100],
    ['CPL',fmtBRL(meta.cpl),fmtBRL2(cpl),pct(cpl,meta.cpl),cpl<=meta.cpl]
  ];
  document.getElementById(id).innerHTML=rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td><b>${r[2]}</b></td><td><span class="pp ${r[4]?'good':'bad'}">${r[3]}%</span></td></tr>`).join('');
}

/* ===================== tabela diária ===================== */
function renderDaily(rows,days){
  const base=activeMetaBase(); const metaDia=base.leads/MONTH_DAYS;
  const useG=state.platform!=='facebook', useF=state.platform!=='google';
  document.getElementById('tbl-daily').innerHTML=rows.map(r=>{
    const vg=useG?r.verbaGoogle:0, lg=useG?r.leadsGoogle:0;
    const vf=useF?r.verbaFacebook:0, lf=useF?r.leadsFacebook:0;
    const total=vg+vf, leads=lg+lf, cpl=leads?total/leads:0, ok=leads>=metaDia;
    const dimG=useG?'':' class="dim"', dimF=useF?'':' class="dim"';
    return `<tr><td>${r.data}</td><td class="day">${r.dia}</td>
      <td${dimG.trim()?dimG:''}>${fmtBRL(r.verbaGoogle)}</td><td${dimG.trim()?dimG:''}>${r.leadsGoogle}</td>
      <td${dimF.trim()?dimF:''}>${fmtBRL(r.verbaFacebook)}</td><td${dimF.trim()?dimF:''}>${r.leadsFacebook}</td>
      <td><b>${fmtBRL(total)}</b></td><td>${fmtBRL2(cpl)}</td>
      <td><span class="mini ${ok?'good':'bad'}">${pct(leads,metaDia)}%</span></td></tr>`;
  }).join('');
}

/* ===================== charts.js ===================== */
function themeColors(){
  const dark=document.documentElement.getAttribute('data-theme')==='dark';
  return {grid:dark?'rgba(255,255,255,.07)':'rgba(15,42,95,.08)',tick:dark?'#94A7C6':'#5B6B87',primary:'#1F6FE5',accent:'#EF8A1F',purple:'#7C5CFF'};
}
function grad(ctx,col){const g=ctx.createLinearGradient(0,0,0,260);g.addColorStop(0,col+'55');g.addColorStop(1,col+'00');return g;}
function tooltipStyle(fmt){return {backgroundColor:'rgba(10,20,40,.92)',padding:12,cornerRadius:10,titleFont:{family:'Plus Jakarta Sans',size:12},bodyFont:{family:'Inter',size:12},usePointStyle:true,callbacks:fmt?{label:c=>' '+c.dataset.label+': '+fmt(c.parsed.y??c.parsed)}:undefined};}
function baseOpts(C,o){return {responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},
  plugins:{legend:o.legend?{position:'top',align:'end',labels:{color:C.tick,font:{family:'Inter',size:12},usePointStyle:true,pointStyle:'circle',padding:16}}:{display:false},tooltip:tooltipStyle(o.money?(v=>fmtBRL2(v)):null)},
  scales:{x:{grid:{display:false},ticks:{color:C.tick,font:{family:'Inter',size:11},maxTicksLimit:8}},y:{grid:{color:C.grid},ticks:{color:C.tick,font:{family:'Inter',size:11}},border:{display:false}}}};}

function buildCharts(rows){
  if(typeof Chart==='undefined'){console.warn('[Charts] Chart.js não disponível');return;}
  Object.values(charts).forEach(c=>c&&c.destroy());
  const C=themeColors(); const labels=rows.map(r=>r.data);
  const useG=state.platform!=='facebook', useF=state.platform!=='google';
  let accG=0,accF=0;
  const cumG=rows.map(r=>accG+=r.leadsGoogle), cumF=rows.map(r=>accF+=r.leadsFacebook);
  const ds=[];
  if(useG)ds.push({label:'Google',data:cumG,borderColor:C.primary,backgroundColor:ctx=>grad(ctx.chart.ctx,'#1F6FE5'),fill:true,tension:.4,borderWidth:2.5,pointRadius:0,pointHoverRadius:5});
  if(useF)ds.push({label:'Facebook',data:cumF,borderColor:C.accent,backgroundColor:ctx=>grad(ctx.chart.ctx,'#EF8A1F'),fill:true,tension:.4,borderWidth:2.5,pointRadius:0,pointHoverRadius:5});
  charts.hero=new Chart(document.getElementById('heroChart'),{type:'line',data:{labels,datasets:ds},options:baseOpts(C,{legend:true})});

  const t=aggregate(rows);
  charts.doughnut=new Chart(document.getElementById('doughnut'),{type:'doughnut',
    data:{labels:['Google','Facebook'],datasets:[{data:[t.verbaG,t.verbaF],backgroundColor:[C.primary,C.accent],borderWidth:0,hoverOffset:8}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{position:'bottom',labels:{color:C.tick,font:{family:'Inter',size:12},padding:16,usePointStyle:true,pointStyle:'circle'}},tooltip:tooltipStyle(v=>fmtBRL(v))}}});

  const cplData=rows.map(r=>{const vg=useG?r.verbaGoogle:0,vf=useF?r.verbaFacebook:0,lg=useG?r.leadsGoogle:0,lf=useF?r.leadsFacebook:0;const tot=vg+vf,l=lg+lf;return l?+(tot/l).toFixed(2):0;});
  charts.cpl=new Chart(document.getElementById('cplChart'),{type:'line',
    data:{labels,datasets:[{label:'CPL',data:cplData,borderColor:C.purple,backgroundColor:ctx=>grad(ctx.chart.ctx,'#7C5CFF'),fill:true,tension:.4,borderWidth:2.5,pointRadius:0,pointHoverRadius:5}]},
    options:baseOpts(C,{legend:false,money:true})});
}

/* ===================== render principal ===================== */
function render(){
  const rows=rowsInRange(); const days=rows.length||1;
  const t=aggregate(rows);
  renderKPIs(t,days);
  renderPlatformCards(rows,days);
  renderDaily(rows,days);
  buildCharts(rows);
  updateRangeLabel(rows);
}
function updateRangeLabel(rows){
  const f=state.from,t=state.to;
  let lbl;
  if(dkey(f)===dkey(t)) lbl=`${f.getDate()} ${MSHORT[f.getMonth()]} ${f.getFullYear()}`;
  else lbl=`${f.getDate()} — ${t.getDate()} ${MSHORT[t.getMonth()]} ${t.getFullYear()}`;
  document.getElementById('rangeLabel').textContent=lbl+`  ·  ${rows.length} dia${rows.length>1?'s':''}`;
}

/* ===================== presets ===================== */
function applyQuickPreset(p){
  const d=new Date(LAST);
  if(p==='today'){state.from=new Date(d);state.to=new Date(d);}
  else if(p==='yesterday'){const y=new Date(d);y.setDate(y.getDate()-1);state.from=new Date(y);state.to=new Date(y);}
  else if(p==='7d'){const s=new Date(d);s.setDate(s.getDate()-6);state.from=s;state.to=new Date(d);}
  else if(p==='30d'){state.from=DATA[0].dt;state.to=new Date(d);}
  else if(p==='month'){state.from=new Date(d.getFullYear(),d.getMonth(),1);state.to=new Date(d);}
  render();
}

/* ===================== CRIATIVOS ===================== */
let creFilter='all';
function renderCreatives(){
  const list=CREATIVES.filter(c=>creFilter==='all'?true:creFilter==='active'?c.status==='ACTIVE':c.status!=='ACTIVE');
  // contadores
  document.getElementById('cnt-all').textContent=CREATIVES.length;
  document.getElementById('cnt-active').textContent=CREATIVES.filter(c=>c.status==='ACTIVE').length;
  document.getElementById('cnt-paused').textContent=CREATIVES.filter(c=>c.status!=='ACTIVE').length;
  // resumo (sobre o filtro atual)
  const inv=list.reduce((s,c)=>s+c.invest,0), conv=list.reduce((s,c)=>s+c.conv,0);
  document.getElementById('cre-count').textContent=list.length;
  document.getElementById('cre-invest').textContent=fmtBRL(inv);
  document.getElementById('cre-conv').textContent=fmtNum(conv);
  document.getElementById('cre-cpl').textContent=conv?fmtBRL2(inv/conv):'R$ 0';
  // grid
  document.getElementById('creGrid').innerHTML=list.map(c=>{
    const i=CREATIVES.indexOf(c); const cpl=c.conv?c.invest/c.conv:0; const ctr=c.impr?(c.clicks/c.impr*100):0;
    const active=c.status==='ACTIVE';
    return `<div class="creative glass">
      <div class="thumb" style="background:${THUMBS[i%THUMBS.length]}">
        <span class="badge ${active?'active':'paused'}"><span class="d"></span>${active?'Ativo':'Pausado'}</span>
        ${c.type==='video'?'<span class="play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>':''}
        <span class="lbl">${c.name}</span>
      </div>
      <div class="cbody">
        <div class="cname">${c.name}</div>
        <div class="cmetrics">
          <div class="m"><div class="ml">Investido</div><div class="mv">${fmtBRL(c.invest)}</div></div>
          <div class="m conv"><div class="ml">Conversões</div><div class="mv">${c.conv}</div></div>
          <div class="m"><div class="ml">CPL</div><div class="mv">${fmtBRL2(cpl)}</div></div>
          <div class="m"><div class="ml">Cliques</div><div class="mv">${fmtNum(c.clicks)}</div></div>
          <div class="m"><div class="ml">CTR</div><div class="mv">${ctr.toFixed(2)}%</div></div>
          <div class="m"><div class="ml">Impressões</div><div class="mv">${fmtK(c.impr)}</div></div>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ===================== abas ===================== */
function switchTab(tab){
  state.tab=tab;
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  document.getElementById('view-overview').classList.toggle('active',tab==='overview');
  document.getElementById('view-creatives').classList.toggle('active',tab==='creatives');
  if(tab==='creatives') renderCreatives();
}

/* ===================== toast ===================== */
let toastTimer;
function toast(msg){
  const el=document.getElementById('toast');
  document.getElementById('toastMsg').textContent=msg;
  el.classList.add('show'); clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'),2200);
}

/* ===================== theme.js ===================== */
function initTheme(){
  const root=document.documentElement, btn=document.getElementById('themeToggle');
  const moon=btn.querySelector('.ic-moon'), sun=btn.querySelector('.ic-sun');
  const sync=()=>{const dark=root.getAttribute('data-theme')==='dark';moon.style.display=dark?'block':'none';sun.style.display=dark?'none':'block';};
  sync();
  btn.addEventListener('click',()=>{const next=root.getAttribute('data-theme')==='dark'?'light':'dark';root.setAttribute('data-theme',next);try{localStorage.setItem('dashboard-theme',next);}catch(e){}sync();buildCharts(rowsInRange());});
}

/* ===================== date-filter.js (calendário · portal pattern) ===================== */
const Cal=(function(){
  let pop=null, view=new Date(); // definido de verdade em open()
  let mode='range', selStart=null, selEnd=null;

  function open(){
    if(pop){close();return;}
    selStart=new Date(state.from); selEnd=new Date(state.to);
    view=new Date(state.to.getFullYear(),state.to.getMonth(),1);
    pop=document.createElement('div');
    pop.className='cal-pop';
    document.body.appendChild(pop); // PORTAL: filho direto do body
    build();
    position();
    setTimeout(()=>{document.addEventListener('click',outside);window.addEventListener('scroll',close,true);document.addEventListener('keydown',esc);},0);
  }
  function close(){if(!pop)return;pop.remove();pop=null;document.removeEventListener('click',outside);window.removeEventListener('scroll',close,true);document.removeEventListener('keydown',esc);}
  function esc(e){if(e.key==='Escape')close();}
  function outside(e){if(pop&&!pop.contains(e.target)&&e.target.id!=='calBtn'&&!e.target.closest('#calBtn'))close();}

  function position(){
    const r=document.getElementById('calBtn').getBoundingClientRect();
    const h=pop.offsetHeight, w=pop.offsetWidth;
    let top=r.bottom+8, left=Math.min(r.left,window.innerWidth-w-12);
    if(top+h>window.innerHeight-12) top=r.top-h-8; // abre acima se não couber
    pop.style.top=Math.max(12,top)+'px'; pop.style.left=Math.max(12,left)+'px';
  }
  function build(){
    const y=view.getFullYear(), m=view.getMonth();
    const first=new Date(y,m,1).getDay(), dim=new Date(y,m+1,0).getDate();
    let cells='';
    for(let i=0;i<first;i++) cells+='<div class="cal-d empty"></div>';
    for(let d=1;d<=dim;d++){
      const k=y*10000+(m+1)*100+d; const has=DATA.some(r=>r.key===k);
      const cur=new Date(y,m,d);
      let cls='cal-d'+(has?'':' muted');
      if(selStart&&selEnd){const ks=dkey(selStart),ke=dkey(selEnd);if(k===ks||k===ke)cls+=' sel';else if(k>ks&&k<ke)cls+=' inrange';}
      else if(selStart&&dkey(selStart)===k)cls+=' sel';
      cells+=`<div class="${cls}" data-day="${d}">${d}</div>`;
    }
    pop.innerHTML=`
      <div class="cal-modes">
        <button class="cal-mode ${mode==='single'?'active':''}" data-mode="single">Dia único</button>
        <button class="cal-mode ${mode==='range'?'active':''}" data-mode="range">Período</button>
      </div>
      <div class="cal-nav">
        <button data-nav="-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg></button>
        <span class="mt">${MONTHS[m]} ${y}</span>
        <button data-nav="1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg></button>
      </div>
      <div class="cal-dow"><span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span></div>
      <div class="cal-grid">${cells}</div>
      <div class="cal-actions"><button class="clear" data-act="clear">Limpar</button><button class="apply" data-act="apply">Aplicar</button></div>`;
    wire();
  }
  function wire(){
    // stopPropagation em TODO clique interno
    pop.addEventListener('click',e=>e.stopPropagation());
    pop.querySelectorAll('.cal-mode').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;if(mode==='single'&&selStart)selEnd=new Date(selStart);build();position();}));
    pop.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>{view.setMonth(view.getMonth()+ +b.dataset.nav);build();position();}));
    // EVENT DELEGATION no grid (innerHTML recriado destrói listeners individuais)
    pop.querySelector('.cal-grid').addEventListener('click',e=>{
      const cell=e.target.closest('[data-day]'); if(!cell)return;
      const d=+cell.dataset.day, picked=new Date(view.getFullYear(),view.getMonth(),d);
      if(mode==='single'){selStart=picked;selEnd=new Date(picked);}
      else{
        if(!selStart||(selStart&&selEnd)){selStart=picked;selEnd=null;}
        else{if(picked<selStart){selEnd=selStart;selStart=picked;}else selEnd=picked;}
      }
      build();position();
    });
    pop.querySelector('[data-act="apply"]').addEventListener('click',()=>{
      if(!selStart){close();return;}
      state.from=new Date(selStart); state.to=new Date(selEnd||selStart);
      document.querySelectorAll('.preset').forEach(p=>p.classList.remove('active'));
      document.getElementById('calBtn').classList.add('active');
      console.log('[DateFilter] Aplicado:',{from:state.from.toDateString(),to:state.to.toDateString()});
      render(); close(); toast('Período aplicado');
    });
    pop.querySelector('[data-act="clear"]').addEventListener('click',()=>{selStart=null;selEnd=null;build();position();});
  }
  return {open};
})();

/* ===================== status online/demo ===================== */
function setStatus(source){
  const tag=document.querySelector('.demo-tag');
  if(!tag) return;
  if(source==='live'){ tag.textContent='online'; tag.style.color='var(--c-success)'; tag.style.background='rgba(31,157,86,.14)'; }
  else { tag.textContent='snapshot mai/26'; }
}

/* ===================== main.js (boot) ===================== */
async function boot(){
  // abas
  document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
  // filtro de plataforma
  document.getElementById('platformSelect').addEventListener('change',e=>{state.platform=e.target.value;render();if(state.tab==='creatives')renderCreatives();});
  // presets
  document.getElementById('presets').addEventListener('click',e=>{
    const b=e.target.closest('.preset'); if(!b)return;
    if(b.dataset.preset==='calendar'){Cal.open();return;}
    document.querySelectorAll('.preset').forEach(p=>p.classList.remove('active')); b.classList.add('active');
    state.presetLabel=b.textContent.trim(); applyQuickPreset(b.dataset.preset);
  });
  // filtros de status (criativos)
  document.getElementById('creFilters').addEventListener('click',e=>{
    const b=e.target.closest('.sfilter'); if(!b)return;
    document.querySelectorAll('.sfilter').forEach(s=>s.classList.remove('active')); b.classList.add('active');
    creFilter=b.dataset.s; renderCreatives();
  });
  // botões
  document.getElementById('refreshBtn').addEventListener('click',()=>{render();if(state.tab==='creatives')renderCreatives();toast('Dados atualizados');});
  document.getElementById('reportBtn').addEventListener('click',()=>{toast('Abrindo relatório para impressão…');setTimeout(()=>window.print(),400);});

  initTheme();
  const res=await SheetsAPI.load();
  DATA=res.rows; LAST=DATA[DATA.length-1].dt; MONTH_DAYS=DATA.length;
  state.from=DATA[0].dt; state.to=LAST;
  render();
  setStatus(res.source);
  console.log('[App] ✓ Dashboard pronto · '+DATA.length+' dias ('+res.source+')');
}
if(document.readyState!=='loading'){boot();}else{document.addEventListener('DOMContentLoaded',boot);}
