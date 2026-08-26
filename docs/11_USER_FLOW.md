# 🧭 11_USER_FLOW.md

# User Flow

## 서비스 목적

외국인 관광객이 여러 앱을 오가지 않고,
하나의 AI 서비스에서 필요한 관광 정보를 얻을 수 있도록 한다.

---

# User Journey

```text
서비스 접속

↓

지역 선택
(Busan / Gyeongju)

↓

답변 언어 선택

↓

질문 입력

↓

선택 지역·언어를 포함한 Prompt 생성

↓

LLM 응답 생성

↓

Streaming 출력

↓

Chat Memory 저장

↓

여행 코스 마커 감지

↓

코스 PDF 다운로드 제공

↓

후속 질문

↓

이전 대화 기반 응답
```

---

# 사용자 흐름

## 1. 지역 선택

사용자는

- Busan
- Gyeongju

중 하나를 선택한다.

↓

AI는 해당 지역을 기준으로 답변한다.

---

## 2. 질문 입력

예시

> I want to visit Busan for 2 days.

↓

Spring AI

↓

Prompt 생성

---

## 3. Streaming

백엔드는 Gemini 응답을 SSE로 전송한다.

프런트엔드는 ReadableStream을 읽어 AI 메시지에 순차적으로 추가한다.

---

## 4. Chat Memory

사용자가

> Which one is closest?

라고 질문하면 이전 추천 내용을 conversationId 기반으로 기억한다.

---

## 5. 여행 코스 PDF

AI 응답에 `COURSE_START`와 `COURSE_END` 마커가 모두 존재하면
`여행 코스 PDF` 버튼을 표시한다.

PDF에는 일반 대화가 아니라 마커 내부의 코스 내용만 포함한다.

---

## 6. Tool Calling (예정)

관광지, 음식, 교통 관련 질문에 데이터베이스 조회 Tool을 호출하는 흐름은
다음 구현 단계에 추가한다.

---

# 종료

새 대화를 누르면

conversationId를 새로 생성한다.

진행 중인 스트림을 취소하고 메시지 화면을 초기화한다.
