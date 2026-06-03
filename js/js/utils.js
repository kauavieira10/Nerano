/* js/utils.js — formatadores e helpers */
const fmtBRL=v=>'R$ '+Math.round(v).toLocaleString('pt-BR');
const fmtBRL2=v=>'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtNum=v=>Math.round(v).toLocaleString('pt-BR');
const fmtK=v=>v>=1000?(v/1000).toLocaleString('pt-BR',{maximumFractionDigits:1})+'k':String(v);
const pct=(a,b)=>b?Math.round(a/b*100):0;
const dkey=d=>d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
const MONTHS=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MSHORT=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

const WEEK=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
function pad(n){return String(n).padStart(2,'0');}
function fmtDM(dt){return pad(dt.getDate())+'/'+pad(dt.getMonth()+1);}
function normHeader(h){return String(h||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();}
function num(v){
  if(v==null||v==='')return 0;
  if(typeof v==='number')return v;
  let s=String(v).trim().replace(/[R$\s%]/g,'');
  if(s.includes(',')) s=s.replace(/\./g,'').replace(',','.'); // formato pt-BR
  const n=parseFloat(s); return isNaN(n)?0:n;
}
function parseDate(v){
  if(!v)return null; v=String(v).trim();
  let m=v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if(m){let y=+m[3]; if(y<100)y+=2000; return new Date(y,+m[2]-1,+m[1]);}
  m=v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if(m)return new Date(+m[1],+m[2]-1,+m[3]);
  const d=new Date(v); return isNaN(d)?null:d;
}
