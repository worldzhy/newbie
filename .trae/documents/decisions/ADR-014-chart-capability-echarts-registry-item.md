# ADR-014: 框架层图表能力选 echarts 单栈，以 registry/chart item 承载

> **迁移注记（2026-10-21）**：本文原存档于 worldzhy/fewbie `decisions/ADR-003`。fewbie 仓已并入本 monorepo（见 ADR-012）并归档只读，本文随 `packages/fewbie-cli` 迁入，正文原样保留。

状态：已采纳（2026-10-16）
日期：2026-10-15

## 背景

nightwatch-frontend 是 fewbie 体系的第一个复杂宿主，其图表栈目前处于分裂状态：chart.js（+ react-chartjs-2）8 处调用点，echarts 1 处（web-monitor 地理分布图）。配色则有 3 套互不相干的实现：后端 analysis 的 rgba 循环调色板、前端 copilot 的 hex accent 调色板、web-monitor 的语义固定色。

分裂的具体代价（均已取证）：

- **能力缺口**：chart.js 原生无地理图能力，唯一的地图需求必须由一个孤立的第二引擎承担；而该引擎的使用点还夹带 v3 时代遗留层——`public/js/china.js`（69KB，文件注释自述为 v3 构建）、`window.echarts` 全局挂载 hack、`dataRange` / `label.normal` 旧语义；且从不调用 `dispose`（实例泄漏），`world` 分支因缺少对应地图资源实际永久失效。
- **无法沉淀**：图表能力是任何 dashboard 型宿主都会重复需要的东西，但双引擎现状既没有单一真源，也没有可复用出口。
- **契约分裂**：颜色真源不统一（analysis 由后端下发、copilot 由前端自决），同一产品内并存两套模型。

为什么必须在写代码前决定：这是"引擎选型 + 跨宿主契约 + 框架沉淀通道"级决策，牵动 fewbie 框架的沉淀机制与 nightwatch 两仓契约。按跨仓治理规则（架构决策点先落 ADR），先落本文再动代码。

## 候选方案

**引擎维度**

1. echarts 单栈。
2. chart.js 单栈 + `chartjs-chart-geo` 插件。
3. 双引擎 + 调用侧适配层（只统一接口、不统一引擎）。
4. 什么都不做（维持双引擎现状）。

**通道维度**（与引擎正交）

- A. fewbie registry item（`packages/fewbie-cli/registry/chart/`，`fewbie add` 复制源码）。
- B. `templates/basic` 内置。
- C. 留在 nightwatch-frontend 宿主层。

**颜色维度**

- 前端上收 / 后端保留 / 本次不动。

## 决策

采纳：**echarts 单栈 + registry item（通道 A）+ 颜色真源上收前端**。

**决定性理由（一条主轴）：框架层图表能力的选型判据是"单引擎能力闭包"——框架件要被未知宿主继承，它必须覆盖宿主可能出现的一整类需求；而"地理分布 + 时序缩放"正是监控 / 分析类宿主的核心诉求，chart.js 的短板恰好落在这两处，echarts 是唯一"单引擎即超集"的候选。** 由此：

- 方案 2 达不到单库目标：地理图必须外挂 `chartjs-chart-geo`，连带 `d3-geo` / `topojson-client`，落地形态是"引擎 + 插件 + d3 家族"；且它清不掉现存遗留层——`china.js` 是 echarts-only 资源，只要地图还靠它，遗留包就无法删除。
- 方案 3 是遮蔽而非统一：产物里仍是两个引擎加遗留层，属于不可追溯的例外集合。
- 方案 4 让上述三个问题永久固化。

**通道选 A 的理由**：registry 是框架设计决策 12 规定的业务组件 / 逻辑 util 落点，具备 update 通道，依赖由 `item.json` 声明并由 CLI 自动安装。反之 `templates/basic` **无 update / doctor 通道**（nightwatch-frontend 资产沉淀计划风险节已明文），沉淀进去必然漂移；且会把 echarts 这个重依赖强加给每一个宿主，包括不使用图表的宿主——同计划 A2（react-query Provider）已立下同名先例："保持可选 item，模板不动"。另，shadcn 官方 chart 组件本身即为 registry item 而非模板内置，形态一致。

**颜色选"前端上收"的理由**：调色板属表现层关注点，前端已有 CSS 变量设计系统可对齐；copilot 现状即此契约。后端 `src/application/analysis/chart-colors.ts` 经取证为零第二消费者的宿主私有代码（仅 `analysis.service.ts` 引用），删除不产生任何 registry back-port 义务。

**附带承认（非决策，实施期定）**：地图资源（china / USA GeoJSON）如何随 item 分发——随 item 附带静态资源，或由宿主自备——留待实施时确定，并在 item 描述中写明。

## 跨宿主 / 演进检验

- **换宿主是否成立**：registry/chart 不泄漏 nightwatch / copilot 的任何概念；对外契约是"结构化数据 + 受控 option 扩展点"，任何 dashboard 型宿主可直接消费。
- **依赖泄漏检查**：echarts 由 `item.json` 声明、由 `fewbie add` 安装，不进入模板基线；不消费图表的宿主零新增依赖。
- **演进边界**：未来 copilot-dock（沉淀计划 B 档候选）抽取时，其图表消费面将依赖本 item 的 API 稳定性；若需扩展图型（热力图 / 桑基 / 仪表盘），echarts 单栈天然覆盖，无需再引入第三个引擎。
- **React 版本**：框架件须 React 18/19 双兼容。采用自建薄适配层，不引入 `echarts-for-react` 一类第三方 wrapper（避免 peer 版本约束），使 nightwatch-frontend（React 18.3）与模板（React 19.2）同时成立。

## 影响

- **fewbie**：新增 `registry/chart` item（建议形态"受控 React 适配组件 + 调色板 / 语义色约定"，与 theme 的多文件 item 同形）。验收按沉淀计划通用基线：fewbie 仓 `tsc` 0 错 + 既有 CLI 测试通过；用 `templates/basic` 生成临时项目后 `fewbie add chart` + `npm run build`（React 19）全绿；`grep nightwatch` / `grep copilot` 零命中；独立 commit。
- **时序（由约束决定，非偏好）**：**先在 nightwatch-frontend 内完成迁移与验证，再单向抽入 registry**。nightwatch-frontend 为 React 18.3，无法反向消费 fewbie item（沉淀计划 Non-Goal 1），且框架沉淀的既有验收哲学是"已被真实项目验证过的资产"。
- **nightwatch-frontend**：8 处 chart.js 调用点迁至 echarts 适配层（analysis 图表块、copilot 图表块、security-insights、servers、databases、web-monitor 的 overview / requests detail / pages list）+ map-chart 重写；卸载 `chart.js` 与 `react-chartjs-2`；删除 `/js/china.js`、`window.echarts` hack、失效的 `world` 分支；重写时补上 `dispose`（修现有实例泄漏）；各文件重复的 `ChartJS.register` 收敛为适配层内一次性注册；地图改用 `registerMap` + GeoJSON（仓内 `/USA.json` 已有 registerMap 先例）。
- **nightwatch-backend**：analysis 的 chart 契约收窄——`analysis.service.ts` 停止下发 `backgroundColor` / `borderColor`，删除 `chart-colors.ts`；前端 `AnalysisChartDataset` 的颜色字段先转 optional 过渡，避免前后端部署顺序硬耦合；契约变更后重生成 apits；`dist/` 为构建产物，不手工修改。
- **色彩收敛**：3 套调色板（后端 rgba 循环 / copilot hex 循环 / web-monitor 语义色）收敛为"一套循环调色板 + 语义色例外"，落点在 registry/chart item 内。
- **文档**：nightwatch-frontend 侧的实施细节参照 mui-to-shadcn-migration.md 先例另立实施计划文档；本 ADR 只承载决策，正文不再随实施修订（被取代时另开新 ADR 并标注 supersedes）。
