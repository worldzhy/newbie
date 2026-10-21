---
name: ts-code-cleanup
description: 整理 TypeScript src 结构、统一文件命名、清理未使用导入与死代码。用于整理/重构 src 目录、清理死代码、review 文件组织、检查未使用导入；不用于新功能开发。
---

# TypeScript 源码结构整理与死代码清理

对 TypeScript 项目做"结构梳理 + 命名统一 + 死代码清理"。核心原则：**业务逻辑不变，每次改动后构建+测试必须通过**。大批量删除前必须与用户对齐清单。

## 0. 运行环境（本仓库）

无宿主机 Node，命令通过容器执行，npm 不在默认 PATH，必须用 `bash -lc`：

```bash
docker exec -w /home/worldzhy/src/apits-gen <容器ID> bash -lc 'npm run build'
docker exec -w /home/worldzhy/src/apits-gen <容器ID> bash -lc 'npm test'
```

容器 ID 用 `docker ps` 确认（可能变化）。构建输出 `dist/cjs` + `dist/esm`；测试断言 G-1/G-2/G-3。

## 1. 结构与命名审查

- `find src -name "*.ts" | sort` 列出全部文件，统计每个文件行数与导出。
- 检查命名一致性：项目内文件应统一为 camelCase/小写。PascalCase 仅当全项目约定"类名即文件名"时保留，单个例外要改掉。
- 检查目录归类：
  - 单文件目录是过度组织的信号 —— 要么并入最合适的现有目录，要么有明确的"将新增同类文件"理由才保留。
  - 警惕名称过近造成混淆，如 `generator.ts`（编排类）与 `generators/`（子模块）。
  - 目录名必须准确反映内容（"handler" 不是 "generator" 时不要放进 generators/）。
- 文件移动用 `git mv` 保留历史；macOS 文件系统大小写不敏感，改大小写要走临时名两步：`git mv A.ts tmp.ts && git mv tmp.ts a.ts`。
- 移动后同步更新：文件内相对导入、所有引用方、`bin/` 入口的 dist 路径、test 文件导入。包入口 `index.ts` 留在 src 根，避免改 package.json 的 main/module/types。

## 2. 精确扫描未使用代码

不要靠肉眼猜，用编译器：

```bash
npx tsc --noEmit --noUnusedLocals --noUnusedParameters 2>&1 | grep -E "is declared but|never read"
```

再用 Grep 交叉验证每个导出在 `src/` 和 `test/` 是否真的无引用（tsc 不报告"被导出但无人用"的符号）。

**分类处理，不要一刀切：**

| 类型 | 处理 |
|------|------|
| 未使用的 import | 直接删 |
| 未使用的导出函数/常量/类型（src+test 均无引用） | 列入清单，经用户确认后删 |
| 仅文件内部使用却带 `export` 的函数 | 去掉 `export`，不删函数 |
| 函数签名参数（公共 API 形参、回调位置参数、模板约定签名） | **保留**，删了破坏调用约定 |
| 解构后未用的变量 | 看它所在链路是不是死逻辑（见第 3 节） |

删除 import 后检查它引入的模块是否还有其他用处（如删完 `path.xxx` 调用后 `import path` 也要删）。

## 3. 清理 vs 补全：先判断"未完成"还是"被废弃"

发现"生成了但没被消费"的链路（算了不渲染、构造了不写出）时，不要默认删或补，先溯源：

1. 看项目真实数据源 —— 本仓库是纯 Swagger/OpenAPI，复用了 YApi 中间结构，转换器会给 YApi 平台字段放假值（`project_id:0`、`_id:序号`、`up_time:当前时间`）。
2. 依赖假数据的功能（YApi 链接、更新时间）补全了也是错的 → **清理**。
3. 消费端已被删除、无法自洽的残留链路（如运行时校验：schema 文件+inspector+注入三者缺二）→ **清理整条链**，不要只删一半。
4. 数据真实、只差最后一步接线的功能 → 向用户说明，由用户决定补全或清理。
5. 公开导出的配置类型（如 CommentConfig）中"配了也不生效"的字段属于失诺 API，pre-1.0 版本可随死逻辑一起删，但要显式告知用户。

判断结论和证据要讲清楚，再让用户拍板范围。

## 4. 执行与验证顺序

1. 用 TodoWrite 按"移动/删文件 → 改导入 → 删死代码 → 验证"拆解。
2. 每一批改动后立即 `npm run build` + `npm test`，不要攒一大批再验。
3. 删整个文件前 Grep 全仓库（含 test、bin）确认无引用；git 已跟踪文件删除用 `git rm`/DeleteFile 后注意 `git mv` 目录时索引里残留文件会报错，先 `git rm --cached`。
4. 目录搬空后 `rmdir` 移除空目录。
5. 最终再跑一次第 2 节的 tsc 扫描，剩余项逐条确认都是"有意保留的签名参数"。

## 5. 注释与代码风格（本仓库 AGENTS.md 约定）

- 源码注释一律英文；面向用户的 CLI 提示可保留中文。
- 结构整理阶段不重写业务逻辑、不顺手改格式，改动最小化。
- 死代码删除要净：相关的收集变量、接口字段、import、仅服务它的文件一起清，不留断头。
