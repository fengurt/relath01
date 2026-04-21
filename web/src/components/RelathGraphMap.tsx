import {
  CanvasEvent,
  Graph,
  NodeEvent,
  type GraphData,
  type IElementEvent,
  type NodeData,
} from "@antv/g6";
import { Empty } from "antd";
import { useEffect, useRef } from "react";
import { nodeFillForLabel } from "../graph/relathGraphTheme";

export type RelathGraphSelection = {
  id: string;
  primaryLabel: string;
  labelText: string;
};

export type RelathGraphMapProps = {
  data: GraphData | null;
  layout?: "dagre-lr" | "concentric";
  emptyDescription?: string;
  onSelectionChange?: (selection: RelathGraphSelection | null) => void;
};

function datumPrimaryLabel(node: NodeData): string {
  const data = node.data as { primaryLabel?: string } | undefined;
  return String(data?.primaryLabel ?? "Node");
}

function datumLabelText(node: NodeData): string {
  const data = node.data as { label?: string } | undefined;
  return String(data?.label ?? "").replace(/\\n/g, "\n");
}

export function RelathGraphMap({
  data,
  layout = "dagre-lr",
  emptyDescription = "查询订单或追溯 INTRODUCE 链路后，此处渲染节点图",
  onSelectionChange,
}: RelathGraphMapProps) {
  const containerReference = useRef<HTMLDivElement>(null);
  const graphReference = useRef<Graph | null>(null);
  const selectionCallback = useRef(onSelectionChange);
  selectionCallback.current = onSelectionChange;

  useEffect(() => {
    const element = containerReference.current;
    if (!element || !data?.nodes?.length) {
      graphReference.current?.destroy();
      graphReference.current = null;
      selectionCallback.current?.(null);
      return;
    }

    graphReference.current?.destroy();
    graphReference.current = null;

    const measure = () => {
      const w = Math.max(element.clientWidth, 320);
      const h = Math.max(Math.min(window.innerHeight * 0.58, 720), 420);
      return { width: w, height: h };
    };

    const { width, height } = measure();

    const layoutSpec =
      layout === "concentric"
        ? {
            type: "concentric" as const,
            preventOverlap: true,
            nodeSpacing: 56,
            sortBy: "degree",
          }
        : {
            type: "dagre" as const,
            rankdir: "LR" as const,
            nodesep: 56,
            ranksep: 80,
          };

    const graph = new Graph({
      container: element,
      width,
      height,
      data,
      layout: layoutSpec,
      padding: 56,
      autoFit: {
        type: "view",
        options: { when: "always", direction: "both" },
      },
      zoomRange: [0.35, 2.8],
      behaviors: [
        "drag-canvas",
        "zoom-canvas",
        {
          type: "click-select",
          multiple: false,
          state: "selected",
          degree: 0,
          animation: true,
        },
        { type: "drag-element", enable: "node" },
        { type: "hover-activate", enable: "node", degree: 0 },
      ],
      node: {
        style: {
          size: 72,
          cursor: "pointer",
          fill: (d: unknown) => nodeFillForLabel(datumPrimaryLabel(d as NodeData)),
          stroke: "rgba(212, 175, 55, 0.45)",
          lineWidth: 1.5,
          shadowColor: "rgba(212, 175, 55, 0.28)",
          shadowBlur: 18,
          shadowOffsetX: 0,
          shadowOffsetY: 6,
          labelText: (d: unknown) => datumLabelText(d as NodeData),
          labelFill: "#f2f0e4",
          labelFontSize: 12,
          labelFontFamily: '"Josefin Sans", ui-sans-serif, system-ui',
          labelFontWeight: 600,
          labelWordWrap: true,
          labelMaxWidth: 160,
          labelBackground: true,
          labelBackgroundFill: "rgba(10, 10, 10, 0.82)",
          labelPadding: [6, 8],
          labelBackgroundRadius: 2,
        },
        state: {
          selected: {
            lineWidth: 3,
            stroke: "#d4af37",
            shadowColor: "rgba(212, 175, 55, 0.45)",
            shadowBlur: 28,
          },
          active: {
            lineWidth: 2.5,
            stroke: "rgba(212, 175, 55, 0.85)",
          },
        },
      },
      edge: {
        style: {
          stroke: "rgba(212, 175, 55, 0.38)",
          lineWidth: 1.35,
          endArrow: true,
          endArrowFill: "rgba(212, 175, 55, 0.65)",
          labelText: (d: unknown) =>
            String((d as { data?: { label?: string } }).data?.label ?? ""),
          labelFill: "rgba(242, 240, 228, 0.88)",
          labelFontSize: 10,
          labelFontFamily: '"Roboto Mono", monospace',
          labelBackground: true,
          labelBackgroundFill: "rgba(15, 15, 15, 0.75)",
          labelPadding: [3, 6],
        },
      },
      background: "transparent",
    });

    const onNodeClick = (event: IElementEvent) => {
      const id = event.target?.id;
      if (!id) {
        return;
      }
      const nodeData = graph.getNodeData(id);
      selectionCallback.current?.({
        id,
        primaryLabel: datumPrimaryLabel(nodeData),
        labelText: datumLabelText(nodeData),
      });
    };

    const onCanvasClick = () => selectionCallback.current?.(null);

    graph.on(NodeEvent.CLICK, onNodeClick);
    graph.on(CanvasEvent.CLICK, onCanvasClick);

    graphReference.current = graph;

    void (async () => {
      await graph.render();
      await graph.fitView({ when: "always", direction: "both" });
    })();

    let resizeTick: ReturnType<typeof setTimeout> | undefined;
    const resizeObserver = new ResizeObserver(() => {
      const g = graphReference.current;
      if (!g || !element) {
        return;
      }
      clearTimeout(resizeTick);
      resizeTick = setTimeout(() => {
        const next = measure();
        g.resize(next.width, next.height);
        void g.fitView({ when: "always", direction: "both" });
      }, 80);
    });
    resizeObserver.observe(element);

    return () => {
      clearTimeout(resizeTick);
      resizeObserver.disconnect();
      graph.off(NodeEvent.CLICK, onNodeClick);
      graph.off(CanvasEvent.CLICK, onCanvasClick);
      graph.destroy();
      graphReference.current = null;
      selectionCallback.current?.(null);
    };
  }, [data, layout]);

  return (
    <div className="relath-graph-map-wrap">
      {!data?.nodes?.length ? (
        <Empty className="relath-graph-map-empty" description={emptyDescription} />
      ) : (
        <div ref={containerReference} className="relath-graph-map-canvas" />
      )}
    </div>
  );
}
