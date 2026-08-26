# 🛠 Trouble Shooting

## Streaming이 한 번에 출력되는 문제

### 원인

Flux를 일반 Response처럼 처리하였다.

### 해결

ReadableStream으로 chunk를 읽도록 수정하였다.

---

## ChatMemory가 초기화되는 문제

### 원인

conversationId를 매 요청마다 새로 생성하였다.

### 해결

기존 conversationId를 유지하도록 수정하였다.

---

## Gemini API Key 오류

### 원인

백엔드 프로세스가 변경 전 환경변수의 유효하지 않은 API Key를 사용하여
Google Gemini API가 `API_KEY_INVALID`를 반환하였다.

### 해결

`.bashrc`의 `GOOGLE_API_KEY`를 확인하고 Google API에 직접 인증 요청하여
현재 키가 유효함을 검증하였다. Gradle daemon과 백엔드를 완전히 종료한 뒤
새 환경변수로 재실행하였다.

---

## PDF 페이지 경계에서 글자가 잘리는 문제

### 원인

html2pdf.js가 HTML을 캔버스로 변환한 뒤 페이지 높이 기준으로 분할하면서
문단과 목록의 한 줄이 페이지 사이에서 잘렸다.

### 해결

문단, 목록, 제목, 표, 표 행, 인용문, 코드 블록에 페이지 내부 분할 방지
규칙을 적용하고, 폰트 로딩이 완료된 후 PDF를 생성하도록 수정하였다.

---

## PDF 오른쪽 내용이 출력 영역을 벗어나는 문제

### 원인

PDF 원본 요소의 폭이 고정되어 html2pdf.js가 만든 A4 내부 출력 폭보다
커졌고, 긴 표 셀과 일반 문장이 오른쪽 여백 밖으로 밀렸다.

### 해결

PDF 문서와 본문의 최대 폭을 출력 영역의 100%로 제한하였다. 표에는 고정
레이아웃과 셀 내부 줄바꿈을 적용하고, 일반 문단과 목록에도 자동 줄바꿈을
적용하였다.

---

## Tool Calling

관광 데이터 기반 Tool Calling은 아직 구현 전이며 다음 개발 단계에서
TourSpotTool부터 추가할 예정이다.
