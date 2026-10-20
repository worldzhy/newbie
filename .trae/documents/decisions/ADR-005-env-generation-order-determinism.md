# ADR-005: env 生成顺序确定性（段序与段内变量均字母序）

状态：已采纳
日期：2026-10-20

## 背景

`assembleEnvExample` 生成 `.env.example` 的 `@@newbie-modules` 块时，模块段序直接沿用 `enabledKeys` 的传入顺序；`assembleEnv` 对 `.env` 的增量 upsert 同样沿用既有段落位置。而 `enabledKeys` 的顺序 = `modules.json` 的累积启用历史 + 每批传递依赖的批内字母序（ADR 无此决策，是 `expandModuleClosure` 的实现副产物）。

问题：**相同的模块集合在不同项目（或同一项目推倒重装）会产出逐字节不同的生成块**。生成结果不可复现，历史顺序噪音污染后续每次 install/update 的 diff 可读性，违背"可复现/可追溯"底线。

## 候选方案

1. 维持现状（启用历史序）：diff 对既有项目稳定，但生成物依赖不可见的历史，不可复现。
2. 段序全局字母序：写块前对 `enabledKeys` 排序，任意项目的同模块集合产出逐字节相同的块。
3. 依赖拓扑序：被依赖的基础模块在前。存在多个合法拓扑解，仍受遍历起点影响，只解决一半非确定性；且 `.env` 是扁平配置文件，段序不承担依赖关系表达职责（依赖图在 `moduleDependencies` 清单中）。

段内变量顺序同理：manifest 作者书写序在各模块间风格不一（半随机态），字母序下同前缀三件套（`*_KEY/SECRET/URL`）天然相邻，分组性几乎零损失。

## 决策

采用方案 2，且两处同步：

1. `assembleEnvExample`：`enabled` 排序后逐段产出；段内 `Object.entries(manifest.env)` 按 key 字母序（code-unit，与 `expandModuleClosure` 中 `added` 的 `sort()` 先例一致）。
2. `assembleEnv`：新增 `normalizeSections`——对 `.env` 中识别为 CLI 生成格式的 section（`# ! <title> variables` 三行装饰头）做同样的序规范：段间按 title 排序、段内 entry 按 key 排序；**仅 entry 行在段内移动，section 之外的一切内容（注释、空行、用户自写变量）原样保留**。排序仅在两个 assemble 函数内部进行，`enabledKeys` 本身不动（schema/NestJS 装配顺序不受影响）。

决定性理由：确定性是生成器的正确性属性——同输入必同输出；`.env` 段序没有任何信息职责，历史序是纯噪音。

## 跨宿主 / 演进检验

生成逻辑在 CLI 单点，对所有消费项目一致成立；不依赖任何宿主特定概念。存量项目下次 install 产生一次性段序重排 diff（语义零变化），此后段序恒定、diff 只反映模块增删。生成物呈现变化、非契约 breaking，按"上线前留 1.x"口径走 minor。

## 影响

- 换来：同模块集合跨项目逐字节可复现；install/update 的 env diff 从此只表达真实变化。
- 代价：存量项目一次性重排 diff；`# ! <title> variables` 头格式的段被认定为 CLI 所有权（段内自定义注释不再被保留——与 `upsertEnvSection`/`pruneEmptySections` 的既有所有权口径一致）。
- 后续：无。`modules.json` 状态文件的存储顺序不在本决策范围（非人读契约物）。
