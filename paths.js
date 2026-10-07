/* 모둠원별 경로(A~D) 선택·표시 — 4개 activity.html 공용
 * - 경로 선택은 radio[name=w-path][data-field=w-path] 로 저장되어 활동지 자동 저장에 함께 보관됨
 * - body[data-path] 값에 따라 [data-p] 블록(경로 미션·경로별 활동)이 보이거나 숨겨짐 (paths.css)
 * - window.steamPathHidden(el): 내 경로에서 숨겨진 칸이면 true (진행률·제출·답안복사에서 제외하는 데 사용)
 */
(function(){
  "use strict";
  var body=document.body;

  function selected(){
    var r=document.querySelector('input[name="w-path"]:checked');
    return r? r.value : "";
  }
  function hidden(el){
    if(body.classList.contains("showall")) return false;
    var p=el.closest&&el.closest("[data-p]");
    if(!p) return false;
    var s=selected();
    if(!s) return true;
    return p.getAttribute("data-p").indexOf(s)<0;
  }
  function label(l){
    var b=document.querySelector('.pcard[data-l="'+l+'"] b');
    return l+" · "+(b? b.textContent.trim() : "");
  }
  window.steamPathHidden=hidden;
  window.steamPathSelected=selected;
  window.steamPathLabel=label;

  function apply(){
    var s=selected();
    if(s) body.setAttribute("data-path",s); else body.removeAttribute("data-path");
    Array.prototype.forEach.call(document.querySelectorAll(".pcard"),function(c){
      c.classList.toggle("on",c.getAttribute("data-l")===s);
    });
    var mp=document.getElementById("mypath");
    if(mp) mp.textContent= s? ("내 경로 · "+label(s)) : "경로를 선택하세요";
    Array.prototype.forEach.call(document.querySelectorAll(".gomission"),function(a){
      a.setAttribute("href", s? "#pm"+a.getAttribute("data-n")+"-"+s : "#pathsel");
      a.style.display= s? "" : "none";
    });
    document.dispatchEvent(new Event("steam-path"));
  }

  Array.prototype.forEach.call(document.querySelectorAll('input[name="w-path"]'),function(r){
    r.addEventListener("change",apply);
  });

  var all=document.getElementById("pathall");
  function applyAll(){
    body.classList.toggle("showall",!!(all&&all.checked));
    document.dispatchEvent(new Event("steam-path"));
  }
  if(all){
    all.addEventListener("change",applyAll);
    if(/[?&]all=1/.test(location.search)){ all.checked=true; applyAll(); }
  }

  /* 지난 차시에 내가 쓴 것을 이어받아 보여 주기 (.thread) */
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function renderThreads(){
    Array.prototype.forEach.call(document.querySelectorAll(".thread"),function(box){
      var src; try{ src=JSON.parse(box.getAttribute("data-src")); }catch(e){ return; }
      var h='<b>내 탐구 이어가기</b> <span class="thsub">— 지난 차시에 내가 쓴 것</span><ul>';
      src.forEach(function(it){
        var el=document.querySelector('[data-field="'+it[0]+'"]');
        var v=el? (el.textContent||"").trim() : "";
        h+='<li><em>'+esc(it[1])+'</em>'+(v? '<span class="tv">'+esc(v)+'</span>'
          : '<span class="tv empty">아직 쓰지 않았어요 — <a href="#'+it[2]+'">그 카드로 돌아가기</a></span>')+'</li>';
      });
      box.innerHTML=h+'</ul>';
    });
  }
  document.addEventListener("input",function(e){ if(e.target.closest&&e.target.closest("[data-field]")) renderThreads(); });
  document.addEventListener("steam-path",renderThreads);

  /* 이론·참고 값 가리기 → 눌러서 확인 */
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest(".refbtn"); if(!b) return;
    var w=b.parentNode.previousElementSibling;
    while(w&&!w.classList.contains("tbl-wrap")) w=w.previousElementSibling;
    if(!w) return;
    var on=w.classList.toggle("show-ref");
    b.setAttribute("aria-expanded",on?"true":"false");
    b.textContent= on? "참고값 숨기기" : "참고값 확인 (먼저 내 값을 쓰고 눌러 보세요)";
  });

  var mp=document.getElementById("mypath");
  if(mp) mp.addEventListener("click",function(){
    var t=document.getElementById("pathsel"); if(t) t.scrollIntoView({behavior:"smooth",block:"start"});
  });
  window.addEventListener("beforeprint",function(){ body.classList.remove("showall"); if(all) all.checked=false; });

  apply();
})();
