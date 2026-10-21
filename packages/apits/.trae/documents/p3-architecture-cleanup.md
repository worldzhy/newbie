# 架构清理：消除 Swagger/YApi 中间层，直读 OAS3

## Context

当前数据流是 `OAS3 → openapi3Format（降为 Swagger 2.0）→ handleSwagger（转为 YApi Interface）`，遗留了大量 YApi 时代字段和类型。用户要求"不需要考虑历史包袱，直接做到最好"——因此可以：丢弃 Swagger 2.0 支持、删除所有 YApi 遗留代码、直接从 OAS3 spec 生成 `Interface[]`。

## 变更范围

### 1. 重写 swaggerJsonToYApiData.ts（核心）

**删除的函数/机制：**
- `openapi3Format` 整个函数（~90 行）——不再需要中间格式
- 模块级 `let SwaggerData` / `let isOAS3`——通过参数传递或直接移除
- `SwaggerData.parameters` 的 `$ref` 查找（L278-280）——Swagger 2.0 专属，OAS3 用 `components/parameters`
- `cats` 数组构建 + `catid` 查找（L401-414）——`catid` 从不被下游读取
- `dayjs` 调用（L399）——`add_time`/`up_time` 从不被读取
- `basePath` 返回值——从不被读取
- `swaggerData` 返回值——从不被读取
- `parseOpenapi` 中的 `isOAS3` 判断分支——只支持 OAS3

**重写 handleResponse——直接读 OAS3 content：**
```ts
function handleResponse(responses): {body: string; hasSchema: boolean} {
  // 直接从 OAS3 res.content 取 schema，不依赖 openapi3Format 预扁平化
  // 优先 application/json → hal+json → */*
}
```

**新增 handleRequestBody——直接读 OAS3 requestBody：**
```ts
function handleRequestBody(requestBody, api): void {
  // content['application/json'].schema → api.req_body_other + req_body_type='json'
  // content['multipart/form-data'|'x-www-form-urlencoded'].schema → 展开 req_body_form
  // additionalProperties → api.req_body_additional
  // 不再合成 consumes / 不再创建 parameters[] 中间态
}
```

**简化 handleSwagger——只处理 OAS3：**
- 移除 `consumes` 判断（OAS3 用 requestBody.content 的 media type）
- 移除 `in: 'body'` / `in: 'formData'` 分支（由 handleRequestBody 取代）
- 保留 `api.parameters` 处理（OAS3 原生 path/query/header 参数）
- `produces` 判断改为直接看 responses content
- 不再初始化 `req_headers`、`tag`、`status`、`markdown`

**简化 swaggerJsonToYApiData 导出：**
- 最终 map 只保留下游实际读取的 14 个字段
- 不再设 `_id`/`project_id`/`catid`/`tag`/`add_time`/`up_time`
- 不再构建 `cats` 数组
- `catname` 仍保留（内部 category 过滤用，靠索引签名）

### 2. 精简 types.ts

**从 Interface 移除 12 个死字段：**
`_id`、`_category`、`_project`、`status`、`markdown`、`project_id`、`catid`、`tag`、`req_headers`、`req_body_additional`、`add_time`、`up_time`

（保留的 14 个字段：`title`、`path`、`method`、`req_params`、`req_query`、`req_body_type`、`req_body_is_json_schema`、`req_body_form`、`req_body_multipart`、`req_body_other`、`res_body_type`、`res_body_is_json_schema`、`res_body` + `[key:string]: any`）

**删除死类型：**
- `Project`——仅被 `_project` 引用，已删
- `BaseInterfaceInfo`——全仓库无引用
- `CategoryList`——全仓库无引用
- `InterfaceList`——仅被 `Category.list` 引用，Category 被精简

**精简 Category：** 移除 `_id`、`list`、`add_time`、`up_time`，仅留 `name`、`desc`

**移除无用 import：** `LiteralUnion`、`OmitStrict` 仅被已删字段使用

### 3. 移除依赖

- `dayjs`——仅用于 `add_time`/`up_time`（死字段）
- `openapi-types` 中的 `OpenAPIV2` import（Swagger 2.0 类型）——保留 `OpenAPIV3`

### 4. 更新测试

- `test/index.ts`：P-2 测试验证 `handleResponse` 直接读 OAS3 `content`（当前已通过 `openapi3Format` 预处理间接触发，重构后需直接读 content）
- 新增 P-4 测试：验证 OAS3 `$ref` 参数解析（OAS3 用 `components/parameters`）

## 关键文件

| 文件 | 变更 |
|------|------|
| `src/utils/swaggerJsonToYApiData.ts` | 重写：删 openapi3Format、删模块级状态、重写 handleResponse、新增 handleRequestBody、简化 handleSwagger、简化导出 |
| `src/types.ts` | 删 12 字段 + 4 死类型 + 精简 Category + 移除 LiteralUnion/OmitStrict import |
| `package.json` | 移除 dayjs 依赖 |
| `test/index.ts` | 更新 P-2 测试 |

## 验证

```bash
docker exec -w /home/worldzhy/src/apits-gen b41986a2a300 npm run build
docker exec -w /home/worldzhy/src/apits-gen b41986a2a300 npm test
docker exec -w /home/worldzhy/src/apits-gen b41986a2a300 npx tsc --noEmit
```
