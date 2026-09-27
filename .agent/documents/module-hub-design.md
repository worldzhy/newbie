# Module Hub 控制面设计

> 状态：**v1（2026-09-28），框架侧设计真源**
>
> 本文档由 newbie 工作区主笔，nightwatch 消费侧仅保留宿主集成章节引用。去 project 化的 token-only installation 模型与 4 表结构已定稿（roadmap Phase C1，2026-09-27）。

---

## 1. 背景与目标

### 1.1 现状

- **registry 就绪**：`newbie-modules` monorepo 含 48 个 module；复制模型，项目根 `modules.json` 登记 registry `sourceCommit` 与各 module 快照（`{key, version, sourceCommit, localPatches[]}`）。
- **CLI 执行面就绪**：`newbie apply --ci`（按 spec 全量对账增删）、`newbie update --all -y [--force]`（更新到 registry HEAD，漂移阻断）、`newbie status --json --drift`（机器可读项目状态）、`newbie doctor`（退出码闸门）、`newbie config --add/--remove <key>`（启停模块）。
- **CLI 缺口**：`newbie agent` 为占位命令（[agent.ts](file:///Users/worldzhy/src/newbie/packages/cli/src/commands/agent.ts)），尚未实现 hub 模式轮询。
- **控制面缺失**：没有任何服务端接收安装清单、登记 registry 发布、编排变更单。

### 1.2 目标

1. 定义 hub 4 表数据模型（PG schema `module/module-hub`）：installation、module-release、change-request、audit-log。
2. 定义三组 API 契约：host 集成 API（鉴权归宿主）、agent 出站轮询 API（hub 自有 token 鉴权）、GitHub registry webhook。
3. 定义 `newbie agent` hub 模式轮询协议，执行时**直接复用现有 `apply`/`update` 代码路径**（保证 hub 触发与人工手动跑命令结果一致）。
4. 明确 module-hub 作为普通 module 收录进 `newbie-modules` registry（`packages/modules/module-hub/`），经 `newbie config --add module-hub` + `newbie install` 装配。

### 1.3 非目标（v1 明确不做）

- hub 不含 project/application 概念；不做通知发送（邮件/短信/IM 归宿主）；不做前端面板（C2，归 nightwatch-frontend）。
- **运行时 SDK 列 v1.1**：变更执行永不进应用运行时进程——生产镜像无 git/npm/prisma、文件系统可不持久、改后需重启、脱离 git 的变更不可复现。
- 变更单批量编排、EXECUTING 中断、原单重试、自动开 PR（payload 留字段，实现推迟）。

---

## 2. 身份模型与职责边界

### 2.1 核心模型：一个 token = 一个安装实例

- hub 世界里只有 **installation**（安装实例）实体。一个实例对应消费项目的一份工作副本（有 git、有 npm 的环境：开发者机器 / CI / 部署主机）。
- dev/staging/prod 各发一个 token = 天然多实例，**无需 environment 字段、无需 project 层级**。
- **自注册**：host 预创建 installation 并签发 token；CLI 首次带 token 轮询时，hub 补登运行时事实（CLI 版本、modules 快照、`lastSeenAt`）。创建到首次轮询之间 `lastSeenAt=null`，UI 显示「等待 agent 接入」。
- **token 归 hub 所有**：存 `hub-installation.tokenHash`（SHA-256），明文仅在签发/轮转响应中一次性返回。**不经过、不引用 host 的 Application/Agent 模型**，因此没有跨 schema 外键，C1 框架侧可独立交付。
- **`externalRef`（opaque 字符串）**：host 用来贴自己的 project/application 标签（nightwatch 可存 `projectId/applicationId` 或任意 JSON 字符串），hub 只存取不解释。C2 面板的 project/application 分组由 host 经此字段映射。

### 2.2 部署形态与鉴权归属

hub 作为普通 module 装配进 host Nest 进程，**无多租户**。

| API 组                                        | 鉴权                                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------- |
| host 集成 API（installation/目录/变更单管理） | host 自身鉴权（nightwatch 既有 JWT/Guard 体系），hub 不另建用户模型                   |
| agent 轮询 API                                | hub 自有 installation token（`X-Module-Hub-Token` 头），公开端点（`@NoGuard()` 风格） |
| GitHub webhook                                | GitHub HMAC 签名验证                                                                  |

### 2.3 职责边界

| 职责                                                | 归属                                      |
| --------------------------------------------------- | ----------------------------------------- |
| module 目录、安装可见性、变更单编排、执行回执、审计 | **module-hub**                            |
| 变更执行（改文件、装依赖、git 工作区）              | **项目侧 newbie CLI（agent 调度）**       |
| 面板 UI、project/application 层级、用户权限         | host（nightwatch-frontend，C2）           |
| 升级/异常的用户通知（邮件/短信/IM）                 | host 读 hub 查询 API 后自行发送；hub 不发 |
| 应用级心跳/在线（`/applications/heartbeat`）        | host 的 Application 层，与 hub 无关       |

---

## 3. 数据模型（4 表，Prisma 草案）

独立 PG schema `module/module-hub`（命名对齐 `module/<key>` 既有约定）。module 内自带 Prisma fragment（`prisma/schema.prisma`，manifest 声明 `"schema"`），装配时由 CLI 复制进 host `prisma/models/module-hub.prisma` 并把 `"module/module-hub"` 加入 datasource `schemas`；**migration 由 host 自行执行**（CLI 只跑 `prisma generate`）。

```prisma
// module-hub control-plane models. PostgreSQL schema: "module/module-hub".
// The hub is project-agnostic: an Installation is identified solely by its
// token. Host-side project/application grouping lives in opaque `externalRef`.

// Lifecycle is derived, not stored: never-seen (lastSeenAt null) / online /
// stale, see section 4.2. Only revocation is an explicit persisted state.
model HubInstallation {
  id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid

  // Human-readable label assigned at enrollment, e.g. "nightwatch-prod".
  label String @db.VarChar(255)
  // SHA-256 hex of the installation token. The plaintext token is returned
  // once at creation/rotation and never stored.
  tokenHash String @unique @db.VarChar(64)

  // Optional source-repository URL, supplied by the host at enrollment.
  repoUrl String? @db.VarChar(255)
  // Opaque host-owned tag (e.g. "projectId/applicationId"); hub never parses it.
  externalRef String? @db.VarChar(255)

  // Runtime facts self-registered on the first agent poll and refreshed later.
  // newbie CLI version (from the agent process package.json VERSION).
  newbieVersion String? @db.VarChar(64)
  // Registry sourceCommit the installation last reported.
  registrySourceCommit String? @db.VarChar(64)
  // Full snapshot mirroring `newbie status --json` output:
  // { registry: {...}, modules: [{key, version, sourceCommit, localPatches,
  //   installed, hasSchema, missingEnv, updateAvailable, drift?}] }
  modulesSnapshot Json?
  firstSeenAt     DateTime?
  lastSeenAt      DateTime?

  // Soft revocation: token rejected, rows retained for audit/history.
  revokedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  changeRequests HubChangeRequest[]
  auditLogs      HubAuditLog[]

  @@schema("module/module-hub")
}

// Immutable registry catalog rows, inserted by the GitHub push webhook
// (and a periodic fallback sync). One row per (module, registry commit).
model HubModuleRelease {
  id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid

  moduleKey String @db.VarChar(64)
  // Registry commit at which this module snapshot was seen.
  sourceCommit String @db.VarChar(64)
  // The newbie.module.json manifest at that commit.
  manifest Json @db.JsonB

  publishedAt DateTime @default(now())

  @@unique([moduleKey, sourceCommit])
  @@schema("module/module-hub")
}

enum HubChangeRequestStatus {
  // Created by the host; waiting for an agent poll to pick it up.
  PENDING
  // Dispatched to an agent; the CLI is executing.
  RUNNING
  // Agent reported success; resultSummary holds the post-change facts.
  DONE
  // Agent reported failure; errorReason is populated; a new request is needed.
  FAILED

  @@schema("module/module-hub")
}

enum HubChangeRequestType {
  // Enable a module not present in the current set (executed via `newbie apply`).
  ADD
  // Disable an installed module (executed via `newbie apply`).
  REMOVE
  // Move module(s) to a newer registry snapshot (executed via `newbie update`).
  UPGRADE

  @@schema("module/module-hub")
}

// A single module change order, scoped to one installation. Creating the
// request IS the approval decision — there is no separate approve step in v1
// (the hub has no user concept; authorization belongs to the host).
model HubChangeRequest {
  id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid

  installationId String          @db.Uuid
  installation   HubInstallation @relation(fields: [installationId], references: [id], onDelete: Cascade)

  type   HubChangeRequestType
  status HubChangeRequestStatus @default(PENDING)

  // Change descriptor:
  // { moduleKey, targetSourceCommit?,
  //   options: { driftPolicy: "reject" | "force", delivery: "worktree" | "pr" } }
  // ADD/REMOVE: moduleKey + apply semantics; UPGRADE: targetSourceCommit may be
  // null (= registry HEAD at execution). delivery "pr" reserved for future CLI
  // work; v1 executes "worktree" only.
  payload Json @db.JsonB

  // Receipt: post-execution snapshot excerpt and changed-file summary.
  resultSummary Json?
  errorReason   String? @db.Text

  // Host actor identifier string (the hub has no users table).
  createdBy String? @db.VarChar(255)

  pickedAt   DateTime? // PENDING -> RUNNING
  finishedAt DateTime? // -> DONE / FAILED
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@index([installationId, status])
  @@schema("module/module-hub")
}

// Append-only audit trail (enrollment, token rotation/revocation, release
// ingestion, change-request lifecycle). Routine polls are NOT audited.
model HubAuditLog {
  id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid

  installationId String?         @db.Uuid
  installation   HubInstallation? @relation(fields: [installationId], references: [id], onDelete: SetNull)

  // Dot-namespaced, e.g. "installation.enroll", "installation.revoke",
  // "release.ingest", "change.pick", "change.done", "change.fail".
  action String @db.VarChar(128)
  // "host:<actor>", "agent:<installationId>", "webhook".
  actor  String @db.VarChar(255)
  detail Json?

  createdAt DateTime @default(now())

  @@index([installationId, createdAt])
  @@schema("module/module-hub")
}
```

**设计要点：**

- **不存 registry「latest 指针」**：最新发布由 `HubModuleRelease.publishedAt` 派生；installation 是否可升级 = 快照中 module 的 `sourceCommit` 与该 `moduleKey` 最新 release 比对（轮询时 agent 也会自报 `updateAvailable`，两侧互校）。
- **变更单 4 态**：`PENDING → RUNNING → DONE/FAILED`，对齐框架定稿。失败不自动重试、不支持中断/取消（v1）；重试 = 创建新单。
- **ADD/REMOVE 都走 `apply`**：CLI 的 `apply` 是「全量目标集合对账」（见第 5.2 节），不是单模块增删命令。
- **审计记状态转移，不记轮询**：常规 60s poll 量噪比低，不写审计行。

---

## 4. API 契约

无全局路由前缀（对齐 host `src/main.ts` 现状）。所有 hub 路径以 `/module-hub` 开头；不存在面向前端的顶层路由约定（C2 路由由 host 自定）。

### 4.1 host 集成 API（host 鉴权）

供 host 服务端调用（nightwatch 的嵌套 controller 可内部直接注入 hub service，亦可经 HTTP）。UI 权限归宿主。以下 DTO 属于 host 侧实现，框架文档仅定义 CLI 消费端需要的接口形状。

| 接口                                                        | 说明                                                                                                                                                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /module-hub/installations`                            | 纳管：body `{label, repoUrl?, externalRef?}`；生成 token，响应一次性返回明文；写审计 `enroll`。幂等由 host 控制（同 `externalRef` 重复创建返回 409 与否由 host 策略决定，hub 不拦截） |
| `GET /module-hub/installations`                             | 列表（含派生 `online`：`lastSeenAt` 在阈值内；支持 `?externalRef=` 过滤，供 host 做 project/application 映射）                                                                        |
| `GET /module-hub/installations/:id`                         | 详情                                                                                                                                                                                  |
| `GET /module-hub/installations/:id/modules`                 | 最近一次上报的模块清单快照                                                                                                                                                            |
| `POST /module-hub/installations/:id/token/regenerate`       | 轮转 token（旧 hash 立即失效；明文一次性返回）                                                                                                                                        |
| `DELETE /module-hub/installations/:id`                      | 吊销（置 `revokedAt`；轮询 401；行与历史保留）                                                                                                                                        |
| `GET /module-hub/catalog`                                   | 目录：按 `moduleKey` 聚合最新 release（manifest 摘要）                                                                                                                                |
| `GET /module-hub/catalog/:moduleKey/releases`               | 单模块版本列表                                                                                                                                                                        |
| `GET /module-hub/installations/:id/change-requests?status=` | 变更单列表                                                                                                                                                                            |
| `POST /module-hub/installations/:id/change-requests`        | 创建变更单，直接 `PENDING`；创建即决策，无审批环节                                                                                                                                    |

创建变更单 DTO（框架侧只消费，host 侧实现）：

```typescript
export class CreateHubChangeRequestDto {
  @ApiProperty({ enum: HubChangeRequestType })
  type: HubChangeRequestType;

  @ApiProperty()
  @IsString()
  moduleKey: string;

  // UPGRADE only. Null/absent = registry HEAD at execution time.
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetSourceCommit?: string;

  @ApiPropertyOptional({
    description: "reject: refuse execution when local drift exists (default); force: pass --force",
  })
  @IsOptional()
  driftPolicy?: "reject" | "force";

  // Reserved. v1 always executes as "worktree" (leave the diff for manual
  // commit). "pr" (auto branch + pull request) requires future CLI work.
  @ApiPropertyOptional()
  @IsOptional()
  delivery?: "worktree" | "pr";
}
```

### 4.2 agent 轮询 API（token-only）

`POST /module-hub/agent/poll` —— 公开端点（hub module 内绕过 host Guard），token-only，风格对齐 `/applications/heartbeat`：

- 鉴权头：`X-Module-Hub-Token: <token>`（与 `X-Application-Token` 同构；不支持 body 传 token，agent 是唯一客户端，保持单一载体）。
- 服务端 SHA-256 后反查 `HubInstallation.tokenHash`；查不到或 `revokedAt != null` 一律 401。

**请求体直接镜像 `newbie status --json --drift` 的产物**（agent 先跑 status 再转发，避免另造清单格式），外加 CLI 版本与执行回执：

```typescript
export class HubAgentPollDto {
  // newbie CLI version of the agent process, e.g. "0.1.0-stage.1".
  @ApiProperty()
  @IsString()
  cliVersion: string;

  // Verbatim output of `newbie status --json [--drift]` from the project root.
  // Shape (already implemented in the CLI, documented as the contract):
  // { cwd, registry: {available, local, path, sourceCommit},
  //   modules: [{key, version, sourceCommit, localPatches, installed,
  //              hasSchema, missingEnv, updateAvailable, drift?}] }
  @ApiProperty({ description: "Verbatim `newbie status --json` output" })
  status: Record<string, unknown>;

  // Receipts for change requests received in earlier polls.
  @ApiPropertyOptional({ type: [Object] })
  results?: Array<{
    changeRequestId: string;
    outcome: "DONE" | "FAILED";
    // Post-execution snapshot excerpt + changed-file list ("git diff --name-status").
    summary?: Record<string, unknown>;
    error?: string;
  }>;
}
```

响应：

```typescript
export class HubAgentPollResponseDto {
  @ApiProperty()
  serverTime: Date;

  // Requested poll interval (seconds). v1 fixed 60; reserved for hub-side
  // throttling without a CLI upgrade.
  @ApiProperty()
  pollIntervalSeconds: number;

  // Latest registry HEAD commit known to the hub (webhook/fallback ingested).
  @ApiPropertyOptional()
  latestRegistrySourceCommit?: string;

  // PENDING requests for this installation, oldest first, atomically flipped
  // to RUNNING (pickedAt) before being returned.
  @ApiProperty({ type: [Object] })
  pendingChanges: Array<{
    id: string;
    type: "ADD" | "REMOVE" | "UPGRADE";
    moduleKey: string;
    targetSourceCommit?: string;
    driftPolicy: "reject" | "force";
    delivery: "worktree" | "pr";
  }>;
}
```

服务端行为：

1. 反查 installation（401/吊销拒绝）；首 poll 写 `firstSeenAt`，每次写 `lastSeenAt`、`newbieVersion`、`registrySourceCommit`、`modulesSnapshot`（直接存 status JSON）。
2. 处理 `results`：校验单子属于该 installation 且处于 RUNNING → 置 DONE（存 `resultSummary`）或 FAILED（存 `errorReason`）+ `finishedAt` + 审计。
3. 取该 installation 的 PENDING 单（最旧优先；v1 一次全量下发，agent 顺序执行）置 RUNNING 后返回。
4. 不做后台 sweeper：**在线状态读时派生**——`lastSeenAt` 距今 ≤ 3 × `pollIntervalSeconds`（v1 = 180s）为 online；吊销实例恒为离线。

### 4.3 GitHub webhook

`POST /module-hub/webhooks/registry`

- 订阅 registry 仓（`worldzhy/newbie-modules`）push 事件；验签 `X-Hub-Signature-256`，密钥走 host 配置（`module-hub.githubWebhookSecret`）。
- 处理：取 head commit 与本次变更的 `packages/modules/<key>/` 目录集合 → 经 GitHub contents API 读对应 commit 的 `newbie.module.json` → upsert `HubModuleRelease`（`@@unique([moduleKey, sourceCommit])` 幂等）→ 审计 `release.ingest`。
- **不主动推送**：升级可见性通过下次 poll 响应的 `latestRegistrySourceCommit` 与 host 查询 release 表体现。
- **兜底**：本地开发/漏配 webhook 时，hub 进程内定时任务（v1 每 10 分钟）拉 registry HEAD 补登记，与 webhook 共用同一幂等函数。

---

## 5. 与 newbie CLI 的对接（执行通道）

### 5.1 `newbie agent` hub 模式（CLI 待实现）

- 配置 env：`MODULE_HUB_ENDPOINT`（host 前缀）、`MODULE_HUB_TOKEN`（installation token）。**注意**：占位代码当前读 `NIGHTWATCH_REPORT_ENDPOINT`/`NIGHTWATCH_APPLICATION_TOKEN`（[agent.ts](file:///Users/worldzhy/src/newbie/packages/cli/src/commands/agent.ts#L11)），agent 实现时替换，**不与心跳共用 env**。
- 形态：`newbie agent`（daemon，按 `pollIntervalSeconds` 循环；`setInterval` 风格随进程退出停止）与 `newbie agent --once`（单次，CI/cron 友好）。
- 每轮：跑 `newbie status --json --drift` → POST poll → 顺序执行 `pendingChanges` → 结果下轮回执。执行期间不并发领单（单子已置 RUNNING，天然不会被第二个进程重复领取）。

### 5.2 变更类型到现有命令的映射（复用，不重新实现）

| 变更类型     | CLI 路径（已存在的命令）                                                             | 说明                                                                                                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ADD / REMOVE | 生成临时 spec `{"modules": [全量目标集合]}` → `newbie apply --config <spec> --ci -y` | apply 按**全量目标集合**对账增删并重新生成接线；目标集合由 agent 本地以当前 `modules.json` 为准计算（2026-09-28 拍板，见 7.3），hub 只传 `moduleKey` + 动作                                                                      |
| UPGRADE      | `NEWBIE_MODULES_REF=<targetSourceCommit?> newbie update --keys <a,b> -y [--force]`   | CLI 补 `--keys` 单模块选择器（2026-09-28 拍板，见 7.2）；update 到 registry HEAD；CLI 已支持经 `NEWBIE_MODULES_REF`（[registry.ts](file:///Users/worldzhy/src/newbie/packages/cli/src/lib/registry.ts#L19)）钉住 registry commit |

**漂移保护（对齐 `driftPolicy`）**：执行前 agent 跑 `newbie status --json --drift`（机器可读）/ `newbie doctor`（退出码闸门）；存在 drift 且策略为 `reject`（默认）→ 不执行，回执 `FAILED + error="local drift detected"`；`force` → update 带 `--force`（apply 无 `--force`，其增删复制本身不受 drift 影响，但会覆盖被删 module 的本地文件——回执摘要必须列出）。

**变更落点**：v1 只落 **git 工作区 diff**（保守，人工 review/commit）；`delivery: "pr"`（自动建分支开 PR）是 CLI 未来工作量，payload 预留。

**无 daemon 场景**：单子停留 PENDING，host UI 提示「agent 离线，可在项目目录手动执行等价命令」——UI 一键升级是决策端，执行天然异步。

### 5.3 CLI 侧缺口（C1 验收前需在 newbie 仓补齐）

1. **`newbie agent` 实现 hub 模式**：env 读取 `MODULE_HUB_*`、daemon/`--once`、HTTP 轮询、`apply`/`update` 调用编排、回执收集（`git diff --name-status` + 执行后 status 快照）。
2. **`newbie update` 补单模块选择器 `--keys <a,b>`**（2026-09-28 拍板，见 7.2）：现状交互式 checkbox 或 `--all`；C1 要求 UPGRADE 单可精确到单 module，需补 `--keys` 过滤。
3. 执行摘要：agent 需自行收集 `git diff --name-status` 与执行后 status 快照作为回执（CLI 无现成命令，agent 内部实现）。
4. `delivery: "pr"` 的建支/开 PR 能力（推迟，非 C1 阻塞）。

---

## 6. 模块形态与装配

- registry 目录：`newbie-modules/packages/modules/module-hub/`，普通 module（非共享基础设施），无独立仓库/独立 tag，随 registry 发布。

```text
packages/modules/module-hub/
├── newbie.module.json          # 含 "schema": "prisma/schema.prisma"
├── prisma/
│   └── schema.prisma           # 第 3 章四个模型（@@schema("module/module-hub")）
├── module-hub.module.ts
├── module-hub.dto.ts
├── controllers/
│   ├── installations.controller.ts  # host 集成 API（4.1）
│   ├── agent-poll.controller.ts     # token-only 轮询（4.2）
│   └── webhook.controller.ts        # registry push（4.3）
└── services/
    ├── installation.service.ts
    ├── release.service.ts           # webhook 登记 + 定时兜底
    └── change-request.service.ts
```

- manifest 约定（与 shortcut 等既有 schema module 一致）：`{"key":"module-hub","module":{"file":"module-hub.module","className":"ModuleHubModule"},"schema":"prisma/schema.prisma", ...dependencies}`。
- 装配命令：`newbie config --add module-hub` + `newbie install -y`（[index.ts](file:///Users/worldzhy/src/newbie/packages/cli/src/index.ts#L78)），非 `newbie add`（CLI 无此命令）。装配后：fragment 复制到 host `prisma/models/module-hub.prisma`、datasource 追加 `"module/module-hub"`、重新生成 modules 接线与 Prisma client。
- **migration 由 host 执行**：CLI 不跑 migrate；host 装配后自行在 node 容器内 `npx prisma migrate dev --name add_module_hub`。
- host Guard 接线：agent poll 与 webhook 两个公开端点需在 host 安全配置中放行（沿用 `@NoGuard()`/`openApiRoutes` 既有机制，实施时按 host 现状选择）。
- hub 不 import host 业务模块（与 application schema 零耦合，天然可插拔）。

---

## 7. 开放问题（评审决策点）

1. **token 签发形态**：本文采用「host 预创建 installation → 发 token → 首 poll 自注册运行时事实」。框架定稿原文「CLI 首次带 token 轮询时 hub 自动登记 installation」也可解读为「一次性 enrollment token 换发 installation token」。前者更简单且与 nightwatch 现有凭证引导 UX 一致，**建议取前者**。

2. **UPGRADE 范围**（2026-09-28 拍板：**选 B**）：CLI 补 `--keys` 实现单 module 升级，agent 轮询协议无需改。

3. **ADD/REMOVE 目标集合在哪算**（2026-09-28 拍板：**选 B**）：agent 以本地当前 `modules.json` 为准本地增减；hub 只传 `moduleKey` + 动作，避免过期快照误删。

4. **轮询参数**：默认 60s、离线阈值 180s（3 跳）是否合适？daemon 在开发机上的资源占用与 git 操作并发是否需要单实例锁（同 token 两个进程同时执行）？

5. **`delivery: "pr"` 时机**：v1 仅工作区 diff；自动 PR 依赖 GitHub 凭证体系，是否列入 v1.1？

6. **设计文档归属**：本文件为 newbie 工作区框架真源；nightwatch 消费侧 `.trae/documents/module-hub-design.md` 在评审通过后替换为引用 + 宿主集成章节。

---

## 8. 验证方案（对齐 roadmap C1 验收链）

在 node 容器内执行（host 消费项目路径，如 `/home/worldzhy/src/nightwatch-backend-next`）：

1. registry 发布 module-hub（含 prisma fragment）→ host `newbie config --add module-hub` + `newbie install` → `prisma migrate dev --name add_module_hub` → `tsc --noEmit` 通过、应用启动正常。
2. host API 创建 installation（label/externalRef）→ 明文凭据一次性返回；重复查看不再泄露。
3. 项目目录配置 `MODULE_HUB_ENDPOINT`/`MODULE_HUB_TOKEN` → `newbie agent --once`（或 curl 模拟，body 为真实 `newbie status --json --drift` 输出）→ `firstSeenAt/lastSeenAt/快照` 落库；host 列表 `online=true`。
4. registry 推新 commit（webhook 或兜底任务）→ `hub-module-release` 新行；catalog 与 installation 快照体现可升级。
5. 创建 UPGRADE 变更单 → 下轮 poll 领取（PENDING→RUNNING）→ agent 执行 `newbie update` → 回执后 DONE，`resultSummary` 含变更文件与新快照；审计链完整。
6. ADD/REMOVE 变更单 → agent 经 `newbie apply --ci` 全量对账执行 → 回执后快照收敛。
7. 漂移保护：人为制造本地修改 + `driftPolicy=reject` → 单子 FAILED 且文件未动；`force` → 覆盖执行。
8. 吊销 token → poll 401；无 daemon 时新单停留 PENDING（不超时翻转）。

---

## 附录：文档变更记录

| 版本 | 日期       | 变更                                                                                           |
| ---- | ---------- | ---------------------------------------------------------------------------------------------- |
| v1   | 2026-09-28 | 初始定稿，基于 nightwatch 消费侧 v2 草案改写为框架真源；去 project 化、4 表结构、CLI 现状核对  |
| v1.1 | 2026-09-28 | 开放问题 2/3 拍板：UPGRADE 支持单模块（CLI 补 `--keys`）；ADD/REMOVE 目标集合由 agent 本地计算 |
