/* 세특 근거용 성찰 폼 링크 설정
 * apps-script/FormBuilder.gs 실행 후 나온 스프레드시트의 "학생에게 나눠줄 링크" 값을
 * 아래 6개 칸에 그대로 붙여넣으면, 활동지에 [성찰 기록] 버튼이 나타납니다.
 * 비워 둔 항목은 버튼에서 자동으로 빠집니다.
 */
window.STEAM_REFLECT = {
  preIndividual: "https://docs.google.com/forms/d/e/1FAIpQLSfg1h4c58xe9xd-Bvl9XwyyTbm4sHSu_DSqlxeiksv7sQ3lEw/viewform",     // 활동 전 개인 탐구 준비지
  preTeam: "https://docs.google.com/forms/d/e/1FAIpQLSfpcd81eIRS8qmXywtzZ2OGziE4FvuZthkNuyfeJSO_--lVdg/viewform",          // 활동 전 모둠 계획서
  duringIndividual: "https://docs.google.com/forms/d/e/1FAIpQLScjZAPKMhwi7ogXZnR0zTCXIzgBp-jJ-VKaQyp0Mlu6hqgmRg/viewform", // 활동 중 실행·기록지
  duringTeam: "https://docs.google.com/forms/d/e/1FAIpQLSe9IuqDm_kkY9oZPwEhbqrxCJSwtLOKf03-LgXT8wHD-fl8pw/viewform",       // 활동 중 협업·역할 수행 기록지
  postIndividual: "https://docs.google.com/forms/d/e/1FAIpQLSc0Y32-_mU5VMGw5w0JmN8eZeqGXXgKD07-slksREgX54DyjQ/viewform",  // 활동 후 개인 해석·성찰지
  postTeam: "https://docs.google.com/forms/d/e/1FAIpQLSe52cklsX9reK0FdWGRHb9i_RQqwODzeBJwmhIkjFBEQerWTg/viewform"         // 활동 후 모둠 결과물 정리
};
