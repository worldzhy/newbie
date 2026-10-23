# ADR-012: fewbie 并入 newbie monorepo，fewbie 仓归档只读

- 状态：已采纳
- 日期：2026-10-21
- 决策人：worldzhy（用户提出"把 cli 放到 newbie 中、fewbie 仓就没用了"并拍板执行形态）
- 影响：ADR-011 中"fewbie 消费 frontend eslint 入口"的分组归属随本合并失效——fewbie-cli 迁入 newbie 后随根 `eslint.config.mjs` 走 backend 入口；frontend 入口的存废另案决定

## 背景

fewbie 仓在模板事实源迁往 fewbie-starter（ADR-003）后只剩一个资产：`@devbie/fewbie-cli`（shadcn 式 React 组件 registry CLI）。双仓并列的代价已可取证：两份 monorepo CI / 发布清单 / 依赖守卫重复维护；style-guide 的 frontend 入口仅有 fewbie 一个消费方；fewbie-cli 与 newbie-cli 同属"框架 CLI"却分离两处演进。

合并前取证确认零行为变化：

- registry 运行时解析为纯包内相对路径（`dist/registry` → 源码 `registry/` 两级回退），源码无任何指向 `worldzhy/fewbie` 自身的 URL；
- `fewbie create` 引用的模板仓 `worldzhy/fewbie-starter` 继续独立存在，不受影响；
- fewbie-cli 与 newbie-cli 代码零共享，无合并冲突面。

## 决策

1. fewbie-cli 完整迁入 `worldzhy/newbie` monorepo 的 `packages/fewbie-cli`：用 `git filter-branch --subdirectory-filter` 将包历史（40 commits）重写为包根形态，再以 merge commit（`merge -s ours` + `read-tree --prefix`）并入 dev，提交叙事完整保留。
2. 包名 `@devbie/fewbie-cli`、`bin fewbie` 不变，npm 消费方零感知；`repository` 字段改指 `worldzhy/newbie`，随 1.1.1 patch 发布。
3. fewbie-cli 在 newbie 内随根 eslint 配置走 backend 入口（该入口与 fewbie 原 frontend 入口共享同一 `core` 层，lint 结果等价；registry 的 13 个 tsx 模板改由本仓语法级检查 + 消费仓 next 入口受检，与 newbie-modules 同一模式）。
4. template-sync 门禁随 CI 迁入 newbie，保持原设计语义：仅在 main 触发（对比 fewbie-starter 默认分支），dev 推送不引入跨仓 main 依赖。
5. fewbie 仓 GitHub 归档只读、不删除；归档前在 dev 加 README 横幅指向新位置（main 同步与归档操作由用户经 GitHub 完成）。
6. fewbie 侧 ADR-001 / ADR-003 迁入本仓为 ADR-013 / ADR-014（正文原样 + 迁移横幅）；ADR-002 / ADR-004 两仓早已同文双存档（本仓 ADR-002 / ADR-003），不再重复迁移；plan 类工作产物按三分治原则留在归档仓。`fewbie-framework-design.md`（Living 文档）随代码迁入本仓 `.trae/documents/`，加迁移横幅、正文原样。

## 影响面

- **newbie**：新增 `packages/fewbie-cli`（workspaces 自动纳入）；CI 增 `build`/`test -w @devbie/fewbie-cli` 与 main-only template-sync 门；`RELEASE_CHECKLIST.md` 包清单与第 10 条补 fewbie-starter 链路；`.prettierignore` 补 `**/maps/*.json`（GeoJSON 资产豁免，随包迁移）。
- **npm**：`@devbie/fewbie-cli` 1.1.1（仅 repository 元数据变化，按 1.x patch）。
- **fewbie 仓**：README 归档横幅（dev）；main 同步 + GitHub archive 为用户操作。
- **消费方**（nightwatch-frontend 等）：包名与版本线不变，无需改动。
