# ADR-003: 模板事实源迁移到 starter 仓，monorepo 不再持有 templates/basic

状态：已采纳
日期：2026-10-17
副本注记：本决策同时存档于 worldzhy/fewbie 与 worldzhy/newbie 两仓
`decisions/`（fewbie 侧编号 ADR-004、newbie 侧编号 ADR-003，同文）；本 ADR
**部分取代** ADR-002 中「单一事实源 = monorepo `templates/basic`、starter 仓
为派生物」的契约（ADR-002 关于「Template.repositoryUrl 指向专属 starter 仓」
的决定仍然有效并被本次强化）。

## 背景

ADR-002（2026-10-14）把 `Template.repositoryUrl` 从框架 monorepo 根改指
`worldzhy/fewbie-starter` / `worldzhy/newbie-starter`，但当时仍把 monorepo
`templates/basic` 视为单一事实源，starter 仓由 `sync-starter.yml` 在 push 时
`git archive` 提取、加 banner、`npm install && npm run build`、force-push 到
starter main 覆盖。

这条「monorepo 真源 → starter 派生」链路带来一整类人造复杂度：

- starter 仓的 README 需要 banner marker 区块防止同步叠加；
- 每次 sync 都强推重写 starter main 历史，starter 仓自身无法积累有意义的
  commit 叙事；
- monorepo workspaces 数组把模板与框架包捆在同一个 lockfile 里，模板依赖升级
  会冲击框架 lockfile，反之亦然；
- 模板作为 npm workspace sibling 却无法以 `workspace:*` 协议消费
  `@devbie/*` 包（模板要发布给最终用户，必须走 registry semver），workspace
  归属只是名义性的；
- 「并行 agent 会话在 monorepo 改模板」与「sync workflow 同刻强推 starter」
  存在竞态窗口。

与 `nestjs/typescript-starter` 等社区惯例对照：模板仓本就独立、由模板维护者
直接提交演进，不存在「框架 monorepo 持模板、外部仓接同步」的派生关系。

## 候选方案

1. **A. 仅把 `templates/*` 移出 workspaces 数组**：消除 lockfile 耦合，但
   sync workflow / banner / force-push / 双仓事实源等整条复杂度仍在。
2. **D. 模板事实源迁移到 starter 仓（采纳）**：`templates/basic` 从 monorepo
   删除，`worldzhy/fewbie-starter` / `worldzhy/newbie-starter` 扶正为单一
   事实源，由框架维护者直接在 starter 仓提交演进；sync workflow 与 banner
   一并删除；monorepo CLI（`fewbie init` / `newbie create`）的模板解析链
   改为克隆 starter 仓根。
3. **C. 双写过渡**：monorepo 与 starter 都保留模板，人工保持同步。产生双
   事实源，明确拒绝。

## 决策

采纳方案 D：

1. 用 `git filter-branch --subdirectory-filter=templates/basic --prune-empty`
   从各框架 monorepo 的 dev 分支提取模板子树历史（fewbie 12 commit、newbie
   26 commit），force-push 到对应 starter 仓的 `main` 与 `dev` 分支，模板
   真实演进叙事保留为 starter 仓历史。
2. starter 仓头部追加一条独立 commit（`chore: lock dependencies for
   standalone template`）提交 `package-lock.json`——此前 lockfile 由 sync
   workflow 在 CI 内生成，迁移后由维护者在 starter 仓本地生成并提交，构建
   门继续保持「`npm install` + `npm run build` 全绿」才允许合入。
3. 框架 monorepo 删除 `templates/`、`.github/workflows/sync-starter.yml`，
   根 `package.json` workspaces 数组移除 `"templates/*"`，根 lockfile 重新
   生成；`.gitignore` 清理 `templates/*` 条目。
4. `fewbie init` / `newbie create` / `newbie update-template` 的模板解析链
   由「`--template-path` → monorepo 本地检出 → `git clone <monorepo>` 取
   `templates/basic` 子目录」改为「`--template-path` → `git clone
   <starter>` 仓根」。monorepo 本地检出 fallback 移除（模板已不在
   monorepo）；`FEWBIE_TEMPLATE_PATH` / `NEWBIE_TEMPLATE_PATH` 环境变量
   保留为离线/开发逃生门。
5. nightwatch 消费侧零改动：ADR-009 早已把 `Template.repositoryUrl` 指向
   `worldzhy/fewbie-starter` / `worldzhy/newbie-starter`，generate API 消
   费 URL 不变；starter 仓内容从「force-push 派生物」升级为「真实演进历
   史」，对 generate API 透明。
6. 模板 tag 约定同步迁移：`template-v<semver>` tag 改为打在 starter 仓
   （而非 monorepo），CLI `--template-ref` 照旧消费。

## 影响

- **npm 包**：`@devbie/fewbie-cli` 与 `@devbie/newbie-cli` 模板解析 URL 改
  变，按「上线前所有包留在 1.x 线」规则发 minor 版本；旧版 CLI 仍然克隆
  monorepo 并查找 `templates/basic` 子目录，在新 commit 后会因目录不存在
  失败——可接受的 breaking 边界（无外部消费方），内部消费方同步升级。
- **CI**：`sync-starter.yml` 删除，框架仓 push 不再触发 starter 强推；
  starter 仓自身的 CI（若有）由 starter 仓独立维护。
- **并行会话**：模板演进只在 starter 仓发生，消除与 monorepo 推送的竞态。
- **文档**：本 ADR 与 monorepo `README`、nw `application-creation-flow-
  design.md` 在同一提交同步更新；ADR-002 保留原文，本 ADR 顶部以「部分取
  代」标注契约边界变化。
