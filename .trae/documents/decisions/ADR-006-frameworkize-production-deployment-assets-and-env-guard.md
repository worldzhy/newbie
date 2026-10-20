# ADR-006: 框架化生产部署资产 + env 键校验守卫

状态：提议中
日期：2026-10-20

## 背景

**问题 1：生产部署资产无单一真源。**
`deploy.sh`、`render-env.sh`、`compose.prod.yml`、`Caddyfile.tmpl` 只存在于生产主机 `/opt/nightwatch/` 下，任何仓库（nightwatch-backend、newbie、newbie-starter）都没有副本。它们无版本化、无可追溯历史、主机丢失即丢失。今天能读到 `render-env.sh` 内容纯靠 SSM 现场执行 `cat`。

**问题 2：env 漏配无法被拦截。**
2026-10-20 `LARK_VERIFICATION_TOKEN` 事故：代码（`.env.example` 与 lark.service.ts）声明了新 env，但 AWS Secrets Manager `nightwatch/prod/env` 未配置该键；部署静默成功，明文回调全部 503，直到用户发现。根因不是"配置麻烦"，而是"漏配了没人拦"。

**问题 3：已有 `newbie secrets` CLI 但未接通。**
`@devbie/aws-secrets-cli`（`aws-secrets-manager` 模块的 CLI 插件）已提供 `secrets pull`/`push`/`deploy-rotation`，nightwatch-backend 已装配该模块。但 nightwatch-backend **没有** `.newbie/env.config.json`（`ENV_TOOL_CONFIG_CANDIDATES`），命令直接报 "config not found"。生产侧用的是主机 `render-env.sh` 的 jq 管道，与框架 CLI 完全并行，逻辑分叉。

**为什么先决定再写代码：**
这是跨宿主契约级改动——部署资产的载体选择、`render-env.sh` 与 `secrets pull` 的关系、守卫的声明键来源，都会影响所有消费 newbie 的宿主项目。一旦写下去再改，迁移成本高。

## 候选方案

### 维度 A：部署资产（deploy.sh / render-env.sh / compose.prod.yml / Caddyfile.tmpl）的载体

| 选项 | 做法 | 说明 |
|------|------|------|
| A1 | 收进 **newbie-starter 模板**（作为模板根 `deploy/` 目录），`newbie create` 自动带入；升级走 `newbie update-template` | 与"骨架文件"同通道，宿主只填参数（secret id、域名、服务名） |
| A2 | 做成 **newbie-modules registry 模块**（如 `deploy-docker`），宿主按需装配 | 模块化，但部署逻辑不是业务能力，放 registry 与模块分层模型（domain/capability/foundation）不符 |
| A3 | 维持主机手维护，仅加文档 | 不变，但问题 1 不解决 |

### 维度 B：render-env.sh 与 `newbie secrets pull` 的关系

| 选项 | 做法 |
|------|------|
| B1 | **render-env.sh 改为调用 `newbie secrets pull`**（或其底层逻辑），废弃主机 jq 管道；env 工具单源 |
| B2 | 两者并存：render-env.sh 保留，`secrets pull` 仅用于本地开发 |
| B3 | render-env.sh 不变，仅在其前加守卫检查 |

### 维度 C：键校验守卫的"声明键"来源

| 选项 | 来源 | 说明 |
|------|------|------|
| C1 | **`.env.example`**（CLI 从模块 env config 生成，已是代码声明 env 的真源） | 与代码声明天然同步，新增 env 自动进声明集 |
| C2 | `env.config.json` 的 `secrets[].keys` | 需手工维护，与代码声明可能漂移（正是事故模式） |
| C3 | 两者交集 | 最严但维护成本高 |

### 维度 D：守卫执行位置

| 选项 | 位置 | 说明 |
|------|------|------|
| D1 | **GitHub Actions deploy.yml**（OIDC 已有 AWS creds），build 之前 | fail-fast，不构建带病镜像；需 workflow 装 node + `npm ci` |
| D2 | 主机 `deploy.sh` / `render-env.sh` 内 | 离渲染最近，但失败时镜像已推 |
| D3 | 两处都跑 | 双重保险，冗余 |

## 决策

待用户拍板。建议组合：**A1 + B1 + C1 + D1**。

决定性理由（若采纳此组合）：
- A1：部署资产是"项目骨架"的一部分，与 `main.ts`/`tsconfig` 同属 `newbie update-template` 同步范围，无新概念引入。
- B1：消除"主机 jq 管道 vs 框架 CLI"双源分叉，env 渲染逻辑只维护一份。
- C1：`.env.example` 已是代码→env 的声明真源（模块 env config 自动生成），守卫用它等于"代码要什么，secret 必须有什么"，零额外维护。
- D1：fail-fast 是治理口径；deploy.yml 已有 OIDC 角色，加一步零额外权限。

## 跨宿主 / 演进检验

- **换宿主成立吗？** A1/B1/C1 对任何 newbie 宿主通用（secret id、域名、compose 服务名是宿主参数）。D1 依赖 GitHub Actions OIDC——若宿主用 GitLab/自建 CI，守卫需改成对应 CI 步骤，但 `newbie secrets check` 命令本身 CI-agnostic。
- **泄漏厂商概念吗？** `secrets pull` 已支持多环境配置（env.config.json），secret 后端是 AWS 但接口抽象在 `@devbie/aws-secrets-cli` 内；未来换 GCP/Azure 是替换实现而非改契约。compose.prod.yml / Caddyfile 是部署编排而非厂商绑定。

## 影响

**变易：**
- env 变更从"控制台手编 71 键 JSON"降为 `newbie secrets push`（或 pull 的反向），且 `secrets check` 在部署前挡漏配。
- 部署资产可追溯、可回滚、可跨宿主复用。
- 主机只剩"参数"（secret id、域名），无逻辑。

**变难 / 后续工作：**
- 一次性迁移：nightwatch-backend 补 `.newbie/env.config.json`；主机部署资产从模板重新生成并验证等价；`render-env.sh` 切换到 `secrets pull`。
- `newbie secrets` 需新增 `check` 子命令（读 `.env.example` 键集 ⊆ secret 键集，缺键非零退出）。
- deploy.yml 加 `secrets check` 步骤（需 `npm ci` + OIDC 已有）。
- 模板 `deploy/` 资产需参数化（secret id、域名、服务名从 `.env` 或配置注入）。
- 新增"框架化部署资产"的 `update-template` 同步测试，防止漂移（类似 check-template-sync）。

## 取证索引

- `@devbie/aws-secrets-cli`：`packages/aws-secrets-cli/src/{index.ts,pull-push.ts,env-tool-config.ts}`
- env.config.json 候选：`packages/cli/src/constants/paths.ts:29`（`.newbie/env.config.json`）
- 模块 CLI 动态加载：`packages/cli/src/lib/module-cli.ts`
- nightwatch-backend 装配了 aws-secrets-manager 但无 env.config.json（grep 零命中）
- 生产 deploy.yml OIDC 已有：`nightwatch-backend/.github/workflows/deploy.yml:30-34`
- 生产部署资产仅在主机 `/opt/nightwatch/`：SSM 现场取证
