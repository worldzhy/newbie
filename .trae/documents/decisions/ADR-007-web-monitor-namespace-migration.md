# ADR-007: web-monitor 模块命名空间迁移至 /web-monitor/*

状态：**已采纳（P9b，2026-10-20）**
日期：2026-10-20
关联：ADR-006（框架化生产部署资产）第 3 条待拍板项；本迁移后 Caddy `/api/v1/*` 例外净删除。

## 背景

四个 collector 模块中，web-monitor 是唯一使用 `/api/v1/*` 命名空间的离群者：

| Collector | 控制器基路径 |
|---|---|
| heartbeat | `/heartbeat` |
| health | `/health` |
| backend-monitor | `/backend-monitor` |
| module-hub | `/module-hub` |
| **web-monitor** | **`/api/v1`** |

这一离群导致三个问题：

1. **Caddy 路由分叉**：`Caddyfile.tmpl` 必须保留 `/api/v1/*` 例外 handle（forward unchanged），与其余 `/api/*` strip 规则不一致。每新增原生 `/api/<segment>` 路由都要手动加例外——裸操作风险。
2. **前端调用风格不一致**：web-monitor 的 43 处生成客户端调用带 `/api/v1` 前缀，依赖 baseURL `/api` + 路径 `/api/v1/...` 的双 `/api` 叠加才能正确路由；其他 collector 调用无 `/api` 前缀。
3. **audit 粒度过粗**：`EXCLUDED_PATH_PREFIXES = ["/api/v1", "/heartbeat/ping"]` 用 `/api/v1` 整段前缀排除，导致 web-monitor dashboard 查询（已认证用户操作）也被排除在审计之外。同时其余三个 collector 的上报端点（`/module-hub/report`、`/backend-monitor/ingest`、`/health/snapshot`）同为高流量机器流量却未被排除，与注释"High-volume machine traffic is excluded"矛盾。

宿主未正式使用 v1，无 legacy 消费者，无兼容期负担。

## 候选方案

### P9a：仅公开面迁移
- 只把 SDK 上报入口 `/api/v1/report/web` 改为 `/web-monitor/report/web`。
- 其余 10 个 dashboard 控制器仍留在 `/api/v1/*`。
- 问题：Caddy 仍需 `/api/v1/*` 例外（dashboard 查询还在），离群未根治；前端调用风格仍不一致。

### P9b：整模块迁移（选定）
- 全部 11 个控制器从 `/api/v1*` 迁到 `/web-monitor/*`。
- Caddy `/api/v1/*` 例外净删除，新增 `/web-monitor/*` handle。
- 前端重生成，调用风格与其他 collector 一致。
- audit 排除从"按模块命名空间"改为"按具体上报端点"，收窄 web-monitor 并补齐其他 collector。

### 什么都不做
- 维持 `/api/v1` 离群，Caddy 例外与 audit 粒度问题持续存在。

## 决策

**P9b：整模块迁 `/web-monitor/*`。**

决定性理由：四 collector 已有"顶级模块键命名空间"惯例（`/heartbeat`、`/health`、`/backend-monitor`、`/module-hub`），module-hub 的宿主集成 API（`/module-hub/installations`，供宿主前端面板消费）同在模块命名空间内——这是已验证的先例。web-monitor 作为第五个 collector，遵循同一惯例是架构一致性的要求，而非新发明。P9a 只迁公开面会留下"半套 v1"的不一致，Caddy 例外与前端双 `/api` 问题都不解决。

### 子路由去冗余

模块内子路由的 `web` 限定词同步消除：
- `@Post("/report/web")` → `@Post("/report")`：report 控制器只有一个上报入口，无 `/report/wx` 等变体，`web` 冗余。
- `@Get("/web/list")` → `@Get("/list")`：`getWebSiteList()` 过滤 `type:"web"`，但全模块默认 `type=web`、无 wx 上报端点，过滤实际为 no-op（保留以兼容历史文档）。

### audit 排除修正

从"按模块命名空间排除"改为"按具体上报端点排除"：

```
EXCLUDED_PATH_PREFIXES = [
  "/web-monitor/report",      // browser SDK ingestion
  "/module-hub/report",       // server SDK ingestion
  "/backend-monitor/ingest",  // backend agent ingestion
  "/health/snapshot",         // health agent ingestion
  "/heartbeat/ping",          // agent liveness ping
]
```

排除语义：5 个 collector 上报/探活端点（高流量、installation token 认证、自有数据存储）不写 audit 表也不写 access log；所有 dashboard 查询与 installation 管理端点（用户操作、JWT 认证）纳入审计。

## 跨宿主 / 演进检验

- 命名空间 `/web-monitor/*` 是模块键，不绑定 nightwatch 宿主——任何宿主装配 web-monitor 模块都得到同一路径，Caddy handle 由模块 manifest 的 `publicNamespace` 声明渲染（ADR-006 B2）。
- audit 排除列表是宿主层配置（`http-access.interceptor.ts`），不写入模块——换宿主时由宿主决定哪些端点排除，模块不泄漏宿主审计策略。
- `REPORT_PATHS.webMonitor` 收敛到宿主共享文件，模块不导出路径常量，避免宿主对模块内部路径的编译期依赖。

## 影响

### 跨四仓变更清单

| 仓库 | 文件 | 变更 |
|---|---|---|
| nightwatch-backend | 11 个控制器 `@Controller` + 2 个子路由 | `/api/v1*` → `/web-monitor/*`，`/report/web` → `/report`，`/web/list` → `/list` |
| nightwatch-backend | `audit/http-access.interceptor.ts` | 排除列表改为 5 个上报端点 |
| nightwatch-backend | `application/project/applications/` | `REPORT_PATHS` 提取到共享 `report-paths.ts`，`webMonitor` → `/web-monitor/report` |
| nightwatch-backend | `application.dto.ts` | DTO 描述 URL 更新 |
| nightwatch-backend | `web-monitor/prisma/schema.prisma`、`services/web-installation.service.ts` | 注释 URL 更新 |
| nightwatch-backend | `deploy/Caddyfile.tmpl` | 删 `/api/v1/*` handle，加 `/web-monitor/*` handle |
| newbie-modules | `packages/modules/web-monitor/` | 机械 back-port 控制器变更 |
| newbie | `packages/web-monitor-sdk/src/core.ts` | `filterUrlsDefault` → `/web-monitor/report` |
| newbie | `packages/web-monitor-sdk/README.md` | 示例 URL 更新 |
| nightwatch-frontend | `src/api/_gen/api.ts` | apits-gen 重生成 |

### 行为变更（须在提交信息中说明）

1. **web-monitor dashboard 查询纳入审计**：原 `/api/v1` 前缀排除过宽，dashboard 查询（`/web-monitor/ajax/*`、`/web-monitor/analysis/*` 等）现在会写 access log。
2. **module-hub/backend-monitor/health 上报端点停止写 access log**：原未被排除，现在加入排除列表，减少高流量日志噪音。
3. **浏览器 SDK 上报端点变更**：`/api/v1/report/web` → `/web-monitor/report`。SDK 消费者的 `api` 配置由宿主 onboarding 接口的 `endpoint` 字段驱动，随部署自动更新，无需手动改配置。

### 后续工作

- ADR-006 B2：Caddy `/web-monitor/*` handle 改由模块 manifest `publicNamespace` 声明渲染，消除手写 handle。
