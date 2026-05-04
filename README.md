# 🩸 血染钟楼 - Agent Auto DM 自动化说书人

<p align="center">
  <img src="frontend/src/assets/demon-head.png" alt="Blood on the Clocktower" width="120" />
</p>

<p align="center">
  <strong>一个由 AI Agent 担任说书人的多人实时社交推理游戏平台</strong>
</p>

<p align="center">
  <a href="#中文文档">中文</a> •
  <a href="#english-documentation">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat-square&logo=go" alt="Go" />
  <img src="https://img.shields.io/badge/Vue-2.6-4FC08D?style=flat-square&logo=vue.js" alt="Vue 2" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql" alt="MySQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/RabbitMQ-3.12-FF6600?style=flat-square&logo=rabbitmq" alt="RabbitMQ" />
  <img src="https://img.shields.io/badge/Qdrant-Vector_DB-24B6A5?style=flat-square" alt="Qdrant" />
</p>

---

<a name="中文文档"></a>
# 📖 中文文档

## 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [系统架构](#系统架构)
- [技术亮点](#技术亮点)
- [业务功能](#业务功能)
- [快速开始](#快速开始)
- [压测体系](#压测体系)
- [API 文档](#api-文档)
- [开发指南](#开发指南)

## 项目简介

本项目是一个辅助《血染钟楼》线下桌游的自动化系统，可以**完全替代人类说书人**进行游戏流程推进、规则判定、信息分发和复盘总结。

### 核心场景

- 🎮 **线下聚会**：玩家面对面围坐，各自通过手机参与游戏
- 📱 **免登录极速开局**：无需注册账号，房主创建房间后分享房间号即可
- 🤖 **AI Auto DM**：多 Agent 协作系统自动处理所有游戏逻辑

### 设计目标

| 目标 | 描述 |
|------|------|
| **零人工干预** | AI Agent 完全接管说书人职责，无需人类主持 |
| **极致开局速度** | 创建房间→入座→开始游戏，全程 < 2 分钟 |
| **严格信息隔离** | 每个玩家只能看到自己被允许看到的信息 |
| **断线可恢复** | 事件溯源架构支持任意时刻断线重连 |

## 技术栈

### 后端 (Go)

| 技术 | 用途 |
|------|------|
| **Go 1.25+** | 服务端语言 |
| **Chi** | HTTP 路由框架 |
| **Gorilla WebSocket** | 实时双向通信 |
| **MySQL 8.0** | 事件持久化存储 |
| **Redis 7** | 状态缓存、会话管理 |
| **RabbitMQ 3.12** | 异步任务队列（Agent 调用） |
| **Qdrant** | 向量数据库（RAG 语义检索） |
| **zap** | 结构化日志 |
| **OpenTelemetry** | 分布式追踪 |
| **Prometheus** | 指标监控 |

### 前端 (Vue 2)

| 技术 | 用途 |
|------|------|
| **Vue 2.6** | 前端框架 |
| **Vue CLI 5.0** | 构建工具 |
| **Vuex 3.6** | 状态管理 |
| **SCSS** | 样式预处理 |
| **FontAwesome 5** | 图标库 |
| **WebSocket** | 实时事件接收 |

### 视觉设计

UI 设计参考了开源项目 [bra1n/townsquare](https://github.com/bra1n/townsquare)，融合了其经典的木质令牌视觉风格。

## 系统架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              客户端层                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Vue 2 + Vue CLI + Vuex                          │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐   │  │
│  │  │TownSquare│ │  Player  │ │   Vote   │ │    Modal System    │   │  │
│  │  │ (座位圈) │ │ (令牌)   │ │ (投票)   │ │(角色/版本/提醒等)   │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │ WebSocket / HTTP                          │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────────┐
│                              ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                         Go Backend                                 │  │
│  │                                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │                    API Gateway Layer                         │  │  │
│  │  │  ┌───────────┐  ┌───────────┐  ┌─────────────────────────┐  │  │  │
│  │  │  │  HTTP API │  │ WebSocket │  │      Auth (JWT)         │  │  │  │
│  │  │  └─────┬─────┘  └─────┬─────┘  └─────────────────────────┘  │  │  │
│  │  └────────┼──────────────┼─────────────────────────────────────┘  │  │
│  │           │              │                                         │  │
│  │  ┌────────▼──────────────▼─────────────────────────────────────┐  │  │
│  │  │                    Room Manager                              │  │  │
│  │  │  ┌─────────────────────────────────────────────────────┐    │  │  │
│  │  │  │              Room Actor (per-room goroutine)         │    │  │  │
│  │  │  │  ┌───────────────┐  ┌───────────────────────────┐   │    │  │  │
│  │  │  │  │  Game Engine  │  │  Visibility Projection    │   │    │  │  │
│  │  │  │  │  (FSM 状态机) │  │  (信息隔离过滤器)          │   │    │  │  │
│  │  │  │  └───────────────┘  └───────────────────────────┘   │    │  │  │
│  │  │  └─────────────────────────────────────────────────────┘    │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │           │                                                        │  │
│  │  ┌────────▼────────────────────────────────────────────────────┐  │  │
│  │  │                   Agent Orchestrator                         │  │  │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │  │  │
│  │  │  │ Setup Agent │ │ Night Agent │ │   Summary Agent     │    │  │  │
│  │  │  │ (角色分配)  │ │ (夜晚结算)  │ │   (复盘生成)        │    │  │  │
│  │  │  └─────────────┘ └─────────────┘ └─────────────────────┘    │  │  │
│  │  │           │              │              │                    │  │  │
│  │  │  ┌────────▼──────────────▼──────────────▼────────────────┐  │  │  │
│  │  │  │              MCP Tool Registry                         │  │  │  │
│  │  │  │  send_whisper | advance_phase | record_vote | ...      │  │  │  │
│  │  │  └────────────────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │           │                                                        │  │
│  │  ┌────────▼────────────────────────────────────────────────────┐  │  │
│  │  │                     Event Store                              │  │  │
│  │  │  ┌─────────────────┐  ┌─────────────────────────────────┐   │  │  │
│  │  │  │  Append-Only    │  │  Snapshot + Replay               │   │  │  │
│  │  │  │  Event Stream   │  │  (状态重建 + 断线恢复)            │   │  │  │
│  │  │  └─────────────────┘  └─────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│                              数据层                                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐    │
│  │  MySQL 8.0  │ │  Redis 7    │ │ RabbitMQ    │ │    Qdrant       │    │
│  │  (事件存储) │ │ (状态缓存)  │ │ (异步队列)  │ │  (向量检索)     │    │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## 技术亮点

### 🔄 事件溯源架构

通过事件溯源架构设计存储层，将提名、投票和处决等游戏操作序列化为**不可变事件流**：

- 所有状态变更以 Append-Only 事件形式存储
- 每个房间独立的单调递增序列号
- Event Replay + 快照机制实现状态重建与全局回放
- `last_seq` 增量补发机制支撑断线重连后的状态恢复

### 🎭 Actor 模型并发控制

基于 WebSocket 的实时通信层，利用 Actor 模型将每个房间作为独立的 Goroutine 运行：

- 以 Channel 串行化处理玩家操作
- 结合 `idempotency_key` 做幂等去重
- 确保重复提交不破坏状态，解决用户操作竞态问题
- 保证房间内顺序一致性

### 🤖 多 Agent 协作架构

设计 Orchestrator + Specialists 的分层多 Agent 架构：

| Agent | 职责 |
|-------|------|
| **Main Agent** | FSM 驱动游戏生命周期，协调子 Agent |
| **Setup Agent** | 规则计算、角色分配、酒鬼/男爵特殊处理 |
| **Night Agent** | 技能结算、真假信息生成、状态变更 |
| **Summary Agent** | 游戏复盘、故事线生成、MVP 评选 |

关键等待点引入超时与默认策略，LLM 调用旁路异步化，结果以事件回写。

### 🔧 MCP 协议工具标准化

基于 MCP (Model Context Protocol) 协议标准化工具接入规范：

```
send_whisper     → 发送私信给玩家
request_confirm  → 请求玩家确认
start_vote       → 开启投票
record_vote      → 记录投票结果
advance_phase    → 推进游戏阶段
write_event      → 写入事件流
```

长耗时任务通过 RabbitMQ 异步执行，统一治理超时重试、并发限制与审计记录。

### 🔒 可见性投影（信息隔离）

通过可见性投影实现严格的领域层信息隔离：

| 事件类型 | 可见范围 |
|----------|----------|
| `public.chat` | 所有房间成员 |
| `whisper.sent` | 发送者、接收者、系统 |
| `role.assigned` | 目标玩家、系统 |
| `night.info` | 行动者（真/假信息） |
| `death.announced` | 所有玩家 |

服务端按玩家身份对事件与状态做权限裁剪，确保玩家端仅接收其应知信息。

### 📚 RAG 语义检索

基于 Qdrant 向量数据库搭建 RAG 系统：

- 游戏规则书及角色技能的语义检索
- 对局短期记忆与阶段摘要的检索增强
- 动态上下文注入减少 LLM 在处理复杂规则时的幻觉

## 业务功能

### 🏠 房间与大厅阶段

| 功能 | 描述 |
|------|------|
| **创建房间** | 生成 4-6 位数字房间号，无需登录 |
| **加入房间** | 输入房间号即可加入 |
| **座位绑定** | 圆桌视图选座，座位顺序影响技能判定 |
| **剧本选择** | 房主选择剧本（暗流涌动等） |
| **开始游戏** | 全员就座后一键开始，自动锁定房间 |

### 🎭 角色系统

支持完整的《暗流涌动 (Trouble Brewing)》剧本：

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

**外来者（4 个）**
- 管家：每夜选择主人，只能在主人投票时投票
- 酒鬼：以为自己是村民但实际中毒，能力无效
- 隐士：可能被视为邪恶阵营（会被调查类角色误认为爪牙或恶魔）
- 圣徒：若被处决则邪恶阵营获胜

**爪牙（4 个）**
- 投毒者：每夜选择一名玩家中毒
- 间谍：可以看到所有玩家的角色
- 男爵：场上外来者+2，村民-2
- 红唇女郎：恶魔死亡时可代替成为恶魔

**恶魔（1 个）**
- 小恶魔：每夜杀死一名玩家

### 🌙 夜晚阶段

| 流程 | 描述 |
|------|------|
| **入夜播报** | "天黑请闭眼"，UI 变为黑暗状态 |
| **唤醒队列** | 按剧本顺序依次唤醒角色 |
| **技能操作** | 当前行动玩家可见操作界面 |
| **结算处理** | 判断中毒/醉酒状态，生成真/假信息 |
| **信息发放** | 实时推送结算结果到玩家端 |

### ☀️ 白天阶段

| 流程 | 描述 |
|------|------|
| **天亮结算** | 公布昨夜死亡玩家 |
| **自由讨论** | 可配置倒计时 |
| **发起提名** | 存活玩家可提名他人 |
| **辩护流程** | 提名者发言 → 被提名者辩护 |
| **投票系统** | 同意/弃票，死人票仅限一次 |
| **处决结算** | 票数过半且最高者被处决 |

### 🏆 游戏结束与复盘

| 功能 | 描述 |
|------|------|
| **胜负判定** | 恶魔死亡或仅剩 2 人 |
| **智能复盘** | AI 生成故事线回顾 |
| **MVP 评选** | 趣味性玩家表现评价 |

### 🎨 UI 视觉

- Townsquare 风格的圆形座位布局
- 木质令牌纹理
- 阵营颜色区分（蓝/青/橙/红）
- 夜晚/白天氛围切换
- 死亡遮罩和鬼魂状态

## 快速开始

### 前置要求

- **Docker & Docker Compose** (用于启动 MySQL、Redis、RabbitMQ、Qdrant)
- **Go 1.25** (用于编译后端)
- **Node.js 18+** (用于前端开发)
- **Google Gemini API Key** (用于 AI Agent 功能)

### 1. 克隆项目

```bash
git clone https://github.com/your-username/Blood-on-the-Clocktower-auto-dm.git
cd Blood-on-the-Clocktower-auto-dm
```

### 2. 配置 API 密钥

创建环境配置文件：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件，填入你的 Google Gemini API Key：

```bash
# .env
GEMINI_API_KEY=你的Gemini_API_Key
AUTODM_ENABLED=true
```

获取免费的 Gemini API Key：https://aistudio.google.com/apikey

> **注意**：API 密钥是启用 AI 自动说书人功能的必要配置。如果不配置，系统仍可运行但 AI Agent 功能将被禁用。

### 3. 启动基础设施（数据库 & 中间件）

```bash
docker-compose up -d 
```

等待所有容器健康检查通过（约 30 秒）：

```bash
docker-compose ps
```

确认所有服务状态为 `healthy`：
- `botc_mysql` - MySQL 8.0 (端口 3316)
- `botc_redis` - Redis 7 (端口 6389)
- `botc_rabbitmq` - RabbitMQ 3.12 (端口 5672, 管理界面 15672)
- `botc_qdrant` - Qdrant 向量数据库 (端口 6333)

### 4. 启动后端服务

```bash
# 在 backend 目录下
make build
./bin/agentdm
```

或使用开发模式一键启动：

```bash
make dev
```

后端服务启动在 `http://localhost:8080`

### 5. 启动前端服务

新开一个终端：

```bash
cd frontend
npm install
npm run dev
```

前端服务启动在 `http://localhost:8081`

### 5.1 运行真实房间流程回归

安装前端依赖后，可直接运行一条完整的浏览器回归，自动覆盖：
- 建房并入座
- 添加 6 个 bot
- 开局并完成首夜
- 白天重连恢复房主状态
- 提名、双阶段辩护、顺序投票
- 房主再次进入夜晚

```bash
cd frontend
npm run e2e:room-flow
```

默认行为：
- 若 `http://127.0.0.1:8080` / `http://127.0.0.1:8081` 没有服务，脚本会自动启动后端和前端
- 若 Docker 依赖未启动，脚本会自动执行 `docker compose up -d mysql redis rabbitmq qdrant`
- 截图、日志与报告会输出到 `tmp/e2e-room-flow/`

可选环境变量：
- `BOTC_E2E_KEEP_SERVERS=1`：脚本结束后保留它启动的前后端进程
- `BOTC_E2E_SKIP_DOCKER=1`：跳过 Docker 依赖拉起
- `BOTC_E2E_FRONTEND_URL` / `BOTC_E2E_BACKEND_URL`：覆盖默认地址

### 6. 访问应用

打开浏览器访问：
- **游戏界面**：`http://localhost:8081`
- **API 文档 (Swagger)**：`http://localhost:8080/swagger/index.html`
- **Prometheus 监控**：`http://localhost:9190`
- **Grafana 仪表盘**：`http://localhost:3100` (用户名: admin, 密码: admin)
- **RabbitMQ 管理界面**：`http://localhost:15672` (用户名: botc, 密码: botc_password)

---

## 本地开发环境

### 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `GEMINI_API_KEY` | Google Gemini API 密钥 | - |
| `AUTODM_ENABLED` | 是否启用 AI 说书人 | `false` |
| `HTTP_ADDR` | HTTP 服务监听地址 | `:8080` |
| `DB_DSN` | MySQL 连接字符串 | `root:password@tcp(localhost:3316)/agentdm?...` |
| `REDIS_ADDR` | Redis 地址 | `localhost:6389` |
| `RABBITMQ_URL` | RabbitMQ 连接地址 | `amqp://botc:botc_password@localhost:5672/` |
| `QDRANT_HOST` | Qdrant 向量数据库地址 | `localhost` |
| `QDRANT_PORT` | Qdrant 端口 | `6333` |
| `JWT_SECRET` | JWT 签名密钥 | `dev-secret-change` |

### 开发模式启动

```bash
# 方式一：使用 Makefile（推荐）
cd backend
make dev   # 自动启动 docker-compose + 后端服务

# 方式二：手动启动
cd backend
docker-compose up -d          # 启动基础设施
make build                    # 编译
GEMINI_API_KEY=你的Key AUTODM_ENABLED=true ./bin/agentdm  # 运行
```

### 测试 API 接口

```bash
# 健康检查
curl http://localhost:8080/health

# 注册用户
curl -X POST http://localhost:8080/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# 登录获取 token
curl -X POST http://localhost:8080/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# 创建房间（需要 token）
curl -X POST http://localhost:8080/v1/rooms \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 运行测试

```bash
cd backend
make test      # 运行单元测试
make lint      # 代码检查（需安装 golangci-lint）
```

---

## 压测体系

本节介绍后端的完整压测体系，包括协议文档、测试场景、正确性验证和 Gemini API 保护机制。

### 压测场景清单 (S1-S11)

| 场景 | 名称 | 描述 | 正确性验证 |
|------|------|------|------------|
| **S1** | WS 握手风暴 | N 并发 WebSocket 连接 + 订阅 | 无超时、无 4xx/5xx |
| **S2** | 单房间 Join Storm | M 用户同时加入同一房间 | Seq 单调递增、无缺失/重复事件 |
| **S3** | 幂等去重验证 | 相同 idempotency_key 重复提交 | 只产生一个事件 |
| **S4** | 命令序列号单调性 | 快速连续命令 | 所有 Seq 严格递增 |
| **S5** | 可见性泄露检测 | whisper/role 事件投影 | 非目标用户不可见私密事件 |
| **S6** | Gemini 调用监测 | 触发 AutoDM 事件流 | 调用数 ≤ 预算、延迟 ≤ 阈值 |
| **S7** | 多房间隔离 | 创建 K 个房间并行操作 | 房间间事件不串扰 |
| **S8** | 断线重连 Seq Gap | 断开→重连→last_seq 补发 | 无事件丢失 |
| **S9** | RabbitMQ DLQ 监测 | 制造任务失败 | DLQ 消息数 = 预期 |
| **S10** | 完整游戏流程 | Lobby→Night→Day→Vote→End | 状态机转换正确 |
| **S11** | 混沌测试 | 随机断连、随机命令 | 系统不崩溃、可恢复 |

### 运行压测

```bash
# 快速冒烟测试 (< 1 分钟)
cd backend
make loadtest-quick

# 完整压测套件 (约 10 分钟)
make loadtest-full

# 单场景测试
./bin/autodm_loadgen -scenario S2 -users 50 -duration 30s

# 列出所有场景
make loadtest-list
```

### 配置选项

| 环境变量 | 说明 | 默认值 |
|----------|------|--------|
| `LOADTEST_TARGET` | 目标服务器 | `http://localhost:8080` |
| `LOADTEST_WS_TARGET` | WebSocket 目标 | `ws://localhost:8080/ws` |
| `LOADTEST_USERS` | 并发用户数 | `10` |
| `LOADTEST_DURATION` | 测试时长 | `30s` |
| `GEMINI_MAX_CONCURRENCY` | Gemini 并发限制 | `5` |
| `GEMINI_RPS_LIMIT` | Gemini RPS 限制 | `10` |
| `GEMINI_REQUEST_BUDGET` | Gemini 请求预算 | `100` |

### Gemini API 保护机制

为防止压测意外消耗过多 Gemini API 配额，系统实现了多层保护：

1. **并发限制 (Semaphore)**: 最多 `GEMINI_MAX_CONCURRENCY` 个并发请求
2. **RPS 限速 (Token Bucket)**: 每秒最多 `GEMINI_RPS_LIMIT` 个请求
3. **总请求预算 (Circuit Breaker)**: 达到 `GEMINI_REQUEST_BUDGET` 后停止发送

### 压测报告示例

运行完整压测后，会生成 `loadtest_report_{timestamp}.json`：

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "target": "http://localhost:8080",
  "scenarios": [
    {"scenario": "S1", "passed": true, "duration_ms": 2100},
    {"scenario": "S2", "passed": true, "duration_ms": 5230}
  ],
  "summary": {
    "total_scenarios": 11,
    "passed": 11,
    "failed": 0,
    "gemini_requests": 23,
    "gemini_budget_remaining": 77
  }
}
```

---

## 部署上云

### 使用 Docker Compose 部署（推荐用于单机）

#### 1. 准备服务器

- 推荐配置：2 核 4GB 内存
- 操作系统：Ubuntu 22.04 / Debian 12
- 安装 Docker & Docker Compose

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. 克隆代码并配置

```bash
git clone https://github.com/your-username/Blood-on-the-Clocktower-auto-dm.git
cd Blood-on-the-Clocktower-auto-dm/backend

# 创建生产环境配置
cat > .env.production << EOF
# 生产环境配置
GEMINI_API_KEY=你的Gemini_API_Key
AUTODM_ENABLED=true
JWT_SECRET=$(openssl rand -hex 32)
HTTP_ADDR=:8080
EOF
```

#### 3. 创建生产环境 Docker Compose 配置

```bash
cat > docker-compose.production.yml << 'EOF'
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: botc_app
    ports:
      - "8080:8080"
    env_file:
      - .env.production
    environment:
      - DB_DSN=root:password@tcp(mysql:3306)/agentdm?parseTime=true&multiStatements=true&charset=utf8mb4
      - REDIS_ADDR=redis:6379
      - RABBITMQ_URL=amqp://botc:botc_password@rabbitmq:5672/
      - QDRANT_HOST=qdrant
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    container_name: botc_mysql
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: agentdm
    volumes:
      - mysql_data:/var/lib/mysql
      - ./db/migrations:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 5s
      retries: 10
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: botc_redis
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    restart: unless-stopped

  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    container_name: botc_rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: botc
      RABBITMQ_DEFAULT_PASS: botc_password
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "check_running"]
      interval: 10s
      timeout: 10s
      retries: 5
    restart: unless-stopped

  qdrant:
    image: qdrant/qdrant:latest
    container_name: botc_qdrant
    volumes:
      - qdrant_data:/qdrant/storage
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: botc_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./frontend/dist:/usr/share/nginx/html:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mysql_data:
  redis_data:
  rabbitmq_data:
  qdrant_data:
EOF
```

#### 4. 创建 Dockerfile

```bash
cat > Dockerfile << 'EOF'
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /agentdm ./cmd/server

FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app

COPY --from=builder /agentdm .
COPY assets/ ./assets/

EXPOSE 8080
CMD ["./agentdm"]
EOF
```

#### 5. 构建并启动

```bash
# 构建前端
cd ../frontend
npm install && npm run build

# 启动所有服务
cd ../backend
docker-compose -f docker-compose.production.yml up -d --build
```

### 使用 Kubernetes 部署（适用于生产集群）

参考 `deploy/k8s/` 目录下的 Kubernetes 配置文件（如有）。

### 监控与运维

#### Prometheus 指标

后端暴露了以下关键指标：

- `botc_active_connections` - 当前 WebSocket 连接数
- `botc_events_total` - 事件处理总数
- `botc_command_duration_seconds` - 命令处理延迟
- `botc_agent_run_total` - AI Agent 运行次数

#### 日志查看

```bash
# 查看后端日志
docker logs -f botc_app

# 查看所有服务日志
docker-compose -f docker-compose.production.yml logs -f
```

---

## API 文档

后端启动后，访问 **Swagger UI** 查看完整 API 文档：

```
http://localhost:8080/swagger/index.html
```

### 主要接口概览

| 接口 | 方法 | 描述 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/v1/auth/register` | POST | 用户注册 |
| `/v1/auth/login` | POST | 用户登录 |
| `/v1/rooms` | POST | 创建房间 |
| `/v1/rooms/{room_id}/join` | POST | 加入房间 |
| `/v1/rooms/{room_id}/events` | GET | 获取事件流（支持 after_seq 增量同步） |
| `/v1/rooms/{room_id}/state` | GET | 获取房间状态（按用户角色过滤） |
| `/v1/rooms/{room_id}/replay` | GET | 游戏回放 |
| `/ws?token={jwt}` | WebSocket | 实时通信 |
| `/metrics` | GET | Prometheus 指标 |
| `/swagger/*` | GET | API 文档 |

### 示例请求

```bash
# 注册用户
curl -X POST http://localhost:8080/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# 登录获取 Token
curl -X POST http://localhost:8080/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# 创建房间（需要 Authorization 头）
curl -X POST http://localhost:8080/v1/rooms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 获取事件（增量同步）
curl http://localhost:8080/v1/rooms/{room_id}/events?after_seq=0 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### WebSocket 协议

连接：`ws://localhost:8080/ws?token={jwt}`

```json
// 订阅房间事件
{"type": "subscribe", "request_id": "1", "payload": {"room_id": "xxx", "last_seq": 0}}

// 发送游戏命令
{"type": "command", "request_id": "2", "payload": {
  "command_id": "uuid",
  "idempotency_key": "unique-key",
  "room_id": "xxx",
  "type": "public_chat",
  "data": {"message": "Hello"}
}}

// 服务端推送事件
{"type": "event", "payload": {"room_id": "xxx", "seq": 1, "event_type": "public.chat", "data": {...}}}
```

### 支持的命令类型

| 命令类型 | 描述 | 游戏阶段 |
|----------|------|----------|
| `join` | 加入房间 | Lobby |
| `leave` | 离开房间 | Lobby |
| `claim_seat` | 选择座位 | Lobby |
| `start_game` | 开始游戏 | Lobby |
| `public_chat` | 公开聊天 | Any |
| `whisper` | 私聊 | Day |
| `nominate` | 提名玩家 | Day |
| `end_defense` | 结束辩护 | Day |
| `vote` | 投票 | Day |
| `ability.use` | 使用技能 | Night |
| `advance_phase` | 推进阶段 | DM Only |

## 开发指南

### 项目结构

```
Blood-on-the-Clocktower-auto-dm/
├── backend/                    # Go 后端
│   ├── cmd/server/            # 入口
│   ├── internal/
│   │   ├── agent/             # AI Agent 系统
│   │   ├── api/               # HTTP/WebSocket 处理
│   │   ├── auth/              # 认证模块
│   │   ├── config/            # 配置管理
│   │   ├── engine/            # 游戏引擎
│   │   ├── game/              # 游戏逻辑
│   │   ├── mcp/               # MCP 协议工具
│   │   ├── projection/        # 可见性投影
│   │   ├── queue/             # 消息队列
│   │   ├── rag/               # RAG 检索
│   │   ├── realtime/          # 实时通信
│   │   ├── room/              # 房间管理
│   │   ├── store/             # 数据存储
│   │   └── types/             # 类型定义
│   ├── db/                    # 数据库迁移
│   └── docker-compose.yml     # 基础设施配置
│
├── frontend/                   # Vue 2 前端 (基于 townsquare)
│   ├── src/
│   │   ├── main.js            # 入口
│   │   ├── App.vue            # 根组件
│   │   ├── store/             # Vuex 状态管理
│   │   │   ├── grimoire.js    # 魔典状态
│   │   │   ├── players.js     # 玩家状态
│   │   │   └── session.js     # 会话状态
│   │   ├── components/        # Vue 组件
│   │   │   ├── TownSquare.vue # 座位圈
│   │   │   ├── Player.vue     # 玩家令牌
│   │   │   ├── Token.vue      # 角色令牌
│   │   │   ├── Menu.vue       # 控制菜单
│   │   │   ├── Vote.vue       # 投票界面
│   │   │   └── modals/        # 模态框
│   │   └── assets/            # 静态资源
│   └── public/                # 公共资源
│
└── docs/                      # 项目文档
    └── rules/                 # 游戏规则文档
```

### 常用命令

```bash
# 后端
cd backend
make build          # 编译
make run            # 运行
make test           # 测试
make docker-up      # 启动基础设施
make docker-down    # 停止基础设施

# 前端
cd frontend
npm run serve       # 开发模式 (端口 8081)
npm run build       # 生产构建
```

---

<a name="english-documentation"></a>
# 📖 English Documentation

## Overview

This project is an automated system for the tabletop game "Blood on the Clocktower" that can **fully replace a human Storyteller** for game flow management, rule enforcement, information distribution, and game recap.

### Core Features

- 🎮 **Offline Gathering**: Players sit face-to-face, each participating via mobile phone
- 📱 **Login-free Quick Start**: No registration required, join with room code
- 🤖 **AI Auto-Storytelling**: Multi-agent collaboration system handles all game logic

## Tech Stack

### Backend (Go)

| Technology | Purpose |
|------------|---------|
| **Go 1.25+** | Server language |
| **Chi** | HTTP routing |
| **Gorilla WebSocket** | Real-time communication |
| **MySQL 8.0** | Event persistence |
| **Redis 7** | State caching |
| **RabbitMQ 3.12** | Async task queue |
| **Qdrant** | Vector database (RAG) |

### Frontend (Vue 2)

| Technology | Purpose |
|------------|---------|
| **Vue 2.6** | Frontend framework |
| **Vue CLI 5.0** | Build tool |
| **Vuex 3.6** | State management |
| **SCSS** | Style preprocessing |
| **FontAwesome 5** | Icons |

## Technical Highlights

### Event Sourcing Architecture

All game operations (nominations, votes, executions) are serialized as **immutable event streams**:

- Append-only event storage
- Per-room monotonic sequence numbers
- Event Replay + Snapshot for state reconstruction
- `last_seq` mechanism for reconnection recovery

### Actor Model Concurrency

Each room runs as an independent Goroutine:

- Channel-based serial command processing
- Idempotency key deduplication
- Room-level sequential consistency

### Multi-Agent Collaboration

Orchestrator + Specialists architecture:

| Agent | Responsibility |
|-------|----------------|
| **Main Agent** | FSM-driven game lifecycle |
| **Setup Agent** | Role distribution, special rules |
| **Night Agent** | Ability resolution, info generation |
| **Summary Agent** | Game recap, storyline generation |

### MCP Protocol Tools

Standardized tool interfaces via Model Context Protocol:
- `send_whisper`, `start_vote`, `record_vote`, `advance_phase`, etc.

### Visibility Projection

Strict information isolation per player identity:
- Public chat → all players
- Private whisper → sender, recipient only
- Role assignment → target player only

## Quick Start

### Prerequisites

- **Docker & Docker Compose** (for MySQL, Redis, RabbitMQ, Qdrant)
- **Go 1.25+** (for compiling the backend)
- **Node.js 18+** (for frontend development)
- **Google Gemini API Key** (for AI Agent features)

### 1. Clone Repository

```bash
git clone https://github.com/your-username/Blood-on-the-Clocktower-auto-dm.git
cd Blood-on-the-Clocktower-auto-dm
```

### 2. Configure API Key

Create the environment config file:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in your Google Gemini API Key:

```bash
# .env
GEMINI_API_KEY=your_Gemini_API_Key
AUTODM_ENABLED=true
```

Get a free Gemini API Key: https://aistudio.google.com/apikey

> **Note**: The API key is required to enable the AI Auto-Storyteller. Without it, the system still runs but AI Agent features will be disabled.

### 3. Start Infrastructure

```bash
docker-compose up -d
```

Wait for all containers to pass health checks (~30 seconds):

```bash
docker-compose ps
```

Confirm all services are `healthy`:
- `botc_mysql` - MySQL 8.0 (port 3316)
- `botc_redis` - Redis 7 (port 6389)
- `botc_rabbitmq` - RabbitMQ 3.12 (port 5672, management UI 15672)
- `botc_qdrant` - Qdrant vector database (port 6333)

### 4. Start Backend

```bash
# In the backend directory
make build
./bin/agentdm
```

Or use the recommended one-command dev mode:

```bash
make dev
```

Backend runs at `http://localhost:8080`

### 5. Start Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run serve
```

> `npm run dev` also works as an alias.

Frontend runs at `http://localhost:8081`

### 6. Access Application

Open your browser:
- **Game UI**: `http://localhost:8081`
- **API Docs (Swagger)**: `http://localhost:8080/swagger/index.html`
- **RabbitMQ Management**: `http://localhost:15672` (user: botc, pass: botc_password)

## Load Testing

A complete load testing system is included for validating backend performance and correctness.

### Test Scenarios (S1-S11)

| Scenario | Name | Description | Validation |
|----------|------|-------------|------------|
| **S1** | WS Handshake Storm | N concurrent WebSocket connections | No timeouts, no 4xx/5xx |
| **S2** | Single Room Join Storm | M users join same room | Seq monotonic, no missing events |
| **S3** | Idempotency Verification | Duplicate idempotency_key | Only one event produced |
| **S4** | Command Seq Monotonicity | Rapid sequential commands | All Seq strictly increasing |
| **S5** | Visibility Leak Detection | whisper/role event projection | Private events not leaked |
| **S6** | Gemini Call Monitoring | AutoDM event triggers | Calls ≤ budget, latency ≤ threshold |
| **S7** | Multi-Room Isolation | K rooms in parallel | No cross-room events |
| **S8** | Reconnect Seq Gap | Disconnect→reconnect→replay | No event loss |
| **S9** | RabbitMQ DLQ Monitoring | Task failures | DLQ count = expected |
| **S10** | Full Game Flow | Lobby→Night→Day→Vote→End | Valid state transitions |
| **S11** | Chaos Test | Random disconnects/commands | System recoverable |

### Running Load Tests

```bash
# Quick smoke test (< 1 min)
cd backend
make loadtest-quick

# Full test suite (~10 min)
make loadtest-full

# Single scenario
./bin/autodm_loadgen -scenario S2 -users 50 -duration 30s

# List all scenarios
make loadtest-list
```

### Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `LOADTEST_TARGET` | Target server | `http://localhost:8080` |
| `LOADTEST_WS_TARGET` | WebSocket target | `ws://localhost:8080/ws` |
| `LOADTEST_USERS` | Concurrent users | `10` |
| `LOADTEST_DURATION` | Test duration | `30s` |
| `GEMINI_MAX_CONCURRENCY` | Gemini concurrency limit | `5` |
| `GEMINI_RPS_LIMIT` | Gemini RPS limit | `10` |
| `GEMINI_REQUEST_BUDGET` | Gemini request budget | `100` |

### Gemini API Protection

To prevent excessive Gemini API consumption during load tests:

1. **Concurrency Limit**: Max `GEMINI_MAX_CONCURRENCY` concurrent requests
2. **RPS Limit**: Max `GEMINI_RPS_LIMIT` requests per second
3. **Budget Circuit Breaker**: Stop after `GEMINI_REQUEST_BUDGET` requests

## Development

```bash
# Backend (recommended one-command start)
cd backend
make dev

# Frontend
cd frontend
npm install
npm run serve   # or npm run dev
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.
