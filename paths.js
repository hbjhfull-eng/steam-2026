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

  var mp=document.getElementById("mypath");
  if(mp) mp.addEventListener("click",function(){
    var t=document.getElementById("pathsel"); if(t) t.scrollIntoView({behavior:"smooth",block:"start"});
  });
  window.addEventListener("beforeprint",function(){ body.classList.remove("showall"); if(all) all.checked=false; });

  apply();
})();
