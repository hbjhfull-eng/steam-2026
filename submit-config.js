/* 제출 기능 설정
 * Apps Script 웹앱을 배포한 뒤 endpoint 에 그 주소를 넣으면
 * 4개 활동지 모두에 [제출하기] 버튼이 나타납니다. (비워 두면 버튼이 보이지 않음)
 * needCode 를 true 로 하면 학생이 교사가 알려 준 '제출 코드'를 입력해야 제출됩니다.
 * 코드 값 자체는 이 파일이 아니라 Apps Script(Code.gs)의 SUBMIT_CODE 에 넣으세요.
 */
window.STEAM_SUBMIT = {
  endpoint: "https://script.google.com/macros/s/AKfycbxEa6wycVF_oalwz4U31r6Mi1RZLpbLxBIx7aiq63yvbUAbQfVt9vBx7xDU4ySUwOQXrw/exec",
  needCode: false
};
