import {
  ApartmentOutlined,
  ClusterOutlined,
  PartitionOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Segmented,
  Select,
  Space,
  Spin,
  Table,
  Typography,
  message,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import type { IntroPathRow } from "../api/types";
import { fetchIntroducerPaths, fetchOrderSnapshot } from "../api/publicApi";
import { RelathGraphMap, type RelathGraphSelection } from "../components/RelathGraphMap";
import { PageShell } from "../components/PageShell";
import { introPathRowToGraphData, orderSnapshotToGraphData } from "../graph/graphDataFromApi";
import { SAMPLE_REF } from "../config/sampleRefs";

type ViewMode = "order" | "intro";

export function ToolkitPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("intro");

  const [orderLoading, setOrderLoading] = useState(false);
  const [pathLoading, setPathLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<Record<string, unknown> | null>(null);
  const [paths, setPaths] = useState<IntroPathRow[]>([]);
  const [pathIndex, setPathIndex] = useState(0);
  const [pathError, setPathError] = useState<string | null>(null);
  const [nodeSelection, setNodeSelection] = useState<RelathGraphSelection | null>(null);

  useEffect(() => {
    if (paths.length === 0) {
      setPathIndex(0);
      return;
    }
    if (pathIndex >= paths.length) {
      setPathIndex(0);
    }
  }, [paths, pathIndex]);

  const orderGraphData = useMemo(() => orderSnapshotToGraphData(orderResult), [orderResult]);

  const selectedPath = paths[pathIndex] ?? null;
  const pathGraphData = useMemo(() => introPathRowToGraphData(selectedPath), [selectedPath]);

  const canvasData = viewMode === "order" ? orderGraphData : pathGraphData;
  const canvasLayout: "concentric" | "dagre-lr" = viewMode === "order" ? "concentric" : "dagre-lr";

  useEffect(() => {
    setNodeSelection(null);
  }, [canvasData, viewMode]);

  const emptyHint =
    viewMode === "order"
      ? "在左侧查询订单；命中后此处展示 Order · Merchant · Consumer 恒星图"
      : "在左侧追溯 INTRODUCE 上游；命中后此处展示链路节点图（可拖拽画布、缩放）";

  async function onOrderLookup(values: { orderId: string }) {
    const orderId = values.orderId.trim();
    if (!orderId) {
      message.warning("请输入订单 ID");
      return;
    }
    setOrderLoading(true);
    try {
      const data = await fetchOrderSnapshot(orderId);
      setOrderResult(data as Record<string, unknown>);
      setViewMode("order");
      if (data.status === "error") {
        message.error(String(data.message ?? "查询失败"));
      } else if (data.found === false) {
        message.info("未找到该订单节点");
      } else {
        message.success("已加载订单快照图");
      }
    } catch (caught) {
      message.error(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setOrderLoading(false);
    }
  }

  async function onPathLookup(values: {
    consumerId: string;
    maxDepth?: number | null;
    limit?: number | null;
  }) {
    const consumerId = values.consumerId.trim();
    if (!consumerId) {
      message.warning("请输入消费者 ID");
      return;
    }
    setPathLoading(true);
    setPathError(null);
    try {
      const data = await fetchIntroducerPaths(
        consumerId,
        values.maxDepth ?? undefined,
        values.limit ?? undefined
      );
      if (data.status === "error") {
        setPaths([]);
        setPathError(String(data.message ?? "查询失败"));
        message.error(String(data.message ?? "查询失败"));
        return;
      }
      const nextPaths = data.paths ?? [];
      setPaths(nextPaths);
      setViewMode("intro");
      if (!nextPaths.length) {
        message.info("暂无 INTRODUCE 上游链路");
      } else {
        message.success(`已加载 ${nextPaths.length} 条链路`);
      }
    } catch (caught) {
      setPaths([]);
      setPathError(caught instanceof Error ? caught.message : String(caught));
      message.error(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setPathLoading(false);
    }
  }

  return (
    <PageShell
      variant="hero"
      eyebrow={
        <>
          <PartitionOutlined /> GRAPH WORKSPACE · INTRODUCE / ORDER
        </>
      }
      title="关系工具 · 节点图"
      metaLine={<span>G6 画布在中间/右侧 · 窄屏下图在上、查询在下（或并排）</span>}
      description={
        <>
          <Typography.Text code>/api/v1/public/graph/*</Typography.Text>
          · 示例 ID <Typography.Text code>{SAMPLE_REF.orderId}</Typography.Text> ·{" "}
          <Typography.Text code>{SAMPLE_REF.consumerIdForIntroPath}</Typography.Text>
        </>
      }
    >
      <div className="relath-graph-workspace">
        <aside className="relath-graph-workspace__glass" aria-label="查询面板">
          <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 14, color: "var(--relath-ink)" }}>
            <ApartmentOutlined /> 查询
          </Typography.Title>

          <Space direction="vertical" size={18} style={{ width: "100%" }}>
            <section>
              <Typography.Text type="secondary" style={{ fontSize: 12, letterSpacing: "0.06em" }}>
                <ShopOutlined /> 订单快照 → 恒星图
              </Typography.Text>
              <Form
                layout="vertical"
                style={{ marginTop: 10 }}
                initialValues={{ orderId: SAMPLE_REF.orderId }}
                onFinish={onOrderLookup}
              >
                <Form.Item name="orderId" label={<span className="relath-mono">orderId</span>} rules={[{ required: true }]}>
                  <Input placeholder="Order.orderId" allowClear />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={orderLoading} block className="relath-gradient-primary-btn">
                  查询并切换到订单图
                </Button>
              </Form>
            </section>

            <Divider style={{ margin: "4px 0", borderColor: "rgba(212, 175, 55, 0.2)" }} />

            <section>
              <Typography.Text type="secondary" style={{ fontSize: 12, letterSpacing: "0.06em" }}>
                <UserOutlined /> INTRODUCE 上游 → 链路图
              </Typography.Text>
              <Form
                layout="vertical"
                style={{ marginTop: 10 }}
                initialValues={{
                  consumerId: SAMPLE_REF.consumerIdForIntroPath,
                  maxDepth: 5,
                  limit: 50,
                }}
                onFinish={onPathLookup}
              >
                <Form.Item name="consumerId" label={<span className="relath-mono">consumerId</span>} rules={[{ required: true }]}>
                  <Input placeholder="Consumer.consumerId" allowClear />
                </Form.Item>
                <Flex gap={12}>
                  <Form.Item name="maxDepth" label="maxDepth" style={{ flex: 1 }}>
                    <InputNumber min={1} max={20} style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item name="limit" label="limit" style={{ flex: 1 }}>
                    <InputNumber min={1} max={200} style={{ width: "100%" }} />
                  </Form.Item>
                </Flex>
                <Button type="primary" htmlType="submit" loading={pathLoading} block className="relath-gradient-primary-btn">
                  追溯并切换到链路图
                </Button>
              </Form>
            </section>
          </Space>

          {orderResult && orderResult.status !== "error" && orderResult.found !== false ? (
            <div style={{ marginTop: 18 }}>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                上次订单字段（只读）
              </Typography.Text>
              <pre className="relath-dash-pre" style={{ marginTop: 8, fontSize: 10 }}>
                {JSON.stringify(
                  {
                    orderId: orderResult.orderId,
                    merchantId: orderResult.merchantId,
                    consumerId: orderResult.consumerId,
                    distributableAmount: orderResult.distributableAmount,
                    payStatus: orderResult.payStatus,
                    profitShareStatus: orderResult.profitShareStatus,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          ) : null}
        </aside>

        <div className="relath-graph-workspace__stage">
          <div className="relath-graph-workspace__ambient" aria-hidden />
          <div className="relath-graph-workspace__stage-inner">
            <Flex wrap="wrap" gap={12} align="center" justify="space-between">
              <Segmented<ViewMode>
                value={viewMode}
                onChange={(v) => setViewMode(v)}
                options={[
                  {
                    label: (
                      <span>
                        <ShopOutlined /> 订单恒星图
                      </span>
                    ),
                    value: "order",
                  },
                  {
                    label: (
                      <span>
                        <ClusterOutlined /> INTRODUCE 链路
                      </span>
                    ),
                    value: "intro",
                  },
                ]}
              />
              {viewMode === "intro" && paths.length > 1 ? (
                <Select
                  size="small"
                  value={pathIndex}
                  onChange={setPathIndex}
                  style={{ minWidth: 200 }}
                  options={paths.map((_, index) => ({
                    label: `链路 ${index + 1} / ${paths.length}`,
                    value: index,
                  }))}
                />
              ) : null}
            </Flex>

            {pathError ? <Alert type="error" message={pathError} showIcon /> : null}

            {nodeSelection ? (
              <Card size="small" variant="borderless" className="relath-graph-inspector">
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                  当前选中（点击画布空白取消）
                </Typography.Text>
                <div className="relath-mono" style={{ marginTop: 6, fontSize: 13, color: "var(--relath-ink)" }}>
                  {nodeSelection.primaryLabel} · {nodeSelection.labelText.replace(/\n/g, " · ")}
                </div>
              </Card>
            ) : null}

            <Spin spinning={pathLoading || orderLoading}>
              <RelathGraphMap
                data={canvasData}
                layout={canvasLayout}
                emptyDescription={emptyHint}
                onSelectionChange={setNodeSelection}
              />
            </Spin>

            {viewMode === "intro" && paths.length > 0 ? (
              <Table
                size="small"
                pagination={false}
                rowKey={(_, index) => String(index)}
                dataSource={paths.map((pathItem, index) => ({
                  key: index,
                  index,
                  hops: pathItem.relationshipTypes?.length ?? 0,
                  types: pathItem.relationshipTypes?.join(" → ") ?? "—",
                }))}
                columns={[
                  { title: "#", dataIndex: "index", width: 44 },
                  { title: "跳数", dataIndex: "hops", width: 64 },
                  { title: "关系类型序列", dataIndex: "types" },
                ]}
              />
            ) : null}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
