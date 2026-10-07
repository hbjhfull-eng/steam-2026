/* 활동지 제출 모듈 (4개 activity.html 공용)
 * - 두 가지 제출: ① 내 경로 결과(모둠원 각자)  ② 모둠 통합본(모둠 대표 1명, 모둠 공유판까지 채운 것)
 * - 활동지 내용을 사람이 읽기 좋은 텍스트로 만들어 Apps Script 웹앱으로 전송 → 교사 구글 시트에 저장
 *   · 서버는 '모둠명' 단위로 한 행씩 저장(같은 이름으로 다시 제출하면 덮어씀)하므로,
 *     개인 제출은 모둠명 뒤에 " · A경로(이름)" 을 붙여 모둠원마다 따로 저장되게 함 → 서버 수정 불필요
 * - 설정: submit-config.js / 페이지의 <script data-topic data-store data-plot-prefix>
 */
(function(){
  "use strict";
  var CFG=window.STEAM_SUBMIT||{};
  var me=document.currentScript;
  if(!me||!CFG.endpoint) return;

  var TOPIC=me.getAttribute("data-topic")||document.title;
  var STORE=me.getAttribute("data-store")||"";
  var PLOT_PREFIX=me.getAttribute("data-plot-prefix")||"";
  var LS_DONE="steam-submitted:"+STORE, LS_FORM="steam-submit-form:"+STORE;

  function text(n){ return n? (n.textContent||"").replace(/\s+/g," ").trim() : ""; }
  function lsGet(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } }
  function lsSet(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }

  function val(el){
    if(el.type==="checkbox") return el.checked;
    if(el.type==="radio") return el.checked? el.value : "";
    if(el.isContentEditable) return (el.textContent||"").trim();
    return (el.value||"").trim();
  }

  // 질문 앞의 배지(Q / 번호 / 신호 등)를 읽기 좋게 정리 — 넘겨받은 복제본을 직접 수정함
  function qtext(node){
    var b=node.querySelector(".b"), pre="";
    if(b){
      var t=text(b); b.parentNode.removeChild(b);
      pre= t==="Q" ? "" : /^\d+$/.test(t) ? t+") " : "["+t+"] ";
    }
    return pre+text(node);
  }
  function headText(h){
    var c=h.cloneNode(true), t=c.querySelector(".tag"), pre="";
    if(t){ pre="["+text(t)+"] "; t.parentNode.removeChild(t); }
    return pre+text(c);
  }

  /* ---------- 경로·제출 종류에 따라 빼는 칸 ---------- */
  function pathOf(){ return window.steamPathSelected? window.steamPathSelected() : ""; }
  function pathLabel(){ var p=pathOf(); return p&&window.steamPathLabel? window.steamPathLabel(p) : ""; }
  function skipEl(el,mode){
    if(el.closest(".pathsel")) return true;
    if(window.steamPathHidden&&window.steamPathHidden(el)) return true;
    if(mode==="me"&&el.closest(".team-only")) return true;
    return false;
  }

  /* ---------- 활동지 → 텍스트 ---------- */
  function build(mode){
    mode=mode||"team";
    var out=[], seen={}, answers={}, keys={};
    Array.prototype.forEach.call(document.querySelectorAll("[data-field]"),function(el){
      if(skipEl(el,mode)) return;
      var k=el.getAttribute("data-field"); keys[k]=true;
      var v=val(el); if(v!==""&&v!==false) answers[k]=v;
    });
    var total=Object.keys(keys).length, filled=Object.keys(answers).length;
    var progress=total? Math.round(filled/total*100) : 0;
    if(pathOf()) answers["w-path"]=pathOf();
    seen["w-path"]=true;

    var who=document.querySelector(".who");
    if(who){
      out.push("■ 인적사항(작성자)");
      Array.prototype.forEach.call(who.querySelectorAll("[data-field]"),function(inp){
        var lab=inp.parentNode&&inp.parentNode.firstChild? inp.parentNode.firstChild.textContent.trim() : inp.getAttribute("data-field");
        out.push("· "+lab+": "+(val(inp)||"(미작성)")); seen[inp.getAttribute("data-field")]=true;
      });
      out.push("· 내 경로: "+(pathLabel()||"(미선택)"));
      out.push("· 제출 종류: "+(mode==="me"? "내 경로 결과(모둠원 개인)" : "모둠 통합본(대표)"));
    }

    Array.prototype.forEach.call(document.querySelectorAll("section.cha"),function(sec){
      var h2=sec.querySelector(".cha-head h2");
      out.push("","■ "+text(sec.querySelector(".cha-num"))+" "+(h2?text(h2):""));
      Array.prototype.forEach.call(sec.querySelectorAll(".act,.selfcheck"),function(block){
        if(skipEl(block,mode)) return;
        var h=block.querySelector("h3,h4"), before=out.length;
        out.push("","▶ "+(h?headText(h):""));
        walk(block);
        if(out.length===before+2) out.length=before;
      });
    });

    var extra=[];
    Object.keys(answers).forEach(function(k){ if(!seen[k]) extra.push("· "+k+": "+answers[k]); });
    if(extra.length){ out.push("","■ 기타 입력"); out=out.concat(extra); }

    var plots=plotLines();
    if(plots.length){ out.push("","■ 직접 그린 그래프(찍은 점)"); out=out.concat(plots); }

    function walk(block){
      var done=[], pendingQ=null;
      function isDone(el){ for(var i=0;i<done.length;i++){ if(done[i]===el||done[i].contains(el)) return true; } return false; }
      function mark(scope){ Array.prototype.forEach.call(scope.querySelectorAll("[data-field]"),function(e){ seen[e.getAttribute("data-field")]=true; }); }
      Array.prototype.forEach.call(block.querySelectorAll(".qlabel,[data-field],table"),function(el){
        if(isDone(el)) return;
        if(el.classList&&el.classList.contains("qlabel")){
          var ins=el.querySelectorAll("[data-field]");
          if(ins.length){
            var clone=el.cloneNode(true), cins=clone.querySelectorAll("[data-field]");
            Array.prototype.forEach.call(cins,function(c,i){
              var v=val(ins[i]); c.parentNode.replaceChild(document.createTextNode("["+(v||"  ")+"]"),c);
            });
            out.push("Q. "+qtext(clone)); mark(el); done.push(el); pendingQ=null;
          } else pendingQ=qtext(el.cloneNode(true));
          return;
        }
        if(el.tagName==="TABLE"){
          done.push(el);
          if(!el.querySelector("[data-field]")) return;
          if(pendingQ){ out.push("Q. "+pendingQ); pendingQ=null; }
          var cap=el.querySelector("caption"); if(cap) out.push("  ["+text(cap)+"]");
          Array.prototype.forEach.call(el.querySelectorAll("tr"),function(tr){
            var cells=Array.prototype.map.call(tr.children,function(c){
              var inp=c.querySelector("[data-field]"); return inp? (val(inp)||"·") : text(c);
            });
            out.push("  | "+cells.join(" | ")+" |");
          });
          mark(el); return;
        }
        var k=el.getAttribute("data-field"); seen[k]=true;
        if(el.type==="checkbox"){
          var li=el.closest("li"), d=li&&li.querySelector("div");
          out.push("  ["+(el.checked?"v":" ")+"] "+(d?text(d):li?text(li):k)); return;
        }
        if(el.type==="radio"){
          if(seen["radio:"+el.name]) return; seen["radio:"+el.name]=true;
          var row=el.closest(".row"), lab=row&&row.firstElementChild? text(row.firstElementChild) : el.name;
          var on=document.querySelector('input[name="'+el.name+'"]:checked');
          out.push("· "+lab+" → "+(on? on.value : "(미선택)")); return;
        }
        var q=pendingQ||el.getAttribute("data-q")||k; pendingQ=null;
        var v=val(el);
        out.push("Q. "+q,"A. "+(v||"(미작성)"));
      });
    }

    return {report:out.join("\n").replace(/\n{3,}/g,"\n\n"), answers:answers, progress:progress};
  }

  function plotLines(){
    var lines=[];
    if(!PLOT_PREFIX) return lines;
    try{
      for(var i=0;i<localStorage.length;i++){
        var key=localStorage.key(i);
        if(key.indexOf(PLOT_PREFIX)!==0) continue;
        var s=JSON.parse(localStorage.getItem(key)); if(!s||!s.pts||!s.pts.length) continue;
        var suffix=key.slice(PLOT_PREFIX.length), lab;
        if(s.cfg&&s.cfg.yunit) lab="가로=연도, 세로="+s.cfg.yunit;
        else{
          var root=document.querySelector('.plot[data-plot="'+suffix+'"]');
          lab="가로=t (s), 세로="+(root&&root.getAttribute("data-yunit")||suffix);
        }
        lines.push("["+lab+"] "+s.pts.map(function(p){ return "("+p[0]+", "+p[1]+")"; }).join(" ")
          +(s.trend?"  (추세선 표시함)":""));
      }
    }catch(e){}
    return lines;
  }

  /* ---------- UI ---------- */
  var css=document.createElement("style");
  css.textContent=
    ".sm-ov{position:fixed;inset:0;z-index:100;background:rgba(10,16,22,.55);display:none;align-items:center;justify-content:center;padding:16px}"+
    ".sm-ov.on{display:flex}"+
    ".sm-box{width:100%;max-width:480px;max-height:92vh;overflow:auto;background:var(--card,#fff);color:var(--ink,#1b2530);border:1px solid var(--line,#d7dde3);border-radius:14px;padding:22px;box-shadow:0 12px 40px rgba(0,0,0,.3);font-family:var(--f-body,system-ui,sans-serif)}"+
    ".sm-box h2{margin:0 0 6px;font-size:18px}"+
    ".sm-box p{margin:0 0 12px;font-size:13.5px;line-height:1.6;color:var(--ink-soft,#5a6673)}"+
    ".sm-box label{display:block;font-size:12.5px;font-weight:600;margin:10px 0 4px}"+
    ".sm-box input[type=text],.sm-box input[type=password]{width:100%;box-sizing:border-box;font:inherit;font-size:14px;padding:8px 10px;border-radius:8px;border:1px solid var(--field-line,#aab);background:var(--field,#f6f8fa);color:var(--ink,#1b2530)}"+
    ".sm-box .chk{display:flex;gap:8px;align-items:flex-start;font-weight:400;font-size:13px;margin-top:14px}"+
    ".sm-box .chk input{margin-top:3px}"+
    ".sm-kinds{display:grid;gap:8px;margin:4px 0 6px}"+
    ".sm-kinds label{display:flex;gap:9px;align-items:flex-start;margin:0;padding:9px 11px;border:1.5px solid var(--line,#d7dde3);border-radius:10px;font-weight:400;cursor:pointer;line-height:1.5}"+
    ".sm-kinds label b{display:block;font-size:13.5px}"+
    ".sm-kinds label span{display:block;font-size:12px;color:var(--ink-soft,#5a6673)}"+
    ".sm-kinds label:has(input:checked){border-color:var(--focus,#2f6fb3);background:var(--paper,#f3f6f8)}"+
    ".sm-kinds input{margin-top:3px}"+
    ".sm-row{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}"+
    ".sm-row button{font:inherit;font-size:13.5px;padding:8px 16px;border-radius:8px;border:1px solid var(--line,#d7dde3);background:var(--card,#fff);color:var(--ink,#1b2530);cursor:pointer}"+
    ".sm-row button.go{background:var(--focus,#2f6fb3);border-color:var(--focus,#2f6fb3);color:#fff}"+
    ".sm-row button:disabled{opacity:.55;cursor:default}"+
    ".sm-msg{margin-top:12px;font-size:13px;line-height:1.55;min-height:1em}"+
    ".sm-msg.err{color:#c0392b}.sm-msg.ok{color:#1e8a5a}"+
    ".sm-prog{font-family:var(--f-mono,monospace);font-size:12px}"+
    "#btn-submit{border-color:var(--focus,#2f6fb3)!important;font-weight:600}"+
    "@media print{.sm-ov,#btn-submit{display:none!important}}";
  document.head.appendChild(css);

  var ov=document.createElement("div");
  ov.className="sm-ov"; ov.setAttribute("role","dialog"); ov.setAttribute("aria-modal","true"); ov.setAttribute("aria-labelledby","sm-h");
  ov.innerHTML=
    '<div class="sm-box">'+
    '<h2 id="sm-h">활동지 제출</h2>'+
    '<p>제출은 두 종류입니다. 같은 이름으로 다시 제출하면 <b>최신 내용으로 덮어씁니다.</b></p>'+
    '<div class="sm-kinds" role="radiogroup" aria-label="제출 종류">'+
      '<label><input type="radio" name="sm-kind" value="me" id="sm-k-me"><div><b>① 내 경로 결과 (모둠원 각자)</b><span>내가 맡은 경로의 칸만 제출합니다. 단계가 끝날 때마다 다시 제출해도 됩니다.</span></div></label>'+
      '<label><input type="radio" name="sm-kind" value="team" id="sm-k-team"><div><b>② 모둠 통합본 (모둠 대표 1명)</b><span>모둠 공유판까지 채운 뒤, 주제가 끝나면 대표가 한 번 제출합니다.</span></div></label>'+
    '</div>'+
    '<div class="sm-prog" id="sm-prog"></div>'+
    '<label for="sm-team">모둠명</label><input type="text" id="sm-team" maxlength="40" autocomplete="off" placeholder="예: 3모둠 / 파란불꽃">'+
    '<div id="sm-me-wrap"><label for="sm-me">내 이름</label><input type="text" id="sm-me" maxlength="20" autocomplete="off" placeholder="예: 김OO"></div>'+
    '<div id="sm-mem-wrap"><label for="sm-mem">모둠원 이름(쉼표로 구분)</label><input type="text" id="sm-mem" maxlength="120" autocomplete="off" placeholder="예: 김OO(A), 이OO(B), 박OO(C), 최OO(D)"></div>'+
    (CFG.needCode? '<label for="sm-code">제출 코드</label><input type="password" id="sm-code" maxlength="40" autocomplete="off" placeholder="선생님이 알려 준 코드">' : '')+
    '<label class="chk"><input type="checkbox" id="sm-ok"><span id="sm-oktxt">제출 내용을 확인했습니다.</span></label>'+
    '<div class="sm-msg" id="sm-msg" role="status"></div>'+
    '<div class="sm-row"><button type="button" id="sm-cancel">닫기</button><button type="button" class="go" id="sm-go">제출</button></div>'+
    '</div>';
  document.body.appendChild(ov);

  var $=function(id){ return document.getElementById(id); };
  var teamEl=$("sm-team"), memEl=$("sm-mem"), meEl=$("sm-me"), codeEl=$("sm-code"), okEl=$("sm-ok"),
      msgEl=$("sm-msg"), goEl=$("sm-go"), progEl=$("sm-prog"), meWrap=$("sm-me-wrap"), memWrap=$("sm-mem-wrap"),
      kindMe=$("sm-k-me"), kindTeam=$("sm-k-team"), okTxt=$("sm-oktxt");

  function msg(t,cls){ msgEl.textContent=t; msgEl.className="sm-msg"+(cls?" "+cls:""); }
  function fmtTime(iso){ try{ return new Date(iso).toLocaleString("ko-KR"); }catch(e){ return iso; } }
  function kind(){ return kindTeam.checked? "team" : "me"; }
  function doneAny(){ return lsGet(LS_DONE+":me")||lsGet(LS_DONE+":team")||lsGet(LS_DONE); }

  var btn=document.createElement("button");
  btn.type="button"; btn.id="btn-submit";
  function refreshBtn(){ btn.textContent= doneAny()? "제출됨 ✓" : "제출하기"; }
  refreshBtn();
  var tools=document.querySelector(".tools");
  if(tools) tools.insertBefore(btn,tools.firstChild); else document.body.appendChild(btn);
  var ft=document.querySelector("main footer");
  if(ft) ft.insertAdjacentHTML("beforeend"," <b>제출은 위쪽 [제출하기] 버튼 — 모둠원은 내 경로 결과를, 모둠 대표는 주제가 끝난 뒤 모둠 통합본을 제출합니다.</b>");

  function refreshKind(){
    var k=kind(), info=build(k);
    meWrap.style.display= k==="me"? "" : "none";
    memWrap.style.display= k==="team"? "" : "none";
    okTxt.textContent= k==="me"? "내 경로 결과를 확인했습니다." : "모둠원 모두 제출 내용을 확인했습니다.";
    var pl=pathLabel();
    progEl.textContent="현재 진행률 "+info.progress+"%"+(k==="me"? " · 내 경로: "+(pl||"(미선택)") : "")+(info.progress<50? " — 비어 있는 칸이 많습니다. 확인하세요.":"");
    var d=lsGet(LS_DONE+":"+k);
    if(d) msg("이미 제출함 ("+fmtTime(d.at)+", "+d.team+"). 다시 제출하면 최신 내용으로 덮어씁니다.","");
    else msg("");
  }
  kindMe.addEventListener("change",refreshKind);
  kindTeam.addEventListener("change",refreshKind);

  function open(){
    var f=lsGet(LS_FORM)||{};
    teamEl.value=f.team||""; memEl.value=f.members||""; meEl.value=f.me||"";
    var wn=document.getElementById("w-name"); if(!meEl.value&&wn&&wn.value) meEl.value=wn.value.trim();
    var wt=document.getElementById("w-team"); if(!teamEl.value&&wt&&wt.value) teamEl.value=wt.value.trim();
    (f.kind==="team"? kindTeam : kindMe).checked=true;
    okEl.checked=false; goEl.disabled=false;
    refreshKind();
    ov.classList.add("on"); setTimeout(function(){ teamEl.focus(); },30);
  }
  function close(){ ov.classList.remove("on"); }
  btn.addEventListener("click",open);
  $("sm-cancel").addEventListener("click",close);
  ov.addEventListener("click",function(e){ if(e.target===ov) close(); });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&ov.classList.contains("on")) close(); });

  function post(body,cb){
    var headers={"Content-Type":"text/plain;charset=utf-8"};
    fetch(CFG.endpoint,{method:"POST",headers:headers,body:body,redirect:"follow"})
      .then(function(r){ return r.json(); })
      .then(function(j){ cb(null,j); })
      .catch(function(){
        fetch(CFG.endpoint,{method:"POST",mode:"no-cors",headers:headers,body:body})
          .then(function(){ cb(null,{ok:true,unconfirmed:true}); })
          .catch(function(err){ cb(err||new Error("network")); });
      });
  }

  goEl.addEventListener("click",function(){
    var k=kind(), team=teamEl.value.trim(), mem=memEl.value.trim(), who=meEl.value.trim(), p=pathOf();
    if(!team){ msg("모둠명을 입력하세요.","err"); teamEl.focus(); return; }
    if(k==="me"){
      if(!p){ msg("위쪽 '나의 경로 선택'에서 내 경로(A~D)를 먼저 고르세요.","err"); return; }
      if(!who){ msg("내 이름을 입력하세요.","err"); meEl.focus(); return; }
    } else if(!mem){ msg("모둠원 이름을 입력하세요.","err"); memEl.focus(); return; }
    if(codeEl&&!codeEl.value.trim()){ msg("제출 코드를 입력하세요.","err"); codeEl.focus(); return; }
    if(!okEl.checked){ msg("확인란에 체크해야 제출할 수 있습니다.","err"); return; }
    var info=build(k);
    var teamKey= k==="me"? team+" · "+p+"경로("+who+")" : team;
    var payload={topic:TOPIC,team:teamKey,members:k==="me"? who+" ["+pathLabel()+"]" : mem,code:codeEl? codeEl.value.trim():"",
      progress:info.progress,report:info.report,answers:info.answers,clientTime:new Date().toISOString()};
    goEl.disabled=true; msg("전송 중입니다… 창을 닫지 마세요.","");
    post(JSON.stringify(payload),function(err,res){
      goEl.disabled=false;
      if(err){ msg("전송하지 못했습니다. 인터넷 연결을 확인하고 다시 시도하세요. 계속 안 되면 '답안 복사'로 선생님께 전달하세요.","err"); return; }
      if(!res||!res.ok){ msg((res&&res.error)||"제출이 거절되었습니다. 입력을 확인하세요.","err"); return; }
      lsSet(LS_FORM,{team:team,members:mem,me:who,kind:k});
      lsSet(LS_DONE+":"+k,{team:teamKey,at:new Date().toISOString()});
      refreshBtn();
      msg(res.unconfirmed? "전송했습니다. (서버 응답을 확인하지 못했으니 선생님께 접수 여부를 확인하세요.)" : "제출 완료! 수고했습니다.","ok");
    });
  });
})();
