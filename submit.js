/* 활동지 제출 모듈 (4개 activity.html 공용)
 * - 모둠 대표가 주제 마지막에 한 번 제출 (같은 모둠명으로 다시 제출하면 최신본으로 덮어씀)
 * - 활동지 내용을 사람이 읽기 좋은 텍스트로 만들어 Apps Script 웹앱으로 전송 → 교사 구글 시트에 저장
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

  /* ---------- 활동지 → 텍스트 ---------- */
  function build(){
    var out=[], seen={}, answers={}, keys={};
    Array.prototype.forEach.call(document.querySelectorAll("[data-field]"),function(el){
      var k=el.getAttribute("data-field"); keys[k]=true;
      var v=val(el); if(v!==""&&v!==false) answers[k]=v;
    });
    var total=Object.keys(keys).length, filled=Object.keys(answers).length;
    var progress=total? Math.round(filled/total*100) : 0;

    var who=document.querySelector(".who");
    if(who){
      out.push("■ 인적사항(작성자)");
      Array.prototype.forEach.call(who.querySelectorAll("[data-field]"),function(inp){
        var lab=inp.parentNode&&inp.parentNode.firstChild? inp.parentNode.firstChild.textContent.trim() : inp.getAttribute("data-field");
        out.push("· "+lab+": "+(val(inp)||"(미작성)")); seen[inp.getAttribute("data-field")]=true;
      });
    }

    Array.prototype.forEach.call(document.querySelectorAll("section.cha"),function(sec){
      var h2=sec.querySelector(".cha-head h2");
      out.push("","■ "+text(sec.querySelector(".cha-num"))+" "+(h2?text(h2):""));
      Array.prototype.forEach.call(sec.querySelectorAll(".act,.selfcheck"),function(block){
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
    ".sm-box{width:100%;max-width:460px;max-height:92vh;overflow:auto;background:var(--card,#fff);color:var(--ink,#1b2530);border:1px solid var(--line,#d7dde3);border-radius:14px;padding:22px;box-shadow:0 12px 40px rgba(0,0,0,.3);font-family:var(--f-body,system-ui,sans-serif)}"+
    ".sm-box h2{margin:0 0 6px;font-size:18px}"+
    ".sm-box p{margin:0 0 12px;font-size:13.5px;line-height:1.6;color:var(--ink-soft,#5a6673)}"+
    ".sm-box label{display:block;font-size:12.5px;font-weight:600;margin:10px 0 4px}"+
    ".sm-box input[type=text],.sm-box input[type=password]{width:100%;box-sizing:border-box;font:inherit;font-size:14px;padding:8px 10px;border-radius:8px;border:1px solid var(--field-line,#aab);background:var(--field,#f6f8fa);color:var(--ink,#1b2530)}"+
    ".sm-box .chk{display:flex;gap:8px;align-items:flex-start;font-weight:400;font-size:13px;margin-top:14px}"+
    ".sm-box .chk input{margin-top:3px}"+
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
    '<h2 id="sm-h">모둠 결과 제출</h2>'+
    '<p>주제가 끝난 뒤 <b>모둠 대표 1명</b>이 한 번만 제출합니다. 모든 차시 내용을 채웠는지 확인하세요. '+
    '같은 모둠명으로 다시 제출하면 <b>최신 내용으로 덮어씁니다.</b></p>'+
    '<div class="sm-prog" id="sm-prog"></div>'+
    '<label for="sm-team">모둠명</label><input type="text" id="sm-team" maxlength="40" autocomplete="off" placeholder="예: 3모둠 / 파란불꽃">'+
    '<label for="sm-mem">모둠원 이름(쉼표로 구분)</label><input type="text" id="sm-mem" maxlength="120" autocomplete="off" placeholder="예: 김OO, 이OO, 박OO">'+
    (CFG.needCode? '<label for="sm-code">제출 코드</label><input type="password" id="sm-code" maxlength="40" autocomplete="off" placeholder="선생님이 알려 준 코드">' : '')+
    '<label class="chk"><input type="checkbox" id="sm-ok"><span>모둠원 모두 제출 내용을 확인했습니다.</span></label>'+
    '<div class="sm-msg" id="sm-msg" role="status"></div>'+
    '<div class="sm-row"><button type="button" id="sm-cancel">닫기</button><button type="button" class="go" id="sm-go">제출</button></div>'+
    '</div>';
  document.body.appendChild(ov);

  var $=function(id){ return document.getElementById(id); };
  var teamEl=$("sm-team"), memEl=$("sm-mem"), codeEl=$("sm-code"), okEl=$("sm-ok"),
      msgEl=$("sm-msg"), goEl=$("sm-go"), progEl=$("sm-prog");

  function msg(t,cls){ msgEl.textContent=t; msgEl.className="sm-msg"+(cls?" "+cls:""); }
  function fmtTime(iso){ try{ return new Date(iso).toLocaleString("ko-KR"); }catch(e){ return iso; } }

  var btn=document.createElement("button");
  btn.type="button"; btn.id="btn-submit";
  function refreshBtn(){ btn.textContent= lsGet(LS_DONE)? "제출됨 ✓" : "제출하기"; }
  refreshBtn();
  var tools=document.querySelector(".tools");
  if(tools) tools.insertBefore(btn,tools.firstChild); else document.body.appendChild(btn);
  var ft=document.querySelector("main footer");
  if(ft) ft.insertAdjacentHTML("beforeend"," <b>주제가 끝나면 모둠 대표가 위쪽 [제출하기] 버튼으로 한 번 제출합니다(그때만 선생님께 전송).</b>");

  function open(){
    var info=build();
    progEl.textContent="현재 진행률 "+info.progress+"%"+(info.progress<50? " — 비어 있는 칸이 많습니다. 확인하세요.":"");
    var f=lsGet(LS_FORM)||{}; teamEl.value=f.team||""; memEl.value=f.members||"";
    okEl.checked=false; goEl.disabled=false;
    var d=lsGet(LS_DONE);
    if(d) msg("이미 제출함 ("+fmtTime(d.at)+", 모둠명: "+d.team+"). 다시 제출하면 최신 내용으로 덮어씁니다.","");
    else msg("");
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
    var team=teamEl.value.trim(), mem=memEl.value.trim();
    if(!team){ msg("모둠명을 입력하세요.","err"); teamEl.focus(); return; }
    if(!mem){ msg("모둠원 이름을 입력하세요.","err"); memEl.focus(); return; }
    if(codeEl&&!codeEl.value.trim()){ msg("제출 코드를 입력하세요.","err"); codeEl.focus(); return; }
    if(!okEl.checked){ msg("확인란에 체크해야 제출할 수 있습니다.","err"); return; }
    var info=build();
    var payload={topic:TOPIC,team:team,members:mem,code:codeEl? codeEl.value.trim():"",
      progress:info.progress,report:info.report,answers:info.answers,clientTime:new Date().toISOString()};
    goEl.disabled=true; msg("전송 중입니다… 창을 닫지 마세요.","");
    post(JSON.stringify(payload),function(err,res){
      goEl.disabled=false;
      if(err){ msg("전송하지 못했습니다. 인터넷 연결을 확인하고 다시 시도하세요. 계속 안 되면 '답안 복사'로 선생님께 전달하세요.","err"); return; }
      if(!res||!res.ok){ msg((res&&res.error)||"제출이 거절되었습니다. 입력을 확인하세요.","err"); return; }
      lsSet(LS_FORM,{team:team,members:mem});
      lsSet(LS_DONE,{team:team,at:new Date().toISOString()});
      refreshBtn();
      msg(res.unconfirmed? "전송했습니다. (서버 응답을 확인하지 못했으니 선생님께 접수 여부를 확인하세요.)" : "제출 완료! 수고했습니다.","ok");
    });
  });
})();
