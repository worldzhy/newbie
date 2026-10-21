# ADR-009: 模板文件所有权注册表（31 文件全量分类）

状态：**已拍板（2026-10-21）**
日期：2026-10-21
关联：承载 ADR-006 待拍板 #2（模板文件所有权分类）；收敛 6 个 legacy SKELETON_FILES 先于 ADR-006 里程碑存在的漂移；落地后 nightwatch ci.yml 漂移门从 `deploy/` scoped 恢复全量。

## 背景

ADR-006 将 8 个 deploy 文件纳入 SKELETON_FILES whole-file 同步，但 CI 漂移门收窄为 `deploy/`——原因是 6 个 legacy 骨架文件携宿主关注且存在先于该里程碑的漂移。漂移取证（2026-10-21 实测，newbie-starter vs nightwatch-backend）：

| 文件 | 漂移 | 性质 |
|---|---|---|
| tsconfig.build.json | 无（逐字节一致） | — |
| prisma.config.ts | 无（逐字节一致） | — |
| main.ts | 60 行 | 6 项 bootstrap 责任滞留宿主侧（见 D1） |
| tsconfig.json | 13 行 | baseUrl / ignoreDeprecations "6.0" / paths 风格（两仓均 TS ^6.0.3） |
| nest-cli.json | 13 行 | 模块派生 assets（modules/aws-ses/templates、modules/*/clickhouse-migrations） |
| prisma/schema.prisma | 2 行 | 仅 schemas 数组行 + 空行——**机制误报**：该行由 reconcileDatasourceSchemas 装配渲染 |

判定轴沿用 ADR-006 两轴判据：`是客户业务？ × 跨宿主可通用？`。

## 决策

### D1：main.ts whole-file 同步（bootstrap 责任上收 NewbieFactory）

- **CORS 语义框架收编（方案 B）**：`@AllowAnyOrigin()` 装饰器、元数据 key（`ALLOW_ANY_ORIGIN_KEY = "allowAnyOrigin"`）、路由扫描（DiscoveryService/Reflector/MetadataScanner 全是框架标准设施，无 security 模块私有性）、路由注册表与 Express 中间件全部收进 newbie core；框架内部处理"any-origin 路由 ACAO:* + 其余路由走白名单"的豁免逻辑。删除 security 模块的 PublicCorsService、factory 的 `beforeCors` / `corsResolver` 两个 option；五个 collector 控制器（backend-monitor/health/module-hub/web-monitor/heartbeat）不再为装饰器跨模块 import security——装饰器改由框架导出，这些跨模块边消失。
- 吸收项（nightwatch 现 main.ts 全部 bootstrap 责任）：`dotenv/config` 首行、portRaceRecovery（默认值 = `environment !== "production"`）、heartbeat 进 factory step 4（与 module-hub/health 同套 env 门控）、textBodyParser 恒开、health 语义采用 nightwatch 版（检查恒跑、POST 门控；startHealthReporting 幂等）、CORS 收编（上条）。
- 吸收后 main.ts 无宿主关注，入 whole-file。

### D2：nest-cli.json 泛化 + schema.prisma 比较归一化

- nest-cli.json assets 改固定 glob：`modules/*/templates/**/*`、`modules/*/clickhouse-migrations/*.sql`——模块派生行消失，文件变为静态，入 whole-file。
- schema.prisma 标记块比较时归一化剔除 schemas 行（该行是装配渲染产物，非漂移）。

### D3：.env.example 三段式入表

- 新增 `# @@newbie-framework-start/end` 段：PORT / ALLOWED_ORIGINS / LOG_LEVEL / reporter 键对 / APP_VERSION，入 SKELETON_FILES 走 marker-block；
- `# @@newbie-modules-start/end` 保持 assemble 所有（现状）；
- 两段之外宿主自有。
- D1 守卫（aws-secrets-cli check）零改动：.env.example 本就是其 declared 真源。

### D4：SKELETON_FILES 升格为全量 31 文件所有权注册表

newbie-starter 全部 31 个跟踪文件显式分类（template-sync.ts 单一注册表）：

| 类别 | 数量 | 语义 |
|---|---|---|
| framework-whole-file | 13 | 逐字节同步（deploy 8 + main.ts + tsconfig*2 + nest-cli.json + prisma.config.ts） |
| framework-marker-block | 2 | 标记块同步（prisma/schema.prisma、.env.example） |
| generated | 2 | 装配产物（modules.config.ts、modules.module.ts），不入同步比较 |
| template-shipped-host-owned | 14 | 模板一次性分发，之后宿主自有、永不被覆盖 |

**未归类的模板文件 = 守卫报错**（对齐 check-template-deps "unlisted=error" 模式），守卫跑在 newbie-starter CI。

### D5：工具链 dotfiles 分类

- `.prettierrc`：framework-whole-file（两仓已逐字节一致；全生态 prettier 锁定 ^3.9.9 单一 canonical 配置）；
- `.prettierignore` / `.gitignore`：framework-marker-block（框架段 + 宿主区）。证据：nightwatch 缺 `*.tsbuildinfo` 忽略项；模板误忽略 `.newbie`，与 C1 已提交的 `.newbie/env.config.json` 冲突；
- `.eslintrc.js`：template-shipped-host-owned（规则差异属宿主政策）；顺带修模板 `tsconfigRootDir: "/"` bug → `__dirname`。

### 落地后

nightwatch ci.yml 漂移门摘掉 `deploy/` 路径过滤，恢复对全部 whole-file/marker-block 文件的全量检查。

## 否决记录

| 项 | 结论 | 理由 |
|---|---|---|
| main.ts 继续滞留宿主 | 否决 | 各项责任全无宿主业务性，两轴判据指向框架；滞留 = 每宿主裸抄 bootstrap |
| 模块个性经 config 文件注入 factory | 否决 | config 变第二真源（ADR-006 已否"生成物 DSL"同理） |
| DI-token 发现机制（`BEFORE_CORS_HOOK`） | 否决 | 唯一设想的实例即 CORS 钩子，框架收编后机制无消费方（YAGNI）；位置词（before）+机制词（hook）命名失败本身是抽象错误的信号 |
| 装饰器名 `PublicCors` | 改判为 `AllowAnyOrigin` | 与同目录 `@Public()`（`IS_PUBLIC_KEY`，免认证）撞词且语义相反（该些路由需 token）——安全敏感歧义；且名字未暴露 ACAO:* 这一安全姿态 |
| 装饰器名 `AnyOriginCors` | 否决 | 只陈述策略属性，缺"放行"授予语义；`AllowAnyOrigin` 为 .NET `CorsPolicyBuilder.AllowAnyOrigin()` / Spring 生态标准语汇 |
| `@AllowOrigins(...)` / 装饰器引用 env 变量 | 否决 | origin 名单是部署期数据，装饰器参数是编译期常量；collector 端点 origin 本质不可枚举（SDK 嵌入任意客户站点）；CORS 非认证边界，env 收紧旋钮唯一实效是静默打断客户浏览器上报 |
| deploy/ 全量生成化 | 否决 | 静态 80% 部分零收益，杀死 C1 逐字节可验证性 |
| generated 文件入同步比较 | 否决 | 装配产物以 assemble 重渲染 diff 验证（ADR-008 验证链 #2），同步通道不重复管 |

## 实施顺序（里程碑）

1. ~~newbie core：NewbieFactory 吸收 bootstrap 责任 + `@AllowAnyOrigin` 扫描/注册表/中间件收编（删除 `beforeCors`/`corsResolver` option）；newbie-modules：security 删除 PublicCorsService，五个 collector 控制器装饰器改从框架导入~~ **✅ 完成（2026-10-21，@devbie/newbie 1.7.0，newbie f1da7f7 / newbie-modules de8b25f / newbie-starter 83fc721）：工厂收编 text/plain 恒开、heartbeat reporter、health 检查恒跑/POST 门控、portRaceRecovery 默认 `environment !== "production"`；`@AllowAnyOrigin()` + `ALLOW_ANY_ORIGIN_KEY` 与静态路由注册表由 FrameworkModule 提供（新增 5 例单测，核心 38 tests 全绿），security 删除两文件、五个 collector 改导入 `@devbie/newbie/cors/allow-any-origin.decorator`、SecurityModule 去 DiscoveryModule；registry `newbie dev lint` 0 error / 20 warning（warning 与 M3 基线一致）；check:template-deps 预期红（main 仍钉 newbie 1.6.0 / cli 1.5.0，待 dev 合 main）**；
2. newbie-starter：main.ts 瘦身为 whole-file 形态、nest-cli.json glob 化、.env.example 框架段标记化、dotfiles 分类落地（含 eslintrc tsconfigRootDir 修复）；
3. newbie CLI：template-sync 注册表升格 31 文件全量分类 + 未归类守卫 + schema.prisma 比较归一化；
4. nightwatch 迁移：重同步骨架文件，diff 审查 + 全量验证（tsc/测试/冒烟）；
5. nightwatch ci.yml 漂移门恢复全量。

每个里程碑独立会话交付（里程碑边界即会话边界）。与 ADR-008 里程碑相互独立，可并行推进。

## 取证索引

- 6 文件漂移行数与内容：2026-10-21 diff 实测（上文表格）
- 31 文件清单：`git ls-files`（newbie-starter）
- 两仓 TS 版本均为 ^6.0.3；tsconfig 漂移行为 baseUrl / ignoreDeprecations "6.0" / paths 风格
- nightwatch main.ts bootstrap 责任：dotenv/config、portRaceRecovery、heartbeat、textBodyParser、health 语义、CORS 钩子（PublicCorsService，本 ADR 收编为框架设施）
- security PublicCorsService 路径：`@modules/security/authentication/public`；同目录 `@Public()`（`IS_PUBLIC_KEY`）为免认证装饰器——撞词实证
- 五个 collector 控制器（backend-monitor/health/module-hub/web-monitor/heartbeat）import `@modules/security/authentication/public` 仅为 CORS 装饰器
- `.newbie/env.config.json` 已提交（C1 落地），模板 `.gitignore` 忽略 `.newbie` 与之冲突
- D1 守卫 declared 真源：aws-secrets-cli/src/check.ts 读 .env.example
