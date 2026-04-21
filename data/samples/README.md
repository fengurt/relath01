# 样例图数据包（JSON）

- 与 `neo4j/cypher/00_graph_model_reference.cypher` 及项目知识库中的 **6 节点 / 7 边** 一致。
- 每个 `sample-batch-*.json` 为**一次业务批次**：含多类节点 + 多条关系，可对应一次 MERGE/导入作业或消息总线事务。

**结构说明**

| 字段 | 含义 |
|------|------|
| `schemaVersion` | 本包 JSON 结构版本 |
| `batchId` | 批次 ID（幂等/审计） |
| `nodes` | 按标签分组的节点属性（与 Neo4j 属性名一致） |
| `relationships` | 有向边；`source` / `target` 用 `label` + 主键字段 + 主键值 唯一定位端点 |
| `relationships[].properties` | 边上必存关系级主键/业务键，与 `03_relationship_uniqueness.cypher` 设计一致 |

**主键字段**（与约束一致）: `consumerId`, `merchantId`, `employeeId`, `partnerId`, `orderId`, `settleId`.
