/* 세특 근거용 성찰 폼 링크 설정
 * apps-script/FormBuilder.gs 실행 후 나온 스프레드시트의 "학생에게 나눠줄 링크" 값을
 * 아래 6개 칸에 그대로 붙여넣으면, 활동지에 [성찰 기록] 버튼이 나타납니다.
 * 비워 둔 항목은 버튼에서 자동으로 빠집니다.
 */
window.STEAM_REFLECT = {
  preIndividual: "",   // 활동 전 개인 탐구 준비지
  preTeam: "",         // 활동 전 모둠 계획서
  duringIndividual: "",// 활동 중 실행·기록지
  duringTeam: "",      // 활동 중 협업·역할 수행 기록지
  postIndividual: "",  // 활동 후 개인 해석·성찰지
  postTeam: ""         // 활동 후 모둠 결과물 정리
};
