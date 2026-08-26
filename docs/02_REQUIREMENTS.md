# 📋 Requirements Specification

# 프로젝트

LocalMate AI

---

# 기능 요구사항 (Functional Requirements)

| ID | 기능 | 설명 | 우선순위 | 상태 |
|----|------|------|----------|------|
| FR-01 | 지역 선택 | 부산 / 경주 선택 | Must | 완료 |
| FR-02 | 질문 입력 | 자연어 질문 | Must | 완료 |
| FR-03 | AI 응답 | Spring AI 답변 | Must | 완료 |
| FR-04 | Streaming | SSE 실시간 출력 | Must | 완료 |
| FR-05 | Chat Memory | conversationId 기반 이전 대화 기억 | Must | 완료 |
| FR-06 | 다국어 응답 | KOREAN / ENGLISH / JAPANESE / CHINESE | Must | 완료 |
| FR-07 | 관광지 조회 | Tool Calling | Should | 예정 |
| FR-08 | 음식 추천 | Tool Calling | Should | 예정 |
| FR-09 | 일정 추천 | 상세 여행 코스 생성 | Could | 완료 |
| FR-10 | 새 대화 | 새 conversationId 발급 및 화면 초기화 | Must | 완료 |
| FR-11 | Markdown 출력 | 표·제목·목록을 안전한 HTML로 렌더링 | Should | 완료 |
| FR-12 | 코스 PDF | 일정 답변의 코스 구간만 A4 PDF로 저장 | Could | 완료 |

---

# 비기능 요구사항

- 응답시간 5초 이내: 지속 측정 필요
- API Key 외부 관리: 환경변수 적용 완료
- 모바일 화면 지원: 반응형 UI 적용 완료
- 예외 처리 제공: HTTP·스트리밍 오류 메시지 적용 완료
- Logging 적용: Spring 기본 로깅 적용
- AI 응답 HTML 정제: DOMPurify 적용 완료
- PDF 가독성: 페이지 분할 및 본문·표 넘침 방지 적용 완료

---

# 사용자 요구사항

외국인 관광객은

- 관광지를 추천받고 싶다.
- 이동 방법을 알고 싶다.
- 음식 주문을 쉽게 하고 싶다.
- 한국 문화를 알고 싶다.
