/**
 * STEAM 세특 근거 수집용 구글 폼 6개 자동 생성
 * (전/중/후 × 개인/모둠) — 실행 한 번으로 폼 6개 + 응답을 모을 새 스프레드시트 1개가 만들어집니다.
 * 사용법은 같은 폴더 설정방법.md 의 "세특 근거 폼 만들기" 항목을 보세요.
 *
 * 실행 방법: 이 함수들이 있는 상태에서 위쪽 함수 선택 드롭다운에서 buildAllForms 를 고르고 ▶ 실행.
 */

var TOPICS = [
  "주제1 · PASCO 센서로 읽는 중화 반응",
  "주제2 · PASCO·Tracker로 읽는 빗면 운동",
  "주제3 · Sage Modeler와 빅데이터로 읽는 기후변화",
  "주제4 · 심박 센서로 읽는 활력징후"
];
var SCALE4 = ["매우 그렇다", "그렇다", "보통이다", "아니다"];
var YESNO = ["그렇다", "아니다"];

function buildAllForms() {
  var ss = SpreadsheetApp.create("STEAM 세특 근거 응답 모음");
  var ssId = ss.getId();

  var links = [];
  links.push(buildPreIndividual(ssId));
  links.push(buildPreTeam(ssId));
  links.push(buildDuringIndividual(ssId));
  links.push(buildDuringTeam(ssId));
  links.push(buildPostIndividual(ssId));
  links.push(buildPostTeam(ssId));

  var sh = ss.getSheetByName("시트1");
  if (sh) {
    sh.getRange(1, 1, 1, 2).setValues([["폼 이름", "학생에게 나눠줄 링크"]]).setFontWeight("bold");
    sh.getRange(2, 1, links.length, 2).setValues(links);
    sh.autoResizeColumns(1, 2);
  }
  Logger.log("완료! 스프레드시트: " + ss.getUrl());
}

function addTopic(form) {
  form.addListItem().setTitle("주제").setChoiceValues(TOPICS).setRequired(true);
}
function addPersonHeader(form) {
  addTopic(form);
  form.addTextItem().setTitle("학년/반").setRequired(true);
  form.addTextItem().setTitle("번호").setRequired(true);
  form.addTextItem().setTitle("이름").setRequired(true);
}
function addTeamHeader(form) {
  addTopic(form);
  form.addTextItem().setTitle("모둠명").setRequired(true);
  form.addTextItem().setTitle("작성자(대표) 이름").setRequired(true);
}
function addParas(form, items, required) {
  items.forEach(function (t) {
    form.addParagraphTextItem().setTitle(t).setRequired(required !== false);
  });
}
function finish(form, ssId) {
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ssId);
  return [form.getTitle(), form.getPublishedUrl()];
}

function buildPreIndividual(ssId) {
  var form = FormApp.create("STEAM 활동 전 개인 탐구 준비지");
  form.setDescription("활동을 시작하기 전, 오늘 탐구할 내용에 대한 나의 생각을 정리합니다. (개인 제출)");
  addPersonHeader(form);
  addParas(form, [
    "0. 배경 상황 이해 — 제시된 현상·문제 상황에 대한 지금 당장의 내 생각",
    "1. 주제와 관련해 내가 이미 알고 있는 내용 (개념·용어·원리·배경지식·유사 경험·관련 수업 내용 등)",
    "2. 오늘 해결하거나 탐구할 핵심 문제 (이번 활동에서 밝혀 보고 싶은 점)",
    "3. 예상/가설 (결과가 어떻게 나타날지와 그 이유를 함께 쓰기)",
    "4. 예상의 근거 (개념, 경험, 자료 조사 내용 등)",
    "5. 필요한 준비물 또는 정보 (도구, 자료, 앱, 안전 준비 등)",
    "6. 내가 맡고 싶은 역할과 이유 (역할 선호와 강점)",
    "7. 활동 중 집중해서 관찰할 요소 (변화, 기준, 비교 대상 등)"
  ]);
  form.addGridItem().setTitle("8. 활동 전 자기 점검")
    .setRows(["개념 이해도", "도구 사용 자신감", "협업 준비도"])
    .setColumns(SCALE4).setRequired(true);
  form.addParagraphTextItem()
    .setTitle("9. 교사가 직접 보지 못해도 보여 줄 수 있는 나의 활동 근거 계획 (메모, 사진, 화면 캡처, 체크리스트, 산출물 등)")
    .setRequired(true);
  return finish(form, ssId);
}

function buildPreTeam(ssId) {
  var form = FormApp.create("STEAM 활동 전 모둠 계획서");
  form.setDescription("모둠 대표 1명이 작성합니다. (팀별 제출)");
  addTeamHeader(form);
  addParas(form, [
    "탐구/제작 목표", "핵심 질문", "모둠 가설 또는 예상 결과", "역할 분담 계획",
    "단계별 진행 순서", "필요 도구/재료/앱", "기록 방법", "예상되는 어려움",
    "문제 발생 시 해결 방법", "안전 또는 윤리 유의점", "교사 도움 없이도 남길 근거 자료 계획"
  ]);
  form.addParagraphTextItem()
    .setTitle("구성원별 역할 (한 줄에 한 명씩: 이름 - 역할 - 역할 선택 이유 - 예상 기여)")
    .setHelpText("예) 김OO - 자료조사 - 발표를 잘해서 - 배경 개념 정리 담당")
    .setRequired(true);
  return finish(form, ssId);
}

function buildDuringIndividual(ssId) {
  var form = FormApp.create("STEAM 활동 중 실행·기록지");
  form.setDescription("활동 당일 조건과 진행 과정을 기록합니다. (개인 제출)");
  addPersonHeader(form);
  addParas(form, [
    "활동 일시", "장소/환경", "실험·제작 조건", "측정/기록 기준", "재료 또는 설정값"
  ]);
  form.addParagraphTextItem()
    .setTitle("회차/단계별 기록 (한 줄에 한 회차씩: 회차 - 행동/처리 - 조건·설정값 - 데이터)")
    .setHelpText("예) 1회차 - 20cm 지점에서 낙하 - 각도 10도 - x=0.03, v=0.34")
    .setRequired(true);
  addParas(form, [
    "중간 점검: 현재까지 가장 의미 있는 변화 또는 결과",
    "중간 점검: 예상과 달랐던 점과 그 이유 추정",
    "중간 점검: 다음 단계에서 수정하거나 보완할 점"
  ]);
  form.addParagraphTextItem()
    .setTitle("활동 근거 첨부 목록 (사진·캡처·파일명·쪽수 등을 글로 설명)")
    .setHelpText("파일 자체는 공유 드라이브 폴더에 올리고, 여기엔 파일명이나 위치만 적어 주세요.")
    .setRequired(false);
  return finish(form, ssId);
}

function buildDuringTeam(ssId) {
  var form = FormApp.create("STEAM 활동 중 협업·역할 수행 기록지");
  form.setDescription("모둠 대표 1명이 구성원 전체 내용을 정리해 작성합니다. (팀별 제출) 각 문항은 구성원별로 한 줄씩 적어 주세요.");
  addTeamHeader(form);
  var cols = [
    "맡은 역할", "실제로 수행한 행동", "모둠에 기여한 점", "문제 해결을 위해 시도한 점",
    "도움이 필요했던 점", "동료와 조율(의견 반영)한 내용", "남은 활동에서 개선할 점", "자기평가"
  ];
  cols.forEach(function (c) {
    form.addParagraphTextItem()
      .setTitle(c + " (구성원별로 줄바꿔 작성: 이름 - 내용)")
      .setRequired(true);
  });
  return finish(form, ssId);
}

function buildPostIndividual(ssId) {
  var form = FormApp.create("STEAM 활동 후 개인 해석·성찰지");
  form.setDescription("활동이 끝난 뒤, 결과를 해석하고 나의 성장을 돌아봅니다. (개인 제출)");
  addPersonHeader(form);
  addParas(form, [
    "1. 내가 확인한 핵심 결과 (수치, 변화, 완성물 특징, 데이터, 그래프 해석 등)",
    "2. 그 결과가 의미하는 바 (개념·원리와 연결하여 설명)",
    "3. 활동 전 예상과 비교 (같았는지, 달랐는지, 왜 그런지)",
    "4. 가장 설득력 있는 근거 (표, 그래프, 사진, 산출물, 팀 기록 등)",
    "5. 내가 실제로 수행한 역할과 기여 (직접 한 행동 중심으로)",
    "6. 활동 중 어려움과 해결 방법",
    "7. 교사가 못 봤더라도 확인 가능한 나의 활동 증거 (파일, 흔적, 기록, 동료 확인 등)",
    "8. 오차/한계/아쉬운 점",
    "9. 다시 한다면 바꾸고 싶은 점",
    "10. 이번 활동에서 성장한 점"
  ]);
  return finish(form, ssId);
}

function buildPostTeam(ssId) {
  var form = FormApp.create("STEAM 활동 후 모둠 결과물 정리");
  form.setDescription("모둠 대표 1명이 작성합니다. (팀별 제출)");
  addTeamHeader(form);
  form.addListItem().setTitle("결과물 유형")
    .setChoiceValues(["보고서", "발표자료", "포스터", "인포그래픽", "제작물 설명", "영상 대본", "기타"])
    .setRequired(true);
  addParas(form, [
    "결과물 제목", "핵심 질문 또는 문제", "활동 방법 요약", "주요 결과 요약", "해석 및 결론"
  ]);
  form.addCheckboxItem().setTitle("융합 요소 (해당되는 것 모두 선택)")
    .setChoiceValues(["과학", "기술", "공학", "예술", "수학"]).setRequired(true);
  addParas(form, [
    "근거 자료 목록", "청중에게 전달하고 싶은 핵심 한 문장", "추가 개선/확장 아이디어"
  ]);
  form.addGridItem().setTitle("결과물 완성도 점검")
    .setRows(["핵심 내용이 드러난다", "근거 자료가 포함되었다", "구성원이 역할을 반영했다", "수정/보완 방향이 보인다"])
    .setColumns(YESNO).setRequired(true);
  form.addParagraphTextItem().setTitle("완성도 점검 비고").setRequired(false);
  return finish(form, ssId);
}
