# ADR-013: api-client 信封感知、单通道错误归一轮子与 UI/路由无关钩子

> **迁移注记（2026-10-21）**：本文原存档于 worldzhy/fewbie `decisions/ADR-001`。fewbie 仓已并入本 monorepo（见 ADR-012）并归档只读，本文随 `packages/fewbie-cli` 迁入，正文原样保留；下文"关联"中的 newbie ADR-001 即本仓 `ADR-001-http-status-semantics-for-auth-failures`。

状态：已采纳
日期：2026-10-14
关联：newbie `ADR-001-http-status-semantics-for-auth-failures`

## 背景

`api-client` registry 件是所有 fewbie 宿主的 HTTP 客户端骨架（axios 实例 + bearer 令牌 + httpOnly refresh cookie 轮换 + 401 静默重试 + proactive refresh）。nightwatch 宿主存在一份约 400 行的分叉实现 `src/api/fetch.ts`，与 registry 骨架已实质漂移：

- registry 骨架只在 reject 通道判错，且按扁平 body 解析——对 newbie 信封 `{code,error,data}` 开箱即坏（错误消息读不到、refresh 响应 token 在 `data.data` 下取不到）；
- 宿主实现内建 toast、硬编码登录路由、返回 `[data, envelope]` tuple（215 个调用点解构、第二元素零消费）；
- 宿主有跨标签 Web Locks 串行，registry 骨架没有；
- 宿主在成功与 reject 双通道各写一套错误处理，出现过同一次失败弹两条 toast 的事故。

newbie ADR-001 已将所有失败校正为语义化状态码 + 信封 body，客户端不再需要在成功通道判错。需要决定 registry 件的标准形态，使宿主只保留薄适配、分叉被消除。

## 候选方案

1. **本决策**：registry 件成为信封感知的唯一真源——单通道错误归一为 `ApiError`，成功只解包 `data`；跨标签 Web Locks 串行；错误表现与会话终结通过钩子交给宿主。
2. 维持 registry 骨架现状，各宿主自行改造：nightwatch 经验证明每个宿主都会重学一遍信封解析与双 toast 缺陷，分叉必然重演。
3. 把 toast/路由也做进 registry 件：客户端绑定具体 UI 库与宿主路由，违背 shadcn 式"复制源码、宿主装配"的无关性，其他宿主无法消费。

## 决策

采用方案 1，标准契约如下：

- 成功响应：拦截器识别 newbie 信封（普通对象且含 `code`/`data` 标记）后解包返回 `body.data`；Blob/ArrayBuffer/字符串等非 JSON 原样透传。便捷方法统一返回 `Promise<T>`，失败抛 `ApiError(status, code, message, data)`。不提供 tuple 返回形态。
- 失败响应（唯一判错通道）：从信封 `error.message` 取消息、携带 HTTP status 与 body code；401 且非 `/auth/` 且未重试过 → 跨标签 Web Locks 命名锁内刷新（锁内先 re-check localStorage，避免他标签刚刷新后的冗余调用）→ 失败 1.5s 用轮换后 cookie 重试一次 → 仍失败则 `clearSession()` 并触发 `onSessionExpired`。
- 每次最终失败恰好经一个出口归一为 `ApiError` 并调用一次 `onError(ApiError)` 钩子；refresh 与重放中途不触发钩子。双 toast 一类缺陷在结构上不可能发生。
- 客户端不 import 任何 UI/路由库：宿主通过 `onError`（接 sonner 等提示层）与 `onSessionExpired`（接路由器跳转）注入行为。
- 项目常量区（baseURL env、storage keys、refresh path、lock name）保留为宿主装配时手改，postInstall 已声明。

决定性理由：失败判错只应有一个通道、错误表现只应有一个出口；把 UI 反应做成注入钩子而非内建调用，才能让同一份代码在任意宿主成立（方案 3 被否），而把它留在每个宿主各自实现则已被事故证伪（方案 2 被否）。

## 跨宿主 / 演进检验

- 信封形态是 newbie 全部后端的统一契约，不包含 nightwatch 专有字段；项目差异全部集中在文件顶部常量区。
- `onError`/`onSessionExpired` 是普通回调，对 Next.js 以外的宿主（其他 SPA、SSR）同样成立；`typeof window` 守卫保证 SSR 安全。
- Web Locks 为浏览器原生 API，无新依赖；不支持时降级为单飞 + 重试。
- 上传（FormData）、下载（blob）、HEAD/OPTIONS 均有显式透传/完整响应路径，不为 JSON 专属。

## 影响

- 重写 `registry/api-client/src/lib/api-client.ts`；item.json 描述更新；本文档同步。
- nightwatch-frontend 装配后删除 `src/api/fetch.ts`、`src/api/type.ts`，仅保留 `src/api/request.ts` 薄适配层（apits 单参约定 + sonner/路由钩子注册）；215 处 tuple 解构改为直接取值。
- registry 件不随本次发 npm（本地装配走源码 registry）；需要 `fewbie update` 通道时另走发布清单。
