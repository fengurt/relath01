import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
  message,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import {
  fetchGraphPing,
  fetchGraphSummary,
  fetchHealth,
  fetchSampleBatchJson,
  ingestGraphBatch,
} from "../api/publicApi";
import type {
  BatchIngestResponse,
  GraphPingResponse,
  GraphSummaryResponse,
  HealthResponse,
} from "../api/types";
import { SAMPLE_FILES } from "../config/sampleRefs";

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [ping, setPing] = useState<GraphPingResponse | null>(null);
  const [summary, setSummary] = useState<GraphSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastIngest, setLastIngest] = useState<BatchIngestResponse | null>(null);
  const [ingesting, setIngesting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthResponse, pingResponse, summaryResponse] = await Promise.all([
        fetchHealth(),
        fetchGraphPing(),
        fetchGraphSummary(),
      ]);
      setHealth(healthResponse);
      setPing(pingResponse);
      setSummary(summaryResponse);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const ingestFromFile = useCallback(
    async (fileName: string) => {
      setIngesting(true);
      try {
        const payload = await fetchSampleBatchJson(fileName);
        const result = await ingestGraphBatch(payload);
        setLastIngest(result);
        if (result.status === "error") {
          message.error(result.message ?? "导入失败");
        } else if (result.errors?.length) {
          message.warning(`已导入（部分告警）节点 ${result.nodesImported ?? 0} / 边 ${result.relationshipsImported ?? 0}`);
        } else {
          message.success(
            `导入完成：节点 ${result.nodesImported ?? 0}，关系 ${result.relationshipsImported ?? 0}`
          );
        }
        await load();
      } catch (caught) {
        message.error(caught instanceof Error ? caught.message : String(caught));
      } finally {
        setIngesting(false);
      }
    },
    [load]
  );

  const ingestFullSample = useCallback(async () => {
    setIngesting(true);
    try {
      for (const meta of SAMPLE_FILES) {
        const payload = await fetchSampleBatchJson(meta.fileName);
        const result = await ingestGraphBatch(payload);
        setLastIngest(result);
        if (result.status === "error") {
          message.error(`${meta.title} 失败: ${result.message}`);
          return;
        }
      }
      message.success("已按顺序导入示例批次（一 → 二）");
      await load();
    } catch (caught) {
      message.error(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIngesting(false);
    }
  }, [load]);

  const neo4jOk = ping?.neo4j === "reachable" && ping.ok === 1;
  const summaryOk = summary?.status !== "error";

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          系统概览
        </Typography.Title>
        <Button type="primary" onClick={() => void load()} loading={loading}>
          刷新
        </Button>
      </div>

      {error ? (
        <Alert
          type="error"
          message="请求失败"
          description={error}
          showIcon
        />
      ) : null}

      <Spin spinning={loading}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="示例数据"
          description="与 data/samples 下 JSON 一致；「一键导入」按顺序执行批次一、批次二。需 Neo4j 已启动且后端可写库。"
        />

        <Card title="示例数据导入（本地开发）" style={{ marginBottom: 16 }}>
          <Space wrap>
            {SAMPLE_FILES.map((meta) => (
              <Button
                key={meta.key}
                loading={ingesting}
                onClick={() => void ingestFromFile(meta.fileName)}
              >
                {meta.title}
              </Button>
            ))}
            <Button type="primary" loading={ingesting} onClick={() => void ingestFullSample()}>
              一键导入全部示例
            </Button>
          </Space>
          <Divider style={{ margin: "12px 0" }} />
          <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
            {SAMPLE_FILES.map((m) => (
              <span key={m.key} style={{ display: "block" }}>
                · {m.description}
              </span>
            ))}
          </Typography.Paragraph>
          {lastIngest ? (
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="last status">{lastIngest.status}</Descriptions.Item>
              <Descriptions.Item label="nodesImported">
                {lastIngest.nodesImported ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="relationshipsImported">
                {lastIngest.relationshipsImported ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="errors">
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 12 }}>
                  {lastIngest.errors?.length
                    ? lastIngest.errors.join("\n")
                    : "—"}
                </pre>
              </Descriptions.Item>
            </Descriptions>
          ) : null}
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card title="API">
              <Space direction="vertical">
                <div>
                  状态{" "}
                  <Tag color={health?.status === "UP" ? "success" : "default"}>
                    {health?.status ?? "—"}
                  </Tag>
                </div>
                <Typography.Text type="secondary">
                  {health?.service ?? "relath-backend"}
                </Typography.Text>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Neo4j">
              <Space direction="vertical">
                <div>
                  连接{" "}
                  <Tag color={neo4jOk ? "success" : "error"}>
                    {ping?.neo4j ?? "—"}
                  </Tag>
                </div>
                {!neo4jOk && ping?.message ? (
                  <Typography.Text type="danger" ellipsis>
                    {ping.message}
                  </Typography.Text>
                ) : (
                  <Typography.Text type="secondary">
                    Bolt 可达性检测
                  </Typography.Text>
                )}
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="图统计">
              <Space direction="vertical">
                <div>
                  汇总{" "}
                  <Tag color={summaryOk ? "processing" : "error"}>
                    {summary?.status ?? "—"}
                  </Tag>
                </div>
                {summary?.message ? (
                  <Typography.Text type="danger">{summary.message}</Typography.Text>
                ) : null}
              </Space>
            </Card>
          </Col>
        </Row>

        <Card title="节点数量（核心标签）" style={{ marginTop: 16 }}>
          {!summaryOk ? (
            <Alert type="warning" message="无法读取图统计（检查 Neo4j）" />
          ) : (
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} md={4}>
                <Statistic title="Consumer" value={summary?.consumers ?? 0} />
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Statistic title="Merchant" value={summary?.merchants ?? 0} />
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Statistic title="Employee" value={summary?.employees ?? 0} />
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Statistic title="Partner" value={summary?.partners ?? 0} />
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Statistic title="Order" value={summary?.orders ?? 0} />
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Statistic title="Settle" value={summary?.settles ?? 0} />
              </Col>
            </Row>
          )}
        </Card>

        <Card title="原始响应（排障）" style={{ marginTop: 16 }}>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="/health">
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {JSON.stringify(health, null, 2)}
              </pre>
            </Descriptions.Item>
            <Descriptions.Item label="/graph/ping">
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {JSON.stringify(ping, null, 2)}
              </pre>
            </Descriptions.Item>
            <Descriptions.Item label="/graph/summary">
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {JSON.stringify(summary, null, 2)}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Spin>
    </Space>
  );
}
