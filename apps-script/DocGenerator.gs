// 개별 학생/모둠 제출 문서 자동 생성
// 폼 제출이 들어올 때마다 그 응답 하나만 원래 xlsx 양식처럼 문서로 만들어
// "세특 근거 문서함" 폴더에 저장한다. (스프레드시트 기록과는 별개로 추가됨)
// 설치: setupSubmitTriggers 를 한 번 실행하면 6개 폼 모두에 트리거가 걸린다.

var DOC_FOLDER_NAME = "세특 근거 문서함";
var STEAM_FORM_TITLES = [
  "STEAM 활동 전 개인 탐구 준비지",
  "STEAM 활동 전 모둠 계획서",
  "STEAM 활동 중 실행·기록지",
  "STEAM 활동 중 협업·역할 수행 기록지",
  "STEAM 활동 후 개인 해석·성찰지",
  "STEAM 활동 후 모둠 결과물 정리"
];
var META_KEYS = ["주제", "학년/반", "번호", "이름", "모둠명", "작성자(대표) 이름"];

function setupSubmitTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "onAnyFormSubmit") ScriptApp.deleteTrigger(t);
  });
  var count = 0;
  STEAM_FORM_TITLES.forEach(function (title) {
    var files = DriveApp.getFilesByName(title);
    while (files.hasNext()) {
      var f = files.next();
      if (f.getMimeType() === "application/vnd.google-apps.form") {
        var form = FormApp.openById(f.getId());
        ScriptApp.newTrigger("onAnyFormSubmit").forForm(form).onFormSubmit().create();
        count++;
        break;
      }
    }
  });
  Logger.log("트리거 설치 완료: " + count + "개 폼");
}

function getOrCreateFolder(name) {
  var it = DriveApp.getFoldersByName(name);
  if (it.hasNext()) return it.next();
  return DriveApp.createFolder(name);
}

function fmtAnswer(item, resp) {
  var type = item.getType();
  if (type === FormApp.ItemType.CHECKBOX) {
    return Array.isArray(resp) ? resp.join(", ") : String(resp || "(미응답)");
  }
  if (type === FormApp.ItemType.GRID || type === FormApp.ItemType.CHECKBOX_GRID) {
    var rows = (type === FormApp.ItemType.GRID ? item.asGridItem() : item.asCheckboxGridItem()).getRows();
    var lines = [];
    for (var i = 0; i < rows.length; i++) {
      var v = resp && resp[i];
      var text = Array.isArray(v) ? v.join(", ") : (v || "(미응답)");
      lines.push(rows[i] + " : " + text);
    }
    return lines.join("\n");
  }
  return resp || "(미응답)";
}

function onAnyFormSubmit(e) {
  var form = e.source;
  var response = e.response;
  var itemResponses = response.getItemResponses();

  var title = form.getTitle();
  var meta = {};
  var qa = [];

  itemResponses.forEach(function (ir) {
    var item = ir.getItem();
    var t = item.getTitle();
    var val = fmtAnswer(item, ir.getResponse());
    if (META_KEYS.indexOf(t) > -1) {
      meta[t] = val;
    } else {
      qa.push({ q: t, a: val });
    }
  });

  var who = meta["이름"] || meta["작성자(대표) 이름"] || meta["모둠명"] || "무명";
  var now = new Date();
  var stamp = Utilities.formatDate(now, "Asia/Seoul", "MMdd_HHmm");
  var fileName = who + "_" + (meta["주제"] || "") + "_" + title + "_" + stamp;

  var doc = DocumentApp.create(fileName);
  var body = doc.getBody();
  body.appendParagraph(title).setHeading(DocumentApp.ParagraphHeading.TITLE);
  var desc = form.getDescription();
  if (desc) body.appendParagraph(desc).setItalic(true);
  body.appendHorizontalRule();

  META_KEYS.forEach(function (k) {
    if (meta[k]) body.appendParagraph(k + " : " + meta[k]);
  });
  body.appendParagraph("제출시각 : " + Utilities.formatDate(now, "Asia/Seoul", "yyyy-MM-dd HH:mm"));
  body.appendHorizontalRule();

  qa.forEach(function (item) {
    body.appendParagraph(item.q).setBold(true).setSpacingBefore(10);
    body.appendParagraph(item.a);
  });

  doc.saveAndClose();

  var file = DriveApp.getFileById(doc.getId());
  var folder = getOrCreateFolder(DOC_FOLDER_NAME);
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  Logger.log("문서 생성: " + file.getUrl());
}
