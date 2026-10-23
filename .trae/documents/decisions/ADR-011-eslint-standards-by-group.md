# ADR-011: 按前后端分组固化 eslint 标准，入口拆为 backend / frontend / next

- 状态：已采纳
- 日期：2026-10-21
- 决策人：worldzhy（分组口径与"后端共用一套、前端共用一套"由用户明确拍板）
- 更新：2026-10-23 — 入口命名与 frontend 分组由 ADR-016 取代（backend→base、frontend 入口删除）；nest 层最终形态见 ADR-017，newbie-modules 的组合方式见 ADR-019。frontend 组唯一消费方 fewbie 已并入 newbie monorepo（ADR-012）。
- 取代：ADR-010 中的 eslint 入口命名与分组部分（prettier 单一真源等其余内容仍然有效）

## 背景

ADR-010 交付后，eslint 侧是两个入口 `eslint/nest` 与 `eslint/next`，各仓按技术栈自行选择。用户随后明确了分组口径：

1. newbie / newbie-starter / nightwatch-backend / newbie-modules
2. fewbie / fewbie-starter / nightwatch-frontend
3. apits

要求：全部共用 format；所有前端项目共用一套 lint 标准；所有后端项目共用一套 lint 标准。

落地时暴露了一个硬约束：`eslint-config-next` 在加载时会 require `next/dist/compiled/babel/eslint-parser`，即**必须安装 next 包才能加载**。fewbie 属于前端组，但它是 Node CLI 仓库（无 React/Next 运行时），实测直接报错 `Cannot find module 'next/dist/compiled/babel/eslint-parser'`。若强行加 `next` 依赖只为满足 lint，属于为工具反向绑架架构。

同时确认 `eslint-config-next` 与自带的 React 插件层不能在扁平配置里叠加：`jsx-a11y` 会被重复定义，eslint 直接报 `Cannot redefine plugin "jsx-a11y"`。

## 决策

1. 入口按"分组 + 框架层"分层，共三个导出：
   - `@devbie/style-guide/eslint/backend`——后端标准：`core` + prettier 关闭项。消费方：newbie、newbie-starter、nightwatch-backend、newbie-modules、apits。
   - `@devbie/style-guide/eslint/frontend`——前端标准：`core` + React / react-hooks / jsx-a11y（仅作用于 `*.jsx` / `*.tsx`）+ 固定 React 版本 + prettier。消费方：fewbie。
   - `@devbie/style-guide/eslint/next`——`core` + 官方 `eslint-config-next`（core-web-vitals + typescript）+ prettier。消费方：fewbie-starter、nightwatch-frontend。
   - `core` 为内部文件（不对外导出）：typescript-eslint recommended + 语言级代码质量规则（eqeqeq、prefer-const、no-var 等）。前后端标准共享这一层，故共享规则永不漂移。
2. `next` 不叠加 `frontend`：官方包已内置 React / react-hooks / jsx-a11y，叠加会触发插件重复定义。两个 Next 应用拿到的规则集因此是"core + 官方 Next 规则"，与 fewbie 的"core + 自建 React 层"在 core 上完全一致。
3. React 层按文件类型收敛到 `*.jsx` / `*.tsx`：fewbie 的 Node 代码不参与 React 规则求值，而其模板源码（13 个 tsx）正常受检。
4. React 版本固定为 19.0 而非 `detect`：fewbie 未安装 react 包，detect 只会产出一条无意义的告警。生态整体升级 React major 时随里程碑调整。
5. newbie-modules 启用后端标准并纳入 CI：该标准是纯语法规则（非 type-aware），不依赖任何模块业务依赖即可运行，正好补上"未被任何消费方装配的模块从未被 lint"的空白（本次修复 87 处）。
6. 命名取 `backend` / `frontend` 而不是继续用 `nest` / `next` 描述分组：`nest` 对 apits（代码生成器，非 Nest）不成立，`next` 对 fewbie（无 Next 运行时）不成立；框架细节由 `next` 这一个入口承担。

## 影响面

- `@devbie/style-guide` 1.1.0 → 1.1.3 已在 latest 发布；8 仓 dev 已接入。
- 入口重命名是破坏性契约变更，但生态无外部消费方，按 1.x 内 minor 处理（ADR-010 决策 6 同源）。
- fewbie-starter / nightwatch-frontend 由本地 `eslint-config-next` 直引改为经 `next` 入口，版本由真源统一（16.4.2），避免两个 Next 应用之间规则漂移。
- newbie-modules CI 增加 `npm run lint` 步骤；`newbie dev lint`（模块分层规则）仍是独立的注册仓专属检查，不并入 eslint。
