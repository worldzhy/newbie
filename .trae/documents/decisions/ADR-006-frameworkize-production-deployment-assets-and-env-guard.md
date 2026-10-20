# ADR-006: 框架化生产部署资产 + env 键校验守卫

状态：**方案 II（单一真源 + 分文件同步）+ B2（模块清单声明 + 确定性渲染）已拍板（2026-10-20 深夜）**，取代本文件早先的 A1（模板收编为示例）与 A4（宿主主权 + drift diff）讨论稿（均未实施，属起草期迭代非契约变更）；C1+D1（`newbie secrets check` 守卫）已落地（nightwatch-backend c5d6505 / newbie 8754bfc）。
日期：2026-10-20

## 背景

- deploy/ 真源 = 宿主仓 `nightwatch-backend/deploy/`（10 文件 1488 行），经 Dockerfile `COPY /deploy` → 镜像 → deploy.sh `docker cp` 到主机；主机不是真源，但该真源绑定特定宿主、未抽象。
- 行级分类（手工判定，±10%）：通用机制 ~50%（747 行）+ 模块派生 ~16%（236）+ 宿主参数 ~29%（431）+ 客户业务 ~5%（74）。扣 stack.yml 后非宿主占 80%。
- `start.sh` 与 `deploy.sh` 的"镜像提取 assets + 调 render-env"逻辑逐行重复——宿主内部已存在"不可复用"实证。
- 生产主机无 node（jq-1.8.1 / aws-cli 2.36 / docker 29.9.1 在位）；render-env.sh 34 行 jq 管道极简、无 bug。
- env 漏配守卫已落地；`.newbie/env.config.json` 已存在。

## 改判记录（方案 I/A4 → 方案 II）

方案 I（宿主主权 + 参考实现 + 只读 drift diff）被否的三条理由：

1. 修复传播靠人工（diff 发现 + cherry-pick），违反"事前自动拦截优先于事后记录"与"禁止裸操作"。
2. "主动复用导向"原则 + 80% 非宿主数据 + start.sh/deploy.sh 重复实证，指向提取框架层。
3. `/api/v1` 全删拍板后 Caddy 路由统一，方案 II 的结构性差异只剩 UI（可数据化，见下）。

## 决策：方案 II + B2

### 文件所有权二分

| 层 | 文件 | 所有方 | 同步 |
|---|---|---|---|
| 框架层 | render-env.sh / deploy.sh / start.sh / backup.sh / compose.prod.yml 骨架 / Caddyfile.tmpl | 框架（唯一真源） | 走同步通道 |
| 宿主层 | deploy.config.json / env.config.json / aws/stack.yml / clickhouse/config.d/memory.xml / 宿主 compose overlay | 宿主 | 永不被覆盖 |

框架层承载形式（次生决策）：update-template 白名单扩展 **或** `@devbie/deploy` npm 包——倾向后者（版本语义清晰 + 既有依赖守卫可强制升级）。

### B2：模块派生内容（~16%）的产出

`newbie.module.json` 增基础设施声明 → 装配期确定性渲染 compose 服务片段 / env.template 键段 / backup.sh 引擎清单 / Caddyfile 公开命名空间 handle。渲染器是机制不是真源（同 render-env.sh 之于 .env 的关系）。**postgres 非模块**（55 个 manifest 无此模块，Prisma 主干库依赖它）→ 框架级声明兜底。

### C1 升格为必要前提

宿主值全部外置 `deploy.config.json` + `env.config.json`——没有参数外置，框架层文件无法逐字节相同，同步机制失效。理由是可验证性（diff 全红则工具无意义），不是成本。

**C1 已落地（2026-10-21）**：五脚本 INSTALL_DIR 自推导、REGION 走 config→IMDS→fail-fast、compose 卷相对化、env.template 标记化、新增共享 lib.sh（fail-fast 自带 schema）；主机两个 config 经 SSM 显式放置，secret 退役 SITE_DOMAIN/ACME_EMAIL/ECR_REPOSITORY_PREFIX/IMAGE_TAG 四键（75→71）；断链按"安全联锁"语义接受（旧栈零停机，补 config 重跑即恢复），未引入任何自动生成代码。提交：nightwatch-backend 7e38a03（主体）/ fc03a9f（SSM 死参清理）/ cc0481e（CI OIDC 角色补 secretsmanager:GetSecretValue，CFN 部署生效）；newbie 8ac7ddd（aws-secrets-cli 1.1.2 修复手工凭证丢 AWS_SESSION_TOKEN 致 OIDC 必挂——c5d6505 守门步自引入起从未通过的根因）。生产等价性验证：部署链路全绿收敛（cc0481e），七容器 healthy，.env 74 键零重复，Caddyfile 渲染一致。

### B1c

render-env.sh 的 INSTALL_DIR / SECRET_ID / REGION 硬编码改由 env.config.json 驱动（主机零新依赖，jq/aws 已在位）。

### UI 数据化（方案 II 隐含必要项）

compose `frontend` 服务挂 `profiles: ["ui"]`；caddy `depends_on: { frontend: { condition: service_started, required: false } }`（无 profile 时依赖不启用服务非法，方向性陷阱：现 clickhouse-backup→clickhouse 是合法方向，caddy→frontend 不是）；Caddyfile 默认 handle 占位符化（UI 未启用回落 backend/404，复用 `__SITE_DOMAIN__` 的 sed 机制）；stack.yml `EcrFrontend` 加 CFN Condition + 开关。框架建"可选 UI（0 或 1 个）"一等概念；多 UI 属宿主 overlay。不做生成物 DSL（config 变第二真源）。

### `/api/v1` 删除对本 ADR 的输入

v1 全删已拍板（宿主未正式使用，无 legacy 负担）：Caddyfile `/api/v1` 例外净删除，路由统一为 `/api/*` strip → backend + 默认 → frontend；"新模块原生路由要记得改 Caddy"类裸操作整类消失。**P9b 已拍板（2026-10-20）**：web-monitor 整模块迁 `/web-monitor/*`（对齐四 collector 顶级模块键命名空间先例 /heartbeat /health /backend-monitor /module-hub，module-hub 宿主集成 API `/module-hub/installations` 即先例），v1 前缀同步删除。契约细节（audit 排除精确化、宿主 `webMonitor:` 字面量收敛、SDK `filterUrlsDefault`、前端 40 处生成调用重生成、Next dev 代理核实、Caddy handle 由 manifest publicNamespace 生成）由 web-monitor 契约 ADR 承载，结论回填本 ADR 的 Caddyfile.tmpl handle 块。

### 两轴判据（本次固化；模板文件所有权与部署资产共用）

`是客户业务？ × 跨宿主可通用？`——main.ts（无业务、可通用）→ 框架 whole-file；deploy/（非业务、部分通用）→ 按文件分层拆分；src/application/*（业务）→ 宿主。防止单轴"非业务即框架"误推把 deploy/ 拖进框架。

## 待拍板

1. 框架层承载形式：SKELETON_FILES 白名单扩展 vs `@devbie/deploy` 包。
2. 模板文件所有权分类（main.ts whole-file + bootstrap 责任上收 NewbieFactory options；.env.example 入表 marker-block，绑定 D1 守卫 declared 真源；生成物 modules.config.ts/modules.module.ts 不入表；模板文件未显式归类即守卫报错，对齐 check-template-deps 模式）——独立 ADR 承载。
3. web-monitor 契约 ADR 实施——**P9b 已拍板（2026-10-20）：整模块迁 `/web-monitor/*` + 删 v1**，待出 ADR 并落地（跨四仓：newbie-modules / nightwatch-backend / nightwatch-frontend / newbie-sdk）。

## 实施顺序

1. ~~参数外置：deploy.config.json + env.config.json；render-env.sh 改 config 驱动~~ **✅ 完成（2026-10-21，见 C1 段落地注记）**
2. 框架层文件划定 + 承载形式落地（newbie 侧）
3. UI 数据化（先取证生产主机 compose 插件版本是否支持 `depends_on.required`）
4. B2 渲染器（manifest 声明 + 装配期渲染）
5. start.sh/deploy.sh 重复提取逻辑在框架层收敛为一份
6. nightwatch 迁移 + 生产等价性验证（容器配置不得漂移）

## 取证索引

- deploy/ 行级非宿主占比：render-env.sh 94% / backup.sh 91% / env.template 85% / compose.prod.yml 80% / deploy.sh 75% / start.sh 71% / provision.sh 70% / Caddyfile.tmpl 70% / stack.yml 49% / memory.xml 17%
- start.sh L34-45 ≈ deploy.sh L25-40（提取逻辑逐行重复）
- stack.yml：9 个 CFN Parameters（DomainName/InstanceType/GitHubOrg/LatestAmiId/VpcId/SubnetId…）已参数化宿主值（B1c 的宿主侧先例）；资源级 Condition 全无（EcrFrontend L415 无条件资源）
- 本机 compose v2.40.0 支持 `depends_on.required`；生产 docker 29.9.1 的 compose 插件版本待取证
- 四 collector（heartbeat/health/backend-monitor/module-hub）控制器均为顶级 `@Controller("<module-key>")`（/heartbeat、/health、/backend-monitor、/module-hub）；module-hub 的宿主集成 API（/module-hub/installations，供宿主前端面板消费）同在模块命名空间——web-monitor `/api/v1` 是唯一离群
- 主机工具链：SSM `which node` 空；jq/aws/docker 在位
- Dockerfile.prod：`COPY --from=build /nwb/deploy /deploy`；镜像分发链 deploy.sh pull → docker create → docker cp
- 现有 Caddyfile 无 /heartbeat、/health、/backend-monitor、/module-hub handle——collector 实例上报走容器内 URL 自洽；外部 reporter（如 fewbie SSR → nightwatch）经域名是否可达待取证
