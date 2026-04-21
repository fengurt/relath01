import { Graph, type GraphData } from "@antv/g6";
import { Empty } from "antd";
import { useEffect, useRef } from "react";
import type { IntroPathRow } from "../api/types";

function pathToGraphData(path: IntroPathRow | null | undefined): GraphData | null {
  if (!path?.nodes?.length) {
    return null;
  }
  const nodes = path.nodes.map((node, index) => {
    const labelPrefix =
      Array.isArray(node.labels) && node.labels.length > 0
        ? String(node.labels[0])
        : "Node";
    const rawId = node.id != null ? String(node.id) : `step-${index}`;
    const id = `${index}:${rawId}`;
    return {
      id,
      data: {
        label: `${labelPrefix}: ${rawId}`,
      },
    };
  });

  const edges: NonNullable<GraphData["edges"]> = [];
  const rels = path.relationshipTypes ?? [];
  for (let index = 0; index < rels.length; index++) {
    const source = nodes[index]?.id;
    const target = nodes[index + 1]?.id;
    if (!source || !target) {
      continue;
    }
    edges.push({
      id: `e-${index}`,
      source,
      target,
      data: { label: rels[index] },
    });
  }

  return { nodes, edges };
}

type Props = {
  path: IntroPathRow | null;
};

export function IntroPathGraphView({ path }: Props) {
  const containerReference = useRef<HTMLDivElement>(null);
  const graphReference = useRef<Graph | null>(null);

  useEffect(() => {
    const graphData = pathToGraphData(path);
    const element = containerReference.current;
    if (!element || !graphData?.nodes?.length) {
      return;
    }

    graphReference.current?.destroy();
    graphReference.current = null;

    const graph = new Graph({
      container: element,
      width: element.clientWidth || 800,
      height: 420,
      data: graphData,
      layout: {
        type: "dagre",
        rankdir: "LR",
        nodesep: 48,
        ranksep: 64,
      },
      behaviors: ["drag-canvas", "zoom-canvas", "drag-element"],
      node: {
        style: {
          size: 56,
          labelText: (datum) =>
            String((datum.data as { label?: string })?.label ?? datum.id ?? ""),
        },
      },
      edge: {
        style: {
          labelText: (datum) =>
            String((datum.data as { label?: string })?.label ?? ""),
        },
      },
    });
    graph.render();
    graphReference.current = graph;

    return () => {
      graph.destroy();
      graphReference.current = null;
    };
  }, [path]);

  if (!path?.nodes?.length) {
    return <Empty description="暂无链路数据" />;
  }

  return (
    <div
      ref={containerReference}
      style={{
        width: "100%",
        minHeight: 420,
        border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
        borderRadius: 8,
        background: "var(--ant-color-bg-container, #fff)",
      }}
    />
  );
}
