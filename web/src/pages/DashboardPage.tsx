import {
  ApiOutlined,
  ClusterOutlined,
  CloudSyncOutlined,
  CodeOutlined,
  DatabaseOutlined,
  DeploymentUnitOutlined,
  PartitionOutlined,
  PieChartOutlined,
  RadarChartOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Collapse,
  Flex,
  Progress,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchGraphPing,
  fetchGraphSummary,
  fetchHealth,
  fetchSampleBatchJson,
  ingestGraphBatch,
  previewGraphBatch,
} from "../api/publicApi";
import type {
  BatchIngestResponse,
  BatchPreviewResponse,
  GraphPingResponse,
  GraphSummaryResponse,
  HealthResponse,
} from "../api/types";
import { SAMPLE_FILES } from "../config/sampleRefs";
import { PageShell } from "../components/PageShell";
import { BatchImportConfirmModal } from "../components/BatchImportConfirmModal";

const { Text, Paragraph } = Typography;

type EntitySlice = {
  key: keyof Pick<
    GraphSummaryResponse,
    "consumers" | "merchants" | "employees" | "partners" | "orders" | "settles"
  >;
  label: string;
  /** DESIGN.md graph node accent */
  accent: string;
};

/** Entity palette — Art Deco metallics + readable contrast on obsidian */
const ENTITY_SLICES: readonly EntitySlice[] = [
  { key: "consumers", label: "消费者", accent: "#7d9f72" },
  { key: "merchants", label: "商户", accent: "#d4af37" },
  { key: "employees", label: "员工", accent: "#e8c170" },
  { key: "partners", label: "合伙人", accent: "#a67caa" },
  { key: "orders", label: "订单", accent: "#f4d03f" },
  { key: "settles", label: "结算", accent: "#c75c5c" },
] as const;

function formatNumber(n: number | undefined): string {
  if (n == null || Number.isNaN(n)) {
    return "—";
  }
  return new Intl.NumberFormat("zh-CN").format(n);
}

function MiniAreaDecor() {
  return (
    <svg className="relath-dash-chart-svg" viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="relathDashChartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,30 Q12,26 22,22 T44,18 T66,12 T88,8 L100,6 L100,36 L0,36 Z"
        fill="url(#relathDashChartFill)"
      />
      <path
        d="M0,30 Q12,26 22,22 T44,18 T66,12 T88,8 L100,6"
        fill="none"
        stroke="#d4af37"
        strokeWidth="0.35"
        opacity={0.75}
      />
    </svg>
  );
}

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [ping, setPing] = useState<GraphPingResponse | null>(null);
  const [summary, setSummary] = useState<GraphSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [lastIngest, setLastIngest] = useState<BatchIngestResponse | null>(null);
  const [ingesting, setIngesting] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<BatchPreviewResponse | null>(null);
  const [pendingPayload, setPendingPayload] = useState<object | null>(null);
  const [pendingTailBatches, setPendingTailBatches] = useState<
    readonly { title: string; fileName: string }[]
  >([]);

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
      setLastSyncedAt(new Date());
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
    async (fileName: string, titleHint: string) => {
      setPreviewLoading(true);
      try {
        const payload = await fetchSampleBatchJson(fileName);
        const pv = await previewGraphBatch(payload);
        setPreviewData(pv);
        setPendingPayload(payload);
        setPendingTailBatches([]);
        setConfirmTitle(`${titleHint} · 写入前确认`);
        setConfirmOpen(true);
      } catch (caught) {
        message.error(caught instanceof Error ? caught.message : String(caught));
      } finally {
        setPreviewLoading(false);
      }
    },
    []
  );

  const confirmIngestPending = useCallback(async () => {
    if (!pendingPayload) {
      return;
    }
    setIngesting(true);
    try {
      const result = await ingestGraphBatch(pendingPayload);
      setLastIngest(result);
      if (result.status === "error") {
        message.error(result.message ?? "导入失败");
        setConfirmOpen(false);
        return;
      }
      if (pendingTailBatches.length === 0) {
        if (result.errors?.length) {
          message.warning(`已导入（部分告警）节点 ${result.nodesImported ?? 0} / 边 ${result.relationshipsImported ?? 0}`);
        } else {
          message.success(
            `导入完成：节点 ${result.nodesImported ?? 0}，关系 ${result.relationshipsImported ?? 0}`
          );
        }
        setConfirmOpen(false);
        setPendingPayload(null);
        await load();
        return;
      }

      for (const meta of pendingTailBatches) {
        const p = await fetchSampleBatchJson(meta.fileName);
        const r = await ingestGraphBatch(p);
        setLastIngest(r);
        if (r.status === "error") {
          message.error(`${meta.title} 失败: ${r.message}`);
          setConfirmOpen(false);
          setPendingPayload(null);
          setPendingTailBatches([]);
          await load();
          return;
        }
      }
      message.success("已按顺序导入示例批次（一 → 二 → 三）");
      setConfirmOpen(false);
      setPendingPayload(null);
      setPendingTailBatches([]);
      await load();
    } catch (caught) {
      message.error(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIngesting(false);
    }
  }, [load, pendingPayload, pendingTailBatches]);

  const ingestFullSample = useCallback(async () => {
    setPreviewLoading(true);
    try {
      const first = SAMPLE_FILES[0];
      const payload = await fetchSampleBatchJson(first.fileName);
      const pv = await previewGraphBatch(payload);
      setPreviewData(pv);
      setPendingPayload(payload);
      setPendingTailBatches(SAMPLE_FILES.slice(1));
      setConfirmTitle("一键导入 · 首批次确认（随后自动导入批次二、三）");
      setConfirmOpen(true);
    } catch (caught) {
      message.error(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const neo4jOk = ping?.neo4j === "reachable" && ping.ok === 1;
  const summaryOk = summary?.status !== "error";

  const graphNodeTotal = useMemo(() => {
    if (!summary || summary.status === "error") {
      return null;
    }
    return ENTITY_SLICES.reduce((acc, s) => acc + (summary[s.key] ?? 0), 0);
  }, [summary]);

  const graphLooksEmpty =
    neo4jOk && summaryOk && graphNodeTotal !== null && graphNodeTotal === 0;

  const apiUp = health?.status === "UP";

  const metaLine = useMemo(() => {
    if (error) {
      return <>FAULT · 后端不可达</>;
    }
    const sync = lastSyncedAt ? ` · SYNC ${lastSyncedAt.toLocaleTimeString("zh-CN", { hour12: false })}` : "";
    return (
      <>
        API {apiUp ? "NOMINAL" : "—"} · BOLT {neo4jOk ? "REACHABLE" : "DOWN"} · SUMMARY{" "}
        {summaryOk ? "LIVE" : "FAULT"}
        {sync}
      </>
    );
  }, [apiUp, error, lastSyncedAt, neo4jOk, summaryOk]);

  const collapseItems = useMemo(
    () => [
      {
        key: "dev",
        label: (
          <Space size={8}>
            <CodeOutlined />
            <span>开发与代理（可选）</span>
          </Space>
        ),
        children: (
          <Paragraph style={{ marginBottom: 0 }} type="secondary">
            与 MCP 工具同源：<Text code>relath_health</Text>、<Text code>relath_graph_summary</Text>；HTTP{" "}
            <Text code>/api/v1/public/*</Text>，本地开发时 Vite 代理至 <Text code>:8080</Text>。
          </Paragraph>
        ),
      },
      {
        key: "raw",
        label: (
          <Space size={8}>
            <ThunderboltOutlined />
            <span>原始响应（MCP 对照）</span>
          </Space>
        ),
        children: (
          <Flex vertical gap="middle">
            <div>
              <Text type="secondary" className="relath-dash-pre-label">
                GET /api/v1/public/health — <Text code>relath_health</Text>
              </Text>
              <pre className="relath-dash-pre">{JSON.stringify(health, null, 2)}</pre>
            </div>
            <div>
              <Text type="secondary" className="relath-dash-pre-label">
                GET /api/v1/public/graph/ping
              </Text>
              <pre className="relath-dash-pre">{JSON.stringify(ping, null, 2)}</pre>
            </div>
            <div>
              <Text type="secondary" className="relath-dash-pre-label">
                GET /api/v1/public/graph/summary — <Text code>relath_graph_summary</Text>
              </Text>
              <pre className="relath-dash-pre">{JSON.stringify(summary, null, 2)}</pre>
            </div>
          </Flex>
        ),
      },
    ],
    [health, ping, summary]
  );

  const entityDistribution = useMemo(() => {
    if (!summary || summary.status === "error" || graphNodeTotal == null || graphNodeTotal <= 0) {
      return ENTITY_SLICES.map((row) => ({
        row,
        val: summary?.[row.key] ?? 0,
        pct: 0,
      }));
    }
    return ENTITY_SLICES.map((row) => {
      const val = summary[row.key] ?? 0;
      return {
        row,
        val,
        pct: (val / graphNodeTotal) * 100,
      };
    });
  }, [summary, graphNodeTotal]);

  return (
    <PageShell
      variant="hero"
      eyebrow="GLOBAL OPERATIONS · INTELLIGENCE CONSOLE"
      title="全域运行面板"
      metaLine={metaLine}
      description={
        <>
          本页展示聚合遥测与标签份额；交互恒星图（G6）与节点点选在「关系工具」。
        </>
      }
      extra={
        <Button
          type="primary"
          className="relath-gradient-primary-btn"
          icon={<ReloadOutlined />}
          onClick={() => void load()}
          loading={loading}
        >
          同步遥测
        </Button>
      }
    >
      <div className="relath-dash-stack relath-dash-stack--vertical">
        {error ? (
          <Alert type="error" message="无法连接后端" description={error} showIcon />
        ) : null}

        {graphLooksEmpty ? (
          <Alert
            type="warning"
            showIcon
            message="图库为空"
            description="Neo4j 尚无节点；导入下方示例批次后统计将更新。"
          />
        ) : null}

        <BatchImportConfirmModal
          open={confirmOpen}
          title={confirmTitle}
          preview={previewData}
          previewLoading={previewLoading}
          submitting={ingesting}
          onCancel={() => {
            setConfirmOpen(false);
            setPendingPayload(null);
            setPendingTailBatches([]);
          }}
          onConfirm={() => void confirmIngestPending()}
        />

        <Spin spinning={loading}>
          <div className="relath-dash-spin-inner">
          {/* KPI strip + graph CTA — flex row so KPI grows if CTA wraps; map lives at /tools */}
          <div className="relath-dash-overview-grid">
            <section className="relath-kpi-strip" aria-label="Runtime KPI">
              <article className="relath-kpi-tile relath-kpi-tile--accent-nodes">
                <div className="relath-kpi-tile__meta">
                  <span className="relath-kpi-tile__label">Total graph nodes</span>
                  <ClusterOutlined className="relath-kpi-tile__icon" style={{ color: "var(--relath-primary)" }} />
                </div>
                <div className="relath-kpi-tile__value">{formatNumber(graphNodeTotal ?? undefined)}</div>
                <div className="relath-kpi-tile__hint">
                  <RadarChartOutlined />
                  <span>{summaryOk ? "Six labels · Neo4j" : "Summary unavailable"}</span>
                </div>
              </article>

              <article className="relath-kpi-tile relath-kpi-tile--accent-api">
                <div className="relath-kpi-tile__meta">
                  <span className="relath-kpi-tile__label">Backend API</span>
                  <ApiOutlined className="relath-kpi-tile__icon" style={{ color: "var(--relath-primary-container)" }} />
                </div>
                <div className="relath-kpi-tile__value">{apiUp ? "UP" : "—"}</div>
                <div className="relath-kpi-tile__hint">
                  <span>{health?.service ?? "relath-backend"}</span>
                </div>
              </article>

              <article className="relath-kpi-tile relath-kpi-tile--accent-bolt">
                <div className="relath-kpi-tile__meta">
                  <span className="relath-kpi-tile__label">Neo4j Bolt</span>
                  <DatabaseOutlined className="relath-kpi-tile__icon" style={{ color: "#1e3d59" }} />
                </div>
                <div className="relath-kpi-tile__value">{neo4jOk ? "OK" : "—"}</div>
                <div className="relath-kpi-tile__hint">
                  <span>{ping?.neo4j ?? "unavailable"}</span>
                </div>
              </article>

              <article className="relath-kpi-tile relath-kpi-tile--accent-summary">
                <div className="relath-kpi-tile__meta">
                  <span className="relath-kpi-tile__label">Graph summary</span>
                  <PieChartOutlined className="relath-kpi-tile__icon" style={{ color: "var(--relath-secondary)" }} />
                </div>
                <div className="relath-kpi-tile__value">{summaryOk ? "OK" : "ERR"}</div>
                <div className="relath-kpi-tile__hint">
                  <span>{summary?.message ? summary.message.slice(0, 42) : "relath_graph_summary"}</span>
                </div>
              </article>
            </section>

            <aside className="relath-dash-map-cta relath-glass" aria-label="Interactive graph workspace">
              <Typography.Title level={5} style={{ margin: 0, color: "var(--relath-ink)" }}>
                节点图工作台
              </Typography.Title>
              <Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 13, lineHeight: 1.55 }}>
                恒星图与 INTRODUCE 链路在关系工具的全屏画布中打开；此处仅保留指标与份额。
              </Paragraph>
              <div className="relath-dash-map-cta-decoration" aria-hidden>
                <span style={{ background: "#d4af37" }} />
                <span style={{ background: "#7d9f72" }} />
                <span style={{ background: "#a67caa" }} />
              </div>
              <Link to="/tools">
                <Button type="primary" block className="relath-gradient-primary-btn" icon={<PartitionOutlined />}>
                  打开关系工具
                </Button>
              </Link>
            </aside>
          </div>

          {/* MCP connectors */}
          <Flex className="relath-dash-mcp-strip" gap={14} wrap="wrap">
            <Card className="relath-dash-mcp-tile" bordered={false}>
              <Flex align="flex-start" gap={12}>
                <div className="relath-dash-mcp-tile__icon" style={{ color: "#d4af37" }}>
                  <ApiOutlined />
                </div>
                <div style={{ minWidth: 0 }}>
                  <Text strong className="relath-dash-mcp-tile__name">
                    relath_health
                  </Text>
                  <div className="relath-dash-mcp-tile__path">GET /api/v1/public/health</div>
                  <Paragraph style={{ marginTop: 12, marginBottom: 0 }} type="secondary">
                    <Text type="secondary">service</Text>{" "}
                    <Text className="relath-mono">{health?.service ?? "—"}</Text>
                  </Paragraph>
                </div>
              </Flex>
            </Card>

            <Card className="relath-dash-mcp-tile" bordered={false}>
              <Flex align="flex-start" gap={12}>
                <div className="relath-dash-mcp-tile__icon" style={{ color: "#1e3d59" }}>
                  <DatabaseOutlined />
                </div>
                <div style={{ minWidth: 0 }}>
                  <Text strong className="relath-dash-mcp-tile__name">
                    graph / ping
                  </Text>
                  <div className="relath-dash-mcp-tile__path">GET /api/v1/public/graph/ping</div>
                  <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
                    <Text type="secondary">bolt</Text>{" "}
                    <Text className="relath-mono">{ping?.neo4j ?? "—"}</Text>
                  </Paragraph>
                  {!neo4jOk && ping?.message ? (
                    <Paragraph type="danger" style={{ marginTop: 8, marginBottom: 0 }} ellipsis>
                      {ping.message}
                    </Paragraph>
                  ) : null}
                </div>
              </Flex>
            </Card>

            <Card className="relath-dash-mcp-tile" bordered={false}>
              <Flex align="flex-start" gap={12}>
                <div className="relath-dash-mcp-tile__icon" style={{ color: "#c9a961" }}>
                  <PieChartOutlined />
                </div>
                <div style={{ minWidth: 0 }}>
                  <Text strong className="relath-dash-mcp-tile__name">
                    relath_graph_summary
                  </Text>
                  <div className="relath-dash-mcp-tile__path">GET /api/v1/public/graph/summary</div>
                  <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
                    <Text type="secondary">nodes Σ</Text>{" "}
                    <Text strong className="relath-mono" style={{ fontSize: 16 }}>
                      {graphNodeTotal != null ? formatNumber(graphNodeTotal) : "—"}
                    </Text>
                  </Paragraph>
                  {summary?.message ? (
                    <Paragraph type="danger" style={{ marginTop: 8, marginBottom: 0 }}>
                      {summary.message}
                    </Paragraph>
                  ) : null}
                </div>
              </Flex>
            </Card>
          </Flex>

          {/* Bento: chart mood + feed (real lines only) */}
          <section className="relath-dash-bento">
            <div className="relath-dash-chart-panel">
              <div className="relath-dash-chart-panel__glow" aria-hidden />
              <Flex justify="space-between" align="flex-start" style={{ position: "relative", zIndex: 1 }} wrap="wrap" gap={12}>
                <div>
                  <Typography.Title level={5} style={{ margin: 0, color: "var(--relath-ink)" }}>
                    标签份额（实时）
                  </Typography.Title>
                  <Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 6, fontSize: 13 }}>
                    各标签计数与占比；曲线为视觉装饰，非时间序列。
                  </Paragraph>
                </div>
                {graphNodeTotal != null && summaryOk ? (
                  <Tag className="relath-dash-total-tag">Σ {formatNumber(graphNodeTotal)}</Tag>
                ) : null}
              </Flex>
              <div style={{ marginTop: 18, position: "relative", zIndex: 1 }}>
                <MiniAreaDecor />
              </div>
              {!summaryOk ? (
                <Alert style={{ marginTop: 16 }} type="warning" showIcon message="无法读取图统计" />
              ) : (
                <div className="relath-dash-entity-grid" style={{ marginTop: 18 }}>
                  {entityDistribution.map(({ row, val, pct }) => (
                    <div key={row.key} className="relath-dash-entity-cell">
                      <div className="relath-dash-entity-cell__head">
                        <span className="relath-dash-entity-cell__dot" style={{ background: row.accent }} />
                        <span className="relath-dash-entity-cell__label">{row.label}</span>
                        {graphNodeTotal != null && graphNodeTotal > 0 ? (
                          <span className="relath-dash-entity-cell__share">
                            {pct < 10 ? pct.toFixed(1) : Math.round(pct)}%
                          </span>
                        ) : null}
                        <span className="relath-dash-entity-cell__value">{formatNumber(val)}</span>
                      </div>
                      <Progress
                        percent={Math.min(100, Math.round(pct * 10) / 10)}
                        showInfo={false}
                        strokeColor={row.accent}
                        trailColor="rgba(212, 175, 55, 0.12)"
                        size="small"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <aside className="relath-dash-feed">
              <div className="relath-dash-feed__head">
                <span className="relath-dash-feed__title">Operations feed</span>
                <span className="relath-pulse-dot" aria-hidden />
              </div>
              <div className="relath-dash-feed-item">
                <div className="relath-dash-feed-item__body">
                  {lastSyncedAt
                    ? `遥测同步完成 · ${lastSyncedAt.toLocaleString("zh-CN", { hour12: false })}`
                    : "尚未完成同步"}
                </div>
                <div className="relath-dash-feed-item__meta">runtime · fetch /api/v1/public/*</div>
              </div>
              {graphNodeTotal != null && !error ? (
                <div className="relath-dash-feed-item">
                  <div className="relath-dash-feed-item__body">
                    图节点合计 <span className="relath-mono">{formatNumber(graphNodeTotal)}</span>
                  </div>
                  <div className="relath-dash-feed-item__meta">relath_graph_summary</div>
                </div>
              ) : null}
              {lastIngest?.status ? (
                <div className={`relath-dash-feed-item ${lastIngest.errors?.length ? "relath-dash-feed-item--warn" : ""}`}>
                  <div className="relath-dash-feed-item__body">
                    最近导入 {lastIngest.status} · 节点{" "}
                    <span className="relath-mono">{formatNumber(lastIngest.nodesImported)}</span> · 关系{" "}
                    <span className="relath-mono">{formatNumber(lastIngest.relationshipsImported)}</span>
                  </div>
                  <div className="relath-dash-feed-item__meta">batch-ingest</div>
                </div>
              ) : null}
            </aside>
          </section>

          {/* Sample import — glass + gradient CTA */}
          <Card
            className="relath-panel relath-dash-import-panel relath-glass"
            variant="borderless"
            styles={{ body: { padding: "22px 24px" } }}
          >
            <Flex justify="space-between" align="flex-start" gap={16} wrap="wrap">
              <div>
                <Flex align="center" gap={8}>
                  <CloudSyncOutlined style={{ color: "var(--relath-ink)", fontSize: 18 }} />
                  <Typography.Title level={5} style={{ margin: 0, color: "var(--relath-ink)" }}>
                    示例批次灌库
                  </Typography.Title>
                </Flex>
                <Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 8, maxWidth: 720 }}>
                  与 <Text code>data/samples</Text> 对齐；预览后写入。需 Neo4j 与后端可写。
                </Paragraph>
              </div>
              <Button
                type="primary"
                size="large"
                className="relath-gradient-primary-btn"
                icon={<DeploymentUnitOutlined />}
                loading={ingesting || previewLoading}
                onClick={() => void ingestFullSample()}
              >
                一键导入（一→二→三）
              </Button>
            </Flex>

            <div className="relath-dash-import-grid" style={{ marginTop: 20 }}>
              {SAMPLE_FILES.map((meta) => (
                <button
                  key={meta.key}
                  type="button"
                  className="relath-dash-import-card"
                  disabled={ingesting || previewLoading}
                  onClick={() => void ingestFromFile(meta.fileName, meta.title)}
                >
                  <span className="relath-dash-import-card__title">{meta.title}</span>
                  <span className="relath-dash-import-card__desc">{meta.description}</span>
                </button>
              ))}
            </div>

            {lastIngest ? (
              <Paragraph style={{ marginTop: 18, marginBottom: 0 }} type="secondary">
                <Text type="secondary">last run</Text>{" "}
                <Tag color={lastIngest.status === "ok" ? "success" : "warning"}>{lastIngest.status}</Tag>
                <span className="relath-mono" style={{ marginLeft: 8 }}>
                  {formatNumber(lastIngest.nodesImported)} / {formatNumber(lastIngest.relationshipsImported)}
                </span>
              </Paragraph>
            ) : null}
            {lastIngest?.errors?.length ? (
              <pre className="relath-dash-pre" style={{ marginTop: 12 }}>
                {lastIngest.errors.join("\n")}
              </pre>
            ) : null}
          </Card>

          <Collapse ghost destroyOnHidden items={collapseItems} />
          </div>
        </Spin>
      </div>
    </PageShell>
  );
}
