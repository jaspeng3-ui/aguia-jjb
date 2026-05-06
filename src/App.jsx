import { useState, useEffect, useCallback, useRef } from "react";
import { loadAll as fbLoad, saveAll as fbSave } from "./firebase.js";

const LOGO_SRC = "/logo.png";
const BANNER_SRC = "/banner.jpg";
const ADMIN_CODE = "aguia83000toulonjjb";

const C = {
  bg:"#080c14", card:"#111827", cardAlt:"#0f1b2d",
  red:"#9b1c1c", redLight:"#c53030",
  blue:"#1a2744", blueMid:"#1e3a5f", blueLight:"#2b5a8f",
  gold:"#d4952b", green:"#166534",
  text:"#e8e6e1", textMuted:"#7a8599",
  border:"#1e293b", borderLight:"#2d3b52",
};

const BELTS = ["Blanche","Bleue","Violette","Marron","Noire","Corail"];
const BELT_COLORS = {Blanche:"#e8e6e1",Bleue:"#2563eb",Violette:"#7c3aed",Marron:"#92400e",Noire:"#1a1a2e",Corail:"#f97316"};

const DEFAULT_TEXTS = {
  heroTitle:"AGUIA JJB", heroSubtitle:"Jiu-Jitsu Brésilien à Toulon & La Moutonne",
  aboutTitle:"Qui sommes-nous",
  aboutText:"Aguia JJB est une association dédiée à la pratique et à la promotion du Jiu-Jitsu Brésilien. Fondée par des passionnés, notre mission est de transmettre les valeurs de cet art martial : discipline, respect, dépassement de soi et esprit de communauté. Nos entraînements sont encadrés par des instructeurs qualifiés dans une ambiance bienveillante. Au-delà du sport, Aguia JJB est un lieu de partage où chaque membre progresse à son rythme.",
  ctaTitle:"3 cours d'essai offerts !", ctaText:"Réservez votre place en nous contactant sur les réseaux ou via la rubrique contact.",
  offresTitle:"Rejoignez Aguia JJB",
  offresIntro:"Plongez dans l'univers du Jiu-Jitsu Brésilien ! Nos formules s'adaptent à tous : ados, adultes, débutants ou confirmés.",
  offresEssaiTitle:"Cours d'essai", offresEssaiText:"3 cours d'essai offerts pour découvrir le JJB. Sans engagement.",
  offresAdhesionTitle:"Adhésion annuelle", offresAdhesionText:"Accès à tous les entraînements, dans tous les lieux, pour toute la saison.",
  offresImportant:"L'inscription est valable du 1er septembre au 31 août. Il n'est pas possible de décaler les dates.",
  lieuxTitle:"Lieux & Horaires", lieuxSubtitle:"Retrouvez tous nos créneaux d'entraînement.",
  blogTitle:"Actualités", blogSubtitle:"Suivez l'actualité du club.",
  palmaresTitle:"Palmarès", palmaresIntro:"Résultats et accomplissements de nos athlètes.",
  legalTitle:"Mentions Légales",
  legalContent:"Association Aguia JJB — Loi 1901\nSiège : Toulon, France\n\nPropriété intellectuelle : contenu protégé.\nRGPD : droit d'accès, rectification, suppression.\nCookies : aucun cookie de suivi.",
};

const DEFAULT_LOCATIONS = [
  {id:"1",name:"Cosec St Musse",city:"Toulon",address:"Cosec St Musse, Toulon",lat:43.1242,lng:5.9567,schedules:[{day:"Mardi",time:"20h00 – 21h45"},{day:"Mercredi",time:"18h30 – 20h00"}],color:C.redLight},
  {id:"2",name:"Complexe de l'Estagnol",city:"La Moutonne",address:"Vieux chemin d'Hyères, 83260 La Crau",lat:43.1520,lng:6.0730,schedules:[{day:"Jeudi",time:"12h00 – 13h45"},{day:"Vendredi",time:"12h00 – 13h45"},{day:"Samedi",time:"14h00 – 16h00"}],color:C.gold},
  {id:"3",name:"La Serinette",city:"Toulon",address:"1377 chemin de la Barre, 83000 Toulon",lat:43.1180,lng:5.9350,schedules:[{day:"Jeudi",time:"19h45 – 21h15"}],color:C.blueLight},
];

const DEFAULT_BLOG = [{id:"1",title:"Bienvenue sur le site Aguia JJB !",date:"2025-09-01",excerpt:"Notre site est en ligne !",content:"Bienvenue sur le nouveau site d'Aguia JJB.",image:""}];
const DEFAULT_PALMARES = [{id:"1",athlete:"",competition:"",result:"",date:"",belt:"Blanche",photo:""}];
const DEFAULT_CONFIG = {
  bannerImage:BANNER_SRC,
  helloassoUrl:"https://www.helloasso.com/associations/aguia-jjb/adhesions/adhesion-2025-2026",
  socials:[{id:"fb",name:"Facebook",url:"https://www.facebook.com/AguiaJJB",type:"facebook"},{id:"ig",name:"Instagram",url:"https://www.instagram.com/aguiajjb",type:"instagram"}],
};

// ─── ICONS ────
const I={
  pin:(c="currentColor")=><svg width="18" height="18" fill="none" stroke={c} strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  clock:()=><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  lock:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  ext:()=><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>,
  chev:(d="r")=><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{transform:d==="l"?"rotate(180deg)":""}}><path d="M9 18l6-6-6-6"/></svg>,
  plus:()=><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  trash:()=><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  save:()=><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>,
  up:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6"/></svg>,
  upload:()=><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>,
  check:()=><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>,
  warn:()=><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>,
  fb:()=><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  ig:()=><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  yt:()=><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  tt:()=><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
  link:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
};
const socIco={facebook:I.fb,instagram:I.ig,youtube:I.yt,tiktok:I.tt,other:I.link};

// ─── STYLES ────
const hd={fontFamily:"'Teko',sans-serif",fontWeight:600};
const btn=(bg,col,brd)=>({display:"inline-flex",alignItems:"center",gap:8,padding:"12px 28px",borderRadius:6,border:brd||"none",background:bg,color:col,cursor:"pointer",fontFamily:"'Barlow',sans-serif",fontWeight:600,fontSize:14,transition:"all .3s",letterSpacing:.5});
const crd={background:C.card,borderRadius:12,border:`1px solid ${C.border}`,padding:24,transition:"all .3s"};
const inp={width:"100%",padding:"11px 14px",borderRadius:6,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontFamily:"'Barlow',sans-serif",fontSize:14,outline:"none"};
const lbl={display:"block",fontSize:11,fontWeight:700,color:C.textMuted,marginBottom:5,textTransform:"uppercase",letterSpacing:1.5};
const tag=(color,text)=>(<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><div style={{width:36,height:3,background:color,borderRadius:2}}/><span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:3,color}}>{text}</span></div>);

// ─── UTILS ────
function ScrollTop(){const[s,sS]=useState(false);useEffect(()=>{const h=()=>sS(window.scrollY>400);window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h)},[]);if(!s)return null;return<button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{position:"fixed",bottom:24,right:24,zIndex:900,width:46,height:46,borderRadius:"50%",border:`1px solid ${C.border}`,background:`${C.card}ee`,backdropFilter:"blur(8px)",color:C.text,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onMouseEnter={e=>e.currentTarget.style.background=C.redLight} onMouseLeave={e=>e.currentTarget.style.background=`${C.card}ee`}>{I.up()}</button>;}

function MapEmbed({locations,height=350}){const lats=locations.map(l=>l.lat),lngs=locations.map(l=>l.lng);const cLat=(Math.min(...lats)+Math.max(...lats))/2,cLng=(Math.min(...lngs)+Math.max(...lngs))/2;const m=locations.map(l=>`L.marker([${l.lat},${l.lng}]).addTo(map).bindPopup('<b>${l.name.replace(/'/g,"\\'")}</b><br>${l.city.replace(/'/g,"\\'")}');`).join("");const html=`<!DOCTYPE html><html><head><meta charset="utf-8"/><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script><style>*{margin:0}#map{width:100%;height:100vh}</style></head><body><div id="map"></div><script>var map=L.map('map',{scrollWheelZoom:false}).setView([${cLat},${cLng}],12);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OSM'}).addTo(map);${m}<\/script></body></html>`;return<div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`,width:"100%"}}><iframe title="Carte" width="100%" height={height} frameBorder="0" style={{border:0,display:"block"}} srcDoc={html} loading="lazy"/></div>;}

// ─── IMAGE EDITOR ────
function ImageEditor({src,onSave,onCancel,aspect}){
  const canvasRef=useRef(null);
  const[img,setImg]=useState(null);
  const[zoom,setZoom]=useState(1);
  const[pos,setPos]=useState({x:0,y:0});
  const[dragging,setDragging]=useState(false);
  const[dragStart,setDragStart]=useState({x:0,y:0});
  const[brightness,setBrightness]=useState(100);
  const OUTPUT_W=800,OUTPUT_H=aspect==="square"?800:aspect==="banner"?400:600;
  const PREVIEW_W=360,PREVIEW_H=Math.round(PREVIEW_W*(OUTPUT_H/OUTPUT_W));

  useEffect(()=>{const i=new Image();i.onload=()=>{setImg(i);setZoom(1);setPos({x:0,y:0})};i.src=src},[src]);

  const draw=useCallback(()=>{
    const cv=canvasRef.current;if(!cv||!img)return;
    const ctx=cv.getContext("2d");
    cv.width=PREVIEW_W;cv.height=PREVIEW_H;
    ctx.fillStyle="#111";ctx.fillRect(0,0,PREVIEW_W,PREVIEW_H);
    ctx.filter=`brightness(${brightness}%)`;
    const scale=Math.max(PREVIEW_W/img.width,PREVIEW_H/img.height)*zoom;
    const w=img.width*scale,h=img.height*scale;
    const x=(PREVIEW_W-w)/2+pos.x,y=(PREVIEW_H-h)/2+pos.y;
    ctx.drawImage(img,x,y,w,h);
    ctx.filter="none";
    // grid overlay
    ctx.strokeStyle="rgba(255,255,255,0.15)";ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(PREVIEW_W/3,0);ctx.lineTo(PREVIEW_W/3,PREVIEW_H);ctx.moveTo(2*PREVIEW_W/3,0);ctx.lineTo(2*PREVIEW_W/3,PREVIEW_H);ctx.moveTo(0,PREVIEW_H/3);ctx.lineTo(PREVIEW_W,PREVIEW_H/3);ctx.moveTo(0,2*PREVIEW_H/3);ctx.lineTo(PREVIEW_W,2*PREVIEW_H/3);ctx.stroke();
  },[img,zoom,pos,brightness,PREVIEW_W,PREVIEW_H]);

  useEffect(()=>{draw()},[draw]);

  const handleMouseDown=e=>{e.preventDefault();setDragging(true);const rect=canvasRef.current.getBoundingClientRect();const clientX=e.touches?e.touches[0].clientX:e.clientX;const clientY=e.touches?e.touches[0].clientY:e.clientY;setDragStart({x:clientX-pos.x,y:clientY-pos.y})};
  const handleMouseMove=e=>{if(!dragging)return;e.preventDefault();const clientX=e.touches?e.touches[0].clientX:e.clientX;const clientY=e.touches?e.touches[0].clientY:e.clientY;setPos({x:clientX-dragStart.x,y:clientY-dragStart.y})};
  const handleMouseUp=()=>setDragging(false);

  const exportImg=()=>{
    if(!img)return;
    const cv=document.createElement("canvas");cv.width=OUTPUT_W;cv.height=OUTPUT_H;
    const ctx=cv.getContext("2d");
    ctx.fillStyle="#111";ctx.fillRect(0,0,OUTPUT_W,OUTPUT_H);
    ctx.filter=`brightness(${brightness}%)`;
    const scaleRatio=OUTPUT_W/PREVIEW_W;
    const scale=Math.max(OUTPUT_W/img.width,OUTPUT_H/img.height)*zoom;
    const w=img.width*scale,h=img.height*scale;
    const x=(OUTPUT_W-w)/2+pos.x*scaleRatio,y=(OUTPUT_H-h)/2+pos.y*scaleRatio;
    ctx.drawImage(img,x,y,w,h);
    onSave(cv.toDataURL("image/jpeg",0.8));
  };

  const S={
    overlay:{position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20},
    modal:{background:C.card,borderRadius:16,border:`1px solid ${C.border}`,padding:28,maxWidth:460,width:"100%",maxHeight:"90vh",overflowY:"auto"},
    title:{...hd,fontSize:24,letterSpacing:1,marginBottom:4,color:C.text},
    sub:{fontSize:12,color:C.textMuted,marginBottom:20},
    canvasWrap:{borderRadius:10,overflow:"hidden",border:`2px solid ${C.border}`,marginBottom:16,cursor:dragging?"grabbing":"grab",touchAction:"none",lineHeight:0},
    sliderRow:{display:"flex",alignItems:"center",gap:12,marginBottom:12},
    sliderLabel:{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:1,minWidth:70},
    slider:{flex:1,height:4,appearance:"none",WebkitAppearance:"none",background:C.border,borderRadius:2,outline:"none",cursor:"pointer"},
    btnRow:{display:"flex",gap:10,marginTop:20},
  };

  return <div style={S.overlay} onClick={onCancel}>
    <div style={S.modal} onClick={e=>e.stopPropagation()}>
      <h3 style={S.title}>Éditeur d'image</h3>
      <p style={S.sub}>Déplacez l'image pour recadrer, ajustez le zoom et la luminosité</p>
      
      <div style={S.canvasWrap} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}>
        <canvas ref={canvasRef} style={{width:PREVIEW_W,height:PREVIEW_H,display:"block",maxWidth:"100%"}}/>
      </div>

      <div style={S.sliderRow}>
        <span style={S.sliderLabel}>Zoom</span>
        <input type="range" min="100" max="300" value={Math.round(zoom*100)} onChange={e=>setZoom(e.target.value/100)} style={S.slider}/>
        <span style={{fontSize:12,color:C.textMuted,minWidth:36}}>{Math.round(zoom*100)}%</span>
      </div>

      <div style={S.sliderRow}>
        <span style={S.sliderLabel}>Luminosité</span>
        <input type="range" min="50" max="150" value={brightness} onChange={e=>setBrightness(Number(e.target.value))} style={S.slider}/>
        <span style={{fontSize:12,color:C.textMuted,minWidth:36}}>{brightness}%</span>
      </div>

      <div style={{display:"flex",gap:8,marginTop:4,marginBottom:8}}>
        <button type="button" onClick={()=>{setZoom(1);setPos({x:0,y:0});setBrightness(100)}} style={{...btn("transparent",C.textMuted,`1px solid ${C.border}`),padding:"6px 14px",fontSize:12}}>Réinitialiser</button>
      </div>

      <div style={{fontSize:11,color:C.textMuted,padding:8,background:C.cardAlt,borderRadius:6,marginBottom:16}}>
        Aperçu — l'image sera exportée en {OUTPUT_W}x{OUTPUT_H}px, qualité JPEG 80%
      </div>

      <div style={S.btnRow}>
        <button type="button" onClick={onCancel} style={{...btn("transparent",C.textMuted,`1px solid ${C.border}`),flex:1,justifyContent:"center"}}>Annuler</button>
        <button type="button" onClick={exportImg} style={{...btn(C.redLight,"#fff"),flex:1,justifyContent:"center"}}>{I.check()} Valider</button>
      </div>
    </div>
  </div>;
}

function ImgUpload({value,onChange,label:labelText,aspect}){
  const ref=useRef(null);
  const[upl,setUpl]=useState(false);
  const[editorSrc,setEditorSrc]=useState(null);

  const handleFile=e=>{
    const f=e.target.files?.[0];if(!f)return;
    setEditorSrc(URL.createObjectURL(f));
    e.target.value="";
  };

  const handleEditorSave=(dataUrl)=>{
    setEditorSrc(null);
    onChange(dataUrl);
  };

  return <div>
    <label style={lbl}>{labelText}</label>
    <div style={{display:"flex",gap:8,marginBottom:8}}>
      <input value={typeof value==="string"&&value?.startsWith("data:")?"(image chargée)":value||""} placeholder="URL ou uploader" onChange={e=>onChange(e.target.value)} style={{...inp,flex:1}} readOnly={value?.startsWith?.("data:")}/>
      <button type="button" onClick={()=>ref.current?.click()} disabled={upl} style={{...btn(C.blueMid,"#fff"),padding:"8px 14px",fontSize:12,opacity:upl?.5:1}}>{I.upload()} Image</button>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
    </div>
    {value&&<div style={{position:"relative",display:"inline-block"}}>
      <img src={value} alt="" style={{maxHeight:90,borderRadius:8,objectFit:"cover",border:`1px solid ${C.border}`}} onError={e=>e.target.style.display="none"}/>
      <div style={{display:"flex",gap:4,marginTop:6}}>
        <button type="button" onClick={()=>{if(value)setEditorSrc(value)}} style={{...btn("transparent",C.blueLight,`1px solid ${C.border}`),padding:"4px 10px",fontSize:11}}>Recadrer</button>
        <button type="button" onClick={()=>onChange("")} style={{...btn("transparent",C.redLight,`1px solid ${C.border}`),padding:"4px 10px",fontSize:11}}>{I.trash()} Suppr.</button>
      </div>
    </div>}
    {editorSrc&&<ImageEditor src={editorSrc} aspect={aspect} onSave={handleEditorSave} onCancel={()=>setEditorSrc(null)}/>}
  </div>;
}

function SocialLinks({socials}){return<div style={{display:"flex",gap:14}}>{(socials||[]).map(s=>{const Ico=socIco[s.type]||socIco.other;return<a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" style={{color:C.textMuted,transition:"color .3s,transform .3s",display:"flex"}} onMouseEnter={e=>{e.currentTarget.style.color=C.redLight;e.currentTarget.style.transform="scale(1.15)"}} onMouseLeave={e=>{e.currentTarget.style.color=C.textMuted;e.currentTarget.style.transform=""}}>{Ico()}</a>})}</div>;}

function LocCard({loc,compact}){const[h,sH]=useState(false);return<div style={{...crd,borderLeft:`3px solid ${loc.color}`,transform:h?"translateY(-3px)":"",boxShadow:h?`0 8px 24px ${loc.color}22`:""}} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><div style={{color:loc.color}}>{I.pin(loc.color)}</div><div><div style={{...hd,fontSize:20,letterSpacing:1}}>{loc.name}</div><div style={{fontSize:12,color:C.textMuted}}>{loc.city}</div></div></div>{!compact&&<div style={{fontSize:13,color:C.textMuted,marginBottom:12}}>{loc.address}</div>}<div style={{display:"flex",flexDirection:"column",gap:6}}>{loc.schedules.map((sc,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}>{I.clock()}<span style={{fontWeight:600,minWidth:75}}>{sc.day}</span><span style={{color:C.textMuted}}>{sc.time}</span></div>)}</div></div>;}

function BlogCard({post,onClick}){const[h,sH]=useState(false);return<div style={{...crd,cursor:"pointer",transform:h?"translateY(-3px)":"",borderColor:h?C.blueLight:C.border,overflow:"hidden",padding:0}} onClick={onClick} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)}>{post.image&&<div style={{width:"100%",height:160,overflow:"hidden"}}><img src={post.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform .4s",transform:h?"scale(1.05)":""}}/></div>}<div style={{padding:22}}><div style={{display:"inline-block",padding:"3px 10px",borderRadius:4,fontSize:11,fontWeight:700,background:`${C.blueLight}22`,color:C.blueLight,marginBottom:12}}>{post.date}</div><h3 style={{...hd,fontSize:21,marginBottom:8}}>{post.title}</h3><p style={{fontSize:13,color:C.textMuted,lineHeight:1.6}}>{post.excerpt}</p><div style={{marginTop:14,color:C.blueLight,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>Lire {I.chev()}</div></div></div>;}

function BeltBadge({belt}){const c=BELT_COLORS[belt]||"#888";const dark=belt==="Noire";return<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 10px",borderRadius:4,fontSize:11,fontWeight:700,background:c+"22",color:dark?"#fff":c,border:`1px solid ${c}44`}}><span style={{width:8,height:8,borderRadius:"50%",background:c,border:dark?"1px solid #555":"none"}}/>{belt}</span>;}

// ─── NAV / FOOTER ────
function Navbar({page,setPage}){const[sc,sSc]=useState(false);const[mob,sMob]=useState(false);useEffect(()=>{const h=()=>sSc(window.scrollY>40);window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h)},[]);const links=[{id:"accueil",l:"Accueil"},{id:"offres",l:"Offres"},{id:"lieux",l:"Lieux & Horaires"},{id:"blog",l:"Blog"},{id:"palmares",l:"Palmarès"}];const go=p=>{setPage(p);sMob(false);window.scrollTo(0,0)};return<nav style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,background:sc?`${C.bg}ee`:`${C.bg}88`,backdropFilter:"blur(14px)",borderBottom:`1px solid ${sc?C.border:"transparent"}`,transition:"all .4s"}}><div style={{maxWidth:1140,margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:68}}><div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>go("accueil")}><img src={LOGO_SRC} alt="" style={{width:40,height:40,borderRadius:"50%"}}/><span style={{...hd,fontSize:22,letterSpacing:4}}>AGUIA JJB</span></div><div style={{display:"flex",gap:2,alignItems:"center"}} className="hm">{links.map(l=><button key={l.id} onClick={()=>go(l.id)} style={{background:page===l.id?`${C.redLight}20`:"transparent",color:page===l.id?C.redLight:C.textMuted,border:"none",padding:"7px 14px",borderRadius:5,cursor:"pointer",fontFamily:"'Barlow',sans-serif",fontSize:13,fontWeight:500,transition:"all .3s"}} onMouseEnter={e=>{if(page!==l.id)e.target.style.color=C.text}} onMouseLeave={e=>{if(page!==l.id)e.target.style.color=C.textMuted}}>{l.l}</button>)}</div><button onClick={()=>sMob(!mob)} className="sm" style={{display:"none",background:"none",border:"none",color:C.text,cursor:"pointer",padding:6}}><svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">{mob?<path d="M18 6L6 18M6 6l12 12"/>:<path d="M3 12h18M3 6h18M3 18h18"/>}</svg></button></div>{mob&&<div style={{background:`${C.bg}f8`,backdropFilter:"blur(20px)",padding:"12px 20px",borderTop:`1px solid ${C.border}`}}>{links.map(l=><button key={l.id} onClick={()=>go(l.id)} style={{display:"block",width:"100%",textAlign:"left",background:page===l.id?`${C.redLight}18`:"transparent",color:page===l.id?C.redLight:C.text,border:"none",padding:"12px 14px",borderRadius:6,cursor:"pointer",fontFamily:"'Barlow',sans-serif",fontSize:15,fontWeight:500}}>{l.l}</button>)}</div>}</nav>;}

function Footer({setPage,socials}){return<footer style={{borderTop:`1px solid ${C.border}`,padding:"36px 20px",marginTop:20}}><div style={{maxWidth:1100,margin:"0 auto",display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:16}}><div style={{display:"flex",alignItems:"center",gap:10}}><img src={LOGO_SRC} alt="" style={{width:32,height:32,borderRadius:"50%"}}/><span style={{...hd,fontSize:18,letterSpacing:3}}>AGUIA JJB</span></div><SocialLinks socials={socials}/><div style={{display:"flex",gap:16,alignItems:"center",fontSize:11,color:C.textMuted}}><span style={{cursor:"pointer"}} onClick={()=>{setPage("legal");window.scrollTo(0,0)}}>Mentions légales</span><span>© 2025 Aguia JJB</span></div></div></footer>;}

// ═══════ PUBLIC PAGES ═══════
function LandingPage({texts:t,locations:locs,blog,config:cfg,setPage:go}){return<div style={{minHeight:"100vh"}}><section style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0,backgroundImage:`url(${cfg.bannerImage})`,backgroundSize:"cover",backgroundPosition:"center",filter:"brightness(0.25) contrast(1.1)"}}/><div style={{position:"absolute",inset:0,background:`linear-gradient(180deg,${C.bg}44 0%,${C.bg}bb 60%,${C.bg} 100%)`}}/><div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse 70% 50% at 50% 30%,${C.red}18,transparent 70%)`}}/><div style={{position:"relative",zIndex:1,padding:"0 24px"}} className="an1"><img src={LOGO_SRC} alt="" style={{width:130,height:130,borderRadius:"50%",marginBottom:28,boxShadow:`0 0 50px ${C.red}40`}}/><h1 style={{...hd,fontSize:"clamp(3.5rem,10vw,7.5rem)",letterSpacing:10,lineHeight:.95,marginBottom:12}}>{t.heroTitle}</h1><p style={{fontSize:"clamp(.95rem,2.2vw,1.2rem)",color:C.textMuted,fontWeight:300,letterSpacing:3,marginBottom:44}}>{t.heroSubtitle}</p><div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}><button onClick={()=>{go("offres");window.scrollTo(0,0)}} style={{...btn(C.redLight,"#fff"),padding:"14px 36px",fontSize:15}}>Rejoindre le club</button><button onClick={()=>{go("lieux");window.scrollTo(0,0)}} style={{...btn("transparent",C.text,`1px solid ${C.borderLight}`),padding:"14px 36px",fontSize:15}}>Voir les horaires</button></div><div style={{marginTop:28}}><SocialLinks socials={cfg.socials}/></div></div></section>
<section style={{maxWidth:1100,margin:"0 auto",padding:"70px 24px"}}>{tag(C.redLight,"À propos")}<h2 style={{...hd,fontSize:"clamp(2rem,5vw,3rem)",letterSpacing:2,marginBottom:16}}>{t.aboutTitle}</h2><p style={{color:C.textMuted,lineHeight:1.8,fontSize:15,maxWidth:780,marginBottom:40}}>{t.aboutText}</p><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16}}>{[{icon:"🥋",t:"Discipline",d:"Rigueur et engagement",col:C.redLight},{icon:"🤝",t:"Respect",d:"Valeur fondamentale",col:C.blueLight},{icon:"🔥",t:"Dépassement",d:"Se surpasser",col:C.gold},{icon:"👥",t:"Communauté",d:"Solidarité et partage",col:C.redLight}].map((v,i)=><div key={i} style={{...crd,textAlign:"center",borderTop:`2px solid ${v.col}`}}><div style={{fontSize:32,marginBottom:10}}>{v.icon}</div><div style={{...hd,fontSize:18,marginBottom:4}}>{v.t}</div><div style={{fontSize:12,color:C.textMuted}}>{v.d}</div></div>)}</div></section>
<div style={{height:1,background:`linear-gradient(90deg,transparent,${C.border},transparent)`}}/>
<section style={{maxWidth:1100,margin:"0 auto",padding:"70px 24px"}}>{tag(C.gold,"Entraînements")}<h2 style={{...hd,fontSize:"clamp(2rem,5vw,3rem)",letterSpacing:2,marginBottom:28}}>Où s'entraîner</h2><div style={{marginBottom:24}}><MapEmbed locations={locs}/></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>{locs.map(l=><LocCard key={l.id} loc={l} compact/>)}</div></section>
<div style={{height:1,background:`linear-gradient(90deg,transparent,${C.border},transparent)`}}/>
<section style={{maxWidth:1100,margin:"0 auto",padding:"70px 24px"}}>{tag(C.blueLight,"Actualités")}<h2 style={{...hd,fontSize:"clamp(2rem,5vw,3rem)",letterSpacing:2,marginBottom:24}}>Dernières nouvelles</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>{blog.slice(0,3).map(p=><BlogCard key={p.id} post={p} onClick={()=>{go("blog");window.scrollTo(0,0)}}/>)}</div></section>
<div style={{height:1,background:`linear-gradient(90deg,transparent,${C.border},transparent)`}}/>
<section style={{maxWidth:1100,margin:"0 auto",padding:"70px 24px",textAlign:"center"}}><div style={{...crd,padding:"48px 36px",borderColor:C.redLight,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${C.red}12,transparent 50%)`}}/><div style={{position:"relative"}}><h2 style={{...hd,fontSize:"clamp(2rem,5vw,2.8rem)",letterSpacing:2,marginBottom:10}}>{t.ctaTitle}</h2><p style={{color:C.textMuted,fontSize:15,marginBottom:28,maxWidth:460,margin:"0 auto 28px"}}>{t.ctaText}</p><a href={cfg.helloassoUrl} target="_blank" rel="noopener noreferrer" style={{...btn(C.redLight,"#fff"),textDecoration:"none",padding:"14px 36px"}}>S'inscrire {I.ext()}</a></div></div></section>
<Footer setPage={go} socials={cfg.socials}/></div>;}

function OffresPage({texts:t,config:cfg,setPage:go}){return<div style={{minHeight:"100vh",paddingTop:80}}><section style={{maxWidth:1100,margin:"0 auto",padding:"60px 24px"}}>{tag(C.redLight,"Inscription")}<h1 style={{...hd,fontSize:"clamp(2rem,5vw,3.2rem)",letterSpacing:2,marginBottom:8}}>{t.offresTitle}</h1><p style={{color:C.textMuted,lineHeight:1.8,fontSize:15,maxWidth:680,marginBottom:36}}>{t.offresIntro}</p><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20,marginBottom:32}}><div style={{...crd,borderTop:`3px solid ${C.gold}`}}><div style={{display:"inline-block",padding:"3px 10px",borderRadius:4,fontSize:11,fontWeight:700,background:`${C.gold}22`,color:C.gold,marginBottom:14}}>GRATUIT</div><h3 style={{...hd,fontSize:26,marginBottom:8}}>{t.offresEssaiTitle}</h3><p style={{color:C.textMuted,lineHeight:1.6,fontSize:14}}>{t.offresEssaiText}</p></div><div style={{...crd,borderTop:`3px solid ${C.redLight}`,position:"relative"}}><div style={{position:"absolute",top:12,right:12,background:C.redLight,color:"#fff",padding:"3px 12px",borderRadius:4,fontSize:10,fontWeight:700}}>POPULAIRE</div><div style={{display:"inline-block",padding:"3px 10px",borderRadius:4,fontSize:11,fontWeight:700,background:`${C.redLight}22`,color:C.redLight,marginBottom:14}}>SAISON 2025-2026</div><h3 style={{...hd,fontSize:26,marginBottom:8}}>{t.offresAdhesionTitle}</h3><p style={{color:C.textMuted,lineHeight:1.6,fontSize:14,marginBottom:20}}>{t.offresAdhesionText}</p><a href={cfg.helloassoUrl} target="_blank" rel="noopener noreferrer" style={{...btn(C.redLight,"#fff"),textDecoration:"none",width:"100%",justifyContent:"center"}}>S'inscrire {I.ext()}</a></div></div><div style={{...crd,borderLeft:`3px solid ${C.gold}`}}><div style={{display:"flex",gap:14}}><span style={{fontSize:24}}>⚠️</span><div><h3 style={{...hd,fontSize:20,color:C.gold,marginBottom:6}}>Important</h3><p style={{color:C.textMuted,lineHeight:1.7,fontSize:14}}>{t.offresImportant}</p></div></div></div></section><Footer setPage={go} socials={cfg.socials}/></div>;}

function LieuxPage({texts:t,locations:locs,config:cfg,setPage:go}){return<div style={{minHeight:"100vh",paddingTop:80}}><section style={{maxWidth:1100,margin:"0 auto",padding:"60px 24px"}}>{tag(C.gold,"Planning")}<h1 style={{...hd,fontSize:"clamp(2rem,5vw,3.2rem)",letterSpacing:2,marginBottom:8}}>{t.lieuxTitle}</h1><p style={{color:C.textMuted,fontSize:14,marginBottom:28}}>{t.lieuxSubtitle}</p><div style={{marginBottom:28}}><MapEmbed locations={locs} height={380}/></div><div style={{display:"grid",gap:20}}>{locs.map(loc=><LocCard key={loc.id} loc={loc}/>)}</div></section><Footer setPage={go} socials={cfg.socials}/></div>;}

function BlogPage({texts:t,blog,config:cfg,setPage:go}){const[sel,setSel]=useState(null);if(sel){const p=blog.find(b=>b.id===sel);return<div style={{minHeight:"100vh",paddingTop:80}}><section style={{maxWidth:800,margin:"0 auto",padding:"60px 24px"}}><button onClick={()=>setSel(null)} style={{...btn("transparent",C.textMuted,`1px solid ${C.border}`),padding:"8px 16px",fontSize:13,marginBottom:24}}>{I.chev("l")} Retour</button><div style={{display:"inline-block",padding:"3px 10px",borderRadius:4,fontSize:11,fontWeight:700,background:`${C.blueLight}22`,color:C.blueLight,marginBottom:14}}>{p.date}</div><h1 style={{...hd,fontSize:"clamp(2rem,5vw,3rem)",marginBottom:20}}>{p.title}</h1>{p.image&&<img src={p.image} alt="" style={{width:"100%",borderRadius:10,marginBottom:24,maxHeight:400,objectFit:"cover"}}/>}<div style={{color:C.textMuted,lineHeight:1.9,fontSize:15,whiteSpace:"pre-line"}}>{p.content}</div></section><Footer setPage={go} socials={cfg.socials}/></div>;}return<div style={{minHeight:"100vh",paddingTop:80}}><section style={{maxWidth:1100,margin:"0 auto",padding:"60px 24px"}}>{tag(C.blueLight,"Actualités")}<h1 style={{...hd,fontSize:"clamp(2rem,5vw,3.2rem)",letterSpacing:2,marginBottom:8}}>{t.blogTitle}</h1><p style={{color:C.textMuted,fontSize:14,marginBottom:28}}>{t.blogSubtitle}</p><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>{blog.map(p=><BlogCard key={p.id} post={p} onClick={()=>setSel(p.id)}/>)}</div></section><Footer setPage={go} socials={cfg.socials}/></div>;}

function PalmaresPage({texts:t,palmares,config:cfg,setPage:go}){
  const valid=palmares.filter(r=>r.athlete&&r.athlete!=="—");
  return<div style={{minHeight:"100vh",paddingTop:80}}><section style={{maxWidth:1100,margin:"0 auto",padding:"60px 24px"}}>{tag(C.gold,"Résultats")}<h1 style={{...hd,fontSize:"clamp(2rem,5vw,3.2rem)",letterSpacing:2,marginBottom:8}}>{t.palmaresTitle}</h1><p style={{color:C.textMuted,fontSize:14,marginBottom:28}}>{t.palmaresIntro}</p>
    {valid.length>0?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
      {valid.map(r=><div key={r.id} style={{...crd,display:"flex",gap:16,alignItems:"center"}}>
        {r.photo&&<img src={r.photo} alt="" style={{width:60,height:60,borderRadius:"50%",objectFit:"cover",border:`2px solid ${BELT_COLORS[r.belt]||C.border}`}}/>}
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><span style={{...hd,fontSize:18}}>{r.athlete}</span><BeltBadge belt={r.belt||"Blanche"}/></div>
          <div style={{fontSize:13,color:C.textMuted}}>{r.competition}</div>
          <div style={{display:"flex",gap:12,marginTop:4}}><span style={{fontSize:13,fontWeight:600,color:C.gold}}>{r.result}</span><span style={{fontSize:12,color:C.textMuted}}>{r.date}</span></div>
        </div>
      </div>)}
    </div>:<p style={{textAlign:"center",padding:40,color:C.textMuted}}>Le palmarès sera bientôt mis à jour.</p>}
  </section><Footer setPage={go} socials={cfg.socials}/></div>;
}

function LegalPage({texts:t,config:cfg,setPage:go}){return<div style={{minHeight:"100vh",paddingTop:80}}><section style={{maxWidth:800,margin:"0 auto",padding:"60px 24px"}}>{tag(C.textMuted,"Juridique")}<h1 style={{...hd,fontSize:"clamp(2rem,5vw,3.2rem)",letterSpacing:2,marginBottom:24}}>{t.legalTitle}</h1><div style={{...crd,padding:32}}><div style={{color:C.textMuted,lineHeight:1.9,fontSize:14,whiteSpace:"pre-line"}}>{t.legalContent}</div></div></section><Footer setPage={go} socials={cfg.socials}/></div>;}

// ═══════ AI MODULE ═══════
const AI_PRESETS = [
  {l:"📰 Article de blog",p:"Rédige un article de blog pour le club Aguia JJB sur "},
  {l:"🏆 Résultat compétition",p:"Rédige un texte annonçant les résultats de notre club à la compétition "},
  {l:"📢 Annonce événement",p:"Rédige une annonce pour l'événement suivant du club : "},
  {l:"👋 Texte de bienvenue",p:"Rédige un texte de bienvenue pour les nouveaux membres du club de JJB "},
  {l:"🥋 Présentation athlète",p:"Rédige une présentation pour l'athlète suivant : "},
  {l:"📱 Post réseaux sociaux",p:"Rédige un post Instagram/Facebook court et percutant pour : "},
];

function AIModule(){
  const[prompt,setPrompt]=useState("");
  const[result,setResult]=useState("");
  const[status,setStatus]=useState("idle"); // idle | loading | ok | error
  const[error,setError]=useState("");
  const[copied,setCopied]=useState(false);
  const[context,setContext]=useState("");
  const resultRef=useRef(null);

  const generate=async()=>{
    if(!prompt.trim()||prompt.trim().length<3)return setError("Le prompt doit contenir au moins 3 caractères");
    setStatus("loading");setError("");setResult("");
    try{
      const res=await fetch("/api/generate",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({prompt:prompt.trim(),context:context.trim()}),
      });
      const data=await res.json();
      if(!res.ok){setStatus("error");setError(data.error||"Erreur serveur");return;}
      setResult(data.text||"");
      setStatus("ok");
      setTimeout(()=>resultRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),100);
    }catch(e){
      setStatus("error");setError("Erreur réseau : "+e.message);
    }
  };

  const copyText=()=>{
    navigator.clipboard.writeText(result).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
  };

  const S={
    grid:{display:"grid",gap:20},
    presetGrid:{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16},
    presetBtn:(active)=>({...btn(active?`${C.blueLight}30`:"transparent",active?C.blueLight:C.textMuted,`1px solid ${active?C.blueLight:C.border}`),padding:"8px 14px",fontSize:12,borderRadius:20}),
    textarea:{...inp,minHeight:120,resize:"vertical",fontSize:14,lineHeight:1.6},
    contextInput:{...inp,fontSize:13},
    resultBox:{...crd,padding:0,overflow:"hidden",borderColor:status==="ok"?C.green:C.border},
    resultHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",background:C.cardAlt,borderBottom:`1px solid ${C.border}`},
    resultText:{padding:20,fontSize:14,lineHeight:1.8,color:C.text,whiteSpace:"pre-wrap",minHeight:80},
    statusBar:(type)=>({padding:"10px 16px",borderRadius:8,fontSize:13,display:"flex",alignItems:"center",gap:8,marginBottom:16,background:type==="error"?`${C.red}15`:type==="ok"?`${C.green}15`:`${C.blueMid}15`,border:`1px solid ${type==="error"?C.redLight:type==="ok"?C.green:C.blueLight}`,color:type==="error"?C.redLight:type==="ok"?C.green:C.blueLight}),
  };

  return<div style={S.grid}>
    {/* INFO CARD */}
    <div style={{...crd,borderLeft:`3px solid ${C.blueLight}`,padding:18}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
        <span style={{fontSize:24}}>🤖</span>
        <div><h3 style={{...hd,fontSize:20,color:C.blueLight}}>Assistant IA</h3><p style={{fontSize:12,color:C.textMuted}}>Génération de textes via IA (Groq) — gratuit</p></div>
      </div>
      <p style={{fontSize:13,color:C.textMuted,lineHeight:1.6}}>Saisissez un prompt ou utilisez un modèle ci-dessous. Le texte généré est modifiable et peut être copié pour l'utiliser dans les autres sections du panneau admin.</p>
    </div>

    {/* PRESETS */}
    <div style={crd}>
      <label style={{...lbl,marginBottom:12}}>Modèles rapides</label>
      <div style={S.presetGrid}>
        {AI_PRESETS.map((p,i)=><button key={i} type="button" onClick={()=>setPrompt(p.p)} style={S.presetBtn(prompt.startsWith(p.p))}>{p.l}</button>)}
      </div>

      <label style={{...lbl,marginBottom:8}}>Votre prompt</label>
      <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Ex: Rédige un article de blog sur notre stage d'été 2025 avec les détails suivants..." style={S.textarea}/>

      <div style={{marginTop:12}}>
        <label style={{...lbl,marginBottom:8}}>Contexte supplémentaire (optionnel)</label>
        <input value={context} onChange={e=>setContext(e.target.value)} placeholder="Ex: Le stage a lieu le 15 juillet, ouvert à tous les niveaux..." style={S.contextInput}/>
      </div>

      <div style={{display:"flex",gap:10,marginTop:16,alignItems:"center"}}>
        <button type="button" onClick={generate} disabled={status==="loading"||!prompt.trim()} style={{...btn(status==="loading"?C.border:C.redLight,"#fff"),padding:"12px 28px",opacity:status==="loading"||!prompt.trim()?.6:1}}>
          {status==="loading"?<><div style={{width:14,height:14,border:"2px solid #888",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/> Génération...</>:<>{I.check()} Générer le texte</>}
        </button>
        {prompt&&<button type="button" onClick={()=>{setPrompt("");setContext("");setResult("");setStatus("idle")}} style={{...btn("transparent",C.textMuted,`1px solid ${C.border}`),padding:"10px 18px",fontSize:13}}>Effacer</button>}
      </div>
    </div>

    {/* STATUS */}
    {status==="error"&&<div style={S.statusBar("error")}>{I.warn()} {error}</div>}
    {status==="ok"&&!result&&<div style={S.statusBar("ok")}>{I.check()} Génération terminée (réponse vide)</div>}

    {/* RESULT */}
    {result&&<div ref={resultRef} style={S.resultBox}>
      <div style={S.resultHeader}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:C.green}}>{I.check()}</span>
          <span style={{fontSize:13,fontWeight:600,color:C.text}}>Texte généré</span>
          <span style={{fontSize:11,color:C.textMuted}}>({result.length} car.)</span>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button type="button" onClick={copyText} style={{...btn(copied?C.green:"transparent",copied?"#fff":C.textMuted,copied?"":`1px solid ${C.border}`),padding:"6px 12px",fontSize:11}}>
            {copied?"✓ Copié":"Copier"}
          </button>
        </div>
      </div>
      <textarea value={result} onChange={e=>setResult(e.target.value)} style={{...S.resultText,width:"100%",border:"none",background:"transparent",fontFamily:"'Barlow',sans-serif",outline:"none",resize:"vertical",minHeight:150}}/>
    </div>}

    {/* TIPS */}
    <div style={{fontSize:12,color:C.textMuted,background:C.cardAlt,padding:14,borderRadius:8,border:`1px solid ${C.border}`,lineHeight:1.7}}>
      💡 <strong>Astuce :</strong> Après génération, modifiez le texte dans la zone ci-dessus puis copiez-le. Collez-le ensuite dans l'onglet Textes, Blog ou Palmarès selon votre besoin.
    </div>
  </div>;
}

// ═══════ ADMIN ═══════
function AdminPage({data,setData,onSave,saveState}){
  const[auth,setAuth]=useState(false);const[code,setCode]=useState("");const[err,setErr]=useState("");const[tab,setTab]=useState("texts");
  const{texts,locations,blog,palmares,config}=data;
  const set=(key,val)=>setData(d=>({...d,[key]:val}));

  if(!auth)return<div style={{minHeight:"100vh",paddingTop:80}}><section style={{maxWidth:420,margin:"0 auto",padding:"80px 24px",textAlign:"center"}}><div style={{...crd,padding:40}}><div style={{margin:"0 auto 18px",width:60,height:60,borderRadius:"50%",background:`${C.red}20`,display:"flex",alignItems:"center",justifyContent:"center",color:C.redLight}}>{I.lock()}</div><h2 style={{...hd,fontSize:28,letterSpacing:2,marginBottom:8}}>Panneau Admin</h2><p style={{color:C.textMuted,fontSize:13,marginBottom:24}}>Entrez le code administrateur</p><input type="password" value={code} onChange={e=>setCode(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){code===ADMIN_CODE?setAuth(true):setErr("Code incorrect")}}} placeholder="Code admin" style={{...inp,textAlign:"center",marginBottom:14,fontSize:16}}/>{err&&<p style={{color:C.redLight,fontSize:13,marginBottom:12}}>{err}</p>}<button type="button" onClick={()=>code===ADMIN_CODE?setAuth(true):setErr("Code incorrect")} style={{...btn(C.redLight,"#fff"),width:"100%",justifyContent:"center",padding:"14px 28px"}}>Connexion</button></div></section></div>;

  const tabs=[{id:"texts",l:"📝 Textes",desc:"Modifier les textes du site"},{id:"locations",l:"📍 Lieux",desc:"Gérer les lieux d'entraînement"},{id:"blog",l:"📰 Blog",desc:"Gérer les articles"},{id:"palmares",l:"🏆 Palmarès",desc:"Résultats compétitions"},{id:"config",l:"⚙️ Config",desc:"Réglages généraux"},{id:"ai",l:"🤖 IA",desc:"Générer des textes avec l'intelligence artificielle"}];

  const tGroups=[{title:"🏠 Page Accueil",keys:["heroTitle","heroSubtitle","aboutTitle","aboutText","ctaTitle","ctaText"]},{title:"📋 Page Offres",keys:["offresTitle","offresIntro","offresEssaiTitle","offresEssaiText","offresAdhesionTitle","offresAdhesionText","offresImportant"]},{title:"📍 Page Lieux",keys:["lieuxTitle","lieuxSubtitle"]},{title:"📰 Page Blog",keys:["blogTitle","blogSubtitle"]},{title:"🏆 Page Palmarès",keys:["palmaresTitle","palmaresIntro"]},{title:"⚖️ Mentions Légales",keys:["legalTitle","legalContent"]}];
  const keyLabels={heroTitle:"Titre principal",heroSubtitle:"Sous-titre",aboutTitle:"Titre section",aboutText:"Description",ctaTitle:"Accroche",ctaText:"Description",offresTitle:"Titre page",offresIntro:"Introduction",offresEssaiTitle:"Titre essai",offresEssaiText:"Description essai",offresAdhesionTitle:"Titre adhésion",offresAdhesionText:"Description adhésion",offresImportant:"Note importante",lieuxTitle:"Titre",lieuxSubtitle:"Sous-titre",blogTitle:"Titre",blogSubtitle:"Sous-titre",palmaresTitle:"Titre",palmaresIntro:"Introduction",legalTitle:"Titre",legalContent:"Contenu complet"};
  const socTypes=[{v:"facebook",l:"Facebook"},{v:"instagram",l:"Instagram"},{v:"youtube",l:"YouTube"},{v:"tiktok",l:"TikTok"},{v:"other",l:"Autre"}];

  // Status bar
  const StatusBar=()=>{
    const isSaving=saveState.status==="saving";
    const isOk=saveState.status==="ok";
    const isErr=saveState.status==="error";
    return<div style={{position:"sticky",top:68,zIndex:100,padding:"12px 20px",marginBottom:24,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",background:isErr?`${C.red}15`:isOk?`${C.green}15`:C.cardAlt,border:`1px solid ${isErr?C.redLight:isOk?C.green:C.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {isSaving&&<div style={{width:16,height:16,border:"2px solid #888",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>}
        {isOk&&<span style={{color:C.green}}>{I.check()}</span>}
        {isErr&&<span style={{color:C.redLight}}>{I.warn()}</span>}
        <span style={{fontSize:13,color:isErr?C.redLight:isOk?C.green:C.textMuted}}>
          {isSaving?"Sauvegarde en cours...":isOk?"Sauvegardé avec succès !":isErr?`Erreur : ${saveState.error}`:"Prêt"}
        </span>
      </div>
      <button type="button" onClick={onSave} disabled={isSaving} style={{...btn(isSaving?"#333":C.redLight,"#fff"),padding:"10px 24px",opacity:isSaving?.5:1}}>
        {I.save()} {isSaving?"...":"Sauvegarder"}
      </button>
    </div>;
  };

  return<div style={{minHeight:"100vh",paddingTop:80}}><section style={{maxWidth:1100,margin:"0 auto",padding:"20px 24px 60px"}}>
    <div style={{marginBottom:20}}><h1 style={{...hd,fontSize:32,letterSpacing:2}}>Panneau d'administration</h1><p style={{color:C.textMuted,fontSize:13}}>Toute modification sauvegardée sera visible par les visiteurs</p></div>

    <StatusBar/>

    {/* TABS */}
    <div style={{display:"flex",gap:6,marginBottom:28,overflowX:"auto",paddingBottom:4}}>
      {tabs.map(t=><button key={t.id} type="button" onClick={()=>setTab(t.id)} style={{...btn(tab===t.id?C.redLight:"transparent",tab===t.id?"#fff":C.textMuted,tab===t.id?"":"1px solid "+C.border),padding:"10px 20px",fontSize:13,whiteSpace:"nowrap",borderRadius:8}}>
        {t.l}
      </button>)}
    </div>
    <p style={{color:C.textMuted,fontSize:12,marginBottom:20,marginTop:-16}}>{tabs.find(t=>t.id===tab)?.desc}</p>

    {/* TEXTS TAB */}
    {tab==="texts"&&<div style={{display:"grid",gap:20}}>
      {tGroups.map(g=><div key={g.title} style={{...crd,borderLeft:`3px solid ${C.gold}`}}>
        <h3 style={{...hd,fontSize:20,color:C.gold,marginBottom:16}}>{g.title}</h3>
        <div style={{display:"grid",gap:12}}>
          {g.keys.map(k=><div key={k}>
            <label style={lbl}>{keyLabels[k]||k}</label>
            {(texts[k]||"").length>80
              ?<textarea value={texts[k]||""} onChange={e=>set("texts",{...texts,[k]:e.target.value})} style={{...inp,minHeight:90,resize:"vertical"}}/>
              :<input value={texts[k]||""} onChange={e=>set("texts",{...texts,[k]:e.target.value})} style={inp}/>}
          </div>)}
        </div>
      </div>)}
    </div>}

    {/* LOCATIONS TAB */}
    {tab==="locations"&&<div style={{display:"grid",gap:20}}>
      {locations.map((loc,li)=><div key={loc.id} style={{...crd,borderLeft:`3px solid ${loc.color||C.blueLight}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
          <h3 style={{...hd,fontSize:20}}>{I.pin(loc.color)} Lieu {li+1}</h3>
          <button type="button" onClick={()=>set("locations",locations.filter(l=>l.id!==loc.id))} style={{...btn(`${C.red}15`,C.redLight),padding:"6px 14px",fontSize:12,border:"none"}}>{I.trash()} Supprimer</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div><label style={lbl}>Nom</label><input value={loc.name} onChange={e=>set("locations",locations.map(l=>l.id===loc.id?{...l,name:e.target.value}:l))} style={inp}/></div>
          <div><label style={lbl}>Ville</label><input value={loc.city} onChange={e=>set("locations",locations.map(l=>l.id===loc.id?{...l,city:e.target.value}:l))} style={inp}/></div>
        </div>
        <div style={{marginBottom:12}}><label style={lbl}>Adresse</label><input value={loc.address} onChange={e=>set("locations",locations.map(l=>l.id===loc.id?{...l,address:e.target.value}:l))} style={inp}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div><label style={lbl}>Latitude</label><input type="number" step="0.0001" value={loc.lat} onChange={e=>set("locations",locations.map(l=>l.id===loc.id?{...l,lat:parseFloat(e.target.value)||0}:l))} style={inp}/></div>
          <div><label style={lbl}>Longitude</label><input type="number" step="0.0001" value={loc.lng} onChange={e=>set("locations",locations.map(l=>l.id===loc.id?{...l,lng:parseFloat(e.target.value)||0}:l))} style={inp}/></div>
        </div>
        <label style={lbl}>Horaires</label>
        {loc.schedules.map((sc,si)=><div key={si} style={{display:"flex",gap:8,marginBottom:6}}>
          <input value={sc.day} placeholder="Jour" onChange={e=>{const ns=[...loc.schedules];ns[si]={...ns[si],day:e.target.value};set("locations",locations.map(l=>l.id===loc.id?{...l,schedules:ns}:l));}} style={{...inp,flex:1}}/>
          <input value={sc.time} placeholder="Horaire" onChange={e=>{const ns=[...loc.schedules];ns[si]={...ns[si],time:e.target.value};set("locations",locations.map(l=>l.id===loc.id?{...l,schedules:ns}:l));}} style={{...inp,flex:1}}/>
          <button type="button" onClick={()=>{set("locations",locations.map(l=>l.id===loc.id?{...l,schedules:l.schedules.filter((_,i)=>i!==si)}:l));}} style={{background:"none",border:"none",color:C.redLight,cursor:"pointer"}}>{I.trash()}</button>
        </div>)}
        <button type="button" onClick={()=>{set("locations",locations.map(l=>l.id===loc.id?{...l,schedules:[...l.schedules,{day:"",time:""}]}:l));}} style={{...btn("transparent",C.textMuted,`1px solid ${C.border}`),padding:"6px 14px",fontSize:12,marginTop:4}}>{I.plus()} Horaire</button>
      </div>)}
      <button type="button" onClick={()=>set("locations",[...locations,{id:Date.now().toString(),name:"",city:"",address:"",lat:43.12,lng:5.94,schedules:[{day:"",time:""}],color:C.blueLight}])} style={{...btn("transparent",C.text,`1px solid ${C.border}`),justifyContent:"center"}}>{I.plus()} Ajouter un lieu</button>
    </div>}

    {/* BLOG TAB */}
    {tab==="blog"&&<div style={{display:"grid",gap:20}}>
      {blog.map((post,pi)=><div key={post.id} style={{...crd,borderLeft:`3px solid ${C.blueLight}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
          <h3 style={{...hd,fontSize:20}}>📰 Article {pi+1}</h3>
          <button type="button" onClick={()=>set("blog",blog.filter(b=>b.id!==post.id))} style={{...btn(`${C.red}15`,C.redLight),padding:"6px 14px",fontSize:12,border:"none"}}>{I.trash()} Supprimer</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={lbl}>Titre</label><input value={post.title} onChange={e=>set("blog",blog.map(b=>b.id===post.id?{...b,title:e.target.value}:b))} style={inp}/></div>
          <div><label style={lbl}>Date</label><input type="date" value={post.date} onChange={e=>set("blog",blog.map(b=>b.id===post.id?{...b,date:e.target.value}:b))} style={inp}/></div>
        </div>
        <div style={{marginBottom:10}}><ImgUpload value={post.image} label="Image de couverture" onChange={v=>set("blog",blog.map(b=>b.id===post.id?{...b,image:v}:b))}/></div>
        <div style={{marginBottom:10}}><label style={lbl}>Extrait (aperçu)</label><input value={post.excerpt} onChange={e=>set("blog",blog.map(b=>b.id===post.id?{...b,excerpt:e.target.value}:b))} style={inp}/></div>
        <div><label style={lbl}>Contenu complet</label><textarea value={post.content} onChange={e=>set("blog",blog.map(b=>b.id===post.id?{...b,content:e.target.value}:b))} style={{...inp,minHeight:100,resize:"vertical"}}/></div>
      </div>)}
      <button type="button" onClick={()=>set("blog",[...blog,{id:Date.now().toString(),title:"",date:new Date().toISOString().split("T")[0],excerpt:"",content:"",image:""}])} style={{...btn("transparent",C.text,`1px solid ${C.border}`),justifyContent:"center"}}>{I.plus()} Nouvel article</button>
    </div>}

    {/* PALMARES TAB */}
    {tab==="palmares"&&<div style={{display:"grid",gap:16}}>
      <p style={{fontSize:13,color:C.textMuted,background:C.cardAlt,padding:12,borderRadius:8,border:`1px solid ${C.border}`}}>Chaque entrée comprend le nom de l'athlète, sa ceinture, une photo optionnelle, la compétition, le résultat et la date.</p>
      {palmares.map((row,ri)=><div key={row.id} style={{...crd,borderLeft:`3px solid ${BELT_COLORS[row.belt]||C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
          <h3 style={{...hd,fontSize:18}}>🥋 Entrée {ri+1}</h3>
          <button type="button" onClick={()=>set("palmares",palmares.filter(r=>r.id!==row.id))} style={{background:"none",border:"none",color:C.redLight,cursor:"pointer"}}>{I.trash()}</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={lbl}>Athlète</label><input value={row.athlete||""} onChange={e=>set("palmares",palmares.map(r=>r.id===row.id?{...r,athlete:e.target.value}:r))} style={inp}/></div>
          <div><label style={lbl}>Ceinture</label><select value={row.belt||"Blanche"} onChange={e=>set("palmares",palmares.map(r=>r.id===row.id?{...r,belt:e.target.value}:r))} style={{...inp,cursor:"pointer"}}>{BELTS.map(b=><option key={b} value={b}>{b}</option>)}</select></div>
        </div>
        <div style={{marginBottom:10}}><ImgUpload value={row.photo||""} label="Photo de l'athlète" aspect="square" onChange={v=>set("palmares",palmares.map(r=>r.id===row.id?{...r,photo:v}:r))}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <div><label style={lbl}>Compétition</label><input value={row.competition||""} onChange={e=>set("palmares",palmares.map(r=>r.id===row.id?{...r,competition:e.target.value}:r))} style={inp}/></div>
          <div><label style={lbl}>Résultat</label><input value={row.result||""} onChange={e=>set("palmares",palmares.map(r=>r.id===row.id?{...r,result:e.target.value}:r))} style={inp}/></div>
          <div><label style={lbl}>Date</label><input value={row.date||""} onChange={e=>set("palmares",palmares.map(r=>r.id===row.id?{...r,date:e.target.value}:r))} style={inp}/></div>
        </div>
      </div>)}
      <button type="button" onClick={()=>set("palmares",[...palmares,{id:Date.now().toString(),athlete:"",competition:"",result:"",date:"",belt:"Blanche",photo:""}])} style={{...btn("transparent",C.text,`1px solid ${C.border}`),justifyContent:"center"}}>{I.plus()} Ajouter un résultat</button>
    </div>}

    {/* CONFIG TAB */}
    {tab==="config"&&<div style={{display:"grid",gap:20}}>
      <div style={{...crd,borderLeft:`3px solid ${C.gold}`}}>
        <h3 style={{...hd,fontSize:20,color:C.gold,marginBottom:16}}>🖼️ Image bannière</h3>
        <ImgUpload value={config.bannerImage} label="Bannière du hero (page d'accueil)" aspect="banner" onChange={v=>set("config",{...config,bannerImage:v})}/>
      </div>
      <div style={{...crd,borderLeft:`3px solid ${C.blueLight}`}}>
        <h3 style={{...hd,fontSize:20,color:C.blueLight,marginBottom:16}}>🔗 Lien HelloAsso</h3>
        <label style={lbl}>URL d'inscription</label>
        <input value={config.helloassoUrl||""} onChange={e=>set("config",{...config,helloassoUrl:e.target.value})} style={inp} placeholder="https://www.helloasso.com/..."/>
      </div>
      <div style={{...crd,borderLeft:`3px solid ${C.redLight}`}}>
        <h3 style={{...hd,fontSize:20,color:C.redLight,marginBottom:16}}>📱 Réseaux sociaux</h3>
        {(config.socials||[]).map((soc,si)=><div key={soc.id} style={{display:"flex",gap:8,marginBottom:10,alignItems:"end",flexWrap:"wrap"}}>
          <div style={{flex:"0 0 120px"}}><label style={lbl}>Type</label><select value={soc.type} onChange={e=>{const ns=[...config.socials];ns[si]={...ns[si],type:e.target.value};set("config",{...config,socials:ns});}} style={{...inp,cursor:"pointer"}}>{socTypes.map(st=><option key={st.v} value={st.v}>{st.l}</option>)}</select></div>
          <div style={{flex:"1 1 100px"}}><label style={lbl}>Nom</label><input value={soc.name} onChange={e=>{const ns=[...config.socials];ns[si]={...ns[si],name:e.target.value};set("config",{...config,socials:ns});}} style={inp}/></div>
          <div style={{flex:"2 1 180px"}}><label style={lbl}>URL</label><input value={soc.url} onChange={e=>{const ns=[...config.socials];ns[si]={...ns[si],url:e.target.value};set("config",{...config,socials:ns});}} style={inp}/></div>
          <button type="button" onClick={()=>set("config",{...config,socials:config.socials.filter((_,i)=>i!==si)})} style={{background:"none",border:"none",color:C.redLight,cursor:"pointer",marginBottom:4}}>{I.trash()}</button>
        </div>)}
        <button type="button" onClick={()=>set("config",{...config,socials:[...(config.socials||[]),{id:Date.now().toString(),name:"",url:"",type:"other"}]})} style={{...btn("transparent",C.textMuted,`1px solid ${C.border}`),padding:"6px 14px",fontSize:12,marginTop:4}}>{I.plus()} Ajouter un réseau</button>
      </div>
    </div>}

    {/* AI TAB */}
    {tab==="ai"&&<AIModule/>}

  </section></div>;
}

// ═══════ APP ═══════
export default function App(){
  const[page,setPage]=useState("accueil");
  const[data,setData]=useState({texts:DEFAULT_TEXTS,locations:DEFAULT_LOCATIONS,blog:DEFAULT_BLOG,palmares:DEFAULT_PALMARES,config:DEFAULT_CONFIG});
  const[saveState,setSaveState]=useState({status:"idle",error:""});

  useEffect(()=>{const h=()=>{if(window.location.hash==="#admin")setPage("admin")};h();window.addEventListener("hashchange",h);return()=>window.removeEventListener("hashchange",h);},[]);

  // Load from Firebase
  useEffect(()=>{
    fbLoad().then(d=>{
      if(d){
        setData(prev=>({
          texts:{...prev.texts,...(d.texts||{})},
          locations:d.locations||prev.locations,
          blog:d.blog||prev.blog,
          palmares:d.palmares||prev.palmares,
          config:{...prev.config,...(d.config||{})},
        }));
      }
    });
  },[]);

  // Save to Firebase
  const handleSave=useCallback(async()=>{
    setSaveState({status:"saving",error:""});
    const result=await fbSave(data);
    if(result.ok){
      setSaveState({status:"ok",error:""});
      setTimeout(()=>setSaveState(s=>s.status==="ok"?{status:"idle",error:""}:s),4000);
    } else {
      setSaveState({status:"error",error:result.error||"Erreur inconnue"});
    }
  },[data]);

  const{texts,locations,blog,palmares,config}=data;

  return<div style={{minHeight:"100vh",background:C.bg}}>
    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}input[type=range]{-webkit-appearance:none;height:4px;background:${C.border};border-radius:2px;outline:none}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${C.redLight};cursor:pointer;border:2px solid ${C.card}}input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:${C.redLight};cursor:pointer;border:2px solid ${C.card}}`}</style>
    <Navbar page={page} setPage={setPage}/>
    {page==="accueil"&&<LandingPage texts={texts} locations={locations} blog={blog} config={config} setPage={setPage}/>}
    {page==="offres"&&<OffresPage texts={texts} config={config} setPage={setPage}/>}
    {page==="lieux"&&<LieuxPage texts={texts} locations={locations} config={config} setPage={setPage}/>}
    {page==="blog"&&<BlogPage texts={texts} blog={blog} config={config} setPage={setPage}/>}
    {page==="palmares"&&<PalmaresPage texts={texts} palmares={palmares} config={config} setPage={setPage}/>}
    {page==="legal"&&<LegalPage texts={texts} config={config} setPage={setPage}/>}
    {page==="admin"&&<AdminPage data={data} setData={setData} onSave={handleSave} saveState={saveState}/>}
    <ScrollTop/>
  </div>;
}
