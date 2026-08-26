# 🤖 AI Tool Design

# Overview

> 구현 상태: 이 문서는 향후 Tool Calling 설계안이다. 현재 코드에는 아래
> Tool이 등록되어 있지 않으며 TourSpotTool부터 순차적으로 구현할 예정이다.

LocalMate AI는

Spring AI Tool Calling을 활용하여

LLM이 필요한 데이터를 직접 조회하도록 설계한다.

---

# Tool List

| Tool | 역할 |
|------|------|
| TourSpotTool | 관광지 조회 |
| FoodTool | 음식 추천 |
| TransportTool | 교통 안내 |
| EmergencyTool | 긴급상황 안내 |
| CultureTool | 문화 안내 |

---

# TourSpotTool

## 목적

관광지 정보를 조회한다.

### 입력

```json
{
"city":"Busan",
"keyword":"beach"
}
```

### 출력

```json
{
"name":"해운대",
"description":"부산 대표 해변"
}
```

---

# FoodTool

## 목적

음식 추천

### 입력

```json
{
"city":"Busan",
"food":"pork"
}
```

### 출력

```json
{
"restaurant":"쌍둥이돼지국밥"
}
```

---

# TransportTool

## 목적

이동 방법 안내

예)

부산역

↓

감천문화마을

↓

버스

↓

소요시간

↓

환승

---

# EmergencyTool

## 목적

응급상황

예)

여권 분실

↓

가까운 경찰서

↓

영사관

↓

전화번호

---

# CultureTool

## 목적

문화 설명

예)

절에서는

신발을 벗나요?

↓

AI 답변

---

# Tool Calling Flow

```text
Question

↓

Spring AI

↓

Tool Selection

↓

Database

↓

Tool Result

↓

LLM

↓

Streaming Response
```

---

# Tool Selection Rule

관광

↓

TourSpotTool

음식

↓

FoodTool

교통

↓

TransportTool

문화

↓

CultureTool

응급상황

↓

EmergencyTool

---

# Future Tool

Version2

HotelTool

ShoppingTool

FestivalTool

WeatherTool

MapTool

TranslationTool
