# 🗄 Database Design

# Database Overview

> 구현 상태: 현재 PostgreSQL은 Spring AI JDBC ChatMemory 저장소에 사용한다.
> 아래 CITY, TOUR_SPOT, FOOD, EMERGENCY 등 관광 도메인 테이블은 향후
> Tool Calling 구현을 위한 설계이며 아직 애플리케이션 코드에 구현되지 않았다.

LocalMate AI는

도시별 관광 정보를 관리하고,

사용자와 AI의 대화를 저장하기 위한 구조를 가진다.

---

# ERD

```mermaid
erDiagram

CITY ||--o{ TOUR_SPOT : contains
CITY ||--o{ FOOD : contains
CITY ||--o{ EMERGENCY : contains

CONVERSATION ||--o{ CHAT_MESSAGE : contains

CITY {

BIGINT city_id PK

VARCHAR city_name

VARCHAR country

}

TOUR_SPOT{

BIGINT tour_id PK

BIGINT city_id FK

VARCHAR name

VARCHAR category

TEXT description

VARCHAR address

VARCHAR transportation

VARCHAR opening_hours

VARCHAR image_url

}

FOOD{

BIGINT food_id PK

BIGINT city_id FK

VARCHAR restaurant

VARCHAR menu

TEXT description

VARCHAR address

}

EMERGENCY{

BIGINT emergency_id PK

BIGINT city_id FK

VARCHAR type

VARCHAR name

VARCHAR address

VARCHAR phone

}

CONVERSATION{

VARCHAR conversation_id PK

VARCHAR city

VARCHAR language

TIMESTAMP created_at

}

CHAT_MESSAGE{

BIGINT id PK

VARCHAR conversation_id FK

VARCHAR role

TEXT message

TIMESTAMP created_at

}
```

---

# CITY

도시 관리

예)

- Busan

- Gyeongju

- Seoul

- Jeju

---

# TOUR_SPOT

관광지

예)

감천문화마을

불국사

첨성대

해운대

---

# FOOD

음식

예)

돼지국밥

밀면

한정식

---

# EMERGENCY

긴급상황

예)

병원

경찰서

영사관

약국

---

# CHAT_MESSAGE

ChatMemory 저장

role

- user

- assistant

---

# 확장 계획

Version2

서울

↓

Version3

제주

↓

Version4

전국

도시는

CITY 테이블만 추가하면 된다.
