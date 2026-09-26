---
name: cross-workspace-alignment
description: Reconcile project memory and execution records across multiple repos with parallel agent sessions. Use when the user asks to fetch/align/compare memories or execution histories across workspaces (e.g. newbie/fewbie/nightwatch/apits), or after cross-repo work to sync decisions. Do not use for single-repo tasks or for making decisions on the user's behalf.
---

# 跨工作区对齐（项目记忆 / 执行记录）

多仓并行开发时（典型：newbie 框架仓、fewbie 框架仓、nightwatch 消费仓、apits 生成器仓，各有独立 agent 会话），会话之间互不可见上下文，靠各仓的项目记忆与执行记录交换状态。本 skill 规定对齐动作的标准流程。

## 触发场景

- 用户要求"获取 X 工作区记忆/执行记录，对比/对齐，差异点我来决策"。
- 跨仓改动后（发布、命名定稿、契约变更），需要把决策同步到所有相关仓的文档与记忆。
- 发现他仓记忆与当前事实（npm 版本、代码、端点、env 变量）冲突。

## 流程

### 1. 盘点（只读，先不动任何文件）

- 列 `~/.trae-cn/memory/projects/` 下全部项目目录。
- 每个相关项目读三类材料还原最新状态：
  - `project_memory.md`（稳定约束、决议、教训）
  - 最近日期目录下的 `topics.md`（时间线条目）
  - 必要时 `session_memory_*.jsonl`（每轮 intent/actions/outcome）
- 注意 `~/src/trae-memory` 与 `~/.trae-cn/memory` 是同一物理存储（firmlink），不要当两份副本。

### 2. 以事实取证，不互抄文档

记忆会过期、会互相转引。冲突时以真实源核对：

- npm 包：`docker exec <node容器> npm view <pkg> versions dist-tags --json`（宿主机无 node，命令一律进容器）。
- git 状态：`git -C <repo> log --oneline -N`、`git -C <repo> status --short`、`git tag --list`；跨仓注意分别用 `-C` 指定目录，不要共用一个 cwd 读错仓。
- 代码事实：直接读消费方代码（env 变量名、端点路径、import 来源、package.json spec），不凭文档断言。
- 本地仓是否存在：`ls -d` 核实，记忆里"存在"的仓库可能已删。

输出对账结果时分三栏：**已一致** / **差异点（待决策）** / **信息项（无需决策）**。

### 3. 差异点交用户决策，不替选

版本线、发布时机、命名/归属、契约变更这类决策，只结构化呈现选项（含影响面与推荐项可以给，但标明是建议），等用户明确拍板后才动手。用户弱确认词（如"好的，执行吧"）只覆盖上一轮明确讨论的单一动作，不要扩张范围。

### 4. 决策落地同步三处

用户拍板后：

1. **代码/发布**：按各仓工程约束执行（node 命令进容器、容器内 git commit 用 `-c user.name=worldzhy -c user.email=worldzhy@126.com`）。
2. **设计文档**：只提交本工作区归属且已被 git 跟踪的文件。他仓的 **untracked 在途文件可以落盘订正，但不要代提交**（归属并行会话，留给对方随其工作一起提交），并在给用户的汇报中显式说明。
3. **项目记忆**：更新所有受影响仓的 `project_memory.md`（新决议、更正记录）；他仓记忆追加一段"由 X 会话执行、等本会话接续"的交接说明。

### 5. 发布前在框架仓自身做 clean 全量构建 + 测试

跨工作区回流的代码"在消费项目编译通过"不等于框架仓自身 tsc 通过——依赖树差异与 tsc 增量缓存会掩盖问题。发布前必须：

```bash
docker exec -w /home/worldzhy/src/<repo> <node容器> bash -c \
  'rm -rf <pkg>/dist <pkg>/tsconfig.tsbuildinfo && npm run build -w <pkg> && npm test -w <pkg>'
```

### 6. 记忆写入必须验证落盘

Edit 工具回显成功 ≠ 磁盘已更新（本环境出现过覆盖层假象：工具视图已变，`grep`/`stat` 看到旧内容）。每次写完用独立 shell 验证：`grep -c <新内容关键词> <file>` + `stat -f '%Sm' <file>`。对并行会话也在追加的共享记忆文件：先 Read 再 Edit、只追加不重写，避免覆盖对方刚写入的条目。

### 7. 状态表述绑定可追溯证据

- `npm stage publish` 返回 staged id ≠ 已发布；以 registry dist-tags 实际变化为判据（网页审批前仍是旧版本），向用户说清"待审批"并给出 staged id。
- file: tgz 等临时产物在消费方回切 registry 之前不得删除。
- 本地 commit 完成即交付；push 永远由用户在 GitHub Desktop 完成，不代推、不列入待办。

## 汇报格式

完成后给用户：①每个决策的执行结果（含提交 hash、staged id 等证据）②改动的文件清单（区分已提交/仅落盘）③新发现的、仍需用户决策的差异点（列选项与影响面）。
