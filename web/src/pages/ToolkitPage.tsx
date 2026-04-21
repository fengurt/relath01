import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Spin,
  Table,
  Typography,
  message,
} from "antd";
import { useMemo, useState } from "react";
import type { IntroPathRow } from "../api/types";
import {
  fetchIntroducerPaths,
  fetchOrderSnapshot,
} from "../api/publicApi";
import { IntroPathGraphView } from "../components/IntroPathGraphView";

export function ToolkitPage() {
  const [orderLoading, setOrderLoading] = useState(false);
  const [pathLoading, setPathLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<Record<string, unknown> | null>(
    null
  );
  const [paths, setPaths] = useState<IntroPathRow[]>([]);
  const [pathError, setPathError] = useState<string | null>(null);

  const firstPath = useMemo(() => paths[0] ?? null, [paths]);

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
      if (data.status === "error") {
        message.error(String(data.message ?? "查询失败"));
      } else if (data.found === false) {
        message.info("未找到该订单节点");
      } else {
        message.success("已加载订单快照");
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
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        关系工具
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        对接后端公开图接口（开发态）。生产环境将改为鉴权接口与租户隔离。
      </Typography.Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card title="订单快照">
            <Form layout="vertical" onFinish={onOrderLookup}>
              <Form.Item
                name="orderId"
                label="orderId"
                rules={[{ required: true, message: "必填" }]}
              >
                <Input placeholder="图库中 Order.orderId" allowClear />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={orderLoading} block>
                查询
              </Button>
            </Form>
            {orderResult ? (
              <Descriptions bordered size="small" column={1} style={{ marginTop: 16 }}>
                {Object.entries(orderResult).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    {value === null || value === undefined ? "—" : String(value)}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            ) : null}
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card title="介绍人链路（INTRODUCE）">
            <Form layout="vertical" onFinish={onPathLookup}>
              <Form.Item
                name="consumerId"
                label="consumerId"
                rules={[{ required: true, message: "必填" }]}
              >
                <Input placeholder="Consumer.consumerId" allowClear />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="maxDepth" label="maxDepth">
                    <InputNumber min={1} max={20} style={{ width: "100%" }} placeholder="默认 5" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="limit" label="limit">
                    <InputNumber min={1} max={200} style={{ width: "100%" }} placeholder="默认 50" />
                  </Form.Item>
                </Col>
              </Row>
              <Button type="primary" htmlType="submit" loading={pathLoading} block>
                追溯
              </Button>
            </Form>

            {pathError ? (
              <Alert style={{ marginTop: 16 }} type="error" message={pathError} />
            ) : null}

            <Spin spinning={pathLoading}>
              <div style={{ marginTop: 24 }}>
                <Typography.Text strong>G6 预览（第一条链路）</Typography.Text>
                <div style={{ marginTop: 8 }}>
                  <IntroPathGraphView path={firstPath} />
                </div>
              </div>

              <Table
                style={{ marginTop: 24 }}
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
                  { title: "#", dataIndex: "index", width: 48 },
                  { title: "跳数", dataIndex: "hops", width: 72 },
                  { title: "关系类型序列", dataIndex: "types" },
                ]}
              />
            </Spin>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
