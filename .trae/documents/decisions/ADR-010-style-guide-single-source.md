# ADR-010: 代码风格单一真源收敛为 @devbie/style-guide 共享包

- 状态：Accepted
- 日期：2026-10-21
- 决策人：worldzhy（命名与单包形态经多轮压力测试后拍板）

## 背景

全生态 7 仓的 format/lint 口径长期分裂：

- prettier 靠"各仓各持一份 canonical `.prettierrc` 副本 + 版本锁 ^3.9.9"维持一致，但复制不是真源，无任何机制阻止单仓漂移。
- eslint 两种格式并存：nightwatch-frontend / fewbie-starter 用 flat config（eslint.config.mjs），nightwatch-backend / newbie-starter 仍用废弃的 legacy `.eslintrc.js`；newbie / fewbie 框架仓自身完全无 lint。
- CI 门禁不齐：本会话刚补齐 format:check（7 仓），但 lint 只有 nightwatch-frontend 跑（lint:error）。

## 决策

1. **单一共享包**：在 newbie 仓新建 `@devbie/style-guide`，同时导出：
   - `@devbie/style-guide/prettier`——canonical prettier 配置（锁 3.9.9，版本约束收进包依赖）
   - `@devbie/style-guide/eslint/nest`——Nest 系（nightwatch-backend、newbie-starter、newbie/fewbie 框架仓）
   - `@devbie/style-guide/eslint/next`——Next 系（nightwatch-frontend、fewbie-starter）
2. **消费侧引用而非复制**：各仓删除本地 `.prettierrc`，package.json 加 `"prettier": "@devbie/style-guide/prettier"`；eslint 侧 `eslint.config.mjs` 统一 import 对应入口。
3. **忽略清单保留各仓自有**：`.prettierignore` / eslint ignores 是仓特有构建产物清单，不属于真源。
4. **两套栈内基准而非一套全集**：nest 与 next 入口独立，跨栈强统无意义。
5. 配套：backend / newbie-starter 的 `.eslintrc.js` 迁移 flat config；newbie / fewbie 框架仓补 lint；各仓 CI 增加只读 lint 步骤（backend 现有 `lint` script 带 `--fix` 会改写源文件，需新增只读变体）。
6. 依赖 major 冻结策略（2026-10-19）同样适用于本包对 prettier/eslint 的版本约束。

## 命名决策记录

候选 `@devbie/style-guide` / `@devbie/ts-style-guide` / `@devbie/code-style-guide`：

- 否决 `ts-` 前缀：包内容一半（prettier）语言无关；eslint 入口按框架命名；devbie 生态全栈 TS，"ts-" 回答的是不存在的歧义。
- 否决 `code-` 前缀：npm 包上下文里 style guide 唯一所指即代码风格，code- 与 ts- 同属冗余限定词。
- 回应"style 是否不清晰"：命名最小单位是固定复合词 "style guide"（Google/Airbnb/@vercel 同款），不是 style 单词；备选（style-config → CSS 歧义、conventions → 语义过宽、lint-format → 机制罗列）均更差。
- 先例锚点：@vercel/style-guide（同形态包：eslint+prettier+ts 配置合集）。

## 影响面

- 7 仓各删 `.prettierrc`、改 package.json、（4 仓）新增/改写 eslint.config.mjs、（6 仓）ci.yml 加 lint 步骤。
- starter 模板接入后，`newbie create` / `fewbie create` 生成物天然继承真源。
- 发布管线新增一个包（@devbie/style-guide，1.x 线，直接 latest）。
- newbie-modules 维持无 lint（纯注册仓，设计如此，见该仓 ci.yml 注释），仅消费 prettier 真源。

## 执行形态

独立里程碑，不与功能改动混装；实施细节（包结构、迁移顺序、验证口径）由执行会话按本 ADR 展开。
