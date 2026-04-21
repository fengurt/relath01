import type {
  GraphPingResponse,
  GraphSummaryResponse,
  HealthResponse,
  IntroPathsResponse,
  OrderSnapshotResponse,
} from "./types";

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  return JSON.parse(text) as T;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch("/api/v1/public/health");
  return parseJson<HealthResponse>(response);
}

export async function fetchGraphPing(): Promise<GraphPingResponse> {
  const response = await fetch("/api/v1/public/graph/ping");
  return parseJson<GraphPingResponse>(response);
}

export async function fetchGraphSummary(): Promise<GraphSummaryResponse> {
  const response = await fetch("/api/v1/public/graph/summary");
  return parseJson<GraphSummaryResponse>(response);
}

export async function fetchOrderSnapshot(orderId: string): Promise<OrderSnapshotResponse> {
  const encoded = encodeURIComponent(orderId);
  const response = await fetch(`/api/v1/public/graph/orders/${encoded}`);
  return parseJson<OrderSnapshotResponse>(response);
}

export async function fetchIntroducerPaths(
  consumerId: string,
  maxDepth?: number,
  limit?: number
): Promise<IntroPathsResponse> {
  const params = new URLSearchParams();
  if (maxDepth != null) {
    params.set("maxDepth", String(maxDepth));
  }
  if (limit != null) {
    params.set("limit", String(limit));
  }
  const query = params.toString();
  const encoded = encodeURIComponent(consumerId);
  const url = `/api/v1/public/graph/consumers/${encoded}/introducer-paths${query ? `?${query}` : ""}`;
  const response = await fetch(url);
  return parseJson<IntroPathsResponse>(response);
}
