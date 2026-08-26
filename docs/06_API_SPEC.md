# 📡 API Specification

## AI 질문

`POST /api/chats`

### Request

```json
{
  "conversationId":"chat-1",
  "region":"BUSAN",
  "language":"ENGLISH",
  "message":"Recommend places near Busan Station."
}
```

### Response (`application/json`)

```json
{
  "conversationId":"chat-1",
  "answer":"감천문화마을을 추천합니다..."
}
```

---

## AI 질문 스트리밍

`POST /api/chats/stream`

Request 본문은 일반 AI 질문과 동일하다.

### Response (`text/event-stream`)

```text
data:감천문화마을을

data: 추천합니다...
```

---

## 새 대화

별도 서버 API를 호출하지 않는다. 프런트엔드에서 새 UUID를 생성하여
`localmate-conversation-id`를 교체하고 화면 상태를 초기화한다.

---

## 예정 API

- `GET /api/tours?region=BUSAN`: 관광지 조회
- `GET /api/foods?region=BUSAN`: 음식 추천
- 일정 저장 및 대화 내역 API
