# Devbie 框架开发计划（v1 之后）

> 状态：规划草案（2026-09-27）
> 前置文档：
> - [newbie-framework-split-plan.md](./newbie-framework-split-plan.md) — 后端框架拆分方案（Phase 1-6）
> - [fewbie-framework-design.md](file:///Users/worldzhy/src/fewbie/.agent/documents/fewbie-framework-design.md) — 前端框架设计决议

## 一、v1 已完成范围

### newbie（后端框架）
| 交付物 | 状态 | 版本 |
| --- | --- | --- |
| `@devbie/newbie` core（exception-filters / pipes / prisma / NewbieFactory / heartbeat / backend-monitor 探针） | ✅ 已发布 | `0.1.0-stage.2` |
| `@devbie/newbie-cli`（create / install / update / doctor / apply / status / agent / check / update-template / config / env） | ✅ 已发布 | `0.1.0-stage.1` |
| `@devbie/nightwatch-heartbeat-sdk`（token-only 心跳内核） | ✅ 已发布 | `0.1.0-stage.0` |
| newbie 模板（basic 骨架 + 薄 main.ts + 心跳接线） | ✅ 已发布 | 随 core |
| `newbie-modules` registry（48 个 module 迁入，复制模型装配管线） | ✅ 可用 | — |

### fewbie（前端框架）
| 交付物 | 状态 | 版本 |
| --- | --- | --- |
| `@devbie/fewbie-cli`（init / add / gen api） | ✅ 已发布 | `0.1.0-stage.0` |
| registry 4 件（api-client / auth / theme / login-form） | ✅ 已发布 | 随 CLI |
| fewbie 模板（Next 16 + Tailwind v4 + shadcn + 心跳接线） | ✅ 已发布 | `template-v0.1.0-stage.0` |

---

## 二、待开发功能总览

按优先级与依赖关系分为四个阶段。**阶段内可并行，阶段间有强依赖。**

### Phase A — 可立即并行（无外部依赖）

| # | 功能 | 归属 | 优先级 |
| --- | --- | --- | --- |
| A1 | backend-monitor 探针 Nit 优化 | newbie core | 高 |
| A2 | `@devbie/web-monitor-sdk` 包发布（改名 + thin wrapper） | newbie + fewbie | 高 |
| A3 | `fewbie doctor` 命令 | fewbie CLI | 中 |
| A4 | `fewbie update` 命令（组件/token diff PR） | fewbie CLI | 中 |
| A5 | fewbie 其余 add 件（data-table / page-header / settings-required-state） | fewbie registry | 中 |

### Phase B — 开发体验增强

| # | 功能 | 归属 | 优先级 | 前置 |
| --- | --- | --- | --- | --- |
| B1 | `newbie dev-sync` 命令（watch registry 实时同步） | newbie CLI | 中 | 无 |

### Phase C — 中心化控制面（核心未做项）

| # | 功能 | 归属 | 优先级 | 前置 |
| --- | --- | --- | --- | --- |
| C1 | module-hub 控制面（Prisma 模型 + API + agent 通道） | newbie-modules | 高 | nightwatch Application/Agent 模型落地 |
| C2 | Modules 前端面板 | nightwatch-frontend | 高 | C1 + UI 层次重构 |

### Phase D — GA 发布

| # | 功能 | 归属 | 优先级 | 前置 |
| --- | --- | --- | --- | --- |
| D1 | 全部包升 `0.1.0` + 移动 `latest` dist-tag | newbie + fewbie | 高 | A/B/C 验收通过 |
| D2 | nightwatch-frontend MUI → shadcn/ui 渐进迁移 | nightwatch-frontend | 中 | fewbie v1 稳定 |

---

## 三、各阶段详细计划

### Phase A — 可立即并行

#### A1. backend-monitor 探针 Nit 优化
- **目标**：根据 nightwatch 侧 E2E 结果打磨探针行为
- **范围**：`packages/core/src/monitoring/` 下的 interceptor / middleware / reporter
- **输入**：nightwatch-backend 仓 backend-monitor E2E 报告中的 Nit 清单
- **验证**：容器内 `npm test`（reporter 单测）+ nightwatch 侧全链路冒烟
- **交付**：core 升 stage 版本发布

#### A2. `@devbie/web-monitor-sdk` 包发布 + thin wrapper
- **目标**：把浏览器监控包从旧名 `@inceptionpad/frontend-monitor-web-sdk@1.0.0` 演进为 `@devbie/web-monitor-sdk`
- **约束**：只做浏览器端数据上报（PV / AJAX / 资源 / JS 错误 / 业务错误码 / 自定义事件），**不得加心跳与密钥逻辑**
- **newbie 侧**：
  - 新建 `packages/web-monitor-sdk/`（或独立仓），从现有 SDK 抽取核心
  - 发布 `@devbie/web-monitor-sdk@0.1.0-stage.0`
- **fewbie 侧**：
  - registry 新增 `web-monitor-sdk` 件：`fewbie add web-monitor-sdk` 脚手架 layout 注入采集组件 + 加 npm 依赖
  - 心跳接线仍由模板 `instrumentation.ts` 负责（`@devbie/nightwatch-heartbeat-sdk`），与本件解耦
- **验证**：fewbie 模板 `add web-monitor-sdk` 后 `next build` 通过 + 浏览器控制台确认上报

#### A3. `fewbie doctor` 命令
- **目标**：项目健康检查
- **检查项**：
  - v0 可读性：registry 件源码是否在项目内（非 npm 包黑箱）
  - CSS 变量 token 一致性：`globals.css` 与 `components.json` 对齐
  - 依赖检查：`api-client` / `auth` 等件的依赖是否齐全
- **输出**：人类可读报告 + `--json` 模式
- **验证**：在干净模板上跑 `fewbie doctor` 零告警；手动破坏 token 后能检出

#### A4. `fewbie update` 命令
- **目标**：registry 组件/token 升级 → diff PR
- **机制**：类比 `newbie update-template`，拉取 registry 新版本，diff 项目内已安装件的源码，生成可 review 的变更
- **边界**：只 diff `fewbie add` 安装的件，不动用户业务代码；已被本地修改的件提示冲突
- **验证**：安装旧版件 → 修改 registry 件 → `fewbie update` 生成正确 diff

#### A5. fewbie 其余 add 件
| 件 | 类型 | 内容 |
| --- | --- | --- |
| `data-table` | UI | 基于 shadcn table + 排序/分页/筛选的通用数据表格 |
| `page-header` | UI | 标准页头（标题 + 描述 + 操作区） |
| `settings-required-state` | UI | 设置缺失时的引导状态页 |
- **约束**：全部以 shadcn registry 兼容格式存放，双端可装
- **验证**：`fewbie add <name>` 后 `next build` 通过 + 官方 `npx shadcn add <registry-url>/<name>` 也能装

---

### Phase B — 开发体验增强

#### B1. `newbie dev-sync` 命令
- **目标**：解决复制模型下"改完 registry 要重新 install 才生效"的开发痛点
- **机制**：watch `newbie-modules/packages/modules/<key>/` 目录变更，实时同步到消费项目 `src/modules/<key>/`
- **用法**：`newbie dev-sync <key>` 或 `newbie dev-sync --all`
- **边界**：只同步源码，不重跑装配管线（env / prisma 合并仍需 `newbie install`）；检测到本地修改时提示冲突
- **验证**：改 registry module 源码 → 消费项目文件实时更新 → 应用热重载生效

---

### Phase C — 中心化控制面

#### C1. module-hub 控制面
- **目标**：跨项目 module 全生命周期管理（安装状态、版本编排、变更单、agent 心跳）
- **形态**：作为普通 module 收录在 `newbie-modules` registry（`packages/modules/module-hub/`），经 `newbie add module-hub` 复制装配
- **数据模型**（独立 PG schema `module/module-hub`）：
  | 表 | 职责 |
  | --- | --- |
  | `hub-project` | 项目在 Hub 的纳管登记（非 Project CRUD，归 Application 层） |
  | `hub-module-release` | registry 版本目录登记 |
  | `hub-installation` | 各项目 `modules.json` 安装状态视图 |
  | `hub-change-request` | 升级变更单 |
  | `hub-agent` | 统一 Agent 表的 Hub 侧注册与心跳视图 |
  | `hub-audit-log` | 操作审计 |
- **API**：
  - 模块目录浏览（registry 镜像）
  - 安装清单查询（按 project/agent）
  - 变更单创建/审批/执行
  - GitHub webhook（registry 发布触发升级通知）
  - `newbie agent` 出站轮询通道（NEWBIE_MANAGEMENT 类型）
- **前置依赖**：nightwatch Application/Agent 统一数据模型落地（UI 层次重构 Phase 1）
- **验证**：nightwatch `newbie add module-hub` → 启动 → agent 注册 → 心跳上报 → 安装清单可见

#### C2. Modules 前端面板
- **路由**：`/projects/[projectId]/applications/[applicationId]/modules/{overview,modules,upgrades,doctor}`
- **页面**：
  - overview：项目 module 安装概览 + 在线状态
  - modules：已装 module 列表 + 版本 + 漂移状态
  - upgrades：可用升级 + 变更单
  - doctor：漂移检测报告 + 本地修改清单
- **前置**：C1 API + UI 层次重构路由框架
- **边界**：不存在顶层 `/module-hub/` 路由，统一嵌套在 project/application 下

---

### Phase D — GA 发布与迁移

#### D1. GA 发布（`0.1.0`）
- **触发条件**：Phase A/B/C 验收通过，消费项目（nightwatch-backend-next）全链路稳定运行
- **操作**：
  1. 所有包从 `0.1.0-stage.x` 升到 `0.1.0`
  2. 发布时移动 `latest` dist-tag 到 `0.1.0`
  3. 打正式模板 tag（`template-v0.1.0`）
  4. 更新 README 示例从 `@stage` 改为正式版
- **回滚预案**：保留 `stage` dist-tag 指向最后一个 stage 版本，GA 出问题可回切

#### D2. nightwatch-frontend MUI → shadcn/ui 迁移
- **策略**：渐进式，不一次性重写
  - 新路由直接用 shadcn/ui
  - 旧 MUI 路由按模块逐步替换（优先替换与 v0 生成交互多的页面）
  - 共享组件层（`src/components/`）先建 shadcn 等价件，再替换引用
- **前置**：fewbie v1 稳定 + UI 层次重构路由框架落地
- **验证**：每个路由替换后视觉回归 + 交互回归

---

## 四、依赖关系图

```
nightwatch Application/Agent 模型（UI 层次重构 Phase 1）
        │
        ▼
   C1 module-hub 控制面
        │
        ├──→ C2 Modules 前端面板
        │
        ▼
   A1 backend-monitor Nit  ──┐
   A2 web-monitor-sdk 改名   │
   A3 fewbie doctor          │── 并行 ──→ D1 GA 发布
   A4 fewbie update          │
   A5 fewbie 其余 add 件      │
   B1 newbie dev-sync        ┘
        │
        ▼
   D2 MUI → shadcn 迁移（依赖 fewbie 稳定）
```

---

## 五、验证标准总则

所有阶段交付物须满足：
1. **容器内构建通过**：`npm run build`（core）/ `tsc --noEmit`（CLI）无错误
2. **测试通过**：单测全绿，新增功能补单测
3. **消费项目冒烟**：在 nightwatch-backend-next 或新建模板项目上跑通端到端
4. **版本对齐**：发布版本与 `package.json` 一致，`stage` dist-tag 正确
5. **记忆同步**：发布后更新 project_memory.md 的版本线与流程教训

---

## 六、当前阻塞项

| 阻塞项 | 影响 | 责任方 |
| --- | --- | --- |
| nightwatch Application/Agent 模型未落地 | C1/C2 无法启动 | nightwatch 工作区 |
| nightwatch-backend-next 生产切换未完成 | D1 GA 缺乏稳定验证环境 | nightwatch 工作区 |
| backend-monitor Nit 清单未输出 | A1 无法启动 | nightwatch 工作区 |

**建议下一步**：先推进 Phase A 的 A2（web-monitor-sdk 改名）和 A3/A4/A5（fewbie doctor/update/add 件），这些不依赖 nightwatch 侧，可在本工作区立即执行。
