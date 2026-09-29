/* 세특 근거용 성찰 폼 링크 설정
 * apps-script/FormBuilder.gs 실행 후 나온 스프레드시트의 "학생에게 나눠줄 링크" 값을
 * 아래 6개 칸에 그대로 붙여넣으면, 활동지에 [성찰 기록] 버튼이 나타납니다.
 * 비워 둔 항목은 버튼에서 자동으로 빠집니다.
 */
window.STEAM_REFLECT = {
  preIndividual: "https://docs.google.com/forms/d/e/1FAIpQLScNtiOz7xrcO_NultLdx0c7THYG7pD_4MUOaegbyCXeJ479SA/viewform",   // 활동 전 개인 탐구 준비지
  preTeam: "https://docs.google.com/forms/d/e/1FAIpQLSdW_UyioAlttJtQ3AzSiYqSQw_IUsaiNVMF4X_zj-IVnQnrCQ/viewform",         // 활동 전 모둠 계획서
  duringIndividual: "https://docs.google.com/forms/d/e/1FAIpQLSdj8xCA56cGP1_jw4mV1JM5SfLgkavMdCULfTwPwOIqlwrmsg/viewform",// 활동 중 실행·기록지
  duringTeam: "https://docs.google.com/forms/d/e/1FAIpQLSd7-TLTh2sicnPh5iuP9OyiORuR_bpjOUkqbQdw_kD94QuYEg/viewform",      // 활동 중 협업·역할 수행 기록지
  postIndividual: "https://docs.google.com/forms/d/e/1FAIpQLSdRSnkYugY5S8wG1IlcAO0lyl04adAeydRT9DnHFuAqzWUMew/viewform",  // 활동 후 개인 해석·성찰지
  postTeam: "https://docs.google.com/forms/d/e/1FAIpQLSc3fvy6f8VPeGsWPtsd1AZP900vJJTXo3EHrgkR0CvYBzOlbw/viewform"        // 활동 후 모둠 결과물 정리
};
