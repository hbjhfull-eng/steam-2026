# 2026 STEAM 융합수업 — 모집·활동 사이트

2026학년도 2학기 야간 과제탐구반 **STEAM 융합수업**의 학생 모집 허브와 주제별 소개·활동지입니다.
프로그램 하나 아래 **4개 주제**가 있고, 신청은 리로스쿨에서 일괄 접수합니다.

* 정적 HTML — 빌드 과정 없음
* 외부 의존성은 활동지의 Google Fonts CDN 하나뿐 (오프라인이면 시스템 글꼴로 대체)
* 학생 입력은 **각자 기기 브라우저(localStorage)** 에만 저장 — 서버·수집 없음
* 다크 모드 · 모바일 대응 · 인쇄(PDF) 최적화

---

## 저장소 구조

```
steam-2026/                         (GitHub 저장소 이름 예시)
├─ index.html                       프로그램 허브 — 소개 + 4개 주제 + 신청 안내(리로스쿨) + FAQ
├─ favicon.svg  .nojekyll  .gitignore  LICENSE  README.md
│
├─ conductivity-neutralization/      주제 1 — 전기 전도도로 읽는 중화 반응
│   ├─ index.html                    주제 소개
│   └─ activity.html                 4차시 학생 활동지
│
├─ incline-motion/                   주제 2 — PASCO·Tracker로 읽는 빗면 운동, 미적분의 첫걸음
│   ├─ index.html
│   └─ activity.html
│
└─ climate-modeling/                 주제 3 — Sage Modeler와 빅데이터로 읽는 기후변화
    ├─ index.html
    └─ activity.html

  (주제 4 는 확정 시 topic-4/ 형태로 추가)
```

배포 후 주소 (`<사용자명>` = GitHub 사용자명):

```
https://<사용자명>.github.io/steam-2026/                              프로그램 허브
https://<사용자명>.github.io/steam-2026/conductivity-neutralization/   주제 1 소개
https://<사용자명>.github.io/steam-2026/conductivity-neutralization/activity.html
https://<사용자명>.github.io/steam-2026/incline-motion/                주제 2 소개
https://<사용자명>.github.io/steam-2026/incline-motion/activity.html
https://<사용자명>.github.io/steam-2026/climate-modeling/              주제 3 소개
https://<사용자명>.github.io/steam-2026/climate-modeling/activity.html
```

---

## 공개 전에 채워야 할 항목

주황색 점선(`〔  〕`)으로 표시됩니다. 각 파일 상단 주석에도 목록이 있습니다.

**`index.html` (허브) — 공통 정보 · 신청**

| 표시 | 예시 |
|---|---|
| `〔학교명〕` | 한일여자고등학교 |
| `〔운영 기간〕` | 2026. 9. ~ 12. |
| `〔운영 요일·시간〕` | 매주 화요일 18:00–21:30 |
| `〔장소〕` | 창의융합실 1·2, 과학실 |
| `〔정원〕` | 주제별 4명 (총 16명) |
| `〔신청 기간〕` | 2026. 8. 25.(월) ~ 8. 29.(금) 17:00 |
| `〔O월 중〕` | 8월 |
| `〔담당 교사〕` | ○○○ · ○○○ · ○○○ · ○○○ |
| `〔문의〕` | 과학실 / 내선 000 |

**`conductivity-neutralization/index.html`, `incline-motion/index.html`, `climate-modeling/index.html` (주제 소개)** — `〔담당 교사〕` `〔장소〕` 만.

### 신청 접수 (리로스쿨)

- 접수는 **리로스쿨에서 4개 주제를 함께 안내하며 일괄 진행**합니다.
- 기본 상태는 허브 `index.html` 의 `id="apply"` 섹션 **"신청 준비 중"** 배지입니다.
- 접수를 시작하면 그 섹션에서
  1. `<span class="cta-big disabled">신청 준비 중</span>` 과 바로 아래 `<p class="soon-note">…</p>` 삭제
  2. 그 아래 주석 처리된 `<a class="cta-big" href="리로스쿨_신청_페이지_URL">` 의 주석을 풀고 `href` 에 리로스쿨 신청 페이지 주소 입력

### 주제 4 추가

1. `index.html` 의 `topics` 안 남은 `<article class="topic-card soon">` 를 실제 내용으로 채우고 `.soon` 클래스 제거
2. 하위 폴더(`topic-4/` 등)에 `index.html`(소개)·`activity.html`(활동지) 추가 — 주제 1·2·3 파일을 복제해 내용만 교체
3. 카드의 `href` 를 새 폴더로 연결

---

## GitHub Pages 배포

### 1. 저장소 만들기
GitHub에서 새 저장소 생성 (이름 예: `steam-2026`). README·라이선스 체크 안 함.

### 2. 올리기

```bash
cd "steam-2026"          # 이 폴더 (웹(steam-2026))
git push -u origin main  # 원격은 이미 https://github.com/JIN/steam-2026.git 로 설정됨
```
> 웹 업로드 시 `.nojekyll` 이 누락되면 **Create new file** 로 파일명에 `.nojekyll` 만 입력해 빈 파일로 커밋.
> 이 폴더는 Google Drive 안에 있으므로, **Drive 동기화가 멈춘 것을 확인한 뒤** 커밋·푸시하세요.

### 3. Pages 켜기
**Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)` → Save**. 1~2분 뒤 게시.

### 4. 업데이트
파일 수정 → 커밋/푸시(또는 GitHub 웹 편집) → 1분 내 반영.

---

## 사용 흐름

**모집** — 허브 `index.html` 의 `〔 〕` 채우기 → 배포 주소(`…/steam-2026/`)를 QR·가정통신문·리로스쿨 공지에 안내 →
학생은 페이지에서 4개 주제를 확인하고 리로스쿨에서 희망 주제 1·2순위로 지원 → 접수 시작 시 `id="apply"` 를 링크 버튼으로 교체.

**수업** — 각 주제의 `activity.html` 주소를 공유 → 학생은 각자 기기에서 학번·이름·모둠 입력 →
차시별로 빈칸·표·체크리스트 작성(자동 저장) → 제출은 **[답안 복사]** 또는 **[인쇄·PDF]**.

> localStorage 저장이라 **다른 기기·시크릿창·데이터 삭제 시 사라집니다.** 기기가 바뀌면 그때그때 [답안 복사]로 보관하도록 안내하세요.

---

## 주제별 4차시 구성

**주제 1 · 전기 전도도로 읽는 중화 반응** (통합과학·정보·공통수학)

| 차시 | 내용 |
|---|---|
| 1 | 중화 반응·알짜 이온 반응식, 자바실험실로 이온 수 변화표 |
| 2 | 마이크로비트 전기 전도도 측정기 배선·알고리즘 설계·MakeCode 코딩 |
| 3 | 산·염기 첨가하며 전도도 측정, 스프레드시트 그래프, V자·중화점 해석 |
| 4 | 지오지브라로 절댓값 함수 `y=a\|x−p\|+q` 모델링·예측 |

성취기준: `[10통과2-01-03]` `[10통과2-01-04]` `[12정03-07]`

**주제 2 · PASCO·Tracker로 읽는 빗면 운동, 미적분의 첫걸음** (통합과학·정보·공통수학)

| 차시 | 내용 |
|---|---|
| 1 | 빗면 운동 이해(`a=g·sinθ`), PASCO + 영상 이중 측정 설계 |
| 2 | PASCO 데이터 수집, Tracker 좌표축·척도 보정·점 추적, 두 데이터 정리 |
| 3 | 기울기로 속도·가속도(미분의 첫걸음), 센서·영상·이론 비교 |
| 4 | 넓이로 변위·속도 변화(적분의 첫걸음), 종합 비교·오차 분석·결론 |

참고 데이터는 θ=10°(`a≈1.70 m/s²`) 이론값. `activity.html` 표의 `class="fixed"` 셀에서 바꿀 수 있습니다.

**주제 3 · Sage Modeler와 빅데이터로 읽는 기후변화** (통합과학·정보·공통수학)

| 차시 | 내용 |
|---|---|
| 1 | 온실효과 원리, 6대 온실가스·복사강제력 조사, 배출량 그래프 해석 |
| 2 | Sage Modeler로 온실가스–기후 변수의 인과관계 시스템 모델링·시뮬레이션 |
| 3 | 기상청 빅데이터(CSV) 수집·전처리, 연도별 관측값을 모눈에 직접 플로팅 |
| 4 | 추세선(최소제곱 회귀)으로 변화율 산출, 모델 vs 실측 비교, 기후 행동 제안 |

성취기준: `[10통과2-02-03]` `[12정02-09]` `[12정02-04]`

---

## 커스터마이즈

* **색상·글꼴**: 각 파일 `<style>` 안 `:root` 의 CSS 변수 (허브·주제1은 teal, 주제2는 blue, 주제3은 amber 계열)
* **활동지 참고값**: `activity.html` 표의 `class="fixed"` 셀
* **활동지 저장 키 초기화**: 브라우저 콘솔 —
  주제1 `localStorage.removeItem('ddr-jungwha-v1')`,
  주제2 `localStorage.removeItem('steam-incline-v1')` (그래프는 `steam-incline-plot-xt` / `-vt` / `-at` 별도),
  주제3 `localStorage.removeItem('steam-climate-v1')` (그래프는 `steam-climate-plot-main` 별도)
* **주제2 그래프 위젯**: `incline-motion/activity.html` 3·4차시. 시간축은 0.05 s 눈금 고정,
  그래프별 y축은 `<div class="plot" data-ymax data-ystep data-ylabelstep …>` 속성에서 조정.
  학생은 모눈 클릭 → **완료**(선 잇기) / **되돌리기** / **초기화** / **이론값 곡선 보기·숨기기**
* **주제3 그래프 위젯**: `climate-modeling/activity.html` 3차시(플로팅)·4차시(추세선)가 같은 데이터를 공유합니다.
  학생이 페이지 안의 **연도 범위·세로축 항목·범위** 입력칸에 실제 데이터에 맞는 값을 넣고 **[축 적용]**을 누른 뒤 점을 찍습니다.
  **[추세선 보기]** 는 고정 공식이 아니라 학생이 찍은 점으로 **최소제곱 회귀**를 계산해 기울기(연간 변화율)를 보여줍니다.

---

## 출처 및 라이선스

* 원 자료: 한국과학창의재단(KOFAC) 2022 개정 교육과정 융합교육(STEAM) 교재·지도서
  (주제 1 — 「융합9. 디지털로 읽는 산과 염기의 중화 반응」, 주제 3 — 「융합11. 온실효과 강화로 인한 지구온난화(기후변화) 이해하기」 등)
* 이 사이트: 위 자료를 4차시 수업용으로 재구성한 2차 저작물
* 라이선스: [CC BY-NC-SA 4.0](LICENSE) — 출처 표시 · 비영리 · 동일조건 변경 허락
