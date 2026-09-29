/* 세특 근거 성찰 폼 — 활동지에 [성찰 기록] 버튼과 링크 패널을 추가 (공용, 4개 activity.html 동일) */
(function(){
  "use strict";
  var CFG=window.STEAM_REFLECT||{};
  var ITEMS=[
    {k:"preIndividual",  group:"활동 전", who:"개인"},
    {k:"preTeam",        group:"활동 전", who:"모둠 대표"},
    {k:"duringIndividual",group:"활동 중", who:"개인"},
    {k:"duringTeam",     group:"활동 중", who:"모둠 대표"},
    {k:"postIndividual", group:"활동 후", who:"개인"},
    {k:"postTeam",       group:"활동 후", who:"모둠 대표"}
  ];
  var active=ITEMS.filter(function(it){ return CFG[it.k]; });
  if(!active.length) return; // 링크가 하나도 없으면 아무것도 표시하지 않음

  var css=document.createElement("style");
  css.textContent=
    "#rf-btn{position:fixed;left:16px;bottom:16px;z-index:90;font-family:var(--f-body,system-ui,sans-serif);"+
    "font-size:13px;font-weight:600;padding:9px 14px;border-radius:999px;border:1px solid var(--line,#d7dde3);"+
    "background:var(--card,#fff);color:var(--ink,#1b2530);box-shadow:var(--shadow,0 2px 10px rgba(0,0,0,.12));cursor:pointer}"+
    "#rf-btn:hover{border-color:var(--focus,#2f6fb3)}"+
    "#rf-panel{position:fixed;left:16px;bottom:60px;z-index:91;display:none;width:280px;max-width:calc(100vw - 32px);"+
    "background:var(--card,#fff);border:1px solid var(--line,#d7dde3);border-radius:12px;padding:14px;"+
    "box-shadow:var(--shadow,0 8px 28px rgba(0,0,0,.18));font-family:var(--f-body,system-ui,sans-serif)}"+
    "#rf-panel.on{display:block}"+
    "#rf-panel h4{margin:0 0 8px;font-size:13.5px;color:var(--ink,#1b2530)}"+
    "#rf-panel .grp{font-family:var(--f-mono,monospace);font-size:10.5px;color:var(--ink-soft,#5a6673);margin:10px 0 4px}"+
    "#rf-panel .grp:first-of-type{margin-top:0}"+
    "#rf-panel a{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 8px;margin:2px 0;"+
    "border-radius:8px;text-decoration:none;color:var(--ink,#1b2530);font-size:13px;border:1px solid transparent}"+
    "#rf-panel a:hover{background:var(--paper,#f3f6f8);border-color:var(--line,#d7dde3)}"+
    "#rf-panel a span.tag{font-size:11px;color:var(--ink-soft,#5a6673)}"+
    "@media print{#rf-btn,#rf-panel{display:none!important}}";
  document.head.appendChild(css);

  var btn=document.createElement("button");
  btn.id="rf-btn"; btn.type="button"; btn.textContent="✎ 성찰 기록";
  document.body.appendChild(btn);

  var panel=document.createElement("div");
  panel.id="rf-panel";
  var html="<h4>세특 근거 성찰 폼</h4>";
  var lastGroup="";
  active.forEach(function(it){
    if(it.group!==lastGroup){ html+='<div class="grp">'+it.group+'</div>'; lastGroup=it.group; }
    html+='<a href="'+CFG[it.k]+'" target="_blank" rel="noopener"><span>'+it.who+'</span><span class="tag">열기 ↗</span></a>';
  });
  panel.innerHTML=html;
  document.body.appendChild(panel);

  btn.addEventListener("click",function(){ panel.classList.toggle("on"); });
  document.addEventListener("click",function(e){
    if(panel.classList.contains("on") && !panel.contains(e.target) && e.target!==btn) panel.classList.remove("on");
  });
})();
