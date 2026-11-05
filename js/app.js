import { Q, computeResult as computeResultFor, rankedKeys as rankedKeysFor } from "./data/scoring.js";
import { BRAND, PARTNER_WEBSITES, BUY, RECOMMENDATION_LOCALES, REC, EXTRA_GAMES, EXTRA_ORDER } from "./data/games.js";
import { LANGS, i18n, VERDICTS, PENDING_NOTE } from "./locales/index.js";

/* =========================================================================
   ERMITTLERTYP-TEST
   - Statische ES-Module, kein Build-Schritt erforderlich.
   - Übersetzungen, Spielekatalog und Scoring liegen in eigenen Modulen.
   ========================================================================= */

/* ---- 3) STATE + HELPER -------------------------------------------------- */
let lang="de";
let qi=0;
const answers=new Array(Q.length).fill(null); // gewählter ORIGINAL-Optionsindex je Frage
let order=[];                                 // Anzeige-Reihenfolge je Frage (gemischt)
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function buildOrder(){ order = Q.map(()=>shuffle([0,1,2,3])); } // pro Durchlauf neu mischen

const $=id=>document.getElementById(id);
function L(){ return i18n[lang]; }
/* Inhalte (q/types/rex/cases) bei pending-Sprachen aus EN ziehen: */
function C(){ return L().pending ? i18n.en : L(); }
function fmt(s,...v){ return s.replace(/%(\d)/g,(_,n)=>v[n-1]); }

/* ---- BILDER ------------------------------------------------------------- */
/* Mapping Ergebnistyp → Datei in img/ (Rex = EasterEgg). Hahnke (Rückenansicht)
   sitzt sprachneutral im Intro. Quadratische JPEGs, in img/ optimiert abgelegt. */
const HAHNKE_SRC="img/hahnke.jpg";
function portraitSrc(key){ return key==="rex" ? "img/rex.jpg" : "img/typ"+key+".jpg"; }
/* Fall-Keyvisual (Spiel-Cover) → Datei in img/. Liegt die Datei (noch) nicht vor,
   blendet renderResult das Bild per onerror einfach aus — der Text bleibt unverändert. */
function caseImgSrc(key){ return key==="rex" ? "img/fallrex.jpg" : "img/fall"+key+".jpg"; }
function loadImg(src){ return new Promise(res=>{ if(!src){res(null);return;} const im=new Image(); im.onload=()=>res(im); im.onerror=()=>res(null); im.src=src; }); }
/* Setzt das Porträt in einen .portrait-Slot (ersetzt das "?"-Platzhalterzeichen). */
function setPortrait(el, src){
  if(!el) return;
  let img=el.querySelector("img");
  if(!img){ img=document.createElement("img"); img.alt=""; el.insertBefore(img, el.firstChild); }
  if(img.getAttribute("src")!==src) img.src=src;
  el.classList.add("has-img");
}

/* ---- SHAREPIC (Instagram) ---------------------------------------------- */
function igHandle(lang){ return lang==="de" ? BRAND.ig.de : BRAND.ig.int; }

/* Offizielles weißes Logo als data:image/png;base64,... hier einsetzen (Originalproportionen, nur Weiß).
   Solange leer, zeigt das Sharepic einen Logo-Platzhalter. */
const LOGO_DATA="img/logo.svg";   /* offizielles weißes CI-Logo (SVG, aus CI-Skill) */
let _logoImg=null;
function loadLogo(){return new Promise(res=>{if(!LOGO_DATA){res(null);return;}const im=new Image();im.onload=()=>{_logoImg=im;res(im);};im.onerror=()=>res(null);im.src=LOGO_DATA;});}

let _result=null, _cardBlob=null, _userPhoto=null;
let _caseCycle=[], _caseIdx=0;

function caption(){
  if(!_result) return L().caption||"";
  const v=(VERDICTS[lang]&&VERDICTS[lang][_result.key])||"";
  return (L().caption||"").replace("%name", _result.t.name).replace("%verdict", v);
}
function _spc(x,v){ try{ x.letterSpacing=v; }catch(e){} }
function _wrap(x,text,maxW){
  const words=text.split(" ");const lines=[];let cur="";
  for(const w of words){const tt=cur?cur+" "+w:w; if(x.measureText(tt).width>maxW&&cur){lines.push(cur);cur=w;}else cur=tt;}
  if(cur)lines.push(cur);return lines;
}
function _fit(x,text,maxW,maxLines,startFs,minFs){
  for(let fs=startFs;fs>=minFs;fs-=4){x.font="700 "+fs+"px Oswald";const l=_wrap(x,text,maxW);if(l.length<=maxLines)return{fs,lines:l};}
  x.font="700 "+minFs+"px Oswald";return{fs:minFs,lines:_wrap(x,text,maxW)};
}
async function ensureFonts(){
  try{ await Promise.all([
    document.fonts.load("700 80px Oswald"), document.fonts.load("600 28px Oswald"),
    document.fonts.load("400 28px 'Open Sans'"), document.fonts.load("700 50px Caveat") ]);
    await document.fonts.ready; }catch(e){}
}
/* Zeichnet das 1080×1350 große Instagram-Sharepic mit Porträt oder eigenem Foto. */
async function buildCard(t, portraitSrcUrl){
  await ensureFonts();
  const portraitImg = await loadImg(portraitSrcUrl||null);
  const W=1080,H=1350,c=document.createElement("canvas");c.width=W;c.height=H;
  const x=c.getContext("2d");
  const YEL="#f5dc24",GRN="#b4dc41",PAPER="#f0eadd",INK="#13110d",RED="#b3322f";

  // Hintergrund: dunkle Pinnwand + Vignette + feines Korn
  x.fillStyle="#0c0b09";x.fillRect(0,0,W,H);
  let g=x.createRadialGradient(W/2,H*0.40,120,W/2,H*0.40,H*0.85);
  g.addColorStop(0,"rgba(56,50,40,.40)");g.addColorStop(1,"rgba(0,0,0,0)");
  x.fillStyle=g;x.fillRect(0,0,W,H);
  x.save();x.globalAlpha=.05;
  for(let i=0;i<1500;i++){x.fillStyle=Math.random()<.5?"#fff":"#000";x.fillRect(Math.random()*W,Math.random()*H,2,2);}
  x.restore();
  x.strokeStyle="rgba(245,240,210,.10)";x.lineWidth=2;x.strokeRect(26,26,W-52,H-52);

  const pin=(cx,cy)=>{x.save();
    x.fillStyle="rgba(0,0,0,.45)";x.beginPath();x.arc(cx+2,cy+5,15,0,7);x.fill();
    let pg=x.createRadialGradient(cx-5,cy-6,2,cx,cy,16);pg.addColorStop(0,"#e8615b");pg.addColorStop(1,"#9d2722");
    x.fillStyle=pg;x.beginPath();x.arc(cx,cy,15,0,7);x.fill();
    x.fillStyle="rgba(255,255,255,.6)";x.beginPath();x.arc(cx-5,cy-6,4,0,7);x.fill();x.restore();};

  // Polizei-Absperrband oben
  (function(){x.save();x.translate(W/2,134);x.rotate(-2.2*Math.PI/180);
    x.fillStyle=YEL;x.fillRect(-(W/2)-60,-44,W+120,88);
    x.strokeStyle="rgba(0,0,0,.6)";x.lineWidth=3;
    x.beginPath();x.moveTo(-(W/2)-60,-44);x.lineTo(W/2+60,-44);x.moveTo(-(W/2)-60,44);x.lineTo(W/2+60,44);x.stroke();
    x.fillStyle="#000";x.textAlign="center";x.textBaseline="middle";x.font="700 30px Oswald";_spc(x,"9px");
    x.fillText((L().tape||"").toUpperCase(),0,2);_spc(x,"0px");x.restore();})();

  // Beweisfoto (angepinnt, gekippt)
  const ps=460,fb=18,photoTop=212,cyP=photoTop+(ps/2+fb),ang=-3;
  x.save();x.translate(W/2,cyP);x.rotate(ang*Math.PI/180);
  x.fillStyle="rgba(0,0,0,.5)";x.fillRect(-ps/2-fb+8,-ps/2-fb+12,ps+2*fb,ps+2*fb);
  x.fillStyle="#efeae0";x.fillRect(-ps/2-fb,-ps/2-fb,ps+2*fb,ps+2*fb);
  x.save();x.beginPath();x.rect(-ps/2,-ps/2,ps,ps);x.clip();
  if(portraitImg){
    // formatfüllend (cover) ins quadratische Feld – verzerrt eigene Hochformat-Fotos nicht
    const iw=portraitImg.width, ih=portraitImg.height, sq=Math.min(iw,ih);
    x.drawImage(portraitImg,(iw-sq)/2,(ih-sq)/2,sq,sq, -ps/2,-ps/2,ps,ps);
  } else {
    x.fillStyle="#15140f";x.fillRect(-ps/2,-ps/2,ps,ps);
    x.strokeStyle="#100f0c";x.lineWidth=12;
    for(let i=-ps;i<ps*2;i+=26){x.beginPath();x.moveTo(-ps/2+i,-ps/2);x.lineTo(-ps/2+i-ps,ps/2);x.stroke();}
    x.fillStyle="#6c675c";x.font="700 150px Oswald";x.textAlign="center";x.textBaseline="middle";x.fillText("?",0,6);
  }
  x.restore();
  x.fillStyle="rgba(236,230,216,.5)";
  x.save();x.translate(-ps/2-fb+4,-ps/2-fb+4);x.rotate(-45*Math.PI/180);x.fillRect(-58,-17,116,34);x.restore();
  x.save();x.translate(ps/2+fb-4,ps/2+fb-4);x.rotate(-45*Math.PI/180);x.fillRect(-58,-17,116,34);x.restore();
  x.restore();
  pin(W/2,photoTop+10);

  // Stempel "Akte geschlossen"
  (function(){x.save();x.translate(W-236,322);x.rotate(-13*Math.PI/180);x.globalAlpha=.92;
    const sw=300,sh=92;x.strokeStyle=RED;x.lineWidth=5;
    x.strokeRect(-sw/2,-sh/2,sw,sh);x.strokeRect(-sw/2+8,-sh/2+8,sw-16,sh-16);
    x.fillStyle=RED;x.textAlign="center";x.textBaseline="middle";x.font="800 30px Oswald";_spc(x,"3px");
    x.fillText((L().stamp||"").toUpperCase(),0,2);_spc(x,"0px");x.restore();})();

  // Kicker
  let ny=cyP+(ps/2+fb)+66;
  x.textAlign="center";x.textBaseline="alphabetic";
  x.fillStyle=GRN;x.font="700 26px Oswald";_spc(x,"7px");
  x.fillText((L().cardKicker||"").toUpperCase(),W/2,ny);_spc(x,"0px");

  // Name auf Klebeband
  const nm=t.name.toUpperCase();const fit=_fit(x,nm,W-320,2,72,38);
  const tapeH=fit.lines.length>1?176:108,tapeY=ny+34+tapeH/2,tapeW=W-150,tang=1.5;
  x.save();x.translate(W/2,tapeY);x.rotate(tang*Math.PI/180);
  x.fillStyle="rgba(0,0,0,.4)";x.fillRect(-tapeW/2+6,-tapeH/2+9,tapeW,tapeH);
  const nt=12;x.fillStyle=PAPER;x.beginPath();
  x.moveTo(-tapeW/2,-tapeH/2);x.lineTo(tapeW/2,-tapeH/2);x.lineTo(tapeW/2-nt,0);x.lineTo(tapeW/2,tapeH/2);
  x.lineTo(-tapeW/2,tapeH/2);x.lineTo(-tapeW/2+nt,0);x.closePath();x.fill();
  x.globalAlpha=.05;x.strokeStyle="#000";x.lineWidth=1;
  for(let i=-tapeH/2+6;i<tapeH/2;i+=7){x.beginPath();x.moveTo(-tapeW/2,i);x.lineTo(tapeW/2,i);x.stroke();}
  x.globalAlpha=1;
  x.fillStyle=INK;x.textAlign="center";x.textBaseline="middle";x.font="700 "+fit.fs+"px Oswald";_spc(x,"1px");
  const lh=fit.fs*1.04,y0=-(fit.lines.length-1)*lh/2;
  fit.lines.forEach((ln,i)=>x.fillText(ln,0,y0+i*lh));_spc(x,"0px");x.restore();

  // Tagline (Caveat)
  x.fillStyle=GRN;x.font="700 50px Caveat";x.textAlign="center";x.textBaseline="alphabetic";
  x.fillText(t.tag,W/2,tapeY+tapeH/2+62);

  // Footer: Hahnkes Urteil (statt Hashtag) + URL/Handle. Hashtag lebt jetzt in der Caption.
  x.textAlign="center";
  const ctaY=H-156;
  const verdict=(_result&&VERDICTS[lang]&&VERDICTS[lang][_result.key])||"";
  if(verdict){
    x.fillStyle="#f2efe4";
    let vfs=33, vlines=[];
    for(; vfs>=23; vfs-=2){ x.font="600 "+vfs+"px 'Open Sans'"; vlines=_wrap(x,"\u00bb "+verdict+" \u00ab",W-200); if(vlines.length<=2) break; }
    const vlh=vfs*1.3, vy0=(ctaY-46)-(vlines.length-1)*vlh;
    vlines.forEach((ln,i)=>x.fillText(ln,W/2,vy0+i*vlh));
  }
  x.fillStyle="#9a958a";x.font="400 26px 'Open Sans'";
  x.fillText((L().cardCta||"")+" "+BRAND.url+"  \u00b7  "+igHandle(lang),W/2,ctaY);
  // Logo (weiß, Originalproportionen) — sonst Platzhalter
  if(LOGO_DATA && !_logoImg){ await loadLogo(); }
  if(_logoImg){
    const lw=150, lh=lw*(_logoImg.height/_logoImg.width||0.5);
    x.drawImage(_logoImg, W/2-lw/2, H-46-lh, lw, lh);
  } else {
    // Fallback: weißer Wortmarken-Schriftzug (offizielles weißes Logo via LOGO_DATA einsetzbar)
    x.fillStyle="#f2efe4";x.textAlign="center";x.textBaseline="middle";x.font="700 46px Oswald";_spc(x,"8px");
    x.fillText("HIDDEN GAMES",W/2,H-82);_spc(x,"0px");x.textBaseline="alphabetic";
  }
  return c;
}
async function generateCard(){
  if(!_result) return; _cardBlob=null;
  const img=$("cardPreview"); img.classList.remove("ready");
  try{
    const c=await buildCard(_result.t, _userPhoto||_result.portrait);
    img.src=c.toDataURL("image/jpeg",0.92); img.classList.add("ready");
    c.toBlob(b=>{ _cardBlob=b; },"image/jpeg",0.92);
  }catch(e){}
}
async function getCardBlob(){
  if(_cardBlob) return _cardBlob;
  const c=await buildCard(_result.t, _userPhoto||_result.portrait);
  return await new Promise(r=>c.toBlob(r,"image/jpeg",0.92));
}
function downloadBlob(b,name){
  const u=URL.createObjectURL(b);const a=document.createElement("a");
  a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),1500);
}

/* ---- 4) RENDER ---------------------------------------------------------- */
function renderChrome(){
  document.documentElement.lang=lang;
  document.title=L().title.join("")+" — Hidden Games";
  // Sprachbuttons
  const nav=$("langs"); nav.innerHTML="";
  LANGS.forEach(code=>{
    const b=document.createElement("button");
    b.textContent=code.toUpperCase();
    b.className=code===lang?"active":"";
    b.setAttribute("aria-pressed", code===lang);
    b.onclick=()=>{ lang=code; syncURL(); renderAll(); };
    nav.appendChild(b);
  });
  // pending-Hinweis
  const p=$("pending");
  if(L().pending){ p.textContent=PENDING_NOTE[lang]; p.classList.add("show"); }
  else { p.classList.remove("show"); }
}

function renderIntro(){
  $("introTape").textContent=L().tape;
  $("introKicker").textContent=L().kicker;
  const [a,y,b]=L().title;
  $("introTitle").innerHTML = a+'<span class="y">'+y+'</span>'+b;
  $("introLead").textContent=L().lead;
  $("introSig").textContent=L().sig||"";
  $("introMeta").textContent=L().meta;
  $("startBtn").textContent=L().start;
}

function renderQuestion(){
  const data=C().q[qi];
  $("qcount").textContent=fmt(L().qcount, qi+1, Q.length);
  $("barfill").style.width=((qi)/Q.length*100)+"%";
  $("qno").textContent=fmt(L().qno, qi+1);
  $("questionText").textContent=data.q;
  const wrap=$("opts"); wrap.innerHTML="";
  const seq = order[qi] || [0,1,2,3];
  seq.forEach((origIdx,slot)=>{
    const txt=data.a[origIdx];
    const sel=answers[qi]===origIdx;
    const b=document.createElement("button");
    b.className="opt"+(sel?" sel":"");
    b.innerHTML='<span class="tag">'+String.fromCharCode(65+slot)+'</span><span>'+txt+'</span>';
    b.setAttribute("aria-pressed", sel);
    b.onclick=()=>{ answers[qi]=origIdx; renderQuestion(); };
    wrap.appendChild(b);
  });
  $("backBtn").textContent=L().back;
  $("backBtn").style.visibility = qi===0 ? "hidden":"visible";
  const isLast = qi===Q.length-1;
  $("nextBtn").textContent = isLast ? L().finish : L().next;
  $("nextBtn").disabled = answers[qi]===null;
}

function computeResult(){ return computeResultFor(answers); }
function rankedKeys(){ return rankedKeysFor(answers); }
/* Fall-Empfehlungs-Zyklus: Ranked Types → Fälle (REC-Remap pro Markt), Duplikate raus.
   Erster Eintrag = beste Empfehlung; weitere = Alternativen für "Schon gespielt". */
/* Normalisiertes Spiel-Objekt für die Fall-Karte: aus bestehendem Typ-Fall ... */
function gameFromType(caseKey){
  const cs=(String(caseKey)==="rex")?C().cases.rex:C().cases[caseKey];
  const buy=BUY[caseKey]||{};
  return { key:String(caseKey), title:cs.title, blurb:cs.blurb,
           amazon:(buy.amazon||{})[lang]||"", partner:(buy.partner||{})[lang]||PARTNER_WEBSITES[lang]||"",
           shopDe:buy.shopDe||"", img:caseImgSrc(caseKey) };
}
/* ... oder aus dem Zusatzkatalog (EXTRA_GAMES, ohne festen Typ). */
function gameFromExtra(id){
  const g=EXTRA_GAMES[id];
  const localized=(C().games||{})[id] || (i18n.de.games||{})[id];
  return { key:id, title:localized?.title||id, blurb:localized?.blurb||"",
           amazon:(g.amazon||{})[lang]||"", partner:(g.partner||{})[lang]||PARTNER_WEBSITES[lang]||"",
           shopDe:g.shopDe||"", img:g.img, isNew:!!g.isNew };
}
function extraAvailable(game){
  return !!(C().games||{})[game.key];
}
/* Fall-Empfehlungs-Zyklus: beste typ-passende Empfehlung zuerst, danach neue Spiele,
   anschließend die weiteren Typ-Fälle und der restliche verfügbare Katalog. */
function caseCycleFor(){
  const out=[], seen=new Set();
  const add=g=>{ if(g && !seen.has(g.key)){ seen.add(g.key); out.push(g); } };
  const ranked=rankedKeys();
  const addType=k=>{
    const rk=(REC[lang] && REC[lang][k]!=null) ? REC[lang][k] : k;
    add(gameFromType(rk));
  };
  if(ranked.length) addType(ranked[0]);
  EXTRA_ORDER.filter(id=>EXTRA_GAMES[id].isNew).forEach(id=>{
    const game=gameFromExtra(id); if(extraAvailable(game)) add(game);
  });
  ranked.slice(1).forEach(addType);
  EXTRA_ORDER.filter(id=>!EXTRA_GAMES[id].isNew).forEach(id=>{
    const game=gameFromExtra(id); if(extraAvailable(game)) add(game);
  });
  return out;
}
/* Füllt die Fall-Karte (Label/Ribbon/Titel/Blurb/Keyvisual/Kauf-Buttons) aus einem Spiel-Objekt. */
function renderCase(game, isAlt){
  $("caseLabel").textContent = isAlt ? (L().altLabel||L().caseLabel) : L().caseLabel;
  $("caseRibbon").textContent = isAlt ? (L().altRibbon||L().caseRibbon) : L().caseRibbon;
  $("caseTitle").textContent = game.title;
  const newBadge=$("caseNewBadge");
  newBadge.textContent=L().newBadge||"Neu";
  newBadge.hidden=!game.isNew;
  $("caseBlurb").textContent = game.blurb;
  let bhtml = "";
  if(game.amazon) bhtml += '<a class="btn buy" href="'+game.amazon+'" target="_blank" rel="noopener">🛒 '+(L().amazonBtn||"Amazon")+'</a>';
  if(game.partner) bhtml += '<a class="btn buy" href="'+game.partner+'" target="_blank" rel="noopener">'+(L().partnerBtn||"Mehr erfahren")+'</a>';
  if(lang==="de" && game.shopDe) bhtml += '<a class="btn buy ghost" href="'+game.shopDe+'" target="_blank" rel="noopener">'+(L().shopBtn||"Shop")+'</a>';
  $("buyActions").innerHTML = bhtml;
  const cimg=$("caseImg"); cimg.hidden=true;
  cimg.alt=game.title;
  cimg.onload=()=>{ cimg.hidden=false; };
  cimg.onerror=()=>{ cimg.hidden=true; };
  cimg.src=game.img;
}
/* "Das kenne ich schon" → nächstes Spiel im Zyklus zeigen (springt am Ende zurück zur Empfehlung). */
function showNextCase(){
  if(_caseCycle.length<2) return;
  _caseIdx=(_caseIdx+1)%_caseCycle.length;
  renderCase(_caseCycle[_caseIdx], _caseIdx!==0);
  $("altBtn").textContent = (_caseIdx===0 ? (L().alreadyPlayed||"Schon gespielt") : (L().anotherCase||"Anderer Fall"));
}

function renderResult(){
  const key=computeResult();
  const isRex = key==="rex";
  const t = isRex ? C().rex : C().types[key];
  $("barfill").style.width="100%";
  $("stamp").textContent=L().stamp;
  $("resLabel").textContent=L().resLabel;
  $("resName").textContent=t.name;
  $("resTag").textContent=t.tag;
  setPortrait($("resultPortrait"), portraitSrc(key));   // Porträt/Karikatur statt "?"
  $("portraitNote").textContent="";
  $("resDesc").textContent=t.desc;
  $("collLabel").textContent=L().collLabel;
  $("resColl").textContent=t.coll;
  $("resHahnke").textContent=(VERDICTS[lang]&&VERDICTS[lang][key])||L().hahnke||"";
  // Empfehlung nur in vollständig gepflegten Sprachkatalogen. Kaufbuttons sind optional.
  const hideCase = !RECOMMENDATION_LOCALES.includes(lang);
  $("caseSection").style.display = hideCase ? "none" : "";
  // Fall-Empfehlung als Zyklus: Platz 1 = bester Fall; "Schon gespielt" zeigt den Fall
  // des nächststärksten Ermittlertyps (Spieler-Feedback). renderCase füllt die Karte.
  _caseCycle = caseCycleFor();
  _caseIdx = 0;
  renderCase(_caseCycle[0], false);
  $("altBtn").textContent = L().alreadyPlayed || "Schon gespielt";
  $("altBtn").style.display = (!hideCase && _caseCycle.length>1) ? "" : "none";
  $("restartBtn").textContent=L().restart;
  $("saveBtn").textContent="📸 "+L().saveImg;
  $("shareImgBtn").textContent=L().shareImg;
  $("shareImgBtn").hidden = !(navigator.canShare);
  $("captionBtn").textContent=L().copyCaption;
  $("shareHead").textContent=L().shareHead||"";
  $("shareHint").textContent=L().shareHint;
  // Eigenes-Foto-Schaltflächen (Foto landet nur im Teilen-Bild und bleibt auf dem Gerät)
  $("photoBtn").textContent=L().uploadPhoto||"📷 Eigenes Foto";
  $("photoResetBtn").textContent=L().removePhoto||"Foto entfernen";
  $("photoResetBtn").hidden = !_userPhoto;
  $("photoHint").textContent=L().photoHint||"";
  $("copied").classList.remove("show");
  _result={ t:t, isRex:isRex, key:key, portrait:portraitSrc(key) };
  generateCard();
}

function show(screen){
  ["intro","quiz","result"].forEach(s=>{
    $("screen-"+s).classList.toggle("hidden", s!==screen);
  });
  window.scrollTo({top:0,behavior:"instant"in window?"instant":"auto"});
}

function renderAll(){
  renderChrome();
  renderIntro();
  // aktuellen Screen frisch zeichnen
  if(!$("screen-quiz").classList.contains("hidden")) renderQuestion();
  if(!$("screen-result").classList.contains("hidden")) renderResult();
}

/* ---- 5) FLOW ------------------------------------------------------------ */
function start(){ qi=0; answers.fill(null); buildOrder(); _userPhoto=null; renderQuestion(); show("quiz"); }
function next(){
  if(answers[qi]===null) return;
  if(qi<Q.length-1){ qi++; renderQuestion(); show("quiz"); }
  else { renderResult(); show("result"); }
}
function back(){ if(qi>0){ qi--; renderQuestion(); show("quiz"); } }

/* ---- 6) URL / Sprache --------------------------------------------------- */
function syncURL(){
  const u=new URL(window.location);
  u.searchParams.set("lang",lang);
  history.replaceState(null,"",u);
}
function initLang(){
  const p=new URLSearchParams(location.search).get("lang");
  if(p && LANGS.includes(p)){ lang=p; return; }
  const b=(navigator.language||"de").slice(0,2).toLowerCase();
  lang = LANGS.includes(b) ? b : "en";
}

/* ---- 7) WIRE UP --------------------------------------------------------- */
$("startBtn").onclick=start;
$("nextBtn").onclick=next;
$("backBtn").onclick=back;
$("restartBtn").onclick=()=>{ qi=0; answers.fill(null); renderIntro(); show("intro"); };
$("saveBtn").onclick=async()=>{ const b=await getCardBlob(); if(b) downloadBlob(b,"hidden-games-ermittlertyp.jpg"); };
$("shareImgBtn").onclick=async()=>{
  const b=await getCardBlob(); if(!b) return;
  const f=new File([b],"hidden-games-ermittlertyp.jpg",{type:"image/jpeg"});
  try{ if(navigator.canShare && navigator.canShare({files:[f]})) await navigator.share({files:[f], text:caption()}); }catch(e){}
};
$("captionBtn").onclick=async()=>{
  try{ await navigator.clipboard.writeText(caption()); }catch(e){}
  $("copied").textContent=L().captionCopied; $("copied").classList.add("show");
  setTimeout(()=>$("copied").classList.remove("show"),2200);
};
$("altBtn").onclick=showNextCase;
$("photoBtn").onclick=()=>$("photoInput").click();
$("photoInput").onchange=e=>{
  const f=e.target.files&&e.target.files[0]; if(!f) return;
  if(_userPhoto){ try{ URL.revokeObjectURL(_userPhoto); }catch(_){ } }
  _userPhoto=URL.createObjectURL(f);
  $("photoResetBtn").hidden=false;
  generateCard();
  e.target.value="";   // erlaubt erneutes Wählen derselben Datei
};
$("photoResetBtn").onclick=()=>{
  if(_userPhoto){ try{ URL.revokeObjectURL(_userPhoto); }catch(_){ } }
  _userPhoto=null; $("photoResetBtn").hidden=true; generateCard();
};

initLang();
renderAll();
show("intro");
