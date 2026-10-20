# ADR-002: 模板 generate 消费独立 starter 仓库，Template.repositoryUrl 不再指向框架 monorepo 根

状态：已采纳
日期：2026-10-14
副本注记：本决策同时存档于 worldzhy/fewbie 与 worldzhy/newbie 两仓
`decisions/`（同号 ADR-002、同文）；nightwatch-backend 仓的原 ADR-009 已移除，
平台侧文档引用指向本文。

> **状态更新（2026-10-15）**：本文影响面中「模板显示名不变」一条已被取代——
> nightwatch-backend 仓 `ADR-009-unify-template-display-name-basic.md` 决议显示名统一为
> basic 词干（`fewbie basic template` / `newbie basic template`），并已由 migration
> `20261015000000_unify_template_display_name` 与 `prisma/seed.ts` 落地。本文正文其余
> 结论不变。

## 背景

Mode A（模板建仓）通过 GitHub generate API（`POST /repos/{owner}/{repo}/generate`，
`GitHubService.ensureRepoExists` → `repos.createUsingTemplate`）从
`Template.repositoryUrl` **整仓复制**出新应用仓库。当前 seed（`prisma/seed.ts`）把两个
模板的 repositoryUrl 指向框架 monorepo 根（`worldzhy/fewbie`、`worldzhy/newbie`），
导致生成的应用仓库包含 monorepo 全部内容——`templates/basic/`、`packages/fewbie-cli/`
、框架根配置——而不是可运行的应用骨架。

设计意图从来都是"应用骨架仓"（application-creation-flow-design.md 3.4：FRONTEND
模板来自「`fewbie init` 消费的 git 模板」）。根因是 **Template.repositoryUrl 的语义
（"可被 generate 整仓复制的应用骨架模板仓"）与框架 monorepo 身份被混在了同一个 URL
里**——generate API 不理解 monorepo 子目录，指向 monorepo 根必然复制出错误形状。

## 候选方案

1. **独立 starter 仓库（采纳）**：为每个框架维护一个专属 GitHub 模板仓库
   （`worldzhy/fewbie-starter`、`worldzhy/newbie-starter`），内容 = monorepo
   `templates/basic`。单一事实源仍是 monorepo `templates/basic`（有构建验证），
   由 fewbie/newbie 仓的 GitHub Action 在该目录变更时先构建验证、再同步 push 到
   starter 仓默认分支；starter 是纯派生物，禁止手工编辑（README 横幅声明）。
2. **generate 后修剪**：seed 照旧指向 monorepo 根，平台编排里增加一步——generate
   完成后删除 `templates/`、`packages/` 等非应用目录（再走一次 contents API 逐个删）。
3. **CLI 抽取链**：不走 generate API，平台服务端运行 `fewbie init` /
   `newbie create` 产出应用内容后整体推送到新仓库。

## 决策

采用方案 1。

决定性理由：**generate API 的原语就是整仓复制，因此"模板仓"必须是一个可以直接作为
应用骨架的仓库——让数据（Template.repositoryUrl 指向什么）与 API 语义对齐，而不是让
编排层为错误的对齐持续打补丁。** 方案 2 把「monorepo 里哪些路径不属于应用」这一知识
硬编码进平台编排：monorepo 目录结构每次演化都要同步修改 nightwatch，模板形状的正确性
也从「复制即正确」退化为「复制后再修」；方案 3 把框架 CLI 变成平台运行时依赖（node
运行时 + 框架版本耦合），推翻了 v1 明确的平台侧零框架依赖取舍。

**NestJS 先例佐证**：`nest new` 的消费物 `typescript-starter` 是独立模板仓库
（`is_template: true`），而打包进 npm 包的 `@nestjs/schematics` 则内置模板文件树——
两条路径都不从框架 monorepo 根整仓复制。"可复制的模板消费物独立成仓"是既有惯例。

**命名决策：`fewbie-starter` / `newbie-starter`（后缀形式，无中缀）。**

- 不用 `-template` 后缀：与平台 `Template` 数据模型、monorepo `templates/` 目录撞词
  干——同一词干已承载两个相关但不同的概念（平台模型 vs 框架骨架仓），再加第三个只会
  加剧混淆。
- 不用 `fewbie-app-template` 一类中缀：`-app-` 是为消除本不存在的歧义加的拐杖——
  `-starter` 后缀已经完整表达「应用起点仓」语义。
- NestJS 官方 `typescript-starter` / `graphql-starter` 系列采用同一形态，是可引用的
  先例。
- 归属：starter 仓放在框架 owner（`worldzhy`）名下而非平台 org——它是框架生态资产，
  未来任何宿主平台都可复用；生成的应用仓库才归平台 org。

**同步机制要点**（方案 1 的可维护性前提）：

- 单一事实源 = monorepo `templates/basic`（受 monorepo CI 构建验证约束）；
- 同步 workflow 由 fewbie/newbie 仓持有：`push` 触发 + `paths` filter
  `templates/basic/**`，先跑构建验证门、通过后才 push 到 starter 默认分支；
  另开 `workflow_dispatch` 支持手工重放；
- starter 仓不设人工维护路径：README 顶部横幅声明"derived artifact, do not edit"，
  尽力配置 branch protection（受当前 GitHub plan 能力限制，不可则文档记录）。

## 跨宿主 / 演进检验

Starter 仓属框架 owner、内容纯为应用骨架、同步机制只依赖 GitHub Action 与一个 PAT——
不泄漏 nightwatch 的任何平台概念。fewbie/newbie 的下一个宿主平台复用同一 starter 仓
即可，无需任何平台侧适配。演进边界：若未来平台消费方式切换为方案 3（服务端 CLI 生成，
如为支持交互式模块选择），「starter 是派生物、事实源在 monorepo」的分工不变，但
generate 路径退役，届时以新 ADR 取代本决策。

## 影响

- **新增两个仓库**：`worldzhy/fewbie-starter`、`worldzhy/newbie-starter`
  （private、`is_template: true`），内容由 monorepo `templates/basic` bootstrap 推送；
  README 加派生物横幅。
- **fewbie / newbie monorepo**：各新增一个 sync workflow（path filter + 构建验证门 +
  push）；需在两仓配置 `STARTER_SYNC_TOKEN` secret（具备对 starter 仓 contents:write
  的 PAT）。
- **nightwatch-backend**：
  - `prisma/seed.ts` 两处 `repositoryUrl` 改指 starter 仓；
  - `prisma/schema.prisma` 中 `Template.repositoryUrl` 注释语义改为「GitHub generate
    整仓消费的应用骨架模板仓」；
  - `application-creation-flow-design.md`（Living 文档）3.2/3.4 的模板来源语义同一
    PR 更新。
- **平台编排零改动**：`Template.repositoryUrl` 的消费方式
  （`parseGitHubUrl` → `ensureRepoExists`）不变，变化的只是 URL 指向——这正是本决策
  期望的收敛面。
- **模板显示名不变**："fewbie base template" / "newbie standard template" 描述的是
  模板产品名，与仓库命名无关。
- **seed 幂等**：`seed.ts` 为 upsert（按 `[type, name]`），存量部署重新 seed 后 URL
  自动迁移到 starter；已用旧 URL 建出的畸形应用仓不在本决策修复范围（teardown 重建
  即可）。
