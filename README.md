# 🩸 血染钟楼 - Agent Auto DM 自动化说书人

<p align="center">
  <img src="frontend/src/assets/demon-head.png" alt="Blood on the Clocktower" width="120" />
</p>

<p align="center">
  <strong>一个基于事件溯源的多人实时社交推理游戏平台</strong>
</p>

<p align="center">
  <a href="#中文文档">中文</a> •
  <a href="#english-documentation">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Go-1.25-00ADD8?style=flat-square&logo=go" alt="Go" />
  <img src="https://img.shields.io/badge/Vue-3.4-4FC08D?style=flat-square&logo=vue.js" alt="Vue 3" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql" alt="MySQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/WebSocket-Realtime-010101?style=flat-square" alt="WebSocket" />
</p>

---

<a name="中文文档"></a>
# 📖 中文文档

## 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [系统架构](#系统架构)
- [功能实现](#功能实现)
  - [后端功能](#后端功能)
  - [前端功能](#前端功能)
- [快速开始](#快速开始)
- [API 文档](#api-文档)
- [开发指南](#开发指南)

## 项目简介

本项目是受《血染钟楼》（Blood on the Clocktower）启发的多人实时社交推理游戏平台，目标是实现一个可以由 AI Agent 担任主持人（DM）的自动化游戏系统。

### 核心特性

- 🎮 **完整游戏逻辑** - 支持暗流涌动剧本的全部角色和能力
- 🔄 **事件溯源架构** - 所有状态变更以事件形式存储，支持回放和重建
- ⚡ **实时通信** - 基于 WebSocket 的毫秒级事件推送
- 🔒 **信息隔离** - 每个玩家只能看到自己被允许看到的信息
- 🤖 **AI 集成就绪** - 为 LLM/Agent 主持人预留了扩展接口

## 技术栈

### 后端 (Go)

| 技术 | 用途 |
|------|------|
| **Go 1.25** | 服务端语言 |
| **Chi** | HTTP 路由框架 |
| **Gorilla WebSocket** | 实时通信 |
| **MySQL 8.0** | 事件持久化存储 |
| **Redis 7** | 缓存层 |
| **zap** | 结构化日志 |
| **OpenTelemetry** | 分布式追踪 |
| **Prometheus** | 指标监控 |
| **JWT** | 身份认证 |

### 前端 (Vue 3)

| 技术 | 用途 |
|------|------|
| **Vue 3** | 前端框架（Composition API）|
| **Vite 5** | 构建工具 |
| **SCSS** | 样式预处理 |
| **WebSocket** | 实时事件接收 |

### 视觉设计

UI 设计参考了开源项目 [bra1n/townsquare](https://github.com/bra1n/townsquare)，融合了其经典的木质令牌视觉风格。

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         客户端层                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Vue 3 Frontend (Vite)                       │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │   │
│  │  │SeatRing │ │RoleCard │ │VotePanel│ │PhaseTimeline│   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────┘   │   │
│  └───────────────────────┬─────────────────────────────────┘   │
│                          │ WebSocket / HTTP                     │
└──────────────────────────┼─────────────────────────────────────┘
                           │
┌──────────────────────────┼─────────────────────────────────────┐
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Go Backend                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │   │
│  │  │ HTTP API │  │ WS Server│  │     Auth (JWT)       │  │   │
│  │  └────┬─────┘  └────┬─────┘  └──────────────────────┘  │   │
│  │       │             │                                    │   │
│  │  ┌────▼─────────────▼────┐                              │   │
│  │  │     Room Manager      │ ← 房间生命周期管理           │   │
│  │  └──────────┬────────────┘                              │   │
│  │             │                                            │   │
│  │  ┌──────────▼────────────┐                              │   │
│  │  │     Room Actor        │ ← 每房间单协程串行处理       │   │
│  │  │  ┌────────────────┐   │                              │   │
│  │  │  │  Game Engine   │   │ ← 确定性游戏规则引擎        │   │
│  │  │  └────────────────┘   │                              │   │
│  │  │  ┌────────────────┐   │                              │   │
│  │  │  │  Projection    │   │ ← 可见性过滤器              │   │
│  │  │  └────────────────┘   │                              │   │
│  │  └──────────┬────────────┘                              │   │
│  │             │                                            │   │
│  │  ┌──────────▼────────────┐                              │   │
│  │  │    Event Store        │ ← 事件持久化 + 快照          │   │
│  │  └──────────────────────┘                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    数据存储层                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐   │
│  │   MySQL 8   │  │   Redis 7   │  │ Prometheus + Grafana │   │
│  └─────────────┘  └─────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 功能实现

### 后端功能

#### ✅ 事件溯源引擎
- 所有状态变更存储为不可变事件
- 每个房间独立的单调递增序列号
- 支持快照以加速状态重建
- 完整的事件回放和取证能力

#### ✅ 房间级顺序一致性
- 每个房间一个 goroutine（RoomActor 模式）
- 所有命令串行处理，避免竞态条件
- 命令幂等性保证（基于 idempotency_key 去重）

#### ✅ 可见性投影
| 事件类型 | 可见范围 |
|----------|----------|
| `public.chat` | 所有房间成员 |
| `whisper.sent` | 发送者、接收者、DM |
| `role.assigned` | 目标玩家、DM |
| `ability.resolved` | 行动者、目标、DM |

#### ✅ 实时通信
- WebSocket 协议支持订阅、命令、心跳
- 断线重连时自动补发遗漏事件（last_seq 机制）
- 令牌桶限流防止滥用

#### ✅ 可观测性
- zap 结构化 JSON 日志
- OpenTelemetry 分布式追踪
- Prometheus 指标（连接数、延迟、去重命中等）

#### ✅ Agent 集成
- Narrator 接口为 AI 主持人预留
- 非权威 `system_hint` 事件类型

### 前端功能

#### ✅ 完整角色系统

**镇民（13 个）**
| 角色 | 能力 |
|------|------|
| 洗衣妇 | 首夜得知两名玩家中有一人是某个村民 |
| 图书管理员 | 首夜得知两名玩家中有一人是某个外来者 |
| 调查员 | 首夜得知两名玩家中有一人是某个爪牙 |
| 厨师 | 首夜得知场上有多少对相邻的邪恶玩家 |
| 共情者 | 每夜得知相邻存活玩家中有多少个邪恶 |
| 占卜师 | 每夜选择两名玩家得知其中是否有恶魔 |
| 送葬者 | 每夜得知当天被处决玩家的角色 |
| 僧侣 | 每夜守护一名玩家免受恶魔伤害 |
| 守鸦人 | 若在夜晚死亡，选择一名玩家得知其角色 |
| 贞洁者 | 首次被村民提名时，该村民立即被处决 |
| 猎手 | 一局游戏中可选择一名玩家，若是恶魔则杀死 |
| 士兵 | 不会被恶魔杀死 |
| 镇长 | 三人存活时若没有被处决则善方胜利 |

**外来者（2 个）**
- 管家：每夜选择一名玩家作为主人，只能在主人投票时投票
- 酒鬼：以为自己是村民但实际中毒，能力无效

**爪牙（4 个）**
- 投毒者：每夜选择一名玩家中毒，能力和信息失效
- 间谍：可以看到所有玩家的角色
- 男爵：场上外来者+2，村民-2
- 红唇女郎：恶魔死亡时可代替成为恶魔

**恶魔（1 个）**
- 小恶魔：每夜杀死一名玩家，自杀可转移给存活的爪牙

#### ✅ 阶段系统
```
夜晚（0）→ 白天（1）→ 投票（2）→ 处刑（3）→ 夜晚...
```

#### ✅ 投票系统
- 提名系统（每人每天限一次）
- 座位顺序轮流投票
- 鬼魂投票（一次性使用）
- 管家投票限制
- 过半数处刑判定

#### ✅ UI 视觉
- Townsquare 风格的圆形座位布局
- 木质令牌纹理
- 阵营颜色区分（蓝/青/橙/红）
- 夜晚/白天氛围切换
- 死亡遮罩和鬼魂状态

## 快速开始

### 前置要求

- Docker & Docker Compose
- Go 1.25+
- Node.js 18+

### 1. 启动基础设施

```bash
cd backend
docker-compose up -d
```

### 2. 启动后端

```bash
cd backend
make build
./bin/agentdm
```

后端启动在 `http://localhost:8080`

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端启动在 `http://localhost:5173`

## API 文档

### 认证

```bash
# 注册
curl -X POST http://localhost:8080/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}'

# 登录
curl -X POST http://localhost:8080/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}'
```

### 房间操作

```bash
# 创建房间
curl -X POST http://localhost:8080/v1/rooms \
  -H "Authorization: Bearer <token>"

# 加入房间
curl -X POST http://localhost:8080/v1/rooms/{room_id}/join \
  -H "Authorization: Bearer <token>"

# 获取事件
curl http://localhost:8080/v1/rooms/{room_id}/events?after_seq=0 \
  -H "Authorization: Bearer <token>"
```

### WebSocket 协议

连接：`ws://localhost:8080/ws?token=<jwt_token>`

```json
// 订阅房间
{"type": "subscribe", "request_id": "1", "payload": {"room_id": "xxx", "last_seq": 0}}

// 发送命令
{"type": "command", "request_id": "2", "payload": {"command_id": "xxx", "type": "public_chat", "data": {"message": "Hello"}}}
```

## 开发指南

```bash
# 后端测试
cd backend && go test ./...

# 后端构建
cd backend && make build

# 前端开发
cd frontend && npm run dev

# 前端构建
cd frontend && npm run build
```

---

<a name="english-documentation"></a>
# 📖 English Documentation

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
  - [Backend Features](#backend-features)
  - [Frontend Features](#frontend-features)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Development](#development)

## Overview

This project is a multiplayer real-time social deduction game platform inspired by Blood on the Clocktower. The goal is to build an automated game system where an AI Agent can act as the Storyteller (DM).

### Key Features

- 🎮 **Complete Game Logic** - Full role and ability support for Trouble Brewing script
- 🔄 **Event Sourcing** - All state changes stored as events, enabling replay and reconstruction
- ⚡ **Real-time Communication** - Millisecond-level event push via WebSocket
- 🔒 **Information Isolation** - Each player only sees what they're allowed to see
- 🤖 **AI-Ready** - Extension interfaces reserved for LLM/Agent storyteller

## Tech Stack

### Backend (Go)

| Technology | Purpose |
|------------|---------|
| **Go 1.25** | Server language |
| **Chi** | HTTP routing framework |
| **Gorilla WebSocket** | Real-time communication |
| **MySQL 8.0** | Event persistence |
| **Redis 7** | Caching layer |
| **zap** | Structured logging |
| **OpenTelemetry** | Distributed tracing |
| **Prometheus** | Metrics monitoring |
| **JWT** | Authentication |

### Frontend (Vue 3)

| Technology | Purpose |
|------------|---------|
| **Vue 3** | Frontend framework (Composition API) |
| **Vite 5** | Build tool |
| **SCSS** | Style preprocessing |
| **WebSocket** | Real-time event receiving |

### Visual Design

UI design is inspired by the open-source project [bra1n/townsquare](https://github.com/bra1n/townsquare), incorporating its classic wooden token visual style.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Vue 3 Frontend (Vite)                       │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │   │
│  │  │SeatRing │ │RoleCard │ │VotePanel│ │PhaseTimeline│   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────┘   │   │
│  └───────────────────────┬─────────────────────────────────┘   │
│                          │ WebSocket / HTTP                     │
└──────────────────────────┼─────────────────────────────────────┘
                           │
┌──────────────────────────┼─────────────────────────────────────┐
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Go Backend                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │   │
│  │  │ HTTP API │  │ WS Server│  │     Auth (JWT)       │  │   │
│  │  └────┬─────┘  └────┬─────┘  └──────────────────────┘  │   │
│  │       │             │                                    │   │
│  │  ┌────▼─────────────▼────┐                              │   │
│  │  │     Room Manager      │ ← Room lifecycle management  │   │
│  │  └──────────┬────────────┘                              │   │
│  │             │                                            │   │
│  │  ┌──────────▼────────────┐                              │   │
│  │  │     Room Actor        │ ← Single goroutine per room  │   │
│  │  │  ┌────────────────┐   │                              │   │
│  │  │  │  Game Engine   │   │ ← Deterministic game rules   │   │
│  │  │  └────────────────┘   │                              │   │
│  │  │  ┌────────────────┐   │                              │   │
│  │  │  │  Projection    │   │ ← Visibility filter          │   │
│  │  │  └────────────────┘   │                              │   │
│  │  └──────────┬────────────┘                              │   │
│  │             │                                            │   │
│  │  ┌──────────▼────────────┐                              │   │
│  │  │    Event Store        │ ← Event persistence + snapshot│  │
│  │  └──────────────────────┘                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    Data Storage Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐   │
│  │   MySQL 8   │  │   Redis 7   │  │ Prometheus + Grafana │   │
│  └─────────────┘  └─────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### Backend Features

#### ✅ Event Sourcing Engine
- All state changes stored as immutable events
- Per-room monotonic sequence numbers
- Snapshot support for faster state reconstruction
- Full event replay and forensics capability

#### ✅ Per-Room Sequential Consistency
- One goroutine per room (RoomActor pattern)
- Serial command processing, no race conditions
- Command idempotency (deduplication via idempotency_key)

#### ✅ Visibility Projection
| Event Type | Visibility |
|------------|------------|
| `public.chat` | All room members |
| `whisper.sent` | Sender, recipient, DM |
| `role.assigned` | Target player, DM |
| `ability.resolved` | Actor, target, DM |

#### ✅ Real-time Communication
- WebSocket protocol with subscribe, command, ping
- Automatic event catch-up on reconnect (last_seq mechanism)
- Token bucket rate limiting

#### ✅ Observability
- zap structured JSON logging
- OpenTelemetry distributed tracing
- Prometheus metrics (connections, latency, dedup hits)

#### ✅ Agent Integration
- Narrator interface reserved for AI storyteller
- Non-authoritative `system_hint` event type

### Frontend Features

#### ✅ Complete Role System

**Townsfolk (13 roles)**: Washerwoman, Librarian, Investigator, Chef, Empath, Fortune Teller, Undertaker, Monk, Ravenkeeper, Virgin, Slayer, Soldier, Mayor

**Outsiders (2 roles)**: Butler, Drunk

**Minions (4 roles)**: Poisoner, Spy, Baron, Scarlet Woman

**Demon (1 role)**: Imp

#### ✅ Phase System
```
Night (0) → Day (1) → Vote (2) → Execution (3) → Night...
```

#### ✅ Voting System
- Nomination system (one per player per day)
- Sequential voting by seat order
- Ghost votes (one-time use)
- Butler voting restriction
- Majority execution determination

#### ✅ UI Visuals
- Townsquare-style circular seat layout
- Wooden token textures
- Team color differentiation (blue/cyan/orange/red)
- Night/day atmosphere switching
- Death shroud and ghost status

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Go 1.25+
- Node.js 18+

### 1. Start Infrastructure

```bash
cd backend
docker-compose up -d
```

### 2. Start Backend

```bash
cd backend
make build
./bin/agentdm
```

Backend runs at `http://localhost:8080`

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## API Reference

### Authentication

```bash
# Register
curl -X POST http://localhost:8080/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}'

# Login
curl -X POST http://localhost:8080/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}'
```

### Room Operations

```bash
# Create room
curl -X POST http://localhost:8080/v1/rooms \
  -H "Authorization: Bearer <token>"

# Join room
curl -X POST http://localhost:8080/v1/rooms/{room_id}/join \
  -H "Authorization: Bearer <token>"

# Fetch events
curl http://localhost:8080/v1/rooms/{room_id}/events?after_seq=0 \
  -H "Authorization: Bearer <token>"
```

### WebSocket Protocol

Connect: `ws://localhost:8080/ws?token=<jwt_token>`

```json
// Subscribe to room
{"type": "subscribe", "request_id": "1", "payload": {"room_id": "xxx", "last_seq": 0}}

// Send command
{"type": "command", "request_id": "2", "payload": {"command_id": "xxx", "type": "public_chat", "data": {"message": "Hello"}}}
```

## Development

```bash
# Backend tests
cd backend && go test ./...

# Backend build
cd backend && make build

# Frontend dev
cd frontend && npm run dev

# Frontend build
cd frontend && npm run build
```

---

## License

MIT License

## Credits

- UI design inspired by [bra1n/townsquare](https://github.com/bra1n/townsquare)
- Game rules based on [Blood on the Clocktower](https://bloodontheclocktower.com/)
