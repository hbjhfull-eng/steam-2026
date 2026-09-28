/**
 * STEAM 융합수업 활동지 제출 수신기 (Google Apps Script 웹앱)
 * 사용법은 같은 폴더의 설정방법.md 를 보세요.
 *
 * - 주제별 시트 탭에 모둠당 1행 저장 (같은 모둠명으로 다시 오면 그 행을 덮어씀)
 * - '제출로그' 탭에는 모든 제출이 시간순으로 계속 쌓임 (덮어쓰기 전 기록 보존)
 */

// 비워 두면 코드 검사를 하지 않습니다. 값을 넣으면 학생이 같은 코드를 입력해야 접수됩니다.
// (submit-config.js 의 needCode 도 true 로 바꿔야 학생 화면에 입력칸이 나타납니다)
var SUBMIT_CODE = "";

var HEADER = ["제출시각", "모둠명", "모둠원", "진행률(%)", "제출횟수", "답안 전문", "원본(JSON)"];
var MAX_CELL = 49000; // 구글 시트 한 칸 최대 5만 자

function doGet() {
  return ContentService.createTextOutput("STEAM 제출 웹앱이 동작 중입니다.");
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents);

    if (SUBMIT_CODE && String(d.code || "") !== SUBMIT_CODE) {
      return reply({ ok: false, error: "제출 코드가 올바르지 않습니다." });
    }
    var team = String(d.team || "").trim();
    var topic = String(d.topic || "").trim();
    if (!team || !topic) return reply({ ok: false, error: "모둠명 또는 주제가 비어 있습니다." });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getSheet(ss, sheetName(topic));
    var now = new Date();

    var report = clip(String(d.report || ""));
    var raw = JSON.stringify(d.answers || {});
    if (raw.length > MAX_CELL) raw = "(내용이 너무 길어 생략)";

    // 모둠명(B열)으로 기존 행 찾기
    var row = -1, count = 1;
    var last = sheet.getLastRow();
    if (last >= 2) {
      var teams = sheet.getRange(2, 2, last - 1, 1).getValues();
      for (var i = 0; i < teams.length; i++) {
        if (String(teams[i][0]).trim() === team) { row = i + 2; break; }
      }
      if (row > 0) count = (Number(sheet.getRange(row, 5).getValue()) || 1) + 1;
    }
    if (row < 0) row = last + 1;

    var values = [[now, safe(team), safe(String(d.members || "")), Number(d.progress) || 0, count, safe(report), safe(raw)]];
    sheet.getRange(row, 1, 1, HEADER.length).setValues(values);
    sheet.getRange(row, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");

    var log = getSheet(ss, "제출로그", ["제출시각", "주제", "모둠명", "모둠원", "진행률(%)", "제출횟수"]);
    log.appendRow([now, safe(topic), safe(team), safe(String(d.members || "")), Number(d.progress) || 0, count]);
    log.getRange(log.getLastRow(), 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");

    return reply({ ok: true, updated: count > 1, count: count });
  } catch (err) {
    return reply({ ok: false, error: "서버 오류: " + err });
  } finally {
    lock.releaseLock();
  }
}

function getSheet(ss, name, header) {
  var sh = ss.getSheetByName(name);
  if (sh) return sh;
  sh = ss.insertSheet(name);
  var h = header || HEADER;
  sh.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight("bold").setBackground("#e8eef5");
  sh.setFrozenRows(1);
  if (!header) {
    sh.setColumnWidths(1, 1, 150);
    sh.setColumnWidths(2, 1, 110);
    sh.setColumnWidths(3, 1, 160);
    sh.setColumnWidths(4, 2, 70);
    sh.setColumnWidth(6, 640);
    sh.setColumnWidth(7, 200);
    sh.getRange("F:G").setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP).setVerticalAlignment("top");
  }
  return sh;
}

// 시트 탭 이름에 쓸 수 없는 문자 제거, 길이 제한
function sheetName(topic) {
  return topic.replace(/[\[\]\*\/\\\?:]/g, "").slice(0, 60) || "기타";
}

// 수식으로 해석되지 않도록 앞에 작은따옴표
function safe(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function clip(s) {
  return s.length > MAX_CELL ? s.slice(0, MAX_CELL) + "\n…(이하 생략)" : s;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
