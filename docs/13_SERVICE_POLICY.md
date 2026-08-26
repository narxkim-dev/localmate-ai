# 📜 13_SERVICE_POLICY.md

# Service Policy

## 서비스 목적

외국인 관광객에게

정확하고 이해하기 쉬운 관광 정보를 제공한다.

---

# 지원 지역

MVP

- Busan
- Gyeongju

향후

- Seoul
- Jeju
- Gangneung
- Jeonju

확장 예정

---

# 지원 언어

- Korean
- English
- Japanese
- Chinese

---

# 응답 정책

AI는

다음을 우선한다.

1. 정확성

2. 이해하기 쉬운 설명

3. 친절한 표현

4. 안전한 답변

---

# 데이터 정책

현재 MVP는 Gemini 응답과 시스템 프롬프트의 정확성 규칙을 사용한다.
대화 기억 데이터는 conversationId 기반 JDBC ChatMemory에 저장한다.

관광지·음식 도메인 데이터와 Tool Calling은 아직 구현 전이다.

향후

- 관광공사 Open API
- 공공데이터 API
- 직접 검수한 지역 관광 데이터

를 연동한다.

---

# 개인정보 정책

서비스는

사용자의 개인정보를 저장하지 않는다.

Chat Memory는

대화 품질 향상을 위해

conversationId 기반으로만 관리한다.

---

# 예외 처리

관광 정보가 존재하지 않으면

다음과 같이 응답한다.

> 현재 해당 정보를 확인할 수 없습니다.

또는

> 다른 관광지를 추천해드릴까요?

---

# 향후 정책

향후에는

- RAG
- 실시간 관광 API
- 지도 API
- 음성 대화

를 추가하여

서비스를 확장한다.

---

# LocalMate AI Vision

One Question.

One AI.

Everything You Need for Local Travel.

---

# Mission

외국인 관광객이

언어와 정보의 장벽 없이

대한민국을 더욱 쉽고 즐겁게 여행할 수 있도록 지원한다.
