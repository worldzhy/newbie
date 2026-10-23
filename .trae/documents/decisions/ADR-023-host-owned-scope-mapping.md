# ADR-023: Scope 名称从模块移到宿主配置

状态：已采纳
日期：2026-10-23
取代：ADR-019 宿主侧实施章节（scope resolver 注册方式）

## 背景

当前 newbie-modules 的 controller 在 `@RequirePermission` 装饰器里硬编码 scope 名称：

```typescript
// packages/modules/aws-cloudwatch/ec2-instance/ec2-instance.controller.ts
@RequirePermission(PermissionAction.List, Prisma.ModelName.Ec2Instance, { scope: "project" })
```

这里 `"project"` 是 nightwatch-backend 的业务概念（宿主数据模型里有 Project 表、ProjectMember 表、projectId 外键）。如果另一个宿主没有 project 概念、用 organizationId 做隔离，这些模块无法直接使用。违反 newbie-modules 设计原则：

> **禁止把具体宿主或厂商概念焊进通用模块**

框架层（devbie）不应该知道 "project"、"application"、"task-space" 这些业务词汇——它只需要知道"某个资源可能需要额外的上下文检查"。

## 候选方案

| 方案 | 模块层 | 宿主层 | 框架层 |
|------|--------|--------|--------|
| **A. 什么都不做** | 保持 `{ scope: "project" }` | 注册 `"project"` resolver | 按 scope 参数查找 resolver |
| **B. scope 参数外置（选定）** | 移除 `{ scope: ... }` | 提供 `Record<string, string[]>` 资源→scope 映射表 | 装饰器只记 action+resource，Guard 从宿主配置自动查 scope |
| C. scope 参数可选化 + 默认跳过 | `{ scope?: string }`（可选） | 有 scope 的资源传，没有的跳过 | 检查 scope 参数，无参数则跳过 |

## 决策

**方案 B**。决定性理由：

1. **模块零业务感知**：模块只声明"操作资源"，完全不知道 scope、project 等词汇
2. **宿主完全控制**：换宿主只改映射表 + resolver，模块一行不动
3. **零架构变化**：resolver 机制不变，只是查找方式从"装饰器参数"变成"宿主配置"——现有 4 个 resolver（project 默认 + application + task + task-space）直接复用
4. **改动量极小**：模块侧移除 25 处 scope 参数（机械），宿主侧加 ~30 行配置表，框架 Guard 改 ~20 行自动查找逻辑

**被否决的方案**：

- **A**：维持现状，继续泄漏宿主概念到通用模块
- **C**：表面"可选化"，实际上是"没传参数就跳过 scope 检查"——等于给 scope 机制留后门；同时无法表达"资源 A 必须 project scope"的约束

## 跨宿主 / 演进检验

换一个宿主（比如单租户 SaaS，没有 project 概念，用 organization 做隔离）：

```typescript
// 宿主 B 的 authorization.module.ts
const HOST_SCOPED_RESOURCES = {
  organization: ["Ec2Instance", "RdsInstance", "AwsSecretsManagerSecret", ...],
};
```

模块一行不动。resolver 实现也可以不同——宿主 B 用 `organizationId` 解析，宿主 A 用 `projectId` 解析。框架层完全不知道两者的区别。

**成立**。模块只声明资源+操作，scope 是宿主安全策略，不是模块领域的一部分。

## 影响

### 1. devbie（框架层）

| 文件 | 改动 |
|------|------|
| `packages/security/authorization/require-permission.decorator.ts` | options 的 `scope` 字段改为可选（过渡期兼容），或直接移除 |
| `packages/security/authorization/authorization.guard.ts` | 新增：从宿主注入的资源→scope 映射表自动查找 scope |
| SPI | 新增 `SCOPE_RESOURCE_MAPPING` token，宿主提供 `Record<scopeName, resourceNames[]>` |

### 2. newbie-modules（registry）

| 改动 | 数量 |
|------|------|
| 移除 `{ scope: "project" }` / `{ scope: "application" }` / `{ scope: "task" }` / `{ scope: "task-space" }` | **约 25 处**，10 个 controller 文件 |
| provider / service 层 | 不动（scope 只出现在 controller 装饰器） |

### 3. nightwatch-backend（宿主）

| 改动 | 说明 |
|------|------|
| `src/application/authorization/authorization.module.ts` | 新增 `HOST_SCOPED_RESOURCES` 配置表，导出 `SCOPE_RESOURCE_MAPPING` token |
| `src/application/authorization/scope-resolvers.ts` | **不动**（4 个 resolver 直接复用） |
| `src/application/authorization/scope-role-permission.matrix.ts` | **不动**（矩阵不涉及 scope 名称，只涉及角色等级） |
| controller 路由层 | **不动** |

### 4. 迁移顺序

1. 框架层：SPI + Guard 支持新机制（同时兼容旧 `{ scope: string }` 参数，过渡期）
2. 宿主层：新增 `HOST_SCOPED_RESOURCES` 配置表（同时注册旧机制的 resolver，双轨并行）
3. newbie-modules：移除 25 处 scope 参数（机械改动，一行一行删）
4. 验证：tsc + eslint + 测试全绿
5. 清理：框架层移除旧 `{ scope: string }` 参数支持（下一里程碑）

### 5. 后续工作

- 框架 Guard 自动查找 scope 的优先级：先查资源是否在映射表中，再查装饰器 `options.scope`（过渡期）
- 宿主配置表可演进：scope 可以是数组（一个资源多层级 scope），框架层做笛卡尔乘积检查
