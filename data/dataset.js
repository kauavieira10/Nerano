/* data/dataset.js — fallback offline (30 dias simulados) */
const DEMO_DATASET=(function(){
  const dias=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const rows=[]; let seed=42; const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280;};
  for(let d=1;d<=30;d++){
    const date=new Date(2026,4,d);
    const weekend=[0,6].includes(date.getDay());
    const fG=Math.round((weekend?260:420)+rnd()*180);
    const fF=Math.round((weekend?180:300)+rnd()*150);
    const lG=Math.max(2,Math.round(fG/(34+rnd()*14)));
    const lF=Math.max(1,Math.round(fF/(40+rnd()*18)));
    rows.push({dt:date,key:20260500+d,data:`${String(d).padStart(2,'0')}/05`,dia:dias[date.getDay()],
      verbaGoogle:fG,leadsGoogle:lG,verbaFacebook:fF,leadsFacebook:lF});
  }
  return rows;
})();
