# newbie 框架拆分实施计划

> 依据：`.agent/documents/newbie-framework-split-plan.md`（设计决议 2026-09-23，09-24 修订）、`.agent/documents/fewbie-framework-design.md`
> 范围：本工作区（`/Users/worldzhy/src/newbie`，git: github.com/worldzhy/newbie，分支 `dev`）内的交付与验证。
> nightwatch / fewbie / newbie-modules / apits 仓仅作为协调点列出，执行发生在各自工作区，不在本计划内动手。

## 执行进度（2026-09-24）

- [x] **Stage 0 完成**：workspaces 骨架（packages/core、packages/cli、templates/basic）、tsconfig.base、.gitignore；旧项目 tsc/nest build 零影响。
- [x] **Stage 1 完成**：`@devbie/newbie@0.1.0`。git mv 保留历史；19 处 `@framework` 自别名→相对路径；Prisma 解耦（`PrismaModule.forRoot({PrismaClient})`、`FrameworkModule.forRoot`、错误类取 `@prisma/client/runtime/client`）；新增 NewbieFactory（含 cluster/swagger/bodyLimit/requestTimeout）；子路径 exports 全保留（codemod 可纯替换前缀）。容器内 tsc 通过、npm pack 无 settings/schema、barrel+子路径运行时加载验证通过。
- [x] **Stage 2 完成**：templates/basic 以 workspace 依赖消费 core（薄 main.ts 5 行、`FrameworkModule.forRoot({prisma:{PrismaClient}})`）。容器内 prisma generate → tsc --noEmit → nest build 通过；启动冒烟：Swagger `/api-json` 200、`/` 302、PrismaModule 用注入的生成端 client 初始化成功（无可达 PG 不阻断启动）。
- [ ] Stage 3 待执行；Stage 4 待执行。
- [x] **2026-09-24 收尾清理**：删除旧 Dockerfile（模板不内置部署文件）；删除 `packages/core/src/prisma/alpha/` 3 个整体注释的死代码文件（零引用、未进 barrel）；同步 split-plan 与本计划的 Dockerfile 表述；Stage 0-2 成果分批提交。

### 已决议/偏差记录

- **D1-D3、D5 按推荐执行**（单仓 workspaces；工厂注入；env-tool 将并入 CLI；workspace+npm pack 本地验证）。
- **D4 调整**：模板 schema 保持 **0 个 model**（当前线上模板即如此，framework 运行时不引用 User/Session），仅加 `@@newbie-framework-start/end` 标记；User/Session 待认证模块有设计后再入模板。
- 修正旧仓隐性缺依赖（原靠传递依赖侥幸可用）：core 补 `dot-object@^2.1.5`、`bcrypt` 版本改为实际存在的 `^6.0.0`、peer `reflect-metadata` 放宽为 `^0.1.12 || ^0.2.0`；模板补 `dotenv@^16.4.5`。
- 修正模板 `start:prod` 旧脚本（原为 `node dist/main`，实际产物一直是 `dist/src/main.js`，原命令本就失效）。
- **安全待办（已关闭）**：旧 `Dockerfile`（含硬编码 Pulumi token 与无关的 SQS/Pulumi 构建步骤）已于 2026-09-24 删除，模板不再内置 Dockerfile；Pulumi 已弃用，历史中的 token 无需轮换（用户 2026-09-24 确认）。
- `pipes/errors.constants` 与 `exceptions/errors.constants` 重复符号（`SELECT_INCLUDE_PIPE_FORMAT` 值 400019 vs 400020 不一致，存量问题）：barrel 只导出 exceptions 超集，pipes 文件仅子路径可访问，Phase 2 codemod 按原路径替换以保持运行时行为；收敛留待后续。

## 一、仓库调研结论（2026-09-24 实测）

### 1.1 现状

- 本仓当前是**纯模板仓库**（`name: newbie`, v3.2.0, private）：框架代码、CLI 脚本、模板骨架全在一个仓里。
- 技术基线：NestJS 11、Prisma 7.2（client 输出 `generated/prisma`）、Express 5、TS 5.9、CommonJS。
- 三块可拆内容：
  1. `src/framework/` — 框架运行时，目录与拆分计划 §3.1 清单一致（含 `framework.settings.json`）；
  2. `.newbie/` — CLI 脚本 **2152 行 JS**（assemble 6 个、constants 4 个、utilities 5 个、index/check/config/install）；
  3. `.newbie-env-tool/` — env pull/push 交互工具（inquirer + colorette + figlet），**拆分计划未提及，需安置**。
- `src/application/`（application.module/controller）是示例业务模块；`prisma/schema.prisma` 目前**只有 generator + datasource，无任何 model**（拆分计划 §五说模板提供 User/Session 骨架，需新建）。
- `main.ts` 含完整启动逻辑 + 一段注释掉的 `clusterize()`，与 §3.2 NewbieFactory 设计一一对应。

### 1.2 抽取的关键耦合点（决定 Stage 1 难度）

1. **framework 反向依赖项目生成物**（最高风险）：
   - [prisma.extension.ts:2](file:///Users/worldzhy/src/newbie/src/framework/prisma/prisma.extension.ts#L2) `import {Prisma, PrismaClient} from '@generated/prisma/client'`
   - [prisma.exception-filter.ts:3](file:///Users/worldzhy/src/newbie/src/framework/exception-filters/prisma.exception-filter.ts#L3) `import {Prisma} from '@generated/prisma/client'`
   - `@generated/prisma` 是每个消费项目 prisma generate 的产物，npm 包不能依赖它。
2. framework 内部用 `@framework/*` 自别名（framework.module.ts、framework.config.ts 等），打包进 npm 包需改为相对路径或包内自引用。
3. `framework.settings.json` 是装配清单（env 默认值 + 依赖版本），按已修订的 §3.5 不进包，env 归模板 `.env.example`、依赖归包 package.json。

### 1.3 CLI 脚本真源在 nightwatch 项目侧

- 模板仓 `.newbie/` 2152 行；nightwatch-backend 侧 2647 行，多出 **`newbie.update.js`、`utilities/release.util.js`**（正是拆分计划背景里说的项目侧演进）。
- 结论：Stage 3 的移植真源取 **nightwatch-backend/.newbie/**，不是本仓的旧副本。项目记忆同时记录了该管线一批已知缺陷（静默失败、零退出码、env 全量重写、无 dry-run、shell 拼接、无漂移检测等），重写时须修掉。

### 1.4 与 nightwatch 文档的依赖/协调关系（只关联，不在本仓实施）

| nightwatch 侧设计                             | 对本工作区的依赖                                                                                                                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| application-agent-model（Phase 1 Agent 模型） | 无直接依赖；module-hub（其 Phase 6）依赖本计划 Stage 3 完成                                                                                                                           |
| application-creation-flow（模式 A 建仓）      | 依赖 `newbie create` 可用、newbie 模板仓 git URL（写入 Template.repositoryUrl）、`modules.json` 结构、env 变量名约定（`NIGHTWATCH_APPLICATION_TOKEN` / `NIGHTWATCH_REPORT_ENDPOINT`） |
| ui-hierarchy-refactor / mui-to-shadcn         | 与后端拆分无依赖，并行                                                                                                                                                                |
| nightwatch-backend Phase 2 迁移               | 消费 Stage 1 产物：93 个文件 import `@framework/*`，需 codemod 到 `@devbie/newbie`（在 nightwatch 仓执行）                                                                            |

### 1.5 外部仓库就位情况

- `~/src/fewbie`、`~/src/newbie-modules`：已占位（仅 README），Stage 3/5 之外的独立工作区。
- `~/src/open-api-typescript-request-generator`（apits-gen）：**目录不存在**，fewbie `gen api` 的前置，需重新就位（不阻塞后端 Stage 1-4）。
- npm scope `@devbie` 可用性与发布凭证：需确认（影响发布方式，不影响本地构建验证）。

## 二、待决策项（动手前需确认）

- **D1 仓库形态**：本仓改为 npm workspaces 单仓（推荐）：
  ```
  newbie/
  ├── packages/core/      # @devbie/newbie
  ├── packages/cli/       # @devbie/newbie-cli
  ├── templates/basic/    # 原模板骨架（消费 @devbie/newbie）
  └── package.json        # private workspaces root
  ```
  备选：模板另立独立 git 仓。推荐单仓——与 fewbie monorepo 决议对称，core 与模板可在同一 PR 联调。
- **D2 Prisma 解耦方式**：framework 不引用项目 generated client。推荐：
  - `PrismaModule.forRoot({ client })` / `createExtendedPrismaClient()` 由项目传入其生成的 client（或 framework 提供接受 client 实例的工厂）；
  - 异常过滤器改用 `@prisma/client/runtime/library` 的 `PrismaClientKnownRequestError` 按 code 判断，不依赖生成端 `Prisma` 命名空间；
  - `$extends` 类型改基于 `@prisma/client` 基类泛型，业务模型方法保持 `any` 动态访问。
- **D3 `.newbie-env-tool` 归属**：并入 `@devbie/newbie-cli`，命令 `newbie env pull / env push`（推荐）；或留在模板仓。
- **D4 模板最小 schema**：`User` / `Session` 框架表具体字段（当前 schema 为空），Stage 2 时定稿。
- **D5 发布方式**：Stage 1-2 验证期用 `npm pack` + 模板 `file:`/workspace 依赖，不发公网；正式发布的 registry 与 `@devbie` org 权限另行确认。

## 三、实施步骤（依赖序）

### Stage 0：monorepo 骨架（仅结构，零行为变更）

1. 根 `package.json` 改 private workspaces（`packages/*`、`templates/*`），移除业务依赖到各子包；保留 husky/commitlint 配置。
2. 新增 `tsconfig.base.json`（继承现有编译选项）；根 `.gitignore` 增补 `packages/*/dist`。
3. 建 `packages/core/`、`packages/cli/`、`templates/basic/` 空目录与占位 package.json。
4. 验证：容器内 `npm install` 成功，git 历史保留（用 `git mv` 而非复制）。

### Stage 1：抽取 `@devbie/newbie`（对应拆分计划 Phase 1）

1. `git mv src/framework packages/core/src`；`@framework/*` 内部引用全部改相对路径。
2. 按 D2 解除 `@generated/prisma` 耦合（prisma.extension、prisma.exception-filter、prisma.module 工厂化）。
3. 新增 `newbie-factory.ts`（§3.2 定稿代码：create + listen，含 cluster/bodyLimit/requestTimeout/swagger 选项）。
4. `packages/core/package.json`：name `@devbie/newbie`，peerDependencies 声明 `@nestjs/*`、`@prisma/client`、helmet/cookie-parser 等；dependencies 只留纯工具（dayjs/uuid/bcrypt/crypto-random-string 等按实际 import 收敛）；配置 `exports` 映射与 tsc 构建。
5. **不复制** `framework.settings.json`（§3.5）；其 env 默认值进 Stage 2 模板 `.env.example`，依赖清单并入 core package.json。
6. 验证：容器内 core 包 `tsc -b` 通过、`npm pack` 产物不含 schema.prisma 与 settings.json。

### Stage 2：模板消费 core（仓内自验证，先于 nightwatch 迁移）

1. 模板骨架入 `templates/basic/`：薄 `main.ts`（NewbieFactory.create + listen 5 行）、`prisma/schema.prisma`（generator/datasource + D4 定稿的 User/Session，framework 区块加 `// @@newbie-framework-start/end` 标记）、`prisma.config.ts`、tsconfig、`.env.example`、`src/application/` 示例模块。（旧 Dockerfile 已删除，模板不内置部署文件。）
2. 模板依赖 `@devbie/newbie`（workspace 协议）；删除模板内 `src/framework/` 与 framework.settings.json。
3. 容器内跑通：`prisma generate` → `tsc --noEmit` → `nest build` → 启动后 Swagger `/api` 可访问、健康接口 200。
4. 此 Stage 产物同时是 nightwatch Phase 2 迁移的参照实现。

### Stage 3：`@devbie/newbie-cli`（对应 Phase 3，拆三步交付）

> 真源：`nightwatch-backend/.newbie/`（2647 行版本，含 update/release.util），移植到 `packages/cli/`，语言保持 JS 或升 TS（建议 TS，配合 §记忆中「纯函数补单测」）。

1. **3a 等价移植**：commander/yargs 骨架；现有 install / config / check + 6 个 assemble 步骤 + env-tool（D3）迁入；修已知缺陷：任一步失败非零退出、env 保留注释分组、shell 参数化防注入、JSON/schema 校验、dry-run、生成物加 DO NOT EDIT 头。
2. **3b 新命令**：`doctor`（子模块/settings 漂移、patch-id）、`status --json`、`apply --config --ci`、`agent`（出站轮询占位）、`create <name>`（供 nightwatch 创建流程模式 A 消费）、`update-template`（Stage 4）。
3. **3c module 化绑定交付**（与 nightwatch 侧改名同期，不可拆发）：
   - 概念重命名 `microservices → modules`：目录、`@modules/` 别名、`modules.*` 配置键、生成物 `modules.module.ts/config.ts`；
   - 分发模型改为 monorepo registry 复制：消费项目根 `modules.json`（key/version/sourceCommit/localPatches）+ 各 module 的 `newbie.module.json`；新增 `dev-sync`；
   - 18 个旧子模块迁移到 `~/src/newbie-modules`（在 registry 仓执行）、nightwatch 移除 submodule 改复制（在 nightwatch 仓执行）——本仓只交付 CLI 能力与文档。
4. 验证：在容器内用模板项目跑 add/install/update/doctor/apply/status 全流程；doctor 能正确报漂移；生成物与键名全部为 modules.\*。

### Stage 4：`update-template` 与模板定稿（对应 Phase 4）

1. CLI 实现骨架文件 diff（main.ts、tsconfig、prisma framework 标记块），跳过业务文件，输出可 review 的 diff/PR 指引。
2. 模板打 tag 规则；README 写清 create → install → 启动流程。
3. 用 templates/basic 自身做一次 update-template dry-run 验证幂等（无 diff）。

### Stage 5+：跨工作区协调（本仓只交付契约，不实施）

- **fewbie（`~/src/fewbie`）**：独立工作区按 fewbie-framework-design 建 monorepo；apits-gen 仓需先重新就位。
- **newbie-modules（`~/src/newbie-modules`）**：Stage 3c 的配套仓库，module-hub 作为其中一个普通 module（Phase 6）。
- **nightwatch-backend**：Stage 1 产物发布后执行 Phase 2（删 src/framework、93 文件 codemod、薄 main.ts、容器验证）；Agent 模型与 module-hub 按其本地文档排期。
- 本仓需对外稳定的契约：`newbie create/install/...` 命令面、`modules.json`/`newbie.module.json` schema、NewbieFactory options、上报相关 env 变量名（与创建流程文档一致）。

## 四、验证要求（全程容器内执行，禁止宿主机 node）

- 使用运行中的 worldzhy/node 容器（挂载 `/Users/worldzhy/src/newbie` ↔ `/home/worldzhy/src/newbie`），经 `docker exec -w ... <container> <cmd>` 执行；无运行容器时用 `docker run --rm -v ... worldzhy/node`。
- 每个 Stage 必跑：`tsc --noEmit`（或 `tsc -b`）、`npm pack`/`npm install`、模板 `nest build` + 启动冒烟（Swagger、健康接口）。
- Stage 3 增加：CLI 全流程演练 + `grep -r "microservices" packages/cli/dist` 零残留（3c 后）。
- 每个 Stage 结束更新本计划勾选状态；有范围变更先回到评审。

## 五、风险与对策

| 风险                                                             | 对策                                                                                                              |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Prisma generated-client 耦合解不开导致 core 无法独立编译（最高） | Stage 1 先做 D2 spike：仅抽 prisma/ + exception-filter 两个目录验证编译与消费方注入可行，再全量搬迁               |
| 模板/框架同仓 git mv 后历史与构建配置混乱                        | 一个 PR 只做移动不改逻辑（Stage 0/1 前半步），移动与解耦分开提交                                                  |
| CLI 2647 行重写行为回归（静默失败多、无测试）                    | 3a 先补纯函数单测（env 行解析、semver、config 合并）再重构；以 nightwatch 现状生成物做快照对比                    |
| 3c 改名与 nightwatch 侧不同步会造成中间不可用                    | CLI rename 与 nightwatch codemod 绑定同一批次交付；旧键名过渡期不兼容（开发阶段无用户数据，文档已明确无回滚窗口） |
| `@devbie` npm org/发布未就绪                                     | 全程 workspace/file 依赖 + npm pack 本地验证，发布与 registry 决策推迟到 Stage 4 后                               |
| `newbie create` 与 nightwatch 创建流程契约漂移                   | env 变量名、modules.json 字段以其 application-creation-flow 文档为准，CLI 侧加契约测试 fixture                    |
